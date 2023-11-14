const user = require("express").Router();

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