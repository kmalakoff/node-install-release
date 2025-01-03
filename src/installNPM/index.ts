import Queue from 'queue-cb';
import sll from 'single-line-log2';
import installBin from './installBin';
import installLib from './installLib';

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
    sll.stdout('');
    console.log(`npm ${npmVersion || ''} ${!err ? 'installed' : `install failed. Error: ${err.message}`}`);
    callback(err);
  });
}
