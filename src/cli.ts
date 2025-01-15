import exit from 'exit';
import getopts from 'getopts-compat';
import install, { type InstallOptions } from './index';

export default (argv) => {
  const options = getopts(argv.slice(1), {
    alias: { platform: 'p', arch: 'a', filename: 'f', installPath: 'i', storagePath: 'c', silent: 's' },
    boolean: ['silent'],
  });

  const args = argv.slice(0, 1).concat(options._);
  if (args.length < 1) {
    console.log('Missing command. Example usage: nir version [directory]');
    return exit(1);
  }
  install(args[0], options as InstallOptions, (err, result) => {
    if (!options.silent) {
      console.log('\n======================');
      if (err) console.log(`${args[0]} not installed. Error: ${err.message}`);
      else console.log(`${result.version} installed in: ${result.installPath}`);
      console.log('======================');
    }
    exit(err ? 1 : 0);
  });
};
