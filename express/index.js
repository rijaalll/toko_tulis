// file utama untuk menginisialisasi server Express dan mengatur routing
const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Menggunakan middleware CORS dan dotenv
app.use(cors());
dotenv.config();

const PORT = process.env.API_PORT || 3000; // Tambahkan port default

// --- PERUBAHAN DI SINI ---
// Middleware untuk mem-parsing body dari request JSON
app.use(bodyParser.json());
// Middleware untuk mem-parsing body dari request form-urlencoded
// Ini penting untuk memastikan req.body terisi dengan benar saat menggunakan multer
app.use(bodyParser.urlencoded({ extended: true }));
// --- AKHIR PERUBAHAN ---

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Impor rute baru untuk gambar
const imageRoutes = require('./routes/image');
const produkRoutes = require('./routes/produk');
const transaksiRoutes = require('./routes/transaksi');

// gambar dari direktori 'images' secara statis
app.use('/image/get', express.static(path.join(__dirname, 'images')));

// Menggunakan routing untuk gambar, produk, dan transaksi
app.use('/image', imageRoutes);
app.use('/produk', produkRoutes);
app.use('/transaksi', transaksiRoutes);


// Jalankan server pada port yang ditentukan
app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});
