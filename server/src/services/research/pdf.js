import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { normalizeText } from '../../utils/text.js';
import {
  removeStoredFile,
  saveStoredFile,
  sendStoredFile,
  storedFileExists,
} from '../fileStore.js';
import { extractFigureHintsFromPages } from './figures.js';

const require = createRequire(import.meta.url);
// Import trực tiếp lib để tránh đoạn debug của package khi chạy như entrypoint
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const PDF_DIR = fileURLToPath(new URL('../../../uploads/papers/', import.meta.url));

export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/** Đường dẫn file PDF gốc đã lưu; chỉ nhận hash hex để tránh path traversal. */
export function pdfPathForHash(hash = '') {
  if (!/^[a-f0-9]{64}$/i.test(hash)) return '';
  return path.join(PDF_DIR, `${hash.toLowerCase()}.pdf`);
}

function pdfFilenameForHash(hash = '') {
  if (!/^[a-f0-9]{64}$/i.test(hash)) return '';
  return `${hash.toLowerCase()}.pdf`;
}

/** Lưu PDF người dùng tải lên để có thể mở lại đúng trang hình/bảng. */
export async function savePdfBuffer(buffer, hash) {
  const filename = pdfFilenameForHash(hash);
  if (!filename) throw ApiError.badRequest('Hash PDF không hợp lệ');

  if (env.STORAGE_DRIVER === 'mongo') {
    await saveStoredFile({
      kind: 'papers',
      filename,
      buffer,
      contentType: 'application/pdf',
    });
    return filename;
  }

  const filePath = pdfPathForHash(hash);
  await fs.mkdir(PDF_DIR, { recursive: true });
  await fs.writeFile(filePath, buffer);
  return filePath;
}

/** Xóa PDF gốc khi không còn bản tóm tắt nào tham chiếu tới hash đó. */
export async function removePdfFile(hash) {
  const filename = pdfFilenameForHash(hash);
  if (!filename) return;

  if (env.STORAGE_DRIVER === 'mongo') {
    await removeStoredFile('papers', filename);
    return;
  }

  const filePath = pdfPathForHash(hash);
  await fs.unlink(filePath).catch(() => {});
}

export async function pdfExists(hash) {
  const filename = pdfFilenameForHash(hash);
  if (!filename) return false;
  if (env.STORAGE_DRIVER === 'mongo') return storedFileExists('papers', filename);

  try {
    await fs.access(pdfPathForHash(hash));
    return true;
  } catch {
    return false;
  }
}

export async function sendPdfFile(req, res, hash) {
  const filename = pdfFilenameForHash(hash);
  if (!filename) throw ApiError.notFound('PDF_NOT_AVAILABLE', 'Hash PDF không hợp lệ.');

  if (env.STORAGE_DRIVER === 'mongo') {
    const found = await sendStoredFile(req, res, {
      kind: 'papers',
      filename,
      contentType: 'application/pdf',
      cacheControl: 'private, max-age=3600',
      disposition: 'inline; filename="paper.pdf"',
    });
    if (!found) {
      throw new ApiError(
        404,
        'PDF_NOT_AVAILABLE',
        'File PDF gốc không còn trên máy chủ. Hãy tải lại PDF nếu muốn xem hình.',
      );
    }
    return;
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="paper.pdf"');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  await new Promise((resolve, reject) => {
    res.sendFile(pdfPathForHash(hash), (error) => {
      if (!error) return resolve();
      if (error.code === 'ENOENT') {
        return reject(
          new ApiError(
            404,
            'PDF_NOT_AVAILABLE',
            'File PDF gốc không còn trên máy chủ. Hãy tải lại PDF nếu muốn xem hình.',
          ),
        );
      }
      return reject(error);
    });
  });
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

/** Đoán tiêu đề từ trang đầu PDF khi metadata/filename không có tiêu đề. */
export function inferTitleFromPage(pageText = '') {
  const lines = String(pageText)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const doiIndex = lines.findIndex((line) => /^doi\s*:/i.test(line));
  const start = doiIndex >= 0 ? doiIndex + 1 : 0;
  const parts = [];

  for (let i = start; i < lines.length && i < start + 10; i += 1) {
    const line = lines[i];
    if (!line) continue;
    if (
      /@|^doi\s*:|^https?:|www\.|department|university|hospital|institute|college|school|correspondence|e-?mail/i.test(
        line,
      )
    ) {
      break;
    }
    if (/^[A-Z][a-z]+\s+[A-Z]\.\s*[A-Z][a-z]+/.test(line)) break;
    if (/^(abstract|summary|introduction|background|keywords|received|accepted)/i.test(line)) break;
    if (/^(clinical section|original paper|research article|review article)$/i.test(line)) continue;
    if (/^[a-z]{2,}\s+\d{4}[;:]/i.test(line)) continue;
    if (line.length > 140) break;
    parts.push(line);
    if (parts.join(' ').length > 200) break;
  }

  const title = normalizeText(parts.join(' '));
  return title.length >= 12 && /[a-z]{3}/i.test(title) ? title.slice(0, 300) : '';
}

function pageTextRenderer(pageTexts) {
  return (pageData) =>
    pageData
      .getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false })
      .then((textContent) => {
        let lastY;
        let raw = '';
        for (const item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) raw += item.str;
          else raw += `\n${item.str}`;
          lastY = item.transform[5];
        }
        const pageText = normalizeText(raw);
        pageTexts[pageData.pageNumber - 1] = pageText;
        return pageText;
      });
}

/** Trích text từ PDF. PDF scan không có text sẽ trả lỗi rõ ràng (chưa hỗ trợ OCR). */
export async function parsePdfBuffer(buffer, { filename = '' } = {}) {
  if (!buffer?.length) throw ApiError.badRequest('File PDF rỗng');
  const pageTexts = [];
  let data;
  try {
    data = await pdfParse(buffer, { pagerender: pageTextRenderer(pageTexts) });
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
  const inferredTitle = inferTitleFromPage(pageTexts[0] || '');
  const title = isMeaningfulTitle(infoTitle)
    ? infoTitle
    : isMeaningfulTitle(fileTitle)
      ? fileTitle
      : inferredTitle;
  return {
    text,
    pages: data.numpages || 0,
    title,
    hash: sha256(buffer),
    figureHints: extractFigureHintsFromPages(pageTexts),
  };
}
