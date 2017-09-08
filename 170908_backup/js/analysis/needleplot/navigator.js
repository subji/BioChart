'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('navigator', ['canvasContext'], factory);
	} else {
		factory(navigator);
	}
} (function (cctx)	{
	var reverse = function (num)	{
		
	}

	var size = function (start, end)	{
		this.s = start;
		this.w = end;

		return this;
	}

	var zoom = function (func)	{
		var ctx 		= this.ctx,
				s       = this.s,
				w       = this.w,
				navi    = this.navi = {
					'left' : s, 'right': w, 
					'scale': 0, 'ts' 	 : 0,
					'count': 0, 
				};

		ctx.canvas.onmousewheel = function (e)	{
			var evt 	= e || event,
					wheel = evt.wheelDelta / 120 * -1;

			navi.scale = Math.round(w * wheel * 0.05 / 2);
			navi.count = Math.min(s, navi.count + navi.scale);
			navi.left  = Math.min(s, navi.left  + navi.scale);
			navi.right = Math.max(w, navi.right + navi.scale * -1);
			navi.ts    = navi.ts > 0 ? 
			navi.ts === s ? navi.ts : Math.max(s, navi.ts - navi.scale) : 
			navi.ts === s ? navi.ts : Math.min(s, navi.ts + navi.scale);

			func(navi);
		}

		return this;
	}

	var move = function (func)	{
		var	ctx  = this.ctx,
				s    = this.s,
				w    = this.w,
				navi = ctx.navi,
				drag = false;

		ctx.canvas.onmousedown = function (e)	{
			drag = true;
		};

		ctx.canvas.onmouseup = function (e)	{
			drag = false;
		};

		ctx.canvas.onmousemove = function (e)	{
			if (drag)	{
				var evt  = e || event,
						mv 	 = evt.movementX;
				
				navi.ts = Math.max(navi.count, 
									Math.min(Math.abs(navi.count), navi.ts + mv));

				func(navi);
			}
		};

		return this;
	}

	return function (data, context)	{
		var ctx    	 = CanvasRenderingContext2D.prototype;
				ctx.data = data,
				ctx.ctx  = context;
				ctx.size = size;
				ctx.zoom = zoom;
				ctx.move = move;	

		return ctx;
	}
}));