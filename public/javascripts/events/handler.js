function handler ()	{
	'use strict';

	var model = {};
	/*
		스크롤 이벤트 핸들러.
	 */
	function scroll (target, callback)	{
		bio.dom().get(target)
			 .addEventListener('scroll', callback, false);
	};
	/*
	 	특정 이벤트 중 이벤트가 바디태그에서는 Disable 하게 만들어주는 함수.
	 */
	function preventBodyEvent (ele, events)	{
		var DOEVENT = false;

		// 사용자가 지정한 DIV 에 마우스 휠을 작동할때는, 바디에 마우스 휠
		// 이벤트를 막아놓는다.
		document.body.addEventListener(events, function (e)	{
			if (DOEVENT)	{
				if (e.preventDefault) {
					e.preventDefault();
				}

				return false;
			}
		});

		ele.addEventListener('mouseenter', function (e)	{
			DOEVENT = true;
		});

		ele.addEventListener('mouseleave', function (e)	{
			DOEVENT = false;
		});
	};
	/*
		x, y 스크롤이 hidden 일 때, 스크롤을 가능하게 해주는 함수.
	 */
	function scrollOnHidden (element, callback)	{
		if (!element)	{
			throw new Error('No given element');
		}

		preventBodyEvent(element, 'mousewheel');

		element.addEventListener('mousewheel', function (e)	{
			element.scrollTop += element.wheelDelta;

			if (callback) {
				callback.call(element, e);
			}
		});
	};

	return function ()	{
		return {
			scroll: scroll,
			scrollOnHidden: scrollOnHidden,
		};
	};
};