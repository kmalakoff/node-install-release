import './execSyncPolyfill/index.js';
import worker from './worker';

export default function install(versionDetails, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  if (typeof callback === 'function') return worker(versionDetails, dest, options, callback);
  return new Promise((resolve, reject) =>
    worker(versionDetails, dest, options, (err, result) => {
      err ? reject(err) : resolve(result);
    })
  );
}
