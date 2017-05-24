'use strict';

var axis = (function (axis)	{
	var model = {};
	/** 
	 This functino is set context of canvas or return context of canvas.
	 */
	axis.context = function (ctx)	{
		return model.ctx = ctx, arguments.length ? axis : model.ctx;
	};
	/**
	 Draw base line of each axises.
	 */
	function base ()	{
		render
		.context(model.ctx)
		.line({
			left: this.position[0],
			top: this.position[1],
			edge: [
				this.direction === 'vertical' ? 
						this.position[0] : this.position[0] + this.position[2],
				this.direction === 'vertical' ? 
						this.position[1] + this.position[2] : this.position[1]
			],
		});
	};
	/**
	 It is a function that circulates data stored in todomain and returns each data to draw a tick.
	 */
	function tickLoop (callback)	{
		for (var i = 0; i < this.len; i++)	{
			callback.call(this, this.toDomain[i]);
		}
	};
	/**
	 To draw tick each axis.
	 */
	function ticks ()	{
		var rd = render.context(model.ctx),
				sign = this.location === 'bottom' || this.location === 'right' ? 1 : -1;

		this.tickSize = this.tickSize * sign;

		tickLoop.call(this, function (d)	{
			rd.line({
				top: this.direction === 'vertical' ? this.scale(d) : this.position[1],
				left: this.direction === 'vertical' ? this.position[0] : this.scale(d),
				edge: [
					this.direction === 'vertical' ? this.position[0] + this.tickSize : this.scale(d),
					this.direction === 'vertical' ? this.scale(d) : this.position[1] + this.tickSize
				],
			});
		});
	};

	function textLocation (value)	{
		var obj = { top: 0, left: 0 },
				bd = scale.getDistance(this.scale, this.toDomain),
				tw = draw.getTextWidth(this.font || '5px', value);

		switch(this.location)	{
			case 'top': 
				obj.top = this.position[1] - (this.tickSize + 2); 
				obj.left = this.scale(value) - (tw / 2); break;
			case 'left': 
				obj.top = this.scale(value) + bd / 2; 
				obj.left = this.position[0] - (tw + this.tickSize + 2); break;
			case 'bottom': 
				obj.top = this.position[1] + (this.tickSize + 2); 
				obj.left = this.scale(value) - (tw / 2); break;
			case 'right': 
				obj.top = this.scale(value) + bd / 2; 
				obj.left = this.position[0] + (this.tickSize + 2); break;
			default: break;
		}

		return obj;
	};

	function text ()	{
		console.log(this, this.toDomain)
		var rd = render.context(model.ctx);

		for (var i = 0, l = this.toDomain.length; i < l; i++)	{
			var td = this.toDomain[i],
					obj = textLocation.call(this, td);

			obj.text = td;
			obj.textBaseline = 'middle';

			rd.text(obj);
		}
	};
	/** 
	 Draw base axis.
	 {
	 	 scale: scale function of d3js,
	 	 location: top / bottom / left / right,
	   position: [left, top, height / width],
	   base: true / false (default: true),
	   ticks: true / false (default: true),
	   tickSize: Number,
	   text: true / false (default: true),
	 }
	 */
	function isDrawing (opts)	{
		if (opts.base) { base.call(opts, null); }
		if (opts.ticks) { ticks.call(opts, null) }
		if (opts.text) { text.call(opts, null); }
	};

	axis.horizontal = function (opts)	{
		opts.direction = 'horizontal';
		opts.toDomain = scale.getDomain();
		opts.len = scale.getDomainLength();
		opts.base = typeof opts.base === 'undefined' ? true : opts.base;
		opts.ticks = typeof opts.ticks === 'undefined' ? true : opts.ticks;
		opts.tickSize = (typeof opts.tickSize === 'undefined' ? 10 : opts.tickSize);

		return isDrawing(opts), axis;
	};

	axis.vertical = function (opts)	{
		opts.direction = 'vertical';
		opts.toDomain = scale.getDomain();
		opts.len = scale.getDomainLength();
		opts.base = typeof opts.base === 'undefined' ? true : opts.base;
		opts.ticks = typeof opts.ticks === 'undefined' ? true : opts.ticks;
		opts.tickSize = (typeof opts.tickSize === 'undefined' ? 5 : opts.tickSize);

		return isDrawing(opts), axis;
	};

	return axis;
}(axis || {}));