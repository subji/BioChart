"use strict";
define("pcaplot/interface_pcaplot", ["utils", "size", "chart/legend/setting_legend", "pcaplot/pca2d/setting_pcaplot2d", "pcaplot/pca3d/setting_pcaplot3d"], function(_utils, _size, _setting_legend, _setting_2d, _setting_3d)	{
	var getTypeList = function(_data)	{
		var result = [], type_object = {}, type_index = 0;

		for(var i = 0, len = _data.length ; i < len ; i++)	{
			if(!type_object[_data[i].TYPE])	{
				result[type_index] = { name : _data[i].TYPE };
				type_object[_data[i].TYPE] = "T";
				type_index++;
			}
		}
		return { 
			type_list :  result 
		};
	}

	var minAndmax = function(_data, _axis)  {
		var axis_type = function()	{
			return _data.sample_list.map(function(_d)	{
				return Number(_d[_axis]);
			});
		}
		var min = d3.min(axis_type()) - 10;
		var max = d3.max(axis_type()) + 10;

		return {
			min : min,
			max : max
		};
	 }

	 var figureList = function(_type)	{
	 	switch(_type)	{
	 		case "Primary Solid Tumor" : return { figure : "circle" }; break;
	 		case "Solid Tissue Normal" : return { figure : "rect" 	}; break;
	 	}
	}

	return function(_data)	{
		d3.tsv(_data, function(_d)	{
			var data = {
				title 			: "pca_plot",
				sample_list : _d 				,
			};	
			var canvas = $("canvas");

			_utils.removeSvg("pcaplot_view_2d, pcaplot_legend")

			if(!!canvas)	{ 
				canvas.remove(); 
			}
			_setting_legend({
				data 		: getTypeList(data.sample_list),
				view_id : "pcaplot_legend" 						 ,
				type 		: "pca mutation"							 ,
				chart 	: "pcaplot"										 ,
			});

			window.location.pathname.indexOf("3d") > 0 ? 
			_setting_3d(data, minAndmax, figureList) : 
			_setting_2d(data, minAndmax, figureList);
		});
	}
});