'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('canvasContext', [], factory);
	} else {
		factory(canvasContext);
	}
} (function ()	{
	var axis = function (ctx)	{
		var that = this;

		return {
			'linear': function ()	{
				return this;
			},
			'range' : function (start, end)	{
				this.start = start;
				this.end   = end;

				return this;
			},
			'style' : function (css)	{
				this.css 	 = css;
				this.hFont = +css.replace((/[a-z]/ig), '');

				return this;
			},
			'orient': function (ori)	{
				this.ori = (/right|left/ig).test(ori);
				this.way = (/right|bottom/ig).test(ori) ? 1 : -1;

				return this;
			},
			'scale' : function (sc)		{
				this.sc = sc;

				return this;
			},
			'position': function (x, y)	{
				this.x = x;
				this.y = y;

				return this;
			},
			'leng': function (length)	{
				this.length = length;

				return this;
			},
			'translate'	: function (ts)	{
				this.ts = ts;

				return this;
			},
			'draw': function ()	{
				this.frame();
				this.tick();

				return this;
			},
			'frame': function ()	{
				var ts = this.ts || 0;

				ctx.beginPath();
				ctx.moveTo(this.x + ts, this.y);
				this.ori ? ctx.lineTo(this.x, this.length) : 
									 ctx.lineTo(this.length, this.y);
				ctx.stroke();
				ctx.closePath();
			},
			'tick': function ()	{
				var t   = this.term(),
						way = this.way * 5,
						ts  = this.ts || 0;

				for (var i = this.start; i <= this.end; i += t)	{
					ctx.beginPath();
					ctx.fillStyle = '#000';
					this.ori ? 
					this.drawLine((this.x + way), this.sc(i), this.x, this.sc(i)) : 
					this.drawLine(this.sc(i) + ts, this.y, this.sc(i) + ts, (this.y + way));
					ctx.textBaseline = 'middle';
					ctx.textAlign		 = 'end';
					this.ori ? 
					ctx.fillText(i, (this.x + way - 2), this.sc(i)) : 
					ctx.fillText(i, (this.sc(i) + ts + this.textLoc(i)), (this.y + way * 3));
					ctx.closePath();
				}

				if (this.end - i !== 0)	{
					this.ori ? 
					this.drawLine((this.x + way), this.sc(this.end), this.x, this.sc(this.end)) : 
					this.drawLine(this.sc(this.end) + ts, this.y, this.sc(this.end) + ts, (this.y + way));
				}
			},
			'term': function ()	{
				var std    = 10,
						tn 		 = (this.end - this.start) / std,
						base   = [1, 2, 5, 10],
						temp   = [],
						digit  = Math.ceil(tn),
						dLen 	 = digit.toString().length;

				for (var i = 0; i < base.length; i++)	{
					temp.push(Math.abs(digit - base[i] * Math.pow(std, dLen - 1)));
				}

				return base[temp.indexOf(d3.min(temp))] * Math.pow(std, dLen - 1);
			},
			'drawLine': function (x1, y1, x2, y2)	{
				ctx.beginPath();
				ctx.font = this.css;
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
				ctx.closePath();
			},
			'textLoc': function (text)	{
				var width = ctx.measureText(text).width,
						term  = this.term();

				return text === this.start ? width : 
							 text > (this.end - term) && text <= (this.end) ? 0 : width / 2;
			}
		};
	}
	var roundRect = function (x, y, w, h, r, s)	{
		this.beginPath();
		this.moveTo(x + r, y);
		this.lineTo(x + w - r, y);
		this.quadraticCurveTo(x + w, y, x + w, y + r);
		this.lineTo(x + w, y + h - r);
		this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		this.lineTo(x + r, y + h);
		this.quadraticCurveTo(x, y + h, x, y + h - r);
		this.lineTo(x, y + r);
		this.quadraticCurveTo(x, y, x + r, y);
		this.fillStyle = s;
		this.fill();
		this.closePath();
	}

	var wrapText = function (str, max, x, y)	{
		var strlen  = str.length,
				padding = 3,
				txt     = '';

		for (var i = 0; this.measureText(str.substring(0, i)).width <= max - padding; ++i)	{
			if (i > strlen)	{
				break;
			}

			txt = str.substring(0, i);
		}

		this.fillText(txt, x + this.measureText(txt).width + padding, y);
	}

	var circle = function (x, y, r, style)	{
		this.beginPath();
		this.arc(x, y, r, 0, 2 * Math.PI, false);
		this.fillStyle = style;
		this.fill();
		this.closePath();
	}

	var triangle = function (x, y, len, style)	{
		var height = parseFloat(Math.sqrt(Math.pow(len, 2) 
							 - (Math.pow((len / 2), 2))).toFixed(1));

		this.beginPath();
		this.moveTo(x, y);
		this.lineTo(x - len, y + height);
		this.lineTo(x + len, y + height);
		this.lineTo(x, y);
		this.stroke();
		this.fillStyle = '#333';
		this.fill();
		this.closePath();
	}

	var oneLine    = function (mx, my, lx, ly, style)	{
		this.beginPath();	
		this.moveTo(mx, my);
		this.lineTo(lx, ly);
		this.strokeStyle = style;
		this.stroke();
		this.closePath();
	}

	return function (context)	{
		context.oneLine 	= oneLine;
		context.circle  	= circle;
		context.wrapText  = wrapText;
		context.roundRect = roundRect;
		context.triangle  = triangle;
		context.axis 			= axis.call({}, context);

		return context;
	}
}));