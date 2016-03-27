var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Eos' });
});
router.get('/efectoD', function(req, res, next) {
  res.render('efectoD', { title: 'Eos' });
});
router.get('/afinador', function(req, res, next) {
  res.render('afinador', { title: 'Eos' });
});

module.exports = router;
