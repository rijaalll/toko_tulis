<template>
  <div class="container-fluid">
    <h1 class="h3 mb-4 text-gray-800">Manajemen Produk</h1>

    <div class="card shadow mb-4">
      <div class="card-header py-3 d-flex justify-content-between align-items-center">
        <h6 class="m-0 font-weight-bold text-primary">Daftar Produk</h6>
        <button class="btn btn-primary btn-sm" @click="openModal()">
          <i class="bi bi-plus-circle"></i> Tambah Produk
        </button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-else class="table-responsive">
          <table class="table table-bordered table-hover" width="100%" cellspacing="0">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Produk</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="products.length === 0">
                <td colspan="5" class="text-center">Tidak ada data produk.</td>
              </tr>
              <tr v-for="(product, index) in products" :key="product.id">
                <td>{{ index + 1 }}</td>
                <td>{{ product.nama }}</td>
                <td>{{ formatCurrency(product.harga) }}</td>
                <td>{{ product.stok }}</td>
                <td>
                  <button class="btn btn-warning btn-sm me-2" @click="openModal(product)">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" @click="deleteProduct(product.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Tambah/Edit Produk -->
    <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="productModalLabel">{{ isEditMode ? 'Edit Produk' : 'Tambah Produk Baru' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="nama" class="form-label">Nama Produk</label>
                <input type="text" class="form-control" id="nama" v-model="form.nama" required>
              </div>
              <div class="mb-3">
                <label for="harga" class="form-label">Harga</label>
                <input type="number" class="form-control" id="harga" v-model="form.harga" required>
              </div>
              <div class="mb-3">
                <label for="stok" class="form-label">Stok</label>
                <input type="number" class="form-control" id="stok" v-model="form.stok" required>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-primary">{{ isEditMode ? 'Simpan Perubahan' : 'Simpan' }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import ApiService from '../services/ApiService';
import { Modal } from 'bootstrap';

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const isEditMode = ref(false);
let productModal = null;

const form = reactive({
  id: null,
  nama: '',
  harga: 0,
  stok: 0
});

const fetchProducts = async () => {
  try {
    loading.value = true;
    const response = await ApiService.getProduk();
    products.value = response.data;
  } catch (err) {
    error.value = 'Gagal memuat data produk.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openModal = (product = null) => {
  if (product) {
    isEditMode.value = true;
    form.id = product.id;
    form.nama = product.nama;
    form.harga = product.harga;
    form.stok = product.stok;
  } else {
    isEditMode.value = false;
    resetForm();
  }
  productModal.show();
};

const resetForm = () => {
  form.id = null;
  form.nama = '';
  form.harga = 0;
  form.stok = 0;
};

const handleSubmit = async () => {
  try {
    const data = {
      nama: form.nama,
      harga: parseInt(form.harga),
      stok: parseInt(form.stok)
    };

    if (isEditMode.value) {
      await ApiService.updateProduk(form.id, data);
    } else {
      await ApiService.createProduk(data);
    }
    productModal.hide();
    fetchProducts();
  } catch (err) {
    console.error('Gagal menyimpan produk:', err);
    alert('Terjadi kesalahan saat menyimpan produk.');
  }
};

const deleteProduct = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
    try {
      await ApiService.deleteProduk(id);
      fetchProducts();
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
      alert('Terjadi kesalahan saat menghapus produk.');
    }
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

onMounted(() => {
  fetchProducts();
  productModal = new Modal(document.getElementById('productModal'));
});
</script>

