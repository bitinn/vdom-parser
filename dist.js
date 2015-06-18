(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.vdomParser = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * index.js
 *
 * A client-side DOM to vdom parser based on DOMParser API
 */

var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');
var domParser = new DOMParser();

var propertyMap = require('./property-map');

module.exports = parser;

/**
 * DOM/html string to vdom parser
 *
 * @param   Mixed   el  DOM element or html string 
 * @return  Object      VNode or VText
 */
function parser(el) {
	if (typeof el === 'string') {
		var doc = domParser.parseFromString(el, 'text/html');
		// most tags default to body
		if (doc.body.firstChild) {
			el = doc.body.firstChild;
		// some tags, like script and title, default to head
		} else if (doc.head.firstChild) {
			el = doc.head.firstChild;
		// special case for html comment, cdata, doctype
		} else if (doc.firstChild && doc.firstChild !== doc.documentElement) {
			el = doc.firstChild;
		// fallback to empty text node
		} else {
			el = document.createTextNode('');
		}
	}

	return createNode(el);
}

/**
 * Create vdom from dom node
 *
 * @param   Object  el  DOM element
 * @return  Object      VNode or VText
 */
function createNode(el) {
	// expect valid dom node
	if (typeof el !== 'object' || !el || !el.nodeType) { 
		console.error('invalid dom node, fallback to empty text node', el);
		return new VText('');

	// html comment is not currently supported by virtual-dom
	} else if (el.nodeType === 3) {
		return createVirtualTextNode(el);

	// cdata or doctype is not currently supported by virtual-dom
	} else if (el.nodeType === 1 || el.nodeType === 9) {
		return createVirtualDomNode(el);
	}

	// default to empty text node
	return new VText('');
}

/**
 * Create vtext from dom node
 *
 * @param   Object  el  Text node
 * @return  Object      VText
 */
function createVirtualTextNode(el) {
	return new VText(el.nodeValue);
}

/**
 * Create vnode from dom node
 *
 * @param   Object  el  DOM element
 * @return  Object      VNode
 */
function createVirtualDomNode(el) {
	return new VNode(
		el.tagName
		, createProperties(el)
		, createChildren(el)
		, null
		, el.namespaceURI || null
	);
}

/**
 * Recursively create vdom
 *
 * @param   Object  el  Parent element
 * @return  Array       Child vnode or vtext
 */
function createChildren(el) {
	var children = [];
	for (var i = 0; i < el.childNodes.length; i++) {
		children.push(createNode(el.childNodes[i]));
	};

	return children;
}

/**
 * Create properties from dom node
 *
 * @param   Object  el  DOM element
 * @return  Object      Node properties and attributes
 */
function createProperties(el) {
	var properties = {};

	if (!el.hasAttributes()) {
		return properties;
	}

	var attr;
	for (var i = 0; i < el.attributes.length; i++) {
		attr = createProperty(el.attributes[i]);

		// special case, use properties.attributes.foobar
		if (attr.isAttr) {
			// init attributes object only when necessary
			if (!properties.attributes) {
				properties.attributes = {}
			}
			properties.attributes[attr.name] = attr.value;

		// default case, use properties.foobar
		} else {
			properties[attr.name] = attr.value;
		}
	};

	return properties;
}

/**
 * Create property from dom attribute 
 *
 * @param   Object  attr  DOM attribute
 * @return  Object        Normalized attribute
 */
function createProperty(attr) {
	var name, value, isAttr;

	// using a map to find the correct case of property name
	if (propertyMap[attr.name]) {
		name = propertyMap[attr.name];
	} else {
		name = attr.name;
	}

	// special cases for style attribute, we default to properties.style
	if (name === 'style') {
		var style = {};
		attr.value.split(';').forEach(function (s) {
			var pos = s.indexOf(':');
			if (pos < 0) {
				return;
			}
			style[s.substr(0, pos).trim()] = s.substr(pos + 1).trim();
		});
		value = style;
	// special cases for data attribute, we default to properties.attributes.data
	} else if (name.indexOf('data-') === 0) {
		value = attr.value;
		isAttr = true;
	} else {
		value = attr.value;
	}

	return {
		name: name
		, value: value
		, isAttr: isAttr || false
	};
}

},{"./property-map":9,"virtual-dom/vnode/vnode":7,"virtual-dom/vnode/vtext":8}],2:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],3:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],4:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":6}],5:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],6:[function(require,module,exports){
module.exports = "2"

},{}],7:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":2,"./is-vhook":3,"./is-vnode":4,"./is-widget":5,"./version":6}],8:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":6}],9:[function(require,module,exports){

/**
 * property-map.js
 *
 * Necessary to map dom attributes back to vdom properties
 */

// invert of https'://www.npmjs.com/package/html-attributes
var properties = {
	'abbr': 'abbr'
	, 'accept': 'accept'
	, 'accept-charset': 'acceptCharset'
	, 'accesskey': 'accessKey'
	, 'action': 'action'
	, 'allowfullscreen': 'allowFullScreen'
	, 'allowtransparency': 'allowTransparency'
	, 'alt': 'alt'
	, 'async': 'async'
	, 'autocomplete': 'autoComplete'
	, 'autofocus': 'autoFocus'
	, 'autoplay': 'autoPlay'
	, 'cellpadding': 'cellPadding'
	, 'cellspacing': 'cellSpacing'
	, 'challenge': 'challenge'
	, 'charset': 'charset'
	, 'checked': 'checked'
	, 'cite': 'cite'
	, 'class': 'className'
	, 'cols': 'cols'
	, 'colspan': 'colSpan'
	, 'command': 'command'
	, 'content': 'content'
	, 'contenteditable': 'contentEditable'
	, 'contextmenu': 'contextMenu'
	, 'controls': 'controls'
	, 'coords': 'coords'
	, 'crossorigin': 'crossOrigin'
	, 'data': 'data'
	, 'datetime': 'dateTime'
	, 'default': 'default'
	, 'defer': 'defer'
	, 'dir': 'dir'
	, 'disabled': 'disabled'
	, 'download': 'download'
	, 'draggable': 'draggable'
	, 'dropzone': 'dropzone'
	, 'enctype': 'encType'
	, 'for': 'htmlFor'
	, 'form': 'form'
	, 'formaction': 'formAction'
	, 'formenctype': 'formEncType'
	, 'formmethod': 'formMethod'
	, 'formnovalidate': 'formNoValidate'
	, 'formtarget': 'formTarget'
	, 'frameBorder': 'frameBorder'
	, 'headers': 'headers'
	, 'height': 'height'
	, 'hidden': 'hidden'
	, 'high': 'high'
	, 'href': 'href'
	, 'hreflang': 'hrefLang'
	, 'http-equiv': 'httpEquiv'
	, 'icon': 'icon'
	, 'id': 'id'
	, 'inputmode': 'inputMode'
	, 'ismap': 'isMap'
	, 'itemid': 'itemId'
	, 'itemprop': 'itemProp'
	, 'itemref': 'itemRef'
	, 'itemscope': 'itemScope'
	, 'itemtype': 'itemType'
	, 'kind': 'kind'
	, 'label': 'label'
	, 'lang': 'lang'
	, 'list': 'list'
	, 'loop': 'loop'
	, 'manifest': 'manifest'
	, 'max': 'max'
	, 'maxlength': 'maxLength'
	, 'media': 'media'
	, 'mediagroup': 'mediaGroup'
	, 'method': 'method'
	, 'min': 'min'
	, 'minlength': 'minLength'
	, 'multiple': 'multiple'
	, 'muted': 'muted'
	, 'name': 'name'
	, 'novalidate': 'noValidate'
	, 'open': 'open'
	, 'optimum': 'optimum'
	, 'pattern': 'pattern'
	, 'ping': 'ping'
	, 'placeholder': 'placeholder'
	, 'poster': 'poster'
	, 'preload': 'preload'
	, 'radiogroup': 'radioGroup'
	, 'readonly': 'readOnly'
	, 'rel': 'rel'
	, 'required': 'required'
	, 'role': 'role'
	, 'rows': 'rows'
	, 'rowspan': 'rowSpan'
	, 'sandbox': 'sandbox'
	, 'scope': 'scope'
	, 'scoped': 'scoped'
	, 'scrolling': 'scrolling'
	, 'seamless': 'seamless'
	, 'selected': 'selected'
	, 'shape': 'shape'
	, 'size': 'size'
	, 'sizes': 'sizes'
	, 'sortable': 'sortable'
	, 'span': 'span'
	, 'spellcheck': 'spellCheck'
	, 'src': 'src'
	, 'srcdoc': 'srcDoc'
	, 'srcset': 'srcSet'
	, 'start': 'start'
	, 'step': 'step'
	, 'style': 'style'
	, 'tabindex': 'tabIndex'
	, 'target': 'target'
	, 'title': 'title'
	, 'translate': 'translate'
	, 'type': 'type'
	, 'typemustmatch': 'typeMustMatch'
	, 'usemap': 'useMap'
	, 'value': 'value'
	, 'width': 'width'
	, 'wmode': 'wmode'
	, 'wrap': 'wrap'
};

module.exports = properties;

},{}]},{},[1])(1)
});