const isArray = require('isarray');
const endsWith = require('end-with');

module.exports = function endsWithFn(endings) {
  if (!isArray(endings)) endings = [endings];
  return (string) => {
    for (let index = 0; index < endings.length; index++) {
      if (endsWith(string, endings[index])) return true;
    }
    return false;
  };
};
