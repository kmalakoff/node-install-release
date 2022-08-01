require('core-js/actual/object/assign');
require('core-js/actual/promise');

var cp = require('child_process');
if (!cp.execSync) {
  var execCallback = __dirname + '/execCallback.js'; // eslint-disable-line n/no-path-concat

  var functionExec = null; // break dependencies
  cp.execSync = function execSyncPolyfill(cmd, options) {
    if (!functionExec) functionExec = require('function-exec-sync');

    return functionExec({ callbacks: true }, execCallback, cmd, options || {});
  };
}
