/**
 * Shared Zod Schemas
 * Inlined from packages/shared untuk deployment flat structure.
 */

import { z } from 'zod';
import {
  QUIZ_QUESTION_TYPES,
  GAME_TYPES,
  ITEM_STATUS,
  PARTICIPANT_TEST_STATUS,
  GAME_RESULT_STATUS,
  SEARCH_WORD_MIN_WORDS,
  SEARCH_WORD_MAX_WORDS,
  SEARCH_WORD_MAX_WORD_LENGTH,
} from './constants.js';

// ============================================================
// PARTICIPANT BIODATA SCHEMA
// ============================================================
export const biodataSchema = z.object({
  fullName: z
    .string({ required_error: 'Nama Lengkap wajib diisi' })
    .trim()
    .min(1, 'Nama Lengkap wajib diisi')
    .max(150, 'Nama Lengkap maksimal 150 karakter'),
  birthPlace: z
    .string({ required_error: 'Tempat Lahir wajib diisi' })
    .trim()
    .min(1, 'Tempat Lahir wajib diisi')
    .max(100, 'Tempat Lahir maksimal 100 karakter'),
  birthDate: z
    .string({ required_error: 'Tanggal Lahir wajib diisi' })
    .min(1, 'Tanggal Lahir wajib diisi')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    }, 'Tanggal Lahir tidak valid'),
  nik: z
    .string({ required_error: 'NIK wajib diisi' })
    .min(1, 'NIK wajib diisi')
    .regex(/^\d{16}$/, 'NIK harus terdiri dari 16 digit angka'),
  address: z
    .string({ required_error: 'Alamat wajib diisi' })
    .trim()
    .min(1, 'Alamat wajib diisi'),
  whatsapp: z
    .string({ required_error: 'Nomor WhatsApp wajib diisi' })
    .min(1, 'Nomor WhatsApp wajib diisi')
    .max(14, 'Nomor WhatsApp maksimal 14 digit')
    .regex(/^(62|0)\d{8,13}$/, 'Nomor WhatsApp tidak valid'),
  email: z
    .string({ required_error: 'Email wajib diisi' })
    .min(1, 'Email wajib diisi')
    .max(150, 'Email maksimal 150 karakter')
    .email('Format email tidak valid')
    .refine((val) => val.includes('@'), 'Email harus mengandung karakter @'),
});

export type BiodataInput = z.infer<typeof biodataSchema>;

