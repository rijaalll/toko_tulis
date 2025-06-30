import axios from 'axios';

// Membuat instance Axios dengan baseURL dari file .env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  // === Produk Endpoints ===
  getProduk() {
    return apiClient.get('/produk/all');
  },
  getProdukById(id) {
    return apiClient.get(`/produk/${id}`);
  },
  createProduk(data) {
    // Jika data berupa FormData, hapus Content-Type header
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return apiClient.post('/produk', data, config);
  },
  updateProduk(id, data) {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return apiClient.put(`/produk/${id}`, data, config);
  },
  deleteProduk(id) {
    return apiClient.delete(`/produk/${id}`);
  },
  searchProduk(param) {
    return apiClient.get(`/produk/search/${param}`);
  },

  // === Transaksi Endpoints ===
  getTransaksi() {
    return apiClient.get('/transaksi/all');
  },
  createTransaksi(data) {
    return apiClient.post('/transaksi/add', data);
  },
  updateTransaksi(id, data) {
    return apiClient.put('/transaksi/edit', { id, ...data });
  },
  deleteTransaksi(id) {
    return apiClient.delete(`/transaksi/delete/${id}`);
  },
  getTransaksiByDate(tanggal, bulan, tahun) {
    return apiClient.get(`/transaksi/get/${tanggal}-${bulan}-${tahun}`);
  },

  // === Laporan Endpoints ===
  getLaporanHarian() {
    return apiClient.get('/transaksi/laporan/harian');
  },
  getProdukTerlaris() {
    return apiClient.get('/transaksi/laporan/produk-terlaris');
  }
};