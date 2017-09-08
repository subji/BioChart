"use strict";
define("pcaplot/pca2d/event_pcaplot2d", ["utils", "size"], function(_utils, _size)	{
	var tooltip = Object.create(_utils.tooltip);
	
	var mouseover = function(_d)	{
		tooltip.show(this
			, "sample : " + _d.SAMPLE
			+ "</br> type : " + _d.TYPE
			+ "</br> pc1 : " + Number(_d.PC1).toFixed(5)
			+ "</br> pc2 : " + Number(_d.PC2).toFixed(5)
			+ "</br> pc3 : " + Number(_d.PC3).toFixed(5)
			, "rgba(15, 15, 15, 0.6)"
			);
	}

	var mouseout = function(_d)	{
		tooltip.hide();	
	}

	return {
		m_over : mouseover,
		m_out  : mouseout
	}
});