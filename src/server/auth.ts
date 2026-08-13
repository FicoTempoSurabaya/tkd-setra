/**
 * Authentication Utilities (Serverless)
 * Inlined from apps/backend/src/utils/auth.ts
 */

import argon2 from 'argon2';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  ADMIN_SESSION_DURATION_SECONDS,
  ADMIN_COOKIE_NAME,
  LOGIN_MAX_ATTEMPTS,
  LOGIN_LOCK_STAGE_1_MINUTES,
  LOGIN_LOCK_STAGE_2_MINUTES,
  LOGIN_LOCK_STAGE_3_HOURS,
} from './constants.js';
import { getConfig } from './config.js';
import { TooManyRequestsError, UnauthorizedError } from './errors.js';

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export interface AdminJwtPayload {
  administratorId: string;
  iat?: number;
  exp?: number;
}

export function createAdminCookieOptions() {
  const config = getConfig();
  return {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite as 'lax' | 'strict' | 'none',
    domain: config.cookie.domain,
    path: '/',
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
  };
}

interface LoginAttempt {
  failures: number;
  stage: number;
  lockedUntil: Date | null;
}

let loginAttempts: LoginAttempt = {
  failures: 0,
  stage: 1,
  lockedUntil: null,
};

export function getLoginLockStatus(): { locked: boolean; lockedUntil: Date | null } {
  const now = new Date();
  if (loginAttempts.lockedUntil && loginAttempts.lockedUntil > now) {
    return { locked: true, lockedUntil: loginAttempts.lockedUntil };
  }
  if (loginAttempts.lockedUntil && loginAttempts.lockedUntil <= now) {
    loginAttempts.failures = 0;
    loginAttempts.lockedUntil = null;
  }
  return { locked: false, lockedUntil: null };
}

export function recordLoginFailure(): {
  locked: boolean;
  lockedUntil: Date | null;
  message: string;
} {
  loginAttempts.failures += 1;

  if (loginAttempts.failures >= LOGIN_MAX_ATTEMPTS) {
    const now = new Date();

    if (loginAttempts.stage === 1) {
      loginAttempts.lockedUntil = new Date(now.getTime() + LOGIN_LOCK_STAGE_1_MINUTES * 60 * 1000);
      loginAttempts.stage = 2;
      loginAttempts.failures = 0;
      return {
        locked: true,
        lockedUntil: loginAttempts.lockedUntil,
        message: `Login dikunci selama ${LOGIN_LOCK_STAGE_1_MINUTES} menit.`,
      };
    }

    if (loginAttempts.stage === 2) {
      loginAttempts.lockedUntil = new Date(now.getTime() + LOGIN_LOCK_STAGE_2_MINUTES * 60 * 1000);
      loginAttempts.stage = 3;
      loginAttempts.failures = 0;
      return {
        locked: true,
        lockedUntil: loginAttempts.lockedUntil,
        message: `Login dikunci selama ${LOGIN_LOCK_STAGE_2_MINUTES} menit.`,
      };
    }

    if (loginAttempts.stage === 3) {
      loginAttempts.lockedUntil = new Date(now.getTime() + LOGIN_LOCK_STAGE_3_HOURS * 60 * 60 * 1000);
      loginAttempts.failures = 0;
      return {
        locked: true,
        lockedUntil: loginAttempts.lockedUntil,
        message: `Login dikunci selama ${LOGIN_LOCK_STAGE_3_HOURS} jam.`,
      };
    }
  }

  const remaining = LOGIN_MAX_ATTEMPTS - loginAttempts.failures;
  return {
    locked: false,
    lockedUntil: null,
    message: `Password salah. Sisa percobaan: ${remaining}.`,
  };
}

export function resetLoginAttempts(): void {
  loginAttempts = {
    failures: 0,
    stage: 1,
    lockedUntil: null,
  };
}

export function assertNotLocked(): void {
  const status = getLoginLockStatus();
  if (status.locked && status.lockedUntil) {
    const remainingMs = status.lockedUntil.getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);
    throw new TooManyRequestsError(
      `Login dikunci. Coba lagi dalam ${remainingMin} menit.`,
    );
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticateAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    administratorId?: string;
  }
}

export async function setupAuth(fastify: FastifyInstance): Promise<void> {
  const config = getConfig();

  await fastify.register(cookie, {
    secret: config.jwt.secret,
  });

  await fastify.register(jwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: ADMIN_SESSION_DURATION_SECONDS,
    },
    cookie: {
      cookieName: ADMIN_COOKIE_NAME,
      signed: false,
    },
  });

  fastify.decorate('authenticateAdmin', async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      const payload = await request.jwtVerify<AdminJwtPayload>();
      request.administratorId = payload.administratorId;
    } catch {
      throw new UnauthorizedError('Session tidak valid. Silakan login kembali.');
    }
  });
}