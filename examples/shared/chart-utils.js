function getAvailableChartWidth(containerSelector, minWidth, horizontalPadding) {
	var container = d3.select(containerSelector).node();
	var viewportWidth = document.documentElement.clientWidth || window.innerWidth || 0;
	var containerWidth = container ? container.getBoundingClientRect().width : viewportWidth;
	var padding = horizontalPadding || 0;
	var available = Math.floor((containerWidth || viewportWidth || 0) - padding);

	return Math.max(minWidth || 320, available);
}

function bindResponsiveRedraw(namespace, redraw) {
	d3.select(window).on('resize.' + namespace, function() {
		redraw();
	});
}