const db = require('../db');

exports.add = async (tanggal, nama_pelanggan, items) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO transaksi (tanggal, nama_pelanggan, total_harga) VALUES (?, ?, ?)',
      [tanggal, nama_pelanggan, 0]
    );
    const transaksiId = result.insertId;

    let totalHarga = 0;
    for (const item of items) {
      const [produk] = await conn.query('SELECT harga FROM produk WHERE id = ?', [item.produk_id]);
      const harga = produk[0].harga;
      const subtotal = harga * item.quantity;
      totalHarga += subtotal;

      await conn.query(
        'INSERT INTO transaksi_item (transaksi_id, produk_id, quantity, harga) VALUES (?, ?, ?, ?)',
        [transaksiId, item.produk_id, item.quantity, harga]
      );
    }

    await conn.query('UPDATE transaksi SET total_harga = ? WHERE id = ?', [totalHarga, transaksiId]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.edit = async (id, nama_pelanggan, items) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE transaksi SET nama_pelanggan = ? WHERE id = ?', [nama_pelanggan, id]);
    await conn.query('DELETE FROM transaksi_item WHERE transaksi_id = ?', [id]);

    let totalHarga = 0;
    for (const item of items) {
      const [produk] = await conn.query('SELECT harga FROM produk WHERE id = ?', [item.produk_id]);
      const harga = produk[0].harga;
      const subtotal = harga * item.quantity;
      totalHarga += subtotal;

      await conn.query(
        'INSERT INTO transaksi_item (transaksi_id, produk_id, quantity, harga) VALUES (?, ?, ?, ?)',
        [id, item.produk_id, item.quantity, harga]
      );
    }

    await conn.query('UPDATE transaksi SET total_harga = ? WHERE id = ?', [totalHarga, id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.delete = (id) => db.query('DELETE FROM transaksi WHERE id = ?', [id]);

exports.getByDate = (tanggal, bulan, tahun) => {
  return db.query(
    `SELECT * FROM transaksi WHERE DAY(tanggal) = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?`,
    [tanggal, bulan, tahun]
  );
};

exports.getTopProduk = () => {
  return db.query(`
    SELECT 
      p.id, 
      p.nama, 
      SUM(ti.quantity) as total_terjual, 
      p.harga, 
      p.image_url 
    FROM 
      transaksi_item ti
    JOIN 
      produk p ON ti.produk_id = p.id
    GROUP BY 
      p.id, p.nama, p.harga, p.image_url
    ORDER BY 
      total_terjual DESC
    LIMIT 10
  `);
};

