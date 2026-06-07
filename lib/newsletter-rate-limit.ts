const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

type RateLimitEntry = {
  timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

export function checkNewsletterRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip) ?? { timestamps: [] };
  const recent = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  return recent.length < RATE_LIMIT_MAX;
}

export function recordNewsletterSubmission(ip: string): void {
  const now = Date.now();
  const entry = store.get(ip) ?? { timestamps: [] };
  const recent = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  store.set(ip, { timestamps: recent });

  if (store.size > 10_000) {
    for (const [key, value] of store) {
      const filtered = value.timestamps.filter(
        (t) => now - t < RATE_LIMIT_WINDOW_MS
      );
      if (filtered.length === 0) {
        store.delete(key);
      } else {
        store.set(key, { timestamps: filtered });
      }
    }
  }
}
