import { React, useEffect, useState } from "react";
import { Octokit } from "https://esm.sh/octokit?dts";
import "./stats.css";


let Stats = () => {

  let [repos, setRepos] = useState(0)
  let [language, setLanguage] = useState('')
  let [githubLink, setGithubLink ] = useState('')
  let [numberOfCommits, setNumberOfCommits ] = useState(0)
  let languageMap = {};

  let octoId = process.env.REACT_APP_USER_PASSWORD;

  const octokit = new Octokit({ auth: octoId });

  let getRepo = async () => {

    let repos = await octokit.request('GET /users/bttodd11/repos?per_page=100', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    let user = await octokit.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    let lastYearCommits = await octokit.request('GET /repos/bttodd11/90Portfolio/stats/contributors', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    // Finding the most commonly used languages 
    for(let index = 0; index < repos.data.length; index++){

      let currentLanguage = repos.data[index].language;

      if(languageMap[currentLanguage]){
        languageMap[currentLanguage] += 1
      }  else {
        languageMap[currentLanguage] = 1
      }
    }

    // Setting Last Year Commits 
    setNumberOfCommits(lastYearCommits.data[0].total)

    // Setting Github URL
    setGithubLink(user.data.html_url)

    // Find the lannguage of each repo and create a hashMap
   let highValue = Object.values(languageMap).sort(function(a,b){return b - a});
   setLanguage(Object.keys(languageMap).filter(function(key) {return languageMap[key] === highValue[0]})[0]);
   setRepos(repos.data.length)
  }

  useEffect(() => {
    getRepo()
  }, [])


  return (
    <div id="statSection">
      <h2 className="statTitle">Github Stats</h2>
      <div className="container-fluid statBackground">
        <div className="row statBox">
            <div className="col-md-6 col-sm-12">
            <p className="statText">Repos: <span>{repos}</span></p>
            <p className="statText">Favorite Language: <span>{language}</span></p>
            </div>
            <div className="col-md-6 col-sm-12 ">
            <a href={githubLink}><p className="statText">Github Link</p></a>
            <p className="statText">Commits for this Portfolio : {numberOfCommits}</p>
            </div>
          </div>
      </div>
      </div>
  )
}

export default Stats;
