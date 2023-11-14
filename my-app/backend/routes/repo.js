const repo = require("express").Router();

repo.get('/repo', async (req, res) => {

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