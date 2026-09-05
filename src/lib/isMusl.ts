import fs from 'fs';
import { reportHeader } from '../compat.ts';
import type { ReportHeader } from '../types.ts';

const MUSL_LOADER = /^ld-musl-/;

export function isMuslHeader(header: ReportHeader | null): boolean {
  return !!header && typeof header.glibcVersionRuntime !== 'string';
}

export function isMuslLib(files: string[]): boolean {
  for (let i = 0; i < files.length; i++) {
    if (MUSL_LOADER.test(files[i])) return true;
  }
  return false;
}

export default function isMusl(): boolean {
  if (process.platform !== 'linux') return false;
  const header = reportHeader();
  if (header) return isMuslHeader(header);
  // no report below Node 12: the musl loader sits directly in /lib
  try {
    return isMuslLib(fs.readdirSync('/lib'));
  } catch (_err) {
    return false; // an unreadable /lib is no evidence of musl, so keep the glibc list
  }
}
