
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


	/*
	describe('when converting a tag with data attributes', function () {
		it('converts a single data attribute correctly', function () {

			var html = '<div data-test="foobar"></div>';

			var converted = convertHTML(html);

			should.exist(converted.properties.dataset.test);
			converted.properties.dataset.test.should.eql('foobar');

			should.exist(converted.properties['data-test']);
			converted.properties['data-test'].should.eql('foobar');
		});

		it('converts a single hyphenated data attribute correctly', function () {

			var html = '<div data-test-data="foobar"></div>';

			var converted = convertHTML(html);

			should.exist(converted.properties.dataset.testData);
			converted.properties.dataset.testData.should.eql('foobar');

			should.exist(converted.properties['data-test-data']);
			converted.properties['data-test-data'].should.eql('foobar');
		});

		 it('converts multiple data attributes correctly', function () {

			var html = '<div data-test="foobar" data-foobar="test"></div>';

			var converted = convertHTML(html);

			should.exist(converted.properties.dataset.test);
			converted.properties.dataset.test.should.eql('foobar');

			should.exist(converted.properties.dataset.foobar);
			converted.properties.dataset.foobar.should.eql('test');

			should.exist(converted.properties['data-test']);
			converted.properties['data-test'].should.eql('foobar');

			should.exist(converted.properties['data-foobar']);
			converted.properties['data-foobar'].should.eql('test');
		});
	});

	describe('when converting a tag containing text', function () {
		it('converts to a tag with a child VText node correctly', function () {
			var html = '<div>Test</div>';
			var converted = convertHTML(html);

			should.exist(converted.children);
			converted.children.length.should.eql(1);
			converted.children[0].text.should.eql('Test');
		});
	});

	describe('when converting a tag containing a child tag', function () {
		it('converts to a tag with a child node correctly', function () {
			var html = '<div class="parent"><span class="child"></span></div>';
			var converted = convertHTML(html);

			converted.tagName.should.eql('DIV');
			converted.properties.className.should.eql('parent');

			should.exist(converted.children);
			converted.children.length.should.eql(1);
			converted.children[0].tagName.should.eql('SPAN');
			converted.children[0].properties.className.should.eql('child');
		});
	});

	describe('when converting a tag containing a child tag with text', function () {
		it('converts to a tag with a child node correctly', function () {
			var html = '<div class="parent"><span class="child">Test</span></div>';
			var converted = convertHTML(html);

			converted.tagName.should.eql('DIV');
			converted.properties.className.should.eql('parent');

			should.exist(converted.children);
			converted.children.length.should.eql(1);
			converted.children[0].tagName.should.eql('SPAN');
			converted.children[0].properties.className.should.eql('child');

			converted.children[0].children[0].text.should.eql('Test');
		});
	});

	describe('when converting a label containing the `for` attribute', function () {
		it('sets the htmlFor attribute correspondingly', function () {
			var html = '<label for="foobar"></label>';
			var converted = convertHTML(html);
			should.exist(converted.properties.htmlFor);
			converted.properties.htmlFor.should.eql('foobar');
		});
	});

	describe('when converting a label not containing the `for` attribute', function () {
		it('does not set the htmlFor attribute correspondingly', function () {
			var html = '<label></label>';
			var converted = convertHTML(html);
			should.not.exist(converted.properties.htmlFor);
		});
	});

	describe('when converting HTML containing html entities', function () {
		it('converts them back to characters', function () {
			var html = '<span>&lt;a href&equals;&quot;foobar.com&quot;&gt;test&lt;&sol;a&gt;</span>';
			var converted = convertHTML(html);
			converted.tagName.should.eql('SPAN');
			converted.children.length.should.eql(1);
			converted.children[0].text.should.eql('<a href="foobar.com">test</a>');
		});
	});

	describe('when converting HTML containing html entities in placeholder, alt or title', function () {
		it('converts them to characters', function () {
			var html = '<input type="text" placeholder="&quot;test&quot;" alt="&quot;test&quot;" title="&quot;test&quot;">';
			var converted = convertHTML(html);
			converted.tagName.should.eql('INPUT');
			converted.properties.placeholder.should.eql('"test"');
			converted.properties.alt.should.eql('"test"');
			converted.properties.title.should.eql('"test"');
		});
	});

	describe('when converting HTML containing a script tag', function () {
		it('converts to a virtualdom node', function () {
			var html = '<div><script src="foo.js">alert("bar!");</script></div>';
			var converted = convertHTML(html);
			var script = converted.children[0];
			should.exist(script);
			script.tagName.should.eql('SCRIPT');
			script.children.length.should.eql(1);
			script.children[0].text.should.eql('alert("bar!");');
		});
	});

	describe('when converting HTML containing a style tag', function () {
		it('converts to a virtualdom node', function () {
			var html = '<div><style>h1 {color:red;} p {color:blue;} </style></div>';
			var converted = convertHTML(html);
			var script = converted.children[0];
			should.exist(script);
			script.tagName.should.eql('STYLE');
			script.children.length.should.eql(1);
			script.children[0].text.should.eql('h1 {color:red;} p {color:blue;} ');
		});
	});

	describe('when converting HTML containing CDATA', function () {
		it('returns an empty string instead (cdata is unsupported)', function () {
			var html = '<![CDATA[ Within this Character Data block I can\
						use double dashes as much as I want (along with <, &, \', and ")\
						*and* %MyParamEntity; will be expanded to the text\
						"Has been expanded" ... however, I can\'t use\
						the CEND sequence (if I need to use it I must escape one of the\
						brackets or the greater-than sign).\
						]]>';
			var converted = convertHTML(html);
			converted.text.should.eql('');
		});
	});

	describe('when converting HTML containing a directive', function () {
		it('returns an empty string instead (directives are unsupported)', function () {
			var html = '<!DOCTYPE html>';
			var converted = convertHTML(html);
			converted.text.should.eql('');
		});
	});

	describe('when converting HTML containing a comment', function () {
		it('returns an empty string instead (comments are unsupported)', function () {
			var html = '<div><!-- some comment --></div>';
			var converted = convertHTML(html);
			var comment = converted.children[0];
			comment.text.should.eql('');
		});
	});
	*/
});
