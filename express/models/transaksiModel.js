const db = require('../db');

// SQL Query untuk menambahkan transaksi
exports.add = async (tanggal, nama_pelanggan, items) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const tanggalTransaksi = tanggal || new Date();
    
    const [result] = await conn.query(
      'INSERT INTO transaksi (tanggal, nama_pelanggan, total_harga) VALUES (?, ?, ?)',
      [tanggalTransaksi, nama_pelanggan || 'Customer', 0]
    );
    const transaksiId = result.insertId;

    let totalHarga = 0;
    for (const item of items) {
      const [produk] = await conn.query('SELECT harga, stok FROM produk WHERE id = ?', [item.id_produk || item.produk_id]);
      
      if (!produk[0]) {
        throw new Error(`Produk dengan ID ${item.id_produk || item.produk_id} tidak ditemukan`);
      }
      
      if (produk[0].stok < item.jumlah) {
        throw new Error(`Stok produk tidak mencukupi. Stok tersedia: ${produk[0].stok}`);
      }
      
      const harga = item.harga_saat_transaksi || produk[0].harga;
      const subtotal = harga * item.jumlah;
      totalHarga += subtotal;

      // Tambahkan transaksi item
      await conn.query(
        'INSERT INTO transaksi_item (transaksi_id, produk_id, quantity, harga) VALUES (?, ?, ?, ?)',
        [transaksiId, item.id_produk || item.produk_id, item.jumlah, harga]
      );
      
      // Update stok produk
      await conn.query(
        'UPDATE produk SET stok = stok - ? WHERE id = ?',
        [item.jumlah, item.id_produk || item.produk_id]
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

// SQL Query untuk mengedit transaksi
exports.edit = async (id, nama_pelanggan, items) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Kembalikan stok produk dari transaksi lama
    const [oldItems] = await conn.query(
      'SELECT produk_id, quantity FROM transaksi_item WHERE transaksi_id = ?',
      [id]
    );
    
    for (const oldItem of oldItems) {
      await conn.query(
        'UPDATE produk SET stok = stok + ? WHERE id = ?',
        [oldItem.quantity, oldItem.produk_id]
      );
    }

    await conn.query('UPDATE transaksi SET nama_pelanggan = ? WHERE id = ?', [nama_pelanggan, id]);
    await conn.query('DELETE FROM transaksi_item WHERE transaksi_id = ?', [id]);

    let totalHarga = 0;
    for (const item of items) {
      const [produk] = await conn.query('SELECT harga, stok FROM produk WHERE id = ?', [item.id_produk || item.produk_id]);
      
      if (!produk[0]) {
        throw new Error(`Produk dengan ID ${item.id_produk || item.produk_id} tidak ditemukan`);
      }
      
      if (produk[0].stok < item.jumlah) {
        throw new Error(`Stok produk tidak mencukupi. Stok tersedia: ${produk[0].stok}`);
      }
      
      const harga = item.harga_saat_transaksi || produk[0].harga;
      const subtotal = harga * item.jumlah;
      totalHarga += subtotal;

      await conn.query(
        'INSERT INTO transaksi_item (transaksi_id, produk_id, quantity, harga) VALUES (?, ?, ?, ?)',
        [id, item.id_produk || item.produk_id, item.jumlah, harga]
      );
      
      // Update stok produk
      await conn.query(
        'UPDATE produk SET stok = stok - ? WHERE id = ?',
        [item.jumlah, item.id_produk || item.produk_id]
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

// SQL Query untuk menghapus transaksi
exports.delete = (id) => db.query('DELETE FROM transaksi WHERE id = ?', [id]);

// SQL Query untuk mengambil transaksi berdasarkan tanggal
exports.getByDate = (tanggal, bulan, tahun) => {
  return db.query(
    `SELECT * FROM transaksi WHERE DAY(tanggal) = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?`,
    [tanggal, bulan, tahun]
  );
};

// SQL Query untuk mengambil produk terlaris
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

// SQL Query untuk mengambil semua transaksi
exports.getAll = () => {
  return db.query(`
    SELECT 
      t.id,
      t.tanggal,
      t.nama_pelanggan,
      t.total_harga,
      t.tanggal as tanggal_transaksi,
      IF(COUNT(ti.id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', ti.id,
          'produk_id', ti.produk_id,
          'jumlah', ti.quantity,
          'harga_saat_transaksi', ti.harga,
          'produk', JSON_OBJECT(
            'id', p.id,
            'nama', p.nama,
            'harga', p.harga,
            'image_url', p.image_url
          )
        )
      )) as items
    FROM transaksi t
    LEFT JOIN transaksi_item ti ON t.id = ti.transaksi_id
    LEFT JOIN produk p ON ti.produk_id = p.id
    GROUP BY t.id, t.tanggal, t.nama_pelanggan, t.total_harga
    ORDER BY t.tanggal DESC
  `);
};

// SQL Query untuk laporan harian (7 hari terakhir)
exports.getLaporanHarian = () => {
  return db.query(`
    SELECT 
      DATE(tanggal) as tanggal,
      SUM(total_harga) as total_penjualan,
      COUNT(*) as jumlah_transaksi
    FROM transaksi 
    WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(tanggal)
    ORDER BY tanggal DESC
  `);
};