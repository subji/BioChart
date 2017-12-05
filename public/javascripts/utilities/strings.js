/*
	String 객체의 prototype 으로 붙일 기능들을
	모아둔 객체.
 */
function strings ()	{
	'use strict';

	String.prototype.matchAll = function (regex)	{
		var matched = [], found;

		while (found = regex.exec(this))	{
			matched.push(found[0]);
		}

		return matched;
	};
	/*
		String 을 대명사 표기법 형태로 바꿔 반환하는 함수.
	 */
	String.prototype.pronoun = function ()	{
		return this[0].toUpperCase() + 
					 this.substring(1).toLowerCase();
	};
	/*
		문자열에 포함된 공백들을 지워주는 함수.
	 */
	String.prototype.removeWhiteSpace = function ()	{
		return this.replace(/\s/ig, '');
	};
	/*
		문자열에 포함된 특수문자들을 지워주는 함수.
	 */
	String.prototype.removeSymbol = function ()	{
		return this.replace(/\W/ig, '');
	}
	/*
		문자열에서 사용자지정위치의 문자를 다른 문자로 대치해주는 함수.
		String 객체의 프로토타입으로 지정하였다.
	 */
	String.prototype.replaceAt = function (idx, rep)	{
		// substring !== substr 
		// substring 은 start 부터 end 까지,
		// substr 은 start 부터 num 개를 자른다.
		return this.substring(0, idx) + rep + 
					 this.substring(idx + 1);
	};
	/*
		파라미터 값을 문자열내에서 모두 바꿔준다.
	 */
	String.prototype.replaceAll = function (target, change)	{
		return this.replace(new RegExp(target, 'ig'), change);
	};
};