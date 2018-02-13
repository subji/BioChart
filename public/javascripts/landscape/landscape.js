function landscape ()	{
	'use strict';

	var model = {};
	/*
		Landscape 의 초기 가로, 세로 길이를 설정해주는 함수.
	 */
	function defaultSize (init)	{
		// 기준은 '#landscape_heatmap' 태그로 한다.
		var def = bio.dom().get('#landscape_heatmap');
		// model.init.width & height 설정.
		// init.width = parseFloat(def.style.width) * 2;
		// 2018.01.02 Paper support 코드.
		init.width = parseFloat(def.style.width);
		init.height = parseFloat(def.style.height);
	};
	/*
		enable/disable, refresh 등의 작업을 할 때, sample 의
		데이터와 축이 변경되게 하는 함수이다.
	 */
	function changeSampleStack (mutationList)	{
		var changedSampleStack = model.data.iterMut([
			{ 
				obj: {}, data: 'participant_id', 
				type: 'type', keyName: 'sample' 
			}
		], mutationList);
		var changeSampleStacks = model.data.byStack([], 'sample', 
					changedSampleStack.result.sample),
				reloadSampleAxis = model.data.makeLinearAxis(
					'sample', changeSampleStacks.axis);

		model.data.axis.sample.y = reloadSampleAxis;
		model.data.stack.sample = changeSampleStacks.data;
	};
	/*
		Landscape scale option group 을 그리는 함수.
	 */
	function drawScaleSet (setting)	{
		bio.scaleSet({
			element: '#landscape_option',
			defaultValue: model.init.width,
			change: function (event, data)	{
				bio.layout().removeGroupTag('survival');

				if (data.type === 'refresh')	{
					changeAxis({ axis: 'x', data: model.init.axis.x });
					changeAxis({ axis: 'y', data: model.init.axis.y });
					changeSampleStack(model.init.mutation_list);

					model.data.gene = model.init.axis.y;

					bio.iteration.loop(model.init.geneline.axis, function (key, value)	{
						value.isGene = 'enable';
					});

					model.now.geneline.axis = 
					bio.objects.clone(model.init.geneline.axis);
					model.now.geneline.sortedSiblings = 
					model.init.geneline.sortedSiblings;

					bio.layout().removeGroupTag('survival');

					return drawLandscape(model.data, 
					(model.now.width = model.init.width, model.now.width));
				} 

				return drawLandscape(model.data, 
					(model.now.width = data.value, model.now.width));
			},
		});
	};
	/*
	 Exclusivity 타입을 바꿔 주는 함수.
	 */
	function changeExclusivityOption ()	{
		$('input[type="radio"]').change(function (e)	{
			model.now.exclusivity_opt = this.value;

			bio.layout().removeGroupTag('survival');

			drawExclusivityLandscape(this.value);
		});
	};

	function makeInputLabel (type)	{
		var label = document.createElement('label'),
				input = document.createElement('input');

		input.id = 'option_' + type;
		input.setAttribute('type', 'radio');
		input.setAttribute('name', 'options');
		input.setAttribute('value', type);
		input.setAttribute('autocomplete', 'off');
		input.checked = type === '1' ? true : false;

		label.className = 'btn btn-default btn-sm' 
										+ (type === '1' ? ' active' : '');
		label.innerText = 'TYPE ' + type;
		label.appendChild(input);

		return label;
	}

	function drawExclusivity ()	{
		var base = document.querySelector('#landscape_option'),
				exclusivity = document.createElement('div'),
				btnGroup = document.createElement('div'),
				label = document.createElement('div'),
				opt1 = makeInputLabel('1'),
				opt2 = makeInputLabel('2');

		btnGroup.id = 'option_group';
		btnGroup.className = 'btn-group';
		btnGroup.setAttribute('data-toggle', 'buttons');

		btnGroup.appendChild(opt1);
		btnGroup.appendChild(opt2);

		label.id = 'option_label';
		label.innerHTML = 'Exclusivity';

		base.appendChild(label);
		base.appendChild(btnGroup);
		base.appendChild(exclusivity);

		model.init.exclusivity_opt = '1';
	};
	/*
		Group 내에 만들어진 임시 svg 를 삭제하는 함수.
		이는 setting 객체가 완성된 후에 실행되어야 한다.
		이유는 setting 객체에서 layout 을 만들어야 svg 가 생성되기
		때문이다.
	 */
	function removeGroupTempSVG ()	{
		d3.selectAll('#landscape_group_svg, ' + 
								 '#landscape_axis_group_svg, ' + 
								 '#landscape_patient_group_svg').remove();
	};
	/*
		Type 배열을 Priority 순으로 정렬한다.
	 */
	function orderByTypePriority (types)	{
		types = types.sort(function (a, b)	{
			return bio.boilerPlate.variantInfo[a].order > 
						 bio.boilerPlate.variantInfo[b].order ? 1 : -1;
		});
	};
	/*
		Patient axis 를 다시 만들어 준다.
	 */
	function patientAxis (axis)	{
		// Heatmap 쪽 patient axis.
		axis.patient.heatmap = {
			x: axis.patient.x,
			y: axis.gene.y,
		};
		// Group 쪽 patient axis.
		axis.patient.group = {
			x: ['NA'],
			y: axis.group.y,
		};
		// Sample 쪽 patient axis.
		axis.patient.sample = {
			x: axis.patient.x,
			y: axis.sample.y,
		};
	};
	/*
		Heatmap 을 exclusive 하게 그려주는 함수.
	 */
	function changeAxis (data)	{
		var first = data.axis === 'x' ? 'group' : 'pq',
				secnd = data.axis === 'x' ? 'sample' : 'gene';

		model.data.axis[first][data.axis] = data.data;
		model.data.axis[secnd][data.axis] = data.data;
		model.data.axis.heatmap[data.axis] = data.data;
	};
	/*
		Sample, Group, Heatmap 의 가로 길이를 설정하는 함수.
	 */
	function setWidth (width)	{
		bio.layout().get(model.setting.svgs, ['e_gr', 'e_s', 'e_h'],
		function (id, svg)	{
			svg.attr('width', width || model.now.width || 
																 model.init.width);
		});
	};
	/*
		Click 이벤트로 변경된 정렬대로 다시 그려주는 함수.
	 */
	function redraw (result, mutationList)	{
		if (!result)	{ return false;}

		model = result.model;

		bio.layout().removeGroupTag('survival');
		changeAxis(result.sorted);
		drawLandscape(model.data, model.now.width);

		if (Object.keys(
			model.now.geneline.removedMutationObj).length > 0)	{
			enableDisableBlur();
			enabledDisabeldMaximumElement(mutationList);	
		}
	};
	/*
		Drag 와 Drag end 에서 모두 사용되는 함수.
		위 또는 아래 gene 의 반이상의 영역을 넘어갔을 경우
		해당 gene 과 현재 gene 을 스위칭해주는 함수.
		이는 gene 뿐 아니라 gene 이 속한 모든 라인을 변경해준다.
		이때 gene list 가 Drag end 가 되었을 경우만 변경된다.
	 */
	function geneDragMove (d)	{
		model.now.geneline.isDraggable = true;

		var that = this.parentNode;
		var nowTranslate = d3.select(that)
												 .attr('transform')
												 .replace(/translate\(|\)/ig, '')
												 .split(',');
		
		var nowIdx = model.data.gene.indexOf(d),
				yAxis = Math.max(model.init.geneline.firstYAxis,
								Math.min((
									parseFloat(nowTranslate[1]) + d3.event.y),
									model.init.geneline.lastYAxis));
		// disable 된 gene line 은 드래그를 막는다.
		if (model.now.geneline.axis[d].isGene === 
				'disable')	{
			return false;			
		}

		d3.select(that)
			.attr('transform', 'translate(0, ' + yAxis + ')');

		var beforeGene = model.data.gene[nowIdx - 1],
				nextGene = model.data.gene[nowIdx + 1],
				tempGene = model.data.gene[nowIdx],
				tempParent = this.parentNode,
				tempVal = model.now.geneline.axis[d].value,
				direction = d3.event.sourceEvent.movementY > -1 ? 1 : -1;

		beforeGene = !beforeGene ? tempGene : beforeGene;
		nextGene = !nextGene ? tempGene : nextGene;

		function moveElement(tthat, direction, targetGene, nowIdx, tempVal, tempGene)	{
			if (model.now.geneline.axis[targetGene].isGene === 'disable')	{
				return false;
			}

			model.now.geneline.axis[d].idx += direction;
			model.now.geneline.axis[d].value = 
			model.now.geneline.axis[targetGene].value;

			model.now.geneline.axis[targetGene].idx -= direction;
			model.now.geneline.axis[targetGene].value = tempVal;

			d3.select(model.now.geneline.sortedSiblings[
								model.data.gene.indexOf(targetGene)])
				.attr('transform', 'translate(0, ' + 
					model.now.geneline.axis[d].value + ')')
				.transition()
				.attr('transform', 'translate(0, ' + 
					model.now.geneline.axis[targetGene].value + ')');

			model.data.gene[nowIdx] = 
			model.data.gene[nowIdx + direction];
			model.data.gene[nowIdx + direction] = tempGene;

			model.now.geneline.sortedSiblings[nowIdx] = 
			model.now.geneline.sortedSiblings[nowIdx + direction];
			model.now.geneline.sortedSiblings[nowIdx + direction] = tempParent;
		};

		if ((yAxis > model.now.geneline.axis[nextGene].value - 
								 model.init.geneline.axisHalfHeight) && 
				tempVal !== model.now.geneline.axis[nextGene].value)	{
			moveElement(that, direction, nextGene, nowIdx, tempVal, tempGene);
		} else if ((yAxis < model.now.geneline.axis[beforeGene].value + 
												model.init.geneline.axisHalfHeight) && 
						tempVal !== model.now.geneline.axis[beforeGene].value)	{
			moveElement(that, direction, beforeGene, nowIdx, tempVal, tempGene);
		}
	};

	function geneDragEnd (d)	{
		if (model.now.geneline.isDraggable)	{
			var type = model.now.exclusivity_opt ? 
								 model.now.exclusivity_opt : 
								 model.init.exclusivity_opt;

			bio.layout().removeGroupTag([
				'.landscape_heatmap_svg.heatmap-g-tag',
				'.landscape_gene_svg.bar-g-tag',
				'.landscape_gene_svg.right-axis-g-tag'
			]);

			model.exclusive.now = bio.landscapeSort().exclusive(
				model.data.heatmap, model.data.gene, type);

			if (model.now.geneline.groupList)	{
				var groups = [];

				model.now.geneline.pidList = remakeMutationList();

				bio.iteration.loop(model.now.geneline.pidList.arr, function (gl)	{
					groups = groups.concat(gl.data);
				});

				changeAxis({ axis: 'x', data: groups });
			} else {
				changeAxis(model.now.geneline.groupList || 
								 	 model.exclusive.now);
			}

			model.data.axis.gene.y = model.data.gene;
			model.data.axis.heatmap.y = model.data.gene;
			model.data.axis.pq.y = model.data.gene;

			drawAxis('gene', 'Y');
			drawBar('pq', model.data.pq, 
							model.data.axis.pq, ['top', 'left']);
			drawBar('gene', model.data.stack.gene, 
							model.data.axis.gene, ['top', 'left']);
			drawHeatmap('heatmap', model.data.heatmap, 
									model.data.axis.heatmap);	

			genelineSortedSiblings();

			if (Object.keys(model.now.geneline.removedMutationObj).length > 0)	{
				enableDisableBlur();
				enabledDisabeldMaximumElement(
					model.now.geneline.groupList ? 
					model.now.geneline.pidList.data : undefined);
			}
		}
	};

	function geneDragStart (evt)	{
		model.now.geneline.isDraggable = false;
	}

	function drawDivisionPath ()	{
		if (model.now.divisionPathData)	{
			bio.iteration.loop(model.now.divisionPathData.data, 
			function (dd)	{
				bio.path({
					element: d3.select('.landscape_heatmap_svg.heatmap-g-tag'),
					data: dd,
					attr: {
						id: function (d, idx, that) {
							return 'landscape_gene_division_path';
						},
						x: function (d, idx, that)	{ return d.x; },
						y: function (d, idx, that)	{ return d.y - 40; },
					},
					style:{
						stroke: '#333333',
						strokeWidth: '0.5px',
						strokeDash: '3',
					}
				});
			});
		}
	};

	function getDivisionLineLocation (list)	{
		var divX = 0,
				maximum = 0,
				divWidth = 0,
				divisionLineElement = undefined;

		bio.iteration.loop(list, function (l)	{
			var idx = model.data.axis.heatmap.x.indexOf(
									l.participant_id);
			
			maximum = maximum > idx ? maximum : idx;
		});

		divisionLineElement = model.data.axis.heatmap.x[maximum];

		d3.selectAll('#landscape_heatmap_svg rect')
			.datum(function (d)	{
				if (d.x === divisionLineElement)	{
					var that = d3.select(this);

					divX = parseFloat(that.attr('x'));
					divWidth = parseFloat(that.attr('width'));
				}

				return d;
			});

		return {
			maximum: maximum,
			divPosx: divX + divWidth,
			element: divisionLineElement,
		};
	};

	function drawDivisionLineForDisableEnable (ml)	{	
		if (model.now.mutation_list)	{
			return ml ? getDivisionLineLocation(ml) : 
									getDivisionLineLocation(
									model.now.mutation_list);
		} else {
			return undefined;
		}
	};
	/*
		enable 과 disabled 된 부분을 나눠주는 함수.
	 */
	function enabledDisabeldMaximumElement (mutationList)	{
		var loc = [],
				isDraw = false,
				svg = d3.select('#landscape_heatmap_svg');

		if (mutationList)	{
			bio.iteration.loop(mutationList, function (ml)	{
				loc.push(drawDivisionLineForDisableEnable(ml));
			});
		} else {
			if (!drawDivisionLineForDisableEnable())	{
				return false;
			}
			
			loc.push(drawDivisionLineForDisableEnable());
		}	

		bio.iteration.loop(loc, function (l)	{
			if (l)	{
				isDraw = true;
			}
		});

		if (isDraw)	{
			model.now.divisionPathData = { data: [] };

			bio.iteration.loop(loc, function (l)	{
				model.now.divisionPathData.data.push([
					{ x: l.divPosx, y: 0 },
					{ x: l.divPosx, y: parseFloat(svg.attr('height'))}
				]);
			});

			if (mutationList)	{
				var isDrawLine = 0;

				bio.iteration.loop(mutationList, function (ml)	{
					isDrawLine += ml.length;
				});

				if (isDrawLine !== model.init.mutation_list.length)	{
					drawDivisionPath();
				}
			} else {
				drawDivisionPath();
			}	
		}
	};

	function enableDisableBlur ()	{
		if (model.now.geneline.axis)	{
			bio.iteration.loop(model.now.geneline.axis,
			function (k, v)	{
				if (model.now.geneline.axis[k].isGene === 'enable') {
					d3.selectAll('#landscape_gene_' + k + '_bar_rect')
						.style('fill-opacity', '1');
					d3.selectAll('#landscape_gene_' + k + '_heatmap_rect')
						.style('fill-opacity', '1');	
				} else {
					d3.selectAll('#landscape_gene_' + k + '_bar_rect')
						.style('fill-opacity', '0.2');
					d3.selectAll('#landscape_gene_' + k + '_heatmap_rect')
						.style('fill-opacity', '0.2');
				}
			});
		}
	}
	/*
		removed 된 쪽과 enable 쪽의 중복이 되지 않는
		participant - id 리스트를 반환.
	 */
	function uniqueParticipantId (list)	{
		var result = [];

		bio.iteration.loop(list, function (l)	{
			if (result.indexOf(l.participant_id) < 0)	{
				result.push(l.participant_id);
			}
		});

		return result;
	};
	/*
		Group 정렬된 상태에서 enable / disable 을 적용하기 위한
		함수.
	 */
	function remakeMutationList ()	{
		var mutationList = [],
				pidList = [],
				isRemovable = false,
				type = model.now.exclusivity_opt || 
							 model.init.exclusivity_opt;

		if (model.now.geneline.groupList)	{
			bio.iteration.loop(model.now.geneline.groupList, 
			function (gl)	{
				var temp = [],
						tempGene = [],
						exclusiveGroup = undefined;

				bio.iteration.loop(model.now.mutation_list || 
												 	 model.init.mutation_list, 
				function (ml)	{
					if (gl.indexOf(ml.participant_id) > -1)	{
						if (Object.keys(
							model.now.geneline.removedMutationObj).length > 0)	{
							bio.iteration.loop(model.now.geneline.removedMutationObj, 
							function (key, value)	{
								if (ml.gene !== key)	{
									temp.push(ml);
								} 

								if (value)	{
									isRemovable = true;
								}
							});
						} else {
							temp.push(ml);
						}
					}
				});

				var temptemp = temp.map(function (t)	{
					return {
						x: t.participant_id,
						y: t.gene,
						value: t.type
					};
				});

				exclusiveGroup = bio.landscapeSort()
				 										.exclusive(temptemp, model.data.gene, type);

				mutationList.push(temp);	
				pidList.push(exclusiveGroup);
			});

			bio.iteration.loop(model.now.geneline.groupList, 
			function (gl, gidx)	{
				bio.iteration.loop(gl, function (pid)	{
					if (pidList[gidx].data.indexOf(pid) < 0)	{
						pidList[gidx].data.push(pid);
					}
				});
			});
		} else {
			mutationList = model.now.geneline.mutationList;
		}

		return {
			isRemovable: isRemovable,
			data: mutationList,
			arr: pidList,
		};
	};
	/*
		Enable / Disable / Others 를 반환하는 함수.
	 */
	function callEnableDisableOtherFunc ()	{
		if (model.divisionFunc)	{
			var disableList = [];

			bio.iteration.loop(model.now.geneline.removedMutationObj, function (k, v)	{
				disableList = disableList.concat(
					model.now.geneline.removedMutationObj[k]);
			});

			var enableSample = uniqueParticipantId(model.now.mutation_list || 
																						model.init.mutation_list),
					disableSample = model.data.axis.sample.x.filter(function (s)	{
						return enableSample.indexOf(s) < 0;
					}),
					otherSample = model.data.group.group[0].map(function (g)	{
						return g.x;
					});

			otherSample = otherSample.filter(function (o)	{
				if (enableSample.indexOf(o) < 0 && 
						disableSample.indexOf(o) < 0)	{
					return o;
				}
			});

			otherSample = !otherSample ? [] : otherSample;

			model.divisionFunc(
				enableSample, disableSample, otherSample);
		}
	}

	/*
		Landscape 축들을 그려주는 함수.
	 */
	function drawAxis (part, direction)	{
		var p = {
			sample: 's_s', gene: 'gene', pq: 'pq', group: 's_g'
		}[part];

		bio.layout().get(model.setting.svgs, [p], 
		function (id, svg)	{
			var config = bio.landscapeConfig().axis(
										part, direction, svg),
					common = bio.landscapeConfig().axis('common'),
					data = model.data.axis[part][direction.toLowerCase()];
			// Group 의 경우 각각에 데이터가 들어있으므로 Looping 을 하여
			// 맞은 값을 가져온다.
			if (part === 'group')	{
				bio.iteration.loop(data, function (g)	{
					// id 가 / 가 들어간 경우 '' 처리를 하므로
					// / 가 들어간 데이터는 처리가 되지 않는다.
					// / 가 들어간 Clinical 에도 적용되게 하였다.
					if (id.indexOf(g[0].removeWhiteSpace()
														 .replace('/', '')) > -1)	{
						data = g;
					}
				});
			} 

			var geneDrag = d3.drag()
											 .on('start', geneDragStart)
											 .on('drag', geneDragMove)
											 .on('end', geneDragEnd);

			var axises = bio.axises()[config.direction]({
				element: svg,
				domain: data,
				top: config.top,
				left: config.left,
				range: config.range,
				margin: config.margin,
				exclude: config.exclude,
			});

			axises.selectAll('text')
				.on('mouseout', common.on ? common.on.mouseout : false)
				.on('mouseover', common.on ? common.on.mouseover : false)
				.on('click', function (data, idx)	{
					if (part === 'group' && direction === 'Y')	{
						var res = config.on ? 
											config.on.click.call(this, data, idx, model) : false,
								groupList = [];
						// x 축에 속하는 그룹 id 만 가져온다.
						bio.iteration.loop(model.now.group.group, 
						function (group)	{
							var temp = [];

							group.filter(function (gp)	{
								if (res.sorted.data.indexOf(gp.x) > -1)	{
									temp[res.sorted.data.indexOf(gp.x)] = (gp.x);
								}
							});

							groupList.push(temp.filter(function (tgp)	{
								return tgp;
							}));
						});	

						model.now.geneline.groupList = groupList;
						model.now.geneline.pidList = remakeMutationList();
						model.now.geneline.mutationList = 
						model.now.geneline.pidList.data;

						redraw(res, model.now.geneline.pidList.isRemovable ? 
												model.now.geneline.pidList.data : undefined);
					}

					if (part === 'gene' && direction === 'Y')	{
						if (!model.now.geneline.isDraggable)	{
							if (d3.event.altKey)	{
								var res = config.on ? 
													config.on.click.call(this, data, idx, model) : false;

								model.now.geneline.mutationList = undefined;

								redraw(res);
							} else {
								var tempGeneList = [].concat(model.data.gene),
										isGroupMutationList = undefined,
										isNewPidGroupList = undefined;

								if (model.now.geneline.axis[data].isGene === 'enable')	{
									var	geneIdx = tempGeneList.indexOf(data),
											endPart = tempGeneList.splice(geneIdx + 1),
											startPart = tempGeneList.splice(0, geneIdx);

									tempGeneList = startPart.concat(endPart).concat([data]);
									// 현재 라인 disable 
									model.data.gene = tempGeneList;
									model.now.geneline.axis[data].isGene = 'disable';

									model.now.mutation_list = model.now.mutation_list ? 
									model.now.mutation_list : model.init.mutation_list;
									// Disable 된 gene 을 포함하는 sample 을 제거.
									// 지금은 mutation_list 만 제거하지만
									// 나중에는 patient_list 도 제거해야 한다.
									model.now.mutation_list = 
									model.now.mutation_list.filter(function (d)	{
										if (d.gene !== data)	{
											return d;
										} else {
											if (!model.now.geneline.removedMutationObj[d.gene])	{
												model.now.geneline.removedMutationObj[d.gene] = [d.participant_id];
											} else {
												if (model.now.geneline.removedMutationObj[d.gene]
																 .indexOf(d.participant_id) < 0)	{
													model.now.geneline.removedMutationObj[d.gene]
															 .push(d.participant_id);
												} 
											}

											if (!model.now.geneline.removedMutationArr[d.gene])	{
												model.now.geneline.removedMutationArr[d.gene] = [d];
											} else {
												if (model.now.geneline.removedMutationArr[d.gene]
																 .indexOf(d.participant_id) < 0)	{
													model.now.geneline.removedMutationArr[d.gene].push(d);
												}
											}
										}
									});
									// disable 된 group 태그를 svg 하위 
									// 항목에서 제거해야 한다.
									model.now.geneline.sortedSiblings.push(
									model.now.geneline.sortedSiblings.splice(geneIdx, 1)[0]);
									
									model.now.geneline.pidList = remakeMutationList();
									isGroupMutationList = model.now.geneline.pidList.data; 
									isNewPidGroupList = model.now.geneline.pidList.arr;

									nowGeneLineValue();
								} else {
									var beforeIdx = tempGeneList.indexOf(data),
											geneIdx = model.now.geneline.axis[data].idx,
											isTerminated = false;

									tempGeneList.splice(beforeIdx, 1);
									tempGeneList.splice(geneIdx, 0, data);

									model.data.gene = tempGeneList;
									model.now.geneline.axis[data].isGene = 'enable';

									model.now.mutation_list = 
									model.now.mutation_list.concat(
										model.now.geneline.removedMutationArr[data]);

									model.now.geneline.removedMutationObj[data] = undefined;
									model.now.geneline.removedMutationArr[data] = undefined;

									model.now.geneline.pidList = remakeMutationList();

									bio.iteration.loop(model.now.geneline.axis,
									function (key, value)	{
										if (value.isGene === 'disable')	{
											isTerminated = true;
										}
									});

									isGroupMutationList = !isTerminated ? undefined : 
																				model.now.geneline.pidList.data;
									isNewPidGroupList = model.now.geneline.pidList.arr;
									// disable 된 geneline tag 를 원 위치 시켜 놓는다.
									model.now.geneline.sortedSiblings.splice(geneIdx, 0, 
										model.now.geneline.sortedSiblings.splice(beforeIdx, 1)[0]);

									nowGeneLineValue();
								}

								model.data.axis.gene.y = model.data.gene;
								model.data.axis.heatmap.y = model.data.gene;
								model.data.axis.pq.y = model.data.gene;	

								var type = model.now.exclusivity_opt ? 
													 model.now.exclusivity_opt : 
													 model.init.exclusivity_opt;

								bio.layout().removeGroupTag('survival');

								model.exclusive.now = 
								bio.landscapeSort()
									 .exclusive(model.data.heatmap, model.data.gene, type);
								changeSampleStack(model.now.mutation_list);
								// Group 별로 정렬된 상태에서 enable / disable 을 할때,
								// Group 정렬을 유지한다.
								if (model.now.geneline.groupList)	{
									var groups = [];

									bio.iteration.loop(isNewPidGroupList, function (gl)	{
										groups = groups.concat(gl.data);
									});

									changeAxis({ axis: 'x', data: groups });
								} else {
									changeAxis(model.exclusive.now);
								}

								drawLandscape(model.data, model.now.width);
								enableDisableBlur();
								enabledDisabeldMaximumElement(isGroupMutationList);
								callEnableDisableOtherFunc();
							}
						}
					}
				})
				.call(geneDrag);
		});
	};
	/*
		Sort 버튼이 어느 버튼인지 반환하는 함수.
	 */
	function getSortedTitle (id, common)	{
		return id.indexOf('pq') < 0 ? 
					 id.indexOf('gene') > -1 ? 
					[{ name: 'gene', text: common.titles[0] }] : 
				  [{ name: 'sample', text: common.titles[0] }] :
					[{ name: 'pq', text: common.titles[1] }];
	};
	/*
		Sort title 을 그려주는 함수.
	 */
	function drawSortTitle (id)	{
		bio.layout().get(model.setting.svgs, [id], 
		function (id, svg)	{
			var common = bio.landscapeConfig().title('common'),
					titles = getSortedTitle(svg.attr('id'), common),
					config = bio.landscapeConfig().title(titles[0].name);

			bio.sortTitle({
				data: titles,
				element: svg,
				attr: config.attr,
				text: common.text,
				style: common.style,
				margin: config.margin,
				titles: common.titles,
				on: {
					mouseover: common.on.mouseover,
					mouseout: common.on.mouseout,
					click: function (data, idx, that)	{
						model.sortName = titles[0].name;

						!model.now.sort[data.name] ? 
						 model.now.sort[data.name] = 'asc' : 
						 model.now.sort[data.name] === 'asc' ? 
						 model.now.sort[data.name] = 'desc' : 
						 model.now.sort[data.name] = 'asc';

						var res = common.on.click.call(
												this, data, idx, model);

						redraw(res);
					},
				},
			}, model);
		});
	};
	/*
		일반적인 형태의 bar 차트를 그리는 함수.
	 */
	function drawBar (part, data, axis, startTo)	{
		var parts = {
			sample: { id: 'e_s', config: 'sample' },
			samplePatient: { id: 't_s', config: 'sample' },
			gene: { id: part, config: part },
			pq: { id: part, config: part },
		}[part];

		bio.layout().get(model.setting.svgs, [parts.id], 
		function (id, svg)	{
			var config = bio.landscapeConfig().bar(parts.config);

			if (part.indexOf('Patient') > -1)	{
				config.margin[3] = 5;
			}

			bio.bar({
				data: data,
				element: svg,
				on: config.on,
				xaxis: axis.x,
				yaxis: axis.y,
				startTo: startTo,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
			});
		});
	};
	/*
		Heatmap 을 그릴때 ID 검색 시 필요한 그룹 이름을 반환한다.
	 */
	function getGroupTitle (part, axis)	{
		return part.indexOf('group') > -1 || 
					 part.indexOf('patientGroup') > -1 ? 
					 axis.y[0].removeWhiteSpace() : '';
	};
	/*
		Heatmap 차트를 그려주는 함수.
	 */
	function drawHeatmap (part, data, axis)	{
		var add = getGroupTitle(part, axis);
		var parts = {
			group: { id: 'p_group_', config: 'group' }, 
			patientGroup: { id: 't_group_', config: 'group' },
			heatmap: { id: 'e_h', config: 'heatmap' }, 
			patientHeatmap: { id: 't_h', config: 'heatmap' },
		};

		bio.layout().get(model.setting.svgs, 
		[parts[part].id + add.replace('/', '')], // group 명 중에 / 가 들어간 이름이 있을 경우에 표시가 안된다.  
		function (id, svg)	{
			var config = bio.landscapeConfig()
											.heatmap(parts[part].config),
					init = part.indexOf('map') > - 1 ? 
									bio.initialize('landscapeHeatmap') : null;

			if (part.indexOf('patientHeatmap') > -1 || 
					part.indexOf('patientGroup') > -1)	{
				config.margin[3] = 5;
			} 

			bio.heat({
				data: data,
				element: svg,
				xaxis: axis.x,
				yaxis: axis.y,
				on: config.on,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
			}, init);
		});
	};
	/*
		Legend 를 그려주는 함수.
	 */
	function drawLegend (data)	{
		bio.layout().get(model.setting.svgs, ['legend'], 
		function (id, svg)	{
			var config = bio.landscapeConfig().legend();

			bio.legend({
				data: data,
				element: svg,
				on: config.on,
				attr: config.attr,
				text: config.text,
				style: config.style,
				margin: config.margin,
			});
		});
	};
	/*
		Landscape 전체를 그려주는 함수.
	 */
	function drawLandscape (data, width)	{
		var md = model.data;

		setWidth(width);
		drawAxis('pq', 'X');
		drawAxis('gene', 'X');
		drawAxis('gene', 'Y');
		drawAxis('group', 'Y');
		drawAxis('sample', 'Y');
		drawSortTitle('pq');
		drawSortTitle('s_s');
		drawSortTitle('gene');
		drawBar('pq', md.pq, md.axis.pq, ['top', 'left']);
		drawBar('gene', md.stack.gene, md.axis.gene, ['top', 'left']);
		drawBar('sample', md.stack.sample, md.axis.sample, 
					 ['top', 'left']);
		drawBar('samplePatient', md.stack.patient, 
						md.axis.patient.sample, ['top', 'left']);
		drawHeatmap('heatmap', md.heatmap, md.axis.heatmap);
		drawHeatmap('patientHeatmap', md.patient, 
																	md.axis.patient.heatmap);
		bio.iteration.loop(md.axis.group.y, function (g, idx)	{
			var yaxis = md.axis.group.y[idx],
					group = { x: md.axis.group.x, y: yaxis },
					patient = { x: md.axis.patient.group.x, y: yaxis };

			drawHeatmap('group', md.group.group[idx], group);
			drawHeatmap('patientGroup', 
								 [md.group.patient[idx]], patient);
		});
		drawLegend(md.type);
	};

	function geneAxisTermHeight ()	{
		var axisHeight = 0,
				axisHalfHeight = 0,
				zeroIdxVal = 0,
				firstIdxVal = 0,
				lastIdxVal = 0;

		bio.iteration.loop(model.init.geneline.axis, 
		function (k, v)	{
			if (model.init.geneline.axis[k].idx === 0)	{
				zeroIdxVal = model.init.geneline.axis[k].value;
			} else if (model.init.geneline.axis[k].idx === 1)	{
				firstIdxVal = model.init.geneline.axis[k].value;
			} else if (model.init.geneline.axis[k].idx === 
									model.data.gene.length - 1)	{
				lastIdxVal = model.init.geneline.axis[k].value;
			}
		});

		model.init.geneline.firstYAxis = zeroIdxVal;
		model.init.geneline.axisHeight = 
			parseFloat((firstIdxVal - zeroIdxVal).toFixed(3));
		model.init.geneline.axisHalfHeight = 
			model.init.geneline.axisHeight / 2;
		model.init.geneline.lastYAxis = lastIdxVal;
	};
	/*
		geneline 의 siblings 들을 각각 인덱스에 맞게
		정렬해주는 함수.
	 */
	function genelineSortedSiblings ()	{
		var tags = document.querySelector('.landscape_gene_svg.right-axis-g-tag'),
				siblings = bio.dom().siblings(tags.children),
					sortedSiblings = [];

		model.init.geneline.sortedSiblings = siblings;

			bio.iteration.loop(siblings, function (s, i)	{
				var gene = s.innerHTML.substring(
										s.innerHTML.indexOf('>') + 1, 
										s.innerHTML.lastIndexOf('<'));

				sortedSiblings[model.data.gene.indexOf(gene)] = s;
			});

		model.now.geneline.sortedSiblings = 
		sortedSiblings;
	};
	/*
		enable/disable 및 기타 gene_list 가 변경 될 때,
		그에 맞는 translate 값으로 변경 시켜 준다.
	 */
	function nowGeneLineValue ()	{
		bio.iteration.loop(model.data.gene, function (g, i)	{
			var group = 
					d3.select('.landscape_gene_svg.right-axis-g-tag')
						.selectAll('g').nodes()[i],
					value = parseFloat(d3.select(group)
															 .attr('transform')
															 .replace(/translate\(|\)/ig, '')
															 .split(',')[1]);

			model.now.geneline.axis[g].value = value;		
		});
	};
	/*
		각 gene 별 y 의 값들을 저장해놓는 데이터를 만든다.
		이 데이터는 gene 의 위치가 변경되거나 enable/disable 되었을때,
		사용된다.
		또한 새로운 gene list 를 생성하여 새로운 exclusivity 로
		정렬한다.
	 */
	function makeGeneLineDataList ()	{
		model.init.geneline = {
			gene: [], axis: {}, heat: [], pq: [], temp: {},
		};

		bio.iteration.loop(model.data.gene, function(g, i)	{
			var axisGroup = 
					d3.select('.landscape_gene_svg.right-axis-g-tag')
						.selectAll('g').nodes()[i];
			
			var axis = parseFloat(d3.select(axisGroup)
													.attr('transform')
													.replace(/translate\(|\)/ig, '')
													.split(',')[1]),
					gene = parseFloat(
						d3.select('#landscape_gene_' + g + '_bar_rect')
							.attr('y')),
					heat = parseFloat(
						d3.select('#landscape_gene_' + g + '_heatmap_rect').attr('y'));
					// pq = parseFloat(
					// 	d3.selectAll('#landscape_gene_' + g + '_pq_rect')
					// 		.attr('y'));
			
			model.init.geneline.axis[g] = 
			{ 
				idx : i, value: axis, 
				group: axisGroup, isGene : 'enable' 
			};
			model.init.geneline.gene.push({ name: g, y: gene });
			model.init.geneline.heat.push({ name: g, y: heat });
			// model.init.geneline.pq.push({ name: g, y: pq });

			geneAxisTermHeight();
		});
		// 초기의 값중에 가장 큰 값을 저장 해 놓는다.
		// 이는 나중에 나눔선을 지정할 때, disable 한 gene 의 
		// 최대 위치가 모든 데이터에서의 최대위치 보다 작을때는
		// 나눔선을 표시하지 않기 위해서 이다.
		model.now.geneline = bio.objects.clone(model.init.geneline);
		// group 별로 새 정렬된 pid 를 저장하는 변수.
		model.now.geneline.pidList = undefined;
		// mutation 이 존재 하는 영역과 존재하지 않는영역을 
		// 나누는 값을 저장하는 객체.
		model.now.geneline.enabledDivisionValues = {};
		model.now.geneline.disabledDivisionValues = {};
		// gene 을 enable/disable 할때, disable 한 gene 의 
		// mutation_list 값을 가지는 객체이다.
		model.now.geneline.removedMutationObj = {};
		model.now.geneline.removedMutationArr = {};
		model.now.geneline.removedMutationList = {};

		genelineSortedSiblings();
	};

	function drawExclusivityLandscape (type)	{
		model.init.mutation_list = 
		model.setting.defaultData.data.mutation_list;
		// 초기 exclusive 값을 설정한다.
		model.exclusive.init = bio.landscapeSort().exclusive(
			model.data.heatmap, model.data.gene, type);
		// 초기 x, y 축 값 설정. 초기화 동작을 위해서이다.
		model.init.axis.x = [].concat(model.exclusive.init.data);
		model.init.axis.y = [].concat(model.data.axis.gene.y);
		model.init.axis.sampleY = [].concat(model.data.axis.sample.y);

		bio.layout().removeGroupTag('survival');

		orderByTypePriority(model.data.type);
		patientAxis(model.data.axis);
		
		if (model.now.geneline.groupList)	{
			var groups = [];

			model.now.geneline.pidList = remakeMutationList();

			bio.iteration.loop(model.now.geneline.pidList.arr, 
			function (gl)	{
				groups = groups.concat(gl.data);
			});

			changeAxis({ axis: 'x', data: groups });
		} else {
			changeAxis(model.exclusive.now || 
								 model.exclusive.init);
		}
		
		drawLandscape(model.data, model.init.width);
		enableDisableBlur();
		enabledDisabeldMaximumElement(
			model.now.geneline.groupList ? 
			model.now.geneline.pidList.data : undefined);
	};

	return function (opts)	{
		model = bio.initialize('landscape');
		model.isPlotted = opts.plot;
		model.setting = bio.setting('landscape', opts);
		model.data = model.setting.preprocessData;
		model.divisionFunc = opts.divisionFunc ? 
		opts.divisionFunc : null;

		bio.clinicalGenerator(model.data.group.group, 'landscape');

		removeGroupTempSVG();
		// Set landscape title.
		bio.title('#landscape_title', 
			model.setting.defaultData.title);

		defaultSize(model.init);
		drawScaleSet(model.setting);
		drawExclusivity();
		changeExclusivityOption();
		drawExclusivityLandscape('1');
		makeGeneLineDataList();
		// 초기에 한번 불러온다.
		callEnableDisableOtherFunc();

		bio.handler().scroll('#landscape_heatmap', function (e)	{
			var sample = bio.dom().get('#landscape_sample'),
					group = bio.dom().get('#landscape_group');
			
			sample.scrollLeft = this.scrollLeft;
			group.scrollLeft = this.scrollLeft;
		});

		console.log('>>> Landscape reponse data: ', opts);
		console.log('>>> Landscape setting data: ', model.setting);
		console.log('>>> Landscape model data: ', model);
	};
};