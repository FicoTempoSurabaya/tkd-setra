<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CheckCircle, AlertCircle, MessageCircle } from '@lucide/vue';
import { participantApi } from '@/lib/api.js';
import { personalizeRichHtml } from '@/lib/rich-text.js';

const route = useRoute();
const router = useRouter();
const publicToken = computed(() => route.params.publicToken as string);

const contentHtml = ref('');
const isTimeout = ref(false);
const adminWhatsapp = ref('');
const isLoading = ref(true);
const isSendingProof = ref(false);
const error = ref('');

async function handleSendProof() {
  if (isSendingProof.value) return;
  isSendingProof.value = true;
  error.value = '';
  const message = isTimeout.value
    ? `Mohon Ma'af, waktu tes telah habis. Bukti Time Out.`
    : `Terima Kasih, tes telah berhasil diselesaikan. Bukti Penyelesaian.`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${adminWhatsapp.value}?text=${encodedMessage}`, '_blank');

  try {
    await participantApi.sendProof(publicToken.value);
    await router.replace('/');
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal menonaktifkan tautan tes';
    isSendingProof.value = false;
  }
}

onMounted(async () => {
  try {
    const res = await participantApi.getFinish(publicToken.value);
    if (res.data) {
      contentHtml.value = personalizeRichHtml(res.data.content, res.data.participant);
      isTimeout.value = res.data.isTimeout;
      adminWhatsapp.value = res.data.adminWhatsapp;
    }
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal memuat data';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card-brutal max-w-md w-full text-center animate-fade-in">
      <div v-if="isLoading" class="py-8">
        <p class="text-lg">Memuat...</p>
      </div>

      <div v-else>
        <div
          class="w-20 h-20 mx-auto mb-4 border-[3px] border-brutal-dark flex items-center justify-center"
          :class="isTimeout ? 'bg-brutal-danger' : 'bg-brutal-success'"
          style="box-shadow: 4px 4px 0px 0px #1a1a1a"
        >
          <AlertCircle v-if="isTimeout" :size="36" color="white" />
          <CheckCircle v-else :size="36" color="white" />
        </div>

        <div class="rich-content text-lg mb-6">
          <div v-if="contentHtml" v-html="contentHtml"></div>
          <p v-else>{{ isTimeout ? 'Maaf, waktu tes telah habis.' : 'Terima kasih telah menyelesaikan tes.' }}</p>
        </div>

        <button class="btn-brutal btn-brutal-success w-full" :disabled="isSendingProof" @click="handleSendProof">
          <MessageCircle :size="20" />
          {{ isSendingProof ? 'Mengirim...' : 'Kirim Bukti Tes ke Admin' }}
        </button>
      </div>

      <p v-if="error" class="error-text mt-4">{{ error }}</p>
    </div>
  </div>
</template>
