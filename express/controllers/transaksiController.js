const transaksiModel = require('../models/transaksiModel');

exports.add = async (req, res) => {
  const { tanggal, nama_pelanggan, items } = req.body;
  await transaksiModel.add(tanggal, nama_pelanggan, items);
  res.json({ message: 'Transaksi ditambahkan' });
};

exports.edit = async (req, res) => {
  const { id, nama_pelanggan, items } = req.body;
  await transaksiModel.edit(id, nama_pelanggan, items);
  res.json({ message: 'Transaksi diubah' });
};

exports.delete = async (req, res) => {
  await transaksiModel.delete(req.params.id);
  res.json({ message: 'Transaksi dihapus' });
};

exports.getByDate = async (req, res) => {
  const { tanggal, bulan, tahun } = req.params;
  const [rows] = await transaksiModel.getByDate(tanggal, bulan, tahun);
  res.json(rows);
};

exports.getTopProduk = async (req, res) => {
  try {
    const [rows] = await transaksiModel.getTopProduk();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil produk terlaris', error: err.message });
  }
};
