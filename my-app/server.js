const PORT = 8000;
const express = require('express')
const cors = require('cors');
const axios = require('axios');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();
let octoId = process.env.REACT_APP_USER_PASSWORD;
const app = express();
const octokit = new Octokit({ auth: octoId });
let repos = 0;
let language = "";
let githubLink = "";
let numberOfCommits = 0
let languageMap = {};




app.get('/', async (req, res) => {

   const repoOptions = {
        method: 'GET',
        url: ' https://api.github.com/users/bttodd11/repos?per_page=100',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': octoId 
          }
   }

   const userOptions = {
        method: 'GET',
        url: 'https://api.github.com/users/bttodd11',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': octoId 
          }

   }

   const lastYearCommitOptions = {
        method: 'GET',
        url: 'https://api.github.com/repos/bttodd11/90Portfolio/stats/contributors',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': octoId 
          }
   }


    axios.request(repoOptions.url).then((response) => {
        repos = response.data.length;


        // Finding the most commonly used languages 
    for(let index = 0; index < response.data.length; index++){

      let currentLanguage = response.data[index].language;

      if(languageMap[currentLanguage]){
        languageMap[currentLanguage] += 1
      }  else {
        languageMap[currentLanguage] = 1
      }
    }

    let highValue = Object.values(languageMap).sort(function(a,b){return b - a});
   language = Object.keys(languageMap).filter(function(key) {return languageMap[key] === highValue[0]})[0];

    })
    axios.request(userOptions).then((response) => {
        githubLink = response.data.html_url;
    })
    axios.request(lastYearCommitOptions).then((response) => {
        if(response.data){
            numberOfCommits = response.data[0].total;
        }
    })
})

app.listen(PORT, () => console.log("Server is running on port " + PORT))