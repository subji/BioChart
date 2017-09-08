'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('loading', ['spin'], factory);
	} else {
		factory(loading);
	}

} (function (spin)	{
	var setOption = function (chart)	{
		var top  = chart === 'needle' ? '62%' : '50%';
		var left = chart === 'needle' ? '63%' : '56%';

		return {
			'lines' 		: 17							 ,
			'length' 		: 0								 ,
			'width' 		: 13							 ,
			'radius' 		: 41							 ,
			'scale' 		: 1								 ,
			'corners' 	: 1								 ,
			'color' 		: '#000'					 ,
			'opacity' 	: 0								 ,
			'rotate' 		: 30							 ,
			'direction' : 1								 ,
			'speed' 		: 1								 ,
			'trail' 		: 79							 ,
			'fps' 			: 20							 ,
			'zIndex' 		: 2e9							 ,
			'className' : 'loading-spinner',
			'top' 			: top							 ,
			'left' 			: left						 ,
			'shadow' 		: false						 ,
			'hwaccel' 	: false						 ,
			'position'  : 'absolute'			 ,
		};
	}

	return function (chart)	{
		var target  = document.getElementById('maincontent');
		var spinner = new spin(setOption(chart));
		
		return {
			'start' : function ()	{
				$('.chart_container').css('visibility', 'hidden');

				spinner.spin(target);
			},
			'stop' 	: function ()	{
				$('.loading-spinner').fadeOut().remove();
				$('.chart_container').css('visibility', 'visible');
			}
		}
	}
}));