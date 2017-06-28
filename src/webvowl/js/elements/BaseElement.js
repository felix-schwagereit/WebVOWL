/**
 * The base element for all visual elements of webvowl.
 */
var _ = require("lodash");
module.exports = (function () {

	var Base = function (graph) {
		// Basic attributes
		var equivalents = [],
			id,
			label,
			type,
			iri,
			baseIri,
		// Additional attributes
			annotations,
			attributes = [],
			backgroundColor,
			comment,
			description,
			equivalentBase,
			visualAttributes = [],
			tags,
			contentStyles,
		// Style attributes
			focused = false,
			indications = [],
			mouseEntered = false,
			styleClass,
			visible = true,
		// Other
			languageTools = require("../util/languageTools")();


		// Properties
		this.attributes = function (p) {
			if (!arguments.length) return attributes;
			attributes = p;
			return this;
		};

		this.annotations = function (p) {
			if (!arguments.length) return annotations;
			annotations = p;
			return this;
		};

		this.backgroundColor = function (p) {
			if (!arguments.length) return backgroundColor;
			backgroundColor = p;
			return this;
		};

		this.baseIri = function (p) {
			if (!arguments.length) return baseIri;
			baseIri = p;
			return this;
		};

		this.comment = function (p) {
			if (!arguments.length) return comment;
			comment = p;
			return this;
		};

		this.description = function (p) {
			if (!arguments.length) return description;
			description = p;
			return this;
		};

		this.equivalents = function (p) {
			if (!arguments.length) return equivalents;
			equivalents = p || [];
			return this;
		};

		this.equivalentBase = function (p) {
			if (!arguments.length) return equivalentBase;
			equivalentBase = p;
			return this;
		};

		this.focused = function (p) {
			if (!arguments.length) return focused;
			focused = p;
			return this;
		};

		this.id = function (p) {
			if (!arguments.length) return id;
			id = p;
			return this;
		};

		this.indications = function (p) {
			if (!arguments.length) return indications;
			indications = p;
			return this;
		};

		this.iri = function (p) {
			if (!arguments.length) return iri;
			iri = p;
			return this;
		};

		this.label = function (p) {
			if (!arguments.length) return label;
			label = p;
			findContentStyles(this, label);
			return this;
		};

		this.mouseEntered = function (p) {
			if (!arguments.length) return mouseEntered;
			mouseEntered = p;
			return this;
		};

		this.styleClass = function (p) {
			if (!arguments.length) return styleClass;
			styleClass = p;
			return this;
		};

		this.contentStyles = function (p) {
			if (!arguments.length) return contentStyles;
			contentStyles = p;
			return this;
		};

		this.type = function (p) {
			if (!arguments.length) return type;
			type = p;
			return this;
		};

		this.visible = function (p) {
			if (!arguments.length) return visible;
			visible = p;
			return this;
		};

		this.visualAttributes = function (p) {
			if (!arguments.length) return visualAttributes;
			visualAttributes = p;
			return this;
		};

		this.tags = function (p) {
			if (!arguments.length) return tags;
			tags = p;
			return this;
		};

		this.commentForCurrentLanguage = function () {
			return languageTools.textInLanguage(this.comment(), graph.language());
		};

		/**
		 * @returns {string} the css class of this node..
		 */
		this.cssClassOfNode = function () {
			return "node" + this.id();
		};

		this.descriptionForCurrentLanguage = function () {
			return languageTools.textInLanguage(this.description(), graph.language());
		};

		this.defaultLabel = function () {
			return languageTools.textInLanguage(this.label(), "default");
		};

		this.indicationString = function () {
			return this.indications().join(", ");
		};

		this.labelForCurrentLanguage = function () {
			var preferredLanguage = graph && graph.language ? graph.language() : null;
			return languageTools.textInLanguage(this.label(), preferredLanguage);
		};
	};

	Base.prototype.constructor = Base;

	Base.prototype.equals = function (other) {
		return other instanceof Base && this.id() === other.id();
	};

	Base.prototype.toString = function () {
		return this.labelForCurrentLanguage() + " (" + this.type() + ")";
	};

	function findContentStyles(that, label) {
		if (_.isObject(label)) {
			_.forIn(label, function(value) {
				if (_.isObject(value)) {
					that.label(value.text);
					that.contentStyles(value.style);
				}
			});
		}
	}

	return Base;
}());
