function objects ()	{
	'use strict';

	var model = {};
	/*
		Object 의 Type 을 문자열로 반환하는 함수.
		Ex) 'SSS' -> 'String'.
	 */
	model.getType = function (obj)	{
		var str = Object.prototype
										.toString.call(obj);

		return str.substring(
					 str.indexOf(' ') + 1, 
					 str.indexOf(']'));
	};
	/*
		객체를 복사 (완전복사) 하여 반환하는 함수.
	 */
	model.clone = function (obj)	{
		if (typeof(obj) !== 'object')	{
			return obj;
		} else {
			if (model.getType(obj) === 'Array')	{
				return new Array().concat(obj);
			} else {
				var copy = {};

				bio.iteration.loop(obj, function (key, value)	{
					if (obj.hasOwnProperty(key))	{
						copy[key] = model.clone(obj[key]);
					}
				});

				return copy;
			}
		}
	};
	/*
		객체의 키를 값으로 찾아주는 함수.
	 */
	model.getKey = function (obj, value)	{
		var keys = Object.keys(obj),
				values = Object.values(obj);

		return keys[values.indexOf(value)];
	};

	return model;
}