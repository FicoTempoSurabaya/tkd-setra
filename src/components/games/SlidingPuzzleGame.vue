<script setup lang="ts">
/**
 * Image Sliding Puzzle Game
 * Sumber: SSoT/07_game_engine.md 7.7-7.13
 * - 3x3 grid (fixed)
 * - Cloudinary image URL
 * - Random shuffle per participant
 * - Keyboard + Mouse (Desktop), Swipe (Mobile)
 * - Eye button for full image preview (lightbox overlay)
 * - No hint, no auto-solve, no scoring
 */

import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { Eye, X } from 'lucide-vue-next';
import { SLIDING_PUZZLE_SIZE, shuffle, type SnapshotGame } from '@/lib/shared.js';

const props = defineProps<{
  game: SnapshotGame;
  remainingSeconds: number;
}>();

const emit = defineEmits<{
  (e: 'complete', data: { status: string; duration: number; totalSteps: number }): void;
}>();

const SIZE = SLIDING_PUZZLE_SIZE;
const TOTAL_TILES = SIZE * SIZE;

const tiles = ref<number[]>([]);
const stepCount = ref(0);
const showLightbox = ref(false);
const isComplete = ref(false);
const startTime = ref<number>(0);
const elapsedSeconds = ref(0);

function initPuzzle() {
  const ordered = Array.from({ length: TOTAL_TILES }, (_, i) => i);
  let shuffled = shuffle(ordered);
  while (!isSolvable(shuffled) || isSolved(shuffled)) {
    shuffled = shuffle(ordered);
  }
  tiles.value = shuffled;
  stepCount.value = 0;
  isComplete.value = false;
  startTime.value = Date.now();
}

function isSolvable(arr: number[]): boolean {
  let inversions = 0;
  const flat = arr.filter((v) => v !== TOTAL_TILES - 1);
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

function isSolved(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== i) return false;
  }
  return true;
}

function getEmptyIndex(): number {
  return tiles.value.indexOf(TOTAL_TILES - 1);
}

function canMove(index: number): boolean {
  const empty = getEmptyIndex();
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const emptyRow = Math.floor(empty / SIZE);
  const emptyCol = empty % SIZE;
  return (
    (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
    (col === emptyCol && Math.abs(row - emptyRow) === 1)
  );
}

function moveTile(index: number) {
  if (isComplete.value || !canMove(index)) return;
  const empty = getEmptyIndex();
  const newTiles = [...tiles.value];
  [newTiles[index], newTiles[empty]] = [newTiles[empty], newTiles[index]];
  tiles.value = newTiles;
  stepCount.value++;

  if (isSolved(tiles.value)) {
    completeGame();
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeLightbox();
    return;
  }
  if (isComplete.value) return;
  const empty = getEmptyIndex();
  const row = Math.floor(empty / SIZE);
  const col = empty % SIZE;

  switch (e.key) {
    case 'ArrowUp':
      if (row < SIZE - 1) moveTile((row + 1) * SIZE + col);
      break;
    case 'ArrowDown':
      if (row > 0) moveTile((row - 1) * SIZE + col);
      break;
    case 'ArrowLeft':
      if (col < SIZE - 1) moveTile(row * SIZE + col + 1);
      break;
    case 'ArrowRight':
      if (col > 0) moveTile(row * SIZE + col - 1);
      break;
  }
}

let touchStartIndex = -1;
function handleTouchStart(index: number) {
  touchStartIndex = index;
}

function handleTouchEnd(e: TouchEvent) {
  if (touchStartIndex < 0) return;
  const touch = e.changedTouches[0];
  const target = e.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  const endX = touch.clientX;
  const endY = touch.clientY;
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  const dx = endX - startX;
  const dy = endY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && touchStartIndex % SIZE < SIZE - 1) {
      moveTile(touchStartIndex + 1);
    } else if (dx < -30 && touchStartIndex % SIZE > 0) {
      moveTile(touchStartIndex - 1);
    }
  } else {
    if (dy > 30 && Math.floor(touchStartIndex / SIZE) < SIZE - 1) {
      moveTile(touchStartIndex + SIZE);
    } else if (dy < -30 && Math.floor(touchStartIndex / SIZE) > 0) {
      moveTile(touchStartIndex - SIZE);
    }
  }
  touchStartIndex = -1;
}

