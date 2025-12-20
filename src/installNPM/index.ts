import Queue from 'queue-cb';
import type { InstallOptions, NoParamCallback } from '../types.ts';
import installBin from './installBin.ts';
import installLib from './installLib.ts';

export default function install(version: string, dest: string, options: InstallOptions, callback: NoParamCallback): void {
  let npmVersion: string | null = null;
  let checksum: string | undefined;

  const queue = new Queue(1);
  queue.defer((cb) =>
    installLib(version, dest, options, (err, _npmVersion, _checksum) => {
      npmVersion = _npmVersion;
      checksum = _checksum;
      cb(err);
    })
  );
  queue.defer(installBin.bind(null, version, dest, options));
  queue.await((err) => {
    let message = `npm ${npmVersion || ''}`;
    if (!err) {
      message += ' installed';
      if (checksum) message += ` (${checksum.slice(0, 8)})`;
    } else {
      message += ` install failed. Error: ${err.message}`;
    }
    console.log(message);
    callback(err);
  });
}
