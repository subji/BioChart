'use strict';

var variants = (function ()	{

	function render() {

	}

	return function (opts)	{
		var e = opts.element || null,
				dq = document.querySelector(e),
				w = opts.width || dq.style.width || 1200,
				h = opts.height || dq.style.height || 600;

		console.log('Variants', '\nElement: ', e,
			'\nWidth: ', w, '\nHeight: ', h);
	};
}());