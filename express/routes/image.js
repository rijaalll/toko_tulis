const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Pastikan direktori 'images' ada
const dir = './images';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/'); // Folder untuk menyimpan gambar
  },
  filename: function (req, file, cb) {
    // Buat nama file acak 5 karakter + ekstensi asli
    const randomName = crypto.randomBytes(5).toString('hex').slice(0, 5);
    const extension = path.extname(file.originalname);
    cb(null, `${randomName}${extension}`);
  }
});

// Filter file untuk memastikan hanya gambar yang diunggah
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file JPG dan PNG yang diizinkan!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 2 // Batas ukuran file 2MB
  }
});

/**
 * @route   POST /image/upload
 * @desc    Upload satu gambar
 * @access  Public
 */
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file yang diunggah atau format file tidak didukung.' });
  }

  const port = process.env.API_PORT || 3000;
  
  const imageUrl = `http://127.0.0.1:${port}/image/get/${req.file.filename}`;
  
  res.status(200).json({
    message: 'Gambar berhasil diunggah',
    filename: req.file.filename,
    url: imageUrl
  });
}, (error, req, res, next) => {
  res.status(400).json({ message: error.message });
});

module.exports = router;
