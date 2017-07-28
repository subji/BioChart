var axis = (function (axis)	{
	'use strict';

	var model = {
		axies: {},
	};
	/*
		인자로 받은 값이 svg element 일 경우,
		id 문자열일 경우 또는 '#' symbol 이 빠진 문자열일
		경우를 분석하고 svg 를 반환한다.
	 */
	axis.element = function (e)	{	
		e = util.varType(e) === 'Object' ? 
		e : (/\W/).test(e[0]) ? 
		d3.select(e) : d3.select('#' + e);

		model.current = e;

		return axis;
	};
	/*
		d3 의 버전 (3, 4)에 따라서 호출되는 함수명이 다르므로
		이에 맞는 적절한 함수를 호출해주는 함수이다.
	 */
	axis.byVersion = function (s, l)	{
		return d3.axisTop ? v4Axis(s, l) : v3Axis(s, l);
	};
	/*
		v3 axis function.
	 */
	function v3Axis (s, l)	{
		return d3.svg.axis().scale(s).orient(l);
	};
	/*
		v4 axis function.
	 */
	function v4Axis (s, l)	{
		return d3['axis' + util.camelCase(l)](s);
	};	
	/*
		axis 에 옵션을 적용하는 함수이다.
	 */
	function options (a, o, d)	{
		util.loop(o, function (k, v)	{
			if (a[k])	{
				a[k](axis.option[k](d, v));
			}
		});

		return a;
	};
	/*
		tick, line, text 등을 지워주는 함수.
	 */
	function isRemove (g, r)	{
		return r ? g.selectAll(r).remove() : g;
	};
	/*
		Axis 관련 옵션들을 정의해주는 함수들을 모아놓은
		객체이다.
	 */
	axis.option = {
		/*
			tickValues 는 축에 표시될 값을 지정해주는 함수로서
			n 개의 값을 표시하고 싶을 때, n - 1 의 값으로 나눈
			몫을 0부터 더해주며 맨 끝값은 기존 데이터의 max 값으로
			채운다.
		 */
		tickValues: function (d, n)	{
			if (util.varType(n) === 'Array')	{
				return n;
			}

			var v = (util.minmax(d).max / (n - 1)),
					r = [];

			for (var i = 0; i < (n - 1); i++)	{
				r.push(i * v);
			}

			return (r.push(util.minmax(d).max), r);
		},
	};

	axis.top = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [m.top, m.left],
				c = scale.get(d.data, [m.left, s.w - m.right]),
				g = render.addGroup(
						model.current, p[0], p[1], 'top-axis'),
				o = d.opt ? d.opt : {};

		return g.call(options(
				axis.byVersion(c, 'top'), d.opt, d.data)), 
					 	 isRemove(g, o.remove), g;
	};
	/*
		축이 종 방향이고 축의 값이 왼쪽에 표기될때 호출되는 함수.
	 */
	axis.left = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [m.top, s.w - m.right],
				c = scale.get(d.data, [m.top, s.h - m.bottom]),
				g = render.addGroup(
						model.current, p[0], p[1], 'left-axis'),
				o = d.opt ? d.opt : {};

		return g.call(options(
			 	axis.byVersion(c, 'left'), d.opt, d.data)), 
					 	 isRemove(g, o.remove), g;
	};

	axis.bottom = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [s.h - m.bottom, m.left],
				c = scale.get(d.data, [m.left, s.w - m.right]),
				g = render.addGroup(
						model.current, p[0], p[1], 'bottom-axis'),
				o = d.opt ? d.opt : {};

		return g.call(options(
				axis.byVersion(c, 'bottom'), d.opt, d.data)), 
					 	 isRemove(g, o.remove), g;
	};

	axis.right = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [m.top, m.left],
				c = scale.get(d.data, [m.top, s.h - m.bottom]),
				g = render.addGroup(
						model.current, p[0], p[1], 'right-axis'),
				o = d.opt ? d.opt : {};

		return g.call(options(
				axis.byVersion(c, 'right'), d.opt, d.data)), 
					 	 isRemove(g, o.remove), g;
	};

	return axis;
}(axis || {}));
var bar = (function (bar)	{
	'use strict';
	
	var model = {};
	/*
		bar 의 방향에 따라 range 값을 반환해주는 함수.
	 */
	function range (d) {
		var x = [model.m.left, model.w - model.m.right], 
				y = [model.m.top, model.h - model.m.bottom];

		return {
			x: d === 'top' || d === 'bottom' || d === 'right' ? 
			x : x.reverse(), 
			y: d === 'left' || d === 'right' || d === 'bottom' ? 
			y : y.reverse()
		};
	};
	/*
		x, y 스케일 함수를 반환하는 함수.
	 */
	function setScale (d, a, w)	{
		return scale.get(a, range(d)[w]);
	};
	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.id = model.e.attr('id');
		model.w = o.width || model.e.attr('width') || 0;
		model.h = o.height || model.e.attr('height') || 0;
		model.m = size.setMargin(o.margin);
		model.data = o.data;
		model.direction = o.direction || 'top';
		model.g = render.addGroup(
		model.e, model.m.top, model.m.left, 'bar');
		model.dx = new Array().concat(o.xaxis);
		model.dy = new Array().concat(o.yaxis);
		model.sx = setScale(model.direction, model.dx, 'x');
		model.sy = setScale(model.direction, model.dy, 'y');
		/*
		 	Bar, Stacked Bar, ... 를 그려주는 렌더링 함수를 호출하는 부분.
		 */
		render.rect({
			element: model.g.selectAll('#' + model.id + '_rect'),
			data: model.data,
			attr: {
				id: function (d) { return model.id + '_rect'; },
				x: function (d, i) { 
					return o.attr.x ? 
								 o.attr.x(d, i, model) : o.attr.x(d); 
				},
				y: function (d, i) { 
					return o.attr.y ? 
								 o.attr.y(d, i, model) : o.attr.y(d); 
				},
				width: function (d, i) { 
					return o.attr.width ? 
								 o.attr.width(d, i, model) : 10; 
				},
				height: function (d, i) { 
					return o.attr.height ? 
								 o.attr.height(d, i, model) : 10; 
				},
			},
			style: {
				fill: function (d, i) { 
					return o.style.fill ? 
								 o.style.fill(d, i, model) : '#000000'; 
				},
				stroke: function (d, i) { 
					return o.style.stroke ? 
								 o.style.stroke(d, i, model) : '#FFFFFF'; 
				},
			},
			on: {
				mouseover: function (d, i)	{
					if (!o.on)	{ return false; }
					
					return o.on.mouseover ? 
								 o.on.mouseover.call(this, d, i, model) : false;
				},
				mouseout: function (d, i)	{
					if (!o.on)	{ return false; }
					
					return o.on.mouseout ? 
								 o.on.mouseout.call(this, d, i, model) : false;
				},
			},
		});

		return model;
	};
}(bar || {}));
var colorGradient = (function (colorGradient)	{
	'use strict';

	var model = {};
	/*
		Offset 과 색상을 설정하고 배열에 넣어주는 함수.
	 */
	function setOffset (off, col)	{
		model.offsets.show.push({offset: off, color: col});
		model.offsets.data.push({offset: off, color: col});
	};
	/*
		Gradiend 색상과 비율을 설정해주는 함수.
	 */
	function makeColorRate (o, c)	{
		var mm = util.minmax(o),
				cpo = new Array().concat(o)
												 .splice(1, o.length - 2);

		setOffset('0%', c[0]);
		util.loop(cpo, function (d, i)	{
			var v = Math.round((mm.max - mm.min) / d * 10);

			model.offsets.show.push({ 
				offset: v - model.adj + '%', 
				color: c[i + 1] 
			});
			model.offsets.data.push({ 
				offset: v + '%', 
				color: c[i + 1] 
			});
		});

		setOffset('100%', c[o.length - 1]);
	};

	return function (o)	{
		model = {offsets: {show:[], data: []}};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.adj = o.adjustValue || 0;
		model.id = o.id || 'linear_gradient';
		model.colors = o.colors || ['#000000', '#FFFFFF'];
		model.offset = o.offset || [0, 100];
		model.defs = model.e.append('defs');
		model.lineGradient = 
		model.defs.append('linearGradient').attr('id', model.id);

		makeColorRate(model.offset, model.colors)
		// Linear Gradient setting.
		model.lineGradient
			.selectAll('stop')
		  .data(model.offsets.show)
		  .enter().append('stop')
		  .attr('offset', function (d) { return d.offset; })
		  .attr('stop-color', function (d) { return d.color; });

		return model;
	};

}(colorGradient||{}));
'use strict';

var config = {
	exclusivity: {},
	expression: {},
	landscape: {},
	variants: {},
};
// For Mutational Landscape =========================
config.landscape.name = function (value)	{
	value = value.replace(/(_ins|_del)$/ig, '_indel');
	value = value.substring(0, 1).toUpperCase() + 
					value.substring(1).toLowerCase();

	return value;
};

config.landscape.case = function (mutation)	{
	switch (config.landscape.priority(
					config.landscape.name(mutation))) {
		case 0: return 'cnv'; break;
		case 1: return 'cnv'; break;
		default: return 'var'; break;
	}
};

config.landscape.priority = function (value)	{
	return {
		'Amplification': 0,
		'Homozygous_deletion': 1,
		'Nonsense_mutation': 2,
		'Splice_site': 3,
		'Translation_start_site': 4,
		'Missense_mutation': 5,
		'Start_codon_snp': 5,
		'Nonstop_mutation': 6,
		'Frame_shift_indel': 7,
		'Stop_codon_indel': 7,
		'In_frame_indel': 8,
		'Silent': 9,
		'Rna': 10,
		'Intron': 11,
		'5\'utr': 11,
		'3\'utr': 11,
		'Igr': 11,
	}[value];
};

config.landscape.orderedName = [
	// Mutation.
		'Amplification',
		'Homozygous_deletion',
		'Nonsense_mutation',
		'Splice_site',
		'Translation_start_site',
		'Missense_mutation',
		'Start_codon_snp',
		'Nonstop_mutation',
		'Frame_shift_indel',
		'Stop_codon_indel',
		'In_frame_indel',
		'Silent',
		'Rna',
		'Intron',
		'5\'utr',
		'3\'utr',
		'Igr',
		// Group.
		// Vital Status of Group.
		'alive',
		'dead',
		// Gender of Group.
		'female',
		'male',
		// Race of Group.
		'american indian or alaska native',
		'asian',
		'black or african american',
		'white',
		// Ethnicity of Group.
		'hispanic or latino',
		'not hispanic or latino',
		// Histological Type of Group.
		'lung acinar adenocarcinoma',
		'lung adenocarcinoma mixed subtype',
		'lung adenocarcinoma- not otherwise specified (nos)',
		'lung bronchioloalveolar carcinoma mucinous',
		'lung bronchioloalveolar carcinoma nonmucinous',
		'lung clear cell adenocarcinoma',
		'lung micropapillary adenocarcinoma',
		'lung mucinous adenocarcinoma',
		'lung papillary adenocarcinoma',
		'lung signet ring adenocarcinoma',
		'lung solid pattern predominant adenocarcinoma',
		'mucinous (colloid) carcinoma',
		// Anatomic Neoplasm Subdivision of Group.
		'bronchial',
		'l-lower',
		'l-upper',
		'other (please specify)',
		'r-lower',
		'r-middle',
		'r-upper',
		// Other Dx of Group.
		'no',
		'yes',
		'yes, history of prior malignancy',
		'yes, history of synchronous/bilateral malignancy',
		// History of Neoadjuvant Treatment of Group.
		'no',
		'yes',
		// Radiation Therapy of Group.
		'no',
		'yes',
		// Pathologic T of Group.
		't1',
		't1a',
		't1b',
		't2',
		't2a',
		't2b',
		't3',
		't4',
		'tx',
		// Pathologic N of Group.
		'n0',
		'n1',
		'n2',
		'n3',
		'nx',
		// Pathologic M of Group.
		'm0',
		'm1',
		'm1a',
		'm1b',
		'mx',
		// Pathologic Stage of Group.
		'stage i',
		'stage ia',
		'stage ib',
		'stage ii',
		'stage iia',
		'stage iib',
		'stage iiia',
		'stage iiib',
		'stage iv',
		// Residual Tumor of Group.
		'r0',
		'r1',
		'r2',
		'rx',
		// EGFR Mutation Result.
		'exon 19 deletion',
		'l858r',
		'l861q',
		'other',
		't790m',
		// KRAS Mutation Result.
		'g12a',
		'g12c',
		'g12d',
		'g12s',
		'g12v',
		'other',
		// Primary Therapy Outcome Success.
		'complete remission/response',
		'partial remission/response',
		'progressive disease',
		'stable disease',
		// Followup Treatment Success.
		'complete remission/response',
		'partial remission/response',
		'progressive disease',
		'stable disease',
		// Tobacco Smoking History.
		'Lifelong Non-Smoker',
		'Current Smoker',
		'Current Reformed Smoker for > 15 yrs',
		'Current Reformed Smoker for < or = 15 yrs',
		'Current Reformed Smoker, Duration Not Specified',
		'NA',
];

config.landscape.color = function (value)	{
	return {
		// Mutation.
		'Amplification': '#FFBDE0',
		'Homozygous_deletion': '#BDE0FF',
		'Nonsense_mutation': '#EA3B29',
		'Splice_site': '#800080',
		'Translation_start_site': '#AAA8AA',
		'Missense_mutation': '#3E87C2',
		'Start_codon_snp': '#3E87C2',
		'Nonstop_mutation': '#070078',
		'Frame_shift_indel': '#F68D3B',
		'Stop_codon_indel': 'F68D3B',
		'In_frame_indel': '#F2EE7E',
		'Silent': '#5CB755',
		'Rna': '#FFDF97',
		'Intron': '#A9A9A9',
		'5\'utr': '#A9A9A9',
		'3\'utr': '#A9A9A9',
		'Igr': '#A9A9A9',
		// Group.
		// Vital Status of Group.
		'alive': '#04CDA4',
		'dead': '#C50E36',
		// Gender of Group.
		'female': 'E0A4E5',
		'male': '#0F67B6',
		// Race of Group.
		'american indian or alaska native': '#38120B',
		'asian': '#CB771F',
		'black or african american': '#302F24',
		'white': '#9CB1CE',
		// Ethnicity of Group.
		'hispanic or latino': '#B8642F',
		'not hispanic or latino': '#55C53E',
		// Histological Type of Group.
		'lung acinar adenocarcinoma': '#716190',
		'lung adenocarcinoma mixed subtype': '#5154DE',
		'lung adenocarcinoma- not otherwise specified (nos)': '#8E9A7E',
		'lung bronchioloalveolar carcinoma mucinous': '#2F91DE',
		'lung bronchioloalveolar carcinoma nonmucinous': '#ED6EBD',
		'lung clear cell adenocarcinoma': '#1C8D7A',
		'lung micropapillary adenocarcinoma': '#B2EE86',
		'lung mucinous adenocarcinoma': '#785E54',
		'lung papillary adenocarcinoma': '#69B4C4',
		'lung signet ring adenocarcinoma': '#C1386E',
		'lung solid pattern predominant adenocarcinoma': '#D7A355',
		'mucinous (colloid) carcinoma': '#243833',
		// Anatomic Neoplasm Subdivision of Group.
		'bronchial': '#F9E3B9',
		'l-lower': '#FBA2A3',
		'l-upper': '#0CA3C7',
		'other (please specify)': '#D3A16C',
		'r-lower': '#388A4E',
		'r-middle': '#D61E43',
		'r-upper': '#B81BCC',
		// Other Dx of Group.
		'no': '#D73A64',
		'yes': '#1990AA',
		'yes, history of prior malignancy': '#3BDB11',
		'yes, history of synchronous/bilateral malignancy': '#803F11',
		// History of Neoadjuvant Treatment of Group.
		'no': '#D73A64',
		'yes': '#1990AA',
		// Radiation Therapy of Group.
		'no': '#D73A64',
		'yes': '#1990AA',
		// Pathologic T of Group.
		't1': '#060CDB',
		't1a': '#696DE9',
		't1b': '#CDCEF7',
		't2': '#F6251D',
		't2a': '#F96D69',
		't2b': '#FDCECD',
		't3': '#1AEB42',
		't4': '#EBBD34',
		'tx': '#9943DE',
		// Pathologic N of Group.
		'n0': '#DC5B35',
		'n1': '#217C1F',
		'n2': '#18A6F3',
		'n3': '#EA68C3',
		'nx': '#F4E831',
		// Pathologic M of Group.
		'm0': '#F0820D',
		'm1': '#C45A43',
		'm1a': '#A523C2',
		'm1b': '#C97BDA',
		'mx': '#EDD3F2',
		// Pathologic Stage of Group.
		'stage i': '#01C606',
		'stage ia': '#018404',
		'stage ib': '#002C01',
		'stage ii': '#0E22C3',
		'stage iia': '#08136C',
		'stage iib': '#040B41',
		'stage iiia': '#BB0C2E',
		'stage iiib': '#75081D',
		'stage iv': '#F0CA53',
		// Residual Tumor of Group.
		'r0': '#DB8EC0',
		'r1': '#FFD046',
		'r2': '#495C50',
		'rx': '#0E5F8A',
		// EGFR Mutation Result.
		'exon 19 deletion': '#4A312A',
		'l858r': '#74C04C',
		'l861q': '#FBED09',
		'other': '#C91DAB',
		't790m': '#2C517B',
		// KRAS Mutation Result.
		'g12a': '#DED0D1',
		'g12c': '#AE8A8E',
		'g12d': '#5D161D',
		'g12s': '#410F14',
		'g12v': '#25080B',
		'other': '#C91DAB',
		// Primary Therapy Outcome Success.
		'complete remission/response': '#BDED73',
		'partial remission/response': '#8649F3',
		'progressive disease': '#C1746B',
		'stable disease': '#CD4C2A',
		// Followup Treatment Success.
		'complete remission/response': '#BDED73',
		'partial remission/response': '#8649F3',
		'progressive disease': '#C1746B',
		'stable disease': '#CD4C2A',
		// Tobacco Smoking History.
		'Lifelong Non-Smoker': '#C4B5BB',
		'Current Smoker': '#896C78',
		'Current Reformed Smoker for > 15 yrs': '#3B0A1E',
		'Current Reformed Smoker for < or = 15 yrs': '#2F0818',
		'Current Reformed Smoker, Duration Not Specified': '#17040C',
		'NA': '#D6E2E3',
	}[value];
};
// ===================== Mutatinonal Landscape =================
/*
	Sample, Patient_sample 이 그려지는 차트의 속성과 모양 정의 객체.
 */
config.landscape.sample = {
	attr: {
		x: function (d, i, m) {
			return d.x.indexOf('-') > -1 ? 
						 m.sx(d.x) : m.sx(d.x) + 3;
		},
		y: function (d, i, m) {
			return m.sy(util.minmax(m.dy).max) - 
						 m.sy(d.y + d.value) + 
						 m.sy(util.minmax(m.dy).min);
		},
		width: function (d, i, m) {
			return d.x.indexOf('-') > -1 ? 
						 scale.compatibleBand(m.sx) : 
						 scale.compatibleBand(m.sx) - 7.5
		},
		height: function (d, i, m) {
			return m.sy(d.value) - m.sy(util.minmax(m.dy).min);
		},	
	},
	style: {
		fill: function (d, i, m)	{ 
			return config.landscape.color(d.info); 
		},
		stroke: function (d, i, m) { 
			return '#FFFFFF'; 
		},
	},
	on: {
		mouseover: function (d, i, m)	{
			tooltip({
				element: this,
				contents: '<b>' + d.x + '</b></br>' + 
									'Type: <b>' + d.info + '</b></br>' + 
									'Count: <b>' + d.value + '</b>',
									
			});

			d3.select(this)
				.transition().duration(50)
				.style('stroke', '#333333');
		},
		mouseout: function (d, i, m)	{
			tooltip('hide');

			d3.select(this)
				.transition().duration(50)
				.style('stroke', '#FFFFFF');
		},
	},
};
/*
	Gene 이 그려지는 차트의 속성과 모양 정의 객체.
 */
config.landscape.gene = {
	attr: {
		x: function (d, i, m) {
			return m.sx(util.minmax(m.dx).max - d.x) - 
						 m.sx(d.value) + m.m.left;
		},
		y: function (d, i, m) {
			return m.sy(d.y);
		},
		width: function (d, i, m) {
			return m.sx(d.value) - m.m.left;
		},
		height: function (d, i, m) { 
			return scale.compatibleBand(m.sy); 
		},
	},
	style: {
		fill: function (d, i, m)	{ 
			return config.landscape.color(d.info); 
		},
		stroke: function (d, i, m) { 
			return '#FFFFFF'; 
		},	
	},
	on: {
		mouseover: function (d, i, m)	{
			tooltip({
				element: this,
				contents: '<b>' + d.y + '</b></br>' + 
									'Type: <b>' + d.info + '</b></br>' + 
									'Count: <b>' + d.value + '</b>',
									
			});

			d3.select(this)
				.transition().duration(50)
				.style('stroke', '#333333');
		},
		mouseout: function (d, i, m)	{
			tooltip('hide');

			d3.select(this)
				.transition().duration(50)
				.style('stroke', '#FFFFFF');
		},
	},
};
/*
	pq 가 그려지는 차트의 속성과 모양 정의 객체.
 */
config.landscape.pq = {
	attr: {
		x: function (d, i, m) { 
			return m.sx(util.minmax(m.dx).min); 
		},
		y: function (d, i, m) { 
			return m.sy(d.y); 
		},
		width: function (d, i, m) { 
			return m.sx(d.value); 
		},
		height: function (d, i, m) { 
			return scale.compatibleBand(m.sy); 
		},
	},
	style: {
		fill: function (d, i, m)	{ 
			return '#BFBFBF'; 
		},
		stroke: function (d, i, m) { 
			return '#FFFFFF'; 
		},
	},
	on: {
		mouseover: function (d, i, m)	{
			tooltip({
				element: this,
				contents: '<b>' + d.y + '</b></br>' + 
									'Value: <b>' + d.value + '</b>',
									
			});

			d3.select(this)
				.transition().duration(50)
				.style('stroke', '#333333');
		},
		mouseout: function (d, i, m)	{
			tooltip('hide');

			d3.select(this)
				.transition().duration(50)
				.style('stroke', '#FFFFFF');
		},
	},
};
/*
	heatmap 이 그려지는 차트의 속성과 모양 정의 객체.
 */
config.landscape.heatmap = {
	attr: {
		x: function (d, i, m)	{
			return m.sx(d.x);
		},
		y: function (d, i, m)	{
			return config.landscape.case(d.value) !== 'cnv' ? 
						(scale.compatibleBand(m.sy) / 3) + m.sy(d.y) : 
						 m.sy(d.y);
		},
		width: function (d, i, m)	{
			return scale.compatibleBand(m.sx);
		},
		height: function (d, i, m)	{
			return config.landscape.case(d.value) !== 'cnv' ? 
						 scale.compatibleBand(m.sy) / 3 : 
						 scale.compatibleBand(m.sy);
		},
	},
	style: {
		fill: function (d, i, m)	{
			return config.landscape.color(d.value);
		},
		stroke: function (d, i, m)	{
			return '#FFFFFF';
		}
	},
	on: {
		mouseover: function (d, i, m)	{
			tooltip({
				element: this,
				contents: '<b>Gene mutations</b></br>' + 
									'X: <b>' + d.x + '</b></br>' + 
									'Y: <b>' + d.y + '</b></br>' + 
									'Type: <b>' + d.value + '</b>',
									
			});

			d3.select(this)
				.transition().duration(50)
				.style('stroke', '#333333');
		},
		mouseout: function (d, i, m)	{
			tooltip('hide');

			d3.select(this)
				.transition().duration(50)
				.style('stroke', '#FFFFFF');
		},
	},
};
/*
	Group 이 그려지는 차트의 속성과 모양의 객체.
 */
config.landscape.group = {
	attr: {
		x: function (d, i, m) {
			return m.sx(d.x);
		},
		y: function (d, i, m) {
			return m.sy(d.y);
		},
		width: function (d, i, m) {
			return scale.compatibleBand(m.sx);
		},
		height: function (d, i, m) {
			return scale.compatibleBand(m.sy);
		},
	},
	style: {
		fill: function (d, i, m) { 
			return config.landscape.color(d.value); 
		},
		stroke: function (d, i, m) { 
			return '#FFFFFF'; 
		},
	},
	on: {
		mouseover: function (d, i, m)	{
			tooltip({
				element: this,
				contents: '<b>' + d.y + '</b></br>' + 
									'Sample: <b>' + d.x + '</b></br>' + 
									'Value: <b>' + d.value + '</b></br>',
									
			});

			d3.select(this)
				.transition().duration(50)
				.style('stroke', '#333333');
		},
		mouseout: function (d, i, m)	{
			tooltip('hide');

			d3.select(this)
				.transition().duration(50)
				.style('stroke', '#FFFFFF');
		},
	},
};
/*
	Landscape 의 범례 설정 객체.
 */
config.landscape.legend = {
	attr: {
		x: function (d, i, m) {
			var x = m.dr === 'h' ? (m.p * 2 + m.mw) * i : 0;

			return m.isText ? (x + m.p * 2) : x;
		},
		y: function (d, i, m) { 
			var h = m.height || 15,
					y = m.dr === 'h' ? 0 : ((m.p + m.mh) * i);

			if (m.isText)	{
				return y + m.mh - m.mh / 2.5;
			} else {
				if (config.landscape.case(d))	{
					return config.landscape.case(d) === 'var' ? 
								 y + h / 3 : y;
				}
			}	

			return y;
		},
		width: function (d, i, m) {
			return m.width || 5;
		},
		height: function (d, i, m) { 
			var h = m.height || 15;

			return config.landscape.case(d) ? 
						 config.landscape.case(d) === 'var' ? 
						 h / 3 : h : h;
		},
	},
	style: {
		fill: function (d, i, m) { 
			return m.isText ? '#333333' : 
						 config.landscape.color(d); 
		},
		stroke: function (d, i, m) { 
			return '#FFFFFF'; 
		},	
		fontFamily: function (d, i, m) { 
			return 'Times Roman'; 
		},
		fontSize: function (d, i, m) { 
			return '12px'; 
		},
	},
	text: function (d, i, m)	{ 
		return d; 
	},
}

