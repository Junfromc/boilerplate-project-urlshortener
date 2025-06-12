require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
function shortUrl(req, res, next) {
  console.log('in shortUrl middleware');
  console.log('req.body:', req.body);

  next();
}
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use('/api/shorturl', shortUrl);
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.post('/api/shorturl', function(req, res) {
console.log('in /api/shorturl POST handler');
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
