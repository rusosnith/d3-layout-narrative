d3.csv('../../ESMA2.csv', function(err, rows) {
	var baseData;
	var filters = {
		year: '',
		place: '',
		person: ''
	};

	if (err) {
		d3.select('#empty').text('No se pudo cargar ESMA2.csv.');
		return;
	}

	baseData = buildGroupedScenes(rows || []);

	if (!baseData.scenes.length) {
		d3.select('#empty').text('No hay datos suficientes para construir escenas.');
		return;
	}

	setupFilters(baseData, filters, render);
	render();

	function render() {
		var filteredScenes = applyFilters(baseData.scenes, filters);
		var prepared = buildNarrativeDataFromScenes(filteredScenes, baseData.personStatusByName);
		var sceneWidth = 12;
		var width = Math.max(1600, Math.max(1, prepared.sceneObjects.length) * sceneWidth * 9);
		var height = 900;
		var svg;
		var narrative;

		d3.select('#chart').selectAll('*').remove();
		d3.select('#empty').text('');

		if (!prepared.sceneObjects.length || !prepared.characters.length) {
			updateMeta(prepared, filters);
			d3.select('#empty').text('No hay coincidencias con esos filtros.');
			return;
		}

		svg = d3.select('#chart').append('svg')
			.attr('id', 'narrative-chart-esma')
			.attr('width', width)
			.attr('height', height);

		prepared.characters.forEach(function(character) {
			character.width = svg.append('text')
				.attr('opacity', 0)
				.attr('class', 'temp')
				.text(character.name)
				.node().getComputedTextLength() + 10;
		});

		svg.selectAll('text.temp').remove();

		narrative = d3.layout.narrative()
			.scenes(prepared.sceneObjects)
			.size([width, height])
			.pathSpace(14)
			.groupMargin(16)
			.labelSize([320, 16])
			.scenePadding([5, sceneWidth / 2, 5, sceneWidth / 2])
			.labelPosition('left')
			.layout();

		svg.attr('height', narrative.extent()[1] + 36);

		svg.selectAll('.scene').data(narrative.scenes()).enter()
			.append('g')
			.attr('class', 'scene')
			.attr('transform', function(d) {
				var x = Math.round(d.x) + 0.5;
				var y = Math.round(d.y) + 0.5;
				return 'translate(' + [x, y] + ')';
			})
			.call(function(sceneSelection) {
				sceneSelection.append('rect')
					.attr('class', function(d) {
						return d.placeClass;
					})
					.attr('width', sceneWidth)
					.attr('height', function(d) {
						return d.height;
					})
					.attr('y', 0)
					.attr('x', 0)
					.attr('rx', 3)
					.attr('ry', 3);

				sceneSelection.append('text')
					.attr('class', 'scene-label')
					.attr('x', sceneWidth + 4)
					.attr('y', 2)
					.attr('dominant-baseline', 'hanging')
					.text(function(d) {
						return d.label || '';
					});
			});

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
				return 'link ' + d.character.affiliation;
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

		updateMeta(prepared, filters);
	}
});

function buildGroupedScenes(rows) {
	var sceneByKey = {};
	var scenes = [];
	var years = {};
	var places = {};
	var people = {};
	var personStatusByName = {};

	rows.forEach(function(row) {
		var date = normalizeDate(row.date);
		var place = normalizeText(row.Lugar);
		var month;
		var year;
		var key;
		var scene;
		var personNames;

		if (!date || !place || date.length < 7) {
			return;
		}

		month = date.slice(0, 7);
		year = date.slice(0, 4);
		key = month + '||' + place;
		scene = sceneByKey[key];

		if (!scene) {
			scene = {
				id: key,
				month: month,
				year: year,
				place: place,
				label: month + ' - ' + shorten(place, 48),
				peopleByName: {}
			};
			sceneByKey[key] = scene;
			scenes.push(scene);
		}

		personNames = extractPeople(row.nombre_persona);
		personNames.forEach(function(personName) {
			var detectedStatus;

			if (!personName) {
				return;
			}

			detectedStatus = detectStatus(row);

			if (scene.peopleByName[personName]) {
				personStatusByName[personName] = mergeStatus(personStatusByName[personName], detectedStatus);
				return;
			}
			scene.peopleByName[personName] = true;
			personStatusByName[personName] = mergeStatus(personStatusByName[personName], detectedStatus);
			people[personName] = true;
		});

		years[year] = true;
		places[place] = true;
	});

	scenes.sort(function(a, b) {
		if (a.month < b.month) {
			return -1;
		}
		if (a.month > b.month) {
			return 1;
		}
		if (a.place < b.place) {
			return -1;
		}
		if (a.place > b.place) {
			return 1;
		}
		return 0;
	});

	return {
		scenes: scenes,
		years: Object.keys(years).sort(),
		places: Object.keys(places).sort(),
		people: Object.keys(people).sort(),
		personStatusByName: personStatusByName
	};
}

function buildNarrativeDataFromScenes(scenes, personStatusByName) {
	var characterByName = {};
	var characterOrder = [];
	var sceneObjects = [];

	scenes.forEach(function(scene) {
		var names = Object.keys(scene.peopleByName).sort();

		if (names.length < 2) {
			return;
		}

		names.forEach(function(name) {
			var status;

			if (!characterByName[name]) {
				status = normalizeStatus(personStatusByName[name]);
				characterByName[name] = {
					id: makeId(name, characterOrder.length + 1),
					name: name,
					affiliation: status
				};
				characterOrder.push(name);
			}
		});

		sceneObjects.push({
			id: scene.id,
			label: scene.label,
			placeClass: placeIsESMA(scene.place) ? 'esma-place' : 'fuera-place',
			characters: names.map(function(name) {
				return characterByName[name];
			})
		});
	});

	return {
		scenes: scenes,
		characters: characterOrder.map(function(name) {
			return characterByName[name];
		}),
		sceneObjects: sceneObjects
	};
}