/*
	Mutational Landscape 의 Axis 설정 객체.
 */
config.landscape.axis = {
	sample: {
		direction: 'left', 
		margin: [5, 0, 10, 5], 
		opt: { tickValues: 3 }
	},
	group: {
		direction: 'right', 
		margin: [0, 15, 0, 0], 
		opt: { remove: 'line, path' }
	},
	gene: [{
		direction: 'right', 
		margin: [5, 150, 40, 0], 
		opt: { remove: 'line, path' }
	},
	{
		direction: 'bottom', 
		margin: [0, 10, 35, 71], 
		opt: { tickValues: 3 }
	}],
	pq: {
		direction: 'bottom', 
		margin: [0, 10, 35, 20], 
		opt: { tickValues: 3 }
	},
};
/*
	Mutational Landscape 의 PQ 설정 객체.
 */
config.landscape.bar = {
	pq: {
		direction: 'right', 
		margin: [5, 10, 41, 30], 
		xaxis: function () {
			return this.pq.x;
		}, 
		yaxis: function () {
			return this.pq.y;
		}, 
		attr: config.landscape.pq.attr, 
		style: config.landscape.pq.style,
		on: config.landscape.pq.on,
	},
};
/*
	Landscape 의 patient, sample, gene stack 설정 객체.
 */
config.landscape.stack = {
	patient: {
		direction: 'top', 
		margin: [5, 0, 10, 0], 
		xaxis: function () {
			return this.patient.x;
		}, 
		yaxis: function () {
			return this.sample.y
		}, 
		attr: config.landscape.sample.attr, 
		style: config.landscape.sample.style,
		on: config.landscape.sample.on,
	},
	sample: {
		direction: 'top', 
		margin: [5, 1, 10, 1], 
		xaxis: function () {
			return this.sample.x;
		}, 
		yaxis: function () {
			return this.sample.y;
		}, 
		attr: config.landscape.sample.attr, 
		style: config.landscape.sample.style,
		on: config.landscape.sample.on,
	},
	gene: {
		direction: 'left', 
		margin: [5, 10, 41, 70], 
		xaxis: function () {
			return this.gene.x;
		}, 
		yaxis: function () {
			return this.gene.y;
		}, 
		attr: config.landscape.gene.attr, 
		style: config.landscape.gene.style,
		on: config.landscape.gene.on,
	},
};
/*
	Heatmap of landscape configuration object.
 */
config.landscape.heatmap = {
	heatmap: {
		direction: 'left', 
		margin: [5, 1, 41, 1], 
		opt: {}, 
		xaxis: function () {
			return this.sample.x;
		}, 
		yaxis: function () {
			return this.gene.y;
		}, 
		attr: config.landscape.heatmap.attr, 
		style: config.landscape.heatmap.style,
		on: config.landscape.heatmap.on,
	},
	patient: {
		direction: 'left', 
		margin: [5, 1, 41, 3.5], 
		opt: {}, 
		xaxis: function () {
			return this.patient.x;
		}, 
		yaxis: function () {
			return this.gene.y;
		}, 
		attr: config.landscape.heatmap.attr, 
		style: config.landscape.heatmap.style,
		on: config.landscape.heatmap.on,
	},
};
/*
	Group heatmap of landscape configuration object.
 */
config.landscape.group = {
	group: {
		direction: 'left', 
		margin: [2, 1, 4, 1], 
		opt: {}, 
		xaxis: function () {
			return this.sample.x;
		}, 
		attr: config.landscape.group.attr, 
		style: config.landscape.group.style,
		on: config.landscape.group.on,
	},
	patient: {
		direction: 'left', 
		margin: [2, 1, 4, 4], 
		opt: {}, 
		xaxis: function () {
			return this.patient.x;
		}, 
		attr: config.landscape.group.attr, 
		style: config.landscape.group.style,
		on: config.landscape.group.on,
	},
};
// ===================== Mutatinonal Landscape ==================
// ===================== Mutual Exclusivity =====================
/*
	하나 이상의 variant 로 구성된 symbol 을 해체해주는 함수.
 */
config.exclusivity.separate = function (v)	{
	// 배열을 할때, 0번째 엘리먼트는 배경, 1번째 엘리먼트는 실제 엘리먼트가 
	// 되어야 한다.
	return v === 'B' ? ['A', 'M'] : v === 'E' ? ['D', 'M'] : 
				 v === 'M' ? ['.', 'M'] : [v];
};
/*
	Config.landscape.case 에서 분류된 종류와 이름을 토대로
	Exclusivity 에서도 다시 분류해준다.
 */
config.exclusivity.case = function (v, n)	{
	if (v === 'var')	{
		return 'Mutation';
	} else {
		if (n.toUpperCase().indexOf('AMP') > -1)	{
			return 'Amplification';
		} else {
			return 'Deletion';
		}
	}
};
/*
	Exclusivity Name 을 Symbol 로 변경해주는 함수.
 */
config.exclusivity.symbol = function (name)	{
	return {
		'Amplification': 'A',
		'Deletion': 'D',
		'Mutation': 'M',
		'None': '.',
	}[name];
};
/*
	Exclusivity symbol 이 갖는 이름을 정의한 함수.
 */
config.exclusivity.name = function (value)	{
	return {
		'A': 'Amplification',
		'D': 'Deletion',
		'M': 'Mutation',
		'.': 'None',
	}[value];
};
/*
	Exclusivity 우선순위를 정해주는 함수.
 */
config.exclusivity.priority = function (value)	{
	return { 
		'Amplification': 0, 
		'Deletion': 1, 
		'Mutation': 2, 
		'None': 3 
	}[value];
};
/*
	Symbol 별 색상을 정의한 함수.
 */
config.exclusivity.color = function (value)	{
	return {
		'Amplification': '#FFBDE0',
		'Deletion': '#BDE0FF',
		'Mutation': '#5CB755',
		'None': '#D3D3D3',
	}[value];
};

config.exclusivity.legend = {
	margin: [20, 80, 0, 0],
	attr: {
		x: function (d, i, m) {
			var x = m.dr === 'h' ? (m.p * 10 + m.mw) * i : 0;

			return m.isText ? (x + m.p * 2) : x;
		},
		y: function (d, i, m) { 
			var h = m.height || 15,
					y = m.dr === 'h' ? 0 : ((m.p + m.mh) * i);

			return m.isText ? y + m.mh - m.mh / 2 : 
						 d === 'Mutation' ? y + h / 3 : y;
		},
		width: function (d, i, m) {
			return m.width || 5;
		},
		height: function (d, i, m) { 
			var h = m.height || 15;

			return d === 'Mutation' ? h / 3 : h;
		},
	},
	style: {
		fill: function (d, i, m)	{
			if (!m.isText)	{ 
				return config.exclusivity.color(d); 
			}
		},
	},
	text: function (d, i, m)	{
		return d;
	},
};
/*
	heatmap of exclusivity configuration object.
 */
config.exclusivity.heatmap = {
	margin: [35, 40, 35, 50],
	attr: {
		x: function (d, i, m)	{
			return m.sx(d.x);
		},
		y: function (d, i, m)	{
			return d.value === 'Mutation' ? 
						 m.sy(d.y) + scale.compatibleBand(m.sy) / 3 : 
						 m.sy(d.y);
		},
		width: function (d, i, m)	{
			return scale.compatibleBand(m.sx);
		},
		height: function (d, i, m)	{
			return d.value === 'Mutation' ? 
						 scale.compatibleBand(m.sy) / 3 : 
						 scale.compatibleBand(m.sy);
		},
	},
	style: {
		fill: function (d, i, m)	{
			return config.exclusivity.color(d.value);
		},
		stroke: function (d, i, m)	{
			return false;
		},
	},
};
/*
	Division of exclusivity configuration object.
 */
config.exclusivity.division = {
	margin: [10, 40, 0, 50],
	attr: {
		x: function (d, i, m) {
			return i > 0 ? m.isText ? 
						 m.scale(m.axis[m.axis.length - 1]) - 
						 draw.getTextWidth(d.text, m.font) - m.padding : 
						 m.scale(d.point) : m.isText ? 
						 m.m.left + m.padding : m.m.left;
		},
		y: function (d, i, m) {
			return m.isText ? 
						 m.m.top + (m.textHeight + m.padding): 
						 m.m.top;
		},
		width: function (d, i, m) {
			return i > 0 ? 
						 m.w - m.scale(d.point) - m.m.right : 
						 m.scale(d.point) - m.m.left;
		},
		height: function (d, i, m) {
			return m.textHeight + m.padding * 4;
		},
		rx: function (d, i, m) {
			return 3;
		},
		ry: function (d, i, m) {
			return 3;
		},
	},
	style: {
		fill: function (d, i, m) {
			return m.isText ? '#FFFFFF' : d.color;
		},
		stroke: function (d, i, m)	{
			return m.isLine ? '#000000' : '#FFFFFF';
		},
		dashed: function (d, i, m) {
			return '4,2';
		},
	},
	line: {
		x: function (m) {
			return m.scale(m.point);
		},
		y: function (m) {
			return m.m.left + m.m.top * 1.2;
		},
	},
	text: function (d, i, m)	{
		return d.text;
	},
};
/*
	Sample (patient symbol) of exclusivity configuration object.
 */
config.exclusivity.sample = {
	survival: {
		attr: {
			x: function (d, i, m)	{
				return m.data.sample.isAltered.indexOf(d.text) > -1 ? 
							 draw.getTextWidth(d.text, '15px') + 
							 draw.getTextWidth(d.text, '15px') / 4 : -5;
			},
			y: function (d, i, m)	{
				return m.data.sample.isAltered.indexOf(d.text) > -1 ? 
							 draw.getTextHeight('15px').height / 1.3 : 0;
			},
		},
		style: {
			fill: function (d, i, m)	{
				return m.data.sample.isAltered.indexOf(d.text) > -1 ? 
							 d.color : '#FFFFFF';
			},
			fontSize: function (d, i, m) {
				return '25px';
			},
		},
		text: function (d, i, m)	{
			return m.data.sample.isAltered.indexOf(d.text) > -1 ? 
						 ' **' : '';
		},
	},
	division: {
		margin: [15, 80, 0, 50],
		attr: {
			x: function (d, i, m)	{
				return d.type.indexOf('Altered group') > -1 ? 
						   0 : m.e.attr('width') - m.m.left - 
						      (m.m.left - m.m.right);
			},
			y: function (d, i, m)	{
				return 0;
			},
		},
		style: {
			fill: function (d, i, m)	{
				return d.type.indexOf('Altered group') > -1 ? 
							'#FF6252' : '#00AC52';
			},
		},
		text: function (d, i, m)	{
			return d.value;
		},
	},
	legend: {
		margin: [35, 80, 0, 0],
		attr: {
			x: function (d, i, m)	{
				if (m.isText)	{
					if (i === 0)	{
						return 0;	
					} else if (i === 1)	{
						return draw.getTextWidth(m.d[0], '25px') + 5;	
					} else {
						return draw.getTextWidth(
												m.d[0].toUpperCase(), m.font) + 
									 draw.getTextWidth(
									 			m.d[1].toUpperCase(), m.font) - 
									 draw.getTextWidth('a', m.font);	
					}
				}
			},
			y: function (d, i, m)	{
				if (i > 0)	{
					return -draw.getTextHeight('25px').height / 5;
				} 

				return 0;
			},
		},
		style: {
			fill: function (d, i, m)	{
				if (m.isText)	{
					if (i === 1)	{
						return '#333';	
					} else {
						return m.d[2].toUpperCase().indexOf('UN') > -1 ? 
									'#00AC52' : '#FF6252';
					}
				}
			},
			fontSize: function (d, i, m)	{
				return i === 0 ? '25px' : m.font;
			},
		},
		text: function (d, i, m)	{
			return d;
		},
	},
};
// ===================== Mutual Exclusivity =====================
// ======================= Variants ===========================
/*
	Legend of variants configuraion object.
 */
config.variants.legend = {
	margin: [20, 10, 0, 0],
	attr: {
		x: function (d, i, m) { 
			var x = m.dr === 'h' ? 
						 (m.p * 10 + m.mw) * i : m.isText ? m.p : 0;

			return m.isText ? (x + m.p * 2) : x;
		},
		y: function (d, i, m) { 
			return m.isText ? m.mh * i + 7 * i + 1 : 
												m.mh * i + 7 * i;
		},
		r: function (d, i, m) {
			return 5;
		},
	},
	style: {
		fontSize: function (d, i, m) {
			return '12px'
		},
		fill: function (d, i, m) {
			return m.isText ? '#333333' : config.landscape.color(d);
		},
		stroke: function (d, i, m)	{
			return '#333333';
		},
	},
	text: function (d, i, m) {
		return draw.textOverflow(d, 
					 config.variants.legend.style.fontSize(), m.mw, 0);
	},
};

config.variants.needle = {
	margin: [20, 30, 80, 60],
	/*
		Needle plot 의 원의 크기를 정하는 함수.
		값이 지름이 된다는 가정하에 크기를 구한다.
	 */
	radius: function (count) 	{
		return Math.sqrt(count) * 3 / 1.25;
	},
	attr: {
		x: function (d, i, m)	{
			if (m.sx(d.x) < m.m.left)	{
				return -m.m.left;
			} else if (m.sx(d.x) > m.w - m.m.right)	{
				return m.w;
			}

			return m.sx(d.x);
		},
		y: function (d, i, m)	{
			return m.sy(d.y);
		},
		r: function (d, i, m)	{
			return d.value ? config.variants.needle.radius(d.value) : 
											 m.radius;
		},
	},
	style: {
		fill: function (d, i, m)	{ 
			return d.info ? 
						 config.landscape.color(d.info[0].type) : false;
		},
		stroke: function (d, i, m)	{
			return '#333333';
		},
	},
	on: {
		mouseover: function (d, i, m)	{
			draw.toFront(this);

			tooltip({
				element: this,
				contents: 'Type: <b>' + d.info[0].type + '</b></br>' + 
									'AAChange: <b>' + 
									 d.info[0].aachange + '</b></br>' +
									'Counts: <b>' + d.y + '</b></br>' + 
									'Position: <b>' + d.x + '</b></br>',
									
			});
		},
		mouseout: function (d, i, m)	{
			draw.toBack(this);

			tooltip('hide');
		},
	},
};
/*
	Graph on needleplot of variants configuration object.
 */
config.variants.needleGraph = {
	margin: [0, 30, 60, 60],
	now: { width: {} },
	attr: {
		x: function (d, i, m)	{
			var start = m.sx(d.x) > m.m.left ? 
									m.sx(d.x) : m.m.left;

			return m.isText ? start + 5 : start;
		},
		y: function (d, i, m)	{
			return m.isText ? 
			draw.getTextHeight(
			draw.getFitTextSize(
				d.info.identifier, m.w, m.sh)).height / 2 + 1 : 0;
		},
		width: function (d, i, m)	{
			var r = 0,
					s = m.sx(d.x),
					w = m.sx(d.x + d.width),
					cv = config.variants.needleGraph;

			if (s < m.m.left)	{
				r = w - m.m.left < 0 ? 0 : w - m.m.left;
			} else if (w > (m.w - m.m.right))	{
				r = s > (m.w - m.m.right) ? 0 : 
					 		 	(m.w - m.m.right) - s + 2;
			} else {
				r = w - s;				
			}

			return cv.now.width[d.info.identifier] = r;
		},
		height: function (d, i, m)	{
			return m.sh;
		},
	},
	style: {
		fill: function (d, i, m)	{
			return m.isText ? '#FFFFFF' : d.color;
		},
		stroke: function (d, i, m)	{
			return '#FFFFFF';
		},
		fontSize: function (d, i, m)	{
			return parseFloat(draw.getFitTextSize(
							d.info.identifier, 
							m.sx(d.x + d.width) - m.sx(d.x), 
							m.sh / 1.5));
		},
	},
	on: {
		mouseover: function (d, i, m)	{
			tooltip({
				element: this,
				contents: 
					'<b>' + d.info.identifier + '</b></br>' + 
					'Desc: <b>' + d.info.description + '</b></br>' + 
					'Section: <b>' + d.x + 
					' - ' + (d.x + d.width) + '</b>'

			});
		},
		mouseout: function (d, i, m)	{
			tooltip('hide');
		},
	},
	text: function (d, i, m) {
		var nw = config.variants.needleGraph
									 .now.width[d.info.identifier],
				width = m.sx(d.x + d.width) - m.sx(d.x);

		return draw.textOverflow(d.info.identifier, 
					 draw.getFitTextSize(d.info.identifier, 
					 	width, m.sh / 1.5), nw, 5);
	},
};
/*
	Axises of variants configuration object.
 */
config.variants.axis = {
	left: { margin: [20, 60, 80, 0] },
	top: { margin: [2, 30, 0, 60] },
};
/*
	Navigation of variants configuration object.
 */
config.variants.navi = {
	margin: [0, 30, 5, 60],
	start: { init: 0, now: 0 },
	end: { init: 0, now: 0 },
	navi: { init: 0, now: 0, width: 0, nowWidth: 0 },
	style: {
		fill: function (d, i, m) {
			var c = d.info ? 
							d3.rgb(config.landscape.color(
											d.info[0].type)) : false;

			m.lg.selectAll('path')
				 .style('stroke', 'rgba(0, 0, 0, 0.1)');
			
			return c ? (c.opacity = 0.3, c) : false;
		},
	},
	drag: {
		drag: function (d, i, m)	{
 			var cv = config.variants.navi,
 					r = d3.select('#variants_navi_chart_navi');
			/*
				Start, end 값을 설정하고 반환하는 함수.
			 */
			function getDragValue (cv, type)	{
				cv[type].now += d3.event.dx;

				return cv[type].now = 
				Math.max(cv.start[type === 'end' ? 'now' : 'init'],
				Math.min(cv.end[type === 'end' ? 'init' : 'now'],
			 	cv[type === 'end' ? 'end' : 'start'].now)), 
			 	cv[type].now;
			};

			if (d === 'start')	{
				d3.select(this).attr('x', getDragValue(cv, 'start'));
				// Start 버튼을 이동할 때, Navi 박스의 크기를 조절한다.
				// Start 버튼이 이동하면 Navi 의 위치도 바뀌어야 한다.
				cv.navi.now = cv.navi.init + (
				cv.start.now - cv.start.init)
				cv.navi.nowWidth = cv.navi.width - (
				cv.end.init - cv.end.now) - (
				cv.start.now - cv.start.init);

				r.attr('x', cv.navi.now);
				r.attr('width', cv.navi.nowWidth);
			} else if (d === 'end') {
				d3.select(this).attr('x', getDragValue(cv, 'end'));				
				// End 버튼을 이동할 때, Navi 박스의 크기를 조절한다.
				cv.navi.nowWidth = cv.navi.width - (
				cv.start.now - cv.start.init) - (
				cv.end.init - cv.end.now);

				r.attr('width', cv.navi.nowWidth);
			} else {
				cv.navi.now += d3.event.dx;

				var v = cv.navi.now = 
				Math.max(cv.navi.init, 
				Math.min((cv.navi.width + m.m.left) - 
									cv.navi.nowWidth, cv.navi.now));

				cv.start.now = v - m.rect.width;
				cv.end.now = (v + cv.navi.nowWidth) - m.rect.width;

				r.attr('x', v);
				d3.select('#variants_navi_chart_start')
					.attr('x', cv.start.now);
				d3.select('#variants_navi_chart_end')
					.attr('x', cv.end.now);
			}
		},
	},
};
/*
	Patient symbol of variants configuration object.
 */
config.variants.patient = {
	needle: {
		margin: [0, 30, 35, 60],
		attr: {
			points: function (d, i, m)	{
				var x = m.s(d.position);

				if (x < m.m.left)	{
					x = -m.m.left;
				} else if (x > (m.w - m.m.right))	{
					x = m.w + m.m.right;
				}
				
				return x + ',' + m.len / 2.5 + 
				' ' + (x - m.len) + ',' + m.len * 2 + 
				' ' + (x + m.len) + ',' + m.len * 2 + 
				' ' + x + ',' + m.len / 2.5;
			},
		},
		style: {
			fill: function (d, i, m)	{
				return config.landscape.color(d.type);
			},
			stroke: function (d, i, m)	{
				return '#333333';	
			},
		},
		on: {
			mouseover: function (d, i, m) {
				tooltip({
					element: this,
					contents: '<b>' + d.id + '</b></br>' + 
										'Type: <b>' + d.type + '</b></br>' + 
										'AAChange: <b>' + d.aachange + '</b></br>' + 
										'Position: <b>' + d.position + '</b>',
				});
			},
			mouseout: function (d, i, m) {
				tooltip('hide');
			},
		},
	},
	legend: {
		margin: [5, 0, 0, 0],
		attr: {
			points: function (d, i, m)	{
				// 기존에 그려진 type legend 의 위치를 알아낸 뒤,
				// 그 아래에 위치하기 위해서 getBoundingClientRect 함수
				// 를 사용하였다.
				var l = document.querySelector(
								'#variants_legend_chart').firstChild,
						bcr = l.getBoundingClientRect(),
						x = bcr.right - bcr.left + bcr.width - 10;

				return x + ',' + m.m.top + 
				 ' ' + (x - bcr.width / 2) + ',' + (m.m.top * 2.5) +
				 ' ' + (x + bcr.width / 2) + ',' + (m.m.top * 2.5) + 
				 ' ' + x + ',' + m.m.top;
			},
			x: function (d, i, m)	{
				var l = document.querySelector(
									'#variants_legend_chart').firstChild,
						bcr = l.getBoundingClientRect();

				return bcr.right - bcr.left + bcr.width + m.p;
			},
			y: function (d, i, m)	{
				return m.m.top / 2 + m.mh / 2;
			},
		},
		style: {
			fill: function (d, i, m)	{
				return m.isText ? 
							'#333333' : config.landscape.color(d.type);
			},
			stroke: function (d, i, m)	{
				return '#333333';
			},
			fontSize: function (d, i, m) {
				return '12px';
			},
		},
		text: function (d, i, m) { 
			return 'Patients'; 
		},
	},
};
// ======================= Variants =============================
// ======================= Expression ===========================
/*
	최대 길이에 맞춰 컬러를 생산할 함수.
 */
config.expression.colorSet = [
	'#B82647', '#0A8D5E', '#F9D537', '#0B6DB7', '#E3DDCB',
	'#9F494C', '#CBDD61', '#ED9149', '#89236A', '#D8C8B2',
	'#CA5E59', '#006494', '#2E674E', '#9A6B31', '#403F95',
	'#616264', '#E2A6B4', '#5AC6D0', '#733E7F', '#45436C'
];
/*
	Legend of expression confguration object.
 */
config.expression.legend = {
	bar: {
		margin: [5, 5, 5, 5],
		text: function (d, i, m) {
			return draw.textOverflow(d, '10px', m.w * 0.7);
		},
		attr: {
			x: function (d, i, m) {
				return m.isText ? m.m.left + m.p * 2 : m.p;
			},
			y: function (d, i, m) {
				return m.isText ? m.mh * i + m.mh / 3 / 2 : m.mh * i;
			},
			width: function (d, i, m) {
				return m.mh / 3;}
				, 
			height: function (d, i, m) {
				return m.mh / 3;
			},
		},
		style: {
			fill: function (d, i, m) {
				return m.isText ? 
							 '#333333': d === 'NA' ? 
							 '#A4AAA7' : 
							 config.expression.colorSet[i];
			},
			stroke: function (d, i, m) {
				return '#FFFFFF';
			},
			fontSize: function (d, i, m) {
				return '10px';
			}
		},
	},
	scatter: {
		margin: [30, 10, 10, 10],
		text: function (d) {
			return d;
		},
		attr: {
			x: function (d, i, m) {
				return m.isText ? m.m.left + m.m.right : m.p;
			},
			y: function (d, i, m) {
				return m.isText ? (m.mh * i) + 1: (m.mh * i);
			},
			r: function (d, i, m)	{
				return m.p;
			},
		},
		style: {
			fill: function (d, i, m) {
				return d === 'Alive' ? '#5D5DD8' : '#D86561';
			},
			fontSize: function (d, i, m) {
				return '12px';
			},
		},
	},
	patient: {
		margin: [0, 0, 0, 0],
		text: function (d)	{ 
			return d; 
		},
		attr: {

		},
		style: {

		},
	},
};
/*
	Scatter of expression configuration object.
 */
config.expression.scatter = {
	margin: [10, 30, 35, 20],
	attr: {
		x: function (d, i, m) {
			return m.sx(d.x) - m.m.left;
		},
		y: function (d, i, m) {
			return m.sy(d.y);
		},
		r: function (d, i, m) {
			return m.ss;
		},
	},
	style: {
		fill: function (d, i, m) {
			return d.value === undefined ? 
					 	'#333333' : d.value === 1 ? 
					 	'#D86561': '#5D5DD8';
		},
		fillOpacity: function (d, i, m) {
			return 0.6;
		},
	},
	on: {
		mouseover: function (d, i, m)	{
			tooltip({
				element: this,
				contents: 'ID: <b>' + d.x + '</b></br>' + 
									'Months: <b>' + d.y + '</b></br>' + 
									'Status: <b>' + (d.value === '0' ? 
									'Alive' : 'Dead') + '</b>',
			});
		},
		mouseout: function ()	{
			tooltip('hide');
		},
	}
};
/*
	Bar of expression configuration object.
 */
