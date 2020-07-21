require("dotenv").config();
const express = require("express");
const app = express();

app.use("/public", express.static("public"));

app.get("/", (req, res) => {
  if (req.get("host").indexOf("localhost") >= 0) {
    res.redirect("http://lvh.me:8765/");
  }

  const clientId = process.env.CLIENT_ID;
  const apiKey = process.env.API_KEY;

  return res.send(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <script>
    window.CLIENT_ID = ${clientId};
    window.API_KEY = ${apiKey};
</script>
  <body>
    <button id="authorizeButton" style="display: none;">Authorize</button>
    <button id="signoutButton" style="display: none;">Sign Out</button>
    <hr />
    <button id="createRandomContact" style="display: none;">Create random contact</button>

    <ul id="contacts"></ul>
    <p style="display: none;" id="loading">Loading...</p>
    <script src="https://apis.google.com/js/api.js"></script>
    <script src="/public/script.js"></script>
  </body>
</html>
`)
});

app.listen(8765, () => console.log("http://lvh.me:8765"));
