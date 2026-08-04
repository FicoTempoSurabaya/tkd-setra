/**
 * Shared Constants
 * Inlined from packages/shared untuk deployment flat structure.
 */

// ============================================================
// QUESTION TYPES (Quiz)
// ============================================================
export const QUIZ_QUESTION_TYPES = [
  'Single Choice Question',
  'Yes/No Question',
  'Image Based Question',
  'Image Based Answer',
  'Likert Scale',
  'Semantic Differential Scale',
] as const;

export type QuizQuestionType = (typeof QUIZ_QUESTION_TYPES)[number];

// ============================================================
// GAME TYPES
// ============================================================
export const GAME_TYPES = ['Image Sliding Puzzle', 'Search Word'] as const;

export type GameType = (typeof GAME_TYPES)[number];

// ============================================================
// QUESTION/GAME STATUS
// ============================================================
export const ITEM_STATUS = ['Aktif', 'Non Aktif'] as const;

export type ItemStatus = (typeof ITEM_STATUS)[number];

// ============================================================
// PARTICIPANT TEST STATUS
// ============================================================
export const PARTICIPANT_TEST_STATUS = [
  'Belum Mulai',
  'Sedang Tes',
  'Selesai',
  'Waktu Habis',
] as const;

export type ParticipantTestStatus = (typeof PARTICIPANT_TEST_STATUS)[number];

// ============================================================
// GAME RESULT STATUS
// ============================================================
export const GAME_RESULT_STATUS = ['Selesai', 'Waktu Habis'] as const;

export type GameResultStatus = (typeof GAME_RESULT_STATUS)[number];

// ============================================================
// DEFAULT DURATIONS (in seconds)
// ============================================================
export const DEFAULT_QUIZ_DURATION_SECONDS = 7200; // 120 menit
export const DEFAULT_GAME_DURATION_SECONDS = 180; // 3 menit

// ============================================================
// SLIDING PUZZLE
// ============================================================
export const SLIDING_PUZZLE_SIZE = 3; // 3x3
export const SLIDING_PUZZLE_TILES = SLIDING_PUZZLE_SIZE * SLIDING_PUZZLE_SIZE; // 9

// ============================================================
// SEARCH WORD
// ============================================================
export const SEARCH_WORD_GRID_SIZE = 10; // 10x10
export const SEARCH_WORD_MIN_WORDS = 1;
export const SEARCH_WORD_MAX_WORDS = 9;
export const SEARCH_WORD_MAX_WORD_LENGTH = 10;

// ============================================================
// AUTH
// ============================================================
export const ADMIN_SESSION_DURATION_HOURS = 24;
export const ADMIN_SESSION_DURATION_SECONDS = ADMIN_SESSION_DURATION_HOURS * 60 * 60;

export const LOGIN_MAX_ATTEMPTS = 3;
export const LOGIN_LOCK_STAGE_1_MINUTES = 5;
export const LOGIN_LOCK_STAGE_2_MINUTES = 10;
export const LOGIN_LOCK_STAGE_3_HOURS = 24;

// ============================================================
// WHATSAPP ADMIN (default, dapat di-override via env)
// ============================================================
export const DEFAULT_ADMIN_WHATSAPP = '6281318138660';

// ============================================================
// COOKIE NAMES
// ============================================================
export const ADMIN_COOKIE_NAME = 'admin_session';
export const PARTICIPANT_COOKIE_NAME = 'participant_test';

// ============================================================
// API Response
// ============================================================
export const API_SUCCESS = 'success' as const;
export const API_ERROR = 'error' as const;