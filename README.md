## node-install-release

Cross-platform solution for installing releases of Node.js.

Code:

```
$ npm install node-install-release -g
$ nir 14
// installed to ./v14.x.x
```

Code:

```
var assert = require('assert')
var install = require('node-install-release')

var installPath = path.join(INSTALLED_DIR, 'v12-darwin-x64');

// callback - choose the platform and arch
install('v12', installPath, { platform: 'darwin', arch: 'x64' }, function (err, res) {
});

// promise - use the local system for platform and arch
await install('v12', installPath);

// promise - from source (using https://nodejs.org/dist/index.json filename)
await install('v12', installPath, { filename: 'src' });
```
