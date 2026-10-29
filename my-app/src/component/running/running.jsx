import "./running.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Links from "../nav/nav";

// Tried in order. In production the daily Vercel sync (my-app/api/runs.py)
// comes first; the file garmin/sync_runs.py writes is the fallback, so the page
// still works if the sync isn't set up yet or the API is down.
const RUNS_URLS = [
  process.env.REACT_APP_RUNS_URL || (process.env.NODE_ENV === "production" ? "/api/runs" : null),
  `${process.env.PUBLIC_URL}/data/runs.json`,
].filter(Boolean);

let fetchRuns = async () => {
  for (let url of RUNS_URLS) {
    try {
      // Revalidate so fresh data shows up without a hard refresh
      let res = await fetch(url, { cache: "no-cache" });
      // res.json() also rejects the HTML page served for unknown paths
      if (res.ok) return await res.json();
    } catch (err) {
      // fall through to the next source
    }
  }
  throw new Error("No runs data available");
}
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

// "2026-10-25 08:53:48" -> "8:53 AM" (Garmin's local start time, no timezone math)
let formatTimeOfDay = (local) => {
  let match = /[ T](\d{2}):(\d{2})/.exec(local || "");
  if (!match) return null;
  let h = Number(match[1]);
  return `${h % 12 || 12}:${match[2]} ${h < 12 ? "AM" : "PM"}`;
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

let topRuns = (runs, category, limit = 10) =>
  runs
    .map((run) => ({ run, value: category.value(run) }))
    .filter((entry) => entry.value != null)
    .sort((a, b) => category.order === "asc" ? a.value - b.value : b.value - a.value)
    .slice(0, limit);

// For each Top 10 category, a Map of run id -> all-time rank (1-based)
let rankRuns = (runs) =>
  TOP_CATEGORIES.map((category) => ({
    category,
    rankById: new Map(topRuns(runs, category, Infinity).map(({ run }, i) => [run.id, i + 1])),
  }));

let RunDetail = ({ list, index, ranks, records, onClose, onNavigate }) => {
  let run = list[index];
  let closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    let previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    let onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
      if (event.key === "ArrowRight" && index < list.length - 1) onNavigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, list.length, onClose, onNavigate]);

  let movingPace = run.movingSeconds && run.movingSeconds < run.durationSeconds
    ? formatPace(run.movingSeconds, run.distanceMeters) : null;
  let stats = [
    ["Distance", `${miles(run.distanceMeters).toFixed(2)} mi`],
    ["Time", formatTime(run.durationSeconds)],
    ["Avg Pace", formatPace(run.durationSeconds, run.distanceMeters)],
    ["Moving Time", run.movingSeconds && run.movingSeconds < run.durationSeconds ? formatTime(run.movingSeconds) : null],
    ["Moving Pace", movingPace],
    ["Elevation Gain", run.elevationGainMeters ? `${Math.round(run.elevationGainMeters * 3.28084).toLocaleString()} ft` : null],
    ["Avg HR", run.averageHR ? `${Math.round(run.averageHR)} bpm` : null],
    ["Max HR", run.maxHR ? `${Math.round(run.maxHR)} bpm` : null],
    ["Cadence", run.cadence ? `${Math.round(run.cadence)} spm` : null],
    ["Calories", run.calories ? Math.round(run.calories).toLocaleString() : null],
    ["VO2 Max", run.vo2Max ? Math.round(run.vo2Max) : null],
  ].filter(([, value]) => value != null && value !== "-");

  let prs = (records || []).filter((pr) => pr.activityId === run.id);
  let topFinishes = ranks
    .map(({ category, rankById }) => ({ category, rank: rankById.get(run.id) }))
    .filter(({ rank }) => rank && rank <= 10)
    .sort((a, b) => a.rank - b.rank);
  let timeOfDay = formatTimeOfDay(run.startTimeLocal);

  return (
    <div className="runModalOverlay" onClick={onClose}>
      <div
        className="runModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="runModalTitle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="runModalHeader">
          <div>
            <h4 className="runModalTitle" id="runModalTitle">{run.name || "Run"}</h4>
            <p className="runModalDate">{formatDate(run.startTimeLocal)}{timeOfDay ? ` · ${timeOfDay}` : ""}</p>
          </div>
          <button type="button" className="runModalClose" onClick={onClose} ref={closeRef} aria-label="Close">×</button>
        </div>

        {(prs.length > 0 || topFinishes.length > 0) && (
          <div className="runBadges">
            {prs.map((pr) => <span className="runBadge runBadgePR" key={pr.typeId}>PR · {pr.label}</span>)}
            {topFinishes.map(({ category, rank }) => (
              <span className="runBadge" key={category.key}>#{rank} {category.label}</span>
            ))}
          </div>
        )}

        <div className="runStatGrid">
          {stats.map(([label, value]) => (
            <div className="runStat" key={label}>
              <p className="runStatLabel">{label}</p>
              <p className="runStatValue">{value}</p>
            </div>
          ))}
        </div>

        {list.length > 1 && (
          <div className="runModalNav">
            <button type="button" className="runFilter" onClick={() => onNavigate(index - 1)} disabled={index === 0} aria-label="Previous run">‹ Prev</button>
            <span className="runModalCount">{index + 1} / {list.length}</span>
            <button type="button" className="runFilter" onClick={() => onNavigate(index + 1)} disabled={index === list.length - 1} aria-label="Next run">Next ›</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Table row that opens the run's details on click, Enter or Space
let RunRow = ({ run, onSelect, children }) => (
  <tr
    className="runRowClickable"
    tabIndex={0}
    aria-label={`View details for ${run.name || "run"} on ${formatDate(run.startTimeLocal)}`}
    onClick={onSelect}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    }}
  >
    {children}
  </tr>
);

let TopRuns = ({ runs, onSelect }) => {
  let [categoryKey, setCategoryKey] = useState("fastest");
  let category = TOP_CATEGORIES.find((c) => c.key === categoryKey);
  let entries = useMemo(() => topRuns(runs, category), [runs, category]);

  return (
    <div className="runPanel">
      <div className="runPanelHeader">
        <h3 className="runPanelTitle">Top 10 · All Time</h3>
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
        <p className="runText">No runs with {category.column.toLowerCase()} data yet.</p>
      ) : (
        <div className="runTableWrap">
          <table className="runTable">
            <thead>
              <tr><th>#</th><th>{category.column}</th><th>Date</th><th>Run</th>{category.key !== "longest" && <th>Miles</th>}{category.key !== "fastest" && <th>Pace</th>}</tr>
            </thead>
            <tbody>
              {entries.map(({ run, value }, i) => (
                <RunRow key={run.id} run={run} onSelect={() => onSelect(entries.map((e) => e.run), i)}>
                  <td className="runRank">{i + 1}</td>
                  <td className="runHighlight">{category.format(value)}</td>
                  <td>{formatDate(run.startTimeLocal)}</td>
                  <td>{run.name}</td>
                  {category.key !== "longest" && <td>{miles(run.distanceMeters).toFixed(2)}</td>}
                  {category.key !== "fastest" && <td>{formatPace(run.durationSeconds, run.distanceMeters)}</td>}
                </RunRow>
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
  // The list a run was opened from, so Prev/Next walk that same list
  let [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchRuns()
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
  let ranks = useMemo(() => rankRuns(data?.runs || []), [data]);
  let recentRuns = runs.slice(0, 10);

  let openRun = (list, index) => setSelected({ list, index, opener: document.activeElement });
  let closeRun = () => {
    selected?.opener?.focus?.();
    setSelected(null);
  };

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

          {/* All-time leaderboard: ignores the range filter on purpose */}
          <TopRuns runs={data.runs} onSelect={openRun} />

          <div className="runPanel">
            <h3 className="runPanelTitle">Recent Runs</h3>
            <div className="runTableWrap">
              <table className="runTable">
                <thead>
                  <tr><th>Date</th><th>Run</th><th>Miles</th><th>Time</th><th>Pace</th><th>Avg HR</th></tr>
                </thead>
                <tbody>
                  {recentRuns.map((run, i) => (
                    <RunRow key={run.id} run={run} onSelect={() => openRun(recentRuns, i)}>
                      <td>{formatDate(run.startTimeLocal)}</td>
                      <td>{run.name}</td>
                      <td>{miles(run.distanceMeters).toFixed(2)}</td>
                      <td>{formatTime(run.durationSeconds)}</td>
                      <td>{formatPace(run.durationSeconds, run.distanceMeters)}</td>
                      <td>{run.averageHR ? Math.round(run.averageHR) : "-"}</td>
                    </RunRow>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selected && (
            <RunDetail
              list={selected.list}
              index={selected.index}
              ranks={ranks}
              records={data.personalRecords}
              onClose={closeRun}
              onNavigate={(index) => setSelected((current) => ({ ...current, index }))}
            />
          )}

          <p className="runText runFooter">
            Synced {new Date(data.updatedAt).toLocaleDateString()} · Powered by <a href="https://github.com/cyberjunky/python-garminconnect" className="runLink">python-garminconnect</a>
          </p>
        </div>
      )}
    </div>
  );
}

export default Running;