config.expression.bar = {
	margin: [10, 30, 50, 20],
	attr: {
		x: function (d, i, m) {
			return m.sx(d.x) - m.m.left;
		},
		y: function (d, i, m) {
			return (d.y - d.value) < 0 ? 
							m.sy(d.value) : m.sy(d.y);
		},
		width: function (d, i, m) {
			return scale.compatibleBand(m.sx);
		},
		height: function (d, i, m) {
			return (d.y - d.value) < 0 ? 
							m.sy(d.y) - m.sy(d.value) : 
							m.sy(d.value) - m.sy(d.y);
		},
	},
	style: {
		fill: function (d, i, m) {
			if (d.y - d.value === 0)	{
				return '#000';
			}

			return '#62C2E0';
		},
		stroke: function (d, i, m) {
			if (d.y - d.value === 0)	{
				return '#000';
			}
			return '#62C2E0';
		},
	},
	on: {
		mouseover: function (d, i, m)	{
			tooltip({
				element: this,
				direction: d.value > d.y ? 'top' : 'bottom',
				contents: 'ID: <b>' + d.x + '</b></br>' + 
							'Average: <b>' + d.value + '</b>',
			});
		},
		mouseout: function ()	{
			tooltip('hide');
		},
	}
};
/*
	Heatmap of expression configuration object.
 */
config.expression.heatmap = {
	margin: [2, 30, 0, 20],
	attr: {
		x: function (d, i, m) {
			return m.sx(d.x) - m.m.left;
		},
		y: function (d, i, m) {
			return m.sy(d.y);
		},
		width: function (d, i, m) {
			return scale.compatibleBand(m.sx);
		},
		height: function (d, i, m) {
			return scale.compatibleBand(m.sy);
		},
	},
	on: {
		mouseover: function (d, i, m)	{
			tooltip({
				element: this,
				contents: 'ID: <b>' + d.x + '</b></br>' + 
									'Gene: <b>' + d.y + '</b></br>' + 
									'TPM: <b>' + d.value + '</b>',
			});
		},
		mouseout: function ()	{
			tooltip('hide');
		},	
	}
};
/*
	Division of expression configuration object.
 */
config.expression.division = {
	margin: [0, 30, 25, 20],
	marginScatter: [0, 30, 15, 20],
	attr: {
		x: function (d, i, m) {
			return i > 0 ? m.isText ? 
						 (m.scale(m.axis[m.axis.length - 1]) - 
						 	m.m.left) - draw.getTextWidth(d.text, m.font) -
						 m.padding * 2: 
						 m.scale(d.point) - m.m.left : 
						 m.isText ? m.scale(m.axis[0]) - 
						 m.m.left + m.padding * 2 : 
						 m.scale(m.axis[0]) - m.m.left;
		},
		y: function (d, i, m) {
			return m.isText ? 
						 m.h - m.m.bottom + m.textHeight - m.padding : 
						 m.h - m.m.bottom;
		},
		width: function (d, i, m) {
			return i > 0 ? 
						 m.scale(m.axis[m.axis.length - 1]) - 
						 m.scale(d.point) : 
						 m.scale(d.point) - m.m.left;
		},
		height: function (d, i, m) {
			return m.textHeight + m.padding * 2;
		},
		rx: function (d, i, m) {
			return 3;
		},
		ry: function (d, i, m) {
			return 3;
		},
	},
	style: {
		fill: function (d, i, m) {
			return m.isText ? '#232323' : d.color;
		},
		stroke: function (d, i, m)	{
			return m.isLine ? '#000000' : '#FFFFFF';
		},
		dashed: function (d, i, m) {
			return '4, 2';
		},
	},
	on: {
		mouseover: function (d, i, m)	{
			tooltip({
				element: this,
				contents: '<b>' + (d.text.indexOf('Low') > -1 ? 
									'Left to adjust' : 
									'Right to adjust') + '</b>',
				type: 'warning',
			});
		},
		mouseout: function (d, i, m)	{
			tooltip('hide');
		},
	},
	lowPos: 0,
	highPos: 0,
	drag: {
		drag: function (d, i, m)	{
			/*
				Rect 를 반환해주는 함수.
			 */
			function returnRect (parent, type)	{
				return d3.select(parent).selectAll('rect')
								 .filter(function (d, i)	{
									  if (d.text.indexOf(type) > -1)	{
										  return this;
									  }
							 		});
			};

			var expd = config.expression.division,
					what = this.id.indexOf('bar') > -1 ? 'Low' : 'High',
					circle = d3.select(this),
					line = d3.select(circle.node().parentNode)
									 .select('path'),
					rect = what === 'High' ? 
								returnRect(
									'.expression_bar_plot_chart.division-g-tag', 
									'High') : 
								returnRect(circle.node().parentNode, 'Low');

			if (what === 'Low')	{
				circle.attr('cx', function (d)	{
					config.expression.division.lowPos += d3.event.dx;

					var v = config.expression.division.lowPos = 
									Math.max(0, 
									Math.min(config.expression.division.highPos, 
													 config.expression.division.lowPos)),
							l = line.attr('d'),
							rw = rect.attr('width');

					line.attr('d', m.line([
						{ 
							x: v, 
							y: parseFloat(l.substring(l.indexOf(',') + 1, 
														l.indexOf('L'))) 
						}, 
						{ 
							x: v, 
							y: parseFloat(l.substring(l.lastIndexOf(',') + 1)) 
						}]));

					rect.attr('width', v);

					return v;
				});

			} else {
				circle.attr('cx', function (d)	{
					config.expression.division.highPos += d3.event.dx;

					var v = config.expression.division.highPos = 
									Math.max(config.expression.division.lowPos, 
									Math.min(m.scale(m.axis[m.axis.length - 1]) - 
													 m.m.left, 
													 config.expression.division.highPos)),
							rx = rect.attr('x'); 

					line.attr('d', m.line([
						{ x: v, y: 0 }, 
						{ x: v, y: m.h - m.m.bottom }]));

					rect.attr('x', v);
					rect.attr('width', ((
						m.scale(m.axis[m.axis.length - 1]) - m.m.left) - 
					 (m.scale(m.point) - m.m.left)) - 
					 (v - (m.scale(m.point) - m.m.left)));

					return v;
				});
			}	
		},
	},
	line: {
		x: function (m)	{
			return m.scale(m.point) - m.m.left;
		},
		y: function (m) 	{
			return m.id.indexOf('bar') > 0 ? m.m.bottom / 2 : 0;
		},
	},
	text: function (d, i, m)	{
		return d.text;
	},
	figure: {
		data: function (d, m)	{
			return m.id.indexOf('bar') > 0 ? [d[0]] : [d[1]];
		},
		attr: {
			id: function (d, i, m) {
				return m.id + '_div_marker';
			},
			cx: function (d, i, m) {
				config.expression.division.lowPos = 
					m.scale(m.point) - m.m.left; 
				config.expression.division.highPos = 
					m.scale(m.point) - m.m.left; 

				return m.scale(m.point) - m.m.left;
			},
			cy: function (d, i, m) {
				return m.id.indexOf('scatter') > -1 ? 
							 m.h - m.m.bottom : m.m.bottom / 2;
			},
			r: function (d, i, m) {
				return 3;
			},
		},
		style: {
			fill: function (d, i)	{ 
				return d.color; 
			},
		},
	},
};
/*
	Patient symbol of expression configuration object.
 */
config.expression.patient = {
	margin: [10, 30, 50, 20],
	attr: {
		points: function (d, i, m)	{
			var x = m.sx(d.x),
					y = m.id.indexOf('bar') > 0 ? 
						((d.y - d.value) < 0 ? 
							m.sy(d.value) : 
							m.sy(d.y)) + 5 : m.h;

			return x + ', ' + y + ' ' + (x - 4) + ',' + 
						(y - 7) + ' ' + (x + 4) + ',' + 
						(y - 7) + ' ' + x + ',' + y;
		},
	},
	style: {
		fill: function (d, i)	{
			return '#000000';
		},
		stroke: function (d, i)	{
			return '#B7B7B7';
		},
		'stroke-width': '1px',
		'cursor': 'pointer',
	},
	on: {
		mouseover: function (d, i)	{
			tooltip({
				element: this,
				contents: '<b>' + d.x + '</b></br>' + 
									'Value: <b>' + d.value + '</b>',
			});
		},
		mouseout: function (d, i)	{
			tooltip('hide');
		},
	},
};
/*
	Sample of expression configuration object.
 */
config.expression.sample = {
	attr: {
		x: function (d, m)	{
			return m.data.patient.data === d.text ? 
						 draw.getTextWidth(d.text, '25px') + 45 : -5;
		},
		y: function (d, m)	{
			return m.data.patient.data === d.text ? 
						 draw.getTextHeight('25px').height / 2 : 0;
		},
	},
	style: {
		fill: function (d, m)	{
			return m.data.patient.data === d.text ? 
						 d.color : '#FFFFFF';
		},
		fontSize: function (d) {
			return '25px';
		},
	},
	text: function (d, m)	{
		return m.data.patient.data === d.text ? ' **' : '';
	},
};

