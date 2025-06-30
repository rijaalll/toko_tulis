<template>
  <div class="container-fluid">
    <h1 class="h3 mb-4 text-gray-800">Riwayat Transaksi</h1>

    <div class="card shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">Semua Transaksi</h6>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-else>
          <div v-if="transactions.length === 0" class="text-center text-muted">
            Belum ada riwayat transaksi.
          </div>
          <div v-else class="accordion" id="accordionTransactions">
            <div class="accordion-item" v-for="(transaction, index) in transactions" :key="transaction.id">
              <h2 class="accordion-header" :id="'heading' + index">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index" aria-expanded="false" :aria-controls="'collapse' + index">
                  <div class="d-flex justify-content-between w-100 pe-3">
                    <div class="d-flex flex-column align-items-start">
                      <span class="fw-bold">Transaksi #{{ transaction.id }}</span>
                      <small class="text-muted">{{ transaction.nama_pelanggan || 'Customer' }}</small>
                    </div>
                    <div class="d-flex flex-column align-items-end">
                      <span class="fw-bold text-success">{{ formatCurrency(transaction.total_harga) }}</span>
                      <small class="text-muted">{{ formatDate(transaction.tanggal) }}</small>
                    </div>
                  </div>
                </button>
              </h2>
              <div :id="'collapse' + index" class="accordion-collapse collapse" :aria-labelledby="'heading' + index" data-bs-parent="#accordionTransactions">
                <div class="accordion-body">
                  <div class="mb-3">
                    <strong>Informasi Transaksi:</strong>
                    <p class="mb-1"><small class="text-muted">Tanggal: {{ formatFullDate(transaction.tanggal) }}</small></p>
                    <p class="mb-1"><small class="text-muted">Pelanggan: {{ transaction.nama_pelanggan || 'Customer' }}</small></p>
                  </div>
                  <strong>Detail Item:</strong>
                  <div class="row mt-2">
                    <div v-for="item in getTransactionItems(transaction)" :key="item.id || item.produk_id" class="col-12 mb-2">
                      <div class="card">
                        <div class="card-body p-2">
                          <div class="row align-items-center">
                            <div class="col-2">
                              <img 
                                :src="getProductImage(item)" 
                                :alt="getProductName(item)"
                                class="img-fluid rounded"
                                style="width: 50px; height: 50px; object-fit: cover;"
                                @error="handleImageError"
                              >
                            </div>
                            <div class="col-6">
                              <h6 class="mb-1">{{ getProductName(item) }}</h6>
                              <small class="text-muted">{{ item.jumlah || item.quantity }} x {{ formatCurrency(item.harga_saat_transaksi || item.harga) }}</small>
                            </div>
                            <div class="col-4 text-end">
                              <span class="fw-bold">{{ formatCurrency((item.jumlah || item.quantity) * (item.harga_saat_transaksi || item.harga)) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between">
                    <strong>Total Transaksi:</strong>
                    <strong class="text-success">{{ formatCurrency(transaction.total_harga) }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ApiService from '../services/ApiService';

const transactions = ref([]);
const loading = ref(true);
const error = ref(null);

// Fungsi untuk mengambil data transaksi dari API
const fetchTransactions = async () => {
  try {
    loading.value = true;
    const response = await ApiService.getTransaksi();
    transactions.value = response.data.map(transaction => ({
      ...transaction,
      items: typeof transaction.items === 'string' ? JSON.parse(transaction.items) : transaction.items
    })).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  } catch (err) {
    error.value = 'Gagal memuat riwayat transaksi.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Helper functions untuk mengelola data transaksi
const getTransactionItems = (transaction) => {
  if (!transaction.items) return [];
  
  let items = typeof transaction.items === 'string' ? JSON.parse(transaction.items) : transaction.items;
  if (!Array.isArray(items)) return [];
  
  return items;
};


// Helper functions untuk mendapatkan nama dan gambar produk
const getProductName = (item) => {
  if (item.produk && item.produk.nama) return item.produk.nama;
  if (item.nama) return item.nama;
  return 'Produk Tidak Diketahui';
};

// Helper function untuk mendapatkan URL gambar produk
const getProductImage = (item) => {
  if (item.produk && item.produk.image_url) return item.produk.image_url;
  if (item.image_url) return item.image_url;
  return 'https://via.placeholder.com/50x50?text=No+Image';
};

// Handler untuk menangani error pada gambar produk
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
};

// Helper function untuk format mata uang
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

// Helper function untuk format tanggal
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const transactionDate = new Date(date);
  transactionDate.setHours(0, 0, 0, 0);

  const timeOnly = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);

  const fullDateFormat = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);

  if (transactionDate.getTime() === today.getTime()) {
    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 12) return `${diffHour} jam lalu`;
    return `Hari ini, ${timeOnly}`;
  }

  if (transactionDate.getTime() === yesterday.getTime()) {
    return `Kemarin, ${timeOnly}`;
  }

  return fullDateFormat;
};

// Helper function untuk format tanggal lengkap
const formatFullDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

onMounted(fetchTransactions);
</script>

<style scoped>
.accordion-button:not(.collapsed) {
  background-color: #e3f2fd;
  border-color: #bbdefb;
}
</style>