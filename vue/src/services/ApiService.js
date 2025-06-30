import axios from 'axios';

// Membuat instance Axios dengan baseURL dari file .env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    return apiClient.post('/produk', data);
  },
  updateProduk(id, data) {
    return apiClient.put(`/produk/${id}`, data);
  },
  deleteProduk(id) {
    return apiClient.delete(`/produk/${id}`);
  },

  // === Transaksi Endpoints ===
  getTransaksi() {
    return apiClient.get('/transaksi/all');
  },
  createTransaksi(data) {
    return apiClient.post('/transaksi/add', data);
  },

  // === Laporan Endpoints ===
  getLaporanHarian() {
    return apiClient.get('/transaksi/laporan/harian');
  },
  getProdukTerlaris() {
    return apiClient.get('/transaksi/laporan/produk-terlaris');
  }
};