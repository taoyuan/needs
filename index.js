var fs = require('fs');
var path = require('path');
var Module = require('module').Module;

var debug = function (x) {};

module.exports = function needs(root, name, options) {
    var dir = root;
    if (typeof name === 'string') {
        dir = path.join(root, name);
    } else if (name) {
        options = name;
    }
    if (!options) options = {};

    var modules = {};
    read(dir, options.prefix, options.filter, options.excludes);
    return modules;

    function register(modules, info) {
        if (options['watch']) {
            if (!info.stat) {
                info.stat = fs.statSync(info.file);
            }
            modules.__defineGetter__(info.name, function() {
                var stat = fs.statSync(info.file);
                if (!info.cache || info.stat && info.stat.mtime < stat.mtime) {
                    debug('reload ' + info.file);
                    delete Module._cache[info.file];
                    info.cache = require(info.file);
                }
                info.stat = stat;
                return info.cache;
            });
        } else {
            modules[info.name] = require(info.file);
        }
    }

    function read(dir, prefix, filter, excludes) {
        prefix = prefix || "";
        filter = filter || /(.+)\.js(on)?$/;
        excludes = excludes || /^\.(git|svn)$/;


        var files = fs.readdirSync(dir);

        function excluded(dirname) {
            return excludes && dirname.match(excludes);
        }

        files.forEach(function (filename) {
            var file = dir + '/' + filename;
            var ext = path.extname(filename);
            var stat = fs.statSync(file);
            if (stat.isDirectory()) {

                if (excluded(filename)) return;

                if (fs.existsSync(file + '/index.js')) {
                    register(modules, {
                        name: filename,
                        file: file + '/index.js',
                        stat: stat
                    });
                } else {
                    read(file, prefix, filter, excludes);
                }

            } else {
                var match = filename.match(filter);
                if (!match) return;

                var name = prefix + filename.replace(ext, '');
                register(modules, {
                    name: name,
                    file: path.normalize(file),
                    stat: stat
                });

            }
        });
    }
};