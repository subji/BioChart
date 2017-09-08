'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('tooltip', [], factory);
	} else {
		factory(tooltip);
	}

} (function ()	{
	var getOnlyNumber = function (str)	{
		return +(str.replace(/\D/, ''));
	}

	return {
		'main' 	: $('#maincontent'),
		'chart' : $('.tooltip_chart'),
		'show' 	: function (ele, txt, rgba) {
			var body   = document.body.getBoundingClientRect();
			var cli 	 = ele.getBoundingClientRect();
			var top 	 = (cli.top + cli.height) + (body.top < 0 ? (body.top / 1.5 * -1) : 0);
			var left 	 = cli.left + cli.width;
			var ml     = this.main.css('margin-left');
			var margin = ml ? getOnlyNumber(ml) : 0;

			// console.log(body, cli, top)

			if ((cli.left - margin + cli.width
			 + this.chart.width()) > this.main.width()) {
				left = (cli.left - this.chart.width());
			}

			if ((cli.bottom + cli.height) > this.main.height())	{
				top  = ((cli.top - cli.height) 
						 - (cli.bottom + cli.height - this.main.height()));
			}

			this.chart.css({
				 		'position' 					: 'absolute',
				 		'background-color' 	: rgba			,
				 		'left' 							: left 			,
				 		'top' 							: top 			,
				 	})
				 	.html(txt)
				 	.show();
		},
		'hide' 	: function () {
			this.chart.hide();
		}
	};
}));