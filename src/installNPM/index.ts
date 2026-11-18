import Queue from 'queue-cb';
import type { NoParamCallback, ResolvedInstallOptions } from '../types.ts';
import installBin from './installBin.ts';
import installLib from './installLib.ts';

export default function install(version: string, dest: string, options: ResolvedInstallOptions, callback: NoParamCallback): void {
  let npmVersion: string | null | undefined = null;

  const queue = new Queue(1);
  queue.defer((cb) =>
    installLib(version, dest, options, (err, _npmVersion) => {
      npmVersion = _npmVersion;
      cb(err);
    })
  );
  queue.defer(installBin.bind(null, version, dest, options));
  queue.await((err) => {
    let message = `npm ${npmVersion || ''}`;
    if (!err) {
      message += ' installed';
    } else {
      message += ` install failed. Error: ${err.message}`;
    }
    console.log(message);
    callback(err);
  });
}