function applyFilters(scenes, filters) {
	return scenes.filter(function(scene) {
		var names = Object.keys(scene.peopleByName);
		var yearMatch = !filters.year || scene.year === filters.year;
		var placeMatch = !filters.place || scene.place === filters.place;
		var personMatch = !filters.person || scene.peopleByName[filters.person];
		return yearMatch && placeMatch && personMatch && names.length > 0;
	});
}

function setupFilters(baseData, filters, onChange) {
	var yearSelect = d3.select('#filter-year');
	var placeSelect = d3.select('#filter-place');
	var personSelect = d3.select('#filter-person');

	fillSelect(yearSelect, 'Todos los anios', baseData.years);
	fillSelect(placeSelect, 'Todos los lugares', baseData.places);
	fillSelect(personSelect, 'Todas las personas', baseData.people);

	yearSelect.on('change', function() {
		filters.year = yearSelect.property('value');
		onChange();
	});

	placeSelect.on('change', function() {
		filters.place = placeSelect.property('value');
		onChange();
	});

	personSelect.on('change', function() {
		filters.person = personSelect.property('value');
		onChange();
	});

	d3.select('#reset-filters').on('click', function() {
		filters.year = '';
		filters.place = '';
		filters.person = '';
		yearSelect.property('value', '');
		placeSelect.property('value', '');
		personSelect.property('value', '');
		onChange();
	});
}

function fillSelect(selection, allLabel, values) {
	var options = [{ value: '', label: allLabel }].concat(values.map(function(value) {
		return { value: value, label: value };
	}));

	selection.selectAll('option').remove();
	selection.selectAll('option')
		.data(options)
		.enter()
		.append('option')
		.attr('value', function(d) {
			return d.value;
		})
		.text(function(d) {
			return d.label;
		});
}

function updateMeta(prepared, filters) {
	var filterSummary = [];
	var statusSummary = summarizeStatuses(prepared.characters);

	if (filters.year) {
		filterSummary.push('Anio: ' + filters.year);
	}
	if (filters.place) {
		filterSummary.push('Lugar: ' + filters.place);
	}
	if (filters.person) {
		filterSummary.push('Persona: ' + filters.person);
	}

	d3.select('#meta').text(
		'Scenes: ' + prepared.sceneObjects.length +
		' | Personas: ' + prepared.characters.length +
		' | Grave: ' + statusSummary.grave +
		' | Liberada: ' + statusSummary.liberada +
		' | Sin dato: ' + statusSummary.sin_dato +
		' | Regla: mismo lugar + mismo mes' +
		(filterSummary.length ? ' | Filtros: ' + filterSummary.join(' ; ') : '')
	);
}

function normalizeDate(value) {
	if (!value) {
		return '';
	}
	return String(value).trim();
}

function normalizeText(value) {
	if (!value) {
		return '';
	}
	return String(value).replace(/\s+/g, ' ').trim();
}

function extractPeople(value) {
	var normalized;

	if (!value) {
		return [];
	}

	normalized = String(value)
		.replace(/\s+y\s+/g, ', ')
		.replace(/;/g, ',')
		.split(',')
		.map(function(part) {
			return normalizeText(part);
		})
		.filter(function(part) {
			return part.length > 0;
		});

	return dedupe(normalized);
}

function dedupe(values) {
	var seen = {};
	var result = [];

	values.forEach(function(value) {
		if (!seen[value]) {
			seen[value] = true;
			result.push(value);
		}
	});

	return result;
}

function placeIsESMA(place) {
	return /\besma\b/i.test(place);
}

function makeId(name, index) {
	var slug = String(name)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '')
		.slice(0, 18);

	if (!slug) {
		slug = 'persona';
	}

	return 'P' + String(index) + '_' + slug;
}

function detectStatus(row) {
	var text = normalizeText((row.accion || '') + ' ' + (row['Título'] || row.Titulo || ''));

	if (/asesinat|homicid|desapari/i.test(text)) {
		return 'grave';
	}

	if (/libera/i.test(text)) {
		return 'liberada';
	}

	return 'sin_dato';
}

function mergeStatus(current, incoming) {
	var safeCurrent = normalizeStatus(current);
	var safeIncoming = normalizeStatus(incoming);

	if (safeCurrent === 'grave' || safeIncoming === 'grave') {
		return 'grave';
	}

	if (safeCurrent === 'liberada' || safeIncoming === 'liberada') {
		return 'liberada';
	}

	return 'sin_dato';
}

function normalizeStatus(status) {
	if (status === 'grave' || status === 'liberada' || status === 'sin_dato') {
		return status;
	}
	return 'sin_dato';
}

function summarizeStatuses(characters) {
	var summary = {
		grave: 0,
		liberada: 0,
		sin_dato: 0
	};

	characters.forEach(function(character) {
		summary[normalizeStatus(character.affiliation)] += 1;
	});

	return summary;
}

function shorten(value, maxLength) {
	if (value.length <= maxLength) {
		return value;
	}
	return value.slice(0, maxLength - 3) + '...';
}
