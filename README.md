#needs


Require multiple modules in node.js.


##Usage

```js
var controllers = require('needs')(__dirname, 'controllers', {
	filter: /(.+Controller)\.js$/,
	excludes: /^\.(git|svn)$/
});

// controllers now is an object with references to all modules matching the filter
// for example:
// { HomeController: function HomeController() {...}, ...}

```

or


```js
var libs = require('needs')(__dirname, 'libs');

```

or

```js
var libs = require('needs')(__dirname + '/libs');

```

##Reference Projects

* [node-require-all](felixge/node-require-all)
* [compound.js](1602/compound)