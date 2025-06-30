<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-backdrop" @click.self="close">
      <div class="modal-container shadow-lg" role="dialog" aria-modal="true" :aria-labelledby="titleId" :aria-describedby="messageId">
        <header class="modal-header" :id="titleId">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="close" aria-label="Close modal"></button>
        </header>

        <section class="modal-body" :id="messageId">
          <p>{{ message }}</p>
        </section>

        <footer class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            v-if="type === 'confirm'" 
            @click="close">
            {{ cancelText }}
          </button>
          <button 
            type="button" 
            class="btn"
            :class="confirmButtonClass"
            @click="confirmAction">
            {{ confirmText }}
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    default: 'alert', // 'alert' or 'confirm'
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: 'OK',
  },
  cancelText: {
    type: String,
    default: 'Batal',
  },
  status: {
    type: String,
    default: 'primary' // 'primary', 'danger', 'success'
  }
});

const emit = defineEmits(['confirm', 'close']);

const titleId = computed(() => `modal-title-${Date.now()}`);
const messageId = computed(() => `modal-message-${Date.now()}`);

const confirmButtonClass = computed(() => {
    switch(props.status) {
        case 'danger': return 'btn-danger';
        case 'success': return 'btn-success';
        default: return 'btn-primary';
    }
});

function confirmAction() {
  emit('confirm');
  emit('close'); // Tutup modal setelah konfirmasi
}

function close() {
  emit('close');
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* Pastikan di atas elemen lain */
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.modal-body {
  padding: 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
}

/* Transisi Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>