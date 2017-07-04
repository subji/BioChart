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
	function byVersion (s, l)	{
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
				g = render.addGroup(model.current, p[0], p[1]);

		return g.call(options(byVersion(c, 'top'), d.opt, d.data)), 
					 isRemove(g, d.opt.remove), g;
	};
	/*
		축이 종 방향이고 축의 값이 왼쪽에 표기될때 호출되는 함수.
	 */
	axis.left = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [m.top, s.w - m.right],
				c = scale.get(d.data, [m.top, s.h - m.bottom]),
				g = render.addGroup(model.current, p[0], p[1]);

		return g.call(options(byVersion(c, 'left'), d.opt, d.data)), 
					 isRemove(g, d.opt.remove), g;
	};

	axis.bottom = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [s.h - m.bottom, m.left],
				c = scale.get(d.data, [m.left, s.w - m.right]),
				g = render.addGroup(model.current, p[0], p[1]);

		return g.call(options(byVersion(c, 'bottom'), d.opt, d.data)), 
					 isRemove(g, d.opt.remove), g;
	};

	axis.right = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [m.top, m.left],
				c = scale.get(d.data, [m.top, s.h - m.bottom]),
				g = render.addGroup(model.current, p[0], p[1]);

		return g.call(options(byVersion(c, 'right'), d.opt, d.data)), 
					 isRemove(g, d.opt.remove), g;
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
		var s = draw.size(model.e),
				x = [model.m.left, (model.w || s.w) - model.m.right], 
				y = [model.m.top, (model.h || s.h) - model.m.bottom];

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
		model.w = o.width || null;
		model.h = o.height || null;
		model.m = size.setMargin(o.margin);
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.g = render.addGroup(model.e, model.t, model.l);
		model.dx = o.xaxis;
		model.dy = o.yaxis;
		model.sx = setScale(o.direction, o.xaxis, 'x');
		model.sy = setScale(o.direction, o.yaxis, 'y');

		var id = model.e.attr('id');
		/*
		 	Bar, Stacked Bar, ... 를 그려주는 렌더링 함수를 호출하는 부분.
		 */
		render.rect({
			element: model.g.selectAll('#' + id + '_rect'),
			data: o.data,
			attr: {
				id: function (d) { return id + '_rect'; },
				x: function (d) { 
					return o.attr.x ? o.attr.x.call(model, d) : o.attr.x(d); 
				},
				y: function (d) { 
					return o.attr.y ? o.attr.y.call(model, d) : o.attr.y(d); 
				},
				width: function (d) { 
					return o.attr.width ? o.attr.width.call(model, d) : 
								 o.attr.width(d); 
				},
				height: function (d) { 
					return o.attr.height ? o.attr.height.call(model, d) : 
								 o.attr.height(d); 
				},
			},
			style: {
				fill: function (d) { 
					return o.style.fill ? o.style.fill(d) : '#000000'; 
				},
				stroke: function (d) { 
					return o.style.stroke ? o.style.stroke(d) : '#FFFFFF'; 
				},
			},
		});

		return model;
	};
}(bar || {}));
'use strict';

var config = {
	exclusivity: {},
	landscape: {},
	variants: {},
};
// For Mutational Landscape ==============================================
config.landscape.name = function (value)	{
	value = value.replace(/(_ins|_del)$/ig, '_indel');
	value = value.substring(0, 1).toUpperCase() + 
					value.substring(1).toLowerCase();

	return value;
};

