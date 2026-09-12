# node-install-release

Cross-platform solution for installing releases of Node.js.

Node.js releases are downloaded from `nodejs.org` and installed under `~/.nir/installed` by default.

## CLI

```sh
npm install --global node-install-release
nir 14
```

This installs the resolved release under `~/.nir/installed/<version>`.

## JavaScript API

```js
var install = require('node-install-release')
var path = require('path')

var installPath = path.join(process.cwd(), 'node-v12');

// Callback. The options object selects the destination and target.
install('v12', { installPath: installPath, platform: 'darwin', arch: 'x64' }, function (err, result) {
  if (err) throw err;
  console.log(result.execPath);
});

```

The promise form is `install('v12', { installPath: installPath })`. Set `filename: 'src'` to download and build the source release. The result includes `version`, `installPath`, `execPath`, and `platform`. The CLI also accepts `--platform`, `--arch`, `--filename`, `--installPath`, and `--storagePath`.
