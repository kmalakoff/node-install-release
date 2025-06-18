import fs from 'fs';
import mkdirp from 'mkdirp-classic';
import { getDists } from 'node-filename-to-dist-paths';
import compare from 'node-version-compare';
import path from 'path';
import url from 'url';

const dists = getDists();

const acc = {};
dists.forEach((dist) => {
  dist.files.forEach((filename) => {
    acc[filename] = dist.version;
  });
});

const groups = {};
Object.keys(acc).forEach((filename) => {
  const filePlatform = filename.split('-')[0];
  groups[filePlatform] = groups[filePlatform] || [];
  groups[filePlatform].push({ filename, starting: acc[filename] });
});

Object.keys(groups).forEach((filePlatform) => {
  groups[filePlatform] = groups[filePlatform].sort((a, b) => compare(b.starting, a.starting));
});

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const dest = path.join(__dirname, '..', 'assets', 'files.cjs');
mkdirp.sync(path.dirname(__dirname));
fs.writeFileSync(dest, `module.exports = JSON.parse('${JSON.stringify(groups)}')`);
