var assert = require('assert');
var less = require('less');
var getBowerFileManager = require('../lib/bower-file-manager');

var BowerFileManager = getBowerFileManager(less);
var bowerFileManager = new BowerFileManager();

describe('bower.json', function() {
  it('should be converted to virtual Less file', function(done) {
    bowerFileManager.loadFile('working-bower-json').then(function(file) {
      try {
        assert.equal(file.contents, '@import "test.less";');
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it('should throw error, if no Less file can be found', function(done) {
    bowerFileManager.loadFile('empty-bower-json').catch(function(err) {
      try {
        assert.ok(err, '@import "test.less";');
        done();
      } catch (err) {
        done(err);
      }
    }, done);
  });
});

describe('Less files', function() {
  var currentDirectory = 'test/fixtures';

  it('should be loaded with relative paths', function(done) {
    bowerFileManager.loadFile('./test.less', currentDirectory).then(function(file) {
      try {
        assert.equal(file.contents, 'p { color: red; }\n');
        done();
      } catch (err) {
        done(err);
      }
    }, done);
  });

  it('should be loaded with absolute paths', function(done) {
    bowerFileManager.loadFile(__dirname + '/fixtures/test.less', currentDirectory).then(function(file) {
      try {
        assert.equal(file.contents, 'p { color: red; }\n');
        done();
      } catch (err) {
        done(err);
      }
    }, done);
  });

  it('should be loaded just with a filename (no relative or absolute path set)', function(done) {
    bowerFileManager.loadFile('test.less', currentDirectory).then(function(file) {
      try {
        assert.equal(file.contents, 'p { color: red; }\n');
        done();
      } catch (err) {
        done(err);
      }
    }, done);
  });

  it('should be loaded without a file extension', function(done) {
    bowerFileManager.loadFile('test', currentDirectory).then(function(file) {
      try {
        assert.equal(file.contents, 'p { color: red; }\n');
        done();
      } catch (err) {
        done(err);
      }
    }, done);
  });

  it('should be loaded from a Bower package', function(done) {
    bowerFileManager.loadFile('working-bower-json/test', currentDirectory).then(function(file) {
      try {
        assert.equal(file.contents, 'p { color: green; }\n');
        done();
      } catch (err) {
        done(err);
      }
    }, done);
  });
});
