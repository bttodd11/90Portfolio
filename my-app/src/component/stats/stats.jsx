import { React, useEffect, useState } from "react";
import Octokit from "@octokit/rest";
import axios from "axios";
import "./stats.css";


let Stats = () => {

  let [repos, setRepos] = useState(0)
  let [language, setLanguage] = useState("JavaScript")
  let [githubLink, setGithubLink] = useState('https://github.com/bttodd11')
  let [numberOfCommits, setNumberOfCommits] = useState(0)
  let languageMap = {};

  let getRepo = () => {

    const repo = {
      method: 'GET',
      url: "https://octoapi-bttodd11.vercel.app/api/v1/repo",
      headers: {
        "Access-Control-Allow-Origin": "https://octoapi-bttodd11.vercel.app/"
      }
    }
    axios.request(repo).then(function (response) {
      setRepos(response.data)
    }).catch(function (error) {
      console.error(error);
    })
  


    const user = {
      method: 'GET',
      url: "https://octoapi-bttodd11.vercel.app/api/v1/user",
      headers: {
        "Access-Control-Allow-Origin": "https://octoapi-bttodd11.vercel.app/"
      }
    }
    axios.request(user).then(function (response) {
        setGithubLink(response.data)
      }).catch(function (error) {
        console.error(error);
      })

    const lastYearCommits = {
      method: 'GET',
      url: "https://octoapi-bttodd11.vercel.app/api/v1/lastYearCommits",
      headers: {
        "Access-Control-Allow-Origin": "https://octoapi-bttodd11.vercel.app/"
      }
    }
    axios.request(lastYearCommits).then(function (response) {
        setNumberOfCommits(response.data)
      })
      .catch(function (error) {
        console.error(error);
      })
    }

  useEffect(() => {
    getRepo()
  })



  return (
    <div id="statSection">
      <h2 className="statTitle">Github Stats</h2>
      <div className="container-fluid statBackground">
        <div className="row statBox">
          <div className="col-md-6 col-sm-12">
            <p className="statText">Repos: <span>{repos}</span></p>
            <p className="statText">Favorite Language: <span>{language}</span></p>
          </div>
          <div className="col-md-6 col-sm-12">
            <a href={githubLink}><p className="statText">Github Link</p></a>
            <p className="statText">Commits for this Portfolio : {numberOfCommits}</p>
          </div>
          <p className="statText">Powered by <a href="https://github.com/octokit" className="octoKitLink"><span>Octokit</span></a></p>
        </div>
      </div>
    </div>
  )
}


export default Stats;
