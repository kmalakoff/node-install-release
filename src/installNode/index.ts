import find from 'lodash.find';

import endsWithFn from '../lib/endsWithFn';
import findDistPaths from './findDistPaths';
import installCompressed from './installCompressed';
import installExe from './installExe';
import installSource from './installSource/index';

export default function install(version, dest, options, callback) {
  let record = findDistPaths(version, options);
  if (record) {
    if (record.filename === 'src') return installSource(record.relativePaths[0], dest, record, options, callback);

    let relativePath = find(record.relativePaths, endsWithFn(['.tar.gz', '.zip']));
    if (relativePath) return installCompressed(relativePath, dest, record, options, callback);

    relativePath = find(record.relativePaths, endsWithFn('.exe'));
    if (relativePath) return installExe(relativePath, dest, record, options, callback);
  }

  record = findDistPaths(version, { filename: 'src' });
  if (record && record.relativePaths.length) return installSource(record.relativePaths[0], dest, record, options, callback);
  callback(new Error(`Unable to install ${version}`));
}
