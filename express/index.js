// file utama untuk menginisialisasi server Express dan mengatur routing
const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Menggunakan middleware CORS dan dotenv
app.use(cors());
dotenv.config();

const PORT = process.env.API_PORT;

app.use(bodyParser.json());

const produkRoutes = require('./routes/produk');
const transaksiRoutes = require('./routes/transaksi');

// Menggunakan routing untuk produk dan transaksi
app.use('/produk', produkRoutes);
app.use('/transaksi', transaksiRoutes);

// Jalankan server pada port yang ditentukan
app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});