<template>
  <div class="container-fluid">
    <h1 class="h3 mb-4 text-gray-800">Laporan Penjualan</h1>
    
    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Memuat data laporan...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    
    <div v-else class="row">
      <!-- Laporan Penjualan Harian -->
      <div class="col-xl-8 col-lg-7">
        <div class="card shadow mb-4">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Grafik Penjualan Harian (7 Hari Terakhir)</h6>
          </div>
          <div class="card-body">
            <div v-if="laporanHarianData.labels.length > 0">
              <LineChart :chart-data="laporanHarianData" />
            </div>
            <div v-else class="text-center text-muted p-5">
              Tidak ada data penjualan harian untuk ditampilkan.
            </div>
          </div>
        </div>
      </div>

      <!-- Produk Terlaris -->
      <div class="col-xl-4 col-lg-5">
        <div class="card shadow mb-4">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Produk Terlaris</h6>
          </div>
          <div class="card-body">
             <div v-if="produkTerlarisData.labels.length > 0">
              <DoughnutChart :chart-data="produkTerlarisData" />
            </div>
             <div v-else class="text-center text-muted p-5">
              Tidak ada data produk terlaris untuk ditampilkan.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import ApiService from '../services/ApiService';
import LineChart from './LineChart.vue';
import DoughnutChart from './DoughnutChart.vue'; // impor Doughnut chart-js

const loading = ref(true);
const error = ref(null);

// Data untuk chart laporan harian
const laporanHarianData = reactive({
  labels: [],
  datasets: [
    {
      label: 'Total Penjualan (IDR)',
      backgroundColor: 'rgba(78, 115, 223, 0.05)',
      borderColor: 'rgba(78, 115, 223, 1)',
      data: [],
      fill: true,
      tension: 0.3
    }
  ]
});

// Data untuk chart produk terlaris
const produkTerlarisData = reactive({
  labels: [],
  datasets: [
    {
      label: 'Jumlah Terjual',
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
      data: []
    }
  ]
});

const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Ambil data Laporan Harian
    const harianRes = await ApiService.getLaporanHarian();
    if (harianRes.data && harianRes.data.length > 0) {
      laporanHarianData.labels = harianRes.data.map(d => new Date(d.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'}));
      laporanHarianData.datasets[0].data = harianRes.data.map(d => d.total_penjualan);
    }
    
    // Ambil data Produk Terlaris
    const terlarisRes = await ApiService.getProdukTerlaris();
    if (terlarisRes.data && terlarisRes.data.length > 0) {
      produkTerlarisData.labels = terlarisRes.data.map(p => p.nama);
      produkTerlarisData.datasets[0].data = terlarisRes.data.map(p => p.total_terjual);
    }

  } catch (err) {
    console.error("Gagal memuat data laporan:", err);
    error.value = "Tidak dapat mengambil data laporan dari server.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

