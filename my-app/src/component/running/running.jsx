import "./running.css";
import React, { useEffect, useMemo, useState } from "react";
import Links from "../nav/nav";

// Synced daily on Vercel (garmin/api/runs.py) when REACT_APP_RUNS_URL is set;
// otherwise the file garmin/sync_runs.py writes locally.
const RUNS_URL = process.env.REACT_APP_RUNS_URL || `${process.env.PUBLIC_URL}/data/runs.json`;
const METERS_PER_MILE = 1609.344;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let miles = (meters) => (meters || 0) / METERS_PER_MILE;

let formatTime = (seconds) => {
  if (seconds == null) return "-";
  let total = Math.round(seconds);
  let h = Math.floor(total / 3600);
  let m = Math.floor((total % 3600) / 60);
  let s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

let formatPace = (seconds, meters) => {
  if (!seconds || !meters) return "-";
  return `${formatTime(seconds / miles(meters))}/mi`;
}

let formatDate = (local) => {
  if (!local) return "-";
  let [y, m, d] = local.slice(0, 10).split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

// Last 12 calendar months, oldest first, including months with no runs
let monthlyMiles = (runs) => {
  let now = new Date();
  let buckets = [];
  for (let i = 11; i >= 0; i--) {
    let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: MONTHS[d.getMonth()], year: d.getFullYear(), miles: 0, runs: 0 });
  }
  let byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));
  runs.forEach((run) => {
    let bucket = byKey[(run.startTimeLocal || "").slice(0, 7)];
    if (bucket) {
      bucket.miles += miles(run.distanceMeters);
      bucket.runs += 1;
    }
  });
  return buckets;
}

let MileageChart = ({ data }) => {
  let [hovered, setHovered] = useState(null);
  let max = Math.max(...data.map((d) => d.miles), 1);
  // Round the axis top up to a tidy number
  let step = max > 100 ? 50 : max > 40 ? 20 : 10;
  let top = Math.ceil(max / step) * step;

  let width = 600, height = 220, padLeft = 36, padBottom = 24, padTop = 8;
  let plotW = width - padLeft, plotH = height - padBottom - padTop;
  let slot = plotW / data.length;
  let barW = Math.min(28, slot - 6);
  let y = (v) => padTop + plotH - (v / top) * plotH;

  return (
    <div className="runChart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Miles run per month, last 12 months">
        {[0, top / 2, top].map((tick) => (
          <g key={tick}>
            <line x1={padLeft} x2={width} y1={y(tick)} y2={y(tick)} className="runGrid" />
            <text x={padLeft - 6} y={y(tick) + 3} className="runAxis" textAnchor="end">{tick}</text>
          </g>
        ))}
        {data.map((d, i) => {
          let x = padLeft + i * slot + (slot - barW) / 2;
          let h = Math.max(plotH - (y(d.miles) - padTop), d.miles > 0 ? 2 : 0);
          let r = Math.min(4, h / 2, barW / 2);
          let base = padTop + plotH;
          return (
            <g key={d.key} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              {/* full-height hit target, bigger than the bar */}
              <rect x={padLeft + i * slot} y={padTop} width={slot} height={plotH} fill="transparent" />
              {h > 0 && (
                <path
                  className={`runBar ${hovered === i ? "runBarActive" : ""}`}
                  d={`M${x},${base} V${base - h + r} Q${x},${base - h} ${x + r},${base - h} H${x + barW - r} Q${x + barW},${base - h} ${x + barW},${base - h + r} V${base} Z`}
                />
              )}
              <text x={x + barW / 2} y={height - 6} className="runAxis" textAnchor="middle">{d.label}</text>
            </g>
          );
        })}
      </svg>
      {hovered != null && (
        <div className="runTooltip" style={{ left: `${((padLeft + (hovered + 0.5) * slot) / width) * 100}%` }}>
          <div>{data[hovered].label} {data[hovered].year}</div>
          <div><span>{data[hovered].miles.toFixed(1)}</span> mi · {data[hovered].runs} runs</div>
        </div>
      )}
    </div>
  );
}

