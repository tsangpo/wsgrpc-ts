function StatusCode(statusCode: number, statusMessage: string) {
  return { statusCode, statusMessage };
}

export function HttpError(statusCode: number, message: string) {
  return { statusCode, message };
}

export const HttpStatusCodes = {
  NoContent: StatusCode(204, "No Content"),
  BadRequest: StatusCode(400, "Bad Request"),
  Unauthorized: StatusCode(401, "Unauthorized"),
  Forbidden: StatusCode(403, "Forbidden"),
  NotFound: StatusCode(404, "Not Found"),
  MethodNotAllowed: StatusCode(405, "Method Not Allowed"),
  UnsupportedMediaType: StatusCode(415, "Unsupported Media Type"),
  InternalServerError: StatusCode(500, "Internal Server Error"),
  NotImplemented: StatusCode(501, "Not Implemented"),
};
