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
 * Tải nội dung có giới hạn dung lượng, timeout và kiểm tra SSRF ở từng redirect.
 * Trả về Buffer để dùng cho cả HTML, XML và PDF.
 */
export async function fetchBuffer(
  input,
  { timeout = 30000, maxBytes = 6 * 1024 * 1024, headers = {}, accept = '*/*' } = {},
) {
  let current = await assertPublicUrl(input);
  for (let hop = 0; hop <= 3; hop += 1) {
    let response;
    try {
      response = await fetch(current, {
        headers: { 'User-Agent': USER_AGENT, Accept: accept, ...headers },
        redirect: 'manual',
        signal: AbortSignal.timeout(timeout),
      });
    } catch (error) {
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

    const declared = Number(response.headers.get('content-length') || 0);
    if (declared && declared > maxBytes) {
      throw new ApiError(413, 'SOURCE_TOO_LARGE', 'Nguồn quá lớn để xử lý');
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) {
      throw new ApiError(413, 'SOURCE_TOO_LARGE', 'Nguồn quá lớn để xử lý');
    }
    return {
      buffer,
      contentType: response.headers.get('content-type') || '',
      finalUrl: current.toString(),
    };
  }
  throw new ApiError(502, 'TOO_MANY_REDIRECTS', 'Nguồn chuyển hướng quá nhiều lần');
}

/** Gọi API JSON tin cậy (Crossref, Europe PMC, Unpaywall...) với timeout và lỗi thống nhất. */
export async function fetchJson(url, { timeout = 25000, headers = {} } = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...headers },
      signal: AbortSignal.timeout(timeout),
    });
  } catch (error) {
    throw new ApiError(504, 'UPSTREAM_TIMEOUT', `Nguồn dữ liệu không phản hồi: ${error.message}`);
  }
  if (!response.ok) {
    throw new ApiError(502, 'UPSTREAM_ERROR', `Nguồn dữ liệu trả lỗi HTTP ${response.status}`);
  }
  try {
    return await response.json();
  } catch {
    throw new ApiError(502, 'UPSTREAM_INVALID', 'Nguồn dữ liệu trả về không phải JSON');
  }
}