// Top 10 leaderboards. `value` returns null for runs missing that metric so
// they're left out rather than ranked as zero.
const MIN_PACE_METERS = METERS_PER_MILE; // ignore sub-mile runs for pace
const TOP_CATEGORIES = [
  { key: "fastest", label: "Fastest Pace", column: "Pace", order: "asc",
    value: (r) => r.distanceMeters >= MIN_PACE_METERS && r.durationSeconds ? r.durationSeconds / miles(r.distanceMeters) : null,
    format: (v) => `${formatTime(v)}/mi` },
  { key: "longest", label: "Longest Distance", column: "Miles", order: "desc",
    value: (r) => r.distanceMeters || null,
    format: (v) => miles(v).toFixed(2) },
  { key: "duration", label: "Longest Time", column: "Time", order: "desc",
    value: (r) => r.durationSeconds || null,
    format: formatTime },
  { key: "avgHR", label: "Highest Avg HR", column: "Avg HR", order: "desc",
    value: (r) => r.averageHR || null,
    format: (v) => `${Math.round(v)} bpm` },
  { key: "maxHR", label: "Highest Max HR", column: "Max HR", order: "desc",
    value: (r) => r.maxHR || null,
    format: (v) => `${Math.round(v)} bpm` },
  { key: "elevation", label: "Most Elevation", column: "Elev Gain", order: "desc",
    value: (r) => r.elevationGainMeters || null,
    format: (v) => `${Math.round(v * 3.28084).toLocaleString()} ft` },
  { key: "cadence", label: "Highest Cadence", column: "Cadence", order: "desc",
    value: (r) => r.cadence || null,
    format: (v) => `${Math.round(v)} spm` },
  { key: "calories", label: "Most Calories", column: "Calories", order: "desc",
    value: (r) => r.calories || null,
    format: (v) => Math.round(v).toLocaleString() },
];

let topRuns = (runs, category) =>
  runs
    .map((run) => ({ run, value: category.value(run) }))
    .filter((entry) => entry.value != null)
    .sort((a, b) => category.order === "asc" ? a.value - b.value : b.value - a.value)
    .slice(0, 10);

