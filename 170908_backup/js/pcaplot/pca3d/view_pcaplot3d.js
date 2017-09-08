"use strict";
define("pcaplot/pca3d/view_pcaplot3d", ["utils", "size", "pcaplot/pca3d/event_pcaplot3d"], function(_utils, _size, _event)	{
	var view = function(_data)	{
		var size  				= _data.size;
		var default_axis 	= { x : 0.5, y : -0.5, z : 0 };
		var event_targets = [];
		var renderer 			= new THREE.WebGLRenderer({
			antialias : true, alpha : true
		});

		var camera = new THREE.OrthographicCamera(
			(size.rwidth / -2), (size.rwidth / 2)  ,
			(size.rheight / 2), (size.rheight / -2), -5000, 10000);

		var scene 		= new THREE.Scene();
		var object3d 	= new THREE.Object3D();
		var raycaster = new THREE.Raycaster();
		var ray_mouse = new THREE.Vector3();

		renderer.setSize(size.rwidth, size.rheight);
		renderer.setClearColor(0xFFFFFF);

		_data.div.appendChild(renderer.domElement);

		object3d.rotation.x = default_axis.x;
		object3d.rotation.y = default_axis.y;
		object3d.rotation.z = default_axis.z;

		scene.add(object3d);

		var border_geometry = new THREE.Geometry();

		border_geometry.vertices.push(
			_data.vector(_data.x(_data.min.x), _data.y(_data.min.y), _data.z(_data.min.z)),
			_data.vector(_data.x(_data.max.x), _data.y(_data.min.y), _data.z(_data.min.z)),
			_data.vector(_data.x(_data.max.x), _data.y(_data.max.y), _data.z(_data.min.z)),
			_data.vector(_data.x(_data.min.x), _data.y(_data.max.y), _data.z(_data.min.z)),
			_data.vector(_data.x(_data.min.x), _data.y(_data.min.y), _data.z(_data.min.z)),
			_data.vector(_data.x(_data.min.x), _data.y(_data.min.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.min.x), _data.y(_data.max.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.min.x), _data.y(_data.max.y), _data.z(_data.min.z)),
			_data.vector(_data.x(_data.min.x), _data.y(_data.max.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.max.x), _data.y(_data.max.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.max.x), _data.y(_data.max.y), _data.z(_data.min.z)),
			_data.vector(_data.x(_data.max.x), _data.y(_data.max.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.max.x), _data.y(_data.min.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.max.x), _data.y(_data.min.y), _data.z(_data.min.z)),
			_data.vector(_data.x(_data.max.x), _data.y(_data.min.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.max.x), _data.y(_data.max.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.min.x), _data.y(_data.max.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.min.x), _data.y(_data.min.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.max.x), _data.y(_data.min.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.min.x), _data.y(_data.min.y), _data.z(_data.max.z)),
			_data.vector(_data.x(_data.min.x), _data.y(_data.min.y), _data.z(_data.min.z))
			);

		var border_material = new THREE.LineBasicMaterial({
			color : 0x515151, lineWidth : 1
		});

		var border = new THREE.Line(border_geometry, border_material);
		border.type = THREE.Lines;

		object3d.add(border);

		for (var i = 0, len = _data.data.sample_list.length; i < len; i ++) {
			var posX   = _data.x(Number(_data.data.sample_list[i].PC1));
			var posY   = _data.y(Number(_data.data.sample_list[i].PC2));
			var posZ 	 = _data.z(Number(_data.data.sample_list[i].PC3));
			var figure = _data.figure(_data.data.sample_list[i].TYPE);

			d3.select(figure).datum({
				sample : _data.data.sample_list[i].SAMPLE 		,
				type 	 : _data.data.sample_list[i].TYPE 			,
				pc1 	 : Number(_data.data.sample_list[i].PC1),
				pc2 	 : Number(_data.data.sample_list[i].PC2),
				pc3 	 : Number(_data.data.sample_list[i].PC3)
			});

			figure.position.set(posX, posY, posZ);

			event_targets.push(figure);
			object3d.add( figure );
		}

		var label_x = _data.text("PC1(X-axis)");
		label_x.position.x = (_data.square.x.end - _data.square.x.start) / 2;
		label_x.position.y = (_data.square.y.start - (size.margin.top + size.margin.bottom));
		label_x.position.z = (_data.square.z.start);

		object3d.add(label_x);

		var label_y = _data.text("PC2(Y-axis)");
		label_y.position.x = (_data.square.x.start - (size.margin.left + size.margin.right));
		label_y.position.y = (_data.square.y.end - _data.square.y.start) / 2;
		label_y.position.z = (_data.square.z.start);

		object3d.add(label_y);

		var label_z = _data.text("PC3(Z-axis)");
		label_z.position.x = (_data.square.x.start - (size.margin.left + size.margin.right));
		label_z.position.y = (_data.square.y.start - (size.margin.top + size.margin.bottom));
		label_z.position.z = (_data.square.z.end - _data.square.z.start) / 2;

		object3d.add(label_z);

		var xAxis = _data.scale(Math.floor(_data.min.x), Math.floor(_data.max.x), 5);
		var yAxis = _data.scale(Math.floor(_data.min.y), Math.floor(_data.max.y), 5);
		var zAxis = _data.scale(Math.floor(_data.min.z), Math.floor(_data.max.z), 5);

		_data.axis(object3d, xAxis, {
			x : _data.x,
			y : (_data.square.y.start - size.margin.top),
			z : (_data.square.z.start)
		});

		_data.axis(object3d, yAxis, {
			x : (_data.square.x.start - size.margin.left),
			y : _data.y,
			z : (_data.square.z.start)
		});

		_data.axis(object3d, zAxis, {
			x : (_data.square.x.start - size.margin.left),
			y : (_data.square.y.start - size.margin.top),
			z : _data.z
		});

		var e = _event(renderer, camera, scene, object3d, raycaster, ray_mouse, event_targets, size) || null;
		window.onmousedown = e.win_m_down;
		window.onmouseup   = e.win_m_up;
		window.onmousemove = e.win_m_move;

		$("#pcaplot_view_3d canvas")
		.on("mousemove", e.raytracingMousemove);

		renderer.render(scene, camera);

		e.ray_render();
		e.animate();
	}

	return {
		view : view
	}
});