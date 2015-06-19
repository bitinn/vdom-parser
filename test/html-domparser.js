/*
 * DOMParser HTML extension
 * 2012-09-04
 * 
 * By Eli Grey, http://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*! @source https://gist.github.com/1129031 */
/*global document, DOMParser*/

(function(DOMParser) {
	"use strict";

	var DOMParser_proto = DOMParser.prototype;
	var real_parseFromString = DOMParser_proto.parseFromString;

	// Firefox/Opera/IE throw errors on unsupported types
	try {
		// WebKit returns null on unsupported types
		if ((new DOMParser).parseFromString("", "text/html")) {
			// text/html parsing is natively supported
			return;
		}
	} catch (ex) {}

	window.usingPolyfillOnIE9 = false;
	DOMParser_proto.parseFromString = function(markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			var doc = document.implementation.createHTMLDocument("");

			// Note: make this polyfill behave closer to native domparser
			if (markup.indexOf('<!') > -1) {
				// Note: IE 9 doesn't support writing innerHTML on this node
				try {
					doc.documentElement.innerHTML = markup;
				} catch (ex) {
					// Note: exposing this only for testing purpose
					window.usingPolyfillOnIE9 = true;
				}
			} else if (markup.indexOf('<title') > -1
				|| markup.indexOf('<meta') > -1
				|| markup.indexOf('<link') > -1
				|| markup.indexOf('<script') > -1
				|| markup.indexOf('<style') > -1)
			{
				// Note: IE 9 doesn't support writing innerHTML on this node
				try {
					doc.documentElement.innerHTML = markup;
				} catch (ex) {
					// Note: exposing this only for testing purpose
					window.usingPolyfillOnIE9 = true;
				}
			// Note: this part works on most modern browsers
			} else {
				doc.body.innerHTML = markup;
			}
			return doc;
		} else {
			return real_parseFromString.apply(this, arguments);
		}
	};

	// Note: exposing this only for testing purpose
	window.usingDomParserPolyfill = true;
}(DOMParser));