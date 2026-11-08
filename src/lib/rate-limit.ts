/**
 * Простой лимит попыток в памяти процесса.
 * Для одного инстанса этого достаточно; при масштабировании заменить на Redis.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function hitLimit(key: string, limit = 8, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  if (buckets.size > 5000) {
    for (const [oldKey, value] of buckets) {
      if (value.resetAt < now) buckets.delete(oldKey);
    }
  }
  return bucket.count > limit;
}
