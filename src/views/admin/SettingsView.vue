<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Save } from 'lucide-vue-next';
import { useAdminStore } from '@/stores/admin.js';
import RichTextEditor from '@/components/admin/RichTextEditor.vue';
import { contentToRichHtml, sanitizeRichHtml } from '@/lib/rich-text.js';

const adminStore = useAdminStore();
const quizDuration = ref(0);
const instructionText = ref('');
const successText = ref('');
const timeoutText = ref('');
const maintenanceMode = ref(false);
const isSaving = ref(false);
const message = ref('');

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
        <label class="label-brutal" for="instruction">Isi Instruksi Tes</label>
        <RichTextEditor
          v-model="instructionText"
          editor-id="instruction"
          placeholder="Tulis instruksi tes..."
        />
      </div>

      <div class="border-t-2 border-brutal-dark pt-5">
        <label class="label-brutal" for="success">Isi Ucapan Terima Kasih</label>
        <RichTextEditor
          v-model="successText"
          editor-id="success"
          placeholder="Tulis ucapan terima kasih..."
        />
      </div>

      <div class="border-t-2 border-brutal-dark pt-5">
        <label class="label-brutal" for="timeout">Isi Ucapan Maaf</label>
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
  </div>
</template>
