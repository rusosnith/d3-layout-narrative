var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');

var rootDir = __dirname;
var port = parseInt(process.env.PORT, 10) || 8080;
var mimeTypes = {
	'.csv': 'text/csv; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain; charset=utf-8',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2'
};

function send(response, statusCode, body, headers) {
	response.writeHead(statusCode, headers);
	response.end(body);
}

function resolvePath(requestUrl) {
	var parsedUrl = url.parse(requestUrl);
	var requestPath = decodeURIComponent(parsedUrl.pathname);
	var safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
	var filePath = path.join(rootDir, safePath);

	if (filePath.indexOf(rootDir) !== 0) {
		return null;
	}

	return filePath;
}

function serveFile(filePath, response) {
	fs.stat(filePath, function(error, stats) {
		var candidatePath = filePath;

		if (error) {
			send(response, 404, 'Not found\n', {'Content-Type': 'text/plain; charset=utf-8'});
			return;
		}

		if (stats.isDirectory()) {
			candidatePath = path.join(candidatePath, 'index.html');
		}

		fs.readFile(candidatePath, function(readError, buffer) {
			var extension;

			if (readError) {
				send(response, 404, 'Not found\n', {'Content-Type': 'text/plain; charset=utf-8'});
				return;
			}

			extension = path.extname(candidatePath).toLowerCase();
			send(response, 200, buffer, {
				'Content-Type': mimeTypes[extension] || 'application/octet-stream',
				'Cache-Control': 'no-cache'
			});
		});
	});
}

http.createServer(function(request, response) {
	var filePath = resolvePath(request.url === '/' ? '/index.html' : request.url);

	if (!filePath) {
		send(response, 400, 'Bad request\n', {'Content-Type': 'text/plain; charset=utf-8'});
		return;
	}

	serveFile(filePath, response);
}).listen(port, function() {
	console.log('Server running at http://localhost:' + port);
});