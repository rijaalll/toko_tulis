// file ini adalah service untuk mengelola API yang digunakan dalam aplikasi Vue.js

import axios from 'axios';

// menggunakan axios untuk melakukan request ke API backend
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {

  // Endpoints API untuk semua Produk
  getProduk() {
    return apiClient.get('/produk/all');
  },

  // Endpoints API untuk mendapatkan produk berdasarkan ID
  getProdukById(id) {
    return apiClient.get(`/produk/${id}`);
  },

  // Endpoints API untuk menambah produk
  createProduk(data) {
    // Jika data berupa FormData, hapus Content-Type header
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return apiClient.post('/produk', data, config);
  },

  // Endpoints API untuk mengupdate produk
  updateProduk(id, data) {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return apiClient.put(`/produk/${id}`, data, config);
  },

  // Endpoints API untuk menghapus produk
  deleteProduk(id) {
    return apiClient.delete(`/produk/${id}`);
  },

  // Endpoints API untuk mencari produk berdasarkan nama
  searchProduk(param) {
    return apiClient.get(`/produk/search/${param}`);
  },

  // Endpoints API untuk mendapatkan Transaksi
  getTransaksi() {
    return apiClient.get('/transaksi/all');
  },

  // Endpoints API untuk menambah transaksi
  createTransaksi(data) {
    return apiClient.post('/transaksi/add', data);
  },

  // Endpoints API untuk mengupdate transaksi
  updateTransaksi(id, data) {
    return apiClient.put('/transaksi/edit', { id, ...data });
  },

  // Endpoints API untuk menghapus transaksi
  deleteTransaksi(id) {
    return apiClient.delete(`/transaksi/delete/${id}`);
  },

  // Endpoints API untuk mendapatkan transaksi berdasarkan tanggal
  getTransaksiByDate(tanggal, bulan, tahun) {
    return apiClient.get(`/transaksi/get/${tanggal}-${bulan}-${tahun}`);
  },

  // Endpoints API untuk mendapatkan laporan harian
  getLaporanHarian() {
    return apiClient.get('/transaksi/laporan/harian');
  },

  // Endpoints API untuk mendapatkan produk terlaris
  getProdukTerlaris() {
    return apiClient.get('/transaksi/laporan/produk-terlaris');
  }
};