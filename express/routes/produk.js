const express = require('express');
const router = express.Router();
const produkController = require('../controllers/produkController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// API Routes untuk Produk
router.get('/all', produkController.getAll);
router.get('/:id', produkController.getById);
router.get('/search/:param', produkController.search);
router.post('/add', upload.single('image'), produkController.add);
router.post('/', upload.single('image'), produkController.add);
router.put('/edit', upload.single('image'), produkController.edit);
router.put('/:id', upload.single('image'), produkController.edit);
router.delete('/delete/:id', produkController.delete);
router.delete('/:id', produkController.delete);

module.exports = router;