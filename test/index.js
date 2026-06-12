(function() {
	var fs, vm, expect, d3, context;

	vm = require('vm');
	fs = require('fs');
	expect = require('chai').expect;
	d3 = require('d3');

	function execfile(path, context) {
		var data;
		context = context || {};
		data = fs.readFileSync(path);
		vm.runInNewContext(data, context, path);
		return context;
	}

	context = execfile(__dirname + '/../narrative.js', {d3: d3});

	describe('d3.layout.narrative', function() {
		var narrative;

		narrative = context.d3.layout.narrative();

		it('instance should be an object', function() {
			expect(narrative).to.exist;
		});

		it('should initially have the default values', function() {
			expect(narrative.size()).to.eql([1, 1]);
			expect(narrative.orientation()).to.eql('horizontal');
			expect(narrative.pathSpace()).to.eql(10);
			expect(narrative.groupMargin()).to.eql(0);
			expect(narrative.scenePadding()).to.eql([0, 0, 0, 0]);
			expect(narrative.labelSize()).to.eql([100, 15]);
			expect(narrative.labelPosition()).to.eql('right');
			expect(narrative.filterScenes()).to.eql(false);
		});

		describe('setters/getters', function() {
			it('should chain on set', function() {
				expect(narrative.scenes('test')).to.eql(narrative);
				expect(narrative.characters('test')).to.eql(narrative);
				expect(narrative.size('test')).to.eql(narrative);
				expect(narrative.orientation('test')).to.eql(narrative);
				expect(narrative.pathSpace('test')).to.eql(narrative);
				expect(narrative.groupMargin('test')).to.eql(narrative);
				expect(narrative.scenePadding('test')).to.eql(narrative);
				expect(narrative.labelSize('test')).to.eql(narrative);
				expect(narrative.labelPosition('test')).to.eql(narrative);
				expect(narrative.filterScenes('test')).to.eql(narrative);
			});

			it('should return modified value on get', function() {
				var defaults = context.d3.layout.narrative();

				expect(narrative.scenes()).to.eql('test');
				expect(narrative.characters()).to.eql('test');
				expect(narrative.size()).to.eql('test');
				expect(narrative.orientation()).to.eql('test');
				expect(narrative.pathSpace()).to.eql('test');
				expect(narrative.groupMargin()).to.eql('test');
				expect(narrative.scenePadding()).to.eql('test');
				expect(narrative.labelSize()).to.eql('test');
				expect(narrative.labelPosition()).to.eql('test');
				expect(narrative.filterScenes()).to.eql('test');

				expect(narrative.scenes()).to.not.eql(defaults.scenes());
				expect(narrative.characters()).to.not.eql(defaults.characters());
				expect(narrative.size()).to.not.eql(defaults.size());
				expect(narrative.orientation()).to.not.eql(defaults.orientation());
				expect(narrative.pathSpace()).to.not.eql(defaults.pathSpace());
				expect(narrative.groupMargin()).to.not.eql(defaults.groupMargin());
				expect(narrative.scenePadding()).to.not.eql(defaults.scenePadding());
				expect(narrative.labelSize()).to.not.eql(defaults.labelSize());
				expect(narrative.labelPosition()).to.not.eql(defaults.labelPosition());
				expect(narrative.filterScenes()).to.not.eql(defaults.filterScenes());
			});

			it('should allow filtering scenes when enabled', function() {
				var charA = {name: 'A'};
				var charB = {name: 'B'};
				var charC = {name: 'C'};
				var filtered = context.d3.layout.narrative();

				filtered
					.filterScenes(true)
					.characters([charA, charB, charC])
					.scenes([
						{characters: [charA, charB]},
						{characters: [charA, charB]},
						{characters: [charA]}
					])
					.layout();

				expect(filtered.filterScenes()).to.eql(true);
				expect(filtered.characters().length).to.eql(2);
				expect(filtered.scenes().length).to.eql(2);
				expect(filtered.links().length).to.eql(4);
			});
		});
	});
}());
