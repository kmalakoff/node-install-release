import { exec } from 'child_process';

export default function execCallback(cmd, options, callback) {
  return exec(cmd, options, callback);
}
