export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = 'Dữ liệu không hợp lệ', details) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Chưa đăng nhập hoặc phiên đã hết hạn') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Không có quyền truy cập') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Không tìm thấy dữ liệu') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'Dữ liệu đã tồn tại') {
    return new ApiError(409, 'CONFLICT', message);
  }
}
