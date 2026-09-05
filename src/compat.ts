/**
 * Compatibility Layer for Node.js 0.8+
 * Local to this package - contains only needed functions.
 */
import os from 'os';
import type { ReportHeader } from './types.ts';

export function homedir(): string {
  return typeof os.homedir === 'function' ? os.homedir() : require('homedir-polyfill')();
}

export function tmpdir(): string {
  return typeof os.tmpdir === 'function' ? os.tmpdir() : require('os-shim').tmpdir();
}

// process.report exists from Node 12; there is no diagnostic report below that
export function reportHeader(): ReportHeader | null {
  const report = process.report;
  if (!report || typeof report.getReport !== 'function') return null;
  const result = report.getReport() as { header?: ReportHeader };
  return result && typeof result === 'object' ? result.header || null : null;
}
