// file utama untuk menginisialisasi server Express dan mengatur routing

const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

app.use(cors());
dotenv.config();

const PORT = process.env.API_PORT;

app.use(bodyParser.json());

const produkRoutes = require('./routes/produk');
const transaksiRoutes = require('./routes/transaksi');

app.use('/produk', produkRoutes);
app.use('/transaksi', transaksiRoutes);

app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});