<script setup lang="ts">
import { ref, computed } from 'vue';
import SlidingPuzzleGame from '@/components/games/SlidingPuzzleGame.vue';
import SearchWordGame from '@/components/games/SearchWordGame.vue';
import { formatDuration, type SnapshotGame } from '@tkd-setra/shared';

const props = defineProps<{
  show: boolean;
  questionType: string;
  questionText: string;
  imageUrl: string;
  textOptions: string[];
  imageOptions: { imageUrl: string; label: string }[];
  scaleOptions: string[];
  scaleStart: string;
  scaleEnd: string;
  scaleCount: number;
  gameData: SnapshotGame | null;
}>();

const emit = defineEmits<{ close: [] }>();

const selectedOption = ref<number | null>(null);

function handleOptionClick(index: number) {
  selectedOption.value = index;
}

function handleClose() {
  selectedOption.value = null;
  emit('close');
}

const showTextOptions = computed(() => {
  return ['Single Choice Question', 'Image Based Question'].includes(props.questionType);
});

const showYesNoOptions = computed(() => {
  return props.questionType === 'Yes/No Question';
});

const showImageOptions = computed(() => {
  return props.questionType === 'Image Based Answer';
});

const showScaleOptions = computed(() => {
  return props.questionType === 'Likert Scale';
});

const showSemanticOptions = computed(() => {
  return props.questionType === 'Semantic Differential Scale';
});

const semanticScaleCount = computed(() => {
  return Math.max(2, props.scaleCount || props.scaleOptions.length || 2);
});

const previewDuration = computed(() => props.gameData?.duration ?? 300);
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    @click.self="handleClose"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b-4 border-black">
        <h3 class="text-lg font-black">Preview: {{ questionType }}</h3>
        <button class="btn-brutal !py-1 !px-2" @click="handleClose">✕</button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6">
        <!-- Timer Simulation -->
        <div v-if="!gameData" class="card-brutal flex items-center justify-between">
          <span class="font-bold">Sisa Waktu Quiz</span>
          <span class="text-2xl font-black text-brutal-primary">{{ formatDuration(previewDuration) }}</span>
        </div>

        <!-- Quiz Phase -->
        <div v-if="showTextOptions || showYesNoOptions || showImageOptions || showScaleOptions || showSemanticOptions">
          <div class="mb-4">
            <span class="badge-brutal badge-brutal-info">{{ questionType }}</span>
          </div>

          <p class="text-lg font-bold mb-4">{{ questionText || 'Teks pertanyaan' }}</p>

          <!-- Image for Image Based Question -->
          <img
            v-if="imageUrl && questionType === 'Image Based Question'"
            :src="imageUrl"
            alt="Question image"
            class="w-full max-h-[42vh] object-contain bg-gray-50 border-[3px] border-brutal-dark mb-4"
          />

          <!-- Text Options -->
          <div v-if="showTextOptions" class="space-y-3">
            <button
              v-for="(option, i) in textOptions"
              :key="i"
              class="btn-brutal w-full !justify-start"
              :class="selectedOption === i ? '!border-brutal-primary !bg-brutal-primary/10' : ''"
              @click="handleOptionClick(i)"
            >
              <span
                class="flex-shrink-0 w-8 h-8 rounded-full bg-brutal-dark text-white text-sm font-bold flex items-center justify-center mr-3"
              >
                {{ String.fromCharCode(65 + i) }}
              </span>
              <span>{{ option || `Pilihan ${String.fromCharCode(65 + i)}` }}</span>
            </button>
          </div>

          <!-- Yes/No Options -->
          <div v-if="showYesNoOptions" class="space-y-3">
            <button
              class="btn-brutal w-full !justify-start"
              :class="selectedOption === 0 ? '!border-brutal-primary !bg-brutal-primary/10' : ''"
              @click="handleOptionClick(0)"
            >
              <span class="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center mr-3">
                ✓
              </span>
              <span>Iya</span>
            </button>
            <button
              class="btn-brutal w-full !justify-start"
              :class="selectedOption === 1 ? '!border-brutal-primary !bg-brutal-primary/10' : ''"
              @click="handleOptionClick(1)"
            >
              <span class="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center mr-3">
                ✗
              </span>
              <span>Tidak</span>
            </button>
          </div>

          <!-- Image Options (Image Based Answer) -->
          <div v-if="showImageOptions" class="grid grid-cols-2 gap-2 sm:gap-4">
            <button
              v-for="(opt, i) in imageOptions"
              :key="i"
              class="card-brutal !p-3 text-left overflow-hidden"
              :class="selectedOption === i ? '!border-brutal-primary !bg-brutal-primary/10' : ''"
              @click="handleOptionClick(i)"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-bold">Pilihan {{ String.fromCharCode(65 + i) }}</span>
              </div>
              <img
                v-if="opt.imageUrl"
                :src="opt.imageUrl"
                alt="Option"
                class="w-full aspect-[4/3] object-contain bg-gray-50 border-2 border-black rounded mb-3"
              />
              <span class="block text-sm font-medium break-words">
                {{ opt.label || `Label ${String.fromCharCode(65 + i)}` }}
              </span>
            </button>
          </div>

          <!-- Likert Scale Options -->
          <div v-if="showScaleOptions" class="space-y-3">
            <button
              v-for="(option, i) in scaleOptions"
              :key="i"
              class="btn-brutal w-full !justify-start"
              :class="selectedOption === i ? '!border-brutal-primary !bg-brutal-primary/10' : ''"
              @click="handleOptionClick(i)"
            >
              <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-brutal-primary text-white text-sm font-bold flex items-center justify-center mr-3">
                {{ i + 1 }}
              </span>
              <span>{{ option || `Skala ${i + 1}` }}</span>
            </button>
          </div>