// ============================================================
// ADMIN LOGIN SCHEMA
// ============================================================
export const adminLoginSchema = z.object({
  password: z
    .string({ required_error: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// ============================================================
// QUESTION SCHEMAS
// ============================================================
export const questionOptionSchema = z.object({
  optionText: z.string().nullable().optional(),
  imageUrl: z.string().url('URL gambar tidak valid').nullable().optional(),
  optionOrder: z.number().int().positive().optional(),
});

export const createQuestionSchema = z
  .object({
    questionType: z.enum(QUIZ_QUESTION_TYPES),
    questionText: z.string().optional().default(''),
    imageUrl: z.string().url('URL gambar tidak valid').nullable().optional(),
    options: z.array(questionOptionSchema).min(1, 'Minimal 1 pilihan jawaban'),
  })
  .superRefine((data, ctx) => {
    switch (data.questionType) {
      case 'Single Choice Question':
        if (!data.questionText || !data.questionText.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: 'Teks pertanyaan wajib diisi',
            path: ['questionText'],
          });
        }
        if (data.options.length !== 4) {
          ctx.addIssue({
            code: 'custom',
            message: 'Harus memiliki 4 pilihan jawaban',
            path: ['options'],
          });
        }
        for (let i = 0; i < data.options.length; i++) {
          if (!data.options[i].optionText?.trim()) {
            ctx.addIssue({
              code: 'custom',
              message: `Pilihan ${i + 1} wajib diisi teks`,
              path: ['options', i, 'optionText'],
            });
          }
          if (data.options[i].imageUrl) {
            ctx.addIssue({
              code: 'custom',
              message: 'Pilihan tidak boleh memiliki URL gambar untuk tipe ini',
              path: ['options', i, 'imageUrl'],
            });
          }
        }
        break;

      case 'Yes/No Question':
        if (!data.questionText || !data.questionText.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: 'Teks pertanyaan wajib diisi',
            path: ['questionText'],
          });
        }
        if (data.imageUrl) {
          ctx.addIssue({
            code: 'custom',
            message: 'URL gambar tidak boleh diisi untuk tipe Yes/No',
            path: ['imageUrl'],
          });
        }
        break;

      case 'Image Based Question':
        if (!data.imageUrl) {
          ctx.addIssue({
            code: 'custom',
            message: 'Gambar pertanyaan wajib diisi',
            path: ['imageUrl'],
          });
        }
        if (data.options.length !== 4) {
          ctx.addIssue({
            code: 'custom',
            message: 'Harus memiliki 4 pilihan jawaban',
            path: ['options'],
          });
        }
        for (let i = 0; i < data.options.length; i++) {
          if (!data.options[i].optionText?.trim()) {
            ctx.addIssue({
              code: 'custom',
              message: `Pilihan ${i + 1} wajib diisi teks`,
              path: ['options', i, 'optionText'],
            });
          }
          if (data.options[i].imageUrl) {
            ctx.addIssue({
              code: 'custom',
              message: 'Pilihan tidak boleh memiliki URL gambar untuk tipe ini',
              path: ['options', i, 'imageUrl'],
            });
          }
        }
        break;

      case 'Image Based Answer':
        if (!data.questionText || !data.questionText.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: 'Teks pertanyaan wajib diisi',
            path: ['questionText'],
          });
        }
        if (data.imageUrl) {
          ctx.addIssue({
            code: 'custom',
            message: 'URL gambar pertanyaan tidak boleh diisi untuk tipe Image Based Answer',
            path: ['imageUrl'],
          });
        }
        if (data.options.length !== 4) {
          ctx.addIssue({
            code: 'custom',
            message: 'Harus memiliki 4 pilihan jawaban',
            path: ['options'],
          });
        }
        for (let i = 0; i < data.options.length; i++) {
          if (!data.options[i].imageUrl?.trim()) {
            ctx.addIssue({
              code: 'custom',
              message: `Pilihan ${i + 1} wajib memiliki URL gambar`,
              path: ['options', i, 'imageUrl'],
            });
          }
        }
        break;

      case 'Likert Scale':
        if (!data.questionText || !data.questionText.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: 'Teks pernyataan wajib diisi',
            path: ['questionText'],
          });
        }
        if (data.imageUrl) {
          ctx.addIssue({
            code: 'custom',
            message: 'URL gambar tidak boleh diisi untuk tipe Likert Scale',
            path: ['imageUrl'],
          });
        }
        if (data.options.length < 2 || data.options.length > 6) {
          ctx.addIssue({
            code: 'custom',
            message: 'Jumlah skala harus antara 2-6',
            path: ['options'],
          });
        }
        for (let i = 0; i < data.options.length; i++) {
          if (!data.options[i].optionText?.trim()) {
            ctx.addIssue({
              code: 'custom',
              message: `Skala ${i + 1} wajib diisi teks`,
              path: ['options', i, 'optionText'],
            });
          }
        }
        break;

      case 'Semantic Differential Scale':
        if (!data.questionText || !data.questionText.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: 'Teks pernyataan wajib diisi',
            path: ['questionText'],
          });
        }
        if (data.imageUrl) {
          ctx.addIssue({
            code: 'custom',
            message: 'URL gambar tidak boleh diisi untuk tipe Semantic Differential Scale',
            path: ['imageUrl'],
          });
        }
        if (data.options.length < 2 || data.options.length > 6) {
          ctx.addIssue({
            code: 'custom',
            message: 'Jumlah skala harus antara 2-6',
            path: ['options'],
          });
        }
        if (data.options.length > 0 && !data.options[0].optionText?.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: 'Teks skala awal wajib diisi',
            path: ['options', 0, 'optionText'],
          });
        }
        if (data.options.length > 1 && !data.options[data.options.length - 1].optionText?.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: 'Teks skala akhir wajib diisi',
            path: ['options', data.options.length - 1, 'optionText'],
          });
        }
        break;
    }
  });

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

