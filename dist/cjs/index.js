"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return installRelease;
    }
});
var _install = /*#__PURE__*/ _interop_require_default(require("./install"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function installRelease(versionDetails, dest, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = null;
    }
    options = options || {};
    if (typeof callback === "function") return (0, _install.default)(versionDetails, dest, options, callback);
    return new Promise(function(resolve, reject) {
        installRelease(versionDetails, dest, options, function installCallback(err, result) {
            err ? reject(err) : resolve(result);
        });
    });
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}