<!-- Semantic Differential Scale -->
          <div v-if="showSemanticOptions" class="space-y-4">
            <p class="text-lg font-bold">{{ questionText || 'Teks pernyataan' }}</p>
            <div class="overflow-x-auto border-2 border-brutal-dark bg-brutal-bg p-3">
              <div class="w-max flex items-center gap-4">
                <span class="w-28 flex-shrink-0 text-left text-sm font-bold text-brutal-primary break-words">{{ scaleStart || 'Skala Awal' }}</span>
                <div class="flex flex-shrink-0 items-center justify-between gap-2">
                <span
                  v-for="i in semanticScaleCount"
                  :key="i"
                  class="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center cursor-pointer hover:bg-brutal-primary hover:text-white transition-colors"
                  :class="selectedOption === i - 1 ? 'bg-brutal-primary text-white' : 'bg-white'"
                  @click="handleOptionClick(i - 1)"
                >
{{ i }}
                </span>
              </div>
              <span class="text-sm font-bold text-brutal-primary">{{ scaleEnd || 'Skala Akhir' }}</span>
            </div>
          </div>
          </div>
        </div>

        <!-- Game Phase -->
        <div v-else-if="gameData" class="animate-fade-in">
          <div class="flex items-center justify-between mb-4">
            <span class="font-bold">{{ gameData.title }}</span>
            <span class="text-2xl font-black text-brutal-primary">{{ formatDuration(previewDuration) }}</span>
          </div>

          <SlidingPuzzleGame
            v-if="gameData.gameType === 'Image Sliding Puzzle'"
            :game="gameData"
            :remaining-seconds="previewDuration"
            @complete="() => {}"
          />

          <SearchWordGame
            v-else-if="gameData.gameType === 'Search Word'"
            :game="gameData"
            :remaining-seconds="previewDuration"
            @complete="() => {}"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 p-6 border-t-4 border-black">
        <button class="btn-brutal !py-2 !px-6" @click="handleClose">Tutup Preview</button>
      </div>
    </div>
  </div>
</template>
