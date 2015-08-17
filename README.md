Needs
=====
[![NPM Version](https://img.shields.io/npm/v/needs.svg?style=flat)](https://www.npmjs.org/package/needs)
[![Build Status](http://img.shields.io/travis/taoyuan/needs.svg?style=flat)](https://travis-ci.org/taoyuan/needs)
[![Coverage](https://coveralls.io/repos/taoyuan/needs/badge.svg?branch=master)](https://coveralls.io/r/taoyuan/needs)
[![Quality](https://codeclimate.com/github/taoyuan/needs/badges/gpa.svg)](https://codeclimate.com/github/taoyuan/needs)
[![Dependencies](https://img.shields.io/david/taoyuan/needs.svg?style=flat)](https://david-dm.org/taoyuan/needs)

Require multiple modules in node.js.

## Installation

```bash
$ npm install needs --save
```

## Usage

### RegExp pattern

```js
var needs = require('needs');

needs(__dirname, 'controllers', {
	includes: /(.+Controller)\.js$/,
	excludes: /^\.(git|svn)$/
});

// controllers now is an object with references to all modules matching the filter
// for example:
// { HomeController: function HomeController() {...}, ...}

```

### Minimatch string pattern

```js
// or using minimatch string
needs(__dirname, 'controllers', {
	includes: '+(*.js|*.json)',
	excludes: '+(*.git|*.svn)'
});
```

### Array includes and excludes 

```js
needs(__dirname, 'controllers', {
	includes: ['*.js', '*.json'],
	excludes: ['*.git', '*.svn']
});
```

### Array pattern

```js
needs(__dirname, 'controllers', ['*.js', '*.json']);
```

### Simplest way to include and exclude

```js
needs(__dirname, 'controllers', ['*.js', '*.json', '!*.git', '!*.svn']);

// or default includes ['*.js', '*.json'] and excludes ['!*.git', '!*.svn']
needs(__dirname, 'controllers');
```

## Links

* [node-require-all](http://github.com/felixge/node-require-all)

## License

Copyright (c) 2014 Tao Yuan
Licensed under the MIT license.
