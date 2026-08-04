/**
 * Error Classes
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = 400,
    code: string = 'APP_ERROR',
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Data tidak valid', errors?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Tidak terautentikasi') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Akses ditolak') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Data tidak ditemukan') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Konflik data') {
    super(message, 409, 'CONFLICT');
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Terlalu banyak permintaan') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

export class MaintenanceError extends AppError {
  constructor(message: string = 'Sistem sedang dalam pemeliharaan') {
    super(message, 503, 'MAINTENANCE');
  }
}