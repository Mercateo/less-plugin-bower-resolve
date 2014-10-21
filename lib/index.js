var getBowerFileManager = require('./bower-file-manager');

module.exports = {
  install: function(less, pluginManager) {
    var BowerFileManager = getBowerFileManager(less);
    pluginManager.addFileManager(new BowerFileManager());
  },
  printUsage: function() {
    console.log('');
    console.log('Bower Resolve Plugin:');
    console.log('  Use plugin with --bower-resolve parameter.');
    console.log('  No options. Use your normal imports.');
    console.log('  If importing from Bower fails it will fallback to the default behavior.');
    console.log('  Use relative or absolute paths in your imports to explicitly use default behavior.');
    console.log('');
  },
  minVersion: [ 2, 0, 0 ]
};