config.landscape.case = function (mutation)	{
	switch (config.landscape.priority(config.landscape.name(mutation))) {
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
		'dead': '#C50E36',
		'alive': '#04CDA4',
		// Gender of Group.
		'male': '#0F67B6',
		'female': 'E0A4E5',
		// Race of Group.
		'white': '#9CB1CE',
		'black or african american': '#302F24',
		'asian': '#CB771F',
		'american indian or alaska native': '#38120B',
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
// ============================ Mutatinonal Landscape ==================================
/*
	Sample, Patient_sample 이 그려지는 차트의 속성과 모양 정의 객체.
 */
config.landscape.sample = {
	attr: {
		x: function (d) {return d.x.indexOf('-') > -1 ? this.sx(d.x) : this.sx(d.x) + 3;},
		y: function (d) {return this.sy(util.minmax(this.dy).max) - this.sy(d.y + d.value) + this.sy(util.minmax(this.dy).min);},
		width: function (d) {return d.x.indexOf('-') > -1 ? scale.compatibleBand(this.sx) : scale.compatibleBand(this.sx) - 7.5},
		height: function (d) {return this.sy(d.value) - this.sy(util.minmax(this.dy).min);},	
	},
	style: {
		fill: function (d)	{ return config.landscape.color(d.info); },
		stroke: function (d) { return '#FFFFFF'; },
	},
};
/*
	Gene 이 그려지는 차트의 속성과 모양 정의 객체.
 */
config.landscape.gene = {
	attr: {
		x: function (d) {return this.sx(util.minmax(this.dx).max - d.x) - this.sx(d.value) + this.m.left;},
		y: function (d) {return this.sy(d.y);},
		width: function (d) {return this.sx(d.value) - this.m.left;},
		height: function (d) { return scale.compatibleBand(this.sy); },
	},
	style: {
		fill: function (d)	{ return config.landscape.color(d.info); },
		stroke: function (d) { return '#FFFFFF'; },	
	},
};
/*
	pq 가 그려지는 차트의 속성과 모양 정의 객체.
 */
config.landscape.pq = {
	attr: {
		x: function (d) { return this.sx(util.minmax(this.dx).min); },
		y: function (d) { return this.sy(d.y); },
		width: function (d) { return this.sx(d.value); },
		height: function (d) { return scale.compatibleBand(this.sy); },
	},
	style: {
		fill: function (d)	{ return '#BFBFBF'; },
		stroke: function (d) { return '#FFFFFF'; },
	},
};
/*
	heatmap 이 그려지는 차트의 속성과 모양 정의 객체.
 */
config.landscape.heatmap = {
	attr: {
		x: function (d)	{return this.sx(d.x);},
		y: function (d)	{return config.landscape.case(d.value) !== 'cnv' ? (scale.compatibleBand(this.sy) / 3) + this.sy(d.y) : this.sy(d.y);},
		width: function (d)	{return scale.compatibleBand(this.sx);},
		height: function (d)	{return config.landscape.case(d.value) !== 'cnv' ? scale.compatibleBand(this.sy) / 3 : scale.compatibleBand(this.sy);},
	},
	style: {
		fill: function (d)	{return config.landscape.color(d.value);},
		stroke: function (d)	{return '#FFFFFF';}
	},
};
/*
	Group 이 그려지는 차트의 속성과 모양의 객체.
 */
config.landscape.group = {
	attr: {
		x: function (d) {return this.sx(d.x);},
		y: function (d) {return this.sy(d.y);},
		width: function (d) {return scale.compatibleBand(this.sx);},
		height: function (d) {return scale.compatibleBand(this.sy);},
	},
	style: {
		fill: function (d) { return config.landscape.color(d.value); },
		stroke: function (d) { return '#FFFFFF'; },
	}
};

config.landscape.legend = {
	attr: {
		x: function (d, i) {
			var x = this.dr === 'h' ? (this.p * 2 + this.mw) * i : 0;

			return this.isText ? (x + this.p * 2) : x;
		},
		y: function (d, i) { 
			var h = this.height || 15,
					y = this.dr === 'h' ? 0 : ((this.p + this.mh) * i);

			if (this.isText)	{
				return y + this.mh - this.mh / 2 + this.p / 2;
			} else {
				if (config.landscape.case(d))	{
					return config.landscape.case(d) === 'var' ? y + h / 3 : y;
				}
			}	

			return y;
		},
		width: function (d, i) {return this.width || 5;},
		height: function (d, i) { 
			var h = this.height || 15;

			return config.landscape.case(d) ? 
						 config.landscape.case(d) === 'var' ? h / 3 : h : h;
		},
	},
	style: {
		fill: function (d) { return config.landscape.color(d); },
		stroke: function (d) { return '#FFFFFF'; },	
		fontFamily: function (d) { return 'Times Roman'; },
		fontSize: function (d) { return '12px'; },
	},
	text: function (d)	{ return d; },
}

/*
	Mutational Landscape 에 그려지는 Axis 들의 방향, 마진, 위치값들을
	정의해놓은 객체.
 */
config.landscape.axis = {
	sample: {direction: 'left', margin: [5, 0, 10, 5], opt: {tickValues: 3}},
	group: {direction: 'right', margin: [0, 0, 0, 0], opt: {remove: 'line, path'}},
	gene: [{direction: 'right', margin: [5, 150, 40, 0], opt: {remove: 'line, path'}},
				 {direction: 'bottom', margin: [0, 10, 35, 71], opt: {tickValues: 3}}],
	pq: {direction: 'bottom', margin: [0, 10, 35, 20], opt: {tickValues: 3}},
};
/*
	Mutational Landscape 에 그려지는 Bar 들의 방향, 여백, 위치값등을
	정의해놓은 객체.
 */
config.landscape.bar = {
	pq: {direction: 'right', margin: [5, 10, 41, 30], xaxis: function () {return this.pq.x;}, yaxis: function () {return this.pq.y;}, attr: config.landscape.pq.attr, style: config.landscape.pq.style},
};

config.landscape.stack = {
	patient: {direction: 'top', margin: [5, 0, 10, 0], xaxis: function () {return this.patient.x;}, yaxis: function () {return this.sample.y}, attr: config.landscape.sample.attr, style: config.landscape.sample.style},
	sample: {direction: 'top', margin: [5, 1, 10, 1], xaxis: function () {return this.sample.x;}, yaxis: function () {return this.sample.y;}, attr: config.landscape.sample.attr, style: config.landscape.sample.style},
	gene: {direction: 'left', margin: [5, 10, 41, 70], xaxis: function () {return this.gene.x;}, yaxis: function () {return this.gene.y;}, attr: config.landscape.gene.attr, style: config.landscape.gene.style},
};

config.landscape.heatmap = {
	heatmap: {direction: 'left', margin: [5, 1, 41, 1], opt: {}, xaxis: function () {return this.sample.x;}, yaxis: function () {return this.gene.y;}, attr: config.landscape.heatmap.attr, style: config.landscape.heatmap.style},
	patient: {direction: 'left', margin: [5, 1, 41, 3.5], opt: {}, xaxis: function () {return this.patient.x;}, yaxis: function () {return this.gene.y;}, attr: config.landscape.heatmap.attr, style: config.landscape.heatmap.style},
};

config.landscape.group = {
	group: {direction: 'left', margin: [2, 1, 4, 1], opt: {}, xaxis: function () {return this.sample.x;}, attr: config.landscape.group.attr, style: config.landscape.group.style},
	patient: {direction: 'left', margin: [2, 1, 4, 4], opt: {}, xaxis: function () {return this.patient.x;}, attr: config.landscape.group.attr, style: config.landscape.group.style},
};
// ============================ Mutatinonal Landscape ==================================
// ============================ Mutual Exclusivity ==================================
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
	margin: [30, 80, 0, 0],
	attr: {
		x: function (d, i) {
			var x = this.dr === 'h' ? (this.p * 10 + this.mw) * i : 0;

			return this.isText ? (x + this.p * 2) : x;
		},
		y: function (d, i) { 
			var h = this.height || 15,
					y = this.dr === 'h' ? 0 : ((this.p + this.mh) * i);

			return this.isText ? y + this.mh - this.mh / 2 + this.p / 2 : 
						 d === 'Mutation' ? y + h / 3 : y;
		},
		width: function (d, i) {return this.width || 5;},
		height: function (d, i) { 
			var h = this.height || 15;

			return d === 'Mutation' ? h / 3 : h;
		},
	},
	style: {
		fill: function (d)	{return config.exclusivity.color(d);},
		fontSize: function (d) 	{return '12px';},
		fontFamily: function (d) {return 'Times Roman';},
	},
	text: function (d)	{return d;},
};

config.exclusivity.heatmap = {
	margin: [35, 40, 35, 50],
	attr: {
		x: function (d)	{return this.sx(d.x);},
		y: function (d)	{return d.value === 'Mutation' ? this.sy(d.y) + scale.compatibleBand(this.sy) / 3 : this.sy(d.y);},
		width: function (d)	{return scale.compatibleBand(this.sx);},
		height: function (d)	{return d.value === 'Mutation' ? scale.compatibleBand(this.sy) / 3 : scale.compatibleBand(this.sy);},
	},
	style: {
		fill: function (d)	{return config.exclusivity.color(d.value);},
		stroke: function (d)	{return '#FFFFFF';},
	},
};

config.exclusivity.division = {
	margin: [11, 40, 0, 48],
	dashed: '4, 5',
	attr: {
		x: function (d) {return this.sx ? this.sx(d.value) : 0;},
		y: function (d) {return this.sy ? this.sy(d.value) : 0;},
		width: function (d) {return this.direction === 'h' ? d.size : this.w;},
		height: function (d) {return this.direction !== 'h' ? d.size : this.h;},
	},
	style: {
		fill: function (d, i) {return d.color;},
		stroke: function (d, i)	{return '#FFFFFF';},
	}
};
// ============================ Mutual Exclusivity ==================================
// ============================ Variants ==================================
config.variants.legend = {
	margin: [20, 20, 0, 0],
	attr: {
		x: function (d, i) { 
			var x = this.dr === 'h' ? (this.p * 10 + this.mw) * i : 
							this.isText ? this.p : 0;

			return this.isText ? (x + this.p * 2) : x;
		},
		y: function (d, i) { 
			var h = this.height || 5;

			return this.isText ? this.mh * i + (h * 0.7) : this.mh * i;
		},
		r: function (d) {return 5;},
	},
	style: {
		fontSize: function (d) {return '12px'},
		fill: function (d) {return config.landscape.color(d);},
	},
	text: function (d) {return d;},
};
/*
	Needle plot 의 원의 크기를 정하는 함수.
	값이 지름이 된다는 가정하에 크기를 구한다.
 */
function needleRadius (c)	{
	return (Math.sqrt(c) * 3) / 1.25;
};

config.variants.needle = {
	margin: [20, 30, 100, 60],
	attr: {
		x: function (d, i)	{return this.sx(d.x);},
		y: function (d, i)	{return this.sy(d.y);},
		r: function (d, i)	{return d.value ? needleRadius(d.value) : this.radius;},
	},
	style: {
		fill: function (d)	{ return d.info ? config.landscape.color(d.info[0].type) : false;},
		stroke: function (d)	{return '#FFFFFF';},
	},
};

config.variants.needleGraph = {
	margin: [0, 30, 80, 60],
	attr: {
		x: function (d, i)	{return this.isText ? this.sx(d.x) + 5 : this.sx(d.x);},
		y: function (d, i)	{return this.isText ? this.sh / 2 : 0;},
		width: function (d, i)	{return this.sx(d.width);},
		height: function (d, i)	{return this.sh;},
	},
	style: {
		fill: function (d)	{return d.color;},
		stroke: function (d)	{return '#FFFFFF';},
	},
	text: function (d) {return d.info.identifier;}
};

config.variants.axis = {
	left: {margin: [20, 60, 100, 0]},
	top: {margin: [2, 30, 0, 60]},
};

config.variants.navi = {
	margin: [0, 30, 5, 60],
	style: {
		fill: function (d) {
			var c = d.info ? 
							d3.rgb(config.landscape.color(d.info[0].type)) : false;

			this.g.selectAll('path').style('stroke', 'rgba(0, 0, 0, 0.1)');
			
			return c ? (c.opacity = 0.3, c) : false;
		},
	}
};

config.variants.patient = {
	needle: {
		margin: [0, 30, 48, 60],
		attr: {
			points: function (d, i)	{
				var x = this.s(d.position);
				
				return x + ',' + this.len / 2.5 + 
				' ' + (x - this.len) + ',' + this.len * 2 + 
				' ' + (x + this.len) + ',' + this.len * 2 + 
				' ' + x + ',' + this.len / 2.5;
			},
		},
		style: {
			fill: function (d, i)	{return config.landscape.color(d.type);},
			stroke: function (d, i)	{
				var c = d3.rgb(config.landscape.color(d.type));
				
				return c.opacity = 0.3, c;
			},
		},
	},
	legend: {
		margin: [0, 0, 0, 0],
		attr: {
			points: function (d, i)	{
				// 기존에 그려진 type legend 의 위치를 알아낸 뒤,
				// 그 아래에 위치하기 위해서 getBoundingClientRect 함수
				// 를 사용하였다.
				var l = document.querySelector('#variants_legend_chart').firstChild,
						bcr = l.getBoundingClientRect(),
						x = bcr.right - bcr.left + bcr.width;

				return x + ',' + (bcr.bottom - bcr.width) + 
				 ' ' + (x - bcr.width / 2) + ',' + bcr.bottom + 
				 ' ' + (x + bcr.width / 2) + ',' + bcr.bottom + 
				 ' ' + x + ',' + (bcr.bottom - bcr.width);
			},
			x: function (d, i)	{
				var l = document.querySelector('#variants_legend_chart').firstChild,
						bcr = l.getBoundingClientRect();

				return bcr.right - bcr.left + (bcr.width * 2) + this.p;
			},
			y: function (d, i)	{
				var l = document.querySelector('#variants_legend_chart').firstChild;

				return l.getBoundingClientRect().bottom;
			},
		},
		style: {
			fill: function (d, i)	{return config.landscape.color(d.type);},
			stroke: function (d, i)	{
				var c = d3.rgb(config.landscape.color(d.type));
				
				return c.opacity = 0.3, c;
			},
			fontSize: function (d) {return '12px';},
			strokeWidth: function (d) {return '3px';},
		},
		text: function (d) { return 'Patients'; }
	},
};
// ============================ Variants ==================================
var divisionLine = (function (divisionLine)	{
	'use strict';

	var model = {};
	/*
		도형이 색칠될 길이를 구해주는 함수.
	 */
	function setShapeSize ()	{
		return {
			first: model[model.sw](model.point)
					 - model[model.sw](model.a[0]),
			last: model[model.sw](model.a[model.a.length - 1])
				  - model[model.sw](model.point),
		};
	};
	/*
		문자열의 높이를 설정해주는 함수.
	 */
	function setTextHeight (h, t)	{
		var b = 1,
				h = h / 3;

		while (draw.getTextHeight(b + 'px').height < h)	{
			b += 1;
		}

		return b + 'px';
	};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.m = size.setMargin(o.margin);
		model.s = draw.size(model.e);
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.direction = o.direction || 'h';
		model.point = o.point || 0;
		model.a = o.axis;
		model.sw = 's' + (model.direction === 'h' ? 'x' : 'y');
		model[model.sw] = scale.get(o.axis, model.direction === 'h' ? 
	 [model.m.left, model.s.w - model.m.right] : 
	 [model.m.top, model.s.h - model.m.bottom]);
		model.g = render.addGroup(model.e, model.t, model.l);
		model.lg = render.addGroup(model.e, model.t, model.l);
		model.h = o.height || 30;
		model.w = o.width || 30;
		model.th = setTextHeight(model.h);

		model.line = (util.d3v4() ? d3.line() : d3.svg.line())
								 .x(function (d) { return d.x; })
								 .y(function (d) { return d.y; });

		var s = setShapeSize();

		render.rect({
			element: model.g.selectAll('#' + model.e.attr('id') + '_div'),
			data: [
				{ value: o.axis[0], color: o.color[0], size: s.first }, 
				{ value: o.point, color: o.color[1], size: s.last }
			],
			attr: {
				id: function (d) { return model.e.attr('id') + '_div'; },
				x: function (d) { 
					return o.attr.x ? o.attr.x.call(model, d) : 0; 
				},
				y: function (d) { 
					return o.attr.y ? o.attr.y.call(model, d) : 0; 
				},
				width: function (d) { 
					return o.attr.width ? o.attr.width.call(model, d) : model.w; 
				},
				height: function (d) { 
					return o.attr.height ? o.attr.height.call(model, d) : model.h; 
				},
				rx: 5,
				ry: 5,
			},
			style: {
				fill: function (d, i) { 
					return o.style.fill ? o.style.fill.call(model, d, i) : '#000000'; 
				},
				stroke: function (d, i) { 
					return o.style.stroke ? o.style.stroke.call(model, d, i) : '#FFFFFF'; 
				},
			},
		});

		render.text({
			element: model.g.selectAll('#' + model.e.attr('id') + '_text'),
			data: [{ text: o.text[0] }, { text: o.text[1] }],
			attr: {
				id: model.e.attr('id') + '_text',
				x: function (d, i) {
					return i === 0 ? 
								 model[model.sw](model.a[0]) + 5 : 
								 model[model.sw](model.a[model.a.length - 1]) - 5;
				},
				y: function (d, i)	{
					return model.h - model.h * 0.25;
				},
			},
			style: {
				fill: '#F1F1F1',
				'text-anchor': function (d, i)	{
					return i === 0 ? 'start' : 'end';
				},
				'alignment-baseline': 'middle',
				// TODO.
				// bar 에 맞는 글자 크기를 설정하여야 한다.
				'font-size': model.th,
				'font-weight': 'bold',
				'text-shadow': '1px 1px rgba(0, 0, 0, 0.5)',
			},
			text: function (d)	{
				return d.text;
			},
		})

		render.line({
			element: model.lg,
			attr: {
				id: function (d) { return model.e.attr('id') + '_line'; },
				d: model.line([
					{ x: model[model.sw](model.point), y: model.h},
					{ x: model[model.sw](model.point), y: model.s.h }
				]),
				'stroke-dasharray': o.dashed || '0',
				'stroke-width': 0.8,
			},
			style: {
				stroke: '#000000',
			},
		})
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
		var canv = document.createElement('canvas'),
				ctx = canv.getContext('2d'),
				width = 0;

		canv.id = 'get-text-width'
		ctx.font = (font || '10px') + 'arial';

		document.body.appendChild(canv);

		width = ctx.measureText(text).width;

		document.body.removeChild(
		document.getElementById('get-text-width'));

		return width;
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

	return eventHandler;
}(eventHandler || {}));
var exclusive = (function ()	{
	'use strict';

	var model = {};
	/*
		Survival 에 사용될 데이터를 나누는 함수.
	 */
	function divideSurvivalData ()	{
		var result = {};

		util.loop(model.data.survival.data[model.nowSet], 
		function (d, i)	{
			if (d)	{
				if (i <= model.data.divisionIdx[model.nowSet].idx)	{
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

		survival({
			element: '#exclusivity_survival',
			margin: [20, 20, 20, 20],
			data: model.data.survival.data[model.nowSet],
			divisionData: divideSurvivalData(),
		});
	};
	/*
		Network 차트를 그리는 함수.
	 */
	function drawNetwork ()	{
		network({
			data: model.data.network[model.nowSet],
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
						data: model.nowSet.split(' '),
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
				data: model.data.heatmap[model.nowSet],
				opt: config.exclusivity.heatmap.opt,
				attr: config.exclusivity.heatmap.attr,
				style: config.exclusivity.heatmap.style,
				margin: config.exclusivity.heatmap.margin,
				xaxis: model.data.axis.heatmap.x[model.nowSet],
				yaxis: model.data.axis.heatmap.y[model.nowSet],
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
				height: 45,
				direction: 'h',
				color: ['#FF6252', '#00AC52'],
				attr: config.exclusivity.division.attr,
				style: config.exclusivity.division.style,
				text: ['Altered group', 'Unaltered group'],
				margin: config.exclusivity.division.margin,
				axis: model.data.axis.heatmap.x[model.nowSet],
				point: '' + model.data.divisionIdx[model.nowSet].idx,
				dashed: config.exclusivity.division.dashed,
			});
		});
	};
	/*
		Legend 차트를 그리는 함수.
	 */
	function drawLegend()	{
		layout.getSVG(model.svg, ['legend'], function (k, v)	{
			legend({
				element: v,
				data: model.data.type[model.nowSet],
				priority: config.exclusivity.priority,
				text: config.exclusivity.legend.text,
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
		// Draw survival.
		drawSurvival();
		// Draw Network.
		drawNetwork();
		// Draw axis.
		drawAxis();
		// Draw HEATMAP.
		drawHeatmap();
		// Draw division bar.
		drawDivisionBar();
		// Draw legend.
		drawLegend();
	};

	function getDataOfPatient ()	{
		util.loop(model.data.mutual.data, function (k, v)	{
			console.log(k, Object.keys(v), model.nowSet)
		});
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
		model.nowSet = model.data.geneset[0].join(' ');
		// For survival data.
		// divideSurvivalData();
		// make select box of geneset.
		// model.nowSet = selectGeneSet.set({
		// 	element: '#exclusivity_select_geneset',
		// 	data: model.data.geneset,
		// 	change: function (e)	{
		// 		model.nowSet = this.value;

		// 		console.log(model.nowSet)
		// 		layout.removeG();
		// 		// even change value it appear another geneset.
		// 		drawExclusivity();
		// 	},
		// });

		selectBox({
			element: '#exclusivity_select_geneset',
			initText: model.nowSet,
			className: 'exclusivity-geneset',
			viewName: 'geneset',
			items: model.data.geneset.map(function (d)	{
				return d.join(' ');
			}),
			click: function (v)	{
				model.nowSet = v.toUpperCase();

				layout.removeG();
				drawExclusivity();
			},
		});
		// Survival 에 그려질 데이터를 가져온다.
		// getDataOfPatient();
		// using init geneset
		drawExclusivity();

		console.log('Exclusivity Model data: ', model);
	};
}());
var expression = (function (expression)	{
	'use strict';

	var model = {};

	function drawSurvival ()	{

	};

	function drawBar ()	{

	};

	function drawFunctionOption ()	{

	};

	function drawColorMapping ()	{

	};

	function drawDivisionBar ()	{

	};

	function drawScatter ()	{

	};

	function drawScatterLegend ()	{

	};

	function drawHeatmap ()	{

	};

	function drawSignatureList ()	{

	};

	function drawColorGradient ()	{

	};

	function drawExpression ()	{

	};

	return function (o)	{
		var e = document.querySelector(o.element || null),
				w = parseFloat(o.width || e.style.width || 1400),
				h = parseFloat(o.height || e.style.height || 700);

		e.style.background = '#F7F7F7';

		model.origin = o.data;
		model.data = preprocessing.expression(o.data);
		model.ids = size.chart.expression(e, w, h);
		model.svg = layout.expression(model.ids, model);

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
	function prepareRemoveDuplication (data)	{
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
		// repaint 할 때, 중복되며 표시되므로 이를 방지하기 위해 초기화를 시켜준다.
		model = { mt: ['cnv', 'var'], v: {}, d: [] };
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.s = draw.size(model.e);
		model.m = size.setMargin(o.margin);
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.g = render.addGroup(model.e, model.t, model.l);
		model.sx = scale.get(o.xaxis, 
							[model.m.left, (o.width || model.s.w) - model.m.right]);
		model.sy = scale.get(o.yaxis, 
							[model.m.top, (o.height || model.s.h) - model.m.bottom]);

		render.rect({
			element: model.g.selectAll('#' + model.e.attr('id') + '_rect'),
			data: o.dup ? (prepareRemoveDuplication(o.data), model.d) : o.data,
			attr: {
				id: function (d) { return model.e.attr('id') + '_rect'; },
				x: function (d) { return o.attr.x.call(model, d); },
				y: function (d) { return o.attr.y.call(model, d); },
				width: function (d) { return o.attr.width.call(model, d); },
				height: function (d) { return o.attr.height.call(model, d); },
			},
			style: {
				fill: function (d) { return o.style.fill(d); },
				stroke: function (d) { return o.style.stroke(d); },
			},
		});

		return model;
	};
}(heatmap||{}));
var landscape = (function (landscape)	{
	'use strict';

	var model = {
		div: {},
		init: {
			axis: {x: [], y: []},
			width: 0,
			height: 0,
		},
		now: {
			sort: {
				mutation: null,
				sample: null,
				value: null,	
			},
			axis: {x: [], y: []},
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
		x, y 축을 그려주는 함수.
	 */
	function drawAxis ()	{
		layout.getSVG(model.svg, 
			['axis_sample', 'gene', 'pq', 'axis_group_'], 
			function (k, v)	{
				getAxisConfig(k, function (c, d)	{
				c = util.varType(c) !== 'Array' ? [c] : c;

				util.loop(c, function (dd, i)	{
					axis.element(v)[dd.direction]({
						margin: dd.margin,
						data: axisForGroup(v.attr('id'), 
									dd.direction === 'top' || 
									dd.direction === 'bottom' ? d.x : d.y),
						opt: dd.opt,
					});
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
					margin: c.margin,
					data: dataForGroup(k, d),
					width: k.indexOf('patient') < 0 ? 
					(model.now.width || model.init.width) : null,
					xaxis: c.xaxis.call(model.data.axis),
					yaxis: model.data.axis.group.y.filter(function (dd, ii)	{
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
				// Initialize 버튼을 클릭하였을 때.
				// 초기화면으로 되돌려 준다.
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
		selectBox({
			element: '#landscape_option',
			margin: [0, 8, 0, 0],
			height: '30px',
			className: 'landscape-sort',
			initText: 'Select by sort..',
			viewName: 'sort',
			items: ['Mutation', 'Value', 'Sample'],
			click: function (v)	{
				!model.now.sort[v] ? model.now.sort[v] = 'asc' : 
				 model.now.sort[v] === 'asc' ? 
				 model.now.sort[v] = 'desc' : model.now.sort[v] = 'asc';
				 
				layout.removeG();
				changeAxisScale(
					landscapeSort[model.now.sort[v]](v, model.data));
				drawLandScape(model.data, model.now.width);
			},
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
	};

	return function (o)	{
		console.log('Given Landscape data: ', o);
		var e = document.querySelector(o.element || null),
				w = parseFloat(o.width || e.style.width || 1400),
				h = parseFloat(o.height || e.style.height || 700);
		// Origin data from server.
		model.origin = o.data;
		// preprocess data for landscape and call drawLandScape.
		model.data = preprocessing.landscape(o.data);
		// 초기 x, y 축 값을 저장해 놓는다. 이는 나중에 초기화 버튼을
		// 눌렀을때 초기화면으로 돌아가기 위함이다.
		model.init.axis.x = 
		new Array().concat(model.data.axis.heatmap.x);
		model.init.axis.y = 
		new Array().concat(model.data.axis.gene.y);
		// Make Landscape layout and return div ids.
		model.ids = size.chart.landscape(e, w, h);
		// 처음에 가로 길이를 정해준다.
		initSize();
		// Write Title.
		title();
		// Draw Scale.
		drawScale();
		// Draw Sorting label.
		drawSort();
		// 그룹 개수에 따라 div 를 만들어 준다 (높이는 일정한 간격).
		groupFrame(model.data.axis.group.y);
		// Make svg to parent div and object data.
		model.svg = layout.landscape(model.ids, model);
		// to exclusive.
		model.exclusive.init = landscapeSort.exclusive(
			model.data.heatmap, model.data.gene);
		// Set init exclusive.
		changeAxisScale(model.exclusive.init);
		// Mutational Landscape 를 그려주는 함수.
		drawLandScape(model.data, model.init.width);

		console.log('Landscape Model data: ', model);
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

		model.status = model.status < model.default ? model.default : 
									 model.status > 200 ? 200 : model.status;

		input.value = model.status + ' %';

		model.nowValue = this.id === 'initialize' ? 
		model.defaultValue : this.id === 'upscale' ? 
		model.nowValue + (sign * chNum) : 
		model.nowValue + (sign * chNum); 
		// 현재 값이 기본값보다 작으면 기본값으로,
		// 현재 값이 기본값의 한계치인 2배 값보다 높으면 기본값의 한계치로 대치한다.
		model.nowValue = model.defaultValue > model.nowValue ? 
		model.defaultValue : model.defaultValue * 2 < model.nowValue ? 
		model.defaultValue * 2 : model.nowValue;

		model.change ? model.change(this.id, model.nowValue) : false;
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
			ip.value = (model.value || model.default) + ' ' + model.unit;

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
			model.width = parseFloat(opts.width || model.e.style.width || 140);
			model.height = parseFloat(opts.height || model.e.style.height || 105);
			model.change = opts.change || null;
			model.defaultValue = opts.defaultValue;
			model.nowValue = model.defaultValue;
			model.e.appendChild(div);

			opts.btn = opts.btn.length ? opts.btn : [opts.btn];
			opts.input = opts.input.length ? opts.input : [opts.input];
				
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
			case 'mutation': return data.stack.gene; break;
			case 'sample': return data.stack.sample; break;
			case 'value': return data.pq; break;
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
			case 'mutation': return alignByMutation(sort, data); break;
			case 'sample': return alignBySample(sort, data); break;
			case 'value': return alignByPQvalue(sort, data); break;
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
	landscapeSort.byGene = function ()	{

	};
	/*
		Group 의 속성 priority 순서로 정렬하는 함수.
	 */
	landscapeSort.byGroup = function ()	{

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
		사용자가 전달한 id set (i) 에 맞는 svg 들을 
		콜백함수로 반환하는 함수.
	 */
	layout.getSVG = function (s, i, cb)	{
		util.loop(s, function (k, v)	{
			util.loop(i, function (d, j)	{
				if (k.indexOf(d) > -1)	{
					return cb(k, v);
				}
			});
		});
	};
	/*
		'g-tag' 클래스를 가진 g tag 를 모두 지워주는 함수.
	 */
	layout.removeG = function ()	{
		d3.selectAll('svg .g-tag').remove();
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
		return create(['title'], 'expression', ids);
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
		model.d = o.data.sort(function (a, b)	{
			return o.priority(a) > o.priority(b) ? 1 : -1;
		});
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.m = size.setMargin(o.margin);
		model.w = model.e.attr('width'),
		model.h = model.e.attr('height'),
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.p = o.padding || 5;
		model.sw = 
		model.sg = render.addGroup(model.e, model.t, model.l);
		model.tg = render.addGroup(model.e, model.t, model.l);		
		model.mw = getMostWidthOfText(model.d, '10px Arial');
		model.mh = draw.getTextHeight('10px Arial').height;
		model.dr = (model.w - model.m.left - model.m.right)
						 > (model.h - model.m.top - model.m.bottom) ? 'h' : 'v';

		var id = model.e.attr('id');

		if (o.attr.r)	{
			render.circle({
				element: model.sg.selectAll('#' + id + '_circle'),
				data: model.d,
				attr: {
					id: function (d) { return id + '_circle'; },
					cx: function (d, i)	{
						return o.attr.x ? o.attr.x.call(model, d, i) : 0;
					},
					cy: function (d, i)	{
						return o.attr.y ? o.attr.y.call(model, d, i) : 0;
					},
					r: function (d, i)	{
						return o.attr.r ? o.attr.r.call(model, d, i) : 0;
					},
				}, 
				style: {
					fill: function (d)	{
						return o.style.fill ? o.style.fill(d) : '#000000';
					},
					stroke: function (d)	{
						return o.style.stroke ? o.style.stroke(d) : false;
					},
				},
			})
		} else if (o.attr.points)	{
			render.triangle({
				element: model.sg.selectAll('#' + id + '_triangle'),
				data: model.d,
				attr: {
					id: function (d) { return id + '_triangle'; },
					points: function (d, i) { 
						return o.attr.points ? o.attr.points.call(model, d, i) : 
									 [0, 0];
					},
				},
				style: {
					fill: function (d)	{
						return o.style.fill ? o.style.fill(d) : '#000000';
					},
					stroke: function (d)	{
						return o.style.stroke ? o.style.stroke(d) : false;
					},
					'stroke-width': function (d)	{
						return o.style.strokeWidth ? o.style.strokeWidth(d) : '1px';
					},
				},
			});
		} else {
			render.rect({	
				element: model.sg.selectAll('#' + id + '_rect'),
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
					stroke: function (d) { 
						return o.style.stroke ? o.style.stroke(d) : false; 
					},
				},
			});
		}

		render.text({
			element: model.tg.selectAll('#' + model.e.attr('id') + '_text'),
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
					return o.style.alignmentBaseline ? o.style.alignmentBaseline : 'middel';
				}
			},
			text: function (d, i)	{ 
				return o.text(d, i, model) || ('legend' + i); 
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
			needleGraph: needleGraph,
			needleNavi: needleNavi,
			network: network,
			heatmap: heatmap,
			survival: survival,
		},
		tools: {
			selectBox: selectBox,
			divisionLine: divisionLine,
			selectGeneSet: selectGeneSet,
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
		model.s = draw.size(model.e);
		model.m = size.setMargin(o.margin);
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.g = render.addGroup(model.e, model.m.top, model.m.left);
		model.xag = render.addGroup(model.e, model.m.top, model.m.left);
		model.xxg = render.addGroup(model.e, model.m.top, model.m.left);
		model.radius = o.radius || 5;
		model.sx = scale.get(o.xaxis, [model.m.left, model.s.w - model.m.right]);
		model.sy = scale.get(o.yaxis, [model.s.h - model.m.bottom, model.m.top]);
		model.line = (util.d3v4() ? d3.line() : d3.svg.line())
								 .x(function (d) { return model.sx(d.x); })
								 .y(function (d) { return model.sy(d.y); });

		util.loop(o.lineData, function (d, i)	{
			render.line({
				element: model.g,
				attr: {
					id: function (d) { return model.e.attr('id') + '_line'; },
					d: model.line(d.value),
				},
				style: {
					stroke: '#333333',
				}
			});
		});

		render.circle({
			element: model.g.selectAll('#' + model.e.attr('id') + '_circle'),
			data: o.circleData,
			attr: {
				id: function (d) { return model.e.attr('id') + '_circle'; },
				cx: function (d, i)	{ 
					return o.attr.x ? o.attr.x.call(model, d, i) : 0; 
				},
				cy: function (d, i)	{ 
					return o.attr.y ? o.attr.y.call(model, d, i) : 0; 
				},
				r: function (d, i)	{ 
					return o.attr.r ? o.attr.r.call(model, d, i) : model.radius; 
				},
			},
			style: {
				fill: function (d, i) { 
					return o.style.fill ? o.style.fill.call(model, d, i) : '#000000';
				},
				stroke: function (d, i)	{
					return o.style.stroke ? o.style.stroke.call(model, d, i) : '#FFFFFF';
				},
			}
		});
	};
}(needle||{}));
var needleGraph = (function (needleGraph)	{
	'use strict';

	var model = {};
	/*
		Graph 안에 들어갈 글자의 크기를 정해주는 함수.
	 */
	function setFontSize ()	{
		var b = 1;

		while (draw.getTextHeight(b + 'px').height < 
					 model.sh / 2)	{
			b += 1;
		}

		return b + 'px';
	};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.s = draw.size(model.e);
		model.m = size.setMargin(o.margin);
		model.t = model.s.h - model.m.bottom;
		model.l = model.m.left || 0;
		model.g = render.addGroup(model.e, model.t, model.l);
		model.sx = scale.get(o.xaxis, [model.m.left, model.s.w - model.m.right]);
		model.sy = scale.get(o.yaxis, [model.s.h - model.m.bottom, model.m.top]);
		model.sh = Math.abs(model.sy(1) - model.sy(0)) / 2;
		model.mfh = setFontSize();

		render.rect({
			element: model.g.selectAll('#' + model.e.attr('id') + '_base'),
			data: [''],
			attr: {
				id: model.e.attr('id') + '_base',
				x: model.sx(util.minmax(o.xaxis).min) + 5,
				y: model.sh * 0.1,
				width: model.s.w - model.m.right - model.m.left - 5,
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
			element: model.g.selectAll('#' + model.e.attr('id') + '_rect'),
			data: o.data,
			attr: {
				id: function (d) { return model.e.attr('id') + '_rect'; },
				x: function (d, i) { 
					return o.attr.x ? o.attr.x.call(model, d, i) : 0;
				},
				y: function (d, i) { 
					return o.attr.y ? o.attr.y.call(model, d, i) : 0;
				},
				width: function (d, i) { 
					return o.attr.width ? o.attr.width.call(model, d, i) : 0;
				},
				height: function (d, i) { 
					return o.attr.height ? o.attr.height.call(model, d, i) : 0;
				},
				rx: 3,
				ry: 3,
			},
			style: {
				fill: function (d, i)	{
					return o.style.fill ? o.style.fill.call(model, d, i) : '#000000';
				},
				stroke: function (d, i)	{
					return o.style.stroke ? o.style.stroke.call(model, d, i) : '#FFFFFF';
				},
			}
		});

		render.text({
			element: model.g.selectAll('#' + model.e.attr('id') + '_text'),
			data: o.data,
			attr: {
				id: function (d) {
					return model.isText = true, model.e.attr('id') + '_text';
				},
				x: function (d, i)	{
					return o.attr.x ? o.attr.x.call(model, d, i) : 0;
				},
				y: function (d, i) { 
					return o.attr.y ? o.attr.y.call(model, d, i) : 0;
				},
			},
			style: {
				'fill': '#FFFFFF',
				'font-size': model.mfh,
				'alignment-baseline': 'middle',
			},
			text: function (d, i) {
				return o.text ? o.text.call(model, d, i) : 0;
			},
		})
	};
}(needleGraph||{}));
var needleNavi = (function (needleNavi)	{
	'use strict';

	var model = {
		start: 0,
		end: 0,
	};
	/*
		Navigator 를 조절할 양쪽의 조절 버튼을 만드는
		함수.
	 */
	function makeControlRect (r)	{
		util.loop(r, function (d, i)	{
			render.rect({
				element: model.g.selectAll('#' + model.e.attr('id') + '_' + d),
				data: [d],
				attr: {
					id: function (d) { return model.e.attr('id') + '_' + d },
					x: d === 'end' ? model.end + model.m.left - 5 : model.start - 5,
					y: model.s.h * 0.25,
					width: 10,
					height: model.s.h * 0.4,
					rx: 5,
					rx: 5,
				},
				style: {
					fill: '#A8A8A8',
					stroke: '#EAECED',
					'stroke-width': '2px',
					cursor: 'move',
				}
			});
		});
	};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.s = draw.size(model.e);
		model.m = size.setMargin(o.margin);
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.g = render.addGroup(model.e, model.m.top, model.m.left);
		model.sx = scale.get(o.xaxis, [model.m.left, model.s.w - model.m.right]);
		model.sy = scale.get(o.yaxis, [model.s.h - model.m.bottom, model.m.top]);

		model.start = model.sx(util.minmax(o.xaxis).min);
		model.end = model.s.w - model.m.right - model.m.left;

		needle({
			element: model.e,
			lineData: o.data.needle,
			circleData: o.data.fullNeedle,
			attr: config.variants.needle.attr,
			style: o.style,
			margin: [5, 30, 10, 60],
			xaxis: o.xaxis,
			yaxis: o.yaxis,
		});

		render.rect({
			element: model.g.selectAll('#' + model.e.attr('id') + '_navi'),
			data: [''],
			attr: {
				id: function (d)	{ return model.e.attr('id') + 'navi'; },
				x: model.start,
				y: 0,
				width: model.end,
				height: model.s.h - model.m.bottom,
				rx: 3,
				ry: 3,
			},
			style: {
				fill: 'rgba(255, 225, 50, 0.1)',
				stroke: '#FFDF6D',
			},
		});

		makeControlRect(['start', 'end']);
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
			heatmap: {},
			scatter: {},
			bar: {},
			survival: {

			}
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
				t.push({x: dd[ml.keys.p], y: d.name, value: dd.value});
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
	preprocessing.expression = function (d)	{
		console.log(d);

		console.log('Preprocessing of Expression: ', exp);
		return exp;
	};
	// ============== Expression =================

	return preprocessing;
}(preprocessing||{}));
var render = (function (render)	{
	'use strict';

	render.createSVG = function (id, width, height)	{
		var id = id.indexOf('#') < 0 ? '#' + id : id,
				dom = document.querySelector(id);

		// if (!d3.select('#' + id.replace('#', '') + '_chart').empty())	{
			// TODO.
			// 많은 수정이 필요하다.
			// d3.select('#' + id.replace('#', '') + '_chart').remove();
			// return d3.select('#' + id.replace('#', '') + '_chart');
		// } 
		return d3.select(id)
					.append('svg')
					.attr('id', id.replace('#', '') + '_chart')
					.attr('width', (width || parseFloat(dom.style.width)) + 1)
					.attr('height', (height || parseFloat(dom.style.height)));
	};

	render.addGroup = function (svg, top, left)	{
		svg = util.d3v4() ? svg : svg[0][0];
		svg = util.varType(svg) === 'Array' || 
					util.varType(svg) === 'Object' ? svg : d3.select(svg);
		
		return svg.append('g')
					 .attr('class', svg.attr('id') + ' g-tag')
					 .attr('transform', 
								 'translate(' + left + ', ' + top + ')');			
	};

	function setAttributes (svgElement, attrs)	{
		for (var attr in attrs)	{
			svgElement.attr(attr, attrs[attr]);
		}
	};

	function setStyles (svgElement, styles)	{
		for (var style in styles)	{
			svgElement.style(style, styles[style]);
		}
	};

	function setText (svgElement, text)	{
		svgElement.text(text);
	};

	function defsShape (target)	{
		var t = this.element.data(this.data).enter().append(target);

		this.text ? setText(t, this.text) : false;

		setAttributes(t, this.attr);
		setStyles(t, this.style);
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
		Draw Patient.
	 */
	render.triangle = function (defs)	{
		defsShape.call(defs, 'polygon');
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
	 It is a function that make a domain data that is available for scale of d3's function and
	 calculate data length. 
	 */
	function domainData (type, data)	{
		var result = [];

		if (typeof data[0] === 'number' && typeof data[1] === 'number')	{
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
			return model.data.push(data), model.len.push(data.length), data;
		}
	};
	/**
	 It is a function that generate scale about ordinal. 
	 currently it is only use d3js but later it should changes to native code.
	 */
	scale.ordinal = function (domain, range)	{
		var dd = domainData('ordinal', domain);

		return !d3.scaleBand ? 
						d3.scale.ordinal().domain(dd).rangeBands(range) : 
						d3.scaleBand().domain(dd).range(range);
	}
	/**
	 It is a function that generate scale about linear. 
	 currently it is only use d3js but later it should changes to native code.
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

	return scale;
}(scale||{}));
var selectBox = (function (selectBox)	{
	'use strict';

	var model = {};
	/*
		Select Box 가 그려질 Frame 을 만드는 함수.
	 */
	function makeSBFrame (className)	{
		var div = document.createElement('div');

		div.className = (className + ' drop-menu');
		div.style.width = (model.w - model.m.left * 2) + 'px';
		div.style.marginLeft = model.m.left + 'px';
		div.style.height = model.h;
		div.style.fontSize = '14px';

		return div;
	};
	/*
		처음에 표기될 문자열과 화살표를 만드는 함수.
	 */
	function initText (className, text)	{
		var div = document.createElement('div'),
				spn = document.createElement('span'),
				itg = document.createElement('i');

		div.className = (className || '') + ' select';
		spn.innerHTML = text || 'Select ...';
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
		console.log(list)
		util.loop(list, function (d)	{
			var lit = document.createElement('li');

			lit.id = d.toLowerCase();
			lit.innerHTML = d;

			ult.appendChild(lit);
		});	

		return ult;
	};
	/*
		Slide 동작 및 기타 동작을 실행해주는 함수.
	 */
	function execution (callback)	{
		$('.drop-menu').click(function () {
      $(this).attr('tabindex', 1).focus();
      $(this).toggleClass('active');
      $(this).find('.dropeddown').slideToggle(300);
    });
    $('.drop-menu').focusout(function () {
      $(this).removeClass('active');
      $(this).find('.dropeddown').slideUp(300);
    });
    $('.drop-menu .dropeddown li').click(function () {
      $(this).parents('.drop-menu')
      			 .find('span').text($(this).text());
      $(this).parents('.drop-menu')
      			 .find('input').attr('value', $(this).attr('id'));

      callback.call(this, $(this).text().toLowerCase());
    });
	};

	return function (o)	{
		model.e = document.querySelector(o.element);
		model.m = size.setMargin(o.margin || [0, 0, 0, 0]);
		model.w = o.width || parseFloat(model.e.style.width);
		model.h = o.height || parseFloat(model.e.style.height);
		
		var f = makeSBFrame(o.className),
				i = initText(o.className, o.initText),
				v = inputView(o.viewName || 'Select ...'),
				l = addItems(o.items);

		f.appendChild(i);
		f.appendChild(v);
		f.appendChild(l);
		model.e.appendChild(f);

		execution(o.click);
	};

}(selectBox||{}));
var selectGeneSet = (function (selectGeneSet)	{
	'use strict';

	var model = {};

	function makeLabel ()	{
		model.l = document.createElement('label');
	};
	/*
		select box 를 만드는 함수.
	 */
	function makeSelect (e)	{
		model.s = document.createElement('select');
		model.s.id = e.replace('#', '') + '_view';
		model.l.appendChild(model.s);
	};
	/*
		option 을 추가하는 함수.
	 */
	function addOption (o)	{
		util.loop(o, function (d, i)	{
			var o = document.createElement('option'),
					g = d.join(' ');

			o.text = g;
			o.value = g;

			model.s.options.add(o);
		});
	};
	/*
		Geneset 에서 문자열이 가장 킨 텍스트를 
		반환한다.
	 */
	function mostLargeText (t)	{
		var l = '';

		util.loop(t, function (d, i)	{
			var r = d.join(' ');
			
			l = r.length > l.length ? r : l;
		});

		return l;
	};
	/*
		세로 길이에 맞는 텍스트길이 하지만
		가로길이가 칸을 벗어나서는 안된다.
	 */
	function adjustText (t, w, h)	{
		var b = 1,
				std = mostLargeText(t);

		while (draw.getTextHeight(b + 'px').height < h / 4.8)	{
			b += 1;
		}

		model.view.style.fontSize = b + 'px';
	};
	/*
		Geneset select box 의 스타일 설정을 조절해주는
		함수.
	 */
	function adjustStyle (t)	{
		model.area = document.querySelector(
			'#exclusivity_select_geneset');
		model.view = document.querySelector(
			'#exclusivity_select_geneset_view');
		model.label = document.querySelector(
			'#exclusivity_select_geneset label');
		var w = parseFloat(model.area.style.width),
				h = parseFloat(model.area.style.height);

		model.label.style.width = w  * 0.8 + 'px';
		model.view.style.width = w * 0.8 + 'px';
		model.label.style.padding = w * 0.05 + 'px';
		model.label.style.marginTop = w * 0.03 + 'px';
		model.label.style.marginLeft = w * 0.03 + 'px';

		adjustText(t, w, h);
	};	

	selectGeneSet.set = function (o)	{
		var e = document.querySelector(o.element);

		makeLabel();
		makeSelect(o.element);
		addOption(o.data);
		// register change event to select option.
		model.s.onchange = o.change || null;

		e.appendChild(model.l);

		adjustStyle(o.data);

		return model.s.value;
	};

	return selectGeneSet;
}(selectGeneSet||{}));
var size = (function (size)	{
	'use strict';

	var model = { ids: [] }

	size.chart = {};
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
			// Layout 2.
			exclusivity_select_geneset: {w: w * 0.25, h: h * 0.1},
			exclusivity_upper_empty: {w: w * 0.34, h: h * 0.2},
			exclusivity_survival: {w: w * 0.4, h: h},
			exclusivity_network: {w: w * 0.25, h: h * 0.55},
			exclusivity_heatmap: {w: w * 0.35, h: h * 0.3},
			exclusivity_legend: {w: w * 0.35, h: h * 0.1},

			// Layout 1.
			// exclusivity_survival: {w: (w * 0.3), h: h * 0.85},
			// exclusivity_group: {w: (w * 0.7), h: (h * 0.25)},
			// exclusivity_select_geneset: {w: (w * 0.7) * 0.3, h: (h * 0.1)},
			// exclusivity_heatmap: {w: (w * 0.7) * 0.7, h: (h * 0.5)},
			// exclusivity_network: {w: (w * 0.7) * 0.3, h: (h * 0.5)},
			// exclusivity_legend: {w: (w * 0.7) * 0.7, h: (h * 0.1)},
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
			variants_legend: {w: w * 0.15, h: h * 0.85},
			variants_navi: {w: w * 0.85, h: h * 0.1},
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
			expression_bar: {w: w * 0.4, h: h * 0.4},
			expression_function: {w: w * 0.2, h: h * 0.05},
			expression_color_mapping: {w: w * 0.2, h: h * 0.05},
			expression_bar_legend: {w: w * 0.2, h: h * 0.3},
			expression_scatter: {w: w * 0.4, h: h * 0.3},
			expression_scatter_empty: {w: w * 0.2, h: h * 0.2},
			expression_scatter_legend: {w: w * 0.2, h: h * 0.1},
			expression_heatmap: {w: w * 0.4, h: h * 0.25},
			expression_geneset: {w: w * 0.2, h: h * 0.05},
			expression_color_gradient: {w: w * 0.2, h: h * 0.1},
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
				forPatient(d.participant_id, osm, d.dfs_status, all.dfs);
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
		var pureData = getSurvivalData(o.data).pure;

		makeTab(o.element, ['OS', 'DFS'])

		SurvivalTab.init(o.divisionData, pureData);
	};
}(survival || {}));
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
					 this.substr(idx + rep.length)
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
		var dr = ['left', 'top'],
				// Y 축의 데이터는 아래에서 위로 향하는 데이터이기 때문에
				// 원본데이터를 복사하여 순서를 뒤집어 주었다.
				yd = new Array().concat(model.data.axis.needle.y);

		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			util.loop(dr, function (d, i)	{
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
	function drawNeedle ()	{
		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			needle({
				element: v,
				lineData: model.data.needle,
				circleData: model.data.fullNeedle,
				attr: config.variants.needle.attr,
				style: config.variants.needle.style,
				margin: config.variants.needle.margin,
				xaxis: model.data.axis.needle.x,
				yaxis: model.data.axis.needle.y,
			});
		});
	};
	/*
		Needle Plot 아래 Graph 를 그려주는 함수.
	 */
	function drawNeedleGraph ()	{
		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			needleGraph({
				element: v,
				data: model.data.graph,
				attr: config.variants.needleGraph.attr,
				style: config.variants.needleGraph.style,
				margin: config.variants.needleGraph.margin,
				text: config.variants.needleGraph.text,
				xaxis: model.data.axis.needle.x,
				yaxis: model.data.axis.needle.y,
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
			});
		});
	};
	/*
		Needle 에 Patient 를 추가하는 함수.
	 */
	function needlePatient (d)	{
		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			var md = {},
			  	cp = config.variants.patient.needle;

			md.m = size.setMargin(cp.margin);
			md.s = draw.size(v);
			md.g = render.addGroup(v, md.s.h - md.m.bottom, md.m.left);
			md.s = scale.get(model.data.axis.needle.x, [
				md.m.left, md.s.w - md.m.right]);
			md.len = 5;

			render.triangle({
				element: md.g.selectAll('#' + v.attr('id') + '_tri'),
				data: d,
				attr: {
					id: function (d, i) { return v.attr('id') + '_tri'; },
					points: function (d, i) { 
						return cp.attr.points ? 
									 cp.attr.points.call(md, d, i) : [0, 0];
					},
				},
				style: {
					fill: function (d, i) { 
						return cp.style.fill ? 
									 cp.style.fill.call(md, d, i) : '#000000';
					},
					stroke: function (d, i)	{
						return cp.style.stroke ? 
									 cp.style.stroke.call(md, d, i) : '#FFFFFF';
					},
					'stroke-width': '3px',
				},
			});
		});
	};
	/*
		Legend 에 patient 를 남기는 함수.
	 */
	function legendPatient (d)	{
		layout.getSVG(model.svg, ['legend'], function (k, v)	{
			var cp = config.variants.patient.legend,
					m = size.setMargin(cp.margin),
					g = render.addGroup(v, m.top, m.left);

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
	function drawPatient ()	{
		needlePatient(model.data.patient);
		legendPatient(model.data.patient);
	};
	/*
		Legend 를 그려주는 함수.
	 */
	function drawLegend ()	{
		layout.getSVG(model.svg, ['legend'], function (k, v)	{
			legend({
				element: v,
				data: model.data.type,
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
	/*
		처음 배경색을 설정해주는 함수.
	 */
	function setBaseEleBackground (e)	{
		e.style.background = '#F7F7F7';
	};

	return function (o)	{
		console.log('Given Variants data: ', o);
		var e = document.querySelector(o.element || null),
				w = parseFloat(o.width || e.style.width || 1400),
				h = parseFloat(o.height || e.style.height || 700);
		// Origin data from server.
		model.origin = o.data;
		// preprocess data for landscape and call drawLandScape.
		model.data = preprocessing.variants(o.data);
		// Make Landscape layout and return div ids.
		model.ids = size.chart.variants(e, w, h);
		// Make svg to parent div and object data.
		model.svg = layout.variants(model.ids, model);

		setBaseEleBackground(e);
		title();
		drawVariants();
	};
}(variants||{}));