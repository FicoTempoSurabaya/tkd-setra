/**
 * Vercel Serverless Function Entry Point
 * Menerima semua request /api/* dan delegate ke Fastify app
 *
 * Uses app.server.emit('request', req, res) to forward the native
 * Node.js request/response objects to Fastify's internal HTTP server.
 * This is the recommended pattern for Fastify v5 + Vercel serverless.
 */

import { createFastifyApp } from '../src/server/app.js';
import { getPool } from '../src/server/db.js';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance | null = null;

async function getApp(): Promise<FastifyInstance> {
  if (!app) {
    // Inisialisasi Fastify dan DB pool secara paralel
    const [fastify] = await Promise.all([
      createFastifyApp(),
      // Pre-warm DB pool: buat koneksi pertama saat cold start
      // sehingga request pertama tidak perlu menunggu DB connect
      getPool().query('SELECT 1').catch(() => null),
    ]);
    // Fastify v5: ready() finalizes plugin registration and attaches
    // the request listener to app.server. Without it, app.server.emit('request')
    // may not route correctly.
    await fastify.ready();
    app = fastify;
  }
  return app;
}

import {
  participantTestRepository,
  settingRepository,
  snapshotRepository,
} from '../src/server/repositories.js';

export default async function handler(req: any, res: any) {
  // FAST PATH: Bypass Fastify untuk start-test agar terhindar dari overhead cold start
  if (req.method === 'POST' && req.url && req.url.includes('/api/participant/start-test/')) {
    try {
      const publicToken = req.url.split('/').pop()?.split('?')[0];
      if (!publicToken) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, message: 'Token tidak valid' }));
      }

      res.setHeader('Content-Type', 'application/json');
      
      const test = await participantTestRepository.findByPublicToken(publicToken);
      if (!test) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ success: false, message: 'Tes tidak ditemukan.' }));
      }
      if (test.status !== 'Belum Mulai') {
        res.statusCode = 409;
        return res.end(JSON.stringify({ success: false, message: 'Tes sudah dimulai atau selesai.' }));
      }

      const setting = await settingRepository.get();
      if (setting.maintenanceMode) {
        res.statusCode = 503;
        return res.end(JSON.stringify({ success: false, message: 'Sistem sedang dalam pemeliharaan.' }));
      }

      const updatedTest = await participantTestRepository.startTest(test.participantTestId);
      const quizSnapshot = await snapshotRepository.getQuizSnapshot();

      if (quizSnapshot.length > 0) {
        await participantTestRepository.updateCurrentQuizQuestion(
          test.participantTestId,
          quizSnapshot[0].questionId,
        );
      }

      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        message: 'Tes dimulai',
        data: { test: updatedTest, quizSnapshot },
      }));
    } catch (error) {
      console.error('[api/index.ts] Fast-path error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'Internal server error (Fast Path)',
        code: 'INTERNAL_ERROR',
      }));
    }
  }

  // STANDARD PATH: Delegate ke Fastify
  try {
    const fastify = await getApp();
    fastify.server.emit('request', req, res);
  } catch (error) {
    console.error('[api/index.ts] Handler error:', error);

    // If Fastify app initialization failed (e.g. missing env vars),
    // return a clean 500 so the client gets a structured response.
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        }),
      );
    }
  }
}

export const config = {
  maxDuration: 10, // Vercel Hobby: 10 detik
};
