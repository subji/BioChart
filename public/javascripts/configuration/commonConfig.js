function commonConfig ()	{
	'use strict';

	var model = {};
	/*
		Ins & del => Indel 과 같은 통합 표기법 형태로
		Type 을 변경해주는 함수.
	 */
	model.typeFormat = function (type)	{
		return type.replace(
					/(_ins|_del)$/ig, '_indel').pronoun();
	};

	return function ()	{
		return model;
	};
};