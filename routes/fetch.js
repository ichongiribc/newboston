var express = require('express');
var router = express.Router();

/* GET fetch  page. */
router.get('/', function(req, res, next) {
    res.render('fetch', { title: 'Fetch - Bromley' });
});

module.exports = router;
