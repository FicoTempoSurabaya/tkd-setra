/**
 * Shared exports for frontend
 * NOTE: These are local re-exports to avoid importing backend serverless code.
 * Keep this file in sync with api/constants.ts, api/types.ts, and api/schemas.ts
 */

// Re-export constants that are safe for frontend use
export const GAME_TYPES = ['Image Sliding Puzzle', 'Search Word'] as const;
export const QUIZ_QUESTION_TYPES = [
  'Single Choice Question',
  'Yes/No Question',
  'Image Based Question',
  'Image Based Answer',
  'Likert Scale',
  'Semantic Differential Scale',
] as const;

export const SEARCH_WORD_GRID_SIZE = 10;
export const SEARCH_WORD_DIRECTIONS = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: -1, dc: 1 },
] as const;

export const SLIDING_PUZZLE_SIZE = 3;
export const MAX_SLIDING_PUZZLE_STEPS = 150;

// Re-export types
export type GameType = (typeof GAME_TYPES)[number];
export type QuizQuestionType = (typeof QUIZ_QUESTION_TYPES)[number];

export interface SnapshotGame {
  gameId: string;
  gameType: GameType;
  gameOrder: number;
  title: string;
  imageUrl: string | null;
  duration: number;
  searchWordItems?: { word: string; searchWordItemId: string }[];
}

export interface SnapshotQuestion {
  questionId: string;
  questionType: QuizQuestionType;
  questionOrder: number;
  questionText: string;
  imageUrl: string | null;
  options: {
    questionOptionId: string;
    optionText: string | null;
    imageUrl: string | null;
    optionOrder: number;
  }[];
}

export interface ParticipantTest {
  testId: string;
  participantId: string;
  status: string;
  quizDuration: number;
  currentGameId: string | null;
}

export interface Participant {
  participantId: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  nik: string;
  address: string;
  whatsapp: string;
  email: string;
}

export interface Question {
  questionId: string;
  questionType: QuizQuestionType;
  questionOrder: number;
  questionText: string;
  imageUrl: string | null;
  options: {
    questionOptionId: string;
    optionText: string | null;
    imageUrl: string | null;
    optionOrder: number;
  }[];
}

export interface Game {
  gameId: string;
  gameType: GameType;
  gameOrder: number;
  title: string;
  imageUrl: string | null;
  duration: number;
  searchWordItems?: { word: string; searchWordItemId: string }[];
}

export interface Setting {
  settingId: string;
  quizDuration: number;
  instructionContent: unknown;
  successContent: unknown;
  timeoutContent: unknown;
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantDetail {
  participantId: string;
  biodata: Participant;
  quizAnswers: {
    questionOrder: number;
    questionText: string;
    questionType: QuizQuestionType;
    selectedOptionText: string | null;
    selectedOptionImageUrl: string | null;
  }[];
  gameResults: {
    gameTitle: string;
    gameType: GameType;
    status: string;
    duration: number;
    totalSteps: number | null;
    totalFoundWords: number | null;
    foundWords: string[];
  }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiListResponse<T = unknown> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
  message?: string;
}

export interface PaginationInput {
  page: number;
  perPage: number;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface BiodataInput {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  nik: string;
  address: string;
  whatsapp: string;
  email: string;
}

export interface AdminLoginInput {
  password: string;
}

export interface CreateQuestionInput {
  questionType: QuizQuestionType;
  questionText: string;
  imageUrl?: string | null;
  options: {
    optionText?: string | null;
    imageUrl?: string | null;
    optionOrder: number;
  }[];
}

export interface CreateGameInput {
  gameType: GameType;
  title: string;
  imageUrl: string | null;
  duration: number;
  searchWordItems?: { word: string }[];
}

export interface UpdateSettingInput {
  quizDuration?: number;
  instructionContent?: unknown;
  successContent?: unknown;
  timeoutContent?: unknown;
  maintenanceMode?: boolean;
}

// Zod schema and utils for biodata validation
import { z } from 'zod';

export const biodataSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  birthPlace: z.string().min(1, 'Tempat lahir wajib diisi'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  whatsapp: z.string().regex(/^(08|62)\d{8,12}$/, 'Nomor WhatsApp tidak valid'),
  email: z.string().email('Email tidak valid'),
});

export function normalizeWhatsapp(value: string): string {
  if (!value) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  return digits;
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const ID_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/** Format a date input (Date | string | number) into Indonesian date format, e.g. 17 Agustus 1945. */
export function formatDateId(value: Date | string | number): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';
  const day = date.getDate();
  const month = ID_MONTHS[date.getMonth()] ?? '';
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Format a duration given in seconds into "Xm Yd" (menit & detik). */
export function formatDuration(totalSeconds: number): string {
  const seconds = typeof totalSeconds === 'number' ? totalSeconds : Number(totalSeconds);
  if (isNaN(seconds) || seconds < 0) return '-';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s} dtk`;
  return `${m} mnt ${s} dtk`;
}

/** Truncate a string to `max` characters, appending "…" if it was cut. */
export function truncate(value: string, max: number): string {
  if (!value) return '';
  const str = String(value);
  if (str.length <= max) return str;
  return `${str.slice(0, max).trimEnd()}…`;
}
