$(function ()	{
	$(".gridster ul").gridster({
        widget_margins				: [10, 10],
        widget_base_dimensions: [120, 150],
        min_cols							: 20,
        resize								: {
           enabled						: false
        },
  })
	.data('gridster')
	.disable();

	d3.select('svg')
		.attr('width', 680)
		.attr('height', 1000)
		.attr('viewBox', '0 0 680 1000.0001')
		.select('g')
		.attr('transform', 'translate(-170, 350)');

	var variantLiHeight = $('.gs-w-li-variant_list').height();

	$('.box-table-variant_list').height(variantLiHeight);
});