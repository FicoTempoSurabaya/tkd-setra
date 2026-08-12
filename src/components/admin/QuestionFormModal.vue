<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { X, Plus, Eye } from 'lucide-vue-next';
import { QUIZ_QUESTION_TYPES } from '@/lib/shared.js';
import { useAdminStore } from '@/stores/admin.js';
import PreviewModal from '@/components/admin/PreviewModal.vue';

defineProps<{ show: boolean }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const adminStore = useAdminStore();
const submitting = ref(false);
const error = ref('');
const showPreview = ref(false);

// ============================================================
// Form State
// ============================================================
const form = reactive({
  questionType: 'Single Choice Question' as string,

  // Teks Pertanyaan / Teks Pernyataan
  questionText: '',

  // URL Gambar (for Image Based Question)
  imageUrl: '',

  // Text options (for Single Choice, Image Based Question)
  textOptions: ['', '', '', ''] as string[],

  // Image options (for Image Based Answer)
  imageOptions: [
    { imageUrl: '', label: '' },
    { imageUrl: '', label: '' },
    { imageUrl: '', label: '' },
    { imageUrl: '', label: '' },
  ] as { imageUrl: string; label: string }[],

  // Scale options (for Likert Scale)
  scaleOptions: ['', ''] as string[],

  // Semantic Differential Scale
  scaleStart: '',
  scaleEnd: '',
  scaleCount: 5,
});

// ============================================================
// Computed: Field Visibility
// ============================================================
const showQuestionTextField = computed(() => {
  return ['Single Choice Question', 'Yes/No Question', 'Image Based Answer'].includes(form.questionType);
});

const showQuestionTextFieldOptional = computed(() => {
  return form.questionType === 'Image Based Question';
});

const showPernyataanField = computed(() => {
  return ['Likert Scale', 'Semantic Differential Scale'].includes(form.questionType);
});

const showImageUrlField = computed(() => {
  return form.questionType === 'Image Based Question';
});

const showTextOptions = computed(() => {
  return ['Single Choice Question', 'Image Based Question'].includes(form.questionType);
});

const showImageOptions = computed(() => {
  return form.questionType === 'Image Based Answer';
});

const showYesNoOptions = computed(() => {
  return form.questionType === 'Yes/No Question';
});

const showScaleOptions = computed(() => {
  return form.questionType === 'Likert Scale';
});

const showSemanticOptions = computed(() => {
  return form.questionType === 'Semantic Differential Scale';
});

const isTextOptionsLocked = computed(() => {
  return form.questionType === 'Single Choice Question';
});

