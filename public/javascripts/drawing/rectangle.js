function rectangle ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		that = that || {};

		return bio.rendering().rect({
			element: opts.element,
			data: opts.data || null,
			attr: !opts.attr ? null : {
				id: function (d, i) {
					return opts.attr.id ? 
					typeof(opts.attr.id) !== 'function' ?  
								(opts.id || that.id || 
								 opts.element.attr('id')) + 
									'_rect' : 
								 opts.attr.id.call(this, d, i, that) : 0;
				},
				x: function (d, i)	{
					return opts.attr.x ? 
					typeof(opts.attr.x) !== 'function' ?  
								 opts.attr.x : 
								 opts.attr.x.call(this, d, i, that) : 0;
				},
				y: function (d, i)	{
					return opts.attr.y ? 
					typeof(opts.attr.y) !== 'function' ?  
								 opts.attr.y : 
								 opts.attr.y.call(this, d, i, that) : 0;
				},
				rx: function (d, i)	{
					return opts.attr.rx ? 
					typeof(opts.attr.rx) !== 'function' ?  
								 opts.attr.rx : 
								 opts.attr.rx.call(this, d, i, that) : 0;
				},
				ry: function (d, i)	{
					return opts.attr.ry ? 
					typeof(opts.attr.ry) !== 'function' ?  
								 opts.attr.ry : 
								 opts.attr.ry.call(this, d, i, that) : 0;
				},
				width: function (d, i)	{
					return opts.attr.width ? 
					typeof(opts.attr.width) !== 'function' ?  
								 opts.attr.width : 
								 opts.attr.width.call(this, d, i, that) < 0 ? 
								 Math.abs(opts.attr.width.call(this, d, i, that)) : 
								 opts.attr.width.call(this, d, i, that) : 1;
				},
				height: function (d, i)	{
					return opts.attr.height ? 
					typeof(opts.attr.height) !== 'function' ?  
								 opts.attr.height : 
								 opts.attr.height.call(this, d, i, that) < 0 ? 
								 Math.abs(opts.attr.height.call(this, d, i, that)) : 
								 opts.attr.height.call(this, d, i, that) : 1;
				},
			},
			style: !opts.style ? null : {
				'fill': function (d, i) { 
					return opts.style.fill ? 
					typeof(opts.style.fill) !== 'function' ?  
								 opts.style.fill : opts.style.fill.call(
								 	this, d, i, that) : '#000000'; 
				},
				'fill-opacity': function (d, i) { 
					return opts.style.fillOpacity ? 
					typeof(opts.style.fillOpacity) !== 'function' ?  
								 opts.style.fillOpacity : 
								 opts.style.fillOpacity.call(
								 	this, d, i, that) : 'none'; 
				},
				'stroke': function (d, i) { 
					return opts.style.stroke ? 
					typeof(opts.style.stroke) !== 'function' ?  
								 opts.style.stroke : 
								 opts.style.stroke.call(
								 	this, d, i, that) : 'none'; 
				},
				'stroke-width': function (d, i) { 
					return opts.style.strokeWidth ?
					typeof(opts.style.strokeWidth) !== 'function' ?  
								 opts.style.strokeWidth : 
								 opts.style.strokeWidth.call(
								 	this, d, i, that) : '0px'; 
				},
				'filter': function (d, i)	{
					return opts.style.filter ?
					typeof(opts.style.filter) !== 'function' ?  
								 opts.style.filter : 
								 opts.style.filter.call(
								 	this, d, i, that) : false; 
				},
				'cursor': function (d, i)	{
					return opts.style.cursor ?
					typeof(opts.style.cursor) !== 'function' ?  
								 opts.style.cursor : 
								 opts.style.cursor.call(
								 	this, d, i, that) : false; 
				},
			},
			on: !opts.on ? null : {
				click: function (d, i)	{
					opts.on.click ? 
					opts.on.click.call(this, d, i, that) : false;
				},
				mouseover: function (d, i)	{
					opts.on.mouseover ? 
					opts.on.mouseover.call(this, d, i, that) : false;
				},
				mouseout: function (d, i)	{
					opts.on.mouseout ? 
					opts.on.mouseout.call(this, d, i, that) : false;
				},
			},
			call: !opts.call ? null : {
				start: function (d, i)	{
					opts.call.start ? 
					opts.call.start.call(this, d, i, that) : false;
				},
				drag: function (d, i)	{
					opts.call.drag ? 
					opts.call.drag.call(this, d, i, that) : false;
				},
				end: function (d, i)	{
					opts.call.end ? 
					opts.call.end.call(this, d, i, that) : false;
				},
			},
		});
	};
};