import { React, useEffect, useState } from "react";
import { Octokit } from "https://esm.sh/octokit?dts";
import {Col, Row} from 'react-bootstrap';
import "./stats.css";


let Stats = () => {

  let [repos, setRepos] = useState(0)

  let octoId = process.env.REACT_APP_USER_PASSWORD;

  const octokit = new Octokit({ auth: octoId });

  let getRepo = async () => {

    let repos = await octokit.request('GET /users/bttodd11/repos?per_page=100', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    console.log(repos)
    setRepos(repos.data.length)
  }

  let getCommits = async () => {

    let commits = await octokit.request('GET /repos/bttodd11/90Portfolio/commits', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    console.log(commits)
  }

  useEffect(() => {
    getRepo()
    getCommits()
  }, [])


  return (
    <div id="statSection">
      <h2 className="statTitle">Stats</h2>
      <div className="container-fluid statBackground">
        <Row>
          <Col className="col-sm-4 col-md-4 col-lg-4">
            <p className="statText">Number of Repos : <span>{repos}</span></p>
            <p className="statText">Number of Repos :</p>
          </Col>
          <Col className="col-sm-4 col-md-6 col-lg-4">
            <p className="statText">Number of Repos :</p>
            <p className="statText">Number of Repos :</p>
          </Col>
          <Col className="col-sm-4 col-md-6 col-lg-4">
            <p className="statText">Number of Repos :</p>
            <p className="statText">Number of Repos :</p>
          </Col>
       </Row>
  
      </div>
    </div>
  )

}

export default Stats;
