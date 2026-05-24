const API_URLS = [
  process.env.NEXT_PUBLIC_API_BASE_URL,
  process.env.NEXT_PUBLIC_API_BASE_URL_1,
  process.env.NEXT_PUBLIC_API_BASE_URL_2,
].filter((u): u is string => typeof u === "string" && u.trim() !== "");

export const UNIQUE_API_URLS = [...new Set(API_URLS)];

const circuitBreaker = new Map<
  string,
  { failures: number; openUntil: number }
>();
const FAILURE_THRESHOLD = 2;
const RECOVERY_MS = 30_000;

export function isHealthy(base: string): boolean {
  const s = circuitBreaker.get(base);
  if (!s) return true;
  if (s.openUntil > Date.now()) return false;
  return true;
}

export function recordFailure(base: string) {
  const s = circuitBreaker.get(base) ?? { failures: 0, openUntil: 0 };
  s.failures += 1;
  if (s.failures >= FAILURE_THRESHOLD) {
    s.openUntil = Date.now() + RECOVERY_MS;
    console.warn(`[LB] Circuit OPEN for ${base}`);
  }
  circuitBreaker.set(base, s);
}

export function recordSuccess(base: string) {
  circuitBreaker.delete(base);
}

export function getHealthyBases(): string[] {
  return UNIQUE_API_URLS.filter(isHealthy);
}

let rrIndex = 0;
export function getNextHealthyBase(): string | null {
  const healthy = getHealthyBases();
  if (healthy.length === 0) return null;
  return healthy[rrIndex++ % healthy.length];
}
