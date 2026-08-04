/**
 * Vercel Serverless Function Entry Point
 * Menerima semua request /api/* dan delegate ke Fastify app
 */

import { createFastifyApp } from './app.js';

let appPromise: Promise<any> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = createFastifyApp();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  app.server.emit('request', req, res);
}

export const config = {
  maxDuration: 10, // Vercel Hobby: 10 detik
};