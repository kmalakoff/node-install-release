import mkdirp from 'mkdirp-classic';
import Module from 'module';
import path from 'path';
import Queue from 'queue-cb';

import type { NoParamCallback } from '../types.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

interface ExtractOptions {
  strip?: number;
  time?: number;
}

export default function extract(src: string, dest: string, options: ExtractOptions | NoParamCallback, callback?: NoParamCallback): void {
  callback = typeof options === 'function' ? options : callback;
  options = typeof options === 'function' ? {} : options;

  const extractOptions = { strip: 1, time: 1000, ...options };
  // deferred: fast-extract pulls tar/zip/7z/xz/bzip2 decompressors, only needed when an archive is actually extracted
  const fastExtractModule = _require('fast-extract');
  const fastExtract = fastExtractModule.default || fastExtractModule;
  const queue = new Queue(1);
  queue.defer((cb) => mkdirp(path.dirname(dest), (err) => cb(err)));
  queue.defer(fastExtract.bind(null, src, dest, extractOptions));
  queue.await(callback!);
}
