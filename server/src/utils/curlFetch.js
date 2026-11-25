import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { assertPublicUrl } from './http.js';

const PREPRINT_HOSTS = new Set([
  'biorxiv.org',
  'www.biorxiv.org',
  'medrxiv.org',
  'www.medrxiv.org',
]);

/** Chỉ dùng curl cho các host preprint bị Cloudflare chặn TLS/fingerprint của Node. */
export function isPreprintHost(url = '') {
  try {
    return PREPRINT_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

/**
 * Fallback tải file qua curl khi Node fetch bị Cloudflare trả 429/403.
 * Không dùng cho HTML landing page; chỉ dùng cho PDF trực tiếp của biorxiv/medrxiv.
 *
 * An toàn: kiểm tra SSRF ở URL đầu và URL cuối, chỉ cho https, giới hạn
 * redirect/thời gian/dung lượng, dùng mảng args (không qua shell).
 */
export async function fetchBufferWithCurl(
  input,
  { maxBytes = 30 * 1024 * 1024, timeout = 20000, headers = {}, accept = 'application/pdf' } = {},
) {
  const startUrl = await assertPublicUrl(input);
  const tempFile = path.join(os.tmpdir(), `ptbrain-curl-${randomUUID()}.bin`);
  const args = [
    '-sS',
    '-L',
    '--fail',
    '--proto',
    '=https',
    '--max-redirs',
    '3',
    '--max-time',
    String(Math.max(5, Math.ceil(timeout / 1000))),
    '--max-filesize',
    String(maxBytes),
    '--compressed',
    '-A',
    String(headers['User-Agent'] || headers['user-agent'] || DEFAULT_UA),
    '-H',
    `Accept: ${accept}`,
    '-o',
    tempFile,
    '--write-out',
    '%{http_code}\n%{content_type}\n%{url_effective}',
    startUrl.toString(),
  ];

  for (const [name, value] of Object.entries(headers)) {
    if (['User-Agent', 'user-agent', 'Accept', 'accept'].includes(name)) continue;
    args.push('-H', `${name}: ${value}`);
  }

  let timer;
  try {
    const result = await new Promise((resolve, reject) => {
      const child = spawn('curl', args, { windowsHide: true });
      const stdout = [];
      const stderr = [];

      timer = setTimeout(() => {
        child.kill();
        reject(new Error('curl fallback quá thời gian'));
      }, timeout + 3000);

      child.stdout.on('data', (chunk) => stdout.push(chunk));
      child.stderr.on('data', (chunk) => stderr.push(chunk));
      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          reject(
            new Error(
              `curl fallback thất bại (exit ${code}): ${Buffer.concat(stderr)
                .toString('utf8')
                .slice(0, 180)}`,
            ),
          );
          return;
        }
        resolve(Buffer.concat(stdout).toString('utf8'));
      });
    });

    const [statusLine, contentType = '', finalUrl = ''] = String(result)
      .trim()
      .split('\n');
    const status = Number(statusLine);
    if (!Number.isFinite(status) || status < 200 || status >= 300) {
      throw new Error(`curl fallback HTTP ${statusLine || '?'}`);
    }

    const normalizedFinal = await assertPublicUrl(finalUrl || startUrl.toString());
    const stat = await fs.stat(tempFile);
    if (!stat.size || stat.size > maxBytes) {
      throw new Error(`curl fallback dung lượng không hợp lệ (${stat.size} bytes)`);
    }

    return {
      buffer: await fs.readFile(tempFile),
      contentType,
      finalUrl: normalizedFinal.toString(),
    };
  } finally {
    if (timer) clearTimeout(timer);
    await fs.unlink(tempFile).catch(() => {});
  }
}
