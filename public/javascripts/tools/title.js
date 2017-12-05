function title ()	{
	'use strict';

	var model = {};
	/*
		각 차트의 제목을 생성해주는 함수.
	 */
	return function (element, text)	{
		var target = bio.dom().get(element),
				width = parseFloat(target.style.width),
				height = parseFloat(target.style.height);

		// Set title text.
		target.innerHTML = text;
		// >>> Setting style for title.
		target.style.fontSize = bio.drawing().fitText(
														text, width, height, 'bold');
		target.style.lineHeight = target.style.height;
	};
};