const app = require("../app");
const route = require("../routes/lastYearCommits");

app.use("/api/", route);

module.exports = app;