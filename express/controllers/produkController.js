const produkModel = require('../models/produkModel');

// Menambahkan produk baru
exports.add = async (req, res) => {
  try {
    const { nama, harga, stok } = req.body;
    let imageUrl = null; // Default URL gambar adalah null

    // Jika ada file yang diunggah (req.file akan ada berkat multer)
    if (req.file) {
      // Dapatkan port dari environment variable atau gunakan 3000
      const port = process.env.API_PORT || 3000;
      // Buat URL lengkap untuk mengakses gambar
      imageUrl = `http://127.0.0.1:${port}/image/get/${req.file.filename}`;
    }

    // Panggil model untuk menyimpan data produk ke database
    await produkModel.add(nama, harga, stok, imageUrl);
    res.json({ message: 'Produk berhasil ditambahkan' });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: 'Gagal menambahkan produk', error: err.message });
  }
};

// Mengedit produk yang ada
exports.edit = async (req, res) => {  
  try {
    const { id } = req.params;
    const { nama, harga, stok } = req.body;

    // Secara default, gunakan URL gambar yang sudah ada
    let imageUrl = req.body.image_url;

    // Jika ada file baru yang diunggah, perbarui URL gambarnya
    if (req.file) {
      const port = process.env.API_PORT || 3000;
      imageUrl = `http://127.0.0.1:${port}/image/get/${req.file.filename}`;
    }

    // Panggil model untuk mengubah data produk di database
    await produkModel.edit(id, nama, harga, stok, imageUrl);
    res.json({ message: 'Produk berhasil diubah' });
  } catch (err) {
    console.error(`Error editing product ${req.params.id}:`, err);
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
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus produk', error: err.message });
  }
};
