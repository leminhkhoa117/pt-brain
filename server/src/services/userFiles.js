import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Summary } from '../models/Summary.js';
import { removePdfFile } from './research/pdf.js';
import { removeImageFile } from '../utils/image.js';

/**
 * Thư mục upload dùng chung. Tên file luôn do server sinh ra, nhưng vẫn dùng
 * path.basename khi xóa để không bao giờ ghi/xóa ngoài thư mục upload.
 */
const UPLOAD_ROOT = fileURLToPath(new URL('../../uploads/', import.meta.url));
export const PHOTO_DIR = path.join(UPLOAD_ROOT, 'photos');
export const MEAL_IMAGE_DIR = path.join(UPLOAD_ROOT, 'meals');
export const ASSESSMENT_IMAGE_DIR = path.join(UPLOAD_ROOT, 'assessments');

/** Xóa danh sách file ảnh; lỗi file không còn tồn tại không làm hỏng request. */
export async function removeImageFiles(dir, filenames = []) {
  const safeNames = filenames
    .filter((name) => typeof name === 'string' && name.trim())
    .map((name) => path.basename(name));

  await Promise.all(safeNames.map((name) => removeImageFile(dir, name)));
}

/**
 * Xóa PDF gốc nếu không còn Summary nào (của bất kỳ user nào) tham chiếu hash.
 * File được dedupe theo SHA-256 nên không được xóa chỉ vì một tài khoản bị xóa.
 */
export async function removeOrphanPdfs(hashes = []) {
  const unique = [...new Set(hashes.filter((hash) => typeof hash === 'string' && hash))];

  for (const hash of unique) {
    const remaining = await Summary.countDocuments({ pdfHash: hash });
    if (!remaining) await removePdfFile(hash);
  }
}
