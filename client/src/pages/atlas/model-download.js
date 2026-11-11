/**
 * Static hosts may serve .gz as a compressed response or as a gzip file.
 * Fetch already decodes Content-Encoding; inspect the payload to avoid
 * decoding twice.
 */
export async function decodeModelResponse(response, expectedBytes, compressed) {
  if (!response.ok) throw new Error('Không tải được tệp giải phẫu.');
  const payload = await response.arrayBuffer();
  const signature = new Uint8Array(payload, 0, Math.min(2, payload.byteLength));
  const gzip = compressed && signature[0] === 0x1f && signature[1] === 0x8b;

  if (compressed && !gzip && payload.byteLength !== expectedBytes) {
    throw new Error('Tệp giải phẫu bị thiếu hoặc không đúng định dạng.');
  }

  if (gzip && typeof DecompressionStream === 'undefined') {
    throw new Error(
      'Trình duyệt chưa hỗ trợ giải nén gzip. Hãy cập nhật Chrome, Edge, Firefox hoặc Safari.',
    );
  }

  const buffer = gzip
    ? await new Response(
        new Blob([payload]).stream().pipeThrough(new DecompressionStream('gzip')),
      ).arrayBuffer()
    : payload;

  if (buffer.byteLength !== expectedBytes) {
    throw new Error('Tệp giải phẫu chưa tải đầy đủ. Hãy tải lại trang.');
  }
  return buffer;
}
