function dependencies ()	{
	'use strict';
	// Dependencies 의 기능을 모아둔 Model 객체.
	var model = {
		version: {},	// Dependencies library 의 버전관련 객체.
	};
	/*
		현재 적용 된 D3JS 의 버전이 
		4 버전이면 true,
		3 버전이면 false 를 반환하는 함수.
	 */
	model.version.d3v4 = function ()	{
		// D3JS 가 존재하지 않을 경우 에러를 발생시킨다.
		if (!d3)	{
			throw new Error ('D3JS is not found');
		}
		// d3.version 의 0 번째 Index 가 '3' 일 경우 현재 D3JS
		// 의 버전은 3 버전이다.
		return d3.version.indexOf('3') === 0 ? false : true;
	};
	// Dependencies 객체의 기능을 모아둔 Model 객체를 반환한다.
	return model;
};