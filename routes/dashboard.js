var express = require('express');
var router = express.Router();
var connection = require('../library/database');
var fileSystem = require('fs');
var multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/images');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/', function(req, res, next) {
    connection.query(`SELECT * FROM produk ORDER BY id desc`, function(error, rows) {
      if(error) {
        req.flash('Error', error);
        res.render('dashboard', { username: req.session.username, role: req.session.role, data: '', produk: 'Semua Produk' })
      } else {
        res.render('dashboard', { username: req.session.username, role: req.session.role, data: rows, produk: 'Semua Produk' })
      }
    })
});

router.get('/makanan', function(req, res, next) {
    connection.query(`SELECT * FROM produk WHERE jenis_produk = 'makanan' ORDER BY id desc`, function(error, rows) {
      if(error) {
        req.flash('Error', error);
        res.render('dashboard', { username: req.session.username, role: req.session.role, data: '', produk: 'Makanan' })
      } else {
        res.render('dashboard', { username: req.session.username, role: req.session.role, data: rows, produk: 'Makanan' })
      }
    })
});

router.get('/minuman', function(req, res, next) {
  connection.query(`SELECT * FROM produk WHERE jenis_produk = 'minuman' ORDER BY id desc`, function(error, rows) {
    if(error) {
      req.flash('Error', error);
      res.render('dashboard', { username: req.session.username, role: req.session.role, data: '', produk: 'Minuman' })
    } else {
      res.render('dashboard', { username: req.session.username, role: req.session.role, data: rows, produk: 'Minuman' })
    }
  })
});

router.get('/delete/:idData', function(req, res) {
  let idData = req.params.idData

  connection.query(`SELECT image FROM produk WHERE id = ${idData}`, function(error, results) {
    if(error) {
      req.flash('error', error);
      res.redirect(`/`);
    }else {
      let deleteImage = results[0].image
      if(deleteImage) fileSystem.unlinkSync('public/images/' + deleteImage);

      connection.query(`DELETE FROM produk WHERE id = ${idData}`, function(error, results) {
        if(error) {
          req.flash('error', error);
          res.redirect(`/`);
        }else {
          req.flash('Success', 'Data already be deleted');
          res.redirect(`/`);
        }
      });
    }
  })
})  

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
