function rendering ()	{
	'use strict';

	var model = {};
	/*
		SVG 태그를 만들어 삽입해주는 함수.
	 */
	model.createSVG = function (element, width, height)	{
		var dom = bio.dom().get(element),
				classify = dom.id ? '#' + dom.id : 
						 '.' + dom.className,
				w = width || parseFloat(dom.style.width),
				h = height || parseFloat(dom.style.height);

		return d3.select(classify).append('svg')
						 .attr('id', dom.id + '_svg')
						 .attr('width', w)
						 .attr('height', h);
	};
	/*
		SVG 에 group 태그를 추가하는 함수.
	 */
	model.addGroup = function (svg, top, left, classify)	{
		svg = bio.dependencies.version.d3v4() ? svg : svg[0][0];
		svg = bio.objects.getType(svg) === 'Array' || 
					bio.objects.getType(svg) === 'Object' ? 
					svg : d3.select(svg);

		classify = classify || '';

		var id = svg.attr('id'),
				isExist = d3.selectAll('.' + id + 
															 '.' + classify + '-g-tag');
		
		return (isExist.node() ? isExist : svg).append('g')
			 		.attr('class', id + ' ' + classify + '-g-tag')
			 		.attr('transform', 
			 			'translate(' + left + ', ' + top + ')');
	};
	/*
		Attribute 를 적용한다.
	 */
	function setAttributes (shape, attrs)	{
		if (!attrs) { return false; }

		bio.iteration.loop(attrs, function (name, value)	{
			shape.attr(name, value);
		});
	};
	/*
		Style 을 적용한다.
	 */
	function setStyles (shape, styles)	{
		if (!styles) { return false; }

		bio.iteration.loop(styles, function (name, value)	{
			shape.style(name, value);
		});
	};
	/*
		Event 를 적용한다.
	 */
	function setEvents (shape, events)	{
		if (!events) { return false; }

		bio.iteration.loop(events, function (name, value)	{
			shape.on(name, value);
		});
	};
	/*
		Drag 를 적용한다.
	 */
	function setDrag (shape, drags)	{
		if (!drags) { return false; }

		var drag = bio.dependencies.version.d3v4() ? 
				d3.drag() : d3.behavior.drag().origin(Object);

		bio.iteration.loop(drags, function (name, value)	{
			name = bio.dependencies.version.d3v4() ? 
						 name : name !== 'drag' ? 'drag' + name : name;

			drag.on(name, value);
		});

		shape.call(drag);
	};
	/*
		Text 를 적용한다.
	 */
	function setText (shape, text)	{
		shape.text(text);
	};
	/*
		Attribute, Style, Event 등을 등록해주는 함수.
	 */
	function defineShapeConfig (shape)	{
		if (!this.element)	{
			throw new Error ('Not defined SVG Element');
		}

		var s = !this.data ? this.element.append(shape) : 
						 this.element.data(this.data).enter().append(shape);

		this.text ? setText(s, this.text) : false;

		setAttributes(s, this.attr);
		setStyles(s, this.style);
		setEvents(s, this.on);
		setDrag(s, this.call);

		return s;
	};
	/*
		Rectangle 함수.
	 */
	model.rect = function (configs)	{
		return defineShapeConfig.call(configs, 'rect');
	};
	/*
		Circle 함수.
	 */
	model.circle = function (configs)	{
		return defineShapeConfig.call(configs, 'circle');
	};
	/*
		Triangle 함수.
	 */
	model.triangle = function (configs)	{
		return defineShapeConfig.call(configs, 'polygon');
	};
	/*
		Triangle 을 만드는데 필요한 문자열을 생성해주는 함수.
	 */
	model.triangleStr = function (x, y, len, direction)	{
		var sign = direction === 'left' || 
							 direction === 'bottom' ? -1 : 1,
				x1, y1, x2, y2;

		if (direction === 'left' || direction === 'right')	{
			x1 = (len * sign);
			y1 = (len / 2 * -1);
			x2 = x1;
			y2 = len / 2;
		} else {
			x1 = (len / 2 * -1);
			y1 = (len * sign);
			x2 = len / 2;
			y2 = y1;
		}

		return x + ',' + y + 
		' ' + (x + x1) + ',' + (y + y1) + 
		' ' + (x + x2) + ',' + (y + y2) + 
		 ' ' + x + ',' + y;
	};
	/*
		Text 함수.
	 */
	model.text = function (configs)	{
		return defineShapeConfig.call(configs, 'text');
	};
	/*
		Line 함수.
	 */
	model.line = function (configs)	{
		var path = configs.element.append('path');

		setAttributes(path, configs.attr);
		setStyles(path, configs.style);

		return path;
	};
	/*
		CSS3 의 box-shadow 기능을 사용하기 위해 svg 에서 제공되는
		drop shadow filter 를 사용한다.
	 */
	model.dropShadow = function (svg, std, dx, dy)	{
		var defs = svg.append('defs'),
				filter = defs.append('filter')
										 .attr('id', 'drop_shadow');

		filter.append('feGaussianBlur')
					.attr('in', 'SourceAlpha')
					.attr('stdDeviation', std || 3)
					.attr('result', 'blur');

		filter.append('feOffset')
					.attr('in', 'blur')
					.attr('dx', dx || 2)
					.attr('dy', dy || 2)
					.attr('result', 'offsetBlur');

		var feMerge = filter.append('feMerge');

		feMerge.append('feMergeNode')
					 .attr('in', 'offsetBlur');
		feMerge.append('feMergeNode')
					 .attr('in', 'SourceGraphic');
	};
	/*
		Network, Tree 의 path 에 사용될 Arrow 를 그려주는 함수.
	 */
	model.marker = function (opts)	{
		opts.svg.selectAll('marker')
	     	.data(opts.data || [''])      
	  	 	.enter().append('svg:marker')
	     	.attr('id', function (d)	{
	     		return opts.id ? 'marker_' + d[opts.id] : 'marker';
	     	})
	     	.attr('viewBox', '0 -5 10 10')
	     	.attr('refX', 5)
	     	.attr('refY', 0)
	     	.attr('markerWidth', opts.width || 5)
	     	.attr('markerHeight', opts.height || 5)
	     	.attr('orient', 'auto')
	     	.append('svg:path')
	     	.attr('d', 'M0,-5L10,0L0,5')
	     	.attr('fill', function (d)	{
	     		return opts.color ? d[opts.color] : '#333333'; 
	     	});
	};
	/*
		파라미터 색상의 num 만큼의 opacity 가 적용된 색상을 반환한다.
	 */
	model.opacity = function (color, num)	{
		var rgba = d3.rgb(color);
				rgba.opacity = num || 0.3;

		return rgba;
	};
	/*
		D3V4 에서는 d3.transform 함수가 제거되었다.
		그러므로 아래와 같이 코드를 사용하여 구현하였다.
	 */
	model.translation = function (transform)	{
		var g = document.createElementNS(
						'http://www.w3.org/2000/svg', 'g');

		g.setAttributeNS(null, 'transform', transform);

		var matrix = g.transform.baseVal.consolidate().matrix;
		
		return {
			scale: [matrix.a, matrix.d],
			translate: [matrix.e, matrix.f],
			rotate: matrix.b,
			skew: matrix.c,
		};
	};

	return function ()	{
		return model;
	};
};