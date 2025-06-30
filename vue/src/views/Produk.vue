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
        <div class="mb-3">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Cari produk berdasarkan nama..." 
            v-model="searchQuery"
          >
        </div>

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
                <th scope="col">#</th>
                <th scope="col">Gambar</th>
                <th scope="col">Nama Produk</th>
                <th scope="col">Harga</th>
                <th scope="col">Stok</th>
                <th scope="col" class="text-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="6" class="text-center">Produk tidak ditemukan.</td>
              </tr>
              <tr v-for="(product, index) in filteredProducts" :key="product.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <img 
                    :src="product.image_url || 'https://placehold.co/60x60/e0e0e0/333?text=N/A'" 
                    :alt="product.nama"
                    class="img-thumbnail"
                    style="width: 60px; height: 60px; object-fit: cover;"
                    @error="handleImageError"
                  >
                </td>
                <td>{{ product.nama }}</td>
                <td>{{ formatCurrency(product.harga) }}</td>
                <td>
                  <span :class="product.stok > 0 ? 'badge bg-success' : 'badge bg-danger'">
                    {{ product.stok }}
                  </span>
                </td>
                <td class="text-nowrap">
                  <button class="btn btn-warning btn-sm me-2" @click="openModal(product)">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" @click="confirmDelete(product.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="productModalLabel">{{ isEditMode ? 'Edit Produk' : 'Tambah Produk Baru' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6">
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
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="image" class="form-label">Gambar Produk</label>
                    <input type="file" class="form-control" id="image" @change="handleImageChange" accept="image/*">
                    <small class="text-muted">Format: JPG, PNG. Max: 2MB</small>
                  </div>
                  
                  <div class="mb-3" v-if="imagePreview || form.image_url">
                    <label class="form-label">Preview Gambar:</label>
                    <div class="text-center">
                      <img 
                        :src="imagePreview || form.image_url" 
                        alt="Preview"
                        class="img-thumbnail"
                        style="max-width: 200px; max-height: 200px; object-fit: cover;"
                      >
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Simpan') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <CustomModal 
      :show="modalState.show"
      :type="modalState.type"
      :title="modalState.title"
      :message="modalState.message"
      :status="modalState.status"
      :confirm-text="modalState.confirmText"
      @close="closeCustomModal"
      @confirm="handleModalConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import ApiService from '../services/ApiService';
import { Modal } from 'bootstrap';
import CustomModal from '../components/CustomModal.vue';

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const isEditMode = ref(false);
const isSubmitting = ref(false);
const imagePreview = ref(null);
const selectedImage = ref(null);
const searchQuery = ref('');
let productModal = null;
let productToDeleteId = null;

const form = reactive({
  id: null,
  nama: '',
  harga: 0,
  stok: 0,
  image_url: ''
});

const modalState = reactive({
  show: false,
  type: 'alert',
  title: '',
  message: '',
  status: 'primary',
  confirmText: 'OK'
});

const showCustomModal = (config) => {
  modalState.type = config.type || 'alert';
  modalState.title = config.title;
  modalState.message = config.message;
  modalState.status = config.status || 'primary';
  modalState.confirmText = config.confirmText || (modalState.type === 'confirm' ? 'Ya, Hapus' : 'OK');
  modalState.show = true;
};

const closeCustomModal = () => {
  modalState.show = false;
  productToDeleteId = null;
};

const handleModalConfirm = () => {
  if (productToDeleteId) {
    deleteProduct(productToDeleteId);
  }
  closeCustomModal();
};

const filteredProducts = computed(() => {
  if (!searchQuery.value) {
    return products.value;
  }
  return products.value.filter(product =>
    product.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
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
    Object.assign(form, product);
  } else {
    isEditMode.value = false;
    resetForm();
  }
  imagePreview.value = null;
  selectedImage.value = null;
  productModal.show();
};

const resetForm = () => {
  form.id = null;
  form.nama = '';
  form.harga = 0;
  form.stok = 0;
  form.image_url = '';
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      showCustomModal({ title: 'Error', message: 'Ukuran file terlalu besar. Maksimum 2MB.', status: 'danger' });
      event.target.value = '';
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showCustomModal({ title: 'Error', message: 'Format file harus JPG atau PNG.', status: 'danger' });
      event.target.value = '';
      return;
    }
    selectedImage.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  const formData = new FormData();
  formData.append('nama', form.nama);
  formData.append('harga', form.harga);
  formData.append('stok', form.stok);
  
  // --- PERUBAHAN DI SINI ---
  // Jika sedang mode edit dan tidak ada gambar baru, kirim URL gambar yang lama
  if (isEditMode.value && !selectedImage.value) {
    formData.append('image_url', form.image_url);
  }

  if (selectedImage.value) {
    formData.append('image', selectedImage.value);
  }
  // --- AKHIR PERUBAHAN ---

  try {
    let response;
    if (isEditMode.value) {
      // Kirim sebagai PUT request
      response = await ApiService.updateProduk(form.id, formData);
    } else {
      // Kirim sebagai POST request
      response = await ApiService.createProduk(formData);
    }
    productModal.hide();
    fetchProducts();
    showCustomModal({
      title: 'Sukses',
      message: isEditMode.value ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!',
      status: 'success'
    });
  } catch (err) {
    console.error('Gagal menyimpan produk:', err);
    showCustomModal({
        title: 'Gagal',
        message: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan produk.',
        status: 'danger'
    });
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = (id) => {
    productToDeleteId = id;
    showCustomModal({
        type: 'confirm',
        title: 'Konfirmasi Hapus',
        message: 'Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.',
        status: 'danger',
        confirmText: 'Ya, Hapus'
    });
};

const deleteProduct = async (id) => {
    try {
      await ApiService.deleteProduk(id);
      fetchProducts();
      showCustomModal({ title: 'Sukses', message: 'Produk berhasil dihapus!', status: 'success' });
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
      showCustomModal({ title: 'Gagal', message: 'Terjadi kesalahan saat menghapus produk.', status: 'danger' });
    } finally {
      productToDeleteId = null; 
    }
};

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/60x60/e0e0e0/333?text=N/A';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

onMounted(() => {
  fetchProducts();
  const modalElement = document.getElementById('productModal');
  if (modalElement) {
    productModal = new Modal(modalElement);
  }
});
</script>

<style scoped>
.img-thumbnail {
  border: 1px solid #dee2e6;
  padding: 0.25rem;
}

.badge {
  font-size: 0.9em;
  font-weight: 600;
}
</style>
