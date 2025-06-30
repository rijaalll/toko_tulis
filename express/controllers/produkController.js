const produkModel = require('../models/produkModel');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Fungsi untuk mengunggah gambar ke layanan eksternal
const uploadImage = async (filePath) => {
  const form = new FormData();
  form.append('images', fs.createReadStream(filePath));

  const response = await axios.post('http://image.rpnza.my.id/upload', form, {
    headers: form.getHeaders(),
  });

  const filename = response.data.filename;
  return `http://image.rpnza.my.id/get/${filename}`;
};

// Menambahkan produk baru
exports.add = async (req, res) => {
  try {
    const { nama, harga, stok } = req.body;
    let imageUrl = null;

    if (req.file) {
      try {
        imageUrl = await uploadImage(req.file.path);
        fs.unlinkSync(req.file.path); // hapus file lokal setelah diunggah
      } catch (err) {
        return res.status(500).json({ message: 'Gagal upload gambar', error: err.message });
      }
    }

    await produkModel.add(nama, harga, stok, imageUrl);
    res.json({ message: 'Produk berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambahkan produk', error: err.message });
  }
};

// Mengedit produk yang ada
exports.edit = async (req, res) => {  
  try {
    const id = req.params.id || req.body.id;
    const { nama, harga, stok } = req.body;
    
    // --- PERUBAHAN DI SINI ---
    // Inisialisasi imageUrl dengan URL yang ada dari body.
    // Ini akan ada jika frontend mengirimkannya (saat tidak ada gambar baru).
    let imageUrl = req.body.image_url;

    // Jika ada file baru yang diunggah, proses file tersebut.
    if (req.file) {
      try {
        // Unggah gambar baru dan perbarui imageUrl
        imageUrl = await uploadImage(req.file.path);
        // Hapus file sementara dari server
        fs.unlinkSync(req.file.path);
      } catch (err) {
        return res.status(500).json({ message: 'Gagal upload gambar baru', error: err.message });
      }
    }
    // --- AKHIR PERUBAHAN ---

    // Panggil model untuk memperbarui database dengan data yang benar
    await produkModel.edit(id, nama, harga, stok, imageUrl);
    res.json({ message: 'Produk berhasil diubah' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengubah produk', error: err.message });
  }
};

// Mendapatkan semua produk
exports.getAll = async (req, res) => {
  try {
    const [rows] = await produkModel.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data produk', error: err.message });
  }
};

// Mendapatkan produk berdasarkan ID
exports.getById = async (req, res) => {
  try {
    const [rows] = await produkModel.getById(req.params.id);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data produk', error: err.message });
  }
};

// Mencari produk
exports.search = async (req, res) => {
  try {
    const param = req.params.param;
    const [rows] = await produkModel.search(param);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mencari produk', error: err.message });
  }
};

// Menghapus produk
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await produkModel.delete(id);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err)
    {
    res.status(500).json({ message: 'Gagal menghapus produk', error: err.message });
  }
};
