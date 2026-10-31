/** Nén ảnh phía client trước khi gửi AI để giảm payload và tăng tốc. */
export async function compressImage(file, { maxSize = 1280, quality = 0.85 } = {}) {
  if (!file || !file.type?.startsWith('image/')) return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) =>
    canvas.toBlob((result) => resolve(result), 'image/jpeg', quality),
  );
  if (!blob) return file;
  const name = (file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}
