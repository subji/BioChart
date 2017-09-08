var preprocessing = (function (preprocessing)	{
	'use strict';
	/*
		차트 별 데이터 및 여러 정보를 포함할 모델 객체.
	 */
	var model = {
		expression: {
			func: {
				default: 'average',
				now: null,
				avg: [],
			},
			tpms: [],
			heatmap: [],
			scatter: {},
			subtype: [],
			survival: {

			},
			bar: [],
			axis: {
				gradient: {x: {}, y: {}},
				heatmap: {x: {}, y: {}},
				scatter: {x: {}, y: {}},
				bar: {x: {}, y: {}},
			},
		},
		exclusivity: {
			heatmap: {},
			network: {},
			type: {},
			survival: {
				merge: {},
				heat: {},
				data: {},
			},
			geneset: [],
			fullGeneset: [],
			axis: {
				heatmap: {x: {}, y: {}},
				division: {x: {}, y: []},
			},
			divisionIdx: {},
		},
		landscape: { 
			keys: {}, 
			type: {}, 
			group: {
				group: [], 
				patient: [],
			},
			heatmap: [],
			patient: [],
			stack: {gene: {}, sample: {}, patient: {}},
			axis: {
				pq: {x: [], y: []},
				gene: {x: [], y: []},
				group: {x: [], y: []},
				sample: {x: [], y: []},
				heatmap: {x: [], y: []},
				patient: {x: [], y: []},
			},
		},
		variants: {
			needle: [],
			fullNeedle: [],
			type: [],
			graph: [],
			axis: {
				needle: {x: [], y: []},
			},
		},
	};
	/*
	 	Object 들의 naming 이 너무 길어서 줄임.
	 */
	var ml = model.landscape,
			el = model.exclusivity,
			exp = model.expression,
			vl = model.variants,
			cl = config.landscape;
	// ============== Variants =================
	/*
	 	Stack 으로 정렬된 데이터를 line 및 circle 을 그리기
	 	좋은 형태로 만들어 주는 함수.
	 */
	function optimizeVariantsStack (o)	{
		util.loop(o, function (k, v)	{
			var c = 0,
					oo = { key: k, value: [
						{ x: parseFloat(k), y: c, value: 0 }
					]};
			// 위는 line 을 그리기위한 초기 데이터.
			// 여기는 y 축을 위한 초기 데이터 설정.
			vl.axis.needle.y.push(c);

			util.loop(v, function (kk, vv)	{
				oo.value.push({
					x: parseFloat(k),
					y: (c = c + vv.length, c),
					value: vv.length,
					info: vv,
				});
			});

			vl.axis.needle.y.push(c);
			vl.needle.push(oo);
		});
	};
	/*
		Needle Plot 도 Stack 형태의 데이터가 되어야 그릴 수 있기에
		그렇게 바꿔주는 코드이다.
	 */
	function setVariantsStack (p)	{
		var o = {};

		util.loop(p, function (d, i)	{
			d.type = config.landscape.name(d.type);

			var s = d.position + ' ' + d.type + ' ' + d.aachange;

			o[d.position] ? o[d.position][s] ? 
			o[d.position][s].push(d) : o[d.position][s] = [d] : 
			(o[d.position] = {}, o[d.position][s] = [d]);
			// Variants Plot 의 type 들을 구한다.
			if (vl.type.indexOf(d.type) < 0)	{
				vl.type.push(d.type);
			}
		});

		optimizeVariantsStack(o);
	};
	/*
		Circle 을 그리기 위해 위 Stacked 데이터를
		full 데이터로 변환한 데이터를 추가해주는 함수.
	 */
	function fullyNeedle ()	{
		util.loop(vl.needle, function (d, i)	{
			util.loop(d.value, function (dd, ii)	{
				if (dd.info) {
					// dd.info 가 없는 경우는 0 인 경우뿐이므로.
					// 따로 0 인 조건 검사 없이 연산을 한다.
					dd.value = dd.y - d.value[ii - 1].y;

					vl.fullNeedle.push(dd);
				}
			});
		});
	};
	/*
		Graph 의 데이터 형식을 바꿔주는 함수.
	 */
	function setGraph (g)	{
		util.loop(g, function (d, i)	{
			vl.graph.push({
				x: d.start,
				y: 0,
				width: d.end - d.start,
				height: 15,
				color: d.colour,
				info: d,
			});
		});
	};
	/*
		Needle Plot & Graph 를 그릴 때 사용되는 축
		데이터를 설정하는 함수.
	 */
	function setNeedleAxis (g)	{
		vl.axis.needle.x = [0, g[0].length];
		vl.axis.needle.y = 
		vl.axis.needle.y.length < 1 ? [0, 1] : 
		[util.minmax(vl.axis.needle.y).min, 
		 util.minmax(vl.axis.needle.y).max];
	};

	preprocessing.variants = function (d)	{
		setVariantsStack(d.variants.public_list);
		setGraph(d.variants.graph);
		setNeedleAxis(d.variants.graph);
		fullyNeedle();

		vl.patient = d.variants.patient_list.map(function (d, i)	{
			return d.type = config.landscape.name(d.type), d;
		});

		console.log('Preprocess of Variants: ', vl);

		return vl;
	};
	// ============== Variants =================
 	// ============== Mutual Exclusivity =================
 	/*
 		문단 혹은 문장에서 geneset 의 이름을 찾아내어 주는 함수.
 	 */
 	function getGeneSet (t)	{
		return (/[\[][\w(\s|,)]+[\]]/)
		.exec(t)[0].replace(/\[|\]/g, '').split(' ');
 	};
 	/*
 		'**color': '255 255 255' 의 형식을 rgb(255, 255, 255)
 		로 바꿔주는 함수.
 	 */
 	function toRGB (t)	{
 		return 'rgb(' + t.split(' ').join(',') + ')';
 	};
 	/*
 		object 타입으로 변경시켜주는 함수.
 	 */
 	function netDataForm (v)	{
 		var r = [];

 		util.loop(v, function (d, i)	{
 			var o = {};

 			util.loop(d.split('\t'), function (dd, i)	{
 				o[dd.split(':')[0]] = 
 				dd.split(':')[0].indexOf('color') < 0 ? 
 				dd.split(':')[1] : toRGB(dd.split(':')[1]);
 			});

 			r.push(o);
 		});

 		return r;
 	};
 	/*
 		Network 차트를 그리는데 필요한 데이터 형식으로
 		변경해주는 함수.
 	 */
 	function toNetworkData (r)	{
 		util.loop(r, function (k, v)	{
 			el.network[k] = netDataForm(v);
 		});
 	};
 	/*
 		Network 를 그리는 데 사용될 함수.
 	 */
 	function network (n)	{
 		var r = {};

 		util.loop(n.split('\n'), function (d, i)	{
 			util.loop(el.geneset, function (dd, i)	{
 				if (d.indexOf(dd.join('')) > -1)	{
 					r[dd.join(' ')] ? 
 					r[dd.join(' ')].push(d) : 
 					r[dd.join(' ')] = [d];
 				}
 			});
 		});

 		toNetworkData(r);
 	};
 	/*
 		Legend 객체에 빈 배열을 만들어주는 함수.
 	 */
 	function toLegendData (k)	{
 		return el.type[k.join(' ')] = [];
 	};
 	/*
 		x, y, value 형태를 넣어주는 함수.
 		덤으로 type list 도 만들어준다.
 	 */
 	function heatDataForm (k, v, o, l, hx, dx, idx)	{
 		util.loop(v.split(''), function (d, i)	{
 			hx.push('' + i);
 			dx.push('' + i);
 			// B, E 와같이 두개의 variant 를 갖고있는 문자는 분해시켜준다.
 			util.loop(config.exclusivity.separate(d), function (dd, ii)	{
 				dd = config.exclusivity.name(dd);

 				o.push({x: i, y: k, value: dd});
 				l.indexOf(dd) < 0 ? l.push(dd) : l = l;	
 			});
 			// 각 geneset 별 division number index 를 설정해준다.
 			// Object 값으로 만든이유는 javascript 가 call by value 이기 때문이다.
 			// primitive 타입을 제외한 array, object 타입은 call by reference 로
 			// 값이 복사되어 전달받는것이 아닌 원본 값의 참조값을 넘겨받는다.
 			idx.idx = d !== '.' ? idx.idx > i ? idx.idx : i : idx.idx;
 		});
 	};
 	/*
 		일반 . , A, 등의 데이터를 x, y, value 형식으로
 		바꿔주는 함수이다.
 	 */
 	function toHeatmapData (t, k, o)	{
 		// Legend 데이터도 여기서 만들어준다.
 		var l = toLegendData(k);

 		util.loop(t, function (d, i)	{
 			util.loop(k, function (dd, ii)	{
 				if (d.indexOf(dd) > -1)	{
 					var j = k.join(' ');
 					// Heatmap & Division bar 의 axis 데이터를 초기화 한다.
 					el.axis.heatmap.x[j] = [];
 					el.axis.heatmap.y[j] = k;
 					el.axis.division.x[j] = [];
 					el.divisionIdx[j] = { idx: 0 };

 					heatDataForm(
 					 dd, d.substring(0, d.indexOf(' ')), o, l,
 					 el.axis.heatmap.x[j], 
 					 el.axis.division.x[j],
 					 el.divisionIdx[j]);
 				}
 			});
 		});
 	};
 	/*
 		Exclusivity 에 사용될 heatmap 데이터를 만들어준다.
 	 */
 	function heatmap (h)	{
 		util.loop(h.split('\n\n'), function (d, i)	{
 			if (d !== '')	{
 				var t = getGeneSet(d),
	 					m = d.split('\n'),
	 					g = m.splice(1, m.length),
	 					thd = toHeatmapData(
	 						g, t, el.heatmap[t.join(' ')] = []);
	 			// Survival 데이터를 뽑아내는데 필요한 원본데이터.
	 			el.survival.heat[t.join(' ')] = g;
	 			el.fullGeneset.concat(t);
	 			el.geneset.push(t);
 			}
 		});
 		// TODO. 
		// 정렬방식 설정 코드를 짜야된다.
		// 현재 테스트 데이터에는 이상이 있는지 안된다.
		// 본서버 데이터는 잘 된다.
		var temp = el.geneset[4];

		el.geneset[4] = el.geneset[0];
		el.geneset[0] = temp;
 	};
 	/*
 		GEne list 를 만들어준다.
 	 */
 	function makeSuvivalGeneList (t)	{
 		var r = {};

 		util.loop(t, function (d, i)	{
 			r[d.gene] = ['.'];
 		});

 		return r;
 	};
 	/*
 		2500 여개의 types 데이터를 줄이기 위한 함수.
 	 */
 	function toObjectSurvivalTypes (t, gl)	{
 		var r = {};

 		util.loop(t, function (d, i)	{
 			var tn = config.landscape.name(d.type),
 					ty = tn === 'Amplification' || tn === 'Homozygous_deletion' ? 
 							tn === 'Amplification' ? 'A' : 'D' : 'M',
 					gcp = util.cloneObject(gl);

 			!r[d.participant_id] ? (gcp[d.gene] = [ty], 
 			 r[d.participant_id] = gcp, r) : (
 			 r[d.participant_id][d.gene][0] === '.' ? 
 			 r[d.participant_id][d.gene] = [ty] : 
 			 r[d.participant_id][d.gene].push(ty), r);
 		});

 		return r;
 	};
 	/*
 		type 과 patient 의 데이터를 하나로 합치자.
 	 */
 	function mergeSurvival (p, t)	{
 		var gl = makeSuvivalGeneList(t),
 				ot = toObjectSurvivalTypes(t, gl);

 		util.loop(p, function (d, i)	{
 			d.gene = ot[d.participant_id] ? ot[d.participant_id] : gl;
 		});

 		el.survival.merge = p;
 	};
 	/*
 		배열로 된 타입 데이터를 서바이벌 문자로 치환한다.
 		이는 서바이벌 데이터를 뽑아내기 위한 기준으로 삼기 때문에
 		구현한다.
 	 */
 	function transferSuvType (ta)	{
 		if (ta.indexOf('A') > -1 && ta.indexOf('M') > -1)	{
 			return 'B';
 		} else if (ta.indexOf('D') > -1 && ta.indexOf('M') > -1) {
 			return 'E';
 		} else {
 			return ta[0];
 		}
 	};
 	/*
 		Participant ID 를 기준으로 각 Gene 들마다의 데이터를
 		만들어 반환해주는 함수.
 	 */
 	function survival (h)	{
 		var hasParticipant = {};
 		// Merged data 를 돌면서 각 geneset 에 맞는 gene 들의 
 		// 타입들이 매칭되는지 확인후 geneset 의 개수만큼 맞다면
 		// 해당 위치에 Merged data 를 넣는다.
		util.loop(el.survival.heat, function (k, v)	{
			var idx = el.axis.heatmap.x[k].length,
					ldx = k.split(' '),
					a = !el.survival.data[k] ? 
							 el.survival.data[k] = [] : el.survival.data[k],
					p = hasParticipant[k] = {};

			for (var i = 0; i < idx; i++)	{
				el.survival.merge.some(function (d)	{
					var isType = true;

 					for (var l = 0; l < ldx.length; l++)	{ 	
 						if (transferSuvType(d.gene[ldx[l]]) !== v[l][i])	{
 							isType = false;
 						}
 					}

 					if (isType)	{
 						if (p[d.participant_id] === undefined)	{
 							p[d.participant_id] = '';
 							a[i] = d;

 							return a[i] !== undefined;
 						} 
 					}
				});
			}			
		});			
 	};
 	/*
 		call exclusivity of preprocessing.
 	 */
	preprocessing.exclusivity = function (d)	{
		mergeSurvival(d.survival.patient, d.survival.types);
		heatmap(d.heatmap);
		network(d.network); 
		survival(d.heatmap);

		console.log('Preprocess of Exclusivity: ', el);

		return el;
	};
 	// ============== Mutual Exclusivity =================

	// ============== Mutational Landscape =================
	/*
		Type 만으로 구성된 리스트를 만들어주는 함수.
	 */
	function types (t)	{
		if (!ml.type[t])	{
			ml.type[t] = null;
		}
	};
	/*
	 	Type 의 format 을 Camel Case 로 바꿔주고, 
	 	ins & del 을 indel 로 합쳐진 이름으로 바꿔주는 함수.
	 */
	function typeFormat (d)	{
		d[ml.keys.t] = cl.name(d[ml.keys.t]);
	};
	/*
		Gene, sample, patient 가 각각 x, y 중 기준으로 잡는
		것이 다르기 때문에 이것을 이 함수에서 정해준다.
	 */
	function stackFormat (t, d1, d2, v, i)	{
		return t === 'gene'
				 ? {x: d1, y: d2, value: v, info: i}
				 : {x: d2, y: d1, value: v, info: i};
	};
	/*
		X, Y, VALUE 값이 있을때, X 또는 Y 값을 기준으로 한
		VALUE 의 양을 각각의 쌓이는 모양의 데이터로 만들어주는 함수.
	 */
	function mutStack (t, o)	{
		var r = [];
		// Nested loop 를 사용했다.
		util.loop(o, function (k, v)	{
			var b = 0,
					sum = 0;
			// 기준이 되는 Object 가 가지고 있는 Object 를 돈다.
			util.loop(v, function (vk, vv)	{
				r.push(stackFormat(t, b, k, vv, vk));
				// 현재 위치를 구하기 위해 이전 시작지점 + 이전 값을 구한다.
				b = b + vv;
				// Linear axis 의 최대값을 구하기 위한 연산.
				sum += vv;
			});

			ml.axis[t][(t === 'gene' ? 'x' : 'y')].push(sum);
		});

		return r;
	};
	/*
		기준이 되는 std 값에 해당되는 value 들을 key - value 
		형태의 Object 로 만드는 함수.
	 */
	function nest (o, s, v)	{
		o[s] = !o[s] ? {} : o[s];
		o[s][v] = !o[s][v] ? 1 : o[s][v] + 1;
	};
	/*
		Heatmap 을 그리기 위한 data form 으로 변경해주는 함수.
	 */
	function heatForm (a, d)	{
		a.push({x: d[ml.keys.p], y: d[ml.keys.g], value: d[ml.keys.t]});
	}
	/*
		Mutation 과 Patient 의 배열을 공통부분으로 묶어냈다.
	 */
	function commonLooping (a, cb)	{
		util.loop(a, function (d, i)	{
			// Type 을 해당 라이브러리에서 사용되는 문자열로 변경한다.
			typeFormat(d);
			// mutation 과 patient 두 배열에서 type 들을 모은다.
			types(d[ml.keys.t]);
			cb(d, i);
		});
	};
	/*
	 	Mutation 배열을 도는 함수.
	 	여기서 type 배열과 mutation 배열 및 gene 과 sample 의 
	 	데이터를 만든다.
	 */
	function loopingMutation (m)	{
		commonLooping(m, function (d, i)	{
			// Gene 과 Sample 을 Stack bar 형태로 그리기 위한 데이터를 만들어준다.
			nest(ml.stack.gene, d[ml.keys.g], d[ml.keys.t]);
			nest(ml.stack.sample, d[ml.keys.p], d[ml.keys.t]);
			heatForm(ml.heatmap, d);
			// Sample x axis, Group x axis, Heatmap x axis 를 만든다.
			if (ml.axis.sample.x.indexOf(d[ml.keys.p]) < 0)	{
				ml.axis.sample.x.push(d[ml.keys.p]);
			}
		});
	};
	/*
		Patient 배열을 도는 함수.
		여기서 type 배열과 sample 데이터를 만든다.
	 */
	function loopingPatient (p)	{
		commonLooping(p, function (d, i)	{
			nest(ml.stack.patient, d[ml.keys.p], d[ml.keys.t]);
			heatForm(ml.patient, d);
			// patient 의 x axis 값을 만들어준다.
			if (ml.axis.patient.x.indexOf(d[ml.keys.p]) < 0)	{
				ml.axis.patient.x.push(d[ml.keys.p]);
			}
		});
	}
	/*
		P, Q 의 값을 로그를 취한 값으로 변경 해주는 함수.
	 */
	function toLog (v)	{
		return Math.log(v) / Math.log(12) * -1;
	};
	/*
		PQ 배열을 도는 함수.
		이 함수에서는 x, y, value 형태의 리스트로 변환해준다.
	 */
	function loopingPq (p, v)	{
		var r = [];

		util.loop(p, function (d, i)	{
			r.push({ x: 0, y: d[ml.keys.g], value: toLog(d[v])});
		});

		return r;
	};
	/*
		여러개의 Group 배열을 만들어주는 함수.
	 */
	function loopingGroup (g)	{
		util.loop(g, function (d, i)	{
			var t = [];

			util.loop(d.data, function (dd, ii)	{
				var heat = [];

				util.loop(ml.heatmap, function (ddd, iii)	{
					if (dd[ml.keys.p] === ddd.x)	{
						heat.push(ddd);
					}
				});

				t.push({
					x: dd[ml.keys.p], 
					y: d.name, 
					value: dd.value,
					info: heat,
				});
			});
			ml.group.group.push(t);
			// Group 은 한 행의 heatmap 으로 되어 있기 때문에
			// 각 그룹 이름별로 배열을 만들어 axis 배열에 추가한다.
			ml.axis.group.y.push([d.name]);
			// Patient 의 Group 은 나누되 값을 NA 값으로 처리한다.
			ml.group.patient.push({
				x: ml.axis.patient.x[0], y: d.name, value: 'NA'
			});
		});
	};
	/*
		Min - Max 로 구성된 2개의 엘리먼트를 포함한 배열을 
		반환하는 배열.
	 */
	function linearAxis ()	{
		ml.axis.gene.x = [util.minmax(ml.axis.gene.x).max, 0];
		ml.axis.sample.y = [util.minmax(ml.axis.sample.y).max, 0];
		ml.axis.pq.x = [0, util.minmax(ml.pq.map(function (d)	{
			return Math.ceil(d.value);
		})).max];
	};
	/*
		축이 서수일 경우 서수 배열을 반환해주는 함수이다.
	 */
	function ordinalAxis ()	{
		ml.axis.pq.y = ml.gene;
		ml.axis.gene.y = ml.gene;
		ml.axis.heatmap.y = ml.gene;
		ml.axis.heatmap.x = ml.axis.sample.x;
		ml.axis.group.x = ml.axis.sample.x;
	};
	/*
		전체 mutation_list 에서 gene, partiant, 
		type 에 해당하는 키값을 골라내 준다.
	 */
	function mutualProps (g, i)	{
		var o = {};

		util.loop(i, function (k, v)	{
			if (g.indexOf(v) > -1)	{
				o.g = k;
			} else if (cl.color(cl.name(v)))	{
				o.t = k;
			} else {
				o.p = k;
			}
		});

		return o;
	};
	/*
		Mutational Landscape 의 전처리 실행 함수.
	 */
	preprocessing.landscape = function (d)	{
		// Move gene in data to model.landscape object.
		// ml.gene = d.gene;
		ml.gene = d.gene_list.map(function (d)	{
			return d.gene;
		});
		// Set key properties and looping each data.
		ml.keys = mutualProps(
		ml.gene, d.mutation_list.concat(d.patient_list)[0]);
		loopingMutation(d.mutation_list);
		loopingPatient(d.patient_list);
		loopingGroup(d.group_list);
		// set properties of model.landscape.
		ml.type = util.keyToArr(ml.type);	
		ml.pq = loopingPq(d.gene_list, d.pq || 'p');
		ml.stack.gene = mutStack('gene', ml.stack.gene);
		ml.stack.sample = mutStack('sample', ml.stack.sample);
		ml.stack.patient = mutStack('patient', ml.stack.patient);
		// Axis data for chart.
		linearAxis();
		ordinalAxis();

		console.log('Preprocess of Landscape: ', ml);
		return ml;
	};
	// ============== Mutational Landscape =================
	// ============== Expression =================
	/*
		Tpm 에 자연로그를 취해주는 함수.
	 */
	function tpmLog (tpm)	{
		return Math.log((tpm + 1)) / Math.LN2;
	};
	/*
		Scatter plot Y 축에 사용될
		데이터를 만들어 주는 함수.
	 */
	function expScatterMonths (list)	{
		exp.axis.scatter.y = {os: [], dfs: []};
		exp.patSubtype = {};

		util.loop(list, function (d)	{
			exp.axis.scatter.y.os.push((d.os_days / 30));
			exp.axis.scatter.y.dfs.push((d.dfs_days / 30));
			// Patient subtype object list 를 만든다.
			exp.patSubtype[d.participant_id] = d;
		});

		var osmm = util.minmax(exp.axis.scatter.y.os),
				dfsmm = util.minmax(exp.axis.scatter.y.dfs);

		exp.axis.scatter.y.os = [osmm.min, osmm.max];
		exp.axis.scatter.y.dfs = [dfsmm.min, dfsmm.max];
	};
	/*
		Sample 별 gene 들의 Tpm 값의 합을 
		저장하는 배열을 만드는 함수.
	 */
	function expTpmListBySample (d)	{
		exp.axis.heatmap.x[d.participant_id] ? 
		exp.axis.heatmap.x[d.participant_id].push({
			key: d.hugo_symbol, value: d.tpm
		}) : 
		exp.axis.heatmap.x[d.participant_id] = [{
			key: d.hugo_symbol, value: d.tpm
		}];
	};
	/*
		Tpm 의 최소값과 최대값을 구하는 함수.
	 */
	function expMinMaxTpm (tpms)	{
		var mm = util.minmax(tpms),
				md = util.median(tpms);

		exp.axis.gradient.x = [mm.min, md, mm.max];
		exp.axis.gradient.y = [''];
	};
	/*
		Function 이 Average 일 때 호출되는 함수.
	 */
	function expAvgOfFunc (data)	{
		util.loop(data, function (k, v)	{
			var sum = 0,
					avg = 0;

			util.loop(v, function (d)	{
				// Heatmap 의 y 축 데이터를 만들어준다.
				// TODO.
				// 나중에 따로 뺄 수 있는지 고민해봐야겠다.
				exp.axis.heatmap.y[d.key] = '';

				sum += d.value;
			});

			avg = sum / v.length;
			// Bar 데이터를 만들어준다. y 는 중간값이 되므로
			// 초기 호출된 함수에서 설정해준다.
			exp.bar.push({ 
				x: k, value: avg, info: exp.patSubtype[k]
			});
			exp.func.avg.push(avg);
		});

		exp.func.avg.sorted = exp.func.avg.sort(function (a, b)	{
			return a > b ? 1 : -1;
		});
		// Min, Median, Max 값도 구해준다.
		var amm = util.minmax(exp.func.avg),
				amd = util.median(exp.func.avg);

		exp.axis.bar.y = [amm.min, amd, amm.max];
	};
	/*
		Function 유형에 따라 min, median, max 값을
		정해주는 함수.
	 */
	function expMinMedMaxByFunc (func, data)	{
		return {
			average: expAvgOfFunc(data),
		}[func];
	};
	/*
		Average function 으로 데이터를 정렬해주는
		함수.
	 */
	function expAvgAlign (data)	{
		var avg = new Array().concat(exp.func.avg),
				r = [];
		// Bar 데이터를 이용하여 avg 로 정리된 value 값들의
		// index 를 대조해 Average 로 정렬된 데이터를 만들
		// 었다.
		util.loop(data, function (d)	{
			r[avg.indexOf(d.value)] = d.x;
		});

		exp.axis.heatmap.x = r;
	};
	/*
		Sample 의 순서를 Function 대로 다시 정해주는
		함수.
	 */
	function expAlignByFunc (func, data)	{
		return {
			average: expAvgAlign(data),
		}[func];
	};
	/*
		Cohort 리스트를 순회하는 함수.
		이 안에서 합과, 최소 & 최대값을 만들 것이다.
	 */
	function expCohortLoop (list)	{
		var func = exp.func.now || exp.func.default;

		util.loop(list, function (d, i)	{
			d.tpm = tpmLog(d.tpm + 1);

			expTpmListBySample(d);

			exp.tpms.push(d.tpm);
			// Heatmap 데이터를 재 포맷 해준다.
			exp.heatmap.push({
				x: d.participant_id, 
				y: d.hugo_symbol,
				value: d.tpm,
			});
		});

		expMinMaxTpm(exp.tpms);
		expMinMedMaxByFunc(func, exp.axis.heatmap.x);
		expAlignByFunc(func, exp.bar);

		// exp.axis.heatmap.x.sort(1);
		exp.axis.heatmap.y = util.keyToArr(exp.axis.heatmap.y);
		exp.axis.scatter.x = exp.axis.heatmap.x;
		exp.axis.bar.x = exp.axis.heatmap.x;
	};
	/*
		Subtype 에 따른 값을 정리해주는 함수.
	 */
	function toObjectExpSubtype (list)	{
		var obj = {};

		util.loop(list, function (d, i)	{
			!obj[d.subtype] ? 
			 obj[d.subtype] = [d.value] : 
			 obj[d.subtype].push(d.value);
		});

		return obj;
	};
	/*
		Subtype List 를 만드는 함수.
	 */
	function expSubtype (list)	{
		var tempObj = toObjectExpSubtype(list);

		util.loop(tempObj, function (k, v)	{
			exp.subtype.push({ key: k, value: v });
		});
	};
	/*
		Patient 데이터를 만들어준다. 어느 그룹에 속하는
		지를 결정한 데이터를 포함한다.
	 */
	function expMakePatientData (sample)	{
		var m = exp.axis.bar.y[1],
				p = exp.func.avg[exp.axis.bar.x.indexOf(sample)];

		return m >= p ? 'Low score group' : 'High score group';
	};
	/*
		Expression 의 Model 객체를 초기화 해준다.
	 */
	function initExpressionModel ()	{
		model.expression = {
			func: {
				default: 'average',
				now: null,
				avg: [],
			},
			tpms: [],
			heatmap: [],
			scatter: {},
			subtype: [],
			survival: {

			},
			bar: [],
			axis: {
				gradient: {x: {}, y: {}},
				heatmap: {x: {}, y: {}},
				scatter: {x: {}, y: {}},
				bar: {x: {}, y: {}},
			},
		};
		
		exp = model.expression;
	};

	preprocessing.expression = function (d)	{
		initExpressionModel();

		exp.allRna = new Array().concat(
			d.cohort_rna_list.concat(d.sample_rna_list));
		exp.genes = d.gene_list.map(function (d)	{
			return d.hugo_symbol;
		});

		expScatterMonths(d.patient_list);
		expSubtype(d.subtype_list);
		expCohortLoop(exp.allRna);
		// Patient 이름을 뽑아낸다.
		exp.patient = {
			name: d.sample_rna_list[0].participant_id,
			data: expMakePatientData(d.sample_rna_list[0].participant_id),
		};

		util.loop(exp.bar, function (d)	{
			d.y = exp.axis.bar.y[1];
		});

		console.log('Preprocessing of Expression: ', exp);
		return exp;
	};
	// ============== Expression =================

	return preprocessing;
}(preprocessing||{}));