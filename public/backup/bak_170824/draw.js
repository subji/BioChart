var draw = (function (draw)	{
	'use strict';
	
	draw.ctx = null;

	draw.clearCanvas = function (parent)	{
		if(parent.children.length > 0)	{
			parent.removeChild(parent.firstChild);
		}
	};
	/*
		dom 의 가로 길이를 구해주는 함수.
	 */
	draw.width = function (args)	{
		return typeof(args) === 'string' ? 
		parseFloat(document.querySelector(args)) : 
		parseFloat(args.style.width);
	};
	/*
		dom 의 세로 길이를 구해주는 함수.
	 */
	draw.height = function (args)	{
		return typeof(args) === 'string' ? 
		parseFloat(document.querySelector(args)) : 
		parseFloat(args.style.height);
	};
	/*
		파라미터로 받은 문자열의 길이를 font 에 적용하여 반환하는
		함수.
	 */
	draw.getTextWidth = function (text, font)	{
		// MeasureText 가 OS 별로 지원하는 수치가 다르므로 주의할 것.
		var canv = document.createElement('canvas'),
				ctx = canv.getContext('2d'),
				width = 0;

		canv.id = 'get-text-width'
		ctx.font = (font ? font : '10px');

		document.body.appendChild(canv);

		text = text.replace(' ', 'A').toUpperCase();

		width = ctx.measureText(text).width;

		document.body.removeChild(
		document.getElementById('get-text-width'));

		return width;
	};
	/*
		Text 배열에서 가장 긴 Text 의 길이를 반환하는 함수.
	 */
	draw.getMostWidthOfText = function (texts, font)	{
		var result = 0;

		util.loop(texts, function (d, i)	{
			result = result > draw.getTextWidth(d, font) ? 
							 result : draw.getTextWidth(d, font);
		});

		return result;
	};
	/*
		문자의 크기와 문자의 종류에 따라 해당 문자열의
		높이를 반환하는 함수.
	 */
	draw.getTextHeight = function (size, font)	{
		var text = document.createElement('span'),
				block = document.createElement('div'),
				div = document.createElement('div');

		div.id = 'get_text_height';
		text.style.fontSize = (size || '10px');
		// text.style.fontStyle = (font || 'Arial');
		text.innerHTML = 'Hg';
		block.style.display = 'inline-block';
		block.style.width = '0px';
		block.style.height = '0px';

	  div.appendChild(text);
	  div.appendChild(block);
	  
	  document.querySelector('body').appendChild(div);

	  try {
	    var result = {};

	    block.style.verticalAlign = 'baseline';
	    result.ascent = block.offsetTop - text.offsetTop;
	    block.style.verticalAlign = 'bottom';
	    result.height = block.offsetTop - text.offsetTop;
	    result.descent = result.height - result.ascent;

	  } finally {
	    div.parentNode.removeChild(document.getElementById('get_text_height'));
	  }

	  return result;
	};

	draw.randomDraw = function (start, end)	{
		return Math.floor(Math.random() * start) + (end || 0);
	};

	/*
		각의 0 은 아래로 부터 시작된다. 오른쪽은 + ~180, 왼쪽은 - ~ 180 이다.
	 */
	draw.getDegree = function (x1, y1, x2, y2)	{
		var dx = x2 - x1,
				dy = y2 - y1,
				radian = Math.atan2(dx, dy);

		return {
			radian: radian,
			degree: Math.floor((radian * 180) / Math.PI),
		};
	};

	draw.noOverlap = function (ctx, data, comp)	{
		var da = 50,
				nodes = data.filter(function (d) { return d.type === 'node'; }),
				edges = data.filter(function (d) { return d.type === 'edge'; });

		for (var i = 0, l = nodes.length; i < l; i++)	{
			var n = nodes[i];

			n.textWidth = draw.getTextWidth(ctx, '14px Calibri', n.text);
			n.width = n.width || n.textWidth * 1.2;
			n.height = n.height || 300 * 0.08;
			n.radius = 5;

			if (comp)	{
				n.top = comp.members.indexOf(n.text) > -1 ? 
								draw.randomDraw(comp.top + n.height / 2, 
								comp.height * 0.7 - n.height / 2) : 
								(comp.top - 0) / 2 - n.height / 2;
				n.left = draw.randomDraw(comp.left + comp.width - comp.left - n.width, 
								comp.left);	
			} 
			// TODO.
			// compound 가 없는 상황에서는 특정 canvas 내에서 network 가 그려져야 한다.

			edges.forEach(function (e)	{
				e.source = e.source.substring(0, n.text.length) === n.text ? 
				n.text : e.source;
				e.target = e.target.substring(0, n.text.length) === n.text ? 
				n.text : e.target;
				e.id = e.id.substring(0, e.source.length + e.target.length);
			});
		}	
		
		return data;
	};
	/*
		svg 의 가로, 세로 길이를 반환해주는 함수.
	 */
	draw.size = function (svg)	{
		svg = util.d3v4() ? svg : svg[0][0];
		svg = util.varType(svg) === 'Array' || 
					util.varType(svg) === 'Object' ? svg : d3.select(svg);

		return {
			w: parseFloat(svg.attr('width')), 
			h: parseFloat(svg.attr('height')),
		};
	};
	/*
		Width 에 대하여 font 를 가진 txt 를 자르고
		뒤에 ellipsis 를 붙여주는 함수.
	 */
	draw.textOverflow = function (txt, font, width)	{
		var fit = '';

		txt.split('').some(function (d)	{
			return draw.getTextWidth(fit += d, font) > width;
		});

		return (fit === txt) ? txt : fit + '...';
	};
	/*
		Width, Height 에 맞게 적절한 폰트 크기를 반환하는 함수.
	 */
	draw.getFitTextSize = function (txt, width, height)	{
		var i = 10;

		while (1)	{
			var ti = i + 'px';

			if (draw.getTextHeight(ti).height > height || 
					draw.getTextWidth(txt, ti) > width)	{
				break;
			}

			i += 1;
		};

		return (i - 1) + 'px';
	};
	/*
		텍스트가 특정 길이를 초과하였을 때, '...' 또는 자르기 처리를 해준다.
	 */
	draw.textOverflow = function (txt, font, len, padding)	{
		var result = '',
				padding = padding || 0;

		if (draw.getTextWidth(txt, font) < len - padding)	{
			return txt;
		}

		util.loop(txt.split(''), function (d)	{
			var tw = draw.getTextWidth(result += d, font);

			if (tw > len - padding)	{
				result = result.substring(0, result.length - 2);
				return;
			}
		});

		return result;
	};
	/*
		전달 된 노드의 어미 svg 를 찾아 반환한다.
	 */
	draw.getParentSvg = function (node)	{
		if (node.parentElement.tagName === 'svg')	{
			return node.parentElement;
		}

		return draw.getParentSvg(node.parentElement);
	};
	/*
		현재 노드를 가장 앞으로 보내주는 함수.
	 */
	draw.toFront = function (node)	{
		node.parentNode.appendChild(node);
	};
	/*
		현재 노드의 자식 노드중에서 사용자가 전달한 인덱스의
		자식 노드를 반환한다.
	 */
	function getChildByIndex (node, id)	{
		return node.parentNode.querySelector('#' + id)
							 .nextSibling;
	};
	/*
		현재 노드를 가장 뒤로 보내주는 함수.
	 */
	draw.toBack = function (node, id)	{
		if (id)	{
			node.parentNode.insertBefore(
			node, getChildByIndex(node, id));	
		} else	{
			node.parentNode.insertBefore(node, 
			node.parentNode.firstChild);
		}
	};

	return draw;
}(draw || {}));