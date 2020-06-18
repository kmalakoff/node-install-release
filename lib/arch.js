function arch() {
  var execSync = require('child_process').execSync;

  if (process.platform === 'linux') {
    try {
      var stdout = execSync('uname -a').toString('utf8');
      if (~stdout.indexOf('raspberrypi')) return 'arm-pi';
    } catch (err) {}
  }

  return require('arch')();
}

module.exports = arch();
