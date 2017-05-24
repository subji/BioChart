'use strict';

var render = (function (render)	{
	render.ctx = null;
	/**
	 This function is to initialize styles 
	 that it will apply to shapes or lines that draw on canvas. 
	 */
	function initStyle (ctx)	{
		ctx.fillStyle = '#000000';
		ctx.strokeStyle = '#000000';
		ctx.shadowColor = '#000000';
		ctx.shadowBlur = '0';
		ctx.shadowOffsetX = '0';
		ctx.shadowOffsetY = '0';
	};

	function setStyle(ctx, opts)	{
		initStyle(ctx);

		for (var opt in opts)	{
			if (ctx[opt])	{
				ctx[opt] = opts[opt];

				switch(opt)	{
					case 'fillStyle': ctx.fill(); break;
					case 'strokeStyle': ctx.stroke(); break;
					case 'dashed': ctx.setLineDash([3, 10]); break;
					default: break;
				}
			}
		};
	};

	render.text = function (opts)	{
		render.ctx.beginPath();
		setStyle(render.ctx, opts);
		render.ctx.fillText(opts.text, opts.left, opts.top);
		render.ctx.closePath();
		return render;
	};

	render.line = function (opts)	{
		function one ()	{
			render.ctx.lineTo(opts.edge[0], opts.edge[1]);
		};

		function more() {
			for (var i = 0, l = opts.edge.length; i < l; i++)	{
				render.ctx.lineTo(opts.edge[i][0], opts.edge[i][1]);
			};
		};
		// TODO.
		// 익명 함수를 사용해서 큰 배열을 이용하면 선 그리기도 다룰 수 있어야한다.
		render.ctx.beginPath();
		render.ctx.moveTo(opts.left, opts.top);
		opts.edge.length === 2 && typeof opts.edge[0] 
		!== 'object' ? one() : more();
		setStyle(render.ctx, opts);
		render.ctx.stroke();
		render.ctx.closePath();
		return render;
	};

	render.rect = function (opts)	{
		render.ctx.beginPath();
		render.ctx.rect(opts.left, opts.top, opts.width, opts.height);
		setStyle(render.ctx, opts);
		render.ctx.closePath();
		return render;
	};

	render.rounded = function (opts)	{
		render.ctx.beginPath();
		render.ctx.moveTo(opts.left + opts.radius, opts.top);
		render.ctx.lineTo(opts.left + opts.width - opts.radius, opts.top);
		render.ctx.arcTo(opts.left + opts.width, opts.top, opts.left + opts.width, 
			opts.top + opts.radius, opts.radius);
		render.ctx.lineTo(opts.left + opts.width, opts.top + opts.height - 
			opts.radius);
		render.ctx.arcTo(opts.left + opts.width, opts.top + opts.height, 
			opts.left + opts.width - opts.radius, opts.top + opts.height, 
			opts.radius);
		render.ctx.lineTo(opts.left + opts.radius, opts.top + opts.height);
		render.ctx.arcTo(opts.left, opts.top + opts.height, opts.left, 
			opts.top + opts.height - opts.radius, opts.radius);
		render.ctx.lineTo(opts.left, opts.top + opts.radius);
		render.ctx.arcTo(opts.left, opts.top, opts.left + opts.radius, 
			opts.top, opts.radius);
		setStyle(render.ctx, opts);
		render.ctx.closePath();
		return render;
	};

	render.arrow = function (opts)	{
    var angle = Math.atan2(opts.height - opts.top, opts.width - opts.left);

		render.ctx.beginPath();
    render.ctx.moveTo(opts.left, opts.top);
    render.ctx.lineTo(opts.width, opts.height);
    render.ctx.lineTo(opts.width - opts.headLen * Math.cos(angle - Math.PI / 6),
    	opts.height - opts.headLen * Math.sin(angle - Math.PI / 6));
    render.ctx.moveTo(opts.width, opts.height);
    render.ctx.lineTo(opts.width - opts.headLen * Math.cos(angle + Math.PI / 6),
    	opts.height - opts.headLen * Math.sin(angle + Math.PI / 6));
		setStyle(render.ctx, opts);
		render.ctx.closePath();
	};
	/**
	 this function is get a ratio that to apply 
	 when the screen resolutions are high resolution.
	 */
	render.getRatio = function () {
		var ctx = document.createElement('canvas').getContext('2d'),
				dpr = window.devicePixelRatio || 1,
				bsr = ctx.webkitBackingStorePixelRatio || 
							ctx.mozBackingStorePixelRatio || 
							ctx.msBackingStorePixelRatio || 
							ctx.oBackingStorePixelRatio || 
							ctx.backingStorePixelRatio || 1;

		return dpr / bsr;
	};

	render.context = function (ctx)	{
		render.ctx = ctx;
		return render;
	};

	render.createCanvas = function (id, width, height, ratio)	{
		ratio = ratio || render.getRatio();

		var canv = document.createElement('canvas');
				canv.id = id;
				canv.width = width * ratio;
				canv.height = height * ratio;
				canv.style.width = width + 'px';
				canv.style.height = height + 'px';
				canv.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);

		return canv;
	};

	return render;
}(render || {}));