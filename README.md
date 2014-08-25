Needs
=====
[![NPM Version](https://img.shields.io/npm/v/needs.svg?style=flat)](https://www.npmjs.org/package/needs)
[![Build Status](http://img.shields.io/travis/taoyuan/needs.svg?style=flat)](https://travis-ci.org/taoyuan/needs)
[![Dependencies](https://img.shields.io/david/taoyuan/needs.svg?style=flat)](https://david-dm.org/taoyuan/needs)

Require multiple modules in node.js.

## Installation

```bash
$ npm install yetta
```

##Usage

```js
var controllers = require('needs')(__dirname, 'controllers', {
	includes: /(.+Controller)\.js$/,
	excludes: /^\.(git|svn)$/
});

// controllers now is an object with references to all modules matching the filter
// for example:
// { HomeController: function HomeController() {...}, ...}
```
or:
```js
var libs = require('needs')(__dirname, 'libs');
```
or:
```js
var libs = require('needs')(__dirname + '/libs');
```

##Links

* [node-require-all](http://github.com/felixge/node-require-all)

## License

Copyright (c) 2014 Tao Yuan
Licensed under the MIT license.