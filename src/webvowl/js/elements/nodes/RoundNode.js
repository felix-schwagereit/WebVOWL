var BaseNode = require("./BaseNode");
var CenteringTextElement = require("../../util/CenteringTextElement");
var drawTools = require("../drawTools")();
var rectangularElementTools = require("../rectangularElementTools")();

module.exports = (function () {

	var o = function (graph) {
		BaseNode.apply(this, arguments);

		var that = this,
			collapsible = false,
			radius = 50,
			height = 30,
			width = 100,
			collapsingGroupElement,
			pinGroupElement,
			haloGroupElement = null,
			textBlock;

		this.getHalos = function () {
			return haloGroupElement;
		};

		// Properties
		this.collapsible = function (p) {
			if (!arguments.length) return collapsible;
			collapsible = p;
			return this;
		};

		this.textBlock = function (p) {
			if (!arguments.length) return textBlock;
			textBlock = p;
			return this;
		};

		/**
		 * This might not be equal to the actual radius, because the instance count is used for its calculation.
		 * @param p
		 * @returns {*}
		 */
		this.radius = function (p) {
			if (!arguments.length) return radius;
			radius = p;
			return this;
		};

		// Properties needed for UML style
		this.height = function (p) {
			if (!arguments.length) return height;
			height = p;
			return this;
		};

		this.width = function (p) {
			if (!arguments.length) return width;
			width = p;
			return this;
		};


		// Functions
		this.setHoverHighlighting = function (enable) {
			that.nodeElement().selectAll("circle").classed("hovered", enable);
		};

		this.textWidth = function (yOffset) {
			if (graph.options().styleMenu().style === 'rect') {
				return that.width();
			}

			var availableWidth = this.actualRadius() * 2;

			// if the text is not placed in the center of the circle, it can't have the full width
			if (yOffset) {
				var relativeOffset = Math.abs(yOffset) / this.actualRadius();
				var isOffsetInsideOfNode = relativeOffset <= 1;

				if (isOffsetInsideOfNode) {
					availableWidth = Math.cos(relativeOffset) * availableWidth;
				} else {
					availableWidth = 0;
				}
			}

			return availableWidth;
		};

		this.toggleFocus = function () {
			that.focused(!that.focused());
			that.nodeElement().select(graph.options().styleMenu().style).classed("focused", that.focused());
			graph.resetSearchHighlight();
			graph.options().searchMenu().clearText();

		};

		this.actualRadius = function () {
			if (!graph.options().scaleNodesByIndividuals() || that.individuals().length <= 0) {
				return that.radius();
			} else {
				// we could "listen" for radius and maxIndividualCount changes, but this is easier
				var MULTIPLIER = 8,
					additionalRadius = Math.log(that.individuals().length + 1) * MULTIPLIER + 5;

				return that.radius() + additionalRadius;
			}
		};

		this.distanceToBorder = function (dx, dy) {
			if (graph.options().styleMenu().style === 'rect') {
				return rectangularElementTools.distanceToBorder(that, dx, dy);
			}

			return that.actualRadius();
		};

		this.removeHalo = function () {
			if (that.halo()) {
				that.halo(false);
				if (haloGroupElement) {
					haloGroupElement.remove();
				}
			}
		};

		this.drawHalo = function () {
			that.halo(true);
			if (graph.options().styleMenu().style === 'rect') {
				var offset = 15;
				haloGroupElement = drawTools.drawRectHalo(that, this.width(), this.height(), offset);
			} else {
				haloGroupElement = drawTools.drawHalo(that.nodeElement(), that.actualRadius(), this.removeHalo);
			}
		};

		/**
		 * Draws the pin on a round node on a position depending on its radius.
		 */
		this.drawPin = function () {
			var dx, dy;
			that.pinned(true);

			if (graph.options().styleMenu().style === 'rect') {
				dx = (0.5 * width) - 10;
				dy = (-0.5 * height) + 5;
			} else {
				dx = (2 / 5) * that.actualRadius(),
				dy = (-7 / 10) * that.actualRadius();
			}

			pinGroupElement = drawTools.drawPin(that.nodeElement(), dx, dy, this.removePin);
		};

		/**
		 * Removes the pin and refreshs the graph to update the force layout.
		 */
		this.removePin = function () {
			that.pinned(false);
			if (pinGroupElement) {
				pinGroupElement.remove();
			}
			graph.updateStyle();
		};

		this.drawCollapsingButton = function () {

			collapsingGroupElement = that.nodeElement()
				.append("g")
				.classed("hidden-in-export", true)
				.attr("transform", function () {
					var dx = (-2 / 5) * that.actualRadius(),
						dy = (1 / 2) * that.actualRadius();
					return "translate(" + dx + "," + dy + ")";
				});

			collapsingGroupElement.append("rect")
				.classed("class pin feature", true)
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 40)
				.attr("height", 24);

			collapsingGroupElement.append("line")
				.attr("x1", 13)
				.attr("y1", 12)
				.attr("x2", 27)
				.attr("y2", 12);

			collapsingGroupElement.append("line")
				.attr("x1", 20)
				.attr("y1", 6)
				.attr("x2", 20)
				.attr("y2", 18);
		};

		/**
		 * Draws a circular node.
		 * @param parentElement the element to which this node will be appended
		 * @param [additionalCssClasses] additional css classes
		 */
		this.draw = function (parentElement, additionalCssClasses) {
			var cssClasses = that.collectCssClasses();

			that.nodeElement(parentElement);

			if (additionalCssClasses instanceof Array) {
				cssClasses = cssClasses.concat(additionalCssClasses);
			}
			drawTools.appendCircularClass(parentElement, that.actualRadius(), cssClasses, that.labelForCurrentLanguage(), that.backgroundColor());

			that.postDrawActions(parentElement);
		};

		/**
		 * Common actions that should be invoked after drawing a node.
		 */
		this.postDrawActions = function () {
			that.textBlock(createTextBlock());

			that.addMouseListeners();
			if (that.pinned()) {
				that.drawPin();
			}
			if (that.halo()) {
				that.drawHalo();
			}
			if (that.collapsible()) {
				that.drawCollapsingButton();
			}
		};

		function createTextBlock() {
			var textBlock = new CenteringTextElement(that.nodeElement(), that.backgroundColor());

			var equivalentsString = that.equivalentsString();
			var suffixForFollowingEquivalents = equivalentsString ? "," : "";

			textBlock.addText(that.labelForCurrentLanguage(), "", suffixForFollowingEquivalents, graph.options().forceFullLabels(), graph.options().labelMaxTextLineLength());
			textBlock.addEquivalents(equivalentsString);
			if (!graph.options().compactNotation()) {
				textBlock.addSubText(that.indicationString());
			}
			textBlock.addInstanceCount(that.individuals().length);

			return textBlock;
		}

		this.equivalentsString = function () {
			var equivalentClasses = that.equivalents();
			if (!equivalentClasses) {
				return;
			}

			return equivalentClasses
				.map(function (node) {
					return node.labelForCurrentLanguage();
				})
				.join(", ");
		};
	};
	o.prototype = Object.create(BaseNode.prototype);
	o.prototype.constructor = o;

	return o;
}());
