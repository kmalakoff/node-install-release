const cp = require('child_process');
if (!cp.execSync) {
  const path = require('path');
  const workerPath = path.join(__dirname, 'worker.cjs');

  let functionExec = null; // break dependencies
  cp.execSync = function execSyncPolyfill(cmd, options = {}) {
    if (!functionExec) functionExec = require('function-exec-sync');
    return functionExec({ callbacks: true }, workerPath, cmd, options);
  };
}
