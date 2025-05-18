import Queue from 'queue-cb';
import installBin from './installBin.js';
import installLib from './installLib.js';

export default function install(version, dest, options, callback) {
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
