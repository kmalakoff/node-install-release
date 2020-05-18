var assert = require('assert');
var path = require('path');
var fs = require('fs');

module.exports = function validateInstall(installPath, options) {
  options = options || {};
  var platform = options.platform || process.platform;

  if (platform === 'win32') {
    try {
      fs.accessSync(path.join(installPath, 'node.exe'));
      fs.accessSync(path.join(installPath, 'npm'));
      fs.accessSync(path.join(installPath, 'npm.cmd'));
      // fs.accessSync(path.join(installPath, 'npx'));
      // fs.accessSync(path.join(installPath, 'npx.cmd'));
      // fs.accessSync(path.join(installPath, 'install_tools.bat'));
      fs.accessSync(path.join(installPath, 'node_modules', 'npm'));
    } catch (err) {
      assert(!err, err.message);
    }
  } else {
    try {
      fs.accessSync(path.join(installPath, 'bin', 'node'));
      fs.accessSync(path.join(installPath, 'bin', 'npm'));
      // try {
      //   fs.accessSync(path.join(installPath, 'bin', 'npx'));
      // } catch (err) {
      //   fs.accessSync(path.join(installPath, 'bin', 'node-waf'));
      // }
      // fs.accessSync(path.join(installPath, 'include', 'node'));
      fs.accessSync(path.join(installPath, 'lib', 'node_modules', 'npm'));
    } catch (err) {
      assert(!err, err.message);
    }
  }
};
