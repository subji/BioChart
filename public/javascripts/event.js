'use strict';

var event = (function (event)	{
	var model = {};

	event.context = function (ctx)	{
		return model.ctx = ctx, 
		arguments.length ? event : model.ctx;
	};

	event.data = function (data)	{
		return model.data = data,
		arguments.length ? event : model.data;
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

	event.hover = function (callback)	{
		addMoveEventOnCanvas(function (crd)	{
			// console.log(crd);
		});
	};

	return event;
}(event || {}));