function completeGame() {
  isComplete.value = true;
  elapsedSeconds.value = Math.floor((Date.now() - startTime.value) / 1000);
  emit('complete', {
    status: 'Selesai',
    duration: elapsedSeconds.value,
    totalSteps: stepCount.value,
  });
}

watch(
  () => props.remainingSeconds,
  (newVal) => {
    if (newVal <= 0 && !isComplete.value) {
      isComplete.value = true;
      elapsedSeconds.value = Math.floor((Date.now() - startTime.value) / 1000);
      emit('complete', {
        status: 'Waktu Habis',
        duration: elapsedSeconds.value,
        totalSteps: stepCount.value,
      });
    }
  },
);

function openLightbox() {
  showLightbox.value = true;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  showLightbox.value = false;
  document.body.style.overflow = '';
}

onMounted(() => {
  initPuzzle();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  // Ensure the body scroll lock is always released on unmount.
  document.body.style.overflow = '';
});

const imageUrl = computed(() => props.game.imageUrl ?? '');

/** Compute the absolute translate position for a tile value. */
function tileStyle(tileValue: number) {
  const row = Math.floor(tileValue / SIZE);
  const col = tileValue % SIZE;
  return {
    transform: `translate(${col * 100}%, ${row * 100}%)`,
  };
}
</script>

<template>
  <div class="card-brutal">
    <div class="flex items-center justify-between mb-4">
      <span class="badge-brutal">Langkah: {{ stepCount }}</span>
      <button class="btn-brutal !py-2 !px-3 !text-sm" @click="openLightbox">
        <Eye :size="16" />
        Lihat Gambar
      </button>
    </div>

    <!--
      Board: relative container sized by aspect-square. Each tile is absolutely
      positioned and translated via transform. transform transitions give the
      buttery-smooth slide effect without reflowing the DOM.
    -->
    <div
      class="relative w-full mx-auto aspect-square border-[3px] border-brutal-dark p-1 bg-brutal-dark"
      :style="{ maxWidth: '400px' }"
    >
      <div
        v-for="(tile, index) in tiles"
        :key="tile"
        class="absolute left-0 top-0 w-[calc((100%-8px)/3)] h-[calc((100%-8px)/3)] cursor-pointer transition-transform duration-200 ease-out"
        :style="tileStyle(tile)"
        @click="moveTile(index)"
        @touchstart="handleTouchStart(index)"
        @touchend="handleTouchEnd"
      >
        <div
          v-if="tile !== TOTAL_TILES - 1"
          class="w-full h-full bg-cover bg-center border border-brutal-dark"
          :style="{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `${(tile % SIZE) * (100 / (SIZE - 1))}% ${Math.floor(tile / SIZE) * (100 / (SIZE - 1))}%`,
            backgroundSize: `${SIZE * 100}% ${SIZE * 100}%`,
          }"
        ></div>
        <div v-else class="w-full h-full bg-brutal-bg border border-brutal-dark"></div>
      </div>
    </div>

    <p v-if="isComplete" class="text-center mt-4 text-lg font-bold text-brutal-success">
      Puzzle selesai dalam {{ stepCount }} langkah!
    </p>

    <!-- Lightbox overlay: fixed, above everything, never pushes the layout. -->
    <Teleport to="body">
      <div
        v-if="showLightbox"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        @click.self="closeLightbox"
      >
        <div class="relative w-full max-w-3xl">
          <button
            class="btn-brutal absolute -top-3 -right-1 z-10 !py-2 !px-2"
            aria-label="Tutup gambar"
            @click="closeLightbox"
          >
            <X :size="18" />
          </button>
          <img
            :src="imageUrl"
            alt="Gambar utuh puzzle"
            class="w-full max-h-[85vh] object-contain bg-white border-[3px] border-brutal-dark"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Tile slide transition is handled by Tailwind's transition-transform duration-200 ease-out. */
</style>
