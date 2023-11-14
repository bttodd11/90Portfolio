const lastYearCommits = require("express").Router();

lastYearCommits.get('/lastYearCommits', async (req, res) => {

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