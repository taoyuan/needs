var chai = require('chai');
chai.Assertion.includeStack = true;
var t = chai.assert;
var needs = require('..');

var root = __dirname + '/dirs';

describe('needs', function () {
    it('requiring flatten directory', function () {
        var controllers = needs(root, 'controllers', {
            filter: /(.+Controller)\.js$/
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
            filter: /(.+)\.(js|json)$/
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
            filter: /(.+)\.js$/
        });

        t.ok(unfiltered.root);
        t.ok(unfiltered.hello);

        var excludedSub = needs(root, 'filterdir', {
            filter: /(.+)\.js$/,
            excludes: /^(sub)$/
        });

        t.ok(excludedSub.root);
        t.equal(excludedSub.hello, undefined);
    });


    it('requiring modules that includes index.js file', function () {
        var modules = needs(root, 'modules');
        t.deepEqual(modules, {
            foo: 'bar',
            hello: {
                world: true,
                universe: 42
            }
        });
    });
});