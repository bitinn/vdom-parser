
require('./html-domparser');

var chai = require('chai');
var expect = chai.expect;

var parser = require('../index');
var input, output;

describe('vdom-parser', function () {
	it('should parse plain text', function () {
		input = 'test';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('test');
	});

	it('should parse html entities', function () {
		input = '&lt;div&gt;test&lt;/div&gt;';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('<div>test</div>');
	});

	it('should parse simple node', function () {
		input = '<div>test</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.namespace).to.equal('http://www.w3.org/1999/xhtml');

		var children = output.children;
		expect(children).to.have.length(1);
		expect(children[0].type).to.equal('VirtualText');
		expect(children[0].text).to.equal('test');
	});

	it('should parse whitespace in node', function () {
		input = '<div> test </div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');

		var children = output.children;
		expect(children).to.have.length(1);
		expect(children[0].type).to.equal('VirtualText');
		expect(children[0].text).to.equal(' test ');
	});

	it('should ignore whitespace around node', function () {
		input = '  <div>test</div>  ';

		// see html-domparser.js comment
		// in short, polyfill requires input be trimmed first
		// but in most case you should be using dom element so this is not a big deal
		if (window.usingDomParserPolyfill) {
			input = input.trim()
		}

		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');

		var children = output.children;
		expect(children).to.have.length(1);
		expect(children[0].type).to.equal('VirtualText');
		expect(children[0].text).to.equal('test');
	});

	it('should parse html entities in node', function () {
		input = '<div>&lt;div&gt;test&lt;/div&gt;</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');

		var children = output.children;
		expect(children).to.have.length(1);
		expect(children[0].type).to.equal('VirtualText');
		expect(children[0].text).to.equal('<div>test</div>');
	});

	it('should parse empty node', function () {
		input = '<div></div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.children).to.be.empty;
	});

	it('should parse node recursively', function () {
		input = '<div><p>test</p></div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');

		var children = output.children;
		expect(children).to.have.length(1);
		expect(children[0].type).to.equal('VirtualNode');
		expect(children[0].tagName).to.equal('P');

		var textChildren = children[0].children;
		expect(textChildren).to.have.length(1);
		expect(textChildren[0].type).to.equal('VirtualText');
		expect(textChildren[0].text).to.equal('test');
	});

	it('should parse id attribute on node', function () {
		input = '<div id="abc">test</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.id).to.equal('abc');
	});

	it('should parse class attribute on node', function () {
		input = '<div class="abc">test</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.className).to.equal('abc');
	});

	it('should parse class attribute on node when there are multiple classes', function () {
		input = '<div class="abc def">test</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.className).to.equal('abc def');
	});

	it('should preserve camelcase attribute', function () {
		input = '<input tabIndex="1">';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('INPUT');
		expect(output.properties.tabIndex).to.equal('1');
	});

	it('should parse multiple attributes on node', function () {
		input = '<input tabIndex="1" name="abc" value="123">';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('INPUT');
		expect(output.properties.tabIndex).to.equal('1');
		expect(output.properties.name).to.equal('abc');
		expect(output.properties.value).to.equal('123');
	});

	it('should parse style attribute on node', function () {
		input = '<div style="color: red;">test</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.style).to.eql({
			color: 'red'
		});
	});

	it('should parse complex style attribute on node', function () {
		input = '<div style="color:red;width:100px;">test</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.style).to.eql({
			color: 'red'
			, width: '100px'
		});
	});

	it('should parse bracket style attribute on node', function () {
		input = '<div style="color: red; width: 100px; background-url: url(test.jpg)">test</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.style).to.eql({
			color: 'red'
			, width: '100px'
			, 'background-url': 'url(test.jpg)'
		});
	});

	it('should parse data attribute on node', function () {
		input = '<div data-my-attr="abc">test</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.attributes['data-my-attr']).to.equal('abc');
	});

	it('should parse multiple data attribute on node', function () {
		input = '<div data-src="http://example.com/" data-src-title="abc">test</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.attributes['data-src']).to.equal('http://example.com/');
		expect(output.properties.attributes['data-src-title']).to.equal('abc');
	});

	it('should parse for attribute on label', function () {
		input = '<label for="abc"></label>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('LABEL');
		expect(output.properties.htmlFor).to.equal('abc');
		expect(output.properties.attributes).to.be.undefined;
	});

	it('should parse empty label', function () {
		input = '<label></label>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('LABEL');
		expect(output.properties).to.eql({});
	});

	it('should parse html entities on attribute', function () {
		input = '<input type="text" name="test" value="&quot;test&quot;" placeholder="&quot;test&quot;" alt="&quot;test&quot;" title="&quot;test&quot;">';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('INPUT');
		expect(output.properties.placeholder).to.equal('"test"');
		expect(output.properties.alt).to.equal('"test"');
		expect(output.properties.title).to.equal('"test"');
		expect(output.properties.value).to.equal('"test"');
	});

	it('should parse script tag', function () {
		input = '<script>console.log("test")</script>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('SCRIPT');

		var children = output.children;
		expect(children).to.have.length(1);
		expect(children[0].type).to.equal('VirtualText');
		expect(children[0].text).to.equal('console.log("test")');
	});

	it('should parse style tag', function () {
		input = '<style>h1 {color:red;}</style>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('STYLE');

		var children = output.children;
		expect(children).to.have.length(1);
		expect(children[0].type).to.equal('VirtualText');
		expect(children[0].text).to.equal('h1 {color:red;}');
	});

	it('should parse meta tag', function () {
		input = '<meta name="abc" content="test">';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('META');
		expect(output.properties.name).to.equal('abc');
		expect(output.properties.content).to.equal('test');
	});

	it('should parse link tag', function () {
		input = '<link rel="abc" href="//example.com">';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('LINK');
		expect(output.properties.rel).to.equal('abc');
		expect(output.properties.href).to.equal('//example.com');
	});

	it('should parse title tag', function () {
		input = '<title>test</title>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('TITLE');

		var children = output.children;
		expect(children).to.have.length(1);
		expect(children[0].type).to.equal('VirtualText');
		expect(children[0].text).to.equal('test');
	});

	it('should parse svg tag', function () {
		input = '<svg viewBox="0 0 10 10"></svg>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('svg');
		expect(output.namespace).to.equal('http://www.w3.org/2000/svg');
		expect(output.properties.viewBox).to.equal('0 0 10 10');
	});

	it('should parse svg tag with foreign namespace', function () {
		input = '<svg class="icon"><use xlink:href="/icon.svg#name"></use></svg>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('svg');
		expect(output.namespace).to.equal('http://www.w3.org/2000/svg');

		var children = output.children;
		expect(children).to.have.length(1);

		var useTag = children[0];
		expect(useTag.type).to.equal('VirtualNode');
		expect(useTag.tagName).to.equal('use');
		expect(output.properties.class).to.equal('icon');
		expect(useTag.properties['xlink:href'].value).to.equal('/icon.svg#name');
		expect(useTag.properties['xlink:href'].namespace).to.equal('http://www.w3.org/1999/xlink');
	});

	it('should handle doctype with fallback', function () {
		input = '<!DOCTYPE html>';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle cdata with fallback', function () {
		input = '<![CDATA[ hey ]]>';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle html comment with fallback', function () {
		input = '<!-- comment -->';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle html tag with fallback', function () {
		input = '<html></html>';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle body tag with fallback', function () {
		input = '<body></body>';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle head tag with fallback', function () {
		input = '<head></head>';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle empty input with fallback', function () {
		input = '';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle whitespace input with fallback', function () {
		input = '   ';

		// see html-domparser.js comment
		// in short, polyfill requires input be trimmed first
		// but in most case you should be using dom element so this is not a big deal
		if (window.usingDomParserPolyfill) {
			input = input.trim()
		}

		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle dom node input', function () {
		input = document.createElement('div');
		input.id = 'test';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.id).to.equal('test');
	});

	it('should handle document body', function () {
		input = document.body;
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('BODY');
	});

	it('should handle document head', function () {
		input = document.head;
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('HEAD');
	});

	it('should handle document', function () {
		input = document.documentElement;
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('HTML');
	});

	it('should throw if input is not supported', function () {
		input = [];
		expect(function() {
			output = parser(input);
		}).to.throw(Error);

		input = {};
		expect(function() {
			output = parser(input);
		}).to.throw(Error);
	});
});