config.expression.sampleLegend = {

};
// ======================= Expression ========================
var divisionLine = (function (divisionLine)	{
	'use strict';

	var model = {};

	return function (o) {
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.m = size.setMargin(o.margin);
		model.id = model.e.attr('id');
		model.w = o.width || model.e.attr('width');
		model.h = o.height || model.e.attr('height');
		model.g = render.addGroup(
		model.e, model.m.top, model.m.left, 'division');
		model.axis = (o.xaxis || o.yaxis || ['']);
		model.scale = scale.get(model.axis, 
			(o.xaxis ? [model.m.left, model.w - model.m.right] : 
								 [model.m.top, model.h - model.m.bottom]));
		model.point = util.varType(o.point) === 'Array' ? 
									util.median(o.point) : o.point;
		model.font = o.font || '10px';
		model.padding = o.padding || 5;
		model.textHeight = draw.getTextHeight(model.font).height;
		// Data is..
		// { color: 'color', text: 'text', point: 'model.point' };
		model.data = o.data.map(function (d)	{
			return d.point = model.point, d;
		});
		model.line = (util.d3v4() ? d3.line() : d3.svg.line())
									.x(function (d) { return d.x; })
									.y(function (d) { return d.y; });
		model.showRect = o.showRect === undefined && 
										 o.showRect !== false ? true : o.showRect;
		model.showText = o.showText === undefined && 
										 o.showText !== false ? true : o.showText;
		model.showLine = o.showLine === undefined && 
										 o.showLine !== false ? true : o.showLine;
		model.marker = o.marker === undefined && 
									 o.marker !== false ? false : 
									(o.marker || 'circle');

		if (model.showRect)	{
			render.rect({
				element: model.g.selectAll('#' + model.id + '_div_rect'),
				data: model.data,
				attr: {
					id: function (d) { return model.id + '_div_rect'; },
					x: function (d, i)	{
						return o.attr.x ? 
									 o.attr.x.call(this, d, i, model) : 0;
					},
					y: function (d, i)	{
						return o.attr.y ? 
									 o.attr.y.call(this, d, i, model) : 0;
					},
					width: function (d, i)	{
						return o.attr.width ? 
									 o.attr.width.call(this, d, i, model) : 0;
					},
					height: function (d, i)	{
						return o.attr.height ? 
									 o.attr.height.call(this, d, i, model) : 0;
					},
					rx: function (d, i)	{
						return o.attr.rx ? 
									 o.attr.rx.call(this, d, i, model) : 0;
					},
					ry: function (d, i)	{
						return o.attr.ry ? 
									 o.attr.ry.call(this, d, i, model) : 0;
					},
				},
				style: {
					fill: function (d, i)	{
						return o.style.fill ? 
									 o.style.fill.call(
									 	this, d, i, model) : '#000';
					},
					stroke: function (d, i)	{
						return o.style.stroke ? 
									 o.style.stroke.call(
									 	this, d, i, model) : '#000';
					},
				},
				// TODO.
				// Rectangle 부분의 마우스 이벤트는 일단 제외시켜놓는다.
			});
		}

		if (model.showText)	{
			render.text({
				element: model.g.selectAll('#' + model.id + '_div_text'),
				data: model.data,
				attr:{
					id: function (d) { 
						return model.isText = true, model.id + '_div_text'; },
					x: function (d, i)	{
						return o.attr.x ? 
									 o.attr.x.call(this, d, i, model) : 0;
					},
					y: function (d, i)	{
						return o.attr.y ? 
									 o.attr.y.call(this, d, i, model) : 0;
					},
				},
				style: {
					fill: function (d, i)	{
						return o.style.fill ? 
									 o.style.fill.call(
									 	this, d, i, model) : '#000';
					},
					'alignment-baseline': function (d, i)	{
						return o.style.alignmentBaseline ? 
									 o.style.alignmentBaseline.call(
									 	this, d, i, model) : 'middle';
					},
					'font-size': function (d, i)	{
						return o.style.fontSize ? 
									 o.style.fontSize.call(
									 	this, d, i, model) : model.font;
					},
					'font-weight': function (d, i) {
						return o.style.fontWeight ? 
									 o.style.fontWeight.call(
									 	this, d, i, model) : 'bold';
					},
				},
				text: function (d, i) { 
					return o.text ? 
								 o.text.call(this, d, i, model) : '' 
				},
			});
		}

		if (model.showLine)	{
			var x = o.lineX ? o.lineX(model) : 0,
					y = o.lineY ? o.lineY(model) : 0;

			render.line({
				element: model.g,
				attr: {
					id: function (d) { 
						return model.isLine = true, model.id + '_div_line'; 
					},
					d: model.line([
						{	x: x, y: y }, 
						{	x: x, y: model.h - model.m.bottom }]),
				},
				style: {
					stroke: function (d, i) {
						return o.style.stroke ? 
									 o.style.stroke.call(
									 	this, d, i, model) : '#000';
					},
					'stroke-dasharray': function (d, i)	{
						return o.style.dashed ? 
									 o.style.dashed.call(
									 	this, d, i, model) : '5, 10';
					},
				}
			});
		}

		if (model.marker && model.marker === 'circle')	{
			render.circle({
				element: model.g.selectAll(
					'#' + model.id + '_div_marker'),
				data: o.figure.data ? 
							o.figure.data(model.data, model) : model.data,
				attr: {
					id: function (d, i) { 
						return o.figure.attr.id ? 
									 o.figure.attr.id.call(
									 	this, d, i, model) : ''; 
					},
					cx: function (d, i) {
						return o.figure.attr.cx ? 
									 o.figure.attr.cx.call(
									 	this, d, i, model) : 0;
					},
					cy: function (d, i)	{
						return o.figure.attr.cy ? 
									 o.figure.attr.cy.call(
									 	this, d, i, model) : 0;
					},
					r: function (d, i)	{
						return o.figure.attr.r ? 
									 o.figure.attr.r.call(
									 	this, d, i, model) : 0;
					}
				},
				style: {
					fill: function (d, i)	{
						return o.figure.style.fill ? 
									 o.figure.style.fill.call(
									 	this, d, i, model) : 0;
					},
					stroke: function (d, i)	{
						return o.figure.style.stroke ? 
									 o.figure.style.stroke.call(
									 	this, d, i, model) : 0;
					},
					cursor: 'pointer',
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(
									 	this, d, i, model) : false;
					},
					mouseout: function (d, i)	{
						if (!o.on)	{ return false; }

						return o.on.mouseout ? 
									 o.on.mouseout.call(
									 	this, d, i, model) : false;
					}
				},
				call: {
					start: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.start ? 
									 o.drag.start.call(
									 	this, d, i, model) : false;
					},
					drag: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.drag ? 
									 o.drag.drag.call(
									 	this, d, i, model) : false;
					},
					end: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.end ? 
									 o.drag.end.call(
									 	this, d, i, model) : false;
					},
				},
			});
		}	
	};

}(divisionLine||{}));
var draw = (function (draw)	{
	'use strict';
	
	draw.ctx = null;

	draw.clearCanvas = function (parent)	{
		if(parent.children.length > 0)	{
			parent.removeChild(parent.firstChild);
		}
	};
	/*
		dom 의 가로 길이를 구해주는 함수.
	 */
	draw.width = function (args)	{
		return typeof(args) === 'string' ? 
		parseFloat(document.querySelector(args)) : 
		parseFloat(args.style.width);
	};
	/*
		dom 의 세로 길이를 구해주는 함수.
	 */
	draw.height = function (args)	{
		return typeof(args) === 'string' ? 
		parseFloat(document.querySelector(args)) : 
		parseFloat(args.style.height);
	};
	/*
		파라미터로 받은 문자열의 길이를 font 에 적용하여 반환하는
		함수.
	 */
	draw.getTextWidth = function (text, font)	{
		// MeasureText 가 OS 별로 지원하는 수치가 다르므로 주의할 것.
		var canv = document.createElement('canvas'),
				ctx = canv.getContext('2d'),
				width = 0;

		canv.id = 'get-text-width'
		ctx.font = (font ? font : '10px');

		document.body.appendChild(canv);

		text = text.replace(' ', 'A').toUpperCase();

		width = ctx.measureText(text).width;

		document.body.removeChild(
		document.getElementById('get-text-width'));

		return width;
	};
	/*
		Text 배열에서 가장 긴 Text 의 길이를 반환하는 함수.
	 */
	draw.getMostTextWidth = function (txtArr, font)	{
		var result = 0;

		util.loop(txtArr, function (d)	{
			var w = draw.getTextWidth(d, font);

			result = result > w ? result : w;
		});

		return result;
	};
	/*
		문자의 크기와 문자의 종류에 따라 해당 문자열의
		높이를 반환하는 함수.
	 */
	draw.getTextHeight = function (size, font)	{
		var text = document.createElement('span'),
				block = document.createElement('div'),
				div = document.createElement('div');

		div.id = 'get_text_height';
		text.style.fontSize = (size || '10px');
		text.style.fontStyle = (font || 'Arial');
		text.innerHTML = 'Hg';
		block.style.display = 'inline-block';
		block.style.width = '1px';
		block.style.height = '0px';

	  div.appendChild(text);
	  div.appendChild(block);
	  
	  document.querySelector('body').appendChild(div);

	  try {
	    var result = {};

	    block.style.verticalAlign = 'baseline';
	    result.ascent = block.offsetTop - text.offsetTop;
	    block.style.verticalAlign = 'bottom';
	    result.height = block.offsetTop - text.offsetTop;
	    result.descent = result.height - result.ascent;

	  } finally {
	    div.parentNode.removeChild(document.getElementById('get_text_height'));
	  }

	  return result;
	};

	draw.randomDraw = function (start, end)	{
		return Math.floor(Math.random() * start) + (end || 0);
	};

	/*
		각의 0 은 아래로 부터 시작된다. 오른쪽은 + ~180, 왼쪽은 - ~ 180 이다.
	 */
	draw.getDegree = function (x1, y1, x2, y2)	{
		var dx = x2 - x1,
				dy = y2 - y1,
				radian = Math.atan2(dx, dy);

		return {
			radian: radian,
			degree: Math.floor((radian * 180) / Math.PI),
		};
	};

	draw.noOverlap = function (ctx, data, comp)	{
		var da = 50,
				nodes = data.filter(function (d) { return d.type === 'node'; }),
				edges = data.filter(function (d) { return d.type === 'edge'; });

		for (var i = 0, l = nodes.length; i < l; i++)	{
			var n = nodes[i];

			n.textWidth = draw.getTextWidth(ctx, '14px Calibri', n.text);
			n.width = n.width || n.textWidth * 1.2;
			n.height = n.height || 300 * 0.08;
			n.radius = 5;

			if (comp)	{
				n.top = comp.members.indexOf(n.text) > -1 ? 
								draw.randomDraw(comp.top + n.height / 2, 
								comp.height * 0.7 - n.height / 2) : 
								(comp.top - 0) / 2 - n.height / 2;
				n.left = draw.randomDraw(comp.left + comp.width - comp.left - n.width, 
								comp.left);	
			} 
			// TODO.
			// compound 가 없는 상황에서는 특정 canvas 내에서 network 가 그려져야 한다.

			edges.forEach(function (e)	{
				e.source = e.source.substring(0, n.text.length) === n.text ? 
				n.text : e.source;
				e.target = e.target.substring(0, n.text.length) === n.text ? 
				n.text : e.target;
				e.id = e.id.substring(0, e.source.length + e.target.length);
			});
		}	
		
		return data;
	};
	/*
		svg 의 가로, 세로 길이를 반환해주는 함수.
	 */
	draw.size = function (svg)	{
		svg = util.d3v4() ? svg : svg[0][0];
		svg = util.varType(svg) === 'Array' || 
					util.varType(svg) === 'Object' ? svg : d3.select(svg);

		return {
			w: parseFloat(svg.attr('width')), 
			h: parseFloat(svg.attr('height')),
		};
	};
	/*
		Width 에 대하여 font 를 가진 txt 를 자르고
		뒤에 ellipsis 를 붙여주는 함수.
	 */
	draw.textOverflow = function (txt, font, width)	{
		var fit = '';

		txt.split('').some(function (d)	{
			return draw.getTextWidth(fit += d, font) > width;
		});

		return (fit === txt) ? txt : fit + '...';
	};
	/*
		Width, Height 에 맞게 적절한 폰트 크기를 반환하는 함수.
	 */
	draw.getFitTextSize = function (txt, width, height)	{
		var i = 1;

		while (1)	{
			var ti = i + 'px';

			if (draw.getTextHeight(ti).height > height || 
					draw.getTextWidth(txt, ti) > width)	{
				break;
			}

			i += 1;
		};

		return i + 'px';
	};
	/*
		텍스트가 특정 길이를 초과하였을 때, '...' 또는 자르기 처리를 해준다.
	 */
	draw.textOverflow = function (txt, font, len, padding)	{
		var result = '',
				padding = padding || 0;

		if (draw.getTextWidth(txt, font) < len - padding)	{
			return txt;
		}

		util.loop(txt.split(''), function (d)	{
			var tw = draw.getTextWidth(result += d, font);

			if (tw > len - padding)	{
				result = result.substring(0, result.length - 2);
				return;
			}
		});

		return result;
	};
	/*
		전달 된 노드의 어미 svg 를 찾아 반환한다.
	 */
	draw.getParentSvg = function (node)	{
		if (node.parentElement.tagName === 'svg')	{
			return node.parentElement;
		}

		return draw.getParentSvg(node.parentElement);
	};
	/*
		현재 노드를 가장 앞으로 보내주는 함수.
	 */
	draw.toFront = function (node)	{
		node.parentNode.appendChild(node);
	};
	/*
		현재 노드를 가장 뒤로 보내주는 함수.
	 */
	draw.toBack = function (node)	{
		var first = node.parentNode.firstChild;

		if (first)	{
			node.parentNode.insertBefore(node, first);
		}
	};

	/*
		Node 의 위치를 구해주는 함수.
	 */
	// draw.nodePosition = function (node)	{
	// 	var el = node,
	// 			elPos = el.getBoundingClientRect(),
	// 			vpPos = getVpPos(el);

	// 	function getVpPos (el)	{
	// 		if (el.parentElement.tagName === 'svg')	{
	// 			return el.parentElement.getBoundingClientRect();
	// 		}

	// 		return getVpPos(el.parentElement);
	// 	};

	// 	return {
	// 		top: elPos.top - vpPos.top,
	// 		left: elPos.left - vpPos.left,
	// 		bottom: elPos.bottom - vpPos.bottom,
	// 		right: elPos.right - vpPos.right,
	// 		width: elPos.width,
	// 		height: elPos.height,
	// 	};
	// };

	return draw;
}(draw || {}));
var eventHandler = (function (eventHandler)	{
	'use strict';
	
	var model = {};

	eventHandler.context = function (ctx)	{
		return model.ctx = ctx, 
		arguments.length ? eventHandler : model.ctx;
	};

	eventHandler.data = function (data)	{
		return model.data = data,
		arguments.length ? eventHandler : model.data;
	};

	function addMoveEventOnCanvas (callback)	{
		if (!model.ctx)	{
			throw new Error('Not found context of canvas.');
		}

		function getCoord (evt)	{
			callback({
				x: evt.pageX - model.ctx.canvas.offsetLeft,
				y: evt.pageY - model.ctx.canvas.offsetTop
			});
		};

		model.ctx.canvas.removeEventListener('mousemove', getCoord);
		model.ctx.canvas.addEventListener('mousemove', getCoord);
	};

	eventHandler.hover = function (callback)	{
		addMoveEventOnCanvas(function (crd)	{
			// console.log(crd);
		});
	};

	eventHandler.onScroll = function (target, callback)	{
		target = typeof target === 'object' ? target : document.querySelector(target);
		target.addEventListener('scroll', callback);
	};
	/*
	 	특정 이벤트 동작 중 해당 이벤트가 바디태그에서는
	 	Disable 하게 만들어주는 함수.
	 */
	function preventBodyEvent (ele, events)	{
		var DOEVENT = false;

		// 사용자가 지정한 DIV 에 마우스 휠을 작동할때는, 바디에 마우스 휠
		// 이벤트를 막아놓는다.
		document.body.addEventListener(events, function (e)	{
			if (DOEVENT)	{
				if (e.preventDefault) {
					e.preventDefault();
				}
				// 이건 왜 한건지 모르겠음.
				// e.returnValue = false;

				return false;
			}
		});

		ele.addEventListener('mouseenter', function (e)	{
			DOEVENT = true;
		});

		ele.addEventListener('mouseleave', function (e)	{
			DOEVENT = false;
		});
	};
	/*
		Scroll : hidden 에서 스크롤 작업을 하게 도와주는 이벤트 함수.
	 */
	eventHandler.verticalScroll = function (ele, cb)	{
		if (!ele)	{
			throw new Error('There are not given dom element');
		}

		preventBodyEvent(ele, 'mousewheel');

		ele.addEventListener('mousewheel', function (e)	{
			ele.scrollTop += e.wheelDelta;

			if (cb)	{ cb.call(ele, e); }
		});
	};
	/*
		SVG Element 에 마우스를 올려놓았을 때, Element 가 가진
		데이터등을 반환해주는 함수.
	 */
	eventHandler.hoverSVG = function (data, idx)	{
		console.log(data);
	};

	return eventHandler;
}(eventHandler || {}));
var exclusive = (function ()	{
	'use strict';

	var model = {
		now: {
			geneset: null,
		},
	};
	/*
		Survival 에 사용될 데이터를 나누는 함수.
	 */
	function divideSurvivalData ()	{
		var result = {};

		util.loop(model.data.survival.data[model.now.geneset], 
		function (d, i)	{
			if (d)	{
				if (i <= model.data.divisionIdx[
						model.now.geneset].idx)	{
					result[d.participant_id] = 'altered';
				} else {
					result[d.participant_id] = 'unaltered';
				}
			}
		});

		return result;
	};
	/*
		Survival 차트를 그리는 함수.
	 */
	function drawSurvival ()	{
		var e = document.querySelector('#exclusivity_survival'),
				w = parseFloat(e.style.width),
				h = parseFloat(e.style.height) / 1.5;

		SurvivalCurveBroilerPlate.settings = {
			canvas_width 			 : w,
			canvas_height 		 : h,
		 	chart_width 			 : w - 30,
	  	chart_height 			 : h - 30,
		  chart_left 				 : 50,
		  chart_top 				 : 15,
		  include_info_table : false,
			include_legend 		 : true,
			include_pvalue 		 : true,
			pval_x 						 : w - 200,
			pval_y 						 : 42,
		};

		SurvivalCurveBroilerPlate.style = {
		  censored_sign_size : 5,
		  axis_stroke_width  : 1,
		  axisX_title_pos_x  : w / 2,
		  axisX_title_pos_y  : h - 25,
		  axisY_title_pos_x  : -(w / 2) + 25,
		  axisY_title_pos_y  : 10,
		  axis_color 				 : "black",
			pval_font_size 		 : 14,
			pval_font_style 	 : 'normal',
		};

		SurvivalCurveBroilerPlate.subGroupSettings.legend = {
			low: 'Unaltered group',
			high: 'Altered group',
		};

		survival({
			element: '#exclusivity_survival',
			margin: [20, 20, 20, 20],
			data: model.data.survival.data[model.now.geneset],
			divisionData: divideSurvivalData(),
		});
	};
	/*
		Network 차트를 그리는 함수.
	 */
	function drawNetwork ()	{
		console.log(model.now.geneset,
			model.data.network)
		network({
			data: model.data.network[model.now.geneset],
			element: '#exclusivity_network',
		});
	};
	/*
		Heatmap Axis 를 그리는 함수.
	 */
	function drawAxis ()	{
		layout.getSVG(model.svg, ['heatmap'], function (k, v)	{
			axis.element(v)
					.left({
						margin: [35, 0, 35, v.attr('width') - 80],
						data: model.now.geneset.split(' '),
						opt: {
							remove: 'line, path',
						},
					})
					.attr('id', 'exclusivity_heatmap_axis');
		});
	}
	/*
		Heatmap 차트를 그리는 함수.
	 */
	function drawHeatmap ()	{
		layout.getSVG(model.svg, ['heatmap'], function (k, v)	{
			heatmap({
				element: v,
				data: model.data.heatmap[model.now.geneset],
				opt: config.exclusivity.heatmap.opt,
				attr: config.exclusivity.heatmap.attr,
				style: config.exclusivity.heatmap.style,
				margin: config.exclusivity.heatmap.margin,
				xaxis: model.data.axis.heatmap.x[model.now.geneset],
				yaxis: model.data.axis.heatmap.y[model.now.geneset],
			});
		});
	};
	/*
		DivisionBar 차트를 그리는 함수.
	 */
	function drawDivisionBar ()	{
		layout.getSVG(model.svg, ['heatmap'], function (k, v)	{
			divisionLine({
				element: v,
				data: [
					{ text: 'Altered group', color: '#FF6252' },
					{ text: 'Unaltered group', color: '#00AC52' }
				],
				xaxis: model.data.axis.heatmap.x[model.now.geneset],
				margin: config.exclusivity.division.margin,
				padding: 6,
				text: config.exclusivity.division.text,
				attr: config.exclusivity.division.attr,
				style: config.exclusivity.division.style,
				font: '14px',
				lineX: config.exclusivity.division.line.x,
				lineY: config.exclusivity.division.line.y,
				point: model.data.divisionIdx[model.now.geneset].idx + 1,
			});
		});
	};
	/*
		Legend 차트를 그리는 함수.
	 */
	function drawLegend()	{
		layout.getSVG(model.svg, ['ty_legend'], function (k, v)	{
			legend({
				element: v,
				data: model.data.type[model.now.geneset],
				priority: config.exclusivity.priority,
				text: config.exclusivity.legend.text,
				font: '14px',
				attr: config.exclusivity.legend.attr,
				style: config.exclusivity.legend.style,
				margin: config.exclusivity.legend.margin,
			});
		});
	};
	/*
		Exclusivity 차트를 그리는 함수.
	 */
	function drawExclusivity ()	{
		getDataOfPatient(model.origin.sample);
		drawSurvival();
		drawNetwork();
		drawAxis();
		drawHeatmap();
		drawDivisionBar();
		drawLegend();
		drawSample();
	};
	/*
		Sample 이 현재 Geneset 에서 Altered 인지
		Unaltered 인지 결정해주는 함수.
	 */
	function isAltered (s, h)	{
		var sample = 'SMCLUAD1690060028',
		// var sample = document.getElementById('sample_id').value,
				genesetArr = model.now.geneset.split(' '),
				result = '.';

		if (s.length < 1)	{
			return ['**', sample + ' Belongs to', 'Unaltered group'];
		}

		util.loop(s, function (d)	{
			var gStr = h[genesetArr.indexOf(d.gene)];

			if (gStr.indexOf(d.value) > -1)	{
				result = result !== '.' ? 
				result : gStr[gStr.indexOf(d.value)];
			}
		});

		return result === '.' ? 
		['**', sample + ' Belongs to', 'Unaltered group'] : 
		['**', sample + ' Belongs to', 'Altered group'];
	};

	/*
		Sample 관련 데이터(색상, Variant type, 등) 를 만드는 함수.
	*/
	function getDataOfPatient (list)	{
		model.data.sample = { data: [], isAltered: false };

		util.loop(list, function (d)	{
			if (model.now.geneset.indexOf(d.gene) > -1)	{
				model.data.sample.data.push({
					gene: d.gene,
					value: config.exclusivity.symbol(
								 config.exclusivity.case(
								 config.landscape.case(d.class), d.class)),
				});
			} 
		});

		model.data.sample.isAltered = 
			isAltered(model.data.sample.data, 
								model.data.survival.heat[model.now.geneset]);
	};
	/*
		Sample Legend 를 추가한다.
	 */
	function drawSampleLegend ()	{
		layout.getSVG(model.svg, ['sample_legend'], 
		function (k, v)	{
			legend({
				element: v,
				data: model.data.sample.isAltered,
				font: '14px',
				attr: config.exclusivity.sample.legend.attr,
				style: config.exclusivity.sample.legend.style,
				text: config.exclusivity.sample.legend.text,
				margin: config.exclusivity.sample.legend.margin,
			});
		});
	};
	/*
		Division 위에 ** 를 추가한다.
	 */
	function drawSampleDivision ()	{
		layout.getSVG(model.svg, ['heatmap'], function (k, v)	{
			var cd = config.exclusivity.sample.division,
					obj = {};

			obj.e = v;
			obj.m = size.setMargin(cd.margin);
			obj.g = render.addGroup(
							v, obj.m.top, obj.m.left, 'division-star');

			render.text({
				element: obj.g.selectAll('#' + v.attr('id') + '_sample'),
				data: [{ value: '**', type: model.data.sample.isAltered }],
				attr: {
					id: function (d) { return v.attr('id') + '_sample'; },
					x: function (d, i)	{ 
						return cd.attr.x.call(this, d, i, obj); },
					y: function (d, i) { 
						return cd.attr.y.call(this, d, i, obj); },
				},
				style: {
					fill: function (d, i) { 
						return cd.style.fill.call(this, d, i, obj); },
					'font-size': '25px',
					'alignment-baseline': 'middle',
				},
				text: function (d, i) { 
					return cd.text.call(this, d, i, obj); },
			});
		});
	};	
	/*
		Survival Plot 의 테이블 이름에도 심볼을 넣어주는함수.
	 */
	function drawSampleSurvivalTable (ostb, dfstb)	{
		for (var i = 0, l = ostb.length; i < l; i++)	{
			var o = ostb[i],
					d = dfstb[i];

			if (model.data.sample.isAltered.indexOf(o.innerHTML) > -1)	{
				o.innerHTML += ' **';
				d.innerHTML += ' **';
			}
		}
	};
	/*
		Survival plot 의 legend 에도 심볼을 넣어준다.
	 */
	function drawSampleSurvivalLegend (l)	{
		var es = config.exclusivity.sample.survival;

		render.text({
			element: l,
			attr: {
				x: function (d, i, m) { return es.attr.x.call(this, d, i, model); },
				y: function (d, i, m) { return es.attr.y.call(this, d, i, model); },
			},
			style: {
				fill: function (d, i, m) {
					return es.style.fill.call(this, d, i, model); },
				'font-size': function (d, i, m) {
					return es.style.fontSize.call(this, d, i, model); }, 
			},
			text: function (d, i) { 
				return es.text.call(this, d, i, model); },
		});
	};
	/*
		Survival 의 Legend 와 Table 에
		** 를 추가한다. 
	 */
	function drawSampleSurvival ()	{
		var suv = {},
				chkDone = setInterval(function () {

			suv.ostb = document.querySelectorAll('#dfs_stat_table td b');
			suv.dfstb = document.querySelectorAll('#os_stat_table td b');
			suv.legends = d3.selectAll('.legend');

			if (suv.ostb.length > 0 && 
					suv.dfstb.length > 0 && 
					suv.legends.node())	{

				drawSampleSurvivalTable(suv.ostb, suv.dfstb);
				drawSampleSurvivalLegend(suv.legends);
				clearInterval(chkDone);				
			}
		}, 10);
	};
	/*
		Sample 관련 Legend 와 Astarik 를 추가할 함수.
	 */
	function drawSample ()	{
		drawSampleLegend();
		drawSampleDivision();
		drawSampleSurvival();
	};

	return function (o)	{
		console.log('Given Exclusivity data: ', o);
		var e = document.querySelector(o.element || null),
				w = parseFloat(o.width || e.style.width || 1400),
				h = parseFloat(o.height || e.style.height || 700);

		e.style.background = '#F7F7F7';

		model.origin = o.data;
		model.data = preprocessing.exclusivity(o.data);
		model.ids = size.chart.exclusivity(e, w, h);
		model.svg = layout.exclusivity(model.ids, model);
		model.now.geneset = model.data.geneset[0].join(' ');
		// make select box of geneset.
		selectBox({
			element: '#exclusivity_select_geneset',
			initText: model.now.geneset,
			className: 'exclusivity-geneset',
			viewName: 'geneset',
			items: model.data.geneset.map(function (d)	{
				return d.join(' ');
			}),
			click: function (v)	{
				model.now.geneset = v.toUpperCase();

				layout.removeG();
				drawExclusivity();
			},
		});

		drawExclusivity();

		console.log('Exclusivity Model data: ', model);
	};
}());
var expression = (function (expression)	{
	'use strict';

	var model = {
		init: {
			func: 'Average',
			sig: null,
			col: null,
		},
		now: {
			func: null,
			sig: null,
			col: null,
			osdfs: 'os',
		},
		divide: {

		},
	};
	/*
		Survival 을 그리기 위해 Function 값의 
		Median 을 기준으로 altered / unaltered 데이터를 
		나눠주는 함수이다.
	 */
	function dividedData (data, med)	{
		model.data.survival.divide = {};

		util.loop(data, function (d, i)	{
			d.value <= med ? 
			model.data.survival.divide[d.x] = 'unaltered' : 
			model.data.survival.divide[d.x] = 'altered';
		});
	};
	/*
		Survival Tab 의 변화에 따라서 Scatter 를 호출하며,
		단, 이미 선택된 탭에 대해선 변화를 주지 않는다.
	 */
	function callScatterBySurvival (type)	{
		if (model.now.osdfs !== type) {
			layout.removeG(['scatter-g-tag']);
			drawScatter(model.now.osdfs = type, model.now.osdfs);			

			if (model.divide.lowArr || model.divide.highArr)	{
				noneSelectedToBlur(d3.selectAll(
					'#expression_scatter_plot_chart_circle'), 
					model.divide.lowArr, model.divide.highArr);
			}	
		}
	};
	/*
		Survival Tab 이 변경됬을 때 호출되는 함수.
	 */
	function expSurvivalTabChange ()	{
		var inp = document.getElementById('expression_survival')
											.querySelectorAll('input');
		// OS Tab.
		inp[0].onclick = function (e) 	{
			callScatterBySurvival('os');
		};
		// DFS Tab.
		inp[1].onclick = function (e)	{
			callScatterBySurvival('dfs');
		};
	};
	/*
		Survival 을 그려주는 함수.
	 */
	function drawSurvival ()	{
		var e = document.querySelector('#expression_survival'),
				w = parseFloat(e.style.width),
				h = parseFloat(e.style.height) / 1.4;

		SurvivalCurveBroilerPlate.settings = {
			canvas_width 			 : w,
			canvas_height 		 : h,
		 	chart_width 			 : w - 30,
	  	chart_height 			 : h - 30,
		  chart_left 				 : 50,
		  chart_top 				 : 15,
		  include_info_table : false,
			include_legend 		 : true,
			include_pvalue 		 : true,
			pval_x 						 : w - 190,
			pval_y 						 : 42,
		};

		SurvivalCurveBroilerPlate.style = {
		  censored_sign_size : 5,
		  axis_stroke_width  : 1,
		  axisX_title_pos_x  : w / 2,
		  axisX_title_pos_y  : h - 25,
		  axisY_title_pos_x  : -(w / 2) + 25,
		  axisY_title_pos_y  : 10,
		  axis_color 				 : "black",
			pval_font_size 		 : 12,
			pval_font_style 	 : 'normal',
		};

		SurvivalCurveBroilerPlate.subGroupSettings.legend = {
			low: 'Low score group',
			high: 'High score group',
		};

		var div = dividedData(
				model.data.bar, model.data.axis.bar.y[1]),
				suv = survival({
			element: '#expression_survival',
			margin: [20, 20, 20, 20],
			data: (model.divide.patient_list || 
						 model.origin.patient_list),
			divisionData: (model.divide.divide || 
										 model.data.survival.divide),
		});

		model.data.survival.data = suv.survivalData;
		model.data.scatter = 
		Object.keys(model.data.scatter).length < 1 ? 
		model.data.survival.data.all : model.data.scatter;

		expSurvivalTabChange();
	};
	/*
		Bar 를 그리는 함수.
	 */
	function drawBar ()	{
		layout.getSVG(model.svg, ['bar_plot'], function (k, v)	{
			var y = model.data.axis.bar.y;

			config.expression.bar.margin.splice(
			1, 1, model.data.axisLeft);

			bar({
				element: v,
				data: model.data.bar,
				direction: 'bottom',
				margin: config.expression.bar.margin,
				attr: config.expression.bar.attr,
				style: config.expression.bar.style,
				xaxis: model.data.axis.bar.x,
				yaxis: [y[2], y[0]],
				on: config.expression.bar.on,
			});

			axis.element(v)
					.left({
						margin: [
							10, 0, 50, v.attr('width') - model.data.axisLeft
						],
						data: [y[2], y[0]],
						opt: {
							tickValues: y,
						},
					})
					.style('stroke-width', '0.3');
		});
	};
	/*
		Function Select Box 와 현재 function 을 바꿔주는
		함수.
	 */
	function drawFunctionOption ()	{
		selectBox({
			element: '#expression_function',
			className: 'expression-function',
			margin: [3, 3, 0, 0],
			initText: 'Average',
			viewName: 'function',
			items: ['Average'],
			click: function (v)	{
				model.now.func = v;
				console.log('Function is: ', model.now.func);
			},
		});
	};
	/*
		Bar 의 색을 변경해주는함수.
	 */
	function changeBarColor (d)	{
		if (!model.now.colorSet)	{
			return '#62C2E0';
		}

		var state = d.info ? d.info[model.now.col] : 'NA';

		return state === 'NA' ? '#A4AAA7' : 
					config.expression.colorSet[
					model.now.colorSet.indexOf(state)];
	};
	/*
		Color Mapping 을 그려주는 함수.
	 */
	function drawColorMapping ()	{
		selectBox({
			element: '#expression_color_mapping',
			margin: [3, 3, 0, 0],
			className: 'expression-color-mapping',
			initText: 'Color Mapping',
			viewName: 'color_mapping',
			items: model.data.subtype.map(function (d)	{
				return d.key; 
			}),
			click: function (v)	{
				model.now.col = v;
				model.data.subtype.some(function (d)	{
					return model.now.colorSet = d.value, 
								 model.now.col === d.key;
				});

				layout.removeG(['expression_bar_legend_chart']);

				d3.selectAll('#expression_bar_plot_chart_rect')
					.style('fill', changeBarColor)
					.style('stroke', changeBarColor)
				drawColorMappingLegend();
			},
		});
	};
	/*
		Color Mapping 된 범례를 그려주는 함수.
	 */
	function drawColorMappingLegend ()	{
		if (model.now.colorSet)	{
			layout.getSVG(model.svg, ['bar_legend'], 
			function (k, v)	{
				legend({
					element: v,
					data: model.now.colorSet,
					text: config.expression.legend.bar.text,
					attr: config.expression.legend.bar.attr,
					style: config.expression.legend.bar.style,
					margin: config.expression.legend.bar.margin,
				})
			});
		}
	};
	/*
		Drag 에서 선택되지 않은 부분은 Blur 처리를 한다.
	 */
	function noneSelectedToBlur (sel, low, high)	{
		sel.style('fill-opacity', function (d)	{
				 return low.indexOf(d.x) < 0 && 
			 				  high.indexOf(d.x) < 0 ? 0.08 : 
			 				  sel.attr('id').indexOf('circle') > -1 ? 
			 				  0.6 : 1;
			 })
			 .style('stroke-opacity', function (d)	{
				 return low.indexOf(d.x) < 0 && 
							  high.indexOf(d.x) < 0 ? 0.08 : 1;
			 });
	};
	/*
		Divided line 을 그려주는 함수.
	 */
	function drawDivisionBar ()	{
		config.expression.division.margin.splice(
			1, 1, model.data.axisLeft);
		config.expression.division.marginScatter.splice(
			1, 1, model.data.axisLeft);
		/*
			Low, High 별 Loop 를 도는 함수.
		 */
		function loopDragEnd (list)	{
			util.loop(list, function (d)	{
				if (d !== model.data.patient.name)	{
					// Survival (Months & Status) 데이터.
					util.loop(model.origin.patient_list, function (p)	{
						if (p.participant_id === d)	{
							model.divide.patient_list.push(p);
						}
					});
					// Survival (Unaltered & Altered) 데이터.
					model.divide.divide[d] = 
					model.data.survival.divide[d];
				}
			});
		};
		/*
			Drag 가 끝나고 남겨진 데이터를 고쳐서 Survival 및
			Scatter 로 전달하는 함수.
		 */
		function dragEnd (low, high)	{
			model.divide.divide = {};
			model.divide.patient_list = [];
			model.divide.scatter = { os: [], dfs: [] };

			loopDragEnd(low);
			loopDragEnd(high);
			
			drawSurvival();
			drawPatient();
			// TODO.
			// OS, DFS 탭 변경시에도 Blur 가 적용되어야 한다.
			noneSelectedToBlur(
				d3.selectAll('#expression_bar_plot_chart_rect'), 
				low, high);
			noneSelectedToBlur(
				d3.selectAll('#expression_scatter_plot_chart_circle'), 
				low, high);
		};

		var obj = {
			padding: 3,
			font: '12px',
			xaxis: model.data.axis.bar.x,
			margin: config.expression.division.margin,
			point: model.data.axis.bar.x[
						 util.medIndex(model.data.axis.bar.x)],
			data: [
				{ text: 'Low score group', color: '#00AC52' }, 
				{ text: 'High score group', color: '#FF6252' }
			],
			text: config.expression.division.text,
			attr: config.expression.division.attr,
			style: config.expression.division.style,
			figure: config.expression.division.figure,
			lineX: config.expression.division.line.x,
			lineY: config.expression.division.line.y,
			marker: 'circle',
			on: config.expression.division.on,
			drag: {
				drag: config.expression.division.drag.drag,
				end: function (d, i, m)	{
					var a = new Array().concat(m.axis),
							iv = scale.invert(m.scale);
					// 멈춘 위치의 Low, High 각각의 Sample 이름.
					model.divide.lowSam = iv(
								config.expression.division.lowPos + m.m.left),
					model.divide.highSam = iv(
								config.expression.division.highPos + m.m.left);
					// 멈춘 위치의 이름을 가지고 배열을 low, high 로 나눈다.
					model.divide.highArr = a.splice(
						m.axis.indexOf(model.divide.highSam), a.length - 1)
					model.divide.lowArr = a.splice(
						0, m.axis.indexOf(model.divide.lowSam));

					dragEnd(model.divide.lowArr, model.divide.highArr);
				},
			},
		};

		layout.getSVG(model.svg, ['bar_plot'], 
		function (k, v)	{
			obj.element = v;

			divisionLine(obj);
		});

		layout.getSVG(model.svg, ['scatter_plot'], 
		function (k, v)	{
			obj.element  = v;
			obj.yAdjust = 0;
			obj.showRect = false;
			obj.showText = false;
			obj.margin = config.expression.division.marginScatter;

			divisionLine(obj);
		});
	};
	/*
		Scatter 를 그리는 데 필요한 데이터를 재 가공한다.
	 */
	function makeExpScatterData (list)	{
		var r = [];

		util.loop(list, function (d)	{
			util.loop(d, function (k, v)	{
				if (model.data.axis.scatter.x.indexOf(k) > -1)	{
					r.push({x: k, y: v.months, value: v.status});
				}
			});
		});

		return r;
	}
	/*
		Scatter plot 을 그려주는 함수.
	 */
	function drawScatter (osdfs)	{
		layout.getSVG(model.svg, ['scatter_plot'], 
		function (k, v)	{
			var y = new Array().concat(
				model.data.axis.scatter.y[osdfs]).reverse(),
					mm = util.minmax(y);
			// Left Margin 을 Heatmap 최장길이 텍스트에 맞추는 
			// 작업이다.
			config.expression.scatter.margin.splice(
			1, 1, model.data.axisLeft);

			scatter({
				element: v,
				data: makeExpScatterData(model.data.scatter[osdfs]),
				margin: config.expression.scatter.margin,
				attr: config.expression.scatter.attr,
				style: config.expression.scatter.style,
				xaxis: model.data.axis.scatter.x,
				yaxis: y,
				on: config.expression.scatter.on,
			});

			axis.element(v)
					.left({
						margin: [
							10, 0, 35, v.attr('width') - model.data.axisLeft
						],
						data: y,
						opt: {},
					})
					.style('stroke-width', '0.3');
		});
	};
	/*
		Scatter Legend 를 그려주는 함수.
	 */
	function drawScatterLegend ()	{
		layout.getSVG(model.svg, 'scatter_legend', 
		function (k, v)	{
			legend({
				element: v,
				data: ['Alive', 'Dead'],
				text: config.expression.legend.scatter.text,
				attr: config.expression.legend.scatter.attr,
				style: config.expression.legend.scatter.style,
				margin: config.expression.legend.scatter.margin,
			});
		});
	};
	/*
		Heatmap 을 그려주는 함수.
	 */
	function drawHeatmap ()	{
		layout.getSVG(model.svg, ['heatmap'], function (k, v)	{
			var th = draw.getTextHeight('12px').height,
					ts = scale.get(model.data.axis.gradient.x,
							 ['#FF0000', '#000000', '#00FF00']);
			// 한 줄당 10 정도의 px 을 주기위함이다.
			v.attr('height', model.data.axis.heatmap.y.length * th);
			// 왼쪽 여백을 Heatmap 의 최장길이의 Text 에 맞춘다.
			config.expression.heatmap.margin.splice(
			1, 1, model.data.axisLeft);

			heatmap({
				element: v,
				data: model.data.heatmap,
				xaxis: model.data.axis.heatmap.x,
				yaxis: model.data.axis.heatmap.y,
				margin: config.expression.heatmap.margin,
				attr: config.expression.heatmap.attr,
				style: {
					fill: function (d, i)	{
						return ts(d.value);
					},
				},
				on: config.expression.heatmap.on,
			});

			axis.element(v)
					.left({
						margin: [2, 0, 0, v.attr('width')
										 - model.data.axisLeft],
						data: model.data.axis.heatmap.y,
						opt: {
							remove: 'path, line',
						},
					});

			eventHandler.verticalScroll(v.node().parentNode);
		});
	};
	/*
		Signature 리스트를 Select box 로 만들어주는 함수.
	 */
	function drawSignatureList ()	{
		selectBox({
			element: '#expression_signature',
			className: 'expression-signature',
			margin: [3, 3, 0, 0],
			initText: model.init.sig,
			viewName: 'signature',
			items: model.origin.signature_list.map(function (d) {
				return d.signature;
			}),
			click: function (v)	{
				model.now.sig = v;
				console.log('Signature set is: ', model.now.sig);
			},
		});
	};
	/*
		Color Gradient 를 그려주는 함수.
		현재 (2017. 07. 07) 기준으로 CGIS 와
		값에 차이가 있지만 CGIS 는 Log 가 2번 취해진 값이다.
		그러므로 새로 만드는 현재 버전이 맞는 값이다.
	 */
	function drawColorGradient ()	{
		layout.getSVG(model.svg, ['gradient'], 
		function (k, v)	{
			// Set Color Gradiation.
			model.data.colorGradient = colorGradient({
				element: v,
				offset: model.data.axis.gradient.x,
				adjustValue: 6,
				colors: ['#FF0000', '#000000', '#00FF00'],
			});
			// Draw Linear Color Gradient Bar.
			render.rect({
				element: render.addGroup(v, 5, 3, 'gradient'),
				attr: {
					id: k + '_rect',
					x: 0,
					y: 0,
					rx: 3,
					rx: 3,
					width: v.attr('width') - 6,
					height: v.attr('height') * 0.1,
				},
				style: {
					fill: 'url(#' + model.data.colorGradient.id + ')',
				},
			});
			// Draw Linear Color Gradient Axis.
			axis.element(v)
					.bottom({
						margin: [0, 3, v.attr('height') * 0.9, 10],
						data: [
						model.data.axis.gradient.x[0],
						model.data.axis.gradient.x[2]],
						opt: {
							tickValues: model.data.axis.gradient.x,
							remove: 'path, line',
						},
					})
					.selectAll('text')
					.style('fill', '#999999');
		});
	};
	/*
		Patient 를 표시해줄 함수.
	 */
	function drawPatient ()	{
		layout.getSVG(model.svg, ['bar_plot', 'scatter_plot'], 
		function (k, v)	{
			var obj = {},
					y = model.data.axis.bar.y;  

			obj.g = render.addGroup(v, 0, 0, k.indexOf('bar') > -1 ? 
							'bar-patient' : 'scatter-patient');
			obj.id = v.attr('id');
			obj.m = size.setMargin(config.expression.patient.margin);
			obj.w = v.attr('width');
			obj.h = v.attr('height');
			obj.sx = scale.get(model.data.axis.heatmap.x, [
				obj.m.left, obj.w - obj.m.right ]);
			obj.sy = scale.get([y[2], y[0]], [
				obj.m.top, obj.h - obj.m.bottom ]);

			render.triangle({
				element: obj.g.selectAll('#' + obj.id + '_tri'),
				data: model.data.bar.filter(function (d)	{
					if (d.x === model.data.patient.name)	{
						return d;
					}
				}),
				attr: {
					id: function (d) { return obj.id + '_tri'; },
					points: function (d, i)	{
						return config.expression.patient.attr.points
												 .call(this, d, i, obj);
					},	
				},
				style: config.expression.patient.style,
				on: config.expression.patient.on,
			});
		});

		drawSampleLegend();
		drawSampleSurvival();
	};
	/*
		TODO.
		Sample 범례를 그려준다.
	 */
	function drawSampleLegend ()	{
		// layout.getSVG(model.svg, ['nt_legend'], function (k, v)	{
		// 	legend({
		// 		element: v,
		// 		data: d,
		// 		attr: config.variants.patient.legend.attr,
		// 		style: config.variants.patient.legend.style,
		// 		text: config.variants.patient.legend.text,
		// 		margin: config.variants.patient.legend.margin,
		// 	});
		// });
	};
	/*
		Survival Plot 의 테이블 이름에도 심볼을 넣어주는함수.
	 */
	function drawSampleSurvivalTable (ostb, dfstb)	{
		for (var i = 0, l = ostb.length; i < l; i++)	{
			var o = ostb[i],
					d = dfstb[i];

			if (model.data.patient.data === o.innerHTML)	{
				o.innerHTML += ' **';
				d.innerHTML += ' **';
			}
		}
	};
	/*
		Survival plot 의 legend 에도 심볼을 넣어준다.
	 */
	function drawSampleSurvivalLegend (l)	{
		var es = config.expression.sample;

		render.text({
			element: l,
			attr: {
				x: function (d) { return es.attr.x(d, model); },
				y: function (d) { return es.attr.y(d, model); },
			},
			style: {
				fill: function (d) {
					return es.style.fill(d, model); },
				'font-size': function (d) {
					return es.style.fontSize(d, model); }, 
			},
			text: function (d) { return es.text(d, model); },
		});
	};
	/*
		Survival 의 Legend 와 Table 에
		** 를 추가한다. 
	 */
	function drawSampleSurvival ()	{
		var suv = {},
				chkDone = setInterval(function () {

			suv.ostb = document
								.querySelectorAll('#dfs_stat_table td b');
			suv.dfstb = document
									.querySelectorAll('#os_stat_table td b');
			suv.legends = d3.selectAll('.legend');

			if (suv.ostb.length > 0 && 
					suv.dfstb.length > 0 && 
					suv.legends.node())	{

				drawSampleSurvivalTable(suv.ostb, suv.dfstb);
				drawSampleSurvivalLegend(suv.legends);
				clearInterval(chkDone);				
			}
		}, 10);
	};

	return function (o)	{
		var e = document.querySelector(o.element || null),
				w = parseFloat(o.width || e.style.width || 1400),
				h = parseFloat(o.height || e.style.height || 700);

		e.style.background = '#F7F7F7';

		model.origin = o.data;
		model.req = o.req;
		model.data = preprocessing.expression(o.data);
		model.ids = size.chart.expression(e, w, h);
		model.svg = layout.expression(model.ids, model);
		// Set Initialize signature gene set.
		model.init.sig = model.origin.signature_list[0].signature;
		model.now.sig = model.init.sig;
		var most = draw.getMostTextWidth(
		model.data.axis.heatmap.y, '12px');
		model.data.axisLeft = Math.ceil(most / 10) * 10;
		// When the site had loaded complete, draw the chart below.
		drawFunctionOption();
		drawColorMapping();
		drawColorMappingLegend();
		drawSurvival();
		drawBar();
		drawDivisionBar();
		drawScatter(model.now.osdfs);
		drawScatterLegend();
		drawHeatmap();
		drawSignatureList();
		drawColorGradient();
		drawPatient();

		console.log('Given Expression data: ', o);
		console.log('Expression Model data: ', model);
	};
}(expression||{}));
var heatmap = (function (heatmap)	{
	'use strict';

	var model = { mt: ['cnv', 'var'], v: {}, d: [] };
	/*
		같은 위치에 중복된 데이터를 제외시켜주는 함수.
	 */
	function removeDuplication (d)	{
		util.loop(d, function (k, v)	{
			util.loop(model.mt, function (d, i)	{
				if (v[d][0])	{
					model.d.push({x: v.x, y: v.y, value: v[d][0]});
				}
			});
		})
	};
	/*
		같은 위치의 중복된 데이터를 제거하기 위한 데이터를 만들기 
		위한 데이터를 새로 만들어주는 함수.
	 */
	function removeDuplicate (data)	{
		util.loop(data, function (d, i)	{
			var k = d.x + d.y,
					p = config.landscape.case(d.value);
			// 우선순위가 가장 높은 것이 맨위에 오게 만든다.
			// 그려주는 데이터에 서는 지워지지만 실제로는 지워지지 않는다.
			model.v[k]
		  ? config.landscape.priority(model.v[k][p][0])
		  > config.landscape.priority(d.value)
		  ? model.v[k][p].unshift(d.value)
		  : model.v[k][p].push(d.value)
		  : (model.v[k] = {cnv: [], var: [], x: d.x, y: d.y}
		  , model.v[k][p].push(d.value));
		});

		return removeDuplication(model.v);
	};

	return function (o)	{
		// repaint 할 때, 중복되며 표시되므로 이를 방지하기 위해 초기화를 
		// 시켜준다.
		model = { mt: ['cnv', 'var'], v: {}, d: [] };
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.w = model.e.attr('width');
		model.h = model.e.attr('height');
		model.m = size.setMargin(o.margin);
		model.g = render.addGroup(
		model.e, model.m.top, model.m.left, 'heatmap');
		model.sx = scale.get(o.xaxis, 
							[model.m.left, (o.width || model.w) - 
							 model.m.right]);
		model.sy = scale.get(o.yaxis, 
							[model.m.top, (o.height || model.h) - 
							 model.m.bottom]);

		var id = model.e.attr('id');

		render.rect({
			element: model.g.selectAll('#' + id + '_rect'),
			data: o.dup ? 
						(removeDuplicate(o.data), model.d) : o.data,
			attr: {
				id: function (d, i) { return id + '_rect'; },
				x: function (d, i) { 
					return o.attr.x ? 
								 o.attr.x.call(this, d, i, model) : 0; 
				},
				y: function (d, i) { 
					return o.attr.y ? 
								 o.attr.y.call(this, d, i, model) : 0; 
				},
				width: function (d, i) { 
					return o.attr.width ? 
								 o.attr.width.call(this, d, i, model) : 0; 
				},
				height: function (d, i) { 
					return o.attr.height ? 
								 o.attr.height.call(this, d, i, model) : 0; 
				},
			},
			style: {
				fill: function (d, i) { 
					return o.style.fill ? 
								 o.style.fill.call(
								 	this, d, i, model) : '#000000'; 
				},
				stroke: function (d, i) { 
					return o.style.stroke ? 
								 o.style.stroke.call(
								 	this, d, i, model) : false; 
				},
			},
			on: {
				mouseover: function (d, i)	{
					if (!o.on) { return false; }
					
					return o.on.mouseover ? 
								 o.on.mouseover.call(
								 	this, d, i, model) : false;
				},
				mouseout: function (d, i)	{
					if (!o.on) { return false; }

					return o.on.mouseout ? 
								 o.on.mouseout.call(
								 	this, d, i, model) : false;
				},
			}
		});

		return model;
	};
}(heatmap||{}));
var landscape = (function (landscape)	{
	'use strict';

	var model = {
		div: {},
		init: {
			axis: { x: [], y: [] },
			width: 0,
			height: 0,
		},
		now: {
			sort: {
				gene: null,
				sample: null,
				pq: null,	
			},
			group: [],
			axis: { x: [], y: [] },
			width: 0,
			height: 0,
		},
		exclusive: {
			init: null,
		},
	};
	/*
		Group 의 갯수만큼 div 를 만들어주는 함수.
	 */
	function makeGroupLayout (p, g, x)	{
		util.loop(g, function (d, i)	{
			var v = document.createElement('div');

			v.style.width = p.style.width;
			v.style.height = parseFloat(p.style.height) / l + 'px';
			v.style.overflowX = 'hidden';
			v.style.overflowY = 'hidden';
			v.id = p.id + '_' + d.replace(/\s/ig, '');	

			p.appendChild(v);			
		});
	}
	/*
		제목을 써주는 함수.
	 */
	function title ()	{
		model.div.title = document.querySelector('#landscape_title');
		model.div.title.innerHTML = model.origin.title;
		model.div.title.style.fontSize = 
			draw.getFitTextSize(model.origin.title,
							 parseFloat(model.div.title.style.width), 
							 parseFloat(model.div.title.style.height));
	};
	/*
		Group 하나하나의 div 를 만들어주는 함수.
	 */
	function makeGroupDiv (p, g, o)	{
		var div = document.createElement('div');

		model.ids.push((div.id = p.id + '_' + g, div.id));

		util.loop(o, function (k, v)	{
			div.style[k] = v;
		});

		p.appendChild(div);
	};
	/*
		Group 별 div 를 만들어주는 함수.
	 */
	function groupFrame (g)	{
		// Group axis, patient, chart div 목록과 식별자가 될 key 값.
		var t = {
			'_patient': document.getElementById('landscape_patient_group'),
			'_axis': document.getElementById('landscape_axis_group'),
			'_chart': document.getElementById('landscape_group'),
		};
		// t 만큼 돌면서 각 그룹을 돈다.
		util.loop(t, function (k, v)	{
			util.loop(g, function (d, i)	{
				makeGroupDiv(v, util.removeWhiteSpace(d[0]) + k, {
					width: draw.width(v) + 'px',
					height: draw.height(v) / g.length + 'px',
					// 아래 옵션은 원래는 chart 에만 적용되야 되지만,
					// 조건문 걸기에는 너무 영향이 미약해 그냥 모두에게 적용하였다.
					overflowX: 'hidden',
					overflowY: 'hidden',
				});
			});
		});	
	};	
	/*
		Config object 를 가져오는 공통함수.
	 */
	function getConfig (k, c, d, cb)	{
		// 아래 루프에서 patient_sample 의 경우 2개의 데이터를
		// 불러온다. 이를 막기위해서 처음 한번이 되었을 때, 넘어가게
		// 한다.
		var r = false;

		util.loop(k.split('_'), function (a, i)	{
			if (config.landscape[c][a])	{
				if (!r)	{
					r = true;

					cb(config.landscape[c][a], d[a]);
				}
			}
		});
	};
	/*
		config.landscape.axis 에서 key 에 맞는
		설정을 가져와 반환해주는 함수.
	 */
	function getAxisConfig (k, cb)	{
		return getConfig(k, 'axis', model.data.axis, cb);
	};
	/*
		config.landscape.bar 에서 key 에 맞는
		설정을 가져와 반환해주는 함수.
	 */
	function getBarConfig (k, cb)	{
		return getConfig(k, 'bar', model.data, cb);
	};
	/*
		config.landscape.stack 에서 key 에 맞는
		설정을 가져와 반환해주는 함수.
	 */
	function getStackConfig (k, cb)	{
		return getConfig(k, 'stack', model.data.stack, cb);
	};
	/*
		config.landscape.heatmap 에서 key 에 맞는
		설정을 가져와 반환해주는 함수.
	 */
	function getHeatConfig (k, cb)	{
		return getConfig(k, 'heatmap', model.data, cb);
	}
	/*
		config.landscape.group 에서 key 에 맞는
		설정을 가져와 반환해주는 함수.
	 */
	function getGroupConfig (k, cb)	{
		return getConfig(k, 'group', model.data.group, cb);
	}
	/*
		Group 데이터를 배열안에서 찾아내어주는 함수.
	 */
	function axisForGroup (i, d)	{
		var r;

		if (i.indexOf('group') < 0)	{
			return d;
		}
		
		i.split('_').forEach(function (c)	{
			util.loop(d, function (dd, ii)	{
				if (c === dd[0].replace(/\s/ig, ''))	{
					r = dd;
				}
			});
		});

		return r;
	};
	/*
		Group 데이터를 각행에 맞는 값을 찾아 반환해주는 함수.
	 */
	function dataForGroup (k, d)	{
		var r;

		util.loop(d, function (dd, ii)	{
			var v = (dd.y || dd[0].y).replace(/\s/ig, '');

			if (k.indexOf(v) > -1)	{
				r = util.varType(dd) === 'Array' ? dd : [dd];
			}
		});

		return r;
	};
	/*
		Group lIST 를 합치는 함수.
	 */
	function mergeGroup (glist)	{
		var result = [];

		util.loop(glist, function (d)	{
			result = result.concat(d);
		});

		return result;
	};
	/*
		Group, Gene 의 Sort 을 위해 각각의 Axis 에 
		붙인 Click 이벤트 함수이다.
	 */
	function axisForSort (d, i, k)	{
		if (k.indexOf('group') > -1)	{
			util.loop(model.data.axis.group.y, function (dd, i)	{
				if (dd[0] === d)	{
					var data = new Array().concat(
							model.data.group.group[i]);

					model.now.group = 
					landscapeSort.byGroup.call(model, data, 
						d3.event.altKey ? true : false);
				}
			});

			var axis = { 
						axis: 'x', 
						data: mergeGroup(model.now.group.axis.data),
					};

			layout.removeG();
			changeAxisScale(axis);
			drawLandScape(model.data, model.now.width);
		} else {
			var data = [];

			util.loop(model.data.heatmap, function (dd, i)	{
				if (dd.y === d)	{
					data.push(dd);
				}
			});

			layout.removeG();
			changeAxisScale(landscapeSort.byGene(
					model.data.axis.heatmap.x, data));
			drawLandScape(model.data, model.now.width);
		}
	};
	/*
		Group, Gene Axis text 의 이벤트를 처리하는 함수.
	 */
	function axisEvent (key, el)	{
		el.style('cursor', 'pointer')
			.on('click', function (d, i)	{
				return axisForSort.call(this, d, i, key);
			})
			.on('mouseover', function (d)	{
				d3.select(this).style('font-size', '12px');
				
				tooltip({
					element: this,
					contents: key.indexOf('group') > -1 ? 
					'<b>' + d + '</b></br>' + 
					'Click to Sort</br>Alt + Click add to key' : 
					'Sort by <b>' + d + '</b>',
				});
			})
			.on('mouseout', function ()	{
				d3.select(this).style('font-size', '10px');

				tooltip('hide');
			});
	};
	/*
		x, y 축을 그려주는 함수.
	 */
	function drawAxis ()	{
		layout.getSVG(model.svg, 
			['axis_sample', 'gene', 'pq', 'axis_group_'], 
			function (k, v)	{
				getAxisConfig(k, function (c, d)	{
				c = util.varType(c) !== 'Array' ? [c] : c;

				util.loop(c, function (dd, i)	{
					var ag = axis.element(v)[dd.direction]({
						margin: dd.margin,
						data: axisForGroup(v.attr('id'), 
									dd.direction === 'top' || 
									dd.direction === 'bottom' ? d.x : d.y),
						opt: dd.opt,
					});

					if (k.indexOf('group') > -1 || 
						 (k.indexOf('gene') > -1 && 
						 	dd.direction === 'right'))	{
						axisEvent(k, 
							d3.select(ag.node()).selectAll('g text'));
					}
				});
			});
		});
	};
	/*
		Bar 차트가 stacked 와 none stacked 가 있는데,
		두 개 모드 같은 함수를 호출하므로 별도의 함수로 처리하였다.
	 */
	function drawCommonBar (c, d, v, k)	{
		bar({
			data: d,
			opt: c.opt,
			element: v,
			attr: c.attr,
			style: c.style,
			on: c.on,
			margin: c.margin,
			direction: c.direction,
			width: k.indexOf('patient') < 0 && 
						 k.indexOf('sample') > -1 ? 
						 (model.now.width || model.init.width) : null,
			xaxis: c.xaxis.call(model.data.axis),
			yaxis: c.yaxis.call(model.data.axis),
		});
	}
	/*
		일반 Bar 차트를 그리는 함수.
	 */
	function drawBar () {
		layout.getSVG(model.svg, ['pq'], function (k, v)	{
			getBarConfig(k, function (c, d)	{
				drawCommonBar(c, d, v, k);
			});
		});
	};
	/*
		Stack 형태의 Bar 차트를 그리는 함수.
	 */
	function drawStack ()	{
		layout.getSVG(model.svg, 
		['e_sample', 'patient_sample', 'gene'], 
		function (k, v)	{
			getStackConfig(k, function (c, d)	{
				drawCommonBar(c, d, v, k);
			});
		});
	};
	/*
		Patient 와 Normal 데이터의 Heatmap 을 그리는 함.
	 */
	function drawHeat () {
		layout.getSVG(model.svg, ['_heatmap'], 
		function (k, v)	{
			getHeatConfig(k, function (c, d)	{
				heatmap({
					data: d,
					dup: true,
					opt: c.opt,
					element: v,
					attr: c.attr,
					style: c.style,
					on: c.on,
					margin: c.margin,
					xaxis: c.xaxis.call(model.data.axis),
					yaxis: c.yaxis.call(model.data.axis),
					width: k.indexOf('patient') < 0 ? 
					(model.now.width || model.init.width) : null,
				});
			});	
		});
	};
	/*
		Group & Patient Group 을 그려주는 함수.
	 */
	function drawGroup ()	{
		layout.getSVG(model.svg, ['t_group_', 'e_group_'], 
		function (k, v)	{
			getGroupConfig(k, function (c, d)	{
				heatmap({
					element: v,
					opt: c.opt,
					attr: c.attr,
					style: c.style,
					on: c.on,
					margin: c.margin,
					data: dataForGroup(k, d),
					width: k.indexOf('patient') < 0 ? 
					(model.now.width || model.init.width) : null,
					xaxis: c.xaxis.call(model.data.axis),
					yaxis: model.data.axis.group.y
											.filter(function (dd, ii)	{
						if (k.indexOf(dd[0].replace(/\s/ig, '')) > -1)	{
							return dd;
						}
					})[0],
				});
			});
		});
	};
	/*
		Legend 를 그려주는 함수.
	 */
	function drawLegend ()	{
		layout.getSVG(model.svg, ['legend'], function (k, v)	{
			legend({
				element: v,
				data: model.data.type,
				margin: config.landscape.legend.margin,
				priority: config.landscape.priority,
				text: config.landscape.legend.text,
				attr: config.landscape.legend.attr,
				style: config.landscape.legend.style,
				margin: [v.attr('height') / 3, 20, 0, 0],
			});
		});
	};
	/*
		초기 가로 길이값을 정해주는 함수. (초기값은 프레임 크기의 2배)
	 */
	function initSize ()	{
		model.init.width = 
		draw.width(d3.select('#landscape_heatmap').node()) * 2;
		model.init.height = 
		draw.height(d3.select('#landscape_heatmap').node());
	};
	/*
		Scale Option 을 그려주는 함수.
	 */
	function drawScale ()	{
		landscapeScaleOption.set({
			element: '#landscape_option',
			default: 100,
			defaultValue: model.init.width,
			interval: 10,
			unit: '%',
			btn: [
				{id: 'upscale', className: 'upscale'},
				{id: 'downscale', className: 'downscale'},
				{id: 'initialize', className: 'initialize'}
			],
			input: {id: 'viewscale', className: 'viewscale'},
			change: function (btn, now)	{
				layout.removeG();
				// Initialize 버튼을 클릭하였을 때, 초기화면으로 되돌려 준다.
				if (btn === 'initialize')	{
					changeAxisScale({ 
						axis: 'x', data: model.init.axis.x });
					changeAxisScale({
						axis: 'y', data: model.init.axis.y });

					return drawLandScape(model.data, 
								(model.now.width = model.init.width, 
								 model.now.width));
				}
				return drawLandScape(model.data, 
						 	(model.now.width = now, model.now.width));
			},
		});
	};

	function changeAxisScale (data)	{
		if (data.axis === 'x')	{
			model.data.axis.group[data.axis] = data.data;
			model.data.axis.sample[data.axis] = data.data;
			model.data.axis.heatmap[data.axis] = data.data;
		} else {
			model.data.axis.pq[data.axis] = data.data;
			model.data.axis.gene[data.axis] = data.data;
			model.data.axis.heatmap[data.axis] = data.data;
		}
	};
	/*
		정렬버튼과 현재 정렬의 상태를 보여주는 UI 를 그려주는 함수.
	 */
	function drawSort ()	{
		var tag = ['axis_sample', 'gene', 'pq'],
				txt = ['#Mutations', '#Mutations', '-log10(p-value)'],
				i = 0;

		layout.getSVG(model.svg, tag, function (k, v)	{
			var md = {};

			md.id = v.attr('id');
			md.w = v.attr('width');
			md.h = v.attr('height');
			md.m = size.setMargin(config.landscape.stack.gene.margin);
			md.g = render.addGroup(v, md.m.top, md.m.left);

			if (md.id.indexOf('sample') > -1)	{
				md.g.attr('transform', 
									'translate(' + md.m.top + ',' + md.m.left 
															 + ') rotate(270)');
			}

			render.text({
				element: md.g.selectAll('#' + md.id + '_sort_text'),
				data: [txt[i++]],
				id: function (d)	{ return md.id + 'sort_text'; },
				attr: {
					x: function (d, i)	{
						if (md.id.indexOf('sample') > -1)	{
							return -md.m.bottom * 2 + md.m.top;
						} else if (md.id.indexOf('gene') > -1)	{
							return md.w - md.m.right * 2 + md.m.left;
						} else if (md.id.indexOf('pq') > -1)	{
							return md.m.left;
						}
					},
					y: function (d, i)	{
						return md.id.indexOf('sample') > -1 ? 
									 md.w - md.m.bottom : 
									 md.h - md.m.top * 2;
					},
				},
				style: {
					'alignment-baseline': 'middle',
					'font-weight': 'bold',
					'font-size': '12px',
					'cursor': 'pointer',
					'fill': '#333333',
				},
				on: {
					click: function (d, i)	{
						var prop = '';

						if (md.id.indexOf('sample') > -1)	{
							prop = 'sample';
						} else if (md.id.indexOf('gene') > -1)	{
							prop = 'gene';
						} else if (md.id.indexOf('pq') > -1)	{
							prop = 'pq';
						}

						!model.now.sort[prop] ? 
						 model.now.sort[prop] = 'asc' : 
						 model.now.sort[prop] === 'asc' ? 
						 model.now.sort[prop] = 'desc' : 
						 model.now.sort[prop] = 'asc';

						layout.removeG();
						changeAxisScale(
							landscapeSort[model.now.sort[prop]]
							(prop, model.data));
						drawLandScape(model.data, model.now.width);
					},
					mouseover: function ()	{
						tooltip({
							element: this,
							contents: 'Sort by <b>' + 
												d3.select(this).text() + '</b>',
						});
					},
					mouseout: function ()	{
						tooltip('hide');
					},
				},
				text: function (d, i)	{ return d; },
			});
		});
	};
	/*
		Sample, Group, Heatmap 의 가로 길이를 정의해줄 함수.
	 */
	function setWidth (width)	{
		layout.getSVG(model.svg, 
		['e_group_', 'e_sample', 'e_heatmap'], 
		function (k, v)	{
			v.attr('width', width || model.now.width || 
															 model.init.width);
		});
	};
	/*
		Landscape 를 그리는 함수.
	 */
	function drawLandScape (d, w)	{
		// Set Width.
		setWidth(w);
		// Draw Axis.
		drawAxis();
		// Draw Stack.
		drawStack();
		// Draw Bar.
		drawBar();
		// Draw Heatmap.
		drawHeat();
		// Draw Group.
		drawGroup();
		// Draw Legend.
		drawLegend();
		// Draw Sorting label.
		drawSort();
	};

	return function (o)	{
		var e = document.querySelector(o.element || null),
				w = parseFloat(o.width || e.style.width || 1400),
				h = parseFloat(o.height || e.style.height || 700);
		// Origin data from server.
		model.origin = o.data;
		// preprocess data for landscape and call drawLandScape.
		model.data = preprocessing.landscape(o.data);
		// Make Landscape layout and return div ids.
		model.ids = size.chart.landscape(e, w, h);
		// 처음에 가로 길이를 정해준다.
		initSize();
		// Write Title.
		title();
		// Draw Scale.
		drawScale();
		// 그룹 개수에 따라 div 를 만들어 준다 (높이는 일정한 간격).
		groupFrame(model.data.axis.group.y);
		// Make svg to parent div and object data.
		model.svg = layout.landscape(model.ids, model);
		// to exclusive.
		model.exclusive.init = landscapeSort.exclusive(
			model.data.heatmap, model.data.gene);
		// 초기 x, y 축 값을 저장해 놓는다. 이는 나중에 초기화 버튼을
		// 눌렀을때 초기화면으로 돌아가기 위함이다.
		model.init.axis.x = 
		new Array().concat(model.exclusive.init.data);
		model.init.axis.y = 
		new Array().concat(model.data.axis.gene.y);
		// Set init exclusive.
		changeAxisScale(model.exclusive.init);
		// Mutational Landscape 를 그려주는 함수.
		drawLandScape(model.data, model.init.width);
		// Scroll event for moving execution.
		eventHandler.onScroll('#landscape_heatmap', function (e)	{
			var s = document.querySelector('#landscape_sample'),
					g = document.querySelector('#landscape_group').children,
					a = Array.prototype.slice.call(g);

			s.scrollLeft = this.scrollLeft;

			util.loop.call(this, a, function (d, i)	{
				d.scrollLeft = this.scrollLeft;
			});
		});

		console.log('Given Landscape data: ', o);
		console.log('Landscape Model data: ', model);
	};
}(landscape||{}));
var landscapeScaleOption = (function (landscapeScaleOption)	{
	'use strict';

	var model = {
	};
	/*
	 Button 별 Icon Class name 반환해주는 함수.
	 */
	function setIcon (name)	{
		return {
			'upscale': 'fa fa-caret-up',
			'downscale': 'fa fa-caret-down',
			'initialize': 'fa fa-refresh',
		}[name];
	};
	/*
	 Scale 이벤트 함수.
	*/
	function scaleEvent (evt)	{
		var input = document.querySelector('#viewscale');

		switch(this.id)	{
			case 'upscale': model.status += model.interval; break;
			case 'downscale': model.status -= model.interval; break;
			case 'initialize': model.status = model.default; break;
			default: return; break;
		}

		var sign = this.id === 'upscale' ? 1 : -1,
				chNum = parseInt(model.defaultValue * 0.1);

		model.nowValue = this.id === 'initialize' ? 
		model.defaultValue : this.id === 'upscale' ? 
		model.nowValue + (sign * chNum) : 
		model.nowValue + (sign * chNum); 
		// 보이는 최대 가로 길이에 맞을 때 까지 비율을 줄어들게 하였다.
		model.status = 
		model.defaultValue / 2 > model.nowValue ? 
	 (model.status += model.interval, model.status) : 
		model.status > 200 ? 200 : model.status;

		input.value = model.status + ' %';
		// 현재 값이 기본값의 절반보다 작으면 기본값의 절반으로,
		// 현재 값이 기본값의 한계치인 2배 값보다 높으면 
		// 기본값의 한계치로 대치한다.
		model.nowValue = 
		model.defaultValue / 2 > model.nowValue ? 
		model.defaultValue / 2 : 
		model.defaultValue * 2 < model.nowValue ? 
		model.defaultValue * 2 : model.nowValue;

		model.change ? 
		model.change(this.id, model.nowValue) : false;
	};
	/*
	 Scalable button 들을 만들어주는 함수.
	 */
	function button (parent, opts)	{
		for (var i = 0, l = opts.btn.length; i < l; i++)	{
			var b = opts.btn[i],
					btn = document.createElement('button'),
					icon = document.createElement('i');

			icon.className = setIcon(b.id);

			btn.id = b.id;
			btn.addEventListener('click', scaleEvent);
			btn.appendChild(icon);
			parent.appendChild(btn);
		}
	};
	/*
	 input 태그를 만들어주는 함수.
	 tabIndex 속성을 -1 값으로 주어 Tab 동작에도 Focusing 이 안되게 했다.
	 또한 readOnly 속성을 Enable 해서 수정이 불가능하게 하였다.
	 */
	function input (p, o)	{
		util.loop(o.input, function (d, i)	{
			var ip = document.createElement('input');

			ip.id = d.id;
			ip.readOnly = true;
			ip.tabIndex = -1;
			ip.value = (model.value || model.default) + 
						' ' + model.unit;

			p.appendChild(ip);
		});
	};
	/*
	 단위가 % 인지 그냥 정수 인지 체크 하는 함수.
	 */
	function setUnit (unit)	{
		if (unit === 'percentage' || unit === '%')	{
			model.unit = '%';
		} else if (unit === 'int' || !unit)	{	
			model.unit = '';
		}
	};
	/*
	 {
		 element: targeted element,
		 default: initialize number(default number) of scale,
		 interval: how to increase or decrease number,
		 unit: unit of number (ex. '%' or 'percent', 'int' or '0'),
	 }
	 */
	landscapeScaleOption.set = function (opts)	{
		if (d3.select('.scale-option-frame').empty())	{
			var div = document.createElement('div');

			div.className = 'scale-option-frame';

			model = opts;
			model.status = opts.default;
			model.e = document.querySelector(opts.element);
			model.width = parseFloat(
			opts.width || model.e.style.width || 140);
			model.height = parseFloat(
			opts.height || model.e.style.height || 105);
			model.change = opts.change || null;
			model.defaultValue = opts.defaultValue;
			model.nowValue = model.defaultValue;
			model.e.appendChild(div);

			opts.btn = opts.btn.length ? opts.btn : [opts.btn];
			opts.input = opts.input.length ? 
									 opts.input : [opts.input];
				
			input(div, opts);
			button(div, opts);
		}

		return landscapeScaleOption;
	};
	/*
	 	버튼 클릭 후 값이 변경될 때마다 호출되는 함수.
	 */
	landscapeScaleOption.change = function (callback)	{
		return callback(model), landscapeScaleOption;
	};

	return landscapeScaleOption;
}(landscapeScaleOption||{}));
var landscapeSort = (function (landscapeSort)	{
	'use strict';

	var model = {
		exclusive: [],
	};
	/*
		정렬하는 기준이 해당되는 데이터를 찾아오는
		함수.
	 */
	function findData (type, data)	{
		switch (type)	{
			case 'gene': return data.stack.gene; break;
			case 'sample': return data.stack.sample; break;
			case 'pq': return data.pq; break;
			case 'init': return data.init; break;
			default: 
			throw new Error('No matching any data'); break;
		}
	};
	/*
		Stacked 데이터를 정렬하기위해선 해당 값에 대한
		Stacked 데이터를 합해주어야 한다.
	 */
	function byValue (data, what)	{
		var obj = {};

		util.loop(data, function (d, i)	{
			obj[d[what]] = obj[d[what]] ? 
			obj[d[what]] += d.value : obj[d[what]] = d.value;
		});

		return obj;
	};
	/*
		Object 데이터를 sort 함수 사용을 위해
		배열로 변경시켜주는 함수.
	 */
	function toObjectArray (data)	{
		var arr = [];

		util.loop(data, function (k, v)	{
			arr.push({ key: k, value: v });
		});

		return arr;
	}
	/*
		중복되는 부분, 정렬 방향에 따른 값과,
		그에 따른 정렬함수 실행을 하는 함수.
	 */
	function ascdesc (sort, data)	{
		var w = sort === 'asc' ? 1 : -1;

		return data.sort(function (a, b)	{
			return a.value > b.value ? 1 * w : -1 * w;
		});
	};
	/*
		Mutation 을 기준으로 오름차순,내림차순 정렬을
		하는 함수.
	 */
	function alignByMutation (sort, data)	{
		var dt = ascdesc(sort, toObjectArray(byValue(data, 'y')));

		return { 
			axis: 'y', data: dt.map(function (d) { return d.key; })
		};
	};
	/*
		Sample 을 기준으로 오름차순,내림차순 정렬을
		하는 함수.
	 */
	function alignBySample (sort, data)	{
		var dt = ascdesc(sort, toObjectArray(byValue(data, 'x')));
		
		return { 
			axis: 'x', data: dt.map(function (d) { return d.key; })
		};
	};
	/*
		PQ value 를 기준으로 오름차순,내림차순 정렬을
		하는 함수.
	 */
	function alignByPQvalue (sort, data)	{
		var dt = ascdesc(sort, data);

		return { 
			axis: 'y', data: dt.map(function (d)	{ return d.y; })
		};
	};
	/*
		정렬한 기준에 맞는 함수를 호출해주는 함수.
	 */
	function callMatchingFunction (type, sort, data)	{
		switch (type)	{
			case 'gene': return alignByMutation(sort, data); break;
			case 'sample': return alignBySample(sort, data); break;
			case 'pq': return alignByPQvalue(sort, data); break;
			default: throw new Error('Not matching any function'); break;
		};
	};
	/*
		type string 을 만들어주는 함수. 
		exclusive 를 위해서 이다.
	 */
	function typeStrForExclusive (r, g, t)	{
		var gIdx = g.indexOf(t.y) * 2,
				mIdx = config.landscape.case(t.value) === 'cnv' ? 0 : 1;

		r.value = r.value.replaceAt(gIdx, '00'.replaceAt(mIdx, '1'));
	};
	/*
		Gene 만큼의 배열을 모두 '00' 으로 초기화 하는 함수.
	 */
	function fillZero (len)	{
		var str = '';

		for (var i = 0; i < len; i++)	{
			str += '00';
		}

		return str;
	};
	/*
		추려진 sample 들을 문자열에 따라 정렬한다.
	 */
	function sortByExclusive (sa)	{
		var r = sa.sort(function (a, b)	{
			return a.value < b.value ? 1 : -1;
		}).map(function (d, i)	{
			return d.key;
		});

		return { axis: 'x', data: r };
	};
	/*
		Landscape 에서 중앙의 heatmap 이 exclusive 
		하게 보여지기 위한 데이터를 만드는 함수.
	 */
	landscapeSort.exclusive = function (main, gene)	{
		var t = {},
				r = [],
				i = 0;

		util.loop(main, function (d)	{
			if (!t[d.x])	{
				t[d.x] = true;
				r.push({ key: d.x, value: fillZero(gene.length) });
				i += 1;
			} else {
				t[d.x] = t[d.x];
			}
			
			typeStrForExclusive(r[i - 1], gene, d);
		});

		return model.exclusive = r, sortByExclusive(r);
	};
	/*
		Gene, Sample, PQ 의 순서가 오름차순 정렬로
		되게끔 만드는 함수.
	 */
	landscapeSort.asc = function (type, data)	{
		return callMatchingFunction(type, 'asc', findData(type, data));
	};
	/*
		Gene, Sample, PQ 의 순서가 내림차순 정렬로
		되게끔 만드는 함수.
	 */
	landscapeSort.desc = function (type, data)	{
		return callMatchingFunction(type, 'desc', findData(type, data));
	};
	/*
		개별 Gene 에 대한 Sort 를 한다.
	 */
	landscapeSort.byGene = function (std, data)	{
		var exc = landscapeSort.exclusive(data, data[0].y);

		util.loop(std, function (d)	{
			if (exc.data.indexOf(d) < 0)	{
				exc.data.push(d);
			}
		});

		return exc;
	};
	/*
		Group 명 별로 키값을 만들어 데이터를 분류하는 함수.
	 */
	function byGroupMakeObj (data)	{
		var obj = {};

		util.loop(data, function (d, i)	{
			!obj[d.value] ? obj[d.value] = [d] : 
											obj[d.value].push(d);
		});

		return obj;		
	};
	/*
		Obj 의 키값을 순서대로 정렬하고 각각의 데이터를 배열화 하는 함수.
	 */
	function byGroupResult (obj)	{
		var result = [];

		util.loop(Object.keys(obj).sort(function (a, b)	{
			return config.landscape.orderedName.indexOf(a) > 
						 config.landscape.orderedName.indexOf(b) ? 
						 1 : -1;
		}), function (d, i)	{
			result.push(obj[d]);
		});

		return result;		
	};

	function byGroupExclusive (group)	{
		var that = this,
				heat = [];

		util.loop(group, function (d, i)	{
			var tempHeat = [];

			util.loop(d, function (dd, ii)	{
				tempHeat = tempHeat.concat(dd.info);
			});

			 heat.push(
			 	landscapeSort.exclusive(tempHeat, that.data.gene));
		});

		return heat;
	};
	/*
		Group 별로 정렬하는 데이터를 만들어주는 함수.
	 */
	function byGroupProc (data)	{
		var obj = byGroupMakeObj(data),
				gr = byGroupResult(obj),
				ht = byGroupExclusive.call(this, gr),
				result = {};

		util.loop(ht, function (d, i)	{
			result.axis = d.axis;
			result.data ? result.data.push(d.data) : 
										result.data = [d.data];
		});

		return { group: gr, axis: result };				
	};
	/*
		이전에 선택된 그룹과 새로 전달된 그룹데이터에서
		맞는 데이터를 뽑는다.
	 */
	function byGroupMatching (data, group)	{
		var result = [];

		util.loop(data, function (d, i)	{
			util.loop(group, function (g, j)	{
				if (d.x === g.x)	{
					result.push(d);
				}
			});
		});

		return result;
	};
	/*
		Group 의 속성 priority 순서로 정렬하는 함수.
	 */
	landscapeSort.byGroup = function (data, isAlt)	{
		if (isAlt)	{
			if (this.now.group.length < 1)	{
				throw new Error ('There are empty now group data');
			}	

			var that = this,
					temp = [],
					result = { group: [], axis: { 
						axis: 'x', data: [],
					} };

			util.loop(this.now.group.group, function (d, i)	{
				temp.push(
					byGroupProc.call(that, byGroupMatching(data, d)));
			});

			util.loop(temp, function (d, i)	{
				result.group = result.group.concat(d.group);
				result.axis.data = 
				result.axis.data.concat(d.axis.data);
			});

			return result;
		}

		return byGroupProc.call(this, data);
	};

	return landscapeSort;

}(landscapeSort||{}));
var layout = (function (layout)	{
	'use strict';

	var model = {
		exclusivity: {},
		expression: {},
		landscape: {},
		variants: {},
	};
	/*
		파라미터 ids 를 조회하며 e(except) 항목들을 제외한
		id 들을 t(chart case) 에 svg 를 만들어 넣어준다.
	 */
	function create (e, t, ids)	{
		util.loop(ids, function (d, i)	{
			var is = true;

			util.loop(e, function (b, j)	{
				if (d.indexOf(b) > -1)	{
					is = !is;
				}
			});

			if (is)	{
				model[t][d] = render.createSVG(d);
			}
		});

		return model[t];
	};
	/*
		SVG 를 가져오는데 필요한 조건을 충족시키지 못하면
		발생하는 에러이다.
	 */
	function getSVGError (args)	{
		var a = Array.prototype.slice.call(args),
				ta = a.map(function (d)	{
					return util.varType(d);
				});

		if (ta.indexOf('Object') < 0)	{
			throw new Error ('Not found svg set');
		} else if (ta.indexOf('Function') < 0)	{
			throw new Error ('Not found CallBack function');
		}
	};
	/*
		사용자가 전달한 id set (i) 에 맞는 svg 들을 
		콜백함수로 반환하는 함수.
	 */
	layout.getSVG = function (s, i, cb)	{
		getSVGError(arguments);

		i = util.varType(i) === 'Array' ? i : [i];

		util.loop(s, function (k, v)	{
			util.loop((i || ['']), function (d, j)	{
				if (k.indexOf(d) > -1)	{
					return cb(k, v);
				}
			});
		});
	};
	/*
		Specific 된 svg 가 없을 경우,
		'g-tag' 클래스를 가진 g tag 를 모두 지워주는 함수.
	 */
	layout.removeG = function (specify)	{
		if (specify)	{
			specify = util.varType(specify) === 'Array' ? 
			specify : [specify];

			util.loop(specify, function (d)	{
				// var id = d.indexOf('#') > -1 ? d : '#' + d;

				d3.selectAll((d.indexOf('.') > -1 ? d : '.' + d))
					.remove();
			});
		} else {
			d3.selectAll('svg g').remove();
		}
	};	
	/*
		ID (select_geneset, network, survival) 를 
		조회하며 svg 태그를 만들어 div 태그에 넣고 svg 를
		반환한다.
	 */
	layout.exclusivity = function (ids)	{
		return create(['geneset', 'survival', 'network'], 
									 'exclusivity', ids);
	};
	/*
		Id (scale_option, title 제외) 를 조회하며
		svg 태그를 만들어 div 태그에 삽입한다.
	 */
	layout.landscape = function (ids)	{
		return create(['option', 'title'], 'landscape', ids);
	};
	/*
		ID (title 제외) 를 조회하며 svg 태그를 만들어
		div 태그에 삽입한다.
	 */
	layout.variants = function (ids)	{
		return create(['title'], 'variants', ids);
	};
	/*
		Id (title 제외) 를 조회하며
		svg 태그를 만들어 div 태그에 삽입한다.
	 */
	layout.expression = function (ids)	{
		return create([
			'title', 'function', 'color_mapping', 'signature'
		], 'expression', ids);
	};

	return layout;
}(layout||{}));
var legend = (function (legend)	{
	'use strict';

	var model = {};

	function getMostWidthOfText (texts, font)	{
		var result = 0;

		util.loop(texts, function (d, i)	{
			result = result > draw.getTextWidth(d, font) ? 
							 result : draw.getTextWidth(d, font);
		});

		return result;
	};

	return function (o)	{
		model = {};
		model.d = !o.priority ? o.data : 
		o.data.sort(function (a, b)	{
			return o.priority(a) > o.priority(b) ? 1 : -1;
		});
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.id = model.e.attr('id');
		model.m = size.setMargin(o.margin);
		model.w = o.width || model.e.attr('width');
		model.h = o.height || model.e.attr('height');
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.p = o.padding || 5;
		model.font = o.font || '10px';
		model.sw = 
		model.sg = render.addGroup(
		model.e, model.t, model.l, 'legend-shape');
		model.tg = render.addGroup(
		model.e, model.t, model.l, 'legend-text');		
		model.mw = getMostWidthOfText(model.d, model.font);
		model.mh = draw.getTextHeight(model.font).height;
		model.dr = (model.w - model.m.left - model.m.right)
						 > (model.h - model.m.top - model.m.bottom) ? 
						 	 'h' : 'v';

		if (o.attr && o.attr.r)	{
			render.circle({
				element: model.sg.selectAll('#' + model.id + '_circle'),
				data: model.d,
				attr: {
					id: function (d) { return model.id + '_circle'; },
					cx: function (d, i)	{
						return o.attr.x ? o.attr.x.call(this, d, i, model) : 0;
					},
					cy: function (d, i)	{
						return o.attr.y ? o.attr.y.call(this, d, i, model) : 0;
					},
					r: function (d, i)	{
						return o.attr.r ? o.attr.r.call(this, d, i, model) : 0;
					},
				}, 
				style: {
					fill: function (d, i)	{
						return o.style.fill ? 
									 o.style.fill.call(this, d, i, model) : '#000000';
					},
					stroke: function (d, i)	{
						return o.style.stroke ? 
									 o.style.stroke.call(this, d, i, model) : false;
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on) { return false; }

						return o.on.mouseover ? 
									 o.on.mouseover.call(this, d, i, model) : false;
					},
				},
			})
		} else if (o.attr && o.attr.points)	{
			render.triangle({
				element: model.sg.selectAll('#' + model.id + '_triangle'),
				data: model.d,
				attr: {
					id: function (d) { return model.id + '_triangle'; },
					points: function (d, i) { 
						return o.attr.points ? 
									 o.attr.points.call(this, d, i, model) : [0, 0];
					},
				},
				style: {
					fill: function (d, i)	{
						return o.style.fill ? 
									 o.style.fill.call(this, d, i, model) : '#000000';
					},
					stroke: function (d, i)	{
						return o.style.stroke ? 
									 o.style.stroke.call(this, d, i, model) : false;
					},
					'stroke-width': function (d, i)	{
						return o.style.strokeWidth ? 
									 o.style.strokeWidth.call(this, d, i, model) : '1px';
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on) { return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(this, d, i, model) : false;
					},
				},
			});
		} else if (o.attr && o.attr.width && o.attr.height) {
			render.rect({	
				element: model.sg.selectAll('#' + model.id + '_rect'),
				data: model.d,
				attr: {
					id: function (d) { return model.id + '_rect'; },
					x: function (d, i) { 
						return o.attr.x ? o.attr.x.call(this, d, i, model) : 0;
					},
					y: function (d, i) { 
						return o.attr.y ? o.attr.y.call(this, d, i, model) : 0;
					},
					width: function (d, i) { 
						return o.attr.width ? 
									 o.attr.width.call(this, d, i, model) : 5; 
					},
					height: function (d, i) { 
						return o.attr.height ? 
									 o.attr.height.call(this, d, i, model) : 5; 
					},
				},
				style: {
					fill: function (d, i) { 
						return o.style.fill ? 
									 o.style.fill.call(this, d, i, model) : '#000000'; 
					},
					stroke: function (d, i) { 
						return o.style.stroke ? 
									 o.style.stroke.call(this, d, i, model) : false; 
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on) { return false; }

						return o.on.mouseover ? 
									 o.on.mouseover.call(this, d, i, model) : false;
					},
				},
			});
		}

		render.text({
			element: model.tg.selectAll('#' + model.id + '_text'),
			data: model.d,
			attr: {
				id: function (d) { 
					return (model.isText = true, model.id + '_text'); 
				},
				x: function (d, i) { 
					return o.attr.x ? o.attr.x.call(this, d, i, model) : 0; 
				},
				y: function (d, i) { 
					return o.attr.y ? o.attr.y.call(this, d, i, model) : 0; 
				},
			},
			style: {
				'font-size': function (d, i)	{
					return o.style.fontSize ? 
								 o.style.fontSize.call(this, d, i, model) : model.font;
				},
				'font-family': function (d, i) { 
					return o.style.fontFamily ? 
								 o.style.fontFamily.call(this, d, i, model) : 'Arial'; 
				},
				'font-weight': function (d, i) {
					return o.style.fontWeight ? 
								 o.style.fontWeight.call(this, d, i, model) : '1';
				},
				'alignment-baseline': function (d, i)	{
					return o.style.alignmentBaseline ? 
								 o.style.alignmentBaseline.call(this, d, i, model) : 'middle';
				},
				fill: function (d, i)	{
					return o.style.fill ?
								 o.style.fill.call(this, d, i, model) : '#333333';
				},
			},
			on: {
				mouseover: function (d, i)	{
					if (!o.on) { return false; }

					return o.on.mouseover ? 
								 o.on.mouseover.call(this, d, i, model) : false;
				},
			},
			text: function (d, i)	{ 
				return o.text ? 
							 o.text.call(this, d, i, model) : ('legend ' + i);
			},
		});
	};
}(legend||{}));
(function (window)	{
	'use strict';
	
	window.bio = {
		draw: draw,
		config: config,
		render: render,
		variants: variants,
		pathways: '',
		expression: expression,
		landscape: landscape,
		exclusive: exclusive,
		chart: {
			bar: bar,
			legend: legend,
			needle: needle,
			network: network,
			heatmap: heatmap,
			scatter: scatter,
			survival: survival,
		},
		tools: {
			tooltip: tooltip,
			selectBox: selectBox,
			needleNavi: needleNavi,
			needleGraph: needleGraph,
			divisionLine: divisionLine,
			colorGradient: colorGradient,
			landscapeSort: landscapeSort,
			landscapeScaleOption: landscapeScaleOption,
		},
		util: util,
		size: size,
		scale: scale,
		layout: layout,
		eventHandler: eventHandler,
		preprocessing: preprocessing,
	};
}(window||{}));
var needle = (function (needle)	{
	'use strict';

	var model = {};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.w = o.width || model.e.attr('width');
		model.h = o.height || model.e.attr('height');
		model.id = model.e.attr('id');
		model.m = size.setMargin(o.margin);
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.lg = render.addGroup(
		model.e, model.m.top, model.m.left, 'needle-line');
		model.cg = render.addGroup(
		model.e, model.m.top, model.m.left, 'needle-circle');
		model.radius = o.radius || 5;
		model.sx = scale.get(o.xaxis, 
			[model.m.left, model.w - model.m.right]);
		model.sy = scale.get(o.yaxis, 
			[model.h - model.m.bottom, model.m.top]);
		model.line = (util.d3v4() ? d3.line() : d3.svg.line())
								 .x(function (d, i) { 
								 		if (model.sx(d.x) < model.m.left)	{
								 			return -100;
								 		} else if (model.sx(d.x) > 
								 							 model.w - model.m.right)	{
								 			return model.w + 100;
								 		}

								 		return model.sx(d.x); }
								 	)
								 .y(function (d, i) { return model.sy(d.y); });

		util.loop(o.lineData, function (d, i)	{
			render.line({
				element: model.lg,
				attr: {
					id: function (d) { return model.id + '_line'; },
					d: model.line(d.value),
				},
				style: {
					stroke: '#A8A8A8',
				}
			});
		});

		render.circle({
			element: model.cg.selectAll('#' + model.id + '_circle'),
			data: o.circleData,
			attr: {
				id: function (d) { return model.id + '_circle'; },
				cx: function (d, i)	{ 
					return o.attr.x ? o.attr.x.call(
									this, d, i, model) : 0; 
				},
				cy: function (d, i)	{ 
					return o.attr.y ? 
								 o.attr.y.call(this, d, i, model) : 0; 
				},
				r: function (d, i)	{ 
					return o.attr.r ? 
								 o.attr.r.call(
								 	this, d, i, model) : model.radius; 
				},
			},
			style: {
				fill: function (d, i) { 
					return o.style.fill ? 
								 o.style.fill.call(
								 	this, d, i, model) : '#000000';
				},
				stroke: function (d, i)	{
					return o.style.stroke ? 
								 o.style.stroke.call(
								 	this, d, i, model) : '#FFFFFF';
				},
				cursor: function (d, i)	{
					return o.style.cursor ? 
								 o.style.cursor.call(
								 	this, d, i, model) : 'none';
				},
			},
			on: {
				mouseover: function (d, i)	{
					if (!o.on) { return false; }
					
					return o.on.mouseover ? 
								 o.on.mouseover.call(this, d, i, model) : false;
				},
				mouseout: function (d, i)	{
					if (!o.on) { return false; }

					return o.on.mouseout ? 
								 o.on.mouseout.call(this, d, i, model) : false;
				}
			},
		});
	};
}(needle||{}));
var needleGraph = (function (needleGraph)	{
	'use strict';

	var model = {};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.id = model.e.attr('id');
		model.m = size.setMargin(o.margin);
		model.w = o.width || model.e.attr('width');
		model.h = o.height || model.e.attr('height');
		model.t = model.h - model.m.bottom;
		model.l = model.m.left || 0;
		model.g = render.addGroup(
		model.e, model.t, model.l, 'needle-graph');
		model.sx = scale.get(o.xaxis, 
			[model.m.left, model.w - model.m.right]);
		model.sy = scale.get(o.yaxis, 
			[model.h - model.m.bottom, model.m.top]);
		model.sh = Math.abs(model.sy(1) - model.sy(0)) / 2;

		render.rect({
			element: model.g.selectAll('#' + model.id + '_base'),
			data: [''],
			attr: {
				id: model.id + '_base',
				x: model.sx(util.minmax(o.xaxis).min) + 5,
				y: model.sh * 0.1,
				width: model.w - model.m.right - model.m.left - 5,
				height: model.sh * 0.8,
				rx: 1,
				ry: 1,
			},
			style: {
				fill: '#DADFE1',
				stroke: '#CCCDCE',
				'stroke-width': '5px',
			},
		});

		render.rect({
			element: model.g.selectAll('#' + model.id + '_rect'),
			data: o.data,
			attr: {
				id: function (d) { return model.id + '_rect'; },
				x: function (d, i) { 
					return o.attr.x ? 
								 o.attr.x.call(this, d, i, model) : 0;
				},
				y: function (d, i) { 
					return o.attr.y ? 
								 o.attr.y.call(this, d, i, model) : 0;
				},
				width: function (d, i) { 
					return o.attr.width ? 
								 o.attr.width.call(this, d, i, model) : 0;
				},
				height: function (d, i) { 
					return o.attr.height ? 
								 o.attr.height.call(this, d, i, model) : 0;
				},
				rx: 3,
				ry: 3,
			},
			style: {
				fill: function (d, i)	{
					return o.style.fill ? 
								 o.style.fill.call(
								 	this, d, i, model) : '#000000';
				},
				stroke: function (d, i)	{
					return o.style.stroke ? 
								 o.style.stroke.call(
								 	this, d, i, model) : '#FFFFFF';
				},
			},
			on: {
				mouseover: function (d, i)	{
					if (!o.on) { return false; }

					return o.on.mouseover ? 
								 o.on.mouseover.call(
								 	this, d, i, model) : false;
				},
				mouseout: function (d, i)	{
					if (!o.on) { return false; }

					return o.on.mouseout ? 
								 o.on.mouseout.call(
								 	this, d, i, model) : false;
				},
			},
		});

		render.text({
			element: model.g.selectAll('#' + model.id + '_text'),
			data: o.data,
			attr: {
				id: function (d) {
					return model.isText = true, model.id + '_text';
				},
				x: function (d, i)	{
					return o.attr.x ? 	
								 o.attr.x.call(this, d, i, model) : 0;
				},
				y: function (d, i) { 
					return o.attr.y ? 
								 o.attr.y.call(this, d, i, model) : 0;
				},
			},
			style: {
				fill: function (d, i)	{
					return o.style.fill ? 
								 o.style.fill.call(
								 	this, d, i, model) : '#333333'; 
				},
				'alignment-baseline': function (d, i)	{
					return o.style.alignmentBaseline ? 
								 o.style.alignmentBaseline.call(
								 	this, d, i, model) : 'middle'; 
				},
				'font-size': function (d, i)	{
					return o.style.fontSize ? 
								 o.style.fontSize.call(
								 	this, d, i, model) : '10px'; 
				},
			},
			text: function (d, i) {
				return o.text ? o.text.call(this, d, i, model) : 0;
			},
		})
	};
}(needleGraph||{}));
var needleNavi = (function (needleNavi)	{
	'use strict';

	var model = { start: 0, end: 0 };
	/*
		Navigator 를 조절할 양쪽의 조절 버튼을 만드는
		함수.
	 */
	function makeControlRect (o, r)	{
		util.loop(r, function (d, i)	{
			render.rect({
				element: model.g.selectAll('#' + model.id + '_' + d),
				data: [d],
				attr: {
					id: function (d) { return model.id + '_' + d },
					x: d === 'end' ? model.end + model.m.left - 
													 model.rect.width : 
													 model.start - model.rect.width,
					y: model.h * 0.25,
					width: model.rect.width * 2,
					height: model.rect.height,
					rx: 5,
					rx: 5,
				},
				style: {
					'fill': '#A8A8A8',
					'stroke': '#EAECED',
					'stroke-width': '2px',
					'cursor': 'ew-resize',
				},
				call: {
					start: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.start ? 
									 o.drag.start.call(this, d, i, model) : false;
					},
					drag: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.drag ? 
									 o.drag.drag.call(this, d, i, model) : false;
					},
					end: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.end ? 
									 o.drag.end.call(this, d, i, model) : false;
					},
				},
			});
		});
	};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.id = model.e.attr('id');
		model.w = o.width || model.e.attr('width');
		model.h = o.height || model.e.attr('height');
		model.m = size.setMargin(o.margin);
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.g = render.addGroup(
		model.e, model.m.top, model.m.left, 'needle-navi');
		model.sx = scale.get(o.xaxis, 
			[model.m.left, model.w - model.m.right]);
		model.sy = scale.get(o.yaxis, 
			[model.h - model.m.bottom, model.m.top]);
		// 양끝에 그려지는 버튼의 가로 세로 길이 설정.
		model.rect = { width: 5, height: model.h * 0.4 };
		// 양끝의 버튼의 시작 위치 설정.
		model.start = model.sx(util.minmax(o.xaxis).min);
		model.end = model.w - model.m.right - model.m.left;
		// Drag 이벤트를 위해서 시작위치와 끝위치를 정해준다.
		config.variants.navi.start.init = 
		 model.start - model.rect.width;
		config.variants.navi.end.init = 
		 model.end - model.rect.width + model.m.left;
		config.variants.navi.start.now = 
		 model.start - model.rect.width;
		config.variants.navi.end.now = 
		 model.end - model.rect.width + model.m.left;
		config.variants.navi.navi.init = model.start;
		config.variants.navi.navi.now = model.start;
		config.variants.navi.navi.width = model.end;
		config.variants.navi.navi.nowWidth = 
		 model.end - model.start;

		needle({
			element: model.e,
			lineData: o.data.needle,
			circleData: o.data.fullNeedle,
			attr: config.variants.needle.attr,
			style: o.style,
			margin: [5, 30, 15, 60],
			xaxis: o.xaxis,
			yaxis: o.yaxis,
		});

		render.rect({
			element: model.g.selectAll('#' + model.id + '_navi'),
			data: ['navi'],
			attr: {
				id: function (d)	{ return model.id + '_navi'; },
				x: model.start,
				y: 0,
				width: model.end,
				height: model.h - model.m.bottom,
				rx: 3,
				ry: 3,
			},
			style: {
				fill: 'rgba(255, 225, 50, 0.1)',
				stroke: '#FFDF6D',
				cursor: 'move',
			},
			call: {
				start: function (d, i)	{
					if (!o.drag) { return false; }

					return o.drag.start ? 
								 o.drag.start.call(this, d, i, model) : false;
				},
				drag: function (d, i)	{
					if (!o.drag) { return false; }

					return o.drag.drag ? 
								 o.drag.drag.call(this, d, i, model) : false;
				},
				end: function (d, i)	{
					if (!o.drag) { return false; }

					return o.drag.end ? 
								 o.drag.end.call(this, d, i, model) : false;
				},
			},
		});

		makeControlRect(o, ['start', 'end']);
		// Navigator 가 Needle Plot 에 가려져 있던 것을
		// 앞으로 내와서 안가려지게 하였다.
		model.e.node().removeChild(
		model.e.node().firstChild);
		model.e.node().appendChild(model.g.node());
	};
}(needleNavi||{}));
var network = (function ()	{	
	'use strict';

	return function (opts)	{
		var data = [],
				nodes = {},
				members = '';
				
		opts.data.map(function (d)	{
			if (d.type === 'compound')	{
				members = d.members;
				data.push({
					group: 'nodes',
					data: {
						id: 'n0',
						bgcolor: d.bgcolor,
						bdcolor: d.bordercolor || 'rgb(0, 0, 0)',
						width: 100,
						height: 150,
						isComp: true,
						per: d.text,
					},
					position: {
						// x: 150,
						// y: 150,
					}
				});
			} else if (d.type === 'node')	{
				var obj = {
					data: {
						id: (members.indexOf(d.text) > -1 ? 'n0:' + d.text : d.text),
						name: d.text,
						bgcolor: d.bgcolor,
						bdcolor: d.bordercolor || 'rgb(0, 0, 0)',
						width: draw.getTextWidth(d.text, '14px Calibri'),
						height: 20,
						fontSize: 10,
						isComp: false,
					},
					group: 'nodes',
				};

				nodes[d.text] = {
					parent: members.indexOf(d.text) > -1 ? 'n0:' : '',
				};

				if (members.indexOf(d.text) > -1)	{
					obj.data.parent = 'n0';
				} 

				data.push(obj);
			} else if (d.type === 'edge')	{
				var source = '', target = '', sep = '';

				for (var n in nodes)	{
					if (d.source.substring(0, n.length) === n)	{
						source = nodes[n].parent + n;
						sep = d.source.substring(n.length, d.source.length);
						target = nodes[d.target.substring(0, d.target.indexOf(sep))].parent + 
										d.target.substring(0, d.target.indexOf(sep));
					}					
				}

				data.push({
					data: {
						id: source + target,
						source: source,
						target: target,
						color: d.linecolor,
					},
					group: 'edges',
				});
			}
		});

		var cy = cytoscape({
			container: document.querySelector(opts.element),
			boxSelectionEnabled: false,
			autoungrabify: true,
			autounselectify: true,
			pixelRatio: 'auto',
			elements: data,
			style: cytoscape.stylesheet()
			.selector('node')
			.css({
				'shape': 'rectangle',
				'width': 'data(width)',
				'height': 'data(height)',
				'font-size': '10',
				'content': 'data(name)',
				'text-valign': 'center',
				'background-color': 'data(bgcolor)',
				'border-color': 'data(bdcolor)',
				'border-width': '1',
			})
			.selector(':parent')
			.css({
				'background-color': 'rgba(255, 255, 255, 0.5)',
				'border-color': 'rgb(150, 0, 0)',
				'border-width': '1',
				'content': 'data(per)',
				'font-size': '10',
				'text-valign': 'top',
			})
			.selector('edge')
			.css({
				'curve-style': 'bezier',
				'target-arrow-shape': 'triangle',
				'target-arrow-color': 'data(color)',
				'arrow-scale': '1',
				'line-color': 'data(color)',
			}),
			layout: {
				name: 'cose-bilkent',
				animate: false,
			}
		});

		cy.resize(550, 10, 10, 10);
	};
}());
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
		ml.gene = d.gene;
		// Set key properties and looping each data.
		ml.keys = mutualProps(
		ml.gene, d.mutation.concat(d.patient)[0]);
		loopingMutation(d.mutation);
		loopingPatient(d.patient);
		loopingGroup(d.group);
		// set properties of model.landscape.
		ml.type = util.keyToArr(ml.type);	
		ml.pq = loopingPq(d.pq, d.pqValue || 'p');
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

		exp.func.avg.sort = exp.func.avg.sort(function (a, b)	{
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

	preprocessing.expression = function (d)	{
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
var render = (function (render)	{
	'use strict';
	/*
		SVG 를 만들어주는 함수.
	 */
	render.createSVG = function (id, width, height)	{
		var id = id.indexOf('#') < 0 ? '#' + id : id,
				dom = document.querySelector(id);

		return d3.select(id)
					.append('svg')
					.attr('id', id.replace('#', '') + '_chart')
					.attr('width', (
						width || parseFloat(dom.style.width)) + 1)
					.attr('height', (
						height || parseFloat(dom.style.height)));
	};
	/*
		SVG 태그에 그룹을 추가해주는 함수.
	 */
	render.addGroup = function (svg, top, left, cls)	{
		svg = util.d3v4() ? svg : svg[0][0];
		svg = util.varType(svg) === 'Array' || 
					util.varType(svg) === 'Object' ? svg : d3.select(svg);

		var exist = d3.selectAll(
			'.' + svg.attr('id') + '.' + cls + '-g-tag');
		
		return exist.node() ? exist : 
						svg.append('g')
					 .attr('class', svg.attr('id') + ' ' + cls + '-g-tag')
					 .attr('transform', 
								 'translate(' + left + ', ' + top + ')');			
	};
	/*
		Attribute 를 SVG 에 등록시켜주는 함수.
	 */
	function setAttributes (svgElement, attrs)	{
		if (!attrs) { return false; }

		for (var attr in attrs)	{
			svgElement.attr(attr, attrs[attr]);
		}
	};
	/*
		Style 을 SVG 에 등록시켜주는 함수.
	 */
	function setStyles (svgElement, styles)	{
		if (!styles) { return false; }

		for (var style in styles)	{
			svgElement.style(style, styles[style]);
		}
	};
	/*
		Event 를 SVG 에 등록시켜주는 함수.
	 */
	function setOnEvents (svgElement, events)	{
		if (!events) { return false; }

		for (var event in events)	{
			svgElement.on(event, events[event]);
		}
	};
	/*
		Drag 를 SVG 에 등록시켜주는 함수.
	 */
	function setOnDrag (svgElement, drags)	{
		if (!drags) { return false; }

		var dg = util.d3v4() ? 
				d3.drag() : d3.behavior.drag().origin(Object);

		for (var drag in drags)	{
			var nm = util.d3v4() ? drag : 
					drag !== 'drag' ? 
					drag.substring(0, 1).toUpperCase() + 
					drag.substring(1) : drag;

			console.log(dg, nm, d3.behavior.drag().on())

			dg.on(nm, drags[drag]);
		}

		svgElement.call(dg);
	};
	/*
		Text 를 등록시켜주는 함수.
	 */
	function setText (svgElement, text)	{
		svgElement.text(text);
	};
	/*
		Rectangle, Text, Circle, ... 등에 
		Attribute, Style, Event 등을 등록시켜주는 함수.
	 */
	function defsShape (target)	{
		if (!this.element)	{
			throw new Error ('Not defined SVG Element');
		}
		
		var t = !this.data ? 
						 this.element.append(target) : 
						 this.element.data(this.data)
						 		 .enter().append(target);

		this.text ? setText(t, this.text) : false;

		setAttributes(t, this.attr);
		setStyles(t, this.style);
		setOnEvents(t, this.on);
		setOnDrag(t, this.call);
	}
	/*
		Draw rectangle.
	 */
	render.rect = function (defs)	{
		defsShape.call(defs, 'rect');
	};
	/*
		Draw Circle.
	 */
	render.circle = function (defs)	{
		defsShape.call(defs, 'circle');
	};
	/*
		Draw Text.
	 */
	render.text = function (defs)	{
		defsShape.call(defs, 'text');
	};
	/*
		Draw Line.
	 */
	render.line = function (defs)	{
		// Path 는 기존 도형들과 삽입 방식이 달라서
		// 별도의 코드로 작성하였다.
		var t = defs.element.append('path');
		
		setAttributes(t, defs.attr);
		setStyles(t, defs.style);
	};
	/*
		Draw Triangle.
	 */
	render.triangle = function (defs)	{
		defsShape.call(defs, 'polygon');
	};
	/*
		Draw Star.
	 */
	render.star = function (defs)	{
		var s = (util.d3v4() ? d3.symbol() : d3.svg.symbol())
						.type((util.d3v4() ? d3.symbolStar : 'star')),
				t = defs.element
						.append('path')
						.attr('d', s.size(defs.size));

		setStyles(t, defs.style);
		setOnEvents(t, defs.on);
	};

	return render;
}(render || {}));
// 일단, D3 에 있는 scale 함수를 사용하여 그리고
// 후에 scale 알고리즘을 파악하고 공부하여 새로 만드는것으로 하자.
var scale = (function (scale)	{
	'use strict';
	
	var model = {
		data: [],
		len: [],
	};
	/**
	 It is a function that make a domain data that is 
	 available for scale of d3's function and
	 calculate data length. 
	 */
	function domainData (type, data)	{
		var result = [];

		if (typeof data[0] === 'number' && 
				typeof data[1] === 'number' && data.length < 3)	{
			var max = Math.max(data[0], data[1]),
					min = Math.min(data[0], data[1]),
					len = (max + min) - min;

			for (var i = min; i <= len; i++)	{
				result.push(i);
			}

			return (
				model.data.push(result), model.len.push(len), 
				type === 'ordinal' ? result : [data[0], data[1]]
			);
		} else {
			return model.data.push(data), 
						 model.len.push(data.length), data;
		}
	};
	/**
	 It is a function that generate scale about ordinal. 
	 currently it is only use d3js but later 
	 it should changes to native code.
	 */
	scale.ordinal = function (domain, range)	{
		var dd = domainData('ordinal', domain);

		return !d3.scaleBand ? 
						d3.scale.ordinal().domain(dd).rangeBands(range) : 
						d3.scaleBand().domain(dd).range(range);
	}
	/**
	 It is a function that generate scale about linear. 
	 currently it is only use d3js but later 
	 it should changes to native code.
	 */
	scale.linear = function (domain, range)	{
		var dd = domainData('linear', domain);

		return !d3.scaleLinear ? 
						d3.scale.linear().domain(dd).range(range) : 
						d3.scaleLinear().domain(dd).range(range);
	};

	scale.getType = function (data)	{
		return typeof(data[0]) === 'number' ? 'linear' : 'ordinal';
	};

	scale.compatibleBand = function (scale)	{
		return !scale.bandwidth ? 
						scale.rangeBand() : scale.bandwidth();
	};

	scale.getDomain = function ()	{
		return model.data.shift();
	};

	scale.getDomainLength = function ()	{
		return model.len.shift();
	};

	scale.getDistance = function (type)	{
		return type === 'ordinal' ? scale.compatibleBand() : 
					 scale(1) - scale(0);
	};
	/*
		도메인 값의 첫번째 값이 문자열일 경우 ordinal,
		숫자일 경우 linear를 반환한다.
	 */
	function analScale (d)	{
		return util.varType(d[0]) === 'String' ? 
					'ordinal' : 'linear';
	};
	/*
		domain 에 따라 ordinal, linear 를 구분한 후
		맞는 스케일을 반환한다.
	 */
	scale.get = function (d, r)	{
		return scale[analScale(d)](d, r);
	};
	/*
		기존 Scale 에서 거꾸로된 Scale 을 반환하는 함수.
	 */
	scale.invert = function (scale)	{
		var domain = scale.domain(),
				range = scale.range();

		var s = analScale(domain) === 'linear' ? 
				util.d3v4() ? d3.scaleLinear() : d3.scale.linear() : 
				util.d3v4() ? d3.scaleQuantize() : d3.scale.quantize();
														 
		return s.domain(range).range(domain);
	};

	return scale;
}(scale||{}));
var scatter = (function (scatter)	{
	'use strict';

	var model = {};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.m = size.setMargin(o.margin);
		model.d = o.data;
		model.w = model.e.attr('width');
		model.h = model.e.attr('height');
		model.t = o.top || model.m.top || 0;
		model.l = o.left || model.m.left || 0;
		model.f = o.fontSize || '10px';
		model.ss = o.shapeSize || 5;
		model.sx = scale.get(o.xaxis, [
		model.m.left, model.w - model.m.right ]);
		model.sy = scale.get(o.yaxis, [
		model.m.top, model.h - model.m.bottom ]);
		model.g = render.addGroup(
		model.e, model.t, model.l, 'scatter');

		var id = model.e.attr('id');

		if (o.attr.r)	{
			render.circle({
				element: model.g.selectAll('#' + id + '_circle'),
				data: model.d,
				attr: {
					id: function (d) { return id + '_circle'; },
					cx: function (d, i)	{
						return o.attr.x ? o.attr.x.call(this, d, i, model) : 0;
					},
					cy: function (d, i)	{
						return o.attr.y ? o.attr.y.call(this, d, i, model) : 0;
					},
					r: function (d, i)	{
						return o.attr.r ? o.attr.r.call(this, d, i, model) : 0;
					},
				}, 
				style: {
					fill: function (d, i)	{
						return o.style.fill ? 
									 o.style.fill.call(this, d, i, model) : '#000000';
					},
					'fill-opacity': function (d, i)	{
						return o.style.fillOpacity ? 
									 o.style.fillOpacity.call(this, d, i, model) : '1';
					},
					stroke: function (d, i)	{
						return o.style.stroke ? 
									 o.style.stroke.call(this, d, i, model) : false;
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(this, d, i, model) : false;
					},
					mouseout: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseout ? 
									 o.on.mouseout.call(this, d, i, model) : false;
					}
				},
			})
		} else if (o.attr.points)	{
			render.triangle({
				element: model.g.selectAll('#' + id + '_triangle'),
				data: model.d,
				attr: {
					id: function (d) { return id + '_triangle'; },
					points: function (d, i) { 
						return o.attr.points ? 
									 o.attr.points.call(this, d, i, model) : [0, 0];
					},
				},
				style: {
					fill: function (d, i)	{
						return o.style.fill ? 
									 o.style.fill.call(this, d, i, model) : '#000000';
					},
					'fill-opacity': function (d, i)	{
						return o.style.fillOpacity ? 
									 o.style.fillOpacity.call(this, d, i, model) : '1';
					},
					stroke: function (d, i)	{
						return o.style.stroke ? 
									 o.style.stroke.call(this, d, i, model) : false;
					},
					'stroke-width': function (d, i)	{
						return o.style.strokeWidth ? 
									 o.style.strokeWidth.call(this, d, i, model) : '1px';
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(this, d, i, model) : false;
					},
					mouseout: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseout ? 
									 o.on.mouseout.call(this, d, i, model) : false;
					}
				},
			});
		} else {
			render.rect({	
				element: model.g.selectAll('#' + id + '_rect'),
				data: model.d,
				attr: {
					id: function (d) { return id + '_rect'; },
					x: function (d, i) { 
						return o.attr.x ? o.attr.x.call(model, d, i) : 0;
					},
					y: function (d, i) { 
						return o.attr.y ? o.attr.y.call(model, d, i) : 0;
					},
					width: function (d, i) { 
						return o.attr.width ? o.attr.width.call(model, d, i) : 5; 
					},
					height: function (d, i) { 
						return o.attr.height ? o.attr.height.call(model, d, i) : 5; 
					},
				},
				style: {
					fill: function (d) { 
						return o.style.fill ? o.style.fill(d) : '#000000'; 
					},
					'fill-opacity': function (d)	{
						return o.style.fillOpacity ? 
									 o.style.fillOpacity(d) : '1';
					},
					stroke: function (d) { 
						return o.style.stroke ? o.style.stroke(d) : false; 
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(this, model, d, i) : false;
					},
					mouseout: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseout ? 
									 o.on.mouseout.call(this, d, i, model) : false;
					}
				},
			});
		}

		if (o.text)	{
			render.text({
				element: model.g.selectAll('#' + model.e.attr('id') + '_text'),
				data: model.d,
				attr: {
					id: function (d) { 
						return (model.isText = true, model.e.attr('id') + '_text'); 
					},
					x: function (d, i) { 
						return o.attr.x ? o.attr.x.call(model, d, i) : 0; 
					},
					y: function (d, i) { 
						return o.attr.y ? o.attr.y.call(model, d, i) : 0; 
					},
				},
				style: {
					'font-size': function (d) { 
						return o.style.fontSize ? o.style.fontSize(d) : '10px'; 
					},
					'font-family': function (d) { 
						return o.style.fontFamily ? o.style.fontFamily(d) : 'Arial'; 
					},
					'alignment-baseline': function (d)	{
						return o.style.alignmentBaseline ? 
									 o.style.alignmentBaseline : 'middel';
					}
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(this, model, d, i) : false;
					},
					mouseout: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseout ? 
									 o.on.mouseout.call(this, d, i, model) : false;
					}
				},
				text: function (d, i)	{ 
					return o.text ? o.text.call(model, d, i) : ('legend ' + i);
				},
			});
		}	
	};

}(scatter||{}));
var selectBox = (function (selectBox)	{
	'use strict';

	var model = {};
	/*
		Select Box 가 그려질 Frame 을 만드는 함수.
	 */
	function makeSBFrame (className)	{
		var div = document.createElement('div'),
				height = (model.h - model.m.top * 2) < 40 ? 
								 (model.h - model.m.top * 2) : 40;

		div.className = (className + ' drop-menu');
		div.style.width = (model.w - model.m.left * 2) + 'px';
		div.style.height = height + 'px';
		div.style.marginLeft = model.m.left + 'px';
		div.style.marginTop = model.m.top + 'px';
		div.style.fontSize = model.fontSize;

		return div;
	};
	/*
		처음에 표기될 문자열과 화살표를 만드는 함수.
	 */
	function initText (className, text)	{
		var div = document.createElement('div'),
				spn = document.createElement('span'),
				itg = document.createElement('i');

		div.className = className + ' select';
		// 기본값을 10으로 했는데, 그보다 더 커지면 방법을 또 
		// 찾아야 한다.
		div.style.paddingTop = 10 - model.m.top + 1 + 'px';
		div.style.paddingBottom = 10 - model.m.top + 1 + 'px';
		div.style.paddingLeft = 10 - model.m.left + 1 + 'px';
		div.style.paddingRight = 10 - model.m.left + 1 + 'px';
		spn.innerHTML = text;
		itg.className = 'fa fa-chevron-down';

		return div.appendChild(spn), 
					 div.appendChild(itg), div;
	};	
	/*
		선택된 값이 표시될 input 태그를 만드는 함수.
	 */
	function inputView (name)	{
		var inp = document.createElement('input');

		inp.type = 'hidden';
		inp.name = name;

		return inp;
	};
	/*
		Item 을 만드는 함수.
	 */
	function addItems (list)	{
		var ult = document.createElement('ul');

		ult.className = 'dropeddown';
		
		util.loop(list, function (d)	{
			var lit = document.createElement('li');

			lit.id = d.toLowerCase();
			lit.title = d;
			lit.innerHTML = draw.textOverflow(
				d, model.fontSize, model.w * 0.40);

			ult.appendChild(lit);
		});	

		return ult;
	};
	/*
		Slide 동작 및 기타 동작을 실행해주는 함수.
	 */
	function execution (className, callback)	{
		var cls = '.' + className;

		// Click Event 중복 발생 금지 방법.
		$(cls).click(function (e) {
      $(this).attr('tabindex', 1).focus();
      $(this).toggleClass('active');
      $(this).find('.dropeddown').slideToggle(300);
    });
    $(cls).focusout(function () {
      $(this).removeClass('active');
      $(this).find('.dropeddown').slideUp(300);
    });
    $(cls + ' .dropeddown li').click(function (e) {
      $(this).parents('.drop-menu')
      			 .find('span').text($(this).text());
      $(this).parents('.drop-menu')
      			 .find('span').attr('title', $(this).attr('id'));
      $(this).parents('.drop-menu')
      			 .find('input').attr('value', $(this).attr('id'));

      return !callback ? false : 
      				callback($(this).attr('id').toLowerCase());
    });
	};

	return function (o)	{
		// Set configurations.
		model = {};
		model.e = document.querySelector(o.element);
		model.m = size.setMargin(o.margin || [0, 0, 0, 0]);
		model.w = o.width || parseFloat(model.e.style.width);
		model.h = o.height || parseFloat(model.e.style.height);
		model.className = o.className || '';
		model.initText = o.initText || 'Select item';
		model.viewName = o.viewName || 'select';
		model.fontSize = o.fontSize || '14px';
		model.items = o.items || [''];
		model.click = o.click || null;
		model.frame = makeSBFrame(model.className);
		model.initText = initText(model.className, model.initText);
		model.viewer = inputView(model.viewName);
		model.setItemts = addItems(model.items);

		if (model.e.children.length < 1)	{
			// Make select box.
			model.frame.appendChild(model.initText);
			model.frame.appendChild(model.viewer);
			model.frame.appendChild(model.setItemts);
			model.e.appendChild(model.frame);
			// Add click event.
			execution(model.className, model.click);
		}
	};

}(selectBox||{}));
var size = (function (size)	{
	'use strict';

	var model = { ids: [] }

	size.chart = {};
	/*
		Tooltip Tag 를 만드는 함수.
	 */
	function makeTooltip ()	{
		var div = document.createElement('div');

		div.id = 'biochart_tooltip';
		div.className = 'biochart-tooltip';

		document.body.appendChild(div);
	};
	/*
		Chart frame in div.
	 */
	function makeFrames (ids)	{
		util.loop.call(this, ids, function (k, v)	{
			var e = document.createElement('div');

			e.id = k;
			e.style.width = v.w + 'px';
			e.style.height = v.h + 'px';

			model.ids.push(k);

			this.appendChild(e);
		});

		makeTooltip();
	};
	/*
		About parameters then produces margin set.
	 */
	size.setMargin = function (margin)	{
		if (!margin.length)	{
			return { top: margin, left: margin, bottom: margin, right: margin };
		} else if (Object.prototype.toString.call(margin) === '[object Object]')	{
			return margin;
		} else {
			switch(margin.length)	{
				case 1: return { top: margin[0], left: margin[0], bottom: margin[0], right: margin[0] }; break;
				case 2: return { top: margin[0], left: margin[1], bottom: margin[0], right: margin[1] }; break;
				case 3: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[1] }; break;
				case 4: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[3] }; break;
				default: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[3] }; break;
			}
		}
	};
	/*
		Targeted element set width and height.
	 */
	size.setSize = function (e, w, h)	{
		e.style.width = w + 'px';
		e.style.height = h + 'px';

		return e;
	};
	/*
		Setting size of exclusivity.
	 */
	size.chart.exclusivity = function (e, w, h)	{
		var ids =  {
			exclusivity_select_geneset: {w: w * 0.25, h: h * 0.1},
			exclusivity_upper_empty: {w: w * 0.34, h: h * 0.2},
			exclusivity_survival: {w: w * 0.4, h: h},
			exclusivity_network: {w: w * 0.25, h: h * 0.55},
			exclusivity_heatmap: {w: w * 0.35, h: h * 0.3},
			exclusivity_legend: {w: w * 0.35, h: h * 0.05},
			exclusivity_sample_legend: {w: w * 0.35, h: h * 0.05},
		};

		return makeFrames.call(size.setSize(e, w, h), ids), model.ids;
	};
	/*
		Setting size of Landscape.
	 */
	size.chart.landscape = function (e, w, h)	{
		var ids = {
			landscape_title: {w: w, h: h * 0.05},
			landscape_legend: {w: w * 0.15, h: h},
			landscape_axis_sample: {w: w * 0.15, h: h * 0.15},
			landscape_patient_sample: {w: w * 0.01, h: h * 0.15},
			landscape_sample: {w: w * 0.59, h: h * 0.15},
			landscape_scale_option: {w: w * 0.1, h: h * 0.15},
			landscape_axis_group: {w: w * 0.15, h: h * 0.2},
			landscape_patient_group: {w: w * 0.01, h: h * 0.2},
			landscape_group: {w: w * 0.59, h: h * 0.2},
			landscape_option: {w: w * 0.1, h: h * 0.2},
			landscape_gene: {w: w * 0.15, h: h * 0.65},
			landscape_patient_heatmap: {w: w * 0.01, h: h * 0.65},
			landscape_heatmap: {w: w * 0.59, h: h * 0.65},
			landscape_pq: {w: w * 0.1, h: h * 0.65},
		};

		return makeFrames.call(size.setSize(e, w, h), ids), model.ids;
	};
	/*
		Setting size of Variants.
	 */
	size.chart.variants = function (e, w, h)	{
		var ids = {
			variants_title: {w: w * 0.95, h: h * 0.05},
			variants_needle: {w: w * 0.85, h: h * 0.85},
			variants_legend: {w: w * 0.15, h: h * 0.5},
			variants_patient_legend: {w: w * 0.15, h: h * 0.5},
			variants_navi: {w: w * 0.85, h: h * 0.09},
		};

		return makeFrames.call(size.setSize(e, w, h), ids), model.ids;
	};
	/*
		Setting size of Expression.
	 */
	size.chart.expression = function (e, w, h)	{
		var ids = {
			expression_title: {w: w, h: h * 0.05},
			expression_survival: {w: w * 0.4, h: h * 0.95},
			expression_bar_plot: {w: w * 0.4, h: h * 0.4},
			expression_function: {w: w * 0.2, h: h * 0.05},
			expression_color_mapping: {w: w * 0.2, h: h * 0.05},
			expression_bar_legend: {w: w * 0.2, h: h * 0.3},
			expression_scatter_plot: {w: w * 0.4, h: h * 0.3},
			expression_scatter_empty: {w: w * 0.2, h: h * 0.2},
			expression_scatter_legend: {w: w * 0.2, h: h * 0.1},
			expression_heatmap: {w: w * 0.4, h: h * 0.24},
			expression_signature: {w: w * 0.2, h: h * 0.05},
			expression_color_gradient: {w: w * 0.2, h: h * 0.25},
		};

		return makeFrames.call(size.setSize(e, w, h), ids), model.ids;
	};	

	return size;
}(size || {}));
var survival = (function (survival)	{
	'use strict';

	var model = {};
	/*
		Survival 데이터 (case_id, months, status) 를 구하는 
		함수.
	 */
	function getSurvivalData (data)	{
		var month = {os: [], dfs: []},
				pure = {os: [], dfs: []},
				all = {os: [], dfs: []};

		function forPatient (id, month, status, array)	{
			var obj = {};

			obj[id] = {
				case_id: id,
				months: month,
				status: status,
			};

			array.push(obj);
		};

		util.loop(data, function (d, i)	{
			if (d)	{
				var osm = (d.os_days / 30),
						dfsm = (d.dfs_days / 30);

				month.os.push(osm);
				month.dfs.push(dfsm);

				if (!(osm == null || d.os_status == null))	{
					forPatient(d.participant_id, osm, d.os_status, pure.os);
				}

				if (!(dfsm == null || d.dfs_status == null))	{
					forPatient(d.participant_id, dfsm, d.dfs_status, pure.dfs);
				}

				forPatient(d.participant_id, osm, d.os_status, all.os);
				forPatient(d.participant_id, dfsm, d.dfs_status, all.dfs);
			}
		});

		return {
			month: month,
			pure: pure,
			all: all,
		};
	};
	/*
		Tab 태그의 input 을 만드는 함수.
	 */
	function tabInput (id, idx)	{
		var input = document.createElement('input');
				input.id = id + '_survival';
				input.name = 'tabs';
				input.type = 'radio';
				input.checked = idx === 0 ? true : false;

		return input;
	};
	/*
		Tab 태그의 라벨 즉, 탭의 제목을 그리는 함수.
	 */
	function tabLabel (id, name)	{
		var label = document.createElement('label');
				label.htmlFor = id + '_survival';
				label.innerHTML = name;

		return label;
	};
	/*
		선택된 탭의 내용이 들어갈 바탕 div 를 만드는 함수.
	 */
	function tabContent (id, content)	{
		var div = document.createElement('div');
				div.id = id;

		return div;
	};
	/*
		Survival 탭을 만드는 함수.
	 */
	function makeTab (target, tabNames)	{
		document.querySelector(target).innerHTML = '';

		var div = document.querySelector(target);

		for (var i = 0, l = tabNames.length; i < l; i++)	{
			var name = tabNames[i],
					id = tabNames[i].toLowerCase();

			div.appendChild(tabInput(id, i));
			div.appendChild(tabLabel(id, name));
		}

		for (var i = 0, l = tabNames.length; i < l; i++)	{
			var area = tabContent(tabNames[i].toLowerCase());

			area.appendChild(
				tabContent(tabNames[i].toLowerCase() + '_survival_curve'));
			area.appendChild(
				tabContent(tabNames[i].toLowerCase() + '_stat_table'))
			div.appendChild(area);
		}
	};

	return function (o)	{
		model.survivalData = getSurvivalData(o.data);

		makeTab(o.element, ['OS', 'DFS'])

		SurvivalTab.init(o.divisionData, model.survivalData.pure);

		return model;
	};
}(survival || {}));
var tooltip = (function (tooltip)	{
	'use strict';

	var model = {};
	/*
		Tooltip 의 방향을 설정해주는 함수.
	 */
	function setDirection (tbcr, pbcr, bcr)	{
		if (tbcr.left - bcr.width / 2 < pbcr.left)	{
			return 'right';
		} else if (tbcr.top - bcr.height < pbcr.top)	{
			return 'bottom';
		} else if (tbcr.right + bcr.width > pbcr.right)	{
			return 'left';
		} else if (tbcr.bottom + bcr.height > pbcr.bottom)	{
			return 'top';
		} else {
			return 'top';
		}
	};	
	/*
		Tooltip 을 띄워주는 함수.
	 */
	function show (div, target, parent)	{
		if (!div)	{
			throw new Error('Do not find a Tooltip element');
		}

		var bcr = div.getBoundingClientRect(),
				tbcr = target.getBoundingClientRect(),
				pbcr = parent.getBoundingClientRect(),
				dir = setDirection(tbcr, pbcr, bcr);
		/*
			Tooltip 의 위쪽 Position 값 설정.
		 */
		function setTop (dir, pos, height)	{
			if (dir !== 'left' && dir !=='top' && 
					dir !== 'bottom' && dir !== 'right')	{
				throw new Error('Wrong direction');
			}

			return {
				top: pos.top - height - 10 + window.scrollY + 'px',
				left: pos.top - height / 2 + window.scrollY + 'px',
				bottom: pos.bottom + 10 + window.scrollY + 'px',
				right: pos.top - height / 2 + window.scrollY + 'px',
			}[dir];
		};
		/*
			Tooltip 의 왼쪽 Position 값 설정.
		 */
		function setLeft (dir, pos, width)	{
			if (dir !== 'left' && dir !=='top' && 
					dir !== 'bottom' && dir !== 'right')	{
				throw new Error('Wrong direction');
			}

			return {
				top: pos.left - width / 2 + window.scrollX + 'px',
				left: pos.left - width - 10 + 'px',
				bottom: pos.left - width / 2 + window.scrollX + 'px',
				right: pos.right + 10 + 'px',
			}[dir];
		};

		div.className = dir;
		div.style.visibility = 'visible';
		// Set top & Left(Scroll 변화가 있을 경우도 고려.)
		div.style.top = setTop(dir, tbcr, bcr.height);
		div.style.left = setLeft(dir, tbcr, bcr.width);
	};
	/*
		Tooltip 을 가려주는 함수.
	 */
	function hide (div)	{
		if (!div)	{
			throw new Error('Do not find a Tooltip element');
		}

		div.innerHTML = '';
		div.style.top = '0px';
		div.style.left = '0px';
		div.style.visibility = 'hidden';
	};

	return function (o)	{
		if (util.varType(o) === 'String')	{
			if (!document.getElementById('biochart_tooltip'))	{
				throw new Error('Not found "#biochart_tooltip"');
			}
			
			return hide(document.getElementById('biochart_tooltip'));
		}

		var target = o.element || null,
				parent = draw.getParentSvg(target),
				contents = o.contents || '',
				tooltipDiv = document.getElementById('biochart_tooltip');
				tooltipDiv.innerHTML = contents;

		return show(tooltipDiv, target, parent);
	};

}(tooltip||{}));
var util = (function (util)	{
	'use strict';
	/*
		d3 version 체크 함수.
	 */
	util.d3v4 = function ()	{
		return d3.version.indexOf('3') === 0 ? false : true;
	};

	util.camelCase = function (txt)	{
		return txt.substring(0, 1).toUpperCase() + 
					 txt.substring(1).toLowerCase();
	};
	/*
		객체와 배열을 순회하고 그 값을 콜백함수로 반환하는 함수.
	 */
	util.loop = function (d, cb)	{
		if (util.varType(d) === 'Array')	{
			for (var i = 0, l = d.length; i < l; i++)	{
				cb.call(this, d[i], i);
			}	
		} else if (util.varType(d) === 'Object')	{
			for (var k in d)	{
				cb.call(this, k, d[k]);
			}	
		}
	};
	/*
		객체를 복사하는 함수.
	 */
	util.cloneObject = function (obj)	{
		if (obj === null || typeof(obj) !== 'object')	{
			return obj;
		}

		var copy = obj.constructor();

		util.loop(obj, function (key, val)	{
			if (obj.hasOwnProperty(key))	{
				copy[key] = obj[key];
			}
		});

		return copy;
	};
	/*
		변수의 타입을 문자열로 반환하는 함수.
	 */
	util.varType = function (v)	{
		var ts = Object.prototype.toString.call(v);

		return ts.substring(ts.indexOf(' ') + 1, 
					 ts.indexOf(']'));
	};
	/*
		Object 의 키값들로만 구성된 Arr 를 만들어 
		반환하는 함수.
	 */
	util.keyToArr = function (o)	{
		var r = [];

		util.loop(o, function (k, v)	{
			r.push(k);
		});

		return r;
	};
	/*
		Min 과 Max 값을 반환해주는 함수.
	 */
	util.minmax = function (a, b)	{
		return arguments.length < 2 ? {
			min: Math.min.apply(null, a),
			max: Math.max.apply(null, a),
		} : {
			min: Math.min.call(null, a, b),
			max: Math.max.call(null, a, b),
		};
	};
	/*
		Median (중간값) 을 구하고 반환하는 함수.
	 */
	util.median = function (list)	{
		return new Array().concat(list)
					.sort()[util.medIndex(list)];
	};
	/*
		Median 의 인덱스를 반환하는 함수.
	 */
	util.medIndex = function (list) {
		return list.length % 2 === 1 ? 
					(list.length + 1) / 2 : list.length / 2;
	}
	/*
		문자열 사이의 공백을 지워 반환하는 함수.
	 */
	util.removeWhiteSpace = function (t)	{
		return t.replace(/\s/ig, '');
	};
	/*
		문자열에서 사용자지정위치의 문자를 다른 문자로
		대치해주는 함수.
		String 객체의 프로토타입으로 지정하였다.
	 */
	String.prototype.replaceAt = function (idx, rep)	{
		return this.substr(0, idx) + rep + 
					 this.substr(idx + rep.length);
	};
	/*
		Array 를 특정한 하나의 값으로 채워주는 함수.
		이미 중복된 fill 이란 함수가 있지만,
		IE 에서는 사용이 되지 않기 때문에
		새로 오버라이딩 하였다.
	 */
	Array.prototype.fill = function (len, v)	{
		for (var i = 0; i < len; i++)	{
			this.push(v);
		}

		return this;
	};

	return util;
}(util||{}));
'use strict';

