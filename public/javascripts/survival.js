'use strict';

var survival = (function (survival)	{

	return function (opts)	{
		var e = opts.element || null,
				dq = document.querySelector(e),
				w = parseFloat(opts.width || dq.style.width || 360),
				h = parseFloat(opts.height || dq.style.height || 600),
				canvas = render.createCanvas(e.substring(1, e.length), w, h),
				ctx = canvas.getContext('2d');

		dq.appendChild(canvas);

		

		event.context(ctx)
				 .hover(function (obj)	{
				 	console.log(obj);
				 });
	}
}(survival || {}));