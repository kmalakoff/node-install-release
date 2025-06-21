import Queue from 'queue-cb';
import type { InstallOptions, NoParamCallback } from '../types.ts';
import installBin from './installBin.ts';
import installLib from './installLib.ts';

export default function install(version: string, dest: string, options: InstallOptions, callback: NoParamCallback): undefined {
  let npmVersion = null;

  const queue = new Queue(1);
  queue.defer((cb) =>
    installLib(version, dest, options, (err, _npmVersion) => {
      npmVersion = _npmVersion;
      cb(err);
    })
  );
  queue.defer(installBin.bind(null, version, dest, options));
  queue.await((err) => {
    console.log(`npm ${npmVersion || ''} ${!err ? 'installed' : `install failed. Error: ${err.message}`}`);
    callback(err);
  });
}
