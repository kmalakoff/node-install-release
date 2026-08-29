import exit from 'exit-compat';
import fs from 'fs';
import getopts from 'getopts-compat';
import path from 'path';
import url from 'url';
import type { InstallOptions, InstallResult } from './index.ts';

const ERROR_CODE = 9;
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

function getPackageVersion(): string {
  const packagePath = path.join(__dirname, '..', '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

function printHelp(name: string): void {
  const version = getPackageVersion();
  console.log(`${name} v${version}`);
  console.log('');
  console.log(`Usage: ${name} <version> [options]`);
  console.log('');
  console.log('Arguments:');
  console.log('  version              Node.js version to install (e.g., 18.0.0, lts, stable)');
  console.log('');
  console.log('Options:');
  console.log('  -p, --platform       Target platform (default: current platform)');
  console.log('  -a, --arch           Target architecture (default: current architecture)');
  console.log('  -f, --filename       Specific filename to download');
  console.log('  -i, --installPath    Installation directory');
  console.log('  -c, --storagePath    Cache storage directory');
  console.log('  -si, --silent        Suppress output');
  console.log('  -v, --version        Show version number');
  console.log('  -h, --help           Show this help message');
}

export default (argv: string[], name?: string): void => {
  const cliName = name || 'nir';
  const options = getopts(argv, {
    alias: { platform: 'p', arch: 'a', filename: 'f', installPath: 'i', storagePath: 'c', silent: 'si', version: 'v', help: 'h' },
    boolean: ['silent', 'version', 'help'],
  });

  if (options.version) {
    console.log(getPackageVersion());
    exit(0);
    return;
  }

  if (options.help) {
    printHelp(cliName);
    exit(0);
    return;
  }

  const args = options._;
  if (args.length < 1) {
    console.log(`Missing command. Example usage: ${cliName} <version> [directory]`);
    exit(ERROR_CODE);
    return;
  }
  const report = (err?: Error | null, result?: InstallResult) => {
    if (!options.silent) {
      console.log('\n======================');
      if (err) console.log(`${args[0]} not installed. Error: ${err.message}`);
      else console.log(`${result?.version} installed in: ${result?.installPath}`);
      console.log('======================');
    }
    exit(err ? ERROR_CODE : 0);
  };
  // deferred: index.ts pulls the whole download+extract+build pipeline. require() cannot load this
  // ESM sibling below Node 20.19 (require(esm)), so the ESM half needs a real dynamic import; the
  // CJS half's sibling is genuine CommonJS, so a plain synchronous require avoids depending on
  // Promise, which isn't global before Node 0.12.
  loadIndex((err, install) => (err || !install ? report(err) : install(args[0], options as InstallOptions, report)));
};

type InstallFn = (versionExpression: string, options: InstallOptions, callback: (err?: Error | null, result?: InstallResult) => void) => void;

function loadIndex(callback: (err: Error | null, install?: InstallFn) => void): void {
  if (typeof require === 'undefined') {
    import('./index.js').then((mod) => callback(null, mod.default || mod)).catch((err) => callback(err instanceof Error ? err : new Error(String(err))));
  } else {
    try {
      const mod = require('./index.js');
      callback(null, mod.default || mod);
    } catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
