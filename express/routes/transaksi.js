const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');

router.post('/add', transaksiController.add);
router.put('/edit', transaksiController.edit);
router.delete('/delete/:id', transaksiController.delete);
router.get('/get/:tanggal-:bulan-:tahun', transaksiController.getByDate);
router.get('/top', transaksiController.getTopProduk);

module.exports = router;
