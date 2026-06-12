d3.json('data.json', function(err, response) {
	if (err) {
		d3.select('#chart').append('p').text('No se pudo cargar el ejemplo.');
		return;
	}

	render(response);
	bindResponsiveRedraw('gistNarrative', function() {
		render(response);
	});

	function render(data) {
		var narrative;
		var sceneWidth = 10;
		var scenes = wrangle(data);
		var width = getAvailableChartWidth('#chart', 320, 40);
		var height = 600;
		var svg;

		d3.select('#chart').selectAll('*').remove();

		svg = d3.select('#chart').append('svg')
			.attr('id', 'narrative-chart')
			.attr('width', width)
			.attr('height', height);

		scenes.forEach(function(scene) {
			scene.characters.forEach(function(character) {
				character.width = svg.append('text')
					.attr('opacity', 0)
					.attr('class', 'temp')
					.text(character.name)
					.node().getComputedTextLength() + 10;
			});
		});

		svg.selectAll('text.temp').remove();

		narrative = d3.layout.narrative()
			.scenes(scenes)
			.size([width, height])
			.pathSpace(10)
			.groupMargin(10)
			.labelSize([250, 15])
			.scenePadding([5, sceneWidth / 2, 5, sceneWidth / 2])
			.labelPosition('left')
			.layout();

		svg.attr('height', narrative.extent()[1]);

		svg.selectAll('.scene').data(narrative.scenes()).enter()
			.append('g')
			.attr('class', 'scene')
			.attr('transform', function(d) {
				var x = Math.round(d.x) + 0.5;
				var y = Math.round(d.y) + 0.5;
				return 'translate(' + [x, y] + ')';
			})
			.append('rect')
			.attr('width', sceneWidth)
			.attr('height', function(d) {
				return d.height;
			})
			.attr('y', 0)
			.attr('x', 0)
			.attr('rx', 3)
			.attr('ry', 3);

		svg.selectAll('.scene').selectAll('.appearance').data(function(d) {
			return d.appearances;
		}).enter().append('circle')
			.attr('cx', function(d) {
				return d.x;
			})
			.attr('cy', function(d) {
				return d.y;
			})
			.attr('r', 2)
			.attr('class', function(d) {
				return 'appearance ' + d.character.affiliation;
			});

		svg.selectAll('.link').data(narrative.links()).enter()
			.append('path')
			.attr('class', function(d) {
				return 'link ' + d.character.affiliation.toLowerCase();
			})
			.attr('d', narrative.link());

		svg.selectAll('.intro').data(narrative.introductions())
			.enter().call(function(selection) {
				var group = selection.append('g').attr('class', 'intro');
				var text = group.append('g').attr('class', 'text');

				group.append('rect')
					.attr('y', -4)
					.attr('x', -4)
					.attr('width', 4)
					.attr('height', 8);

				text.append('text');
				text.append('text').attr('class', 'color');

				group.attr('transform', function(d) {
					var x = Math.round(d.x);
					var y = Math.round(d.y);
					return 'translate(' + [x, y] + ')';
				});

				group.selectAll('text')
					.attr('text-anchor', 'end')
					.attr('y', '4px')
					.attr('x', '-8px')
					.text(function(d) {
						return d.character.name;
					});

				group.select('.color')
					.attr('class', function(d) {
						return 'color ' + d.character.affiliation;
					});

				group.select('rect')
					.attr('class', function(d) {
						return d.character.affiliation;
					});
			});
	}
});

function wrangle(data) {
	var charactersMap = {};

	return data.scenes.map(function(scene) {
		return {
			characters: scene.map(function(id) {
				return characterById(id);
			}).filter(function(character) {
				return character;
			})
		};
	});

	function characterById(id) {
		var index;

		if (!id) {
			return null;
		}

		if (!charactersMap[id]) {
			for (index = 0; index < data.characters.length; index += 1) {
				if (data.characters[index].id === id) {
					charactersMap[id] = data.characters[index];
					break;
				}
			}
		}

		return charactersMap[id] || null;
	}
}