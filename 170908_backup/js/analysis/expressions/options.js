'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('options', [], factory);
	} else {
		factory(options);
	}
} (function ()	{
	var scoreFunction = function ()	{
		console.log('scoreFunction');
	}

	var colorMapping   = function ()	{
		console.log('colorMapping');
	}	

	var geneSet 			 = function ()	{
		console.log('geneSet');
	}

	return {
		'scoreFunction' : scoreFunction,
		'colorMapping'	: colorMapping ,
		'geneSet'				: geneSet 		 ,
	}
}));