function circle ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		that = that || {};

		bio.rendering().circle({
			element: opts.element,
			data: opts.data || null,
			attr: !opts.attr ? null : {
				id: function (d, i) { 
					return (opts.id || that.id || 
									opts.element.attr('id')) + '_circle';
				},
				cx: function (d, i)	{
					return opts.attr.cx ? 
					typeof(opts.attr.cx) !== 'function' ?  
								 opts.attr.cx : 
								 opts.attr.cx.call(this, d, i, that) : 0;
				},
				cy: function (d, i)	{
					return opts.attr.cy ? 
					typeof(opts.attr.cy) !== 'function' ?  
								 opts.attr.cy : 
								 opts.attr.cy.call(this, d, i, that) : 0;
				},
				r: function (d, i)	{
					return opts.attr.r ? 
					typeof(opts.attr.r) !== 'function' ?  
								 opts.attr.r : 
								 opts.attr.r.call(this, d, i, that) : 0;
				},
			},
			style: !opts.style ? null : {
				'fill': function (d, i) { 
					return opts.style.fill ? 
					typeof(opts.style.fill) !== 'function' ?  
								 opts.style.fill : opts.style.fill.call(
								 	this, d, i, that) : '#000000'; 
				},
				'fill-opacity': function (d, i)	{
					return opts.style.fillOpacity ? 
					typeof(opts.style.fillOpacity) !== 'function' ?  
								 opts.style.fillOpacity : 
								 opts.style.fillOpacity.call(
								 	this, d, i, that) : 1; 
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
		});
	};
};