"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
var _exit = /*#__PURE__*/ _interop_require_default(require("exit"));
var _getoptscompat = /*#__PURE__*/ _interop_require_default(require("getopts-compat"));
var _index = /*#__PURE__*/ _interop_require_default(require("./index.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var _default = function(argv) {
    var options = (0, _getoptscompat.default)(argv.slice(1), {
        alias: {
            platform: "p",
            arch: "a",
            filename: "f",
            cacheDirectory: "c",
            silent: "s"
        },
        boolean: [
            "silent"
        ]
    });
    // define.option('-p, --platform [platform]', 'Platform like darwin');
    // define.option('-a, --arch [arch]', 'Architecure x64, x86, arm-pi');
    // define.option('-f, --filename [filename]', 'Distribution filename from https://nodejs.org/dist/index.json');
    // define.option('-c, --cacheDirectory [cacheDirectory]', 'Cache directory');
    var args = argv.slice(0, 1).concat(options._);
    if (args.length < 1) {
        console.log("Missing command. Example usage: nir version [directory]");
        return (0, _exit.default)(-1);
    }
    var installPath = args.length > 1 ? args[1] : null;
    (0, _index.default)(args[0], installPath, Object.assign({
        stdio: "inherit"
    }, options), function(err, results) {
        if (err) {
            console.log(err.message);
            return (0, _exit.default)(err.code || -1);
        }
        var errors = results.filter(function(result) {
            return !!result.error;
        });
        if (!options.silent) {
            console.log("\n======================");
            for(var index = 0; index < results.length; index++){
                var result = results[index];
                if (result.error) console.log("".concat(result.version, " not installed. Error: ").concat(result.error.message));
                else console.log("".concat(result.version, " installed in: ").concat(result.fullPath));
            }
            console.log("======================");
        }
        (0, _exit.default)(errors.length ? -1 : 0);
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}