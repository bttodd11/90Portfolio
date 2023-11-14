const app = require("../app");
const route = require("../routes/user");

app.use("/api/", route);

module.exports = app;