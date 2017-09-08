'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('pathwayplot', ['tooltip', 'loading'], factory);
	} else {
		factory(pathwayplot);
	}
} (function (tooltip, loading)	{
	
}));