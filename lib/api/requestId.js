import crypto from 'crypto';

const HEADER = 'x-request-id';

export function generateRequestId() {
  return crypto.randomUUID();
}

export function getRequestId(req) {
  return req.headers.get(HEADER) || generateRequestId();
}

export function attachRequestId(response, requestId) {
  if (response instanceof Response) {
    response.headers.set(HEADER, requestId);
  }
  return response;
}

export { HEADER as REQUEST_ID_HEADER };
