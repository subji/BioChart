function text ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		that = that || {};

		bio.rendering().text({
			element: opts.element,
			data: opts.data || null,
			attr: !opts.attr ? null : {
				id: function (d) { 
					return opts.attr.id ? 
					typeof(opts.attr.id) !== 'function' ?  
								(opts.id || that.id || 
								 opts.element.attr('id')) + 
									'_text' : 
								 opts.attr.id.call(this, d, i, that) : (opts.id || that.id || 
								 opts.element.attr('id')) + 
									'_text';
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
				// title: function (d, i)	{
				// 	return opts.attr.title ? 
				// 	typeof(opts.attr.title) !== 'function' ?  
				// 				 opts.attr.title : 
				// 				 opts.attr.title.call(this, d, i, that) : 0;
				// },
			},
			style: !opts.style ? null : {
				'fill': function (d, i)	{
					return opts.style.fill ?
					typeof(opts.style.fill) !== 'function' ?  
								 opts.style.fill : 
								 opts.style.fill.call(
								 	this, d, i, that) : '#000000';
				},
				'font-size': function (d, i)	{
					return opts.style.fontSize ? 
					typeof(opts.style.fontSize) !== 'function' ?  
								 opts.style.fontSize : 
								 opts.style.fontSize.call(
								 	this, d, i, that) : '10px';
				},
				'font-family': function (d, i) { 
					return opts.style.fontFamily ? 
					typeof(opts.style.fontFamily) !== 'function' ?  
								 opts.style.fontFamily : 
								 opts.style.fontFamily.call(
								 	this, d, i, that) : 'Arial'; 
				},
				'font-weight': function (d, i) {
					return opts.style.fontWeight ? 
					typeof(opts.style.fontWeight) !== 'function' ?  
								 opts.style.fontWeight : 
								 opts.style.fontWeight.call(
								 	this, d, i, that) : 'normal';
				},
				'alignment-baseline': function (d, i)	{
					return opts.style.alignmentBaseline ? 
					typeof(opts.style.alignmentBaseline) !== 'function' ?  
								 opts.style.alignmentBaseline : 
								 opts.style.alignmentBaseline.call(
								 	this, d, i, that) : 'middle';
				},
				'cursor': function (d, i)	{
					return opts.style.cursor ?
					typeof(opts.style.cursor) !== 'function' ?  
								 opts.style.cursor : 
								 opts.style.cursor.call(
								 	this, d, i, that) : false; 
				},
				'stroke': function (d, i)	{
					return opts.style.stroke ?
					typeof(opts.style.stroke) !== 'function' ?  
								 opts.style.stroke : 
								 opts.style.stroke.call(
								 	this, d, i, that) : false; 
				},
				'stroke-width': function (d, i)	{
					return opts.style.strokeWidth ?
					typeof(opts.style.strokeWidth) !== 'function' ?  
								 opts.style.strokeWidth : 
								 opts.style.strokeWidth.call(
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
			text: function (d, i)	{ 
				return opts.text ? typeof(opts.text) !== 'function' ?  
							 opts.text : opts.text.call(this, d, i, that) : '';
			},
		});
	};
};