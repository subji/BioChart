"use strict";
define("pcaplot/pca3d/event_pcaplot3d", ["utils", "size"], function(_utils, _size)	{
	return function(_renderer, _camera, _scene, _object3d, _raycaster, _ray_mouse, _event_targets, _sizes)	{
		var tooltip 		= Object.create(_utils.tooltip);
		var check_click = false;
		var ex 					= 0;
		var ey 					= 0;
		var INTERSECTED;
		var tooltip_x 	= 0, tooltip_y = 0;

		var windowMousedown =  function(_event)	{ 
			check_click = true;

			ex = _event.clientX;
			ey = _event.clientY;
		}

		var windowMouseup = function(_event)	{ 
			check_click = false;
		}

		var windowMousemove = function(_event)	{
			if(check_click)	{
				var cx = _event.clientX - ex;
				var cy = _event.clientY - ey;

				_object3d.rotation.y += cx * 0.01;
				_object3d.rotation.x += cy * 0.01;

				ex = (ex + cx);
				ey = (ey + cy);

				_renderer.render(_scene, _camera);
			}
		}

		var raytracingMousemove = function(_event)	{
			_event.preventDefault();

			_ray_mouse.x = (_event.offsetX / _sizes.rwidth) * 2 - 1;
			_ray_mouse.y = -(_event.offsetY / _sizes.rheight) * 2 + 1;
			_ray_mouse.z = 0.5;

			tooltip_x = _event.clientX;
			tooltip_y = _event.clientY;
		}

		var animate = function()	{
			requestAnimationFrame(animate);
			renderRaycaster();
		}

		var typeColor = function(_type)	{
			switch(_type)	{
				case "Primary Solid Tumor" : return "red"; break;
				case "Solid Tissue Normal" : return "blue"; break;
			}
		}

		var renderRaycaster = function()	{
			_raycaster.setFromCamera(_ray_mouse, _camera);
			var intersects = _raycaster.intersectObjects(_event_targets, false);

			if(intersects.length > 0)	{
				for(var i = 0, len = _event_targets.length ; i < len ; i++)	{
					if(_event_targets[i].uuid === intersects[0].object.uuid)	{
						var data = intersects[0].object.__data__;

						tooltip.show({ x : tooltip_x, y : tooltip_y }, 
							"<b>" + data.sample + "</b></br><b><span style=color:" + typeColor(data.type) + ";>" + data.type
							+ "</span></b></br> pc1 : " + Number(data.pc1).toFixed(5)
							+ "</br> pc2 : " + Number(data.pc2).toFixed(5)
							+ "</br> pc3 : " + Number(data.pc3).toFixed(5) 
							, "rgba(15, 15, 15, 0.6)")
					}
				}
			}
			else { 
				tooltip.hide(); 
			}
			_renderer.render(_scene, _camera);
		}

		return {
			win_m_down 					: windowMousedown 	 ,
			win_m_up 						: windowMouseup 		 ,
			win_m_move 					: windowMousemove 	 ,
			raytracingMousemove : raytracingMousemove,
			ray_render 					: renderRaycaster 	 ,
			animate 						: animate
		}
	}	
});