const PORT = 8000;
const express = require('express')
const cors = require('cors');
const axios = require('axios');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();
let octoId = process.env.REACT_APP_USER_PASSWORD;
const app = express();
const octokit = new Octokit({ auth: octoId });




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
        url: 'https://api.github.com/users/bttodd11/',
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


    axios.request(options.url).then((response) => {
        console.log(response.data.length)
    })
})

app.listen(PORT, () => console.log("Server is running on port " + PORT))