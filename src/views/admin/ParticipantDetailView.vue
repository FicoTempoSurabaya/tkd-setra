<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import { useAdminStore } from '@/stores/admin.js';
import { formatDateId, formatDuration } from '@tkd-setra/shared';
import type { ParticipantDetail } from '@tkd-setra/shared';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const detail = ref<ParticipantDetail | null>(null);
const isLoading = ref(true);
const error = ref('');

const participantId = computed(() => route.params.id as string);

onMounted(async () => {
  try {
    const data = await adminStore.loadParticipantDetail(participantId.value);
    detail.value = data ?? null;
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal memuat data';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <button class="btn-brutal mb-6" @click="router.push('/admin/dashboard/participants')">
      <ArrowLeft :size="18" />
      Kembali
    </button>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-lg">Memuat...</p>
    </div>

    <div v-else-if="error" class="error-text">{{ error }}</div>

    <div v-else-if="detail" class="space-y-6">
      <div class="card-brutal">
        <h2 class="text-xl font-black mb-4">Biodata</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Nama Lengkap</p>
            <p class="font-bold">{{ detail.biodata.fullName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">NIK</p>
            <p class="font-bold">{{ detail.biodata.nik }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Tempat Lahir</p>
            <p class="font-bold">{{ detail.biodata.birthPlace }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Tanggal Lahir</p>
            <p class="font-bold">{{ formatDateId(detail.biodata.birthDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">WhatsApp</p>
            <p class="font-bold">{{ detail.biodata.whatsapp }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Email</p>
            <p class="font-bold">{{ detail.biodata.email }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-sm text-gray-600">Alamat</p>
            <p class="font-bold">{{ detail.biodata.address }}</p>
          </div>
        </div>
      </div>

      <div class="card-brutal">
        <h2 class="text-xl font-black mb-4">Hasil Quiz</h2>
        <div v-if="detail.quizAnswers.length === 0" class="text-gray-500">
          Belum ada jawaban quiz
        </div>
        <div v-else class="overflow-x-auto">
          <table class="table-brutal">
            <thead>
              <tr>
                <th>No</th>
                <th>Pertanyaan</th>
                <th>Tipe</th>
                <th>Jawaban Dipilih</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(a, i) in detail.quizAnswers" :key="i">
                <td>{{ a.questionOrder }}</td>
                <td>{{ a.questionText }}</td>
                <td>{{ a.questionType }}</td>
                <td>
                  <img
                    v-if="a.selectedOptionImageUrl"
                    :src="a.selectedOptionImageUrl"
                    alt="Answer"
                    class="w-16 h-16 object-cover border-2 border-brutal-dark"
                  />
                  <span v-else>{{ a.selectedOptionText ?? '-' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-brutal">
        <h2 class="text-xl font-black mb-4">Hasil Game</h2>
        <div v-if="detail.gameResults.length === 0" class="text-gray-500">
          Belum ada hasil game
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="(g, i) in detail.gameResults"
            :key="i"
            class="border-2 border-brutal-dark p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold">{{ g.gameTitle }}</span>
              <span
                class="badge-brutal"
                :class="g.status === 'Selesai' ? 'badge-brutal-success' : 'badge-brutal-danger'"
              >
                {{ g.status }}
              </span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <p class="text-gray-600">Tipe</p>
                <p class="font-bold">{{ g.gameType }}</p>
              </div>
              <div>
                <p class="text-gray-600">Durasi</p>
                <p class="font-bold">{{ formatDuration(g.duration) }}</p>
              </div>
              <div v-if="g.totalSteps !== null">
                <p class="text-gray-600">Jumlah Langkah</p>
                <p class="font-bold">{{ g.totalSteps }}</p>
              </div>
              <div v-if="g.totalFoundWords !== null">
                <p class="text-gray-600">Kata Ditemukan</p>
                <p class="font-bold">{{ g.totalFoundWords }}</p>
              </div>
            </div>
            <div v-if="g.foundWords.length > 0" class="mt-2">
              <p class="text-sm text-gray-600">Daftar kata:</p>
              <p class="font-bold">{{ g.foundWords.join(', ') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>