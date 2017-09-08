var render = (function (render)	{
	'use strict';
	/*
		SVG 를 만들어주는 함수.
	 */
	render.createSVG = function (id, width, height)	{
		var id = id.indexOf('#') < 0 ? '#' + id : id,
				dom = document.querySelector(id);

		return d3.select(id)
					.append('svg')
					.attr('id', id.replace('#', '') + '_chart')
					.attr('width', (
						width || parseFloat(dom.style.width)) + 1)
					.attr('height', (
						height || parseFloat(dom.style.height)));
	};
	/*
		SVG 태그에 그룹을 추가해주는 함수.
	 */
	render.addGroup = function (svg, top, left, cls)	{
		svg = util.d3v4() ? svg : svg[0][0];
		svg = util.varType(svg) === 'Array' || 
					util.varType(svg) === 'Object' ? svg : d3.select(svg);

		var exist = d3.selectAll(
			'.' + svg.attr('id') + '.' + cls + '-g-tag');
		
		return exist.node() ? exist : 
						svg.append('g')
					 .attr('class', svg.attr('id') + ' ' + cls + '-g-tag')
					 .attr('transform', 
								 'translate(' + left + ', ' + top + ')');			
	};
	/*
		Attribute 를 SVG 에 등록시켜주는 함수.
	 */
	function setAttributes (svgElement, attrs)	{
		if (!attrs) { return false; }

		for (var attr in attrs)	{
			svgElement.attr(attr, attrs[attr]);
		}
	};
	/*
		Style 을 SVG 에 등록시켜주는 함수.
	 */
	function setStyles (svgElement, styles)	{
		if (!styles) { return false; }

		for (var style in styles)	{
			svgElement.style(style, styles[style]);
		}
	};
	/*
		Event 를 SVG 에 등록시켜주는 함수.
	 */
	function setOnEvents (svgElement, events)	{
		if (!events) { return false; }

		for (var event in events)	{
			svgElement.on(event, events[event]);
		}
	};
	/*
		Drag 를 SVG 에 등록시켜주는 함수.
	 */
	function setOnDrag (svgElement, drags)	{
		if (!drags) { return false; }

		var dg = util.d3v4() ? 
				d3.drag() : d3.behavior.drag().origin(Object);

		for (var drag in drags)	{
			var nm = util.d3v4() ? drag : 
					drag !== 'drag' ? 'drag' + drag : drag;

			dg.on(nm, drags[drag]);
		}

		svgElement.call(dg);
	};
	/*
		Text 를 등록시켜주는 함수.
	 */
	function setText (svgElement, text)	{
		svgElement.text(text);
	};
	/*
		Rectangle, Text, Circle, ... 등에 
		Attribute, Style, Event 등을 등록시켜주는 함수.
	 */
	function defsShape (target)	{
		if (!this.element)	{
			throw new Error ('Not defined SVG Element');
		}
		
		var t = !this.data ? 
						 this.element.append(target) : 
						 this.element.data(this.data)
						 		 .enter().append(target);

		this.text ? setText(t, this.text) : false;

		setAttributes(t, this.attr);
		setStyles(t, this.style);
		setOnEvents(t, this.on);
		setOnDrag(t, this.call);

		return t;
	}
	/*
		Draw rectangle.
	 */
	render.rect = function (defs)	{
		return defsShape.call(defs, 'rect');
	};
	/*
		Draw Circle.
	 */
	render.circle = function (defs)	{
		return defsShape.call(defs, 'circle');
	};
	/*
		Draw Text.
	 */
	render.text = function (defs)	{
		return defsShape.call(defs, 'text');
	};
	/*
		Draw Line.
	 */
	render.line = function (defs)	{
		// Path 는 기존 도형들과 삽입 방식이 달라서
		// 별도의 코드로 작성하였다.
		var t = defs.element.append('path');
		
		setAttributes(t, defs.attr);
		setStyles(t, defs.style);

		return t;
	};
	/*
		Draw Triangle.
	 */
	render.triangle = function (defs)	{
		return defsShape.call(defs, 'polygon');
	};
	/*
		Draw Star.
	 */
	render.star = function (defs)	{
		var s = (util.d3v4() ? d3.symbol() : d3.svg.symbol())
						.type((util.d3v4() ? d3.symbolStar : 'star')),
				t = defs.element
						.append('path')
						.attr('d', s.size(defs.size));

		setStyles(t, defs.style);
		setOnEvents(t, defs.on);

		return t;
	};

	return render;
}(render || {}));