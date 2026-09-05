import Module from 'module';
import moduleRoot from 'module-root-sync';
import path from 'path';
import url from 'url';
import type { File } from './types.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

// dist/{esm,cjs}/files.js and src/files.ts (under the TypeScript loader) sit at different depths from the package root
const files = _require(path.join(moduleRoot(__dirname), 'assets', 'files.cjs')) as Record<string, File[]>;

export default files;
