const PORT = 8000;
const express = require('express')
const cors = require('cors');
const axios = require('axios');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();
let octoId = process.env.REACT_APP_USER_PASSWORD;
const app = express();
const octokit = new Octokit({ auth: octoId });




app.get('/', (req, res) => {

    let repos =  octokit.request('GET /users/bttodd11/repos?per_page=100', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    axios.request(repos).then((response) => {
        console.log(response)
    })
})

app.listen(PORT, () => console.log("Server is running on port " + PORT))