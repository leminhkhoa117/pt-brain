import { describe, it, expect } from 'vitest';
import { assertPublicUrl, isPrivateAddress } from '../src/utils/http.js';

describe('SSRF guard', () => {
  it('nhận diện IP nội bộ', () => {
    expect(isPrivateAddress('127.0.0.1')).toBe(true);
    expect(isPrivateAddress('10.1.2.3')).toBe(true);
    expect(isPrivateAddress('172.16.5.4')).toBe(true);
    expect(isPrivateAddress('192.168.1.10')).toBe(true);
    expect(isPrivateAddress('169.254.169.254')).toBe(true);
    expect(isPrivateAddress('::1')).toBe(true);
    expect(isPrivateAddress('64:ff9b::7f00:1')).toBe(true);
    expect(isPrivateAddress('2002:7f00:1::')).toBe(true);
    expect(isPrivateAddress('8.8.8.8')).toBe(false);
    expect(isPrivateAddress('1.1.1.1')).toBe(false);
  });

  it('chặn localhost và IP nội bộ trong URL', async () => {
    await expect(assertPublicUrl('http://localhost:4000')).rejects.toThrow();
    await expect(assertPublicUrl('http://127.0.0.1/admin')).rejects.toThrow();
    await expect(assertPublicUrl('http://192.168.1.1')).rejects.toThrow();
  });

  it('chặn protocol không phải http/https', async () => {
    await expect(assertPublicUrl('file:///etc/passwd')).rejects.toThrow();
    await expect(assertPublicUrl('ftp://example.com/file')).rejects.toThrow();
  });

  it('chặn URL có userinfo', async () => {
    await expect(assertPublicUrl('https://user:pass@8.8.8.8/file')).rejects.toThrow();
  });

  it('cho phép IP public literal (không cần DNS)', async () => {
    const url = await assertPublicUrl('https://8.8.8.8/path');
    expect(url.hostname).toBe('8.8.8.8');
  });

  it('từ chối URL sai định dạng', async () => {
    await expect(assertPublicUrl('không phải url')).rejects.toThrow();
  });
});
