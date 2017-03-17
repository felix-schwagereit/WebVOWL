/**
 * Contains the logic for connecting the changing structure with the website.
 *
 * @param graph required for calling a refresh after a structure change
 * @returns {{}}
 */
module.exports = function (graph) {

    var structuresMenu = {},
        DEFAULT_VIEW = 'circle',
        allStructures;

    structuresMenu.structure = DEFAULT_VIEW;
    /**
     * Connects the website with graph structures.
     * @param choosedView save as structure
     */
    structuresMenu.setup = function () {
      allStructures = d3.selectAll('#structuresRadios input');

      allStructures.each(function () {
        var radio = d3.select(this);
        radio.on("click", function() { changeView(radio.attr('value')); });
      });

      d3.select('#structuresRadios input[value="'+ structuresMenu.structure +'"]').property('checked', true).on("click")();

      if (d3.selectAll('circle')[0].length > 0) {
        prepareCircles();
      } else {
        var waitForD3 = setTimeout(function() {
          prepareCircles();
          clearTimeout(waitForD3);
        }, 100);
      }
    };

    /**
     * Resets the structure (and also structureed elements) to their default.
     */
    structuresMenu.reset = function () {
      clear();

      structuresMenu.setup();
    };

    /**
     * Setup and render the current structure. It's useful for graph.update
     */
    structuresMenu.render = function() {
      structuresMenu.setup();
      render();
    };

    function changeView(choosedView) {
      if (choosedView === structuresMenu.structure) return;
      structuresMenu.structure = choosedView;

      allStructures.each(function () {
        var radio = d3.select(this);
        radio.property('checked', radio.property('value') === choosedView);
      });

      render();
      graph.update();
    }

    function clear() {
      changeView(DEFAULT_VIEW);
    }

    function render() {
      d3.selectAll('.elements-to-change').each(function () {
        var element = d3.select(this);
        var textElement = d3.select(getClosestTextElement(element));
        if (structuresMenu.structure === 'rect') {
          // change circle to rect
          element.property('outerHTML', element.property('outerHTML').replace(/circle/g, 'rect'));
          if (textElement.node()) {
            // save old 'y' value as 'data-y'
            if (!textElement.attr('data-y')) {
              textElement.attr('data-y', textElement.attr('y'));
            }
            // move text to the top of rect. like in UML structure.
            textElement.attr('y', -(parseInt(element.attr('height')) / 2) + 5 + 'px');
          }
        } else {
          if (textElement.node() && textElement.attr('data-y')) {
            // restore old 'y' value from 'data-y'
            textElement.attr('y', textElement.attr('data-y'));
          }
          // change rect into circle back again
          element.property('outerHTML', element.property('outerHTML').replace(/rect/g, 'circle'));
        }
      });
    }

    function getClosestTextElement(element) {
      var node = element.node();
      while (node && node.nodeName !== 'text') {
        node = node.nextElementSibling;
      }

      return node;
    }

    function prepareCircles() {
      d3.selectAll('circle:not(.pin):not(.symbol):not(.nofill)').each(function(){
        var circle = d3.select(this);
        var r = circle.property('r').baseVal.value;
        var textElement = getClosestTextElement(circle);
        circle.classed("elements-to-change", true);
        if (!circle.attr('height')) {
          var newHeight = textElement ? textElement.getBoundingClientRect().height + 8 : 26;
          circle.attr('height', newHeight > 40 ? newHeight : 40);
        }
        if (!circle.attr('width')) {
          circle.attr('width', r * 2);
        }
        if (!circle.attr('x')) {
          circle.attr('x', -(parseInt(circle.attr('width')) / 2));
        }
        if (!circle.attr('y')) {
          circle.attr('y',  -(parseInt(circle.attr('height')) / 2));
        }
      });
    }

    return structuresMenu;
};
