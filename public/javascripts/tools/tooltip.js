function tooltip ()	{
	'use strict';

	var model = {};
	/*
		Tooltip 의 방향을 설정해주는 함수.
	 */
	function setDirection (tbcr, pbcr, bcr)	{
		if (tbcr.left - bcr.width / 2 < pbcr.left)	{
			return 'right';
		} else if (tbcr.top - bcr.height < pbcr.top)	{
			return 'bottom';
		} else if (tbcr.right + bcr.width > pbcr.right)	{
			return 'left';
		} else if (tbcr.bottom + bcr.height > pbcr.bottom)	{
			return 'top';
		} else {
			return 'top';
		}
	};	
	/*
		Tooltip 을 띄워주는 함수.
	 */
	function show (div, target, parent)	{
		if (!div)	{
			throw new Error('Do not find a Tooltip element');
		}

		var bcr = div.getBoundingClientRect(),
				tbcr = target.getBoundingClientRect(),
				pbcr = parent.getBoundingClientRect(),
				dir = setDirection(tbcr, pbcr, bcr);
		/*
			Tooltip 의 위쪽 Position 값 설정.
		 */
		function setTop (dir, pos, height)	{
			if (dir !== 'left' && dir !=='top' && 
					dir !== 'bottom' && dir !== 'right')	{
				throw new Error('Wrong direction');
			}

			return {
				top: pos.top - height - 10 + window.scrollY + 'px',
				left: pos.top - height / 2 + window.scrollY + 'px',
				bottom: pos.bottom + 10 + window.scrollY + 'px',
				right: pos.top - height / 2 + window.scrollY + 'px',
			}[dir];
		};
		/*
			Tooltip 의 왼쪽 Position 값 설정.
		 */
		function setLeft (dir, pos, width)	{
			if (dir !== 'left' && dir !=='top' && 
					dir !== 'bottom' && dir !== 'right')	{
				throw new Error('Wrong direction');
			}

			return {
				top: pos.left - width / 2 + window.scrollX + 'px',
				left: pos.left - width - 10 + 'px',
				bottom: pos.left - width / 2 + window.scrollX + 'px',
				right: pos.right + 10 + 'px',
			}[dir];
		};

		div.className = dir;
		div.style.visibility = 'visible';
		// Set top & Left(Scroll 변화가 있을 경우도 고려.)
		div.style.top = setTop(dir, tbcr, bcr.height);
		div.style.left = setLeft(dir, tbcr, bcr.width);
	};
	/*
		Tooltip 을 가려주는 함수.
	 */
	function hide (div)	{
		if (!div)	{
			throw new Error('Do not find a Tooltip element');
		}

		div.innerHTML = '';
		div.style.top = '0px';
		div.style.left = '0px';
		div.style.visibility = 'hidden';
	};
	/*
		TODO.
			- Scroll 위치 변경 적용.
			- SVG 밖을 안벗어나게끔 적용.
	 */
	return function (opts)	{
		if (bio.objects.getType(opts) === 'String')	{
			if (!document.getElementById('biochart_tooltip'))	{
				throw new Error('Not found "#biochart_tooltip"');
			}
			
			return hide(document.getElementById('biochart_tooltip'));
		}

		var target = opts.element || null,
				contents = opts.contents || '',
				parent = bio.drawing().getParentSVG(target);

		var tooltipDiv = document.getElementById('biochart_tooltip');
				tooltipDiv.innerHTML = contents;

		return show(tooltipDiv, target, parent);
	};
};