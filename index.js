require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { lookup, resolve, resolve4 } = require("dns").promises;
const { URL } = require("url");
let urlDatabase = require("./urlDatabase.json");
const fs = require("fs").promises;
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
function getShortUrl() {
  let short_url;
  do {
    short_url = Math.floor(Math.random() * 1000000);
  } while (short_url in urlDatabase);
  console.log("generated short_url", short_url);

  return short_url;
}

async function saveDatabase() {
  try {
    await fs.writeFile(
      './urlDatabase.json', 
      JSON.stringify(urlDatabase, null, 2)
    );
    console.log('Database saved successfully');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});
app.post("/api/shorturl", async (req, res) => {
  console.log("in /api/shorturl POST handler");
  const original_url = req.body.url;
  let urlObject;
  console.log("original_url", original_url);

  try {
    urlObject = new URL(original_url);
    if (!["http:", "https:"].includes(urlObject.protocol)) {
      throw new Error();
    }
    console.log("urlObject.hostname", urlObject.hostname);
    if (!urlObject.hostname.includes(".")) {
    throw new Error("Hostname must contain a dot");
  }
  } catch (e) {
    console.log("invalid url", e);
    res.json({
      error: "invalid url",
    });
    return;
  }

  try {
    const address = await resolve(urlObject.hostname);
    console.log("address", address);
  } catch (e) {
    console.log("in second try/catch", e);
    return res.json({
      error: "invalid url",
    });
    
  }

   const normalizedUrl = urlObject.href.replace(/\/$/, "");
  if (Object.values(urlDatabase).includes(normalizedUrl)) {
    console.log("original_url already exists in urlDatabase");
    const value = Object.keys(urlDatabase).find(
      (key) => urlDatabase[key] === normalizedUrl
    );
    return res.json({
      original_url: normalizedUrl,
      short_url: Number(value),
    });
  }

  const short_url = getShortUrl();
  console.log("short_url", short_url);
  urlDatabase[short_url] = normalizedUrl;
  console.log("urlDatabase", urlDatabase);
  await saveDatabase();
  res.json({
    original_url: normalizedUrl,
    short_url
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  let number = Number(req.params.short_url);
  console.log("in /api/shorturl/:short_url handler", number);
  //check if number exists in urlDatabase
  if(number in urlDatabase){
    res.redirect(urlDatabase[number]);
  }else{
    console.log("short_url not found in urlDatabase");
    res.json({
      error: "invalid url",
    });
  }

});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
