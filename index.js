
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
		el = doc.body.firstChild;
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
	if (typeof el !== 'object' || !el.nodeType) { 
		throw new Error('unknown dom element');

	// html comment is not currently supported by virtual-dom
	} else if (el.nodeType === 3) {
		return createVirtualTextNode(el);

	// cdata or doctype is not currently supported by virtual-dom
	} else if (el.nodeType === 1 || el.nodeType === 9) {
		return createVirtualDomNode(el);
	}

	throw new Error('unsupported dom node type');
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
		properties[attr.name] = attr.value;
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
	var name, value;

	// using a map to find the correct case of property name
	if (propertyMap[attr.name]) {
		name = propertyMap[attr.name];
	} else {
		name = attr.name;
	}

	// special cases for values
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
	} else {
		value = attr.value;
	}

	return {
		name: name
		, value: value
	};
}