// ============================================================
// GAME SCHEMAS
// ============================================================
export const searchWordItemSchema = z.object({
  word: z
    .string()
    .min(1, 'Kata minimal 1 huruf')
    .max(SEARCH_WORD_MAX_WORD_LENGTH, `Kata maksimal ${SEARCH_WORD_MAX_WORD_LENGTH} huruf`)
    .regex(/^[A-Za-z]+$/, 'Kata hanya boleh huruf'),
});

export const createGameSchema = z
  .object({
    gameType: z.enum(GAME_TYPES),
    title: z.string().optional().default(''),
    imageUrl: z.string().url('URL gambar tidak valid').nullable().optional(),
    duration: z.number().int().positive('Durasi harus lebih besar dari 0'),
    searchWordItems: z.array(searchWordItemSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.gameType === 'Search Word') {
        const count = data.searchWordItems?.length ?? 0;
        return count >= SEARCH_WORD_MIN_WORDS && count <= SEARCH_WORD_MAX_WORDS;
      }
      return true;
    },
    {
      message: `Search Word memerlukan ${SEARCH_WORD_MIN_WORDS}-${SEARCH_WORD_MAX_WORDS} kata`,
      path: ['searchWordItems'],
    },
  )
  .refine(
    (data) => {
      if (data.gameType === 'Image Sliding Puzzle') {
        return !!data.imageUrl;
      }
      return true;
    },
    {
      message: 'URL gambar wajib untuk Image Sliding Puzzle',
      path: ['imageUrl'],
    },
  );

export type CreateGameInput = z.infer<typeof createGameSchema>;

// ============================================================
// QUIZ ANSWER SCHEMA
// ============================================================
export const submitQuizAnswerSchema = z.object({
  questionOptionId: z.string().min(1, 'Pilihan jawaban wajib diisi'),
});

export type SubmitQuizAnswerInput = z.infer<typeof submitQuizAnswerSchema>;

// ============================================================
// GAME RESULT SCHEMA
// ============================================================
export const submitGameResultSchema = z.object({
  gameId: z.string().min(1, 'Game ID wajib diisi'),
  duration: z.number().int().min(0, 'Durasi tidak boleh negatif'),
  totalSteps: z.number().int().min(0, 'Jumlah langkah tidak boleh negatif').nullable().optional(),
  totalFoundWords: z
    .number()
    .int()
    .min(0, 'Jumlah kata tidak boleh negatif')
    .nullable()
    .optional(),
  status: z.enum(GAME_RESULT_STATUS),
  foundWordItemIds: z.array(z.string()).optional(),
});

export type SubmitGameResultInput = z.infer<typeof submitGameResultSchema>;

// ============================================================
// SETTING SCHEMA
// ============================================================
export const updateSettingSchema = z.object({
  quizDuration: z.number().int().positive('Durasi Quiz harus lebih besar dari 0').optional(),
  instructionContent: z.any().optional(),
  successContent: z.any().optional(),
  timeoutContent: z.any().optional(),
  maintenanceMode: z.boolean().optional(),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;

// ============================================================
// PAGINATION SCHEMA
// ============================================================
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================================
// STATUS ENUMS (re-export untuk validasi)
// ============================================================
export const itemStatusSchema = z.enum(ITEM_STATUS);
export const participantTestStatusSchema = z.enum(PARTICIPANT_TEST_STATUS);
export const gameResultStatusSchema = z.enum(GAME_RESULT_STATUS);
export const quizQuestionTypeSchema = z.enum(QUIZ_QUESTION_TYPES);
export const gameTypeSchema = z.enum(GAME_TYPES);