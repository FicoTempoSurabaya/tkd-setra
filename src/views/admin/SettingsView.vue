<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Eye, Save, X } from 'lucide-vue-next';
import { useAdminStore } from '@/stores/admin.js';
import RichTextEditor from '@/components/admin/RichTextEditor.vue';
import { contentToRichHtml, personalizeRichHtml, sanitizeRichHtml } from '@/lib/rich-text.js';

const adminStore = useAdminStore();
const quizDuration = ref(0);
const instructionText = ref('');
const successText = ref('');
const timeoutText = ref('');
const maintenanceMode = ref(false);
const isSaving = ref(false);
const message = ref('');

// ===== Preview Peserta =====
const previewTitle = ref('');
const previewHtml = ref('');
const previewIsTimeout = ref(false);
const showPreview = ref(false);

// Contoh data participant untuk mengganti tag biodata pada preview.
const SAMPLE_PARTICIPANT = {
  fullName: 'Budi Santoso',
  birthPlace: 'Bandung',
  birthDate: '1998-05-12T00:00:00.000Z',
  nik: '3201234567890001',
  address: 'Jl. Merdeka No. 10, Bandung',
  whatsapp: '6281234567890',
  email: 'budi.santoso@example.com',
};

function openPreview(title: string, content: string, isTimeout = false) {
  previewTitle.value = title;
  previewIsTimeout.value = isTimeout;
  previewHtml.value = personalizeRichHtml(content, SAMPLE_PARTICIPANT);
  showPreview.value = true;
}

function closePreview() {
  showPreview.value = false;
}

function buildRichContent(html: string) {
  return { type: 'html', html: sanitizeRichHtml(html) };
}

async function handleSave() {
  isSaving.value = true;
  message.value = '';
  try {
    await adminStore.updateSetting({
      quizDuration: quizDuration.value,
      instructionContent: buildRichContent(instructionText.value),
      successContent: buildRichContent(successText.value),
      timeoutContent: buildRichContent(timeoutText.value),
      maintenanceMode: maintenanceMode.value,
    });
    message.value = 'Pengaturan berhasil disimpan';
  } catch (e: unknown) {
    message.value = (e as { message?: string }).message ?? 'Gagal menyimpan';
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  await adminStore.loadSetting();
  if (adminStore.setting) {
    quizDuration.value = adminStore.setting.quizDuration;
    instructionText.value = contentToRichHtml(adminStore.setting.instructionContent);
    successText.value = contentToRichHtml(adminStore.setting.successContent);
    timeoutText.value = contentToRichHtml(adminStore.setting.timeoutContent);
    maintenanceMode.value = adminStore.setting.maintenanceMode;
  }
});
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-black mb-6">Settings</h2>

    <div class="card-brutal space-y-4">
      <div>
        <label class="label-brutal" for="quizDuration">Durasi Tes (detik)</label>
        <input
          id="quizDuration"
          v-model.number="quizDuration"
          type="number"
          min="1"
          class="input-brutal"
        />
      </div>

      <div class="border-t-2 border-brutal-dark pt-5">
        <div class="flex items-center justify-between mb-2">
          <label class="label-brutal mb-0" for="instruction">Isi Instruksi Tes</label>
          <button
            class="btn-brutal !py-1 !px-3 !text-xs"
            title="Lihat tampilan peserta"
            @click="openPreview('Instruksi Tes', instructionText)"
          >
            <Eye :size="14" />
            Preview
          </button>
        </div>
        <RichTextEditor
          v-model="instructionText"
          editor-id="instruction"
          placeholder="Tulis instruksi tes..."
        />
      </div>

      <div class="border-t-2 border-brutal-dark pt-5">
        <div class="flex items-center justify-between mb-2">
          <label class="label-brutal mb-0" for="success">Isi Ucapan Terima Kasih</label>
          <button
            class="btn-brutal !py-1 !px-3 !text-xs"
            title="Lihat tampilan peserta"
            @click="openPreview('Ucapan Terima Kasih', successText)"
          >
            <Eye :size="14" />
            Preview
          </button>
        </div>
        <RichTextEditor
          v-model="successText"
          editor-id="success"
          placeholder="Tulis ucapan terima kasih..."
        />
      </div>

      <div class="border-t-2 border-brutal-dark pt-5">
        <div class="flex items-center justify-between mb-2">
          <label class="label-brutal mb-0" for="timeout">Isi Ucapan Maaf</label>
          <button
            class="btn-brutal !py-1 !px-3 !text-xs"
            title="Lihat tampilan peserta"
            @click="openPreview('Ucapan Maaf', timeoutText, true)"
          >
            <Eye :size="14" />
            Preview
          </button>
        </div>
        <RichTextEditor
          v-model="timeoutText"
          editor-id="timeout"
          placeholder="Tulis ucapan maaf..."
        />
      </div>

      <p class="text-xs text-gray-600 -mt-2">
        Pilih <strong>Tag Biodata</strong> pada toolbar untuk menyisipkan data participant di posisi kursor.
      </p>

      <div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="maintenanceMode"
            type="checkbox"
            class="w-6 h-6 border-[3px] border-brutal-dark"
          />
          <span class="font-bold">Status Maintenance</span>
        </label>
      </div>

      <p v-if="message" :class="message.includes('berhasil') ? 'text-brutal-success' : 'error-text'">
        {{ message }}
      </p>

      <button
        class="btn-brutal btn-brutal-primary w-full"
        :disabled="isSaving"
        @click="handleSave"
      >
        <Save :size="18" />
        {{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
      </button>
    </div>

    <!-- Modal Preview Peserta -->
    <div
      v-if="showPreview"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="closePreview"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b-4 border-black sticky top-0 bg-white">
          <h3 class="text-lg font-black">Preview Peserta: {{ previewTitle }}</h3>
          <button class="btn-brutal !py-1 !px-2" @click="closePreview">
            <X :size="16" />
          </button>
        </div>

        <!-- Body: tampilan seperti yang diterima participant -->
        <div class="p-6">
          <div
            class="w-20 h-20 mx-auto mb-4 border-[3px] border-brutal-dark flex items-center justify-center"
            :class="previewIsTimeout ? 'bg-brutal-danger' : 'bg-brutal-success'"
            style="box-shadow: 4px 4px 0px 0px #1a1a1a"
          >
            <span class="text-white text-3xl font-black">{{ previewIsTimeout ? '!' : '✓' }}</span>
          </div>

          <div class="rich-content text-lg text-center">
            <div v-if="previewHtml" v-html="previewHtml"></div>
            <p v-else>
              {{ previewIsTimeout ? 'Maaf, waktu tes telah habis.' : 'Terima kasih telah menyelesaikan tes.' }}
            </p>
          </div>

          <p class="text-xs text-gray-500 text-center mt-4">
            Tag biodata ditampilkan dengan contoh data (Budi Santoso).
          </p>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 p-6 border-t-4 border-black sticky bottom-0 bg-white">
          <button class="btn-brutal !py-2 !px-6" @click="closePreview">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>
