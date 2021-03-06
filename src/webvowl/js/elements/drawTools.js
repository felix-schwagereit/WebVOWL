/**
 * Contains reusable function for drawing nodes.
 */
module.exports = (function () {

	var tools = {};

	// method to draw hexagon from the points (hexagonData).
	var drawHexagon = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })
		.interpolate("cardinal-closed")
		.tension("0.2");

	/**
	 * Append a circular class node with the passed attributes.
	 * @param parent the parent element to which the circle will be appended
	 * @param radius
	 * @param [cssClasses] an array of additional css classes
	 * @param [tooltip]
	 * @param [backgroundColor]
	 * @returns {*}
	 */
	tools.appendCircularClass = function (parent, radius, cssClasses, tooltip, backgroundColor) {
		var circle = parent.append("circle")
			.classed("class", true)
			.attr("r", radius);

		addCssClasses(circle, cssClasses);
		addToolTip(circle, tooltip);
		addBackgroundColor(circle, backgroundColor);

		return circle;
	};

	function addCssClasses(element, cssClasses) {
		if (cssClasses instanceof Array) {
			cssClasses.forEach(function (cssClass) {
				element.classed(cssClass, true);
			});
		}
	}

	function addToolTip(element, tooltip) {
		if (tooltip) {
			element.append("title").text(tooltip);
		}
	}

	function addBackgroundColor(element, backgroundColor) {
		if (backgroundColor) {
			element.style("fill", backgroundColor);
		}
	}

	/**
	 * Appends a rectangular class node with the passed attributes.
	 * @param parent the parent element to which the rectangle will be appended
	 * @param width
	 * @param height
	 * @param [cssClasses] an array of additional css classes
	 * @param [tooltip]
	 * @param [backgroundColor]
	 * @returns {*}
	 */
	tools.appendRectangularClass = function (parent, width, height, cssClasses, tooltip, backgroundColor) {
		var rectangle = parent.append("rect")
			.classed("class", true)
			.attr("x", -width / 2)
			.attr("y", -height / 2)
			.attr("width", width)
			.attr("height", height);

		addCssClasses(rectangle, cssClasses);
		addToolTip(rectangle, tooltip);
		addBackgroundColor(rectangle, backgroundColor);

		return rectangle;
	};

	/**
	 * Appends a hexagon class node with the passed attributes.
	 * @param parent the parent element to which the rectangle will be appended
	 * @param width
	 * @param height
	 * @param [cssClasses] an array of additional css classes
	 * @param [tooltip]
	 * @param [backgroundColor]
	 * @returns {*}
	 */
	tools.appendHexagonClass = function (parent, radius, height, hexagonData, cssClasses, tooltip, backgroundColor) {
		var hexagon = parent.append("path")
			.classed("hexagon", true)
			.classed("class", true)
			.attr("d", drawHexagon(hexagonData));

		addCssClasses(hexagon, cssClasses);
		addToolTip(hexagon, tooltip);
		addBackgroundColor(hexagon, backgroundColor);

		return hexagon;
	};

	tools.drawPin = function(container, dx, dy, onClick) {
		var pinR = 7;
		var pinGroupElement = container
			.append("g")
			.classed("hidden-in-export", true)
			.attr("transform", "translate(" + dx + "," + dy + ")");

		pinGroupElement.append("circle")
			.classed("class pin feature", true)
			.attr("r", pinR)
			.on("click", function () {
				if (onClick) {
					onClick();
				}
				d3.event.stopPropagation();
			});

		pinGroupElement.append("line")
			.attr("x1", 0)
			.attr("x2", 0)
			.attr("y1", pinR)
			.attr("y2", pinR + 4);

		return pinGroupElement;
	};

	tools.drawRectHalo = function (node, width, height, offset) {
		var container;
		if (node.nodeElement)
			container=node.nodeElement();
		else
		  container=node.labelElement();

		if (!container){
			console.log("no container found");
			return;
		}

		var haloGroupElement = container
			.append("g")
			.classed("hidden-in-export", true);

		if (node.inverse && node.inverse()){
			var addHeight=node.inverse().height();
			haloGroupElement.append("rect")
				.classed("searchResultA", true)
				.attr("x", (-width - offset) / 2)
				.attr("y", (-offset - height) / 2)
				.attr("width", width + offset)
				.attr("height", height+ addHeight + offset);
		}
		else {
			haloGroupElement.append("rect")
				.classed("searchResultA", true)
				.attr("x", (-width - offset) / 2)
				.attr("y", (-offset - height) / 2)
				.attr("width", width + offset)
				.attr("height", height + offset);
		}
		return haloGroupElement;

	};
	tools.drawHalo = function (container, radius) {
		if (container===undefined){
			return null;
			// there is no element to add the halo to;
			// this means the node was not rendered previously
		}

		var haloGroupElement = container
			.append("g")
			.classed("hidden-in-export", true);

		haloGroupElement.append("circle",":first-child")
			.classed("searchResultA", true)
			.attr("r", radius + 15);
		return haloGroupElement;
	};

	return function () {
		// Encapsulate into function to maintain default.module.path()
		return tools;
	};
})();
