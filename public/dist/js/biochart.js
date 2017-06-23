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
				p = [m.top, m.left],
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
				p = [m.top, s.w - m.right],
				c = scale.get(d.data, [m.top, s.h - m.bottom]),
				g = render.addGroup(model.current, p[0], p[1]);

		return g.call(options(byVersion(c, 'left'), d.opt, d.data)), 
					 isRemove(g, d.opt.remove), g;
	};

	axis.bottom = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = [s.h - m.bottom, m.left],
				c = scale.get(d.data, [m.left, s.w - m.right]),
				g = render.addGroup(model.current, p[0], p[1]);

		return g.call(options(byVersion(c, 'bottom'), d.opt, d.data)), 
					 isRemove(g, d.opt.remove), g;
	};

	axis.right = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = [m.top, m.left],
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
	/*
		Chart 를 그리는데 필요한 data 를 넣어주는 함수.
	 */
	function dataImport (d)	{
		d.m = model.m;
		d.sx = model.sx;
		d.sy = model.sy;
		d.dx = this.xaxis;
		d.dy = this.yaxis;
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
		model.sx = setScale(o.direction, o.xaxis, 'x');
		model.sy = setScale(o.direction, o.yaxis, 'y');
		/*
		 	Bar, Stacked Bar, ... 를 그려주는 렌더링 함수를 호출하는 부분.
		 */
		render.rect({
			element: model.g.selectAll('#' + model.e.attr('id') + '_rect'),
			data: o.data,
			attr: {
				id: function (d) { return dataImport.call(o, d), model.e.attr('id') + '_rect'; },
				x: function (d) { return o.attr.x(d); },
				y: function (d) { return o.attr.y(d); },
				width: function (d) { return o.attr.width(d); },
				height: function (d) { return o.attr.height(d); },
			},
			style: {
				fill: function (d) { return o.style.fill(d); },
				stroke: function (d) { return o.style.stroke(d); },
			},
		});

		return model;
	};
}(bar || {}));
'use strict';

