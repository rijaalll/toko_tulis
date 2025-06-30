const transaksiModel = require('../models/transaksiModel');

// Fungsi untuk mengunggah gambar ke API eksternal
exports.add = async (req, res) => {
  const { tanggal, nama_pelanggan, items } = req.body;
  await transaksiModel.add(tanggal, nama_pelanggan, items);
  res.json({ message: 'Transaksi ditambahkan' });
};

// Fungsi untuk mengedit transaksi
exports.edit = async (req, res) => {
  const { id, nama_pelanggan, items } = req.body;
  await transaksiModel.edit(id, nama_pelanggan, items);
  res.json({ message: 'Transaksi diubah' });
};

// Fungsi untuk menghapus transaksi
exports.delete = async (req, res) => {
  await transaksiModel.delete(req.params.id);
  res.json({ message: 'Transaksi dihapus' });
};

// Fungsi untuk mengambil transaksi berdasarkan tanggal
exports.getByDate = async (req, res) => {
  const { tanggal, bulan, tahun } = req.params;
  const [rows] = await transaksiModel.getByDate(tanggal, bulan, tahun);
  res.json(rows);
};

// Fungsi untuk mengambil produk terlaris
exports.getTopProduk = async (req, res) => {
  try {
    const [rows] = await transaksiModel.getTopProduk();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil produk terlaris', error: err.message });
  }
};

// Fungsi untuk mengambil semua transaksi
exports.getAll = async (req, res) => {
  try {
    const [rows] = await transaksiModel.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data transaksi', error: err.message });
  }
};

// Fungsi untuk mengambil laporan harian (7 hari terakhir)
exports.getLaporanHarian = async (req, res) => {
  try {
    const [rows] = await transaksiModel.getLaporanHarian();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil laporan harian', error: err.message });
  }
};