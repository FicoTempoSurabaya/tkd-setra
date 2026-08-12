/**
 * Shared Utilities
 * Inlined from packages/shared untuk deployment flat structure.
 */

// ============================================================
// TOKEN GENERATION
// ============================================================
export function generatePublicToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 8; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return segments.join('-');
}

// ============================================================
// WHATSAPP NORMALIZATION
// ============================================================
export function normalizeWhatsapp(whatsapp: string): string {
  const cleaned = whatsapp.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('62')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.substring(1);
  }
  return cleaned;
}

// ============================================================
// TIMER CALCULATION
// ============================================================
export function calculateRemainingSeconds(startedAt: string | null, durationSeconds: number): number {
  if (!startedAt) return durationSeconds;
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  return Math.max(0, durationSeconds - elapsed);
}