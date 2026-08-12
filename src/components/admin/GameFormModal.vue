<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { X, Plus, Eye } from 'lucide-vue-next';
import { GAME_TYPES, type SnapshotGame } from '@/lib/shared.js';
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
  gameType: 'Image Sliding Puzzle' as string,
  title: '',
  imageUrl: '',
  duration: 180,
  searchWordItems: [''] as string[],
});

// ============================================================
// Computed: Field Visibility
// ============================================================
const isSlidingPuzzle = computed(() => form.gameType === 'Image Sliding Puzzle');
const isSearchWord = computed(() => form.gameType === 'Search Word');

const showImageUrlField = computed(() => isSlidingPuzzle.value);
const showSearchWordsField = computed(() => isSearchWord.value);

// ============================================================
// Image Preview
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

// ============================================================
// Form Actions
// ============================================================
function resetForm() {
  form.gameType = 'Image Sliding Puzzle';
  form.title = '';
  form.imageUrl = '';
  form.duration = 180;
  form.searchWordItems = [''];
  error.value = '';
  showPreview.value = false;
}

function handleClose() {
  resetForm();
  emit('close');
}

function addSearchWord() {
  if (form.searchWordItems.length < 9) {
    form.searchWordItems.push('');
  }
}

function removeSearchWord(index: number) {
  if (form.searchWordItems.length > 1) {
    form.searchWordItems.splice(index, 1);
  }
}

// ============================================================
// Validation
// ============================================================
function validate(): string | null {
  if (!form.duration || form.duration <= 0) {
    return 'Durasi harus lebih besar dari 0.';
  }

  switch (form.gameType) {
    case 'Image Sliding Puzzle':
      if (!form.imageUrl.trim()) return 'URL gambar wajib diisi.';
      if (!isValidImageUrl(form.imageUrl)) return 'URL gambar tidak valid.';
      break;

    case 'Search Word':
      const validWords = form.searchWordItems.filter((w) => w.trim());
      if (validWords.length === 0) return 'Minimal 1 kata harus diisi.';
      for (let i = 0; i < form.searchWordItems.length; i++) {
        if (form.searchWordItems[i].trim() && !/^[A-Za-z]+$/.test(form.searchWordItems[i].trim())) {
          return `Kata ${i + 1} hanya boleh huruf.`;
        }
        if (form.searchWordItems[i].trim().length > 10) {
          return `Kata ${i + 1} maksimal 10 huruf.`;
        }
      }
      break;
  }

  return null;
}

// ============================================================
// Build API Payload
// ============================================================
function buildPayload() {
  const base: {
    gameType: (typeof GAME_TYPES)[number];
    title: string;
    imageUrl: string | null;
    duration: number;
    searchWordItems?: { word: string }[];
  } = {
    gameType: form.gameType as (typeof GAME_TYPES)[number],
    title: '',
    imageUrl: null,
    duration: form.duration,
  };

  switch (form.gameType) {
    case 'Image Sliding Puzzle':
      base.title = '';
      base.imageUrl = form.imageUrl.trim();
      break;

    case 'Search Word':
      base.title = '';
      base.searchWordItems = form.searchWordItems
        .filter((w) => w.trim())
        .map((w) => ({ word: w.trim().toUpperCase() }));
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
    await adminStore.createGame(buildPayload());
    resetForm();
    emit('saved');
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal menyimpan game.';
  } finally {
    submitting.value = false;
  }
}

const previewGame = computed<SnapshotGame>(() => ({
  gameId: 'preview-game',
  gameType: form.gameType as SnapshotGame['gameType'],
  gameOrder: 1,
  title: form.title.trim() || form.gameType,
  imageUrl: isValidImageUrl(form.imageUrl) ? form.imageUrl.trim() : null,
  duration: Math.max(form.duration || 180, 1),
  searchWordItems: form.searchWordItems
    .filter((word) => word.trim())
    .map((word, index) => ({
      word: word.trim().toUpperCase(),
      searchWordItemId: `preview-word-${index}`,
    })),
}));
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
        <h3 class="text-lg font-black">Tambah Game</h3>
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

        <!-- Game Type -->
        <div>
          <label class="label-brutal">Tipe Game</label>
          <select v-model="form.gameType" class="input-brutal">
            <option v-for="t in GAME_TYPES" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <!-- Image Sliding Puzzle: Image URL -->
        <div v-if="showImageUrlField">
          <label class="label-brutal">Gambar <span class="text-red-500">*</span></label>
          <input
            v-model="form.imageUrl"
            type="text"
            class="input-brutal"
            placeholder="https://example.com/gambar.jpg"
          />
          <div
            v-if="imagePreviewUrl"
            class="mt-4 w-full max-w-xl mx-auto border-2 border-black rounded-lg overflow-hidden bg-gray-50"
          >
            <img
              :src="imagePreviewUrl"
              alt="Preview Gambar"
              class="w-full h-auto max-h-96 object-contain"
            />
          </div>
          <p v-else-if="form.imageUrl" class="error-text mt-1">URL gambar tidak valid</p>
          <p v-else class="text-xs text-gray-500 mt-1">
            Masukkan URL gambar untuk puzzle. Gambar akan ditampilkan sebagai preview.
          </p>
        </div>

        <!-- Search Word: Word Inputs -->
        <div v-if="showSearchWordsField">
          <div class="flex items-center justify-between mb-2">
            <label class="label-brutal mb-0"
              >Kata-Kata <span class="text-red-500">*</span></label
            >
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500"
                >{{ form.searchWordItems.filter((w) => w.trim()).length }}/9</span
              >
              <button
                v-if="form.searchWordItems.length < 9"
                class="text-sm text-blue-600 font-bold hover:underline"
                @click="addSearchWord"
              >
                <Plus :size="14" class="inline" /> Tambah Kata
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="i in form.searchWordItems.length"
              :key="i"
              class="flex gap-2 items-center"
            >
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-brutal-primary text-white text-xs font-bold flex items-center justify-center"
              >
                {{ i }}
              </span>
              <input
                v-model="form.searchWordItems[i - 1]"
                type="text"
                class="input-brutal flex-1 uppercase"
                :placeholder="`Kata ${i}`"
                maxlength="10"
              />
              <button
                v-if="form.searchWordItems.length > 1"
                class="btn-brutal !py-2 !px-2 text-red-500"
                @click="removeSearchWord(i - 1)"
              >
                <X :size="14" />
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Maksimal 9 kata, masing-masing maksimal 10 huruf. Hanya huruf A-Z.
          </p>
        </div>

        <!-- Duration (common to both) -->
        <div>
          <label class="label-brutal">Durasi (detik) <span class="text-red-500">*</span></label>
          <input
            v-model.number="form.duration"
            type="number"
            class="input-brutal"
            min="1"
            placeholder="180"
          />
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

    </div>
  </div>

  <PreviewModal
    :show="showPreview"
    question-type=""
    question-text=""
    image-url=""
    :text-options="[]"
    :image-options="[]"
    :scale-options="[]"
    scale-start=""
    scale-end=""
    :scale-count="2"
    :game-data="previewGame"
    @close="showPreview = false"
  />
</template>
