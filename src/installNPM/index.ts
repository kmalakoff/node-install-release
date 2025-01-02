import installBin from './installBin';
import installLib from './installLib';

export default function install(version, dest, options, callback) {
  installLib(version, dest, options, (err) => {
    if (err) return callback(err);
    installBin(version, dest, options, callback);
  });
}
