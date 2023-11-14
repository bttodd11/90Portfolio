const app = require("../app");
const route = require("../routes/repo");

app.use("/api/", route);

module.exports = app;