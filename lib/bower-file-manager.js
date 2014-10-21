var path = require('path');
var fs = require('fs');
var BowerConfig = require('bower-config');
var bowerJson = require('bower-json');
var PromiseConstructor = typeof Promise === 'undefined' ? require('promise') : Promise;

// matches '../some/module' and './some/module'
var RELATIVE_PATH_REGEX = /^..\/|^.\//;
// matches 'some/module'
var ABSOLUTE_PATH_REGEX = /^\//;
// matches everything until a '/' is found
var MODULE_NAME_REGEX = /[^\/]*/;
// matches 'some-path/.bower.json', 'some-path/bower.json' and 'some-path/component.json'
var BOWER_JSON_REGEX = /\/.bower.json$|\/bower.json$|\/component.json$/;

// get bowerDirectory (can be customized inside `.bowerrc`)
var bowerConfig = new BowerConfig().load();
var bowerDirectory = path.join(bowerConfig._config.cwd, bowerConfig._config.directory);

/**
 * Tries to convert a Bower JSON into a virtual Less file.
 * @param {string} bowerJsonPath
 * @returns {PromiseConstructor}
 */
function createVirtualLessFileFromBowerJson(bowerJsonPath) {
  return new PromiseConstructor(function(fullfill, reject) {
    bowerJson.read(bowerJsonPath, { validate: false }, function(err, bowerJsonData) {
      if (err) {
        return reject(err);
      }
      if (!bowerJsonData.main) {
        err = bowerJsonPath + ' has no "main" property.';
        return reject(new Error(err));
      }

      // convert bower json into less file
      var virtualLessFile = bowerJsonData.main.filter(function(filename) {
        return path.extname(filename) === '.less';
      }).map(function(filename) {
        return '@import "' + filename + '";';
      }).join('\n');

      if (virtualLessFile) {
        var file = {
          contents: virtualLessFile,
          filename: bowerJsonPath
        };
        return fullfill(file);
      } else {
        err = 'Couldn\'t find a less file in ' + bowerJsonPath + '.';
        return reject(new Error(err));
      }
    });
  });
}

module.exports = function(less) {
  var FileManager = less.FileManager;

  function BowerFileManager() {
  }

  BowerFileManager.prototype = new FileManager();

  /**
   * Override default behavior of `tryAppendLessExtension` so '.less' isn't auto-appended to
   * path. Now we can distinguish between a Bower package called `name` and `name.less`. We
   * append '.less' to files later.
   *
   * @param {string} path
   * @returns {string}
   */
  BowerFileManager.prototype.tryAppendLessExtension = function(path) {
    return path;
  };

  /**
   * Tries to resolve filename to one of the following cases:
   *   1) resolve to absolute path
   *   2) resolve to relative path
   *   3) try resolving to bower module...
   *     3.1) resolve to a whole bower module
   *     3.2) resolve to a file inside a bower module
   *     3.3) fallback to default behavior: resolve to relative path
   *
   * @param {string} filename
   * @param {string} currentDirectory
   * @returns {PromiseConstructor}
   */
  BowerFileManager.prototype.resolve = function(filename, currentDirectory) {
    return new PromiseConstructor(function(fullfill, reject) {
      if (filename.match(ABSOLUTE_PATH_REGEX)) {
        // 1) resolve to absolute path
        return fullfill(FileManager.prototype.tryAppendLessExtension(filename));
      } else if (filename.match(RELATIVE_PATH_REGEX)) {
        // 2) resolve to relative path
        return fullfill(path.join(currentDirectory, FileManager.prototype.tryAppendLessExtension(filename)));
      } else {
        // 3) try resolving to bower module
        var moduleName = filename.match(MODULE_NAME_REGEX).toString();
        var moduleDirectory = path.join(bowerDirectory, moduleName);
        var isWholeModule = filename === moduleName;

        fs.exists(moduleDirectory, function(isBowerModule) {
          if (isBowerModule && isWholeModule) {
            // 3.1) resolve to a whole bower module
            bowerJson.find(moduleDirectory, function(err, bowerJsonPath) {
              if (err) {
                return reject(err);
              }

              return fullfill(bowerJsonPath);
            });
          } else if (isBowerModule) {
            // 3.2) resolve to a file inside a bower module
            return fullfill(path.join(bowerDirectory, FileManager.prototype.tryAppendLessExtension(filename)));
          } else {
            // 3.3) fallback to default behavior: resolve to relative path
            return fullfill(path.join(currentDirectory, FileManager.prototype.tryAppendLessExtension(filename)));
          }
        });
      }
    });
  };

  /**
   * Load file if filename was resolved or dynamically create a virtual Less file from Bower JSON.
   *
   * @param {string} filename
   * @param {string} currentDirectory
   * @param {object} options
   * @param {object} environment
   * @returns {PromiseConstructor}
   */
  BowerFileManager.prototype.loadFile = function(filename, currentDirectory, options, environment) {
    var that = this;
    return this.resolve(filename, currentDirectory).then(function(filename) {
      if (filename.match(BOWER_JSON_REGEX)) {
        return createVirtualLessFileFromBowerJson(filename);
      } else {
        return FileManager.prototype.loadFile.call(that, filename, '', options, environment);
      }
    });
  };

  return BowerFileManager;
};
