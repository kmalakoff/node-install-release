import exit from 'exit';
import getopts from 'getopts-compat';
import nir from './index.js';

export default (argv) => {
  const options = getopts(argv.slice(1), {
    alias: { platform: 'p', arch: 'a', filename: 'f', cacheDirectory: 'c', silent: 's' },
    boolean: ['silent'],
  });

  // define.option('-p, --platform [platform]', 'Platform like darwin');
  // define.option('-a, --arch [arch]', 'Architecure x64, x86, arm-pi');
  // define.option('-f, --filename [filename]', 'Distribution filename from https://nodejs.org/dist/index.json');
  // define.option('-c, --cacheDirectory [cacheDirectory]', 'Cache directory');

  const args = argv.slice(0, 1).concat(options._);
  if (args.length < 1) {
    console.log('Missing command. Example usage: nir version [directory]');
    return exit(-1);
  }

  const installPath = args.length > 1 ? args[1] : null;
  nir(args[0], installPath, { stdio: 'inherit', ...options }, (err, results) => {
    if (err) {
      console.log(err.message);
      return exit(err.code || -1);
    }
    const errors = results.filter((result) => !!result.error);

    if (!options.silent) {
      console.log('\n======================');
      for (let index = 0; index < results.length; index++) {
        const result = results[index];
        if (result.error) console.log(`${result.version} not installed. Error: ${result.error.message}`);
        else console.log(`${result.version} installed in: ${result.fullPath}`);
      }
      console.log('======================');
    }

    exit(errors.length ? -1 : 0);
  });
};
