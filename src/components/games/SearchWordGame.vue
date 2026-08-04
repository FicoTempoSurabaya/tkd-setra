<script setup lang="ts">
/**
 * Search Word Game
 * Sumber: SSoT/07_game_engine.md 7.14-7.23
 * - 10x10 grid (fixed)
 * - 1-9 words, max 10 chars each
 * - 4 directions only: ➡ ⬇ ↘ ↗
 * - Random placement + random fill letters
 * - Click + Drag (Desktop), Touch + Swipe (Mobile)
 * - Found words marked permanently
 */

import { ref, onMounted, onUnmounted, watch } from 'vue';
import {
  SEARCH_WORD_GRID_SIZE,
  SEARCH_WORD_DIRECTIONS,
  type SnapshotGame,
} from '@/lib/shared.js';

const props = defineProps<{
  game: SnapshotGame;
  remainingSeconds: number;
  /** Stable per participant; omitted in admin preview to generate a fresh board. */
  seed?: string;
}>();

const emit = defineEmits<{
  (e: 'complete', data: {
    status: string;
    duration: number;
    totalFoundWords: number;
    foundWordItemIds: string[];
  }): void;
}>();

const SIZE = SEARCH_WORD_GRID_SIZE;
const DIRECTIONS = SEARCH_WORD_DIRECTIONS;

interface Cell {
  letter: string;
  row: number;
  col: number;
}

const grid = ref<Cell[][]>([]);
const words = ref<{ word: string; searchWordItemId: string; found: boolean; path: { row: number; col: number }[] }[]>([]);
const foundCount = ref(0);
const isComplete = ref(false);
const startTime = ref<number>(0);
const elapsedSeconds = ref(0);

const isSelecting = ref(false);
const startCell = ref<{ row: number; col: number } | null>(null);
const endCell = ref<{ row: number; col: number } | null>(null);
const selectedCells = ref<{ row: number; col: number }[]>([]);

function createRandom(seed: string): () => number {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    state ^= seed.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGrid() {
  const random = createRandom(props.seed ? `${props.seed}-${props.game.gameId}` : `${Date.now()}-${Math.random()}`);
  const wordsList = props.game.searchWordItems.map((item) => ({
    word: item.word.toUpperCase(),
    searchWordItemId: item.searchWordItemId,
    found: false,
    path: [] as { row: number; col: number }[],
  }));

  wordsList.sort((a, b) => b.word.length - a.word.length);

  const g: string[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ''),
  );

  const placedWords: typeof wordsList = [];

  for (const w of wordsList) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const dir = DIRECTIONS[Math.floor(random() * DIRECTIONS.length)];
      const row = Math.floor(random() * SIZE);
      const col = Math.floor(random() * SIZE);

      if (canPlaceWord(g, w.word, row, col, dir)) {
        const path = placeWord(g, w.word, row, col, dir);
        placedWords.push({ ...w, path });
        placed = true;
      }
      attempts++;
    }
    if (!placed) {
      outer: for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          for (const dir of DIRECTIONS) {
            if (canPlaceWord(g, w.word, r, c, dir)) {
              const path = placeWord(g, w.word, r, c, dir);
              placedWords.push({ ...w, path });
              placed = true;
              break outer;
            }
          }
        }
      }
    }
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!g[r][c]) {
        g[r][c] = String.fromCharCode(65 + Math.floor(random() * 26));
      }
    }
  }

  grid.value = g.map((row, r) =>
    row.map((letter, c) => ({ letter, row: r, col: c })),
  );

  words.value = placedWords;
  foundCount.value = 0;
  isComplete.value = false;
  startTime.value = Date.now();
}

