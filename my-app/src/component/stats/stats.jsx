import {React, useEffect} from "react";
import { Octokit } from "https://esm.sh/octokit?dts";
import "./stats.css";

let Stats = () => {

  const octokit = new Octokit({auth: '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'});

  let getRequest = async () => {

    let repos = await octokit.request('GET /users/bttodd11/repos', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    console.log(repos)
  }

  useEffect(() => {
    getRequest()
  },[])
  


  return (
    <div id="statSection">
      <h2 className="statTitle">Stats</h2>
      <div class="container-fluid">
        <div className="row">
          <div className="col-12">
            {/* Get the total number of repos, then go into the commits  */}

          </div>
        </div>
      </div>
    </div>
  )

}

export default Stats;
