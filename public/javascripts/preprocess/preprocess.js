function preprocess ()	{
	'use strict';
	// bio 전역객체는 반드시 함수형태에서만 불러올 수 있다.
	return function (chart)	{
		return {
			pathway: bio.preprocPathway,
			variants: bio.preprocVariants,
			landscape: bio.preprocLandscape,
			expression: bio.preprocExpression,
			exclusivity: bio.preprocExclusivity,
		}[chart];
	};
};