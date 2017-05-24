'use strict';

var force = (function (force)	{
	force.setConstant = function (cons)	{
		force.constant = cons || 50;

		return model;
	};

	force.getConstant = function ()	{
		return force.constant || 50;
	};

	force.getKvalue = function (width, height)	{
		var constant = force.getConstant();

		return Math.sqrt(width * height) / constant;
	};

	force.aForce = function (k, d)	{
		return (d * d) / k;
	};

	force.rForce = function (k, d)	{
		return (k * k) / d;
	};

	return force;

}(force || {}));