let TopRuns = ({ runs }) => {
  let [categoryKey, setCategoryKey] = useState("fastest");
  let category = TOP_CATEGORIES.find((c) => c.key === categoryKey);
  let entries = useMemo(() => topRuns(runs, category), [runs, category]);

  return (
    <div className="runPanel">
      <div className="runPanelHeader">
        <h3 className="runPanelTitle">Top 10</h3>
        <select
          className="runSelect"
          value={categoryKey}
          onChange={(event) => setCategoryKey(event.target.value)}
          aria-label="Top 10 category"
        >
          {TOP_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>
      {entries.length === 0 ? (
        <p className="runText">No runs with {category.column.toLowerCase()} data in this range.</p>
      ) : (
        <div className="runTableWrap">
          <table className="runTable">
            <thead>
              <tr><th>#</th><th>{category.column}</th><th>Date</th><th>Run</th>{category.key !== "longest" && <th>Miles</th>}{category.key !== "fastest" && <th>Pace</th>}</tr>
            </thead>
            <tbody>
              {entries.map(({ run, value }, i) => (
                <tr key={run.id}>
                  <td className="runRank">{i + 1}</td>
                  <td className="runHighlight">{category.format(value)}</td>
                  <td>{formatDate(run.startTimeLocal)}</td>
                  <td>{run.name}</td>
                  {category.key !== "longest" && <td>{miles(run.distanceMeters).toFixed(2)}</td>}
                  {category.key !== "fastest" && <td>{formatPace(run.durationSeconds, run.distanceMeters)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

let Running = () => {
  let [data, setData] = useState(null);
  let [error, setError] = useState(false);
  let [range, setRange] = useState("year");

  useEffect(() => {
    // Revalidate so a fresh sync shows up right after redeploying
    fetch(RUNS_URL, { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  let runs = useMemo(() => {
    if (!data) return [];
    if (range === "all") return data.runs;
    let cutoff = range === "year" ? `${new Date().getFullYear()}-01-01` : new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    return data.runs.filter((run) => (run.startTimeLocal || "") >= cutoff);
  }, [data, range]);

  let totals = useMemo(() => {
    let distance = runs.reduce((sum, r) => sum + (r.distanceMeters || 0), 0);
    let time = runs.reduce((sum, r) => sum + (r.durationSeconds || 0), 0);
    let longest = runs.reduce((best, r) => (r.distanceMeters || 0) > (best?.distanceMeters || 0) ? r : best, null);
    return { distance, time, longest };
  }, [runs]);

  let monthly = useMemo(() => monthlyMiles(data?.runs || []), [data]);

  return (
    <div id="runningSection">
      <Links />
      <h2 className="runTitle">Running</h2>

      {error && <p className="runText runEmpty">No runs synced yet.</p>}
      {!data && !error && <p className="runText runEmpty">Loading...</p>}

      {data && (
        <div className="container runContainer">
          <div className="runFilters" role="group" aria-label="Time range">
            {[["month", "30 Days"], ["year", "This Year"], ["all", "All"]].map(([key, label]) => (
              <button key={key} type="button" className={`runFilter ${range === key ? "runFilterActive" : ""}`} onClick={() => setRange(key)}>
                {label}
              </button>
            ))}
          </div>

          <div className="row runTiles">
            {[
              ["Runs", runs.length],
              ["Miles", miles(totals.distance).toFixed(1)],
              ["Time", formatTime(totals.time)],
              ["Avg Pace", formatPace(totals.time, totals.distance)],
              ["Longest", totals.longest ? `${miles(totals.longest.distanceMeters).toFixed(1)} mi` : "-"],
            ].map(([label, value]) => (
              <div className="col runTileCol" key={label}>
                <div className="runTile">
                  <p className="runTileLabel">{label}</p>
                  <p className="runTileValue">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="runPanel">
            <h3 className="runPanelTitle">Monthly Miles</h3>
            <MileageChart data={monthly} />
          </div>

          <div className="row ">
            {data.personalRecords?.length > 0 && (
              <div className="col-md-6 col-sm-12">
                <div className="runPanel">
                  <h3 className="runPanelTitle">Personal Records</h3>
                  {data.personalRecords.map((pr) => (
                    <p className="runText runRow" key={pr.typeId}>
                      {pr.label} <span>{pr.unit === "meters" ? `${miles(pr.value).toFixed(1)} mi` : formatTime(pr.value)}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
            {data.racePredictions?.length > 0 && (
              <div className="col-md-6 col-sm-12">
                <div className="runPanel">
                  <h3 className="runPanelTitle">Race Predictions</h3>
                  {data.racePredictions.map((p) => (
                    <p className="runText runRow" key={p.label}>
                      {p.label} <span>{formatTime(p.seconds)}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <TopRuns runs={runs} />

          <div className="runPanel">
            <h3 className="runPanelTitle">Recent Runs</h3>
            <div className="runTableWrap">
              <table className="runTable">
                <thead>
                  <tr><th>Date</th><th>Run</th><th>Miles</th><th>Time</th><th>Pace</th><th>Avg HR</th></tr>
                </thead>
                <tbody>
                  {runs.slice(0, 10).map((run) => (
                    <tr key={run.id}>
                      <td>{formatDate(run.startTimeLocal)}</td>
                      <td>{run.name}</td>
                      <td>{miles(run.distanceMeters).toFixed(2)}</td>
                      <td>{formatTime(run.durationSeconds)}</td>
                      <td>{formatPace(run.durationSeconds, run.distanceMeters)}</td>
                      <td>{run.averageHR ? Math.round(run.averageHR) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="runText runFooter">
            Synced {new Date(data.updatedAt).toLocaleDateString()} · Powered by <a href="https://github.com/cyberjunky/python-garminconnect" className="runLink">python-garminconnect</a>
          </p>
        </div>
      )}
    </div>
  );
}

export default Running;
