var express = require('express');
var connection = require('../library/database');
var router = express.Router();

router.get('/login', function(req, res) {
    res.render('login', {
        error: req.session.error
    });
    req.session.error = null
})

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(query, [username, password], (error, results) => {
        if(error) throw error;

        if(results.length > 0) {
            req.session.username = username;
            req.session.role = results[0].role;
            res.redirect('/');
        }else {
            req.session.error = 'Invalid email or Password';
            res.redirect('/login');
        }
    });
});

module.exports = router