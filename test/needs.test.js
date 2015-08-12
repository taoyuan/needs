'use strict';

var chai = require('chai');
chai.config.includeStack = true;
var t = chai.assert;
var needs = require('..');

var root = __dirname + '/dirs';

describe('needs', function () {
  it('requiring flatten directory', function () {
    var controllers = needs(root, 'controllers', {
      includes: '*Controller.js'
    });
    t.deepEqual(controllers, {
      'main-Controller': {
        index: 1,
        show: 2,
        add: 3,
        edit: 4
      },

      'other-Controller': {
        index: 1,
        show: 'nothing'
      }
    });
  });

  it('requiring regexp patterns', function () {
    var controllers = needs(root, 'controllers', {
      includes: /(.+Controller)\.js$/,
      excludes: /^\.(git|svn)$/
    });
    t.deepEqual(controllers, {
      'main-Controller': {
        index: 1,
        show: 2,
        add: 3,
        edit: 4
      },

      'other-Controller': {
        index: 1,
        show: 'nothing'
      }
    });
  });

  it('requiring json only became an option', function () {
    var mydir = needs(root, 'mydir', {
      includes: '+(*.js|*.json)'
    });

    var mydir_contents = {
      foo: 'bar',
      hello: {
        world: true,
        universe: 42
      },
      config: {
        settingA: 'A',
        settingB: 'B'
      },
      yes: true
    };
    t.deepEqual(mydir, mydir_contents);

    var defaults = needs(root, 'mydir');

    t.deepEqual(defaults, mydir_contents);
  });

  it('requiring with excludes', function () {
    var unfiltered = needs(root, 'filterdir', {
      includes: '*.js'
    });

    t.ok(unfiltered.root);
    t.ok(unfiltered.hello);

    var excludedSub = needs(root, 'filterdir', {
      includes: '*.js',
      excludes: 'sub'
    });

    t.ok(excludedSub.root);
    t.equal(excludedSub.hello, undefined);
  });

  it('requiring common module file', function () {
    var modules = needs(root, 'mydir', {module: 'config.json'});
    t.deepEqual(modules, {
      sub: {
        settingA: 'A',
        settingB: 'B'
      }
    });
  });

  it('requiring node modules', function () {
    var modules = needs(root, 'modules', {module: true});
    t.deepEqual(modules, {
      foo: 'bar',
      hello: {
        world: true,
        universe: 42
      }
    });
  });

  it('requiring modules with one parameter filter', function () {
    var modules = needs(root, 'modules', {
      module: true,
      filter: function (info) {
        var mod = require(info.file);
        if (typeof mod === 'object') mod.moduleName = info.name;
        return mod;
      }
    });

    t.deepEqual(modules, {
      foo: 'bar',
      hello: {
        world: true,
        universe: 42,
        moduleName: "hello"
      }
    });
  });

  it('requiring modules with two parameter filter', function () {
    var modules = needs(root, 'modules', {
      module: true,
      filter: function (result, info) {
        var mod = require(info.file);
        if (typeof mod === 'object') mod.moduleName = info.name;
        result[info.name] = mod;
      }
    });

    t.deepEqual(modules, {
      foo: 'bar',
      hello: {
        world: true,
        universe: 42,
        moduleName: "hello"
      }
    });
  });

  it('should needs with many dir partials', function () {
    var unfiltered = needs(root + '/filterdir', {
      includes: '*.js'
    });

    t.ok(unfiltered.root);
    t.ok(unfiltered.hello);

    unfiltered = needs(root, 'filterdir', {
      includes: '*.js'
    });

    t.ok(unfiltered.root);
    t.ok(unfiltered.hello);

    unfiltered = needs(root + '/..', 'dirs', 'filterdir', {
      includes: '*.js'
    });

    t.ok(unfiltered.root);
    t.ok(unfiltered.hello);

    unfiltered = needs(root + '/../..', 'test', 'dirs', 'filterdir', {
      includes: '*.js'
    });

    t.ok(unfiltered.root);
    t.ok(unfiltered.hello);

    unfiltered = needs(root + '/../../..', 'needs', 'test', 'dirs', 'filterdir', {
      includes: '*.js'
    });

    t.ok(unfiltered.root);
    t.ok(unfiltered.hello);
  });

  it('should support `!` for exclusion in pattern', function () {
    var unfiltered = needs(root + '/filterdir', {
      includes: ['*.js', '!hello.js']
    });

    t.ok(unfiltered.root);
    t.notOk(unfiltered.hello);
  });

  it('should support array string patterns', function () {
    var unfiltered = needs(root + '/filterdir', ['*.js', '!hello.js']);

    t.ok(unfiltered.root);
    t.notOk(unfiltered.hello);
  });


  it('should throw error for invalid pattern', function () {
    t.throw(function () {
      needs(root + '/filterdir', {
        includes: {}
      });
    });
  });

});
