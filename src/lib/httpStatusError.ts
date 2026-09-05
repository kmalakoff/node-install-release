export type HttpStatusError = Error & { statusCode: number | undefined };

// 2xx is success; otherwise an Error naming the code and endpoint, with statusCode set for callers to branch on
export default function httpStatusError(endpoint: string, statusCode: number | undefined): HttpStatusError | null {
  if (statusCode !== undefined && statusCode >= 200 && statusCode < 300) return null;
  const err = new Error(`HTTP ${statusCode} ${endpoint}`) as HttpStatusError;
  err.statusCode = statusCode;
  return err;
}
