var assert = require('assert');
var path = require('path');
var accessSync = require('fs-access-sync-compat');

module.exports = function validateInstall(installPath, options) {
  options = options || {};
  var platform = options.platform || process.platform;

  if (platform === 'win32') {
    try {
      accessSync(path.join(installPath, 'node.exe'));
      accessSync(path.join(installPath, 'npm'));
      accessSync(path.join(installPath, 'npm.cmd'));
      // accessSync(path.join(installPath, 'npx'));
      // accessSync(path.join(installPath, 'npx.cmd'));
      // accessSync(path.join(installPath, 'install_tools.bat'));
      accessSync(path.join(installPath, 'node_modules', 'npm'));
    } catch (err) {
      assert(!err, err.message);
    }
  } else {
    try {
      accessSync(path.join(installPath, 'bin', 'node'));
      accessSync(path.join(installPath, 'bin', 'npm'));
      // try {
      //   accessSync(path.join(installPath, 'bin', 'npx'));
      // } catch (err) {
      //   accessSync(path.join(installPath, 'bin', 'node-waf'));
      // }
      // accessSync(path.join(installPath, 'include', 'node'));
      accessSync(path.join(installPath, 'lib', 'node_modules', 'npm'));
    } catch (err) {
      assert(!err, err.message);
    }
  }
};