// ============================================================
// Computed: Image Preview
// ============================================================
const isValidImageUrl = (url: string) => {
  if (!url || !url.trim()) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const imagePreviewUrl = computed(() => {
  if (isValidImageUrl(form.imageUrl)) return form.imageUrl;
  return null;
});

function imageOptionPreview(index: number) {
  const url = form.imageOptions[index]?.imageUrl;
  if (isValidImageUrl(url)) return url;
  return null;
}

// ============================================================
// Form Actions
// ============================================================
function resetForm() {
  form.questionType = 'Single Choice Question';
  form.questionText = '';
  form.imageUrl = '';
  form.textOptions = ['', '', '', ''];
  form.imageOptions = [
    { imageUrl: '', label: '' },
    { imageUrl: '', label: '' },
    { imageUrl: '', label: '' },
    { imageUrl: '', label: '' },
  ];
  form.scaleOptions = ['', ''];
  form.scaleStart = '';
  form.scaleEnd = '';
  form.scaleCount = 5;
  error.value = '';
  showPreview.value = false;
}

function handleClose() {
  resetForm();
  emit('close');
}

function addScaleOption() {
  if (form.scaleOptions.length < 6) {
    form.scaleOptions.push('');
  }
}

function removeScaleOption(index: number) {
  if (form.scaleOptions.length > 2) {
    form.scaleOptions.splice(index, 1);
  }
}

function addTextOption() {
  if (form.textOptions.length < 4) {
    form.textOptions.push('');
  }
}

function removeTextOption(index: number) {
  if (form.textOptions.length > 1) {
    form.textOptions.splice(index, 1);
  }
}

// ============================================================
// Validation
// ============================================================
function validate(): string | null {
  switch (form.questionType) {
    case 'Single Choice Question':
      if (!form.questionText.trim()) return 'Teks pertanyaan wajib diisi.';
      if (form.textOptions.length !== 4) return 'Harus memiliki 4 pilihan jawaban.';
      for (let i = 0; i < form.textOptions.length; i++) {
        if (!form.textOptions[i].trim()) return `Pilihan ${i + 1} wajib diisi.`;
      }
      break;

    case 'Yes/No Question':
      if (!form.questionText.trim()) return 'Teks pertanyaan wajib diisi.';
      break;

    case 'Image Based Question':
      if (!form.imageUrl.trim()) return 'Gambar pertanyaan wajib diisi.';
      if (!isValidImageUrl(form.imageUrl)) return 'URL gambar tidak valid.';
      if (form.textOptions.length !== 4) return 'Harus memiliki 4 pilihan jawaban.';
      for (let i = 0; i < form.textOptions.length; i++) {
        if (!form.textOptions[i].trim()) return `Pilihan ${i + 1} wajib diisi.`;
      }
      break;

    case 'Image Based Answer':
      if (!form.questionText.trim()) return 'Teks pertanyaan wajib diisi.';
      for (let i = 0; i < form.imageOptions.length; i++) {
        if (!form.imageOptions[i].imageUrl.trim()) return `URL gambar untuk pilihan ${i + 1} wajib diisi.`;
        if (!isValidImageUrl(form.imageOptions[i].imageUrl)) return `URL gambar pilihan ${i + 1} tidak valid.`;
      }
      break;

    case 'Likert Scale':
      if (!form.questionText.trim()) return 'Teks pernyataan wajib diisi.';
      if (form.scaleOptions.length < 2 || form.scaleOptions.length > 6)
        return 'Jumlah skala harus antara 2-6.';
      for (let i = 0; i < form.scaleOptions.length; i++) {
        if (!form.scaleOptions[i].trim()) return `Skala ${i + 1} wajib diisi.`;
      }
      break;

    case 'Semantic Differential Scale':
      if (!form.questionText.trim()) return 'Teks pernyataan wajib diisi.';
      if (form.scaleCount < 2 || form.scaleCount > 6) return 'Jumlah skala harus antara 2-6.';
      if (!form.scaleStart.trim()) return 'Teks skala awal wajib diisi.';
      if (!form.scaleEnd.trim()) return 'Teks skala akhir wajib diisi.';
      break;
  }
  return null;
}

// ============================================================
// Build API Payload
// ============================================================
function buildPayload() {
  const base = {
    questionType: form.questionType as (typeof QUIZ_QUESTION_TYPES)[number],
    questionText: '',
    imageUrl: null as string | null,
    options: [] as { optionText?: string | null; imageUrl?: string | null; optionOrder: number }[],
  };

  switch (form.questionType) {
    case 'Single Choice Question':
      base.questionText = form.questionText.trim();
      base.options = form.textOptions.map((t, i) => ({
        optionText: t.trim(),
        optionOrder: i + 1,
      }));
      break;

    case 'Yes/No Question':
      base.questionText = form.questionText.trim();
      base.options = [
        { optionText: 'Benar', optionOrder: 1 },
        { optionText: 'Salah', optionOrder: 2 },
      ];
      break;

    case 'Image Based Question':
      base.questionText = form.questionText.trim() || '';
      base.imageUrl = form.imageUrl.trim();
      base.options = form.textOptions.map((t, i) => ({
        optionText: t.trim(),
        optionOrder: i + 1,
      }));
      break;

    case 'Image Based Answer':
      base.questionText = form.questionText.trim();
      base.options = form.imageOptions.map((o, i) => ({
        imageUrl: o.imageUrl.trim(),
        optionText: o.label.trim() || null,
        optionOrder: i + 1,
      }));
      break;

    case 'Likert Scale':
      base.questionText = form.questionText.trim();
      base.options = form.scaleOptions.map((s, i) => ({
        optionText: s.trim(),
        optionOrder: i + 1,
      }));
      break;

    case 'Semantic Differential Scale':
      base.questionText = form.questionText.trim();
      base.options = [];
      for (let i = 0; i < form.scaleCount; i++) {
        if (i === 0) {
          base.options.push({ optionText: form.scaleStart.trim(), optionOrder: i + 1 });
        } else if (i === form.scaleCount - 1) {
          base.options.push({ optionText: form.scaleEnd.trim(), optionOrder: i + 1 });
        } else {
          base.options.push({ optionText: null, optionOrder: i + 1 });
        }
      }
      break;
  }

  return base;
}

// ============================================================
// Submit
// ============================================================
async function handleSave() {
  error.value = '';
  const validationError = validate();
  if (validationError) {
    error.value = validationError;
    return;
  }

  submitting.value = true;
  try {
    await adminStore.createQuestion(buildPayload());
    resetForm();
    emit('saved');
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal menyimpan pertanyaan.';
  } finally {
    submitting.value = false;
  }
}

// ============================================================
// Watch: Reset form fields when type changes
// ============================================================
watch(
  () => form.questionType,
  () => {
    error.value = '';
    showPreview.value = false;
    // Set default options based on type
    if (showTextOptions.value) {
      form.textOptions = ['', '', '', ''];
    }
    if (showScaleOptions.value) {
      form.scaleOptions = ['', ''];
    }
  }
);

</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="handleClose"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b-4 border-black">
        <h3 class="text-lg font-black">Tambah Pertanyaan</h3>
        <button class="btn-brutal !py-1 !px-2" @click="handleClose">
          <X :size="16" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-4">
        <!-- Error -->
        <div
          v-if="error"
          class="bg-red-100 border-2 border-red-500 text-red-700 p-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <!-- Question Type -->
        <div>
          <label class="label-brutal">Tipe Pertanyaan</label>
          <select v-model="form.questionType" class="input-brutal">
            <option v-for="t in QUIZ_QUESTION_TYPES" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <!-- Teks Pertanyaan (required) - Single Choice, Yes/No, Image Based Answer -->
        <div v-if="showQuestionTextField">
          <label class="label-brutal">Teks Pertanyaan <span class="text-red-500">*</span></label>
          <textarea
            v-model="form.questionText"
            class="input-brutal min-h-[80px]"
            placeholder="Masukkan teks pertanyaan..."
          ></textarea>
        </div>

        <!-- Teks Pertanyaan (optional) - Image Based Question -->
        <div v-if="showQuestionTextFieldOptional">
          <label class="label-brutal"
            >Teks Pertanyaan <span class="text-gray-400 font-normal">(opsional)</span></label
          >
          <textarea
            v-model="form.questionText"
            class="input-brutal min-h-[80px]"
            placeholder="Masukkan teks pertanyaan (opsional)..."
          ></textarea>
        </div>

        <!-- Teks Pernyataan - Likert Scale & Semantic Differential -->
        <div v-if="showPernyataanField">
          <label class="label-brutal">Teks Pernyataan <span class="text-red-500">*</span></label>
          <textarea
            v-model="form.questionText"
            class="input-brutal min-h-[80px]"
            placeholder="Masukkan teks pernyataan..."
          ></textarea>
        </div>

        <!-- URL Gambar - Image Based Question -->
        <div v-if="showImageUrlField">
          <label class="label-brutal">Gambar Pertanyaan <span class="text-red-500">*</span></label>
          <input
            v-model="form.imageUrl"
            type="text"
            class="input-brutal"
            placeholder="https://example.com/gambar.jpg"
          />
          <div
            v-if="imagePreviewUrl"
            class="mt-3 w-full max-w-md mx-auto border-2 border-black rounded-lg overflow-hidden"
          >
            <img
              :src="imagePreviewUrl"
              alt="Preview Gambar Pertanyaan"
              class="w-full h-auto max-h-64 object-contain"
            />
          </div>
          <p v-else-if="form.imageUrl" class="error-text mt-1">URL gambar tidak valid</p>
        </div>

        <!-- Text Options (4 locked) - Single Choice Question -->
        <div v-if="showTextOptions">
          <div class="flex items-center justify-between mb-2">
            <label class="label-brutal mb-0"
              >Pilihan Jawaban <span class="text-red-500">*</span></label
            >
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500"
                >{{ form.textOptions.filter((o) => o.trim()).length }}/4</span
              >
              <button
                v-if="!isTextOptionsLocked && form.textOptions.length < 4"
                class="text-sm text-blue-600 font-bold hover:underline"
                @click="addTextOption"
              >
                <Plus :size="14" class="inline" /> Tambah
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="i in form.textOptions.length"
              :key="i"
              class="flex gap-2 items-center"
            >
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-brutal-primary text-white text-xs font-bold flex items-center justify-center"
              >
                {{ String.fromCharCode(65 + i - 1) }}
              </span>
              <input
                v-model="form.textOptions[i - 1]"
                type="text"
                class="input-brutal flex-1"
                :placeholder="`Pilihan ${String.fromCharCode(65 + i - 1)}`"
              />
              <button
                v-if="!isTextOptionsLocked && form.textOptions.length > 1"
                class="btn-brutal !py-2 !px-2 text-red-500"
                @click="removeTextOption(i - 1)"
              >
                <X :size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- Yes/No Options (fixed) -->
        <div v-if="showYesNoOptions">
          <label class="label-brutal">Pilihan Jawaban</label>
          <div class="space-y-2">
            <div class="flex gap-2 items-center">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center"
              >
                ✓
              </span>
              <input
                type="text"
                class="input-brutal flex-1 bg-gray-100 text-gray-600"
                :value="'Iya'"
                disabled
              />
            </div>
            <div class="flex gap-2 items-center">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
              >
                ✗
              </span>
              <input
                type="text"
                class="input-brutal flex-1 bg-gray-100 text-gray-600"
                :value="'Tidak'"
                disabled
              />
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">Opsi tidak dapat diubah untuk tipe Yes/No.</p>
        </div>

        <!-- Image Options (4) - Image Based Answer -->
        <div v-if="showImageOptions">
          <div class="flex items-center justify-between mb-2">
            <label class="label-brutal mb-0"
              >Pilihan Jawaban (Gambar) <span class="text-red-500">*</span></label
            >
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="(opt, i) in form.imageOptions"
              :key="i"
              class="border-2 border-black rounded-lg p-3 space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold"
                  >Pilihan {{ String.fromCharCode(65 + i) }}</span
                >
              </div>
              <input
                v-model="opt.imageUrl"
                type="text"
                class="input-brutal text-sm"
                placeholder="URL gambar..."
              />
              <div
                v-if="imageOptionPreview(i)"
                class="w-full aspect-video border-2 border-black rounded overflow-hidden bg-gray-100"
              >
                <img
                  :src="imageOptionPreview(i)!"
                  :alt="`Pilihan ${String.fromCharCode(65 + i)}`"
                  class="w-full h-full object-contain"
                />
              </div>
              <div v-else-if="form.imageOptions[i].imageUrl" class="text-xs text-red-500">
                URL tidak valid
              </div>
              <input
                v-model="opt.label"
                type="text"
                class="input-brutal text-sm"
                placeholder="Label (opsional)"
              />
            </div>
          </div>
        </div>

        <!-- Scale Options - Likert Scale -->
        <div v-if="showScaleOptions">
          <div class="flex items-center justify-between mb-2">
            <label class="label-brutal mb-0"
              >Opsi Skala <span class="text-red-500">*</span></label
            >
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500"
                >{{ form.scaleOptions.length }} (min 2, maks 6)</span
              >
              <button
                v-if="form.scaleOptions.length < 6"
                class="text-sm text-blue-600 font-bold hover:underline"
                @click="addScaleOption"
              >
                <Plus :size="14" class="inline" /> Tambah Skala
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="i in form.scaleOptions.length"
              :key="i"
              class="flex gap-2 items-center"
            >
              <span
                class="flex-shrink-0 w-8 h-8 rounded-lg bg-brutal-primary text-white text-xs font-bold flex items-center justify-center"
              >
                {{ i }}
              </span>
              <input
                v-model="form.scaleOptions[i - 1]"
                type="text"
                class="input-brutal flex-1"
                :placeholder="`Skala ${i}`"
              />
              <button
                v-if="form.scaleOptions.length > 2"
                class="btn-brutal !py-2 !px-2 text-red-500"
                @click="removeScaleOption(i - 1)"
              >
                <X :size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- Semantic Differential Scale -->
        <div v-if="showSemanticOptions">
          <div class="space-y-3">
            <div>
              <label class="label-brutal"
                >Jumlah Skala <span class="text-red-500">*</span></label
              >
              <div class="flex items-center gap-3">
                <input
                  v-model.number="form.scaleCount"
                  type="range"
                  min="2"
                  max="6"
                  class="flex-1 accent-brutal-primary"
                />
                <span class="text-lg font-bold min-w-[2rem] text-center">{{
                  form.scaleCount
                }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Minimum 2, maksimum 6 skala.
              </p>
            </div>
            <div>
              <label class="label-brutal">Teks Skala Awal <span class="text-red-500">*</span></label>
              <input
                v-model="form.scaleStart"
                type="text"
                class="input-brutal"
                placeholder="Contoh: Panas"
              />
            </div>
            <div>
              <label class="label-brutal">Teks Skala Akhir <span class="text-red-500">*</span></label>
              <input
                v-model="form.scaleEnd"
                type="text"
                class="input-brutal"
                placeholder="Contoh: Dingin"
              />
            </div>
            <div class="bg-gray-50 border-2 border-black rounded-lg p-4">
              <p class="text-sm font-bold mb-2">Preview Skala:</p>
              <div class="flex items-center justify-between gap-1">
                <span class="text-sm font-bold text-brutal-primary">{{ form.scaleStart || '...' }}</span>
                <div class="flex-1 flex items-center justify-center gap-1">
                  <template v-for="_ in form.scaleCount - 2" :key="_">
                    <span class="w-4 h-4 rounded-full border-2 border-gray-300 bg-white"></span>
                  </template>
                </div>
                <span class="text-sm font-bold text-brutal-primary">{{ form.scaleEnd || '...' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 p-6 border-t-4 border-black">
        <button
          class="btn-brutal !py-2 !px-6"
          @click="showPreview = true"
        >
          <Eye :size="16" />
          Preview
        </button>
        <button class="btn-brutal !py-2 !px-6" @click="handleClose">Batal</button>
        <button
          class="btn-brutal btn-brutal-primary !py-2 !px-6"
          :disabled="submitting"
          @click="handleSave"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>

      <PreviewModal
        :show="showPreview"
        :question-type="form.questionType"
        :question-text="form.questionText"
        :image-url="form.imageUrl"
        :text-options="form.textOptions"
        :image-options="form.imageOptions"
        :scale-options="form.scaleOptions"
        :scale-start="form.scaleStart"
        :scale-end="form.scaleEnd"
        :scale-count="form.scaleCount"
        :game-data="null"
        @close="showPreview = false"
      />
    </div>
  </div>
</template>
