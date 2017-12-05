function iteration ()	{
	'use strict';

	var model = {};
	/*
		객체, 리스트를 반복하는 함수.
		결과 값은 콜백함수의 파라미터로 전달 된다.
	 */
	model.loop = function (data, callback)	{
		if (typeof(data) !== 'object')	{
			throw new Error ('This is not Object or Array');
		}

		if (bio.objects.getType(data) === 'Array')	{
			for (var i = 0, l = data.length; i < l; i++)	{
				callback.call(this, data[i], i);
			}
		} else {
			for (var key in data)	{
				callback.call(this, key, data[key]);
			}
		}
	};
	// >>> About Array. 
	/*
		주어진 길이 만큼 주어진 값으로 리스트를 채워넣고 반환하는 함수.
	 */
	Array.prototype.fill = function (len, value)	{
		for (var i = 0; i < len; i++)	{
			this.push(value);
		}

		return this;
	};

	return model;
};