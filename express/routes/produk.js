const express = require('express');
const router = express.Router();
const produkController = require('../controllers/produkController');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// --- PENGATURAN MULTER UNTUK UPLOAD GAMBAR ---

// Pastikan direktori 'images' ada, jika tidak, buat direktorinya
const dir = './images';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Konfigurasi penyimpanan Multer untuk menyimpan file ke disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan folder tujuan penyimpanan file
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    // Buat nama file unik: 5 karakter acak + ekstensi asli
    const randomName = crypto.randomBytes(5).toString('hex').slice(0, 5);
    const extension = path.extname(file.originalname);
    cb(null, `${randomName}${extension}`);
  }
});

// Filter untuk memastikan hanya file gambar (JPG/PNG) yang diunggah
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true); // Terima file
  } else {
    // Tolak file dengan memberikan error
    cb(new Error('Format file tidak didukung! Hanya JPG dan PNG.'), false);
  }
};

// Inisialisasi middleware multer dengan konfigurasi di atas
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 2 // Batas ukuran file 2MB
  }
});


// --- RUTE-RUTE API UNTUK PRODUK ---

// GET
router.get('/all', produkController.getAll);
router.get('/search/:param', produkController.search);
router.get('/:id', produkController.getById);

// POST (Gunakan middleware 'upload' yang sudah dikonfigurasi)
router.post('/add', upload.single('image'), produkController.add);
router.post('/update/:id', upload.single('image'), produkController.edit);

// DELETE
router.delete('/:id', produkController.delete);

module.exports = router;
