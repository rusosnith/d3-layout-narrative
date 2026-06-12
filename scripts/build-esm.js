'use strict';

// Build script: transforms the already-assembled narrative.js into a
// self-contained ES module with no runtime D3 dependency.
//
// Run after `npm run build:legacy` (or any step that produces narrative.js).

var fs   = require('fs');
var path = require('path');

var root    = path.join(__dirname, '..');
var srcFile = path.join(root, 'narrative.js');
var outFile = path.join(root, 'narrative.esm.js');

if (!fs.existsSync(srcFile)) {
	console.error('narrative.js not found — run `npm run build:legacy` first.');
	process.exit(1);
}

var src = fs.readFileSync(srcFile, 'utf8');

// ---------------------------------------------------------------------------
// Tiny inline replacements for the three d3 helpers used inside the layout.
// This removes the runtime dependency on d3 entirely.
// ---------------------------------------------------------------------------
var helpers = [
	'// Inline replacements for the three D3 helpers used by this module.',
	'// This makes the module self-contained with zero D3 runtime dependency.',
	'function _interpolateNumber(a, b) {',
	'	return function(t) { return a + (b - a) * t; };',
	'}',
	'',
	'function _arrayMin(arr, fn) {',
	'	var m = Infinity, v, i;',
	'	for (i = 0; i < arr.length; i++) {',
	'		v = fn ? fn(arr[i]) : arr[i];',
	'		if (v < m) m = v;',
	'	}',
	'	return m;',
	'}',
	'',
	'function _arrayMax(arr, fn) {',
	'	var m = -Infinity, v, i;',
	'	for (i = 0; i < arr.length; i++) {',
	'		v = fn ? fn(arr[i]) : arr[i];',
	'		if (v > m) m = v;',
	'	}',
	'	return m;',
	'}',
	''
].join('\n');

// ---------------------------------------------------------------------------
// Transform the assembled source:
//   1. Replace the global namespace assignment with a named export.
//   2. Swap out d3.interpolateNumber / d3.min / d3.max for local helpers.
//   3. Remove the trailing semicolon that closes the old IIFE-style assignment.
// ---------------------------------------------------------------------------
var esm = src
	.replace('d3.layout.narrative = function(){', 'export function narrative() {')
	.replace(/d3\.interpolateNumber\(/g, '_interpolateNumber(')
	.replace(/d3\.min\(/g, '_arrayMin(')
	.replace(/d3\.max\(/g, '_arrayMax(')
	// The file ends with `};` — drop the semicolon so it's a valid function declaration.
	.replace(/\};\s*$/, '}');

fs.writeFileSync(outFile, helpers + esm, 'utf8');

var lines = (helpers + esm).split('\n').length;
console.log('narrative.esm.js built — ' + lines + ' lines, zero D3 runtime dependency.');
