import dns from 'node:dns/promises';
import net from 'node:net';
import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

const blockList = new net.BlockList();
const V4_BLOCKS = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];
for (const [address, prefix] of V4_BLOCKS) blockList.addSubnet(address, prefix, 'ipv4');
blockList.addAddress('::', 'ipv6');
blockList.addAddress('::1', 'ipv6');
blockList.addSubnet('fc00::', 7, 'ipv6');
blockList.addSubnet('fe80::', 10, 'ipv6');
blockList.addSubnet('ff00::', 8, 'ipv6');
// IPv6 có thể ánh xạ tới IPv4 nội bộ (NAT64, 6to4, tài liệu).
blockList.addSubnet('64:ff9b::', 96, 'ipv6');
blockList.addSubnet('2002::', 16, 'ipv6');
blockList.addSubnet('2001:db8::', 32, 'ipv6');

export const USER_AGENT = `PTBrain/0.2 (mailto:${env.CONTACT_EMAIL})`;

export function isPrivateAddress(address) {
  const mapped = address.startsWith('::ffff:') ? address.slice(7) : address;
  const family = net.isIP(mapped);
  if (!family) return true;
  return blockList.check(mapped, family === 6 ? 'ipv6' : 'ipv4');
}

/** Chặn SSRF: chỉ cho http/https tới host public, không phải localhost/mạng nội bộ. */
export async function assertPublicUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw ApiError.badRequest('URL không hợp lệ');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw ApiError.badRequest('Chỉ hỗ trợ URL http/https');
  }
  if (url.username || url.password) {
    throw ApiError.badRequest('URL không được chứa thông tin đăng nhập');
  }
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    throw ApiError.badRequest('Không cho phép URL nội bộ');
  }
  if (net.isIP(host)) {
    if (isPrivateAddress(host)) throw ApiError.badRequest('Không cho phép URL nội bộ');
    return url;
  }
  let addresses;
  try {
    addresses = await dns.lookup(host, { all: true });
  } catch {
    throw new ApiError(502, 'DNS_FAILED', 'Không phân giải được tên miền của URL');
  }
  if (!addresses.length || addresses.some((a) => isPrivateAddress(a.address))) {
    throw ApiError.badRequest('Không cho phép URL nội bộ');
  }
  return url;
}

/**
 * Đọc body theo stream và dừng ngay khi vượt giới hạn. Không dùng arrayBuffer()
 * trực tiếp vì server có thể trả Content-Length giả hoặc không khai báo, khiến
 * một response rất lớn làm cạn RAM trước khi kiểm tra được kích thước.
 */
async function readBodyWithLimit(response, maxBytes) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared && declared > maxBytes) {
    throw new ApiError(413, 'SOURCE_TOO_LARGE', 'Nguồn quá lớn để xử lý');
  }

  if (!response.body) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) {
      throw new ApiError(413, 'SOURCE_TOO_LARGE', 'Nguồn quá lớn để xử lý');
    }
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel().catch(() => {});
        throw new ApiError(413, 'SOURCE_TOO_LARGE', 'Nguồn quá lớn để xử lý');
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock?.();
  }
  return Buffer.concat(chunks, size);
}

// --------------------------------------------------------------------------- //
// Rate limit theo host (politeness) — giữ đúng nhịp các API học thuật.
// --------------------------------------------------------------------------- //

const HOST_MIN_INTERVAL_MS = {
  'api.openalex.org': 120,
  'api.crossref.org': 100,
  'eutils.ncbi.nlm.nih.gov': 350,
  'www.ebi.ac.uk': 200,
  'api.unpaywall.org': 200,
  'api.semanticscholar.org': 1100,
  'export.arxiv.org': 3000,
  'doi.org': 200,
  'api.core.ac.uk': 1000,
};
const DEFAULT_MIN_INTERVAL_MS = 250;
const hostNextAt = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

async function waitForHostSlot(url) {
  const host = hostOf(url);
  if (!host) return;
  const interval = HOST_MIN_INTERVAL_MS[host] ?? DEFAULT_MIN_INTERVAL_MS;
  const now = Date.now();
  const next = Math.max(now, hostNextAt.get(host) || 0);
  // Đặt chỗ trước cho request này; các request đồng thời sẽ nối tiếp nhau.
  hostNextAt.set(host, next + interval);
  const wait = next - now;
  if (wait > 0) await sleep(wait);
}

// --------------------------------------------------------------------------- //
// Cache JSON trong RAM (TTL + giới hạn số entry/kích thước).
// Chỉ cache GET JSON thành công; không cache PDF để tránh giữ hàng chục MB.
// --------------------------------------------------------------------------- //

const JSON_CACHE_TTL_MS = 5 * 60 * 1000;
const JSON_CACHE_MAX_ENTRIES = 400;
const JSON_CACHE_MAX_BYTES = 8 * 1024 * 1024;
const jsonCache = new Map();
let jsonCacheBytes = 0;

function jsonCacheKey(url, headers = {}) {
  const accept = headers.Accept || headers.accept || 'application/json';
  return `${url}\n${accept}`;
}

function cacheGet(key) {
  const entry = jsonCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    jsonCache.delete(key);
    jsonCacheBytes -= entry.bytes;
    return undefined;
  }
  // Map giữ thứ tự chèn: chạm lại để LRU đẩy entry này ra cuối.
  jsonCache.delete(key);
  jsonCache.set(key, entry);
  return entry.value;
}

