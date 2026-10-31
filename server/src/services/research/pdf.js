import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import { ApiError } from '../../utils/ApiError.js';
import { normalizeText } from '../../utils/text.js';

const require = createRequire(import.meta.url);
// Import trực tiếp lib để tránh đoạn debug của package khi chạy như entrypoint
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function cleanPdfTitle(value = '') {
  return normalizeText(String(value))
    .replace(/\.pdf$/i, '')
    .replace(/[_]+/g, ' ')
    .trim()
    .slice(0, 300);
}

export function isMeaningfulTitle(value = '') {
  const title = normalizeText(String(value));
  if (title.length < 12) return false;
  if (/\.(indd|pdf|docx?|tex|qxd)$/i.test(title)) return false;
  if (/^[A-Z0-9_-]{3,24}$/i.test(title)) return false;
  if (!/[a-z]{3,}/i.test(title)) return false;
  return true;
}

/** Trích text từ PDF. PDF scan không có text sẽ trả lỗi rõ ràng (chưa hỗ trợ OCR). */
export async function parsePdfBuffer(buffer, { filename = '' } = {}) {
  if (!buffer?.length) throw ApiError.badRequest('File PDF rỗng');
  let data;
  try {
    data = await pdfParse(buffer);
  } catch (error) {
    throw new ApiError(422, 'PDF_PARSE_FAILED', `Không đọc được PDF: ${error.message}`);
  }
  const text = normalizeText(data.text || '');
  if (text.length < 200) {
    throw new ApiError(
      422,
      'PDF_SCANNED',
      'PDF có thể là bản scan (không có lớp text). Hiện chưa hỗ trợ OCR — hãy upload bản PDF có text hoặc dán nội dung.',
    );
  }
  const infoTitle = data.info?.Title ? cleanPdfTitle(data.info.Title) : '';
  const fileTitle = cleanPdfTitle(filename);
  const title = isMeaningfulTitle(infoTitle)
    ? infoTitle
    : isMeaningfulTitle(fileTitle)
      ? fileTitle
      : '';
  return {
    text,
    pages: data.numpages || 0,
    title,
    hash: sha256(buffer),
  };
}
