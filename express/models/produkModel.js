const db = require('../db');

// SQL Query untuk mengambil semua produk
exports.getAll = () => db.query('SELECT * FROM produk ORDER BY nama');

// SQL Query untuk mencari produk berdasarkan ID
exports.getById = (id) => db.query('SELECT * FROM produk WHERE id = ?', [id]);

// SQL Query untuk mencari produk berdasarkan ID, nama, atau harga
exports.search = (param) => {
  return db.query(
    `SELECT * FROM produk WHERE id = ? OR nama LIKE ? OR harga = ? ORDER BY nama`,
    [param, `%${param}%`, param]
  );
};

// SQL Query untuk menambahkan produk
exports.add = (nama, harga, stok, image_url) => {
  return db.query(
    'INSERT INTO produk (nama, harga, stok, image_url) VALUES (?, ?, ?, ?)',
    [nama, harga, stok, image_url]
  );
};

// SQL Query untuk mengedit produk
exports.edit = (id, nama, harga, stok, image_url) => {
  return db.query(
    'UPDATE produk SET nama = ?, harga = ?, stok = ?, image_url = ? WHERE id = ?',
    [nama, harga, stok, image_url, id]
  );
};

exports.delete = (id) => db.query('DELETE FROM produk WHERE id = ?', [id]);