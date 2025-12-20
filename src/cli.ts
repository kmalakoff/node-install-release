import exit from 'exit-compat';
import fs from 'fs';
import getopts from 'getopts-compat';
import path from 'path';
import url from 'url';
import install, { type InstallOptions } from './index.ts';

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
  install(args[0], options as InstallOptions, (err, result) => {
    if (!options.silent) {
      console.log('\n======================');
      if (err) console.log(`${args[0]} not installed. Error: ${err.message}`);
      else console.log(`${result.version} installed in: ${result.installPath}`);
      console.log('======================');
    }
    exit(err ? ERROR_CODE : 0);
  });
};
