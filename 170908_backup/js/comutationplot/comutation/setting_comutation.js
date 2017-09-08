var COMUTATION = "comutationplot/comutation/";
var VO = "comutationplot/vo_comutationplot";

define(COMUTATION + "setting_comutation", ["utils", "size", COMUTATION + "view_comutation", VO], function(_utils, _size, _view, _VO)	{
	return function(_all_data, _samples, _genes, _data)	{
		var size = _size.initSize("comutationplot_heatmap", 20, 20, 20, 20);

		_VO.VO.setInitWidth(size.width);
		_VO.VO.setInitHeight(size.height);
		_VO.VO.setInitMarginTop(size.margin.top);
		_VO.VO.setInitMarginBottom(size.margin.bottom);
		_VO.VO.setInitMarginLeft(size.margin.left);
		_VO.VO.setInitMarginRight(size.margin.right);

		_VO.VO.setWidth(size.width - 2);
		_VO.VO.setHeight(size.height);
		_VO.VO.setMarginTop(size.margin.top);
		_VO.VO.setMarginBottom(size.margin.bottom);
		_VO.VO.setMarginLeft(size.margin.left);
		_VO.VO.setMarginRight(size.margin.right);

		_utils.removeSvg("comutationplot_heatmap");
		
		_view.view({
			data : _data.data,
			all_data : _all_data,
			samples : _samples,
			genes : _genes,
			size : size,
			x : _utils.ordinalScale(_samples, size.margin.left, size.width - size.margin.left),
			y : _utils.ordinalScale(_genes, size.margin.top, (size.height - size.margin.top))
		});
	}
});