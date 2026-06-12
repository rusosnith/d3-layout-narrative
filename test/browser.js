(function() {
	var expect = chai.expect;

	describe('d3.layout.narrative', function() {
		var narrative = d3.layout.narrative();
		var testValue = 'test';

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
		});

		describe('setters/getters', function() {
			it('should chain on set', function() {
				expect(narrative.scenes(testValue)).to.eql(narrative);
				expect(narrative.characters(testValue)).to.eql(narrative);
				expect(narrative.size(testValue)).to.eql(narrative);
				expect(narrative.orientation(testValue)).to.eql(narrative);
				expect(narrative.pathSpace(testValue)).to.eql(narrative);
				expect(narrative.groupMargin(testValue)).to.eql(narrative);
				expect(narrative.scenePadding(testValue)).to.eql(narrative);
				expect(narrative.labelSize(testValue)).to.eql(narrative);
				expect(narrative.labelPosition(testValue)).to.eql(narrative);
			});

			it('should return modified value on get', function() {
				var defaults = d3.layout.narrative();

				expect(narrative.scenes()).to.eql(testValue);
				expect(narrative.characters()).to.eql(testValue);
				expect(narrative.size()).to.eql(testValue);
				expect(narrative.orientation()).to.eql(testValue);
				expect(narrative.pathSpace()).to.eql(testValue);
				expect(narrative.groupMargin()).to.eql(testValue);
				expect(narrative.scenePadding()).to.eql(testValue);
				expect(narrative.labelSize()).to.eql(testValue);
				expect(narrative.labelPosition()).to.eql(testValue);

				expect(narrative.scenes()).to.not.eql(defaults.scenes());
				expect(narrative.characters()).to.not.eql(defaults.characters());
				expect(narrative.size()).to.not.eql(defaults.size());
				expect(narrative.orientation()).to.not.eql(defaults.orientation());
				expect(narrative.pathSpace()).to.not.eql(defaults.pathSpace());
				expect(narrative.groupMargin()).to.not.eql(defaults.groupMargin());
				expect(narrative.scenePadding()).to.not.eql(defaults.scenePadding());
				expect(narrative.labelSize()).to.not.eql(defaults.labelSize());
				expect(narrative.labelPosition()).to.not.eql(defaults.labelPosition());
			});
		});
	});

	mocha.run();
}());