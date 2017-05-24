'use strict';

var config = {};

config.mutualExColor = function (value)	{
	return {
		'A': { bg: '#D3D3D3', ins: '#FFBDE0' },
		'B': { bg: '#FFBDE0', ins: '#5CB755' },
		'D': { bg: '#D3D3D3', ins: '#BDE0FF' },
		'E': { bg: '#BDE0FF', ins: '#5CB755' },
		'M': { bg: '#D3D3D3', ins: '#5CB755' },
		'.': { bg: '#D3D3D3', ins: '#D3D3D3' },
	}[value];
}

config.variantColor = function ()	{

};

config.groupColor = function ()	{

};

