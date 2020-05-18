var semver = require('semver');

module.exports = function findVersion(array, version) {
  for (var index = 0; index < array.length; index++) {
    var item = array[index];
    if (item.eq && !semver.eq(version, item.eq)) continue;
    if (item.lt && !semver.lt(version, item.lt)) continue;
    if (item.lte && !semver.lte(version, item.lte)) continue;
    if (item.gt && !semver.gt(version, item.gt)) continue;
    if (item.gte && !semver.gte(version, item.gte)) continue;
    return item;
  }
  return null;
};
