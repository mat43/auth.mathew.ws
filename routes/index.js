const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('file-system');

const { marked } = require('marked');

let introductionMD = '';
fs.readFile(`${process.cwd()}${path.sep}README.md`, function(err, data) {
	if (err) {
		console.log(err);
		introductionMD = 'Error';
		return;
	}
	introductionMD = data.toString();
});

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

/* GET home page. */
router.get('/', function(req, res) {
	res.render('landing', { title: 'Private API', markdown: marked.parse(introductionMD) });
});

router.get('/test', function (req, res, next) {
  res.send('API is working properly');
});

module.exports = router;
