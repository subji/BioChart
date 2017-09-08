var VO = "comutationplot/vo_comutationplot";

define(VO, ["utils"], function(_utils)	{
	var VO = (function()	{
		var init_sample = [];
		var init_gene = [];
		var sample_list = [];
		var gene_list = [];
		var init_layout_width = 0;
		var init_layout_height = 0;
		var init_layout_margin_top = 0;
		var init_layout_margin_left = 0;
		var init_layout_margin_bottom = 0;
		var init_layout_margin_right = 0;
		var layout_width = 0;
		var layout_height = 0;
		var layout_margin_top = 0;
		var layout_margin_left = 0;
		var layout_margin_bottom = 0;
		var layout_margin_right = 0;

		return {
			setInitSample : function(_init_sample) 	{
				init_sample = _init_sample;
			},
			setSample : function(_sample_list) 	{
				sample_list = _sample_list;
			},
			setInitGene : function(_init_gene) 	{
				init_gene = _init_gene;
			},
			setGene : function(_gene_list) {
				gene_list = _gene_list;
			},
			setInitWidth : function(_init_layout_width)	{
				init_layout_width = _init_layout_width;
			},
			setInitHeight : function(_init_layout_height)	{
				init_layout_height = _init_layout_height;
			},
			setInitMarginTop : function(_init_layout_margin_top)	{
				init_layout_margin_top = _init_layout_margin_top;
			},
			setInitMarginBottom : function(_init_layout_margin_bottom)	{
				init_layout_margin_bottom = _init_layout_margin_bottom;
			},
			setInitMarginLeft : function(_init_layout_margin_left)	{
				init_layout_margin_left = _init_layout_margin_left;
			},
			setInitMarginRight : function(_init_layout_margin_right)	{
				init_layout_margin_right = _init_layout_margin_right;
			},
			setWidth : function(_layout_width)	{
				layout_width = _layout_width;
			},
			setHeight : function(_layout_height)	{
				layout_height = _layout_height;
			},
			setMarginTop : function(_layout_margin_top)	{
				layout_margin_top = _layout_margin_top;
			},
			setMarginBottom : function(_layout_margin_bottom)	{
				layout_margin_bottom = _layout_margin_bottom;
			},
			setMarginLeft : function(_layout_margin_left)	{
				layout_margin_left = _layout_margin_left;
			},
			setMarginRight : function(_layout_margin_right)	{
				layout_margin_right = _layout_margin_right;
			},
			getInitSample : function()	   {	
				return init_sample;
			},
			getInitGene : function()	{
				return init_gene;
			},
			getSample : function()	   {
				return sample_list;
			},
			getGene : function()	{
				return gene_list;
			},
			getInitWidth : function()	{
				return init_layout_width;
			},
			getInitHeight : function()	{
				return init_layout_height;
			},
			getInitMarginTop : function()	{
				return init_layout_margin_top;
			},
			getInitMarginBottom : function()	{
				return init_layout_margin_bottom;
			},
			getInitMarginLeft : function()	{
				return init_layout_margin_left;
			},
			getInitMarginRight : function()	{
				return init_layout_margin_right;
			},
			getGene : function()	{
				return gene_list;
			},
			getWidth : function()	{
				return layout_width;
			},
			getHeight : function()	{
				return layout_height;
			},
			getMarginTop : function()	{
				return layout_margin_top;
			},
			getMarginBottom : function()	{
				return layout_margin_bottom;
			},
			getMarginLeft : function()	{
				return layout_margin_left;
			},
			getMarginRight : function()	{
				return layout_margin_right;
			}
		}
	}());
	return 	{
		VO : VO
	}
});