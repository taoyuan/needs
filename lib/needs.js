'use strict';

var fs = require('fs');
var path = require('path');

var existsSync = fs.existsSync || path.existsSync;
var slice = Array.prototype.slice;

// The module to be exported.
module.exports = needs;

var _ = needs._ = require('lodash');
var minimatch = needs.minimatch = require('minimatch');

function matchPatterns(patterns, fn) {
  var result = false;
  // Iterate over flattened patterns array.
  _.forEach(_.flatten(patterns), function (pattern) {
    // If the first character is ! it should be omitted
    var exclusion = (typeof pattern === 'string') && (pattern.indexOf('!') === 0);
    // If the pattern is an exclusion, remove the !
    if (exclusion) {
      pattern = pattern.slice(1);
    }
    // Find all matching files for this pattern.
    var matched = fn(pattern);
    result = exclusion ? (!matched) : (result || matched);
    return !(exclusion && matched);// if excluded return false to exit iteration
  });
  return result;
}

function match(filename, patterns, options) {
  options = _.assign({
    matchBase: true
  }, options);

  if (filename === null || filename === null || typeof filename !== 'string') return false;

  if (!Array.isArray(patterns)) patterns = [patterns];

  if (patterns.length === 0) return false;

  return matchPatterns(patterns, function (pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(filename);
    } else if (typeof pattern === 'string') {
      return minimatch(filename, pattern, options);
    } else {
      throw new Error('Unsupported pattern type: ' + (typeof pattern));
    }
  });
}

function join(args) {
  if (args.length === 1) {
    return args[0];
  } else if (args.length === 2) {
    return path.join(args[0], args[1]);
  } else if (args.length === 3) {
    return path.join(args[0], args[1], args[2]);
  } else if (args.length === 4) {
    return path.join(args[0], args[1], args[2], args[3]);
  } else {
    return path.join.apply(path, args);
  }
}

function needs() {
  if (arguments.length === 0 || typeof arguments[0] !== 'string') throw new Error('`dir` must be a string');

  var dir, opts = {};
  var args = slice.call(arguments);
  var len = args.length;
  if (typeof args[len - 1] === 'object' || Array.isArray(args[len - 1])) {
    opts = args.pop();
  }

  dir = join(args);
  if (Array.isArray(opts)) {
    opts = {patterns: opts};
  }
  opts.prefix = opts.prefix || '';
  opts.patterns = opts.patterns || opts.includes || opts.include || '+(*.js|*.json)';
  opts.excludes = opts.excludes || opts.exclude || '+(*.git|*.svn)';

  var filter = typeof opts.filter === 'function' ? opts.filter : defaultFilter;

  var modules = {};
  read(dir, opts);
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
