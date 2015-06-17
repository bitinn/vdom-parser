
vdom-parser
===========

[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![coverage status][coveralls-image]][coveralls-url]

A client-side DOM to vdom parser based on DOMParser API, compatible with [virtual-dom](https://github.com/Matt-Esch/virtual-dom).


# Motivation

We use `virtual-dom` with progressive enhancement in mind: we use server-side rendering to achieve good first-page performance then re-attach vdom rendering client-side.

This means we need a solid implementation of html to vdom parser, while there are [existing implementations](https://github.com/Matt-Esch/virtual-dom/wiki#html-to-vdom), we would like a solution that's well-tested and make use of existing browser API.

Hence `vdom-parser`, a small module that bridges the gap between server-side and client-side rendering.


# Features

- Use [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) for better performance and much smaller filesize.
- Peer dependent on `virtual-dom` major version to prevent version lockdown.
- Test cases to cover common usage such as inline svg.


# Install

`npm install vdom-parser --save`


# Usage

```javascript
// server-side render
var parser = require('vdom-parser');
var nodeCache = document.body;
var vdomCache = parser(nodeCache);

// client-side render
var vdom = h('div', 'hello');

// diff and patch
var patches = diff(vdomCache, vdom);
patch(nodeCache, patches);
```

See [test cases](https://github.com/bitinn/vdom-parser/blob/master/test/test.js) for more examples.


# API

## parser(node)

Returns a `VNode`

### node

Should be a DOM Element


# License

MIT


# Acknowledgement

Thanks to [marcelklehr/vdom-virtualize](https://github.com/marcelklehr/vdom-virtualize) and [TimBeyer/html-to-vdom](https://github.com/TimBeyer/html-to-vdom) for providing reference on this topic.


[npm-image]: https://img.shields.io/npm/v/vdom-parser.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/vdom-parser
[travis-image]: https://img.shields.io/travis/bitinn/vdom-parser.svg?style=flat-square
[travis-url]: https://travis-ci.org/bitinn/vdom-parser
[coveralls-image]: https://img.shields.io/coveralls/bitinn/vdom-parser.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/bitinn/vdom-parser
