const produkModel = require('../models/produkModel');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const uploadImage = async (filePath) => {
  const form = new FormData();
  form.append('images', fs.createReadStream(filePath));

  const response = await axios.post('http://image.rpnza.my.id/upload', form, {
    headers: form.getHeaders(),
  });

  const filename = response.data.filename;
  return `http://api.rpnza.my.id/get/${filename}`;
};

exports.add = async (req, res) => {
  const { nama, harga, stok } = req.body;
  let imageUrl = null;

  if (req.file) {
    try {
      imageUrl = await uploadImage(req.file.path);
      fs.unlinkSync(req.file.path); // hapus file lokal
    } catch (err) {
      return res.status(500).json({ message: 'Gagal upload gambar', error: err.message });
    }
  }

  await produkModel.add(nama, harga, stok, imageUrl);
  res.json({ message: 'Produk ditambahkan' });
};

exports.edit = async (req, res) => {
  const { id, nama, harga, stok } = req.body;
  let imageUrl = req.body.image_url;

  if (req.file) {
    try {
      imageUrl = await uploadImage(req.file.path);
      fs.unlinkSync(req.file.path);
    } catch (err) {
      return res.status(500).json({ message: 'Gagal upload gambar', error: err.message });
    }
  }

  await produkModel.edit(id, nama, harga, stok, imageUrl);
  res.json({ message: 'Produk diubah' });
};

exports.getAll = async (req, res) => {
  const [rows] = await produkModel.getAll();
  res.json(rows);
};

exports.search = async (req, res) => {
  const param = req.params.param;
  const [rows] = await produkModel.search(param);
  res.json(rows);
};

exports.delete = async (req, res) => {
  await produkModel.delete(req.params.id);
  res.json({ message: 'Produk dihapus' });
};