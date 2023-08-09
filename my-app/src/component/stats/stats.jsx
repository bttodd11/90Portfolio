import { React, useEffect, useState } from "react";
import Octokit from "@octokit/rest";
import axios from "axios";
import "./stats.css";


let Stats = () => {

  let [repos, setRepos] = useState(0)
  let [language, setLanguage] = useState('')
  let [githubLink, setGithubLink] = useState('')
  let [numberOfCommits, setNumberOfCommits] = useState(0)
  let languageMap = {};

  let getRepo = () => {

    const repo = {
      method: 'GET',
      url: "http://localhost:8000/repo",
    }
    axios.request(repo)
      .then(function (response) {

         // Finding the most commonly used languages 
    for(let index = 0; index < response.data.length; index++){

      let currentLanguage = response.data[index].language;

      if(languageMap[currentLanguage]){
        languageMap[currentLanguage] += 1
      }  else {
        languageMap[currentLanguage] = 1
      }
    }

    // Find the lannguage of each repo and create a hashMap
     let highValue = Object.values(languageMap).sort(function(a,b){return b - a});
     setLanguage(Object.keys(languageMap).filter(function(key) {return languageMap[key] === highValue[0]})[0]);
     setRepos(response.data.length)
      })
      .catch(function (error) {
        console.error(error);
      })

    const user = {
      method: 'GET',
      url: "http://localhost:8000/user",
    }
    axios.request(user)
      .then(function (response) {
        setGithubLink(response.data.html_url)
      })
      .catch(function (error) {
        console.error(error);
      })

    const lastYearCommits = {
      method: 'GET',
      url: "http://localhost:8000/lastYearCommits",
    }


    axios.request(lastYearCommits)
      .then(function (response) {
        setNumberOfCommits(response.data[0].total)
      })
      .catch(function (error) {
        console.error(error);
      })

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