var variants = (function (variants)	{
	'use strict';

	var model = { div: {} };
	/*
		Title 을 만드는 함수.
	 */
	function title ()	{
		model.div.title = document.querySelector('#variants_title');
		model.div.title.innerHTML = model.origin.variants.title;
		model.div.title.style.fontSize = 
			draw.getFitTextSize(model.origin.variants.title,
							 parseFloat(model.div.title.style.width), 
							 parseFloat(model.div.title.style.height));
	};
	/*
		x,y 축의 위치를 설정하는 함수.
	 */
	function getAxisPosition (w, e, m)	{
		return [
			w === 'top' ? e.attr('height') - m[0] : m[0], m[1]
		];
	};
	/*
		X,Y 축을 그려주는 함수.
	 */
	function drawAxis ()	{
		var // Y 축의 데이터는 아래에서 위로 향하는 데이터이기 때문에
				// 원본데이터를 복사하여 순서를 뒤집어 주었다.
				yd = new Array().concat(model.data.axis.needle.y);

		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			util.loop(['left', 'top'], function (d, i)	{
				axis.element(v)[d]({
					margin: config.variants.axis[d].margin,
					position: getAxisPosition(d, v, 
										config.variants.axis[d].margin),
					data: d === 'left' ? yd.reverse() : 
															 model.data.axis.needle.x,
					opt: {},
				});
			});
		});
	};
	/*
		Needle Plot 을 그려주는 함수.
	 */
	function drawNeedle (xaxis)	{
		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			needle({
				element: v,
				lineData: model.data.needle,
				circleData: model.data.fullNeedle,
				line: config.variants.needle.line,
				attr: config.variants.needle.attr,
				style: config.variants.needle.style,
				margin: config.variants.needle.margin,
				xaxis: (xaxis || model.data.axis.needle.x),
				yaxis: model.data.axis.needle.y,
				on: config.variants.needle.on,
			});
		});
	};
	/*
		Needle Plot 아래 Graph 를 그려주는 함수.
	 */
	function drawNeedleGraph (xaxis)	{
		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			needleGraph({
				element: v,
				data: model.data.graph,
				attr: config.variants.needleGraph.attr,
				style: config.variants.needleGraph.style,
				margin: config.variants.needleGraph.margin,
				text: config.variants.needleGraph.text,
				xaxis: (xaxis || model.data.axis.needle.x),
				yaxis: model.data.axis.needle.y,
				on: config.variants.needleGraph.on,
			});
		});
	};
	/*
		Navigator bar 를 그려주는 함수.
	 */
	function drawNeedleNavi () {
		layout.getSVG(model.svg, ['navi'], function (k, v)	{
			needleNavi({
				element: v,
				data: model.data,
				margin: config.variants.navi.margin,
				style: config.variants.navi.style,
				xaxis: model.data.axis.needle.x,
				yaxis: model.data.axis.needle.y,
				drag: {
					drag: config.variants.navi.drag.drag,
					end: function (d, i, m)	{
						var cv = config.variants.navi,
								iv = scale.invert(m.sx),
								dm = [iv(cv.start.now + m.rect.width),
											iv(cv.end.now + m.rect.width)],
								rg = [m.m.left, m.w - m.m.right];

						d3.selectAll('.top-axis-g-tag')
							.call(axis.byVersion(scale.get(dm, rg), 'top'));

						layout.removeG([
							'.variants_needle_chart.needle-line-g-tag', 
							'.variants_needle_chart.needle-circle-g-tag',
							'.variants_needle_chart.needle-graph-g-tag', 
							'.variants_needle_chart.needle-patient-g-tag']);

						drawNeedle(dm);
						drawNeedleGraph(dm);
						drawPatient(dm);
					},
				},
			});
		});
	};
	/*
		Needle 에 Patient 를 추가하는 함수.
	 */
	function needlePatient (d, xaxis)	{
		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			var md = {},
			  	cp = config.variants.patient.needle;

			md.m = size.setMargin(cp.margin);
			md.id = v.attr('id');
			md.w = v.attr('width');
			md.h = v.attr('height');
			md.g = render.addGroup(
				v, md.h - md.m.bottom, md.m.left, 'needle-patient');
			md.s = scale.get((xaxis || model.data.axis.needle.x), 
											 [md.m.left, md.w - md.m.right]);
			md.len = 5;

			render.triangle({
				element: md.g.selectAll('#' + md.id + '_tri'),
				data: d,
				attr: {
					id: function (d, i) { return md.id + '_tri'; },
					points: function (d, i) { 
						return cp.attr.points ? 
									 cp.attr.points.call(
									 	this, d, i, md) : [0, 0];
					},
				},
				style: {
					fill: function (d, i) { 
						return cp.style.fill ? 
									 cp.style.fill.call(
									 	this, d, i, md) : '#000000';
					},
					stroke: function (d, i)	{
						return cp.style.stroke ? 
									 cp.style.stroke.call(
									 	this, d, i, md) : '#FFFFFF';
					},
				},
				on: {
					mouseover: function (d, i)	{
						return cp.on.mouseover ? 
									 cp.on.mouseover.call(
									 	this, d, i, md) : false;
					},
					mouseout: function (d, i)	{
						return cp.on.mouseout ? 
									 cp.on.mouseout.call(
									 	this, d, i, md) : false;
					},
				}
			});
		});
	};
	/*
		Legend 에 patient 를 남기는 함수.
	 */
	function legendPatient (d)	{
		layout.getSVG(model.svg, ['nt_legend'], function (k, v)	{
			legend({
				element: v,
				data: d,
				attr: config.variants.patient.legend.attr,
				style: config.variants.patient.legend.style,
				text: config.variants.patient.legend.text,
				margin: config.variants.patient.legend.margin,
			});
		});
	};
	/*
		Patient 를 그려주는 함수.
	 */
	function drawPatient (xaxis)	{
		if (xaxis)	{
			return needlePatient(model.data.patient, xaxis);
		}

		needlePatient(model.data.patient);
		legendPatient(model.data.patient);
	};
	/*
		Legend 를 그려주는 함수.
	 */
	function drawLegend ()	{
		var th = draw.getTextHeight(
						 	config.variants.legend.style.fontSize).height;

		document.querySelector('#variants_legend').style.height = 
					 ((th + 6) * model.data.type.length) + 'px';

		layout.getSVG(model.svg, ['ts_legend'], function (k, v)	{
			legend({
				element: v,
				data: model.data.type,
				font: config.variants.legend.style.fontSize(),
				priority: config.landscape.priority,
				text: config.variants.legend.text,
				attr: config.variants.legend.attr,
				style: config.variants.legend.style,
				margin: config.variants.legend.margin,
			});
		});
	};
	/*
		Variants 를 그려주는 함수.
	 */
	function drawVariants ()	{
		drawAxis();
		drawLegend();
		drawNeedle();
		drawNeedleNavi();
		drawNeedleGraph();
		drawPatient();
	};

	return function (o)	{
		console.log('Given Variants data: ', o);
		var e = document.querySelector(o.element || null),
				w = parseFloat(o.width || e.style.width || 1400),
				h = parseFloat(o.height || e.style.height || 700);
		// Set the color of whole background.
		e.style.background = '#F7F7F7';
		// Origin data from server.
		model.origin = o.data;
		// preprocess data for landscape and call drawLandScape.
		model.data = preprocessing.variants(o.data);
		// Make Landscape layout and return div ids.
		model.ids = size.chart.variants(e, w, h);
		// Make svg to parent div and object data.
		model.svg = layout.variants(model.ids, model);

		title();
		drawVariants();
	};
}(variants||{}));