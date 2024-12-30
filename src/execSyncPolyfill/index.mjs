import Module from 'module';
import path from 'path';
import lazy from 'lazy-cache';
import moduleRoot from 'module-root-sync';
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const functionExec = lazy(_require)('function-exec-sync');
const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const worker = path.join(moduleRoot(__dirname), 'dist', 'cjs', 'execSyncPolyFill', 'worker.js');

const cp = require('child_process');
if (!cp.execSync)
  cp.execSync = function execSyncPolyfill(cmd, options) {
    return functionExec()({ callbacks: true }, worker, cmd, options || {});
  };
export default cp.execSync;
