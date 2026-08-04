/**
 * Configuration Loader (Serverless)
 * Inlined from apps/backend/src/config/index.ts
 */

import dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string, defaultValue: string = ''): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;
  database: {
    url: string;
    ssl: boolean;
    sslRejectUnauthorized: boolean;
  };
  jwt: {
    secret: string;
    issuer: string;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
  cookie: {
    domain: string;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
  };
  adminWhatsapp: string;
  cloudinaryCloudName: string;
  logLevel: string;
}

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const jwtSecret = getEnv('JWT_SECRET', '');
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET wajib diisi dan minimal 32 karakter.');
  }

  const databaseUrl = getEnv('DATABASE_URL', '');
  if (!databaseUrl) {
    throw new Error('DATABASE_URL wajib diisi.');
  }

  cachedConfig = {
    nodeEnv: getEnv('NODE_ENV', 'development'),
    port: getEnvNumber('PORT', 3000),
    host: getEnv('HOST', '0.0.0.0'),
    database: {
      url: databaseUrl,
      ssl: getEnvBoolean('PG_SSL', false),
      sslRejectUnauthorized: getEnvBoolean('PG_SSL_REJECT_UNAUTHORIZED', false),
    },
    jwt: {
      secret: jwtSecret,
      issuer: getEnv('JWT_ISSUER', 'tkd-setra'),
    },
    cors: {
      origin: getEnv('CORS_ORIGIN', '*'),
      credentials: getEnvBoolean('CORS_CREDENTIALS', true),
    },
    cookie: {
      domain: getEnv('COOKIE_DOMAIN', ''),
      secure: getEnvBoolean('COOKIE_SECURE', true),
      sameSite: getEnv('COOKIE_SAMESITE', 'lax') as 'lax' | 'strict' | 'none',
    },
    adminWhatsapp: getEnv('ADMIN_WHATSAPP', '6281318138660'),
    cloudinaryCloudName: getEnv('CLOUDINARY_CLOUD_NAME', ''),
    logLevel: getEnv('LOG_LEVEL', 'info'),
  };

  return cachedConfig;
}

export type Config = ReturnType<typeof getConfig>;