/**
 * Fastify App Factory (Serverless)
 */

import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { getConfig } from './config.js';
import { setupAuth } from './auth.js';
import { participantPublicRoutes, participantAdminRoutes } from './participant.routes.js';
import { adminAuthRoutes, adminProtectedRoutes } from './admin.routes.js';
import { questionRoutes } from './question.routes.js';
import { gameRoutes } from './game.routes.js';
import { settingRoutes } from './setting.routes.js';

export async function createFastifyApp(): Promise<FastifyInstance> {
  const config = getConfig();

  const fastify = Fastify({
    logger: false,
    trustProxy: true,
    bodyLimit: 10 * 1024 * 1024,
  });

  // CORS (same-origin di Vercel, tapi tetap aman)
  await fastify.register(cors, {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  // Multipart
  await fastify.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  // Auth
  await setupAuth(fastify);

  // Error Handler
fastify.setErrorHandler((error: any, _request: any, reply: any) => {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.code(400).send({
        success: false,
        message: 'Data tidak valid',
        errors: { _: ['Validasi gagal'] },
      });
    }

    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const message = error.message || 'Terjadi kesalahan pada server.';
    const errors = error.errors;

    console.error(`[${statusCode}] ${code}: ${message}`, error);
    return reply.code(statusCode).send({
      success: false,
      message,
      code,
      errors,
    });
  });

  // Health check
  fastify.get('/api/health', async (_request: any, reply: any) => {
    return reply.code(200).send({ success: true, message: 'Server berjalan' });
  });

  // Public routes (Participant)
  await fastify.register(
    (instance: FastifyInstance) => participantPublicRoutes(instance),
    { prefix: '/api/participant' },
  );

  // Admin auth routes (public)
  await fastify.register(
    (instance: FastifyInstance) => adminAuthRoutes(instance),
    { prefix: '/api/admin' },
  );

// Admin protected routes
  await fastify.register(
    (instance: FastifyInstance) => {
      instance.addHook('preHandler', fastify.authenticateAdmin as any);
      adminProtectedRoutes(instance);
    },
    { prefix: '/api/admin' },
  );

  // Admin participant routes (paginated list + detail)
  await fastify.register(
    (instance: FastifyInstance) => {
      instance.addHook('preHandler', fastify.authenticateAdmin as any);
      participantAdminRoutes(instance);
    },
    { prefix: '/api/admin/participants' },
  );

  // Question routes
  await fastify.register(
    (instance: FastifyInstance) => {
      instance.addHook('preHandler', fastify.authenticateAdmin as any);
      questionRoutes(instance);
    },
    { prefix: '/api/admin/questions' },
  );

  // Game routes
  await fastify.register(
    (instance: FastifyInstance) => {
      instance.addHook('preHandler', fastify.authenticateAdmin as any);
      gameRoutes(instance);
    },
    { prefix: '/api/admin/games' },
  );

  // Setting routes
  await fastify.register(
    (instance: FastifyInstance) => {
      instance.addHook('preHandler', fastify.authenticateAdmin as any);
      settingRoutes(instance);
    },
    { prefix: '/api/admin/settings' },
  );

  return fastify;
}
