const log = require('single-line-log2').stdout;

module.exports = function progress(entry) {
  let message = `${entry.progress} ${entry.basename}`;
  if (entry.percentage) message += ` - ${entry.percentage.toFixed(0)}%`;
  log(message);
};
