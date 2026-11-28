import { describe, expect, it } from 'vitest';
import { parsePdfBuffer } from '../src/services/research/pdf.js';

describe('parsePdfBuffer safety', () => {
  it('từ chối buffer rỗng', async () => {
    await expect(parsePdfBuffer(Buffer.alloc(0))).rejects.toThrow('File PDF rỗng');
  });

  it('từ chối file không có magic bytes %PDF', async () => {
    await expect(parsePdfBuffer(Buffer.from('not a pdf'))).rejects.toThrow(
      'File không phải PDF hợp lệ',
    );
  });
});
