#!/usr/bin/env node

var getopts = require('getopts-compat');
var exit = require('exit');
var assign = require('object-assign');
var nir = require('..');

(function () {
  var options = getopts(process.argv.slice(3), {
    alias: { platform: 'p', arch: 'a', filename: 'f', cacheDirectory: 'c' },
  });

  // define.option('-p, --platform [platform]', 'Platform like darwin');
  // define.option('-a, --arch [arch]', 'Architecure x64, x86, arm-pi');
  // define.option('-f, --filename [filename]', 'Distribution filename from https://nodejs.org/dist/index.json');
  // define.option('-c, --cacheDirectory [cacheDirectory]', 'Cache directory');

  var args = process.argv.slice(2, 3).concat(options._);
  if (args.length < 1) {
    console.log('Missing command. Example usage: nir version [directory]');
    return exit(-1);
  }

  var installPath = args.length > 1 ? args[1] : null;
  nir(args[0], installPath, assign({ stdio: 'inherit' }, options), function (err, installPath) {
    if (err) {
      console.log(err.message);
      return exit(err.code || -1);
    }
    console.log('Installed Node.js (' + args[0] + ') in ' + installPath);
    exit(0);
  });
})();
