import { describe, it, expect } from 'vitest';
import { trpc } from '../lib/trpc';

describe('tRPC client', () => {
  it('should export a trpc client', () => {
    expect(trpc).toBeDefined();
  });
});
