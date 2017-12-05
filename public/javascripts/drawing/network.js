function network ()	{
	'use strict';

	var model = {};
	/*
		Version 3/4 에 따라서 force 함수가 변경되었다.
	 */
	function v3 (nodes, links)	{
		return d3.layout.force()
										.nodes(nodes)
										.links(links)
										.charge(-300)
										.linkDistance(150);
	};

	function v4 (nodes, links)	{
		return d3.forceSimulation(nodes) 
      			 .force('charge',
      			 	d3.forceManyBody().strength(function (d, i)	{
      			 		return d.group ? 
      			 		-300 - (600 * (d.radius / 100)) : 
      			 		-300 - (600 * (d.radius / 100));
      			 	}))
      			 .force('link', 
      			 	d3.forceLink(links)
      			 		.id(function(d) { return d.text; })
      			 		.distance(function (d)	{
      			 			return d.source.group && d.target.group ? 
      			 						90 - (90 * (d.source.radius / 100)) : 
      			 						d.isOne === 1 ? 
      			 						10 + (1050 * (d.source.radius / 100)) : 
      			 						190 - (190 * (d.source.radius / 100));
      			 		})) 
      			 .force('x', d3.forceX(function (d)	{
      			 		return d.group ? model.width / 2.1 : 
      			 			model.width - model.width * (d.index / 10);
      			 }))
      			 .force('y', d3.forceY(function (d)	{
      			 		return d.group ? model.height / 2.5 : 
      			 										 model.height * 0.95;
      			 }));
	};

	function buildArea (className, top, left, width, height)	{
		var g = bio.rendering().addGroup(
						model.element, 0, 0, className);

		bio.rectangle({
			id: className,
			element: g,
			attr: {
				rx: 2, 
				ry: 2, 
				y: top,
				x: left, 
				width: width, 
				height: height,
			},
			style: {
				strokeWidth: 2,
				fill: '#FFFFFF',
				stroke: '#333333',
				filter: 'url("#drop_shadow")',
				fillOpacity: function (d)	{
					return className === 'compound' ? 1 : 0.3;
				},
			},
		}, model);
	};

	function writeInfo (text, top, left)	{
		var g = bio.rendering().addGroup(
						model.element, 0, 0, 'network-info');

		bio.text({
			element: g,
			text: text,
			id: 'network_info',
			attr: { x: left, y: top },
			style: { fontSize: '16px', fontWeight: 'bold' },
		});
	};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.bcr = model.element.node().getBoundingClientRect();
		model.network_data = opts.data;
		model.arrow_width = 5;

		var compound = null,
				nodes = [],
				links = [];
		// Compound, Nodes, Links 분류 작업.
		bio.iteration.loop(model.network_data, function (net)	{
			net.type === 'compound' ? compound = net : 
			net.type === 'node' ? nodes.push(net) : links.push(net);
		});
		// Member 는 그룹으로 분류.
		bio.iteration.loop(nodes, function (node)	{
			if (compound.members.indexOf(node.text) > -1)	{
				node.group = 1;
			}
			// 노드의 위치 고정 및 반지름 크기 설정.
			// node.fixed = true;
			node.radius = (bio.drawing().textSize
							.width(node.text, '12px') + 10) / 2;
		});
		// 여러개의 노드가 오직 하나의 선을 가지며 그 선은 오로지
		// 그룹 밖의 노드로 향할때.
		var linkIsOne = {};

		bio.iteration.loop(links, function (link)	{
			linkIsOne[link.target] = true;
		});

		bio.iteration.loop(links, function (link)	{
			link.isOne = Object.keys(linkIsOne).length;
		});
		// Grouping, Information 영역 설정 및 Line 의 marker 설정.
		bio.rendering().dropShadow(
					model.element.append('svg:defs'), 1, -0.1, 1);
		bio.rendering().marker({
			id: 'id',
			data: links,
			color: 'linecolor',
			width: model.arrow_width,
			height: model.arrow_width,
			svg: model.element.append('svg:defs'),
		});
		buildArea('infomation', model.height * 0.05, 10, 
					model.width - 20, model.height * 0.1);
		buildArea('compound', model.height * 0.15, 10, 
				model.width - 20, model.height * 0.54);
		writeInfo(compound.text, 
			model.height * 0.105, model.width / 2 - 
			bio.drawing().textSize.width(compound.text, '16px') / 2);
		// Force layout 생성.
		var force = bio.dependencies.version.d3v4() ? 
								v4(nodes, links) : v3(nodes, links);
		// Animation 없이 draw.
		for (var i = 0, n = 
			Math.ceil(Math.log(force.alphaMin()) /
			Math.log(1 - force.alphaDecay())); i < n; ++i) {
	    force.tick();
	  }
	  // Link 와 Node 의 그룹 태그 생성.
		var linkLayer = bio.rendering().addGroup(
					model.element, 0, 0, 'link-layer'),
				nodeLayer = bio.rendering().addGroup(
					model.element, 0, 0, 'node-layer');

		var link = linkLayer.selectAll('.link')
												.data(links).enter()
												.append('svg:path')
												.attr('class', 'link')
												.attr('marker-end', function (d)	{
													return 'url("#marker_' + d.id + '")';
												})
												.style('fill', '#FFFFFF')
												.style('fill-opacity', 0.1)
												.style('stroke', function (d)	{
													return d.linecolor;
												})
												.style('stroke-width', 1.5)
												.style('stroke-dasharray', function (d)	{
													return d.style === 'Dashed' ? '3, 3' : 'none';
												});

		var node = nodeLayer.selectAll('.node')
												.data(nodes)
												.enter().append('g')
												.attr('class',' node');

		node.append('circle')
				.attr('r', function (d)	{
					return (bio.drawing().textSize
										 .width(d.text, '12px') + 10) / 2;
				})
				.attr('fill', function (d)	{ return d.bgcolor; })
				.attr('stroke', '#333333')
				.attr('stroke-width', 1);

		node.append('text')
				.attr('dx', 0)
				.attr('dy', 5)
				.attr('text-anchor', 'middle')
				.style('font-size', '12px')
				.style('font-weight', 'bold')
				.text(function (d)	{ return d.text; });
		// Force.tick() 함수로 호출되는 함수.
		var ticked = force.on('tick', function ()	{
			node.attr('transform', function (d, i)	{
				d.x = d.group ? d.x : model.width / 2.5;
				d.y = d.group ? d.y : model.height * 0.78;
			});

			link.attr('d', function (d)	{
				// 타겟 원의 테두리로 화살표가 닿게끔 하는 코드.
				var dx = d.target.x - d.source.x,
						dy = d.target.y - d.source.y,
						dr = Math.sqrt(dx * dx + dy * dy);

				var offsetX = dx * (d.target.radius + 
											model.arrow_width) / dr,
						offsetY = dy * (d.target.radius + 
											model.arrow_width) / dr;

				return 'M' + d.source.x + ',' + d.source.y + 
							 'A' + dr + ',' + dr + ' 0 0,1 ' + 
          					(d.target.x - offsetX) + ',' + 
          					(d.target.y - offsetY);
			});

			node.attr('transform', function (d)	{
				return 'translate(' + d.x + ',' + d.y + ')';
			});
		});
	};
};