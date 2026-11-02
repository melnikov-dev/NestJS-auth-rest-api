import ms from 'ms';

export function ttlToMs(ttl: string): number {
  const value = ms(ttl as ms.StringValue);
  if (typeof value !== 'number') {
    throw new Error(`Invalid TTL format: ${ttl}`);
  }
  return value;
}