function canPlaceWord(
  g: string[][],
  word: string,
  row: number,
  col: number,
  dir: { dr: number; dc: number },
): boolean {
  const endRow = row + dir.dr * (word.length - 1);
  const endCol = col + dir.dc * (word.length - 1);

  if (endRow < 0 || endRow >= SIZE || endCol < 0 || endCol >= SIZE) return false;

  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    if (g[r][c] !== '' && g[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  g: string[][],
  word: string,
  row: number,
  col: number,
  dir: { dr: number; dc: number },
): { row: number; col: number }[] {
  const path: { row: number; col: number }[] = [];
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    g[r][c] = word[i];
    path.push({ row: r, col: c });
  }
  return path;
}

function getSelectionPath(
  start: { row: number; col: number },
  end: { row: number; col: number },
): { row: number; col: number }[] {
  const dr = end.row - start.row;
  const dc = end.col - start.col;
  const absDr = Math.abs(dr);
  const absDc = Math.abs(dc);

  if (dr !== 0 && dc !== 0 && absDr !== absDc) return [];

  const length = Math.max(absDr, absDc) + 1;
  const stepR = dr === 0 ? 0 : dr / absDr;
  const stepC = dc === 0 ? 0 : dc / absDc;

  const path: { row: number; col: number }[] = [];
  for (let i = 0; i < length; i++) {
    path.push({
      row: start.row + stepR * i,
      col: start.col + stepC * i,
    });
  }
  return path;
}

function getWordFromPath(path: { row: number; col: number }[]): string {
  return path.map((p) => grid.value[p.row][p.col].letter).join('');
}

function isCellInFoundPath(row: number, col: number): boolean {
  for (const w of words.value) {
    if (w.found && w.path.some((p) => p.row === row && p.col === col)) {
      return true;
    }
  }
  return false;
}

function updateSelection(row: number, col: number) {
  if (!isSelecting.value || !startCell.value) return;
  endCell.value = { row, col };
  const path = getSelectionPath(startCell.value, { row, col });
  if (path.length > 0) selectedCells.value = path;
}

const gridEl = ref<HTMLElement | null>(null);

function handlePointerDown(row: number, col: number, event: PointerEvent) {
  if (isComplete.value) return;
  event.preventDefault();
  isSelecting.value = true;
  startCell.value = { row, col };
  endCell.value = { row, col };
  selectedCells.value = [{ row, col }];
  // Capture the pointer so move/up/cancel events keep firing on the grid even
  // when the finger leaves a cell or the grid bounds. This is the key fix for
  // drag selection on smartphones (pointer events are otherwise lost to the
  // browser's scrolling/gesture handling).
  gridEl.value?.setPointerCapture?.(event.pointerId);
}

function handlePointerMove(event: PointerEvent) {
  if (!isSelecting.value || !gridEl.value) return;
  // Compute the hovered cell directly from the pointer coordinates relative to
  // the grid. This is more reliable than elementFromPoint during touch drags,
  // especially now that the pointer is captured on the grid element.
  const rect = gridEl.value.getBoundingClientRect();
  const col = Math.floor((event.clientX - rect.left) / (rect.width / SIZE));
  const row = Math.floor((event.clientY - rect.top) / (rect.height / SIZE));
  if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) updateSelection(row, col);
}

function handlePointerUp(event?: PointerEvent) {
  if (event?.pointerId != null) {
    gridEl.value?.releasePointerCapture?.(event.pointerId);
  }
  if (!isSelecting.value || !startCell.value || !endCell.value) {
    isSelecting.value = false;
    selectedCells.value = [];
    return;
  }

  const path = getSelectionPath(startCell.value, endCell.value);
  if (path.length > 1) {
    const word = getWordFromPath(path);
    const reverseWord = word.split('').reverse().join('');

    const match = words.value.find(
      (w) => !w.found && (w.word === word || w.word === reverseWord),
    );

    if (match) {
      match.found = true;
      foundCount.value++;

      if (foundCount.value === words.value.length) {
        completeGame();
      }
    }
  }

  isSelecting.value = false;
  selectedCells.value = [];
  startCell.value = null;
  endCell.value = null;
}

function isCellSelected(row: number, col: number): boolean {
  return selectedCells.value.some((c) => c.row === row && c.col === col);
}

function completeGame() {
  isComplete.value = true;
  elapsedSeconds.value = Math.floor((Date.now() - startTime.value) / 1000);
  emit('complete', {
    status: 'Selesai',
    duration: elapsedSeconds.value,
    totalFoundWords: foundCount.value,
    foundWordItemIds: words.value.filter((w) => w.found).map((w) => w.searchWordItemId),
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
        totalFoundWords: foundCount.value,
        foundWordItemIds: words.value.filter((w) => w.found).map((w) => w.searchWordItemId),
      });
    }
  },
);

onMounted(() => {
  buildGrid();
  window.addEventListener('pointerup', handlePointerUp);
});

onUnmounted(() => {
  window.removeEventListener('pointerup', handlePointerUp);
});
</script>

<template>
  <div class="card-brutal">
    <div class="flex items-center justify-between mb-4">
      <span class="badge-brutal">Ditemukan: {{ foundCount }}/{{ words.length }}</span>
    </div>

    <div
      ref="gridEl"
      class="grid gap-0 mx-auto border-[3px] border-brutal-dark select-none touch-none"
      :style="{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, maxWidth: '500px' }"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
    >
      <div
        v-for="cell in grid.flat()"
        :key="`${cell.row}-${cell.col}`"
        :data-row="cell.row"
        :data-col="cell.col"
        data-search-word-cell
        class="aspect-square flex items-center justify-center font-bold text-sm md:text-lg cursor-pointer border border-brutal-dark"
        :class="{
          'bg-brutal-primary text-white': isCellSelected(cell.row, cell.col),
          'bg-brutal-success text-white': isCellInFoundPath(cell.row, cell.col),
          'bg-brutal-surface': !isCellSelected(cell.row, cell.col) && !isCellInFoundPath(cell.row, cell.col),
        }"
        @pointerdown="handlePointerDown(cell.row, cell.col, $event)"
      >
        {{ cell.letter }}
      </div>
    </div>

    <div class="mt-4">
      <h3 class="font-bold mb-2">Daftar Kata:</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="w in words"
          :key="w.searchWordItemId"
          class="badge-brutal"
          :class="w.found ? 'badge-brutal-success' : ''"
        >
          {{ w.word }}
        </span>
      </div>
    </div>

    <p v-if="isComplete" class="text-center mt-4 text-lg font-bold text-brutal-success">
      Game selesai! {{ foundCount }} kata ditemukan.
    </p>
  </div>
</template>
