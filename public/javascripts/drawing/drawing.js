function drawing ()	{
	'use strict';

	var model = { textSize: {} };
	/*
		Text 가로 길이 구하는 함수.
	 */
	function textWidth (text)	{
		return text.getBoundingClientRect().width.toFixed();
	};
	/*
		Text 세로 길이 구하는 함수.
	 */
	function textHeight (text, block)	{
		// var result = {};

	//   block.style.verticalAlign = 'baseline';
	//   result.ascent = block.offsetTop - text.offsetTop;
	//   block.style.verticalAlign = 'bottom';
	//   result.height = block.offsetTop - text.offsetTop;
	//   result.descent = result.height - result.ascent;

   		return text.getBoundingClientRect().height.toFixed();
    // return block.offsetTop - text.offsetTop - 2;
	  // return result.height - 2;
	};
	/*
		Text 의 가로, 세로 길이를 구해주는 중립 함수.
	 */
	function getTextSize (type, txt, font)	{
		var text = document.createElement('span'),
				block = document.createElement('div'),
				div = document.createElement('div');

		if (type === 'width') {
			font = font.split(' ');
		} else {
			txt = txt.split(' ');
		}

		div.id = 'get_text_' + type;

		text.style.fontSize = type === 'width' ? font[0] : txt[0];
		text.style.fontWeight = type === 'width' ? font[1] : txt[1];
		text.innerHTML = type === 'width' ? txt : 'Hg';

		block.style.display = 'inline-block';
		block.style.width = '1px';
		block.style.height = '0px';

		div.appendChild(text);
		div.appendChild(block);

		document.body.appendChild(div);

		try {
			var result = text.getBoundingClientRect()[type].toFixed();
			// var result = type === 'width' ? 
			// 		textWidth(text) : textHeight(text, block);
		} finally {
			document.body.removeChild(
    		document.getElementById('get_text_' + type));
		}

    return parseFloat(result);
	};
	/*
		문자열의 가로 길이를 반환하는 함수.
	 */
	model.textSize.width = function (txt, font)	{
		return getTextSize('width', txt, font);
	};
	/*
		Text 배열에서 가장 길이가 긴 문자열과 그 길이를 반환한다.
	 */
	model.mostWidth = function (txts, font)	{
		var result = [];

		bio.iteration.loop(txts, function (txt)	{
			result.push({
				text: txt,
				value: model.textSize.width(txt, font)
			});
		});

		// 내림차순 정렬 후 가장 큰 값 (0번째 값) 을 반환한다.
		return result.sort(function (a, b)	{
			return a.value < b.value ? 1 : -1;
		})[0];
	};
	/*
		문자열의 세로 길이를 반환하는 함수.
	 */
	model.textSize.height = function (font)	{
		return getTextSize('height', font);
	};
	/*
		전달 된 가로, 세로길이에 맞춰 font 의 크기를 정해주는 함수.
	 */
	model.fitText = function (txt, width, height, font)	{
		var num = 10,	// default 10px.
				fontStr =  num + 'px ' + (font || 'normal'); 

		while (model.textSize.height(fontStr) < height && 
					model.textSize.width(txt, fontStr) < width)	{
		
			fontStr = (num += 1, num) + 'px ' + font;
		}

		return (num - 1) + 'px';
	};
	/*
		영역안에서 문자열이 넘어갈 경우 그 부분을 제거 해준다.
	 */
	model.textOverflow = function (txt, font, width, padding)	{
		var result = '';
		
		padding = padding || 5;

		if (model.textSize.width(txt, font) < width - padding)	{
			return txt;
		}

		bio.iteration.loop(txt.split(''), function (t)	{
			var txtWidth = model.textSize.width(result += t, font);

			if (txtWidth > width - padding)	{
				result = result.substring(0, result.length - 2);

				return;
			}
		});

		return result;
	};
	/*
		현재 노드의 SVG 엘리먼트를 가져온다.
	 */
	model.getParentSVG = function (node)	{
		if (node.parentElement.tagName === 'svg')	{
			return node.parentElement;
		} 

		return model.getParentSVG(node.parentElement);
	};
	/*
		Legend 그룹의 자식노드들을 반환한다.
	 */
	model.nthChild = function (classify, idx)	{
		return d3.select(classify).node().children[idx];
	};
	/*
		Source 엘리먼트에서 destination 엘리먼트를 찾는 함수.
	 */
	model.findDom = function (source, destination)	{
		if (source.children < 1)	{
			throw new Error('There are no any child elements');
		}

		var sourceList = Array.prototype.slice.call(source.children),
				result = null;

		bio.iteration.loop(sourceList, function (child)	{
			if (child.tagName === destination.toUpperCase() || 
		'.' + child.className === destination || 
		'#' + child.id === destination)	{
				result = child;

				return;
			} 
		});

		return result;
	};
	/*
		Slide down 애니메이션 구현 함수.
	 */
	model.slideDown = function (target)	{
		var init = target.style.height ? 
				parseFloat(target.style.height) : 
				target.getBoundingClientRect().height,
				height = 0;

		target.style.height = 0 + 'px';

		var interval = setInterval(function ()	{
			height += 1;
			target.style.height = height + 'px';

			if (height === init)	{
				clearInterval(interval);
			}
		}, 5);
	};

	/*
		Slide down 애니메이션 구현 함수.
	 */
	model.slideUp = function (target)	{
		var init = target.style.height ? 
				parseFloat(target.style.height) : 
				target.getBoundingClientRect().height,
				height = parseFloat(target.style.height);

		var interval = setInterval(function ()	{
			height -= 1;
			target.style.height = height + 'px';

			if (height === 0)	{
				clearInterval(interval);

				target.style.height = init + 'px'
				target.style.display = 'none';
			}
		}, 5);
	};
	/*
		Client 에 존재하는 또는 서버에 있는 SVG 파일을 읽어와
		Callback 또는 SVG 를 반환하는 함수.
	 */
	model.importSVG = function (url, callback)	{
		var result = null;

		d3.xml(url).mimeType('image/svg+xml')
			.get(function (err, xml)	{
				if (err) throw err;

				return callback ? callback(xml) : result = xml;		
			});

		return result;
	};

	model.nodes = function (selection)	{
		var result = [];

		selection.each(function (d)	{
			result.push(this)
		});

		return result;
	}

	return function ()	{
		return model;
	};
};