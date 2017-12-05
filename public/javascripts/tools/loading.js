function loading ()	{
	'use strict';

	var model = {};

	function makeCircles (classes)	{
		var result = [];

		bio.iteration.loop(classes, function (cls)	{
			var circle = document.createElement('div');	

			circle.className = 'loading-circle-' + cls;

			result.push(circle);
		});

		return result;
	};

	function makeLoading (parent, width, height)	{
		var div = document.createElement('div'),
				inner = document.createElement('div'),
				circles = makeCircles([1, 2, 3, 4]),
				text = document.createElement('span');

		div.className = 'loading';
		div.style.width = width + 'px';
		div.style.height = height + 'px';

		text.className = 'loading-text';
		text.innerHTML = 'Loading';

		for (var i = 0, l = circles.length; i < l; i++)	{
			inner.appendChild(circles[i]);
		}

		div.appendChild(inner);
		div.appendChild(text);

		parent.appendChild(div);

		return div;
	};

	function start (parent, width, height)	{
		if (!width || !height)	{
			throw new Error('Please define the width and height');
		}	

		model.loadingElement = document.querySelector('.loading') ? 
														document.querySelector('.loading') : 
														makeLoading(parent, width, height);

		if (model.loadingElement.style.display === 'none')	{
			model.loadingElement.style.display = 'block';
		}
	};

	function end (num, sec)	{
		$(model.loadingElement).fadeOut('slow')
	};
	
	return function (parent, num, sec)	{
		return { start: start, end: end };
	}
};