var config = {
	exclusivity: {},
	landscape: {},
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
		x: function (d) {return d.x.indexOf('-') > -1 ? d.sx(d.x) : d.sx(d.x) + 3;},
		y: function (d) {return d.sy(util.minmax(d.dy).max) - d.sy(d.y + d.value) + d.sy(util.minmax(d.dy).min);},
		width: function (d) {return d.x.indexOf('-') > -1 ? scale.compatibleBand(d.sx) : scale.compatibleBand(d.sx) - 7.5},
		height: function (d) {return d.sy(d.value) - d.sy(util.minmax(d.dy).min);},	
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
		x: function (d) {return d.sx(util.minmax(d.dx).max) - d.sx(d.x + d.value);},
		y: function (d) {return d.sy(d.y);},
		width: function (d) {return d.sx(d.value);},
		height: function (d) { return scale.compatibleBand(d.sy); },
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
		x: function (d) { return d.sx(util.minmax(d.dx).min); },
		y: function (d) { return d.sy(d.y); },
		width: function (d) { return d.sx(d.value); },
		height: function (d) { return scale.compatibleBand(d.sy); },
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
	return v === 'B' ? ['A', 'M'] : v === 'E' ? ['D', 'E'] : 
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
					var tw = draw.getTextWidth(d.text, '12px');
					return model.direction === 'h' ?
					       i === 0 ? model.m.left : 
					       model.s.w - model.m.right - model.m.left - tw: 
								 model.w / 2 - tw / 2;
				},
				y: function (d, i)	{
					return model.h - 5;
				},
			},
			style: {
				fill: '#FFFFFF',
				'font-size': '12px',
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
		ctx.font = font || '10px Arial';

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

	function tabInput (id, idx)	{
		var input = document.createElement('input');
				input.id = id;
				input.name = 'tabs';
				input.type = 'radio';
				input.checked = idx === 0 ? true : false;

		return input;
	};

	function tabLabel (id, name)	{
		var label = document.createElement('label');
				label.htmlFor = id;
				label.innerHTML = name;

		return label;
	};

	function tabContent (id, content)	{
		var div = document.createElement('div');
				div.id = id + '_content';

		return div;
	};

	draw.tab = function (target, tabNames, tabIds)	{
		var div = document.querySelector(target);

		if (tabNames.length !== tabIds.length)	{
			throw new Error('탭 제목과 ID 의 길이가 같지 않습니다.');
		}

		for (var i = 0, l = tabNames.length; i < l; i++)	{
			var name = tabNames[i],
					id = tabIds[i];

			div.appendChild(tabInput(id, i));
			div.appendChild(tabLabel(id, name));
		}

		for (var i = 0, l = tabNames.length; i < l; i++)	{
			var area = tabContent(tabIds[i]);

			area.appendChild(tabContent(tabIds[i] + '_chart'));
			area.appendChild(tabContent(tabIds[i] + '_table'))
			div.appendChild(area);
		}
	};

	/*
		svg 의 가로, 세로 길이를 반환해주는 함수.
	 */
	draw.size = function (svg)	{
		svg = util.d3v4() ? svg : svg[0][0];
		svg = util.varType(svg) === 'Array' || 
					util.varType(svg) === 'Object' ? svg : d3.select(svg);

		return {w: svg.attr('width'), h: svg.attr('height')};
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
	// /*
	//  모든 gene 이 na 인 구간과 아닌구간을 나눠주는 함수.
	//  */
	// function toSeparated (datas, genes, left, right)	{
	// 	var data = new Array().concat(datas),
	// 			count = data.length / genes.length,
	// 			result = [];

	// 	for (var i = 0, l = genes.length; i < l; i++)	{
	// 		var g = genes[i];

	// 		result.push({
	// 			key: g,
	// 			// Splice 를 할때에는 반드시 새로운 배열로 concat 하기로 하자. 그렇지 않으면
	// 			// 다른 변수에 복사해놓더라도 원본 배열의 데이터도 같이 Splice 가 된다.
	// 			left: data.splice(0, left + 1),
	// 			right: data.splice(0, count - right),
	// 		});
	// 	}

	// 	return result;
	// };
	// /*
	//  데이터 구간 분할을 위한 지점을 구해주는 함수.
	//  */
	// function setSepData (genes, datas)	{
	// 	var left, right;

	// 	for (var i = 0, l = datas.length; i < l; i++)	{
	// 		var d = datas[i];

	// 		if (d.value !== '.')	{
	// 			left = !left ? d.x : left > d.x ? left : d.x;
	// 		}
	// 	}

	// 	return {
	// 		point: left + 1,
	// 		data: toSeparated(datas, genes, left, left + 1),
	// 	};
	// };

	// function drawMutualExclusivity (opts)	{
	// 	var axis = toHeatmapAxis(opts.heatmap.data),
	// 			sepData = setSepData(axis.y, opts.heatmap.data);
	/*
		Survival 에 사용될 데이터를 나누는 함수.
	 */
	function divideSurvivalData ()	{
		model.data.survival = {};

		util.loop(model.data.heatmap, function (k, v)	{
			var t = new Array().concat(v);

			// console.log(t);

			model.data.survival[k] = {
				altered: t.splice(0, model.data.divisionIdx[k] + 1),
				unaltered: t.splice(0, (v.length - 1)
														 - (model.data.divisionIdx[k] + 1)),
			};
		});
	};
	/*
		Survival 차트를 그리는 함수.
	 */
	function drawSurvival ()	{
		survival({
			element: '#exclusivity_survival',
			margin: [20, 20, 20, 20],
			data: model.origin.survival.data,
			divData: model.data.survival[model.nowSet],
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
				data: model.data.legend[model.nowSet],
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
		// drawSurvival();
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

		model.origin = o.data;
		model.data = preprocessing.exclusivity(o.data);
		model.ids = size.chart.exclusivity(e, w, h);
		model.svg = layout.exclusivity(model.ids, model);
		// For survival data.
		// divideSurvivalData();
		// make select box of geneset.
		model.nowSet = selectGeneSet.set({
			element: '#exclusivity_select_geneset',
			data: model.data.geneset,
			change: function (e)	{
				model.nowSet = this.value;
				layout.removeG();
				// even change value it appear another geneset.
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
'use strict';

var force = (function (force)	{
	force.setConstant = function (cons)	{
		force.constant = cons || 50;

		return model;
	};

	force.getConstant = function ()	{
		return force.constant || 50;
	};

	force.getKvalue = function (width, height)	{
		var constant = force.getConstant();

		return Math.sqrt(width * height) / constant;
	};

	force.aForce = function (k, d)	{
		return (d * d) / k;
	};

	force.rForce = function (k, d)	{
		return (k * k) / d;
	};

	return force;

}(force || {}));
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
		util.loopArr(data, function (d, i)	{
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
		model.e = {};
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
						 (model.nowWidth || model.initWidth) : null,
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
					(model.nowWidth || model.initWidth) : null,
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
					(model.nowWidth || model.initWidth) : null,
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
	function initWidth ()	{
		model.initWidth = 
		draw.width(d3.select('#landscape_heatmap').node()) * 2;
		model.initHeight = 
		draw.height(d3.select('#landscape_heatmap').node());
	};
	/*
		Scale Option 을 그려주는 함수.
	 */
	function drawScale ()	{
		var so = scaleOption.set({
			element: '#landscape_option',
			default: 100,
			defaultValue: model.initWidth,
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
				drawLandScape(model.data, 
				(model.nowWidth = now, model.nowWidth));
			},
		});
	};
	/*
		정렬버튼과 현재 정렬의 상태를 보여주는 UI 를 그려주는 함수.
	 */
	function drawSort ()	{
		sortOption.set({
			element: '#landscape_option',
			subject: ['Mutation', 'Value', 'Sample'],
			itemClick: function (e)	{
				console.log('dd')
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
			v.attr('width', width || model.nowWidth || 
															 model.initWidth);
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
		// // Draw Heatmap.
		// drawHeat();
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
		// Make Landscape layout and return div ids.
		model.ids = size.chart.landscape(e, w, h);
		// 처음에 가로 길이를 정해준다.
		initWidth();
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
		// Mutational Landscape 를 그려주는 함수.
		drawLandScape(model.data, model.initWidth);

		console.log('Landscape Model data: ', model);
		// Scroll event for moving execution.
		eventHandler.onScroll('#landscape_heatmap', function (e)	{
			var s = document.querySelector('#landscape_sample'),
					g = document.querySelector('#landscape_group').children,
					t = this;

			s.scrollLeft = t.scrollLeft;

			util.loop(g, function (d, i)	{
				d.scrollLeft = t.scrollLeft;
			});
		});
	};
}(landscape||{}));
var layout = (function (layout)	{
	'use strict';

	var model = {
		exclusivity: {},
		landscape: {},
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
	layout.exclusivity = function (ids, m)	{
		util.loop(ids, function (d, i)	{
			if (d.indexOf('geneset') < 0 && 
					d.indexOf('survival') < 0 &&
					d.indexOf('network') < 0)	{
				model.exclusivity[d] = render.createSVG(d);
			}
		});

		return model.exclusivity;
	};

	/*
		Id (scale_option, title 제외) 를 조회하며
		svg 태그를 만들어 div 태그에 삽입한다.
	 */
	layout.landscape = function (ids, m)	{
		util.loop(ids, function (d, i)	{
			if (d.indexOf('option') < 0 && 
					d.indexOf('title') < 0)	{
				model.landscape[d] = render.createSVG(d);
			}
		});

		return model.landscape;
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
		
		render.rect({	
			element: model.sg.selectAll('#' + model.e.attr('id') + '_rect'),
			data: model.d,
			attr: {
				id: function (d) { return model.e.attr('id') + '_rect'; },
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
		expression: '',
		landscape: landscape,
		exclusive: exclusive,
		chart: {
			bar: bar,
			legend: legend,
			needle: '',
			graph: '',
			procbar: '',
			network: network,
			heatmap: heatmap,
			survival: survival,
		},
		tools: {
			sortOption: sortOption,
			scaleOption: scaleOption,
			divisionLine: divisionLine,
			selectGeneSet: selectGeneSet,
		},
		util: util,
		size: size,
		scale: scale,
		layout: layout,
		eventHandler: eventHandler,
		preprocessing: preprocessing,
	};
}(window||{}));
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
						height: 100,
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
						height: 15,
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
				'font-size': '12',
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
	};
}());
var preprocessing = (function (preprocessing)	{
	'use strict';
	/*
		차트 별 데이터 및 여러 정보를 포함할 모델 객체.
	 */
	var model = {
		exclusivity: {
			heatmap: {},
			network: {},
			legend: {},
			mutual: {},
			geneset: [],
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
	};
	/*
	 	Object 들의 naming 이 너무 길어서 줄임.
	 */
	var ml = model.landscape,
			el = model.exclusivity,
			cl = config.landscape;
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
 		return el.legend[k.join(' ')] = [];
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

	 			el.geneset.push(t);
 			}
 		});
 	};
 	/*
 		heatmap 의 axis 값을 구해주는 함수.
 	 */
 	function axisForHeatmap ()	{
 		util.loop(el.heatmap, function (k, v)	{
 			console.log(k, v)
 		});
 	};
 	/*
 		Participant ID 를 기준으로 각 Gene 들마다의 데이터를
 		만들어 반환해주는 함수.
 	 */
 	function survival (s)	{
 		var k = el.mutual.keys = 
 						mutualProps(s.gene, s.mutation[0]);
 		el.mutual.data = {};

 		util.loop(s.mutation, function (d, i)	{
 			el.mutual.data[d[k.p]] = 
 			el.mutual.data[d[k.p]] ? 
 			el.mutual.data[d[k.p]] : {};
 			el.mutual.data[d[k.p]][d[k.g]] ? 
 			el.mutual.data[d[k.p]][d[k.g]].push(d[k.t]) : 
 			el.mutual.data[d[k.p]][d[k.g]] = [d[k.t]];
 		});
 	};
 	/*
 		call exclusivity of preprocessing.
 	 */
	preprocessing.exclusivity = function (d)	{
		heatmap(d.heatmap);
		network(d.network); 
		// survival(d.survival.std);

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
	function stack (t, o)	{
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
		ml.stack.gene = stack('gene', ml.stack.gene);
		ml.stack.sample = stack('sample', ml.stack.sample);
		ml.stack.patient = stack('patient', ml.stack.patient);
		// Axis data for chart.
		linearAxis();
		ordinalAxis();

		console.log('Preprocess of Landscape: ', ml);
		// return model.landscape.
		return ml;
	};
	// ============== Mutational Landscape =================

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
var scaleOption = (function (scaleOption)	{
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
	scaleOption.set = function (opts)	{
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

		return scaleOption;
	};
	/*
	 	버튼 클릭 후 값이 변경될 때마다 호출되는 함수.
	 */
	scaleOption.change = function (callback)	{
		return callback(model), scaleOption;
	};

	return scaleOption;
}(scaleOption||{}));
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
		console.log(o);
		console.log(
			draw.getTextWidth('RIT1'),
			draw.getTextWidth('RIT1 '),
			draw.getTextHeight('16px', 'Arial'),
			draw.getTextWidth('RIT1 KRAS EGFR NF1 BRAF'),
			draw.getTextWidth('RIT1 KRAS EGFR NF1 BRAF', '16px Arial'),
			draw.getTextWidth('Unaltered group'),
			draw.getTextWidth('Unaltered')
		);
		util.loop(o, function (d, i)	{
			var o = document.createElement('option'),
					g = d.join(' ');

			o.text = g;
			o.value = g;

			model.s.options.add(o);
		});
	};

	selectGeneSet.set = function (o)	{
		var e = document.querySelector(o.element);

		makeLabel();
		makeSelect(o.element);
		addOption(o.data);
		// register change event to select option.
		model.s.onchange = o.change || null;

		e.appendChild(model.l);

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
			exclusivity_survival: {w: (w * 0.3), h: h * 0.85},
			exclusivity_group: {w: (w * 0.7), h: (h * 0.25)},
			exclusivity_select_geneset: {w: (w * 0.7) * 0.3, h: (h * 0.1)},
			exclusivity_heatmap: {w: (w * 0.7) * 0.7, h: (h * 0.5)},
			exclusivity_network: {w: (w * 0.7) * 0.3, h: (h * 0.5)},
			exclusivity_legend: {w: (w * 0.7) * 0.7, h: (h * 0.1)},
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

	return size;
}(size || {}));
var sortOption = (function (sortOption)	{
	'use strict';

	var model = {};
	/*
		정렬 버튼을 누르면 목록이 보이거나 감추거나
		하는 동작을 정의한 함수.
	 */
	function controlList (e)	{
		model.ul.style.visibility = 
		model.ul.style.visibility === 'hidden' || 
		model.ul.style.visibility === '' ? 'visible' : 'hidden';
	};	
	/*
		정렬 방법을 선택할 버튼을 만드는 함수.
	 */
	function makeButton ()	{
		model.b = document.createElement('button');
		model.s = document.createElement('span');
		model.i = document.createElement('i');

		model.b.id = 'landscape_sort_select';
		model.b.addEventListener('click', controlList);
		model.i.className = 'fa fa-sort-amount-desc';

		model.s.appendChild(model.i);
		model.b.appendChild(model.s);
	};
	/*
		정렬 방법을 표시해줄 태그를 만들어주는 함수.
	 */
	function makeInput () {
		model.ip = document.createElement('input');
		model.ip.id = 'landscape_sort_case_view';
		model.ip.readOnly = true;
		model.ip.tabIndex = -1;
	};
	/*
		목록의 항목 하나를 선택하면
		인자로 넘어온 외부 함수를 호출한다.
	 */
	function clickItem (e)	{
		return model.ul.style.visibility = 'hidden',
					 model.ip.value = this.innerHTML,
					 model.itemClick(e);
	};
	/*
		정렬방법 (Mutation, Value, Sample) 들을 나타낼 
		리스트를 만드는 함수.
	 */
	function makeList (a)	{
		model.ul = document.createElement('ul');

		model.ul.id = 'landscape_sort_list';

		util.loop(a, function (d, i)	{
			var l = document.createElement('li');

			l.appendChild(document.createTextNode(d));
			l.addEventListener('click', clickItem);
			model.ul.appendChild(l);
		});
	};
	/*
		정렬 태그들을 감싸는 DIV 태그를 만드는 함수.
	 */
	function divSort () {
		var d = document.createElement('div');

		return d.id = 'landscape_sort_area', d;
	};

	sortOption.set = function (o)	{
		var d = divSort();

		model.itemClick = o.itemClick;

		d.appendChild((makeInput(), model.ip));
		d.appendChild((makeButton(), model.b));
		d.appendChild((makeList(o.subject), model.ul));

		model.e = document.getElementById(o.element.replace('#', ''));
		model.e.appendChild(d);
	};

	return sortOption;

}(sortOption||{}));
var survival = (function (survival)	{
	'use strict';

	var model = {};

	function toLog (tpm)	{
		return Math.log(tpm + 1) / Math.LN2;
	};

	function getTpmData (data)	{
		var result = {},
				caseList = {};

		function getMedian (list)	{
			return list.length % 2 === 0 ? 
						list.length / 2: (list.length + 1) / 2;
		};

		for (var i = 0, l = data.data.cohort_rna_list.length; i < l; i++)	{
			var c = data.data.cohort_rna_list[i];

			c.tpm = toLog(c.tpm);

			if (!result[c.participant_id])	{
				result[c.participant_id] = { tpm: c.tpm, len: 1 };
			} else {
				result[c.participant_id].tpm += c.tpm;
				result[c.participant_id].len += 1;
			}
		}

		var avgList = toSortAverage(getAvgList(data, result)),
				mid = getMedian(avgList),
				low = avgList.slice(0, mid + 1),
				high = avgList.slice(mid + 1, avgList.length);

		low.forEach(function (l)	{
			caseList[l.participant_id] = 'unaltered';
		});

		high.forEach(function (h)	{
			caseList[h.participant_id] = 'altered';
		});

		return {
			dataList: result,
			caseList: caseList,
		};
	};

	function getAvgList (data, tpmData)	{
		var result = [];

		function getPatientInfo (data, id)	{
			var p = data.data.patient_list;

			for (var i = 0, l = p.length; i < l; i++)	{
				var pat = p[i];

				if (pat.participant_id === id)	{
					return p;
				}
			}
		}

		for (var t in tpmData)	{
			var td = tpmData[t];

			result.push({
				participant_id: t,
				average: td.tpm / td.len,
				info: getPatientInfo(data, t),
			});
		}

		return result;
	}

	function toSortAverage (data)	{
		return (data = data.sort(function (a, b)	{
					return a.average > b.average ? 1 : -1;
				}), data);
	}

	function getSurvivalData (suv, sep)	{
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

		suv.data.patient_list.forEach(function (d)	{
			var osmonth = (d.os_days / 30),
					dfsmonth = (d.dfs_days / 30);

			month.os.push(osmonth);
			month.dfs.push(dfsmonth);

			if (!(osmonth == null || d.os_status == null))	{
				forPatient(d.participant_id, osmonth, d.os_status, pure.os);
			}

			if (!(dfsmonth == null || d.dfs_status == null))	{
				forPatient(d.participant_id, dfsmonth, d.dfs_status, pure.dfs);
			}

			forPatient(d.participant_id, osmonth, d.os_status, all.os);
			forPatient(d.participant_id, osmonth, d.dfs_status, all.dfs);
		});

		return {
			month: month,
			pure: pure,
			all: all,
		};
	};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.s = draw.size(model.e);
		model.m = size.setMargin(o.margin);
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.g = render.addGroup(model.e, model.t, model.l);

		console.log(o);
		// var e = opts.element || null,
		// 		dq = document.querySelector(e),
		// 		w = parseFloat(opts.width || dq.style.width || 360),
		// 		h = parseFloat(opts.height || dq.style.height || 600),
		// 		m = size.setMargin(opts.margin) || { top: 0, left: 0, bottom: 0, right: 0 };

		// var gc = render.createCanvas(e.substring(1, e.length), w, h);

		// model = {};
		// draw.clearCanvas(dq);

		draw.tab('#' + model.e.attr('id'), ['OS', 'DFS'], ['osSurvival', 'dfsSurvival']);

		// var data = getSurvivalData(opts.data, opts.subData),
		// 		tpmData = getTpmData(opts.data);

		// // dq.appendChild(gc.canvas);
		// console.log(tpmData, data);

		// SurvivalTab.init(tpmData.caseList, data.pure);

		// // eventHandler.context(ctx)
		// // 		 .hover(function (obj)	{
		// // 		 	console.log(obj);
		// // 		 });
	}
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

	return util;
}(util||{}));
'use strict';

var variants = (function ()	{

	function render() {

	}

	return function (opts)	{
		var e = opts.element || null,
				dq = document.querySelector(e),
				w = opts.width || dq.style.width || 1200,
				h = opts.height || dq.style.height || 600;

		console.log('Variants', '\nElement: ', e,
			'\nWidth: ', w, '\nHeight: ', h);
	};
}());