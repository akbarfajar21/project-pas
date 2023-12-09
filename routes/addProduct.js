var express = require('express');
var router = express.Router();
var connection = require('../library/database');
var multer = require('multer');
const fs = require('fs');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/images');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/addProduct', function(req, res) {
    let data = {
        action: '/store', 
        idData: '', 
        nama_barang: '', 
        harga_barang: '',
        deskripsi: '',
        jenis_produk: '',
        image: ''
    };
  
    res.render('addProduct', data);
});


router.post('/store', upload.single('image'), function(req, res, next) {
    let nameProduct = req.body.nama_barang; 
    let price = req.body.harga_barang; 
    let description = req.body.deskripsi;
    let category = req.body.jenis_produk;
    let image = req.file ? req.file.originalname : '';
    let errors = false;

    if (!nameProduct || !price || !category || !description || (image && !image.length)) {
        errors = true;
        req.flash('error', 'Invalid input data');
        res.render('addProduct', {
            nama_barang: nameProduct || '',
            harga_barang: price || '',
            deskripsi: description || '',
            jenis_produk: category || '',
            image: image || ''
        });
    }

    if (!errors) {
        let formData = {
            nama_barang: nameProduct,
            harga_barang: price,
            deskripsi: description,
            jenis_produk: category,
            image: image
        };
        connection.query('INSERT INTO produk SET ?', formData, function(error, result) {
            if (error) {
                req.flash('error', error);
                res.render('addProduct', {
                    nama_barang: formData.nama_barang,
                    harga_barang: formData.harga_barang,
                    deskripsi: formData.deskripsi,
                    jenis_produk: formData.jenis_produk,
                    image: formData.image
                });
            } else {
                req.flash('success', 'Data Product already be saved');
                res.redirect('/');
            }
        });
    }
});


router.get("/editProduct/:idData", function (req, res, next) {
    connection.query(
      `SELECT * FROM produk WHERE id = ${req.params.idData}`,
      function (err, rows) {
        if (err) throw err;
  
        if (rows.length <= 0) {
          req.flash("error", `Menu with ID ${req.params.idData} Not Found`);
          res.redirect("/");
        } else {
          res.render("addProduct", {
            id: rows[0].id,
            nama_barang: rows[0].nama_barang,
            jenis_produk: rows[0].jenis_produk,
            harga_barang: rows[0].harga_barang,
            deskripsi: rows[0].deskripsi,
            image: rows[0].image,
            action: `/update/${rows[0].id}` 
          });
        }
      }
    );
});

  
router.post("/update/:idData", upload.single("image"), function (req, res, next) {
    connection.query(
        `SELECT * FROM produk WHERE id = ${req.params.idData}`,
        function (err, rows) {
            if (err) throw err;

            if (rows.length <= 0) {
                req.flash("error", `Menu with ID ${req.params.idData} Not Found`);
                res.redirect("/");
            } else {
                let name = req.body.nama_barang;
                let types = req.body.jenis_produk;
                let price = req.body.harga_barang;
                let description = req.body.deskripsi;

                let error = false;

                if (
                    name.length === 0 ||
                    types.length === 0 ||
                    price.length === 0 ||
                    description.length === 0
                ) {
                    error = true;

                    req.flash("error", "Please Input Data");

                    res.render("addProduct", {
                        id: req.params.idData,
                        nama_barang: name,
                        jenis_produk: types,
                        harga_barang: price,
                        deskripsi: description,
                    });
                }

                if (!error) {
                    let formData = {
                        nama_barang: name,
                        jenis_produk: types,
                        harga_barang: price,
                        deskripsi: description,
                    };

                    if (req.file) {
                        if (rows[0].image) {
                            const oldImagePath = path.join(__dirname, '..', 'public', 'images', rows[0].image);
                            fs.unlink(oldImagePath, (err) => {
                                if (err) {
                                    console.error('Error deleting old image:', err);
                                }
                            });
                        }
                        formData.image = req.file.originalname;
                    }

                    connection.query(
                        `UPDATE produk SET ? WHERE id = ${req.params.idData}`,
                        formData,
                        function (err, result) {
                            if (err) {
                                req.flash("error", err);
                                res.render("addProduct", {
                                    id: req.params.idData,
                                    nama_barang: formData.nama_barang,
                                    jenis_produk: formData.jenis_produk,
                                    harga_barang: formData.harga_barang,
                                    deskripsi: formData.deskripsi,
                                    image: formData.image,
                                });
                            } else {
                                req.flash("success", "Update Data Successfully");
                                res.redirect(`/`);
                            }
                        }
                    );
                }
            }
        }
    );
});

  
module.exports = router