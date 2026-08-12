/**
 * Admin Routes (Serverless)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { adminLoginSchema } from './schemas.js';
import { sendSuccess, sendError } from './response.js';
import { ValidationError, UnauthorizedError } from './errors.js';
import { adminRepository } from './repositories.js';
import { verifyPassword, createAdminCookieOptions, resetLoginAttempts } from './auth.js';
import { ADMIN_COOKIE_NAME } from './constants.js';
import type { AdminJwtPayload } from './auth.js';

export function adminAuthRoutes(fastify: FastifyInstance): void {
  // POST /api/admin/login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = adminLoginSchema.safeParse(request.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      throw new ValidationError('Data tidak valid', errors);
    }

    const { password } = parsed.data;
    const storedHash = await adminRepository.getPasswordHash();

    if (!storedHash || !(await verifyPassword(storedHash, password))) {
      resetLoginAttempts();
      return sendError(reply, 'Password salah', 401);
    }

resetLoginAttempts();
    const payload: AdminJwtPayload = { administratorId: '1' };

    const token = await reply.jwtSign(payload);
    const cookieOptions = createAdminCookieOptions();

    reply.setCookie(ADMIN_COOKIE_NAME, token, cookieOptions);

    return sendSuccess(reply, 'Login berhasil', { administratorId: '1' });
  });

// POST /api/admin/logout
  fastify.post('/logout', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie(ADMIN_COOKIE_NAME);
    return sendSuccess(reply, 'Logout berhasil');
  });

  // GET /api/admin/me
  fastify.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = await request.jwtVerify<AdminJwtPayload>();
      return sendSuccess(reply, 'Data admin', { administratorId: payload.administratorId });
    } catch {
      throw new UnauthorizedError('Session tidak valid.');
    }
  });
}

export function adminProtectedRoutes(_fastify: FastifyInstance): void {
  // Route peserta ditangani oleh participantAdminRoutes di app.ts
  // (GET /api/admin/participants dan /api/admin/participants/:id)
}