function cacheSet(key, value, ttlMs = JSON_CACHE_TTL_MS) {
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return;
  }
  if (!serialized || serialized.length > JSON_CACHE_MAX_BYTES / 4) return;
  const bytes = Buffer.byteLength(serialized);
  if (bytes > JSON_CACHE_MAX_BYTES) return;

  const existing = jsonCache.get(key);
  if (existing) {
    jsonCache.delete(key);
    jsonCacheBytes -= existing.bytes;
  }
  jsonCache.set(key, { value, bytes, expiresAt: Date.now() + ttlMs });
  jsonCacheBytes += bytes;

  while (jsonCache.size > JSON_CACHE_MAX_ENTRIES || jsonCacheBytes > JSON_CACHE_MAX_BYTES) {
    const oldestKey = jsonCache.keys().next().value;
    if (oldestKey === undefined) break;
    const oldest = jsonCache.get(oldestKey);
    jsonCache.delete(oldestKey);
    jsonCacheBytes -= oldest?.bytes || 0;
  }
}

/** Xoá cache + trạng thái rate limit; dùng cho test hoặc khi cần reset thủ công. */
export function clearHttpCache() {
  jsonCache.clear();
  jsonCacheBytes = 0;
  hostNextAt.clear();
}

// --------------------------------------------------------------------------- //
// Retry: 429/5xx và lỗi mạng, có tôn trọng Retry-After.
// --------------------------------------------------------------------------- //

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 2;

function parseRetryAfter(value) {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 10000);
  const date = Date.parse(value);
  if (Number.isFinite(date)) return Math.min(Math.max(0, date - Date.now()), 10000);
  return null;
}

function backoffDelay(attempt) {
  const base = Math.min(3000, 300 * 2 ** attempt);
  return base + Math.floor(Math.random() * 150);
}

async function requestWithRetry(url, options, { timeout = 25000, retries = MAX_RETRIES } = {}) {
  let attempt = 0;
  for (;;) {
    await waitForHostSlot(url);
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeout) });
      if (!RETRYABLE_STATUS.has(response.status) || attempt >= retries) return response;
      const retryAfter = parseRetryAfter(response.headers.get('retry-after'));
      await response.body?.cancel?.().catch(() => {});
      await sleep(retryAfter ?? backoffDelay(attempt));
      attempt += 1;
    } catch (error) {
      if (attempt >= retries) throw error;
      await sleep(backoffDelay(attempt));
      attempt += 1;
    }
  }
}

/**
 * Tải nội dung có giới hạn dung lượng, timeout và kiểm tra SSRF ở từng redirect.
 * Trả về Buffer để dùng cho cả HTML, XML và PDF.
 */
export async function fetchBuffer(
  input,
  { timeout = 30000, maxBytes = 6 * 1024 * 1024, headers = {}, accept = '*/*', retries = MAX_RETRIES } = {},
) {
  let current = await assertPublicUrl(input);
  for (let hop = 0; hop <= 3; hop += 1) {
    let response;
    try {
      response = await requestWithRetry(
        current.toString(),
        {
          headers: { 'User-Agent': USER_AGENT, Accept: accept, ...headers },
          redirect: 'manual',
        },
        { timeout, retries },
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(504, 'FETCH_TIMEOUT', `Không tải được nguồn: ${error.message}`);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) throw new ApiError(502, 'FETCH_FAILED', 'Nguồn chuyển hướng không hợp lệ');
      current = await assertPublicUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) {
      throw new ApiError(502, 'FETCH_FAILED', `Không tải được nguồn (HTTP ${response.status})`);
    }

    const buffer = await readBodyWithLimit(response, maxBytes);
    return {
      buffer,
      contentType: response.headers.get('content-type') || '',
      finalUrl: current.toString(),
    };
  }
  throw new ApiError(502, 'TOO_MANY_REDIRECTS', 'Nguồn chuyển hướng quá nhiều lần');
}

/** Gọi API JSON tin cậy (Crossref, Europe PMC, Unpaywall...) với timeout + cache + retry. */
export async function fetchJson(
  url,
  {
    timeout = 25000,
    headers = {},
    maxBytes = 2 * 1024 * 1024,
    cache = true,
    cacheTtlMs = JSON_CACHE_TTL_MS,
    retries = MAX_RETRIES,
  } = {},
) {
  const key = jsonCacheKey(url, headers);
  if (cache) {
    const hit = cacheGet(key);
    if (hit !== undefined) return hit;
  }

  let response;
  try {
    response = await requestWithRetry(
      url,
      {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...headers },
        redirect: 'follow',
      },
      { timeout, retries },
    );
  } catch (error) {
    throw new ApiError(504, 'UPSTREAM_TIMEOUT', `Nguồn dữ liệu không phản hồi: ${error.message}`);
  }
  if (!response.ok) {
    throw new ApiError(502, 'UPSTREAM_ERROR', `Nguồn dữ liệu trả lời HTTP ${response.status}`);
  }
  const buffer = await readBodyWithLimit(response, maxBytes);
  let data;
  try {
    data = JSON.parse(buffer.toString('utf8'));
  } catch {
    throw new ApiError(502, 'UPSTREAM_INVALID', 'Nguồn dữ liệu trả về không phải JSON');
  }
  if (cache) cacheSet(key, data, cacheTtlMs);
  return data;
}
