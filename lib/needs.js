'use strict';

// Nodejs libs.
var fs = require('fs');
var path = require('path');

var existsSync = fs.existsSync || path.existsSync;

// The module to be exported.
module.exports = needs;

var _ = needs._ = require('lodash');
var minimatch = needs.minimatch = require('minimatch');

var matchPatterns = function(patterns, fn) {
    var result = false;
    // Iterate over flattened patterns array.
    _.forEach(_.flatten(patterns), function (pattern) {
        // If the first character is ! it should be omitted
        var exclusion = pattern.indexOf('!') === 0;
        // If the pattern is an exclusion, remove the !
        if (exclusion) { pattern = pattern.slice(1); }
        // Find all matching files for this pattern.
        var matched = fn(pattern) ;
        result = exclusion ? (!matched) : (result || matched);
        return !(exclusion && matched);// if excluded return false to exit iteration
    });
    return result;
};

var match = function (filename, patterns, options) {
    options = _.assign({
        matchBase: true
    }, options);

    if (filename == null || filename == null || typeof filename !== 'string') return false;

    if (!Array.isArray(patterns)) patterns = [patterns];

    if (patterns.length == 0) return false;

    return matchPatterns(patterns, function (pattern) {
        return minimatch(filename, pattern, options);
    });

};

function needs(root, name, options) {
    var dir = root;
    if (typeof name === 'string') {
        dir = path.join(root, name);
    } else if (name) {
        options = name;
    }

    options = _.assign({
        prefix: '',
        patterns: '+(*.js|*.json)',
        excludes: '+(*.git|*.svn)'
    }, options);

    var filter = typeof options.filter === 'function' ? options.filter : defaultFilter;

    var modules = {};
    read(dir, options);
    return modules;

    function defaultFilter(info) {
        return require(info.file);
    }

    function register(modules, info) {
        if (filter.length <= 1) {
            var m = filter(info);
            if (!!m) modules[info.name] = m;
        } else {
            filter(modules, info);
        }
    }

    function read(dir, options) {

        var files = fs.readdirSync(dir);

        files.forEach(function (filename) {
            if (match(filename, options.excludes)) return;

            var file = dir + '/' + filename;
            var ext = path.extname(filename);
            var stat = fs.statSync(file);
            if (stat.isDirectory()) {
                var target = 'index.js';
                if (options.module) {
                    if (typeof options.module === 'string') {
                        target = options.module;
                    } else {
                        var pf = path.join(file, 'package.json');
                        if (existsSync(pf)) {
                            target = require(pf).main || target;
                        }
                    }
                }

                target = path.join(file, target);
                if (existsSync(target)) {
                    register(modules, {
                        name: filename,
                        file: target,
                        stat: stat
                    });
                } else {
                    read(file, options);
                }

            } else if (!options.module) {
                if (!match(filename, options.patterns)) return;
                var name = options.prefix + filename.replace(ext, '');
                register(modules, {
                    name: name,
                    file: path.normalize(file),
                    stat: stat
                });
            }
        });
    }
}