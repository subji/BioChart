var util = (function (util)	{
	'use strict';
	/*
		d3 version 체크 함수.
	 */
	util.d3v4 = function ()	{
		return d3.version.indexOf('3') === 0 ? false : true;
	};

	util.camelCase = function (txt)	{
		return txt.substring(0, 1).toUpperCase() + 
					 txt.substring(1).toLowerCase();
	};
	/*
		객체와 배열을 순회하고 그 값을 콜백함수로 반환하는 함수.
	 */
	util.loop = function (d, cb)	{
		if (util.varType(d) === 'Array')	{
			for (var i = 0, l = d.length; i < l; i++)	{
				cb.call(this, d[i], i);
			}	
		} else if (util.varType(d) === 'Object')	{
			for (var k in d)	{
				cb.call(this, k, d[k]);
			}	
		}
	};
	/*
		객체를 복사하는 함수.
	 */
	util.cloneObject = function (obj)	{
		if (obj === null || typeof(obj) !== 'object')	{
			return obj;
		}

		var copy = obj.constructor();

		util.loop(obj, function (key, val)	{
			if (obj.hasOwnProperty(key))	{
				copy[key] = obj[key];
			}
		});

		return copy;
	};
	/*
		변수의 타입을 문자열로 반환하는 함수.
	 */
	util.varType = function (v)	{
		var ts = Object.prototype.toString.call(v);

		return ts.substring(ts.indexOf(' ') + 1, 
					 ts.indexOf(']'));
	};
	/*
		Object 의 키값들로만 구성된 Arr 를 만들어 
		반환하는 함수.
	 */
	util.keyToArr = function (o)	{
		var r = [];

		util.loop(o, function (k, v)	{
			r.push(k);
		});

		return r;
	};
	/*
		Min 과 Max 값을 반환해주는 함수.
	 */
	util.minmax = function (a, b)	{
		return arguments.length < 2 ? {
			min: Math.min.apply(null, a),
			max: Math.max.apply(null, a),
		} : {
			min: Math.min.call(null, a, b),
			max: Math.max.call(null, a, b),
		};
	};
	/*
		Median (중간값) 을 구하고 반환하는 함수.
	 */
	util.median = function (list)	{
		return new Array().concat(list)
					.sort()[util.medIndex(list)];
	};
	/*
		Median 의 인덱스를 반환하는 함수.
	 */
	util.medIndex = function (list) {
		return list.length % 2 === 1 ? 
					(list.length + 1) / 2 : list.length / 2;
	}
	/*
		문자열 사이의 공백을 지워 반환하는 함수.
	 */
	util.removeWhiteSpace = function (t)	{
		return t.replace(/\s/ig, '');
	};
	/*
		문자열에서 사용자지정위치의 문자를 다른 문자로
		대치해주는 함수.
		String 객체의 프로토타입으로 지정하였다.
	 */
	String.prototype.replaceAt = function (idx, rep)	{
		return this.substr(0, idx) + rep + 
					 this.substr(idx + rep.length);
	};
	/*
		Array 를 특정한 하나의 값으로 채워주는 함수.
		이미 중복된 fill 이란 함수가 있지만,
		IE 에서는 사용이 되지 않기 때문에
		새로 오버라이딩 하였다.
	 */
	Array.prototype.fill = function (len, v)	{
		for (var i = 0; i < len; i++)	{
			this.push(v);
		}

		return this;
	};

	return util;
}(util||{}));