const PORT = 8000;
const express = require('express')
const cors = require('cors');
const axios = require('axios');
const app = express();
require('dotenv').config();
app.use(cors());
let octoId = process.env.REACT_APP_USER_PASSWORD;



app.get('/repo', async (req, res) => {

   const repoOptions = {
        method: 'GET',
        url: ' https://api.github.com/users/bttodd11/repos?per_page=100',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': octoId,
          }
   }
    axios.request(repoOptions.url).then((response) => {
        res.json(response.data)
    })
})

app.get('/user', async (req, res) => {

    const userOptions = {
    method: 'GET',
    url: 'https://api.github.com/users/bttodd11',
    headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        'Authorization': octoId,
      }
    }
       axios.request(userOptions).then((response) => {
      res.json(response.data)
    })
})


app.get('/lastYearCommits', async (req, res) => {

  const lastYearCommitOptions = {
    method: 'GET',
    url: 'https://api.github.com/repos/bttodd11/90Portfolio/stats/contributors',
    headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        'Authorization': octoId,
      }
    }

    axios.request(lastYearCommitOptions).then((response) => {
      res.json(response.data)
})
})




app.listen(PORT, () => console.log("Server is running on port " + PORT))