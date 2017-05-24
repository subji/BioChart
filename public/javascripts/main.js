'use strict';

(function (window)	{
	window.bio = {
		draw: draw,
		render: render,
		variants: variants,
		pathways: '',
		expression: '',
		landscape: '',
		exclusive: exclusive,
		chart: {
			legend: '',
			needle: '',
			graph: '',
			procbar: '',
			title: '',
			network: network,
			heatmap: heatmap,
			survival: survival,
		},
		size: size,
		scale: scale,
		event: event,
	};
}(window||{}));