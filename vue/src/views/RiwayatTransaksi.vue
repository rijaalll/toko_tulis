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
                    <span>Transaksi #{{ transaction.id }}</span>
                    <span class="fw-bold text-success">{{ formatCurrency(transaction.total_harga) }}</span>
                    <span class="text-muted">{{ formatDate(transaction.tanggal_transaksi) }}</span>
                  </div>
                </button>
              </h2>
              <div :id="'collapse' + index" class="accordion-collapse collapse" :aria-labelledby="'heading' + index" data-bs-parent="#accordionTransactions">
                <div class="accordion-body">
                  <strong>Detail Item:</strong>
                  <ul class="list-group mt-2">
                    <li v-for="item in transaction.items" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
                      <span>{{ item.produk.nama }}</span>
                      <span>{{ item.jumlah }} x {{ formatCurrency(item.harga_saat_transaksi) }}</span>
                      <span class="fw-bold">{{ formatCurrency(item.jumlah * item.harga_saat_transaksi) }}</span>
                    </li>
                  </ul>
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

const fetchTransactions = async () => {
  try {
    loading.value = true;
    const response = await ApiService.getTransaksi();
    // Urutkan transaksi dari yang terbaru
    transactions.value = response.data.sort((a, b) => new Date(b.tanggal_transaksi) - new Date(a.tanggal_transaksi));
  } catch (err) {
    error.value = 'Gagal memuat riwayat transaksi.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

onMounted(fetchTransactions);
</script>
