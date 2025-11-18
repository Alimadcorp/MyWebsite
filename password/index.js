const express = require("express");
const app = express();

const PASSWORD = process.env.PAGE_PASSWORD || "HelloAli(10)";

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <form method="POST" style="margin:50px auto;max-width:300px;text-align:center">
      <h2>Password Required</h2>
      <input type="password" name="password" placeholder="Password" style="width:100%;padding:8px;margin:10px 0">
      <button type="submit">Enter</button>
    </form>
  `);
});

app.post("/", (req, res) => {
  if (req.body.password === PASSWORD) {
    res.sendFile(__dirname + "/protected.html");
  } else {
    res.send("<h1>Access denied</h1><a href='/'>Try again</a>");
  }
});

module.exports = app;
