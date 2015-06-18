
var expect = chai.expect;
var parser = vdomParser;
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
		input = '<div style="color: red; width: 100px; background: rgba(0, 0, 0)">test</div>';
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.style).to.eql({
			color: 'red'
			, width: '100px'
			, background: 'rgba(0, 0, 0)'
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

	it('should handle cdata', function () {
		input = '<![CDATA[ hey ]]>';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle doctype', function () {
		input = '<!DOCTYPE html>';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle html comment', function () {
		input = '<!-- comment -->';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle empty input', function () {
		input = '';
		output = parser(input);

		expect(output.type).to.equal('VirtualText');
		expect(output.text).to.equal('');
	});

	it('should handle dom node input', function () {
		input = document.getElementById('mocha');
		output = parser(input);

		expect(output.type).to.equal('VirtualNode');
		expect(output.tagName).to.equal('DIV');
		expect(output.properties.id).to.equal('mocha');
	});
});
