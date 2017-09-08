"use strict";
define("pcaplot/pca3d/setting_pcaplot3d", ["utils", "size", "pcaplot/pca3d/view_pcaplot3d"], function(_utils, _size, _view)	{
	return function(_data, _min_max)	{
		var size = _size.initSize("pcaplot_view_3d", 30, 30, 30, 30);
		var x_minmax = _min_max(_data, "PC1");
		var y_minmax = _min_max(_data, "PC2");
		var z_minmax = _min_max(_data, "PC3");
		var square_size = {
			x : { start : -170, end : 170 },
			y : { start : -170, end : 170 },
			z : { start : -170, end : 170 },
		};
		var x = _utils.linearScale(x_minmax.min, x_minmax.max, square_size.x.start, square_size.x.end);
		var y = _utils.linearScale(y_minmax.min, y_minmax.max, square_size.y.start, square_size.y.end);
		var z = _utils.linearScale(z_minmax.min, z_minmax.max, square_size.z.start, square_size.z.end);

		var vector = function(_x, _y, _z)	{
			return new THREE.Vector3(_x, _y, _z);
		}

		var createFigureCanvas = function()	{
			var canvas 				= document.createElement("canvas");
					canvas.width  = 10;
					canvas.height = 10;

			return canvas;
		}

		var drawRect = function(_color)		{
			var canvas  					= createFigureCanvas();
			var context 				  = canvas.getContext("2d");
					context.fillStyle = _color;
					context.fillRect(0,0,10,10);

			return canvas;
		}
		var drawCircle = function(_color)	{
			var radius  = 5;
			var canvas  = createFigureCanvas();
			var context = canvas.getContext("2d");
					context.beginPath();
					context.arc(5, 5, radius, 0, 2 * Math.PI, false);
					context.fillStyle = _color;
					context.fill();

			return canvas;
		}
		var drawTriangle = function(_color)	{
			var canvas  = createFigureCanvas();
			var context = canvas.getContext("2d");
			var path 		= new Path2D();

			path.moveTo(0, 5);
			path.lineTo(5, 10);
			path.lineTo(5, 0);
			path.closePath();

			context.fillStyle = _color;
			context.fill(path);

			return canvas;
		}

		var figureType = function(_type)	{
			switch(_type)	{
				case "Primary Solid Tumor" : return drawCircle(_utils.mutate(_type).color); break;
				case "Solid Tissue Normal" : return drawRect(_utils.mutate(_type).color); break;
			}
		}

		var createTextCanvas = function(_text)	{
			var font_size 			 = (_text.constructor === String) ? 15 		: 12;
			var font_weight 		 = (_text.constructor === String) ? "bold" : "none";
			var canvas 					 = document.createElement("canvas");
			var canvasText  		 = canvas.getContext('2d');
			var font_definition  = font_weight + " " + font_size + "px Arial";

			canvasText.font 		 = font_definition;

			var canvasTextWidth  = canvasText.measureText(_text).width;
			var canvasTextHeight = Math.ceil(font_size);

			canvas.width  = canvasTextWidth;
			canvas.height = canvasTextHeight;

			canvasText.font 		 = font_definition;
			canvasText.fillStyle = (_text.constructor === String) ? "black" : 0xFF0000;
			canvasText.fillText(_text, 0, font_size);

			return canvas;
		}

		var createCanvas = function(_canvas)	{
			var canvas  = _canvas;
			var plane   = new THREE.PlaneBufferGeometry(canvas.width, canvas.height);
			var texture = new THREE.Texture(canvas);

			texture.needsUpdate = true;
			texture.minFilter 	= THREE.LinearFilter;

			var spriteMaterial = new THREE.SpriteMaterial({ map : texture });
			var sprite 				 = new THREE.Sprite(spriteMaterial);
					sprite.scale.set(canvas.width, canvas.height, 1);

			return sprite;
		}

		var createFigure = function(_figure)	{
			return createCanvas(figureType(_figure));
		}

		var createText = function(_text)	{
			return createCanvas(createTextCanvas(_text));
		}

		var reformValue = function(_json, _value)	{
			return (_json.constructor === Function) ? _json(_value) : _json;
		}

		var mkAxis = function(_scene, _axis_list, _position)	{
			var result;

			for(var i = 0, len = _axis_list.length ; i < len ; i++)	{
				result = createText(_axis_list[i]);
				result.position.x = reformValue(_position.x, _axis_list[i]);
				result.position.y = reformValue(_position.y, _axis_list[i]);
				result.position.z = reformValue(_position.z, _axis_list[i]);

				_scene.add(result);
			}
		}

		var calculatedAxis = function(_period, _min, _max)	{
			var result = [];

			for(var i = _min, len = _max ; i < len ; i++)	{
				if(i % _period === 0)	{ result.push(i); }
			}
			return result;
		}

		var setAxisList = function(_min, _max, _count)	{
			var number_cal 	 	= Math.floor((_max - _min) / _count);
			var number_format = number_cal * .1;
			var number_period = (number_format & 2 === 0 
												? Math.ceil(number_format + 0.1) 
												: Math.ceil(number_format)) * 10;

			return calculatedAxis(number_period, _min, _max);
		}

		_view.view({
			data : _data,
			size : size,
			square : square_size,
			div : document.querySelector("#pcaplot_view_3d"),
			max : {
				x : x_minmax.max,
				y : y_minmax.max,
				z : z_minmax.max
			},
			min : {
				x : x_minmax.min,
				y : y_minmax.min,
				z : z_minmax.min
			},
			x : x,
			y : y,
			z : z,
			vector : vector 		 ,
			figure : createFigure,
			text 	 : createText  ,
			scale  : setAxisList ,
			axis   : mkAxis
		});
	}
});