import './polyfills.cjs';
import Promise from 'pinkie-promise';
import install from './install';

export default function installRelease(versionDetails, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};

  if (typeof callback === 'function') return install(versionDetails, dest, options, callback);
  return new Promise((resolve, reject) => {
    installRelease(versionDetails, dest, options, function installCallback(err, result) {
      err ? reject(err) : resolve(result);
    });
  });
}
