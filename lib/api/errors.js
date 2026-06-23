/**
 * Typed API errors for consistent HTTP responses.
 */
export class ApiError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(message, 401, 'AUTH_REQUIRED');
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static conflict(message, details) {
    return new ApiError(message, 409, 'CONFLICT', details);
  }

  static tooMany(message = 'Too many requests') {
    return new ApiError(message, 429, 'RATE_LIMITED');
  }
}
