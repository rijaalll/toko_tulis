const db = require('../db');

exports.getAll = () => db.query('SELECT * FROM produk');

exports.search = (param) => {
  return db.query(
    `SELECT * FROM produk WHERE id = ? OR nama LIKE ? OR harga = ?`,
    [param, `%${param}%`, param]
  );
};

exports.add = (nama, harga, stok, image_url) => {
  return db.query(
    'INSERT INTO produk (nama, harga, stok, image_url) VALUES (?, ?, ?, ?)',
    [nama, harga, stok, image_url]
  );
};

exports.edit = (id, nama, harga, stok, image_url) => {
  return db.query(
    'UPDATE produk SET nama = ?, harga = ?, stok = ?, image_url = ? WHERE id = ?',
    [nama, harga, stok, image_url, id]
  );
};

exports.delete = (id) => db.query('DELETE FROM produk WHERE id = ?', [id]);