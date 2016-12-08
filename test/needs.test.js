var assert = require('chai').assert;
var needs = require('..');

var root = __dirname + '/dirs';

describe('needs', function () {
    it('requiring flatten directory', function () {
        var controllers = needs(root, 'controllers', {
            includes: '*Controller.js'
        });
        assert.deepEqual(controllers, {
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
        assert.deepEqual(mydir, mydir_contents);

        var defaults = needs(root, 'mydir');

        assert.deepEqual(defaults, mydir_contents);
    });

    it('requiring with excludes', function () {
        var unfiltered = needs(root, 'filterdir', {
            includes: '*.js'
        });

        assert.ok(unfiltered.root);
        assert.ok(unfiltered.hello);

        var excludedSub = needs(root, 'filterdir', {
            includes: '*.js',
            excludes: 'sub'
        });

        assert.ok(excludedSub.root);
        assert.equal(excludedSub.hello, undefined);
    });

    it('requiring common module file', function () {
        var modules = needs(root, 'mydir', { module: 'config.json' });
        assert.deepEqual(modules, {
            sub: {
                settingA: 'A',
                settingB: 'B'
            }
        });
    });

    it('requiring node modules', function () {
        var modules = needs(root, 'modules', { module: true });
        assert.deepEqual(modules, {
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

        assert.deepEqual(modules, {
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

        assert.deepEqual(modules, {
            foo: 'bar',
            hello: {
                world: true,
                universe: 42,
                moduleName: "hello"
            }
        });
    });

});