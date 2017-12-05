function preprocPathway ()	{
	'use strict';

	var model = {};

	return function (data)	{
		console.log('>>> Preprocess pathway data: ', data);
		console.log('>>> Preprocess data: ', model);

		return model;
	};
};