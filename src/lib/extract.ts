import fastExtract from 'fast-extract';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';

import type { NoParamCallback } from '../types.ts';

interface ExtractOptions {
  strip?: number;
  time?: number;
}

export default function extract(src: string, dest: string, options: ExtractOptions | NoParamCallback, callback?: NoParamCallback): undefined {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const extractOptions = { strip: 1, time: 1000, ...options };

  const queue = new Queue(1);
  queue.defer(mkdirp.bind(null, path.dirname(dest)));
  queue.defer(fastExtract.bind(null, src, dest, extractOptions));
  queue.await(callback);
}
