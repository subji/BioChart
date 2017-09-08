var eventHandler = (function (eventHandler)	{
	'use strict';
	
	var model = {};

	eventHandler.context = function (ctx)	{
		return model.ctx = ctx, 
		arguments.length ? eventHandler : model.ctx;
	};

	eventHandler.data = function (data)	{
		return model.data = data,
		arguments.length ? eventHandler : model.data;
	};

	function addMoveEventOnCanvas (callback)	{
		if (!model.ctx)	{
			throw new Error('Not found context of canvas.');
		}

		function getCoord (evt)	{
			callback({
				x: evt.pageX - model.ctx.canvas.offsetLeft,
				y: evt.pageY - model.ctx.canvas.offsetTop
			});
		};

		model.ctx.canvas.removeEventListener('mousemove', getCoord);
		model.ctx.canvas.addEventListener('mousemove', getCoord);
	};

	eventHandler.hover = function (callback)	{
		addMoveEventOnCanvas(function (crd)	{
			// console.log(crd);
		});
	};

	eventHandler.onScroll = function (target, callback)	{
		target = typeof target === 'object' ? target : document.querySelector(target);
		target.addEventListener('scroll', callback);
	};
	/*
	 	특정 이벤트 동작 중 해당 이벤트가 바디태그에서는
	 	Disable 하게 만들어주는 함수.
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
				// 이건 왜 한건지 모르겠음.
				// e.returnValue = false;

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
		Scroll : hidden 에서 스크롤 작업을 하게 도와주는 이벤트 함수.
	 */
	eventHandler.verticalScroll = function (ele, cb)	{
		if (!ele)	{
			throw new Error('There are not given dom element');
		}

		preventBodyEvent(ele, 'mousewheel');

		ele.addEventListener('mousewheel', function (e)	{
			ele.scrollTop += e.wheelDelta;

			if (cb)	{ cb.call(ele, e); }
		});
	};
	/*
		SVG Element 에 마우스를 올려놓았을 때, Element 가 가진
		데이터등을 반환해주는 함수.
	 */
	eventHandler.hoverSVG = function (data, idx)	{
		console.log(data);
	};

	return eventHandler;
}(eventHandler || {}));