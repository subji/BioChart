var COMUTS_NAVI = "comutationplot/navigation/";

define(COMUTS_NAVI + "setting_comutationnavigation", ["utils", "size", COMUTS_NAVI + "view_comutationnavigation"], function(_utils, _size, _view)	{
	return function(_samples, _genes)	{
		var size = _size.initSize("mutation_view_navigation", 20, 20, 20, 20);

		_view.view({
			samples : _samples,
			genes : _genes,
			size : size
		})
	}
});