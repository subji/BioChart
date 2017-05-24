'use strict';

var size = {};

size.setMargin = function (margin)	{
	if (typeof margin === 'number')	{
		return { top: margin, left: margin, bottom: margin, right: margin };
	} else {
		switch(margin.length)	{
			case 1: return { top: margin[0], left: margin[0], bottom: margin[0], right: margin[0] }; break;
			case 2: return { top: margin[0], left: margin[1], bottom: margin[0], right: margin[1] }; break;
			case 3: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[1] }; break;
			case 4: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[3] }; break;
			default: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[3] }; break;
		}
	}
};

size.chart = {};

size.chart.mutualExt = function (dom, width, height)	{
	dom.style.width = width + 'px';
	dom.style.height = height + 'px';

	return {
		survival: {w: (width * 0.3), h: height},
		selectBox: {w: (width * 0.7), h: (height * 0.05)},
		separateBar: {w: (width * 0.7), h: (height * 0.05)},
		group: {w: (width * 0.7), h: (height * 0.4)},
		network: {w: (width * 0.7) * 0.3, h: (height * 0.5)},
		heatmap: {w: (width * 0.7) * 0.7, h: (height * 0.5)},
	};
};