var endsWith = require('end-with');

module.exports = function endsWithFn(end) {
  return function (string) {
    return endsWith(string, end);
  };
};
