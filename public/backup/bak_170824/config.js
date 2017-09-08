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
			var typeStr = '';

			if (d.info.length > 0)	{
				util.loop(d.info, function (t)	{
					typeStr += '</br><b>' + t + '</b>';
				});
			}

			tooltip({
				element: this,
				contents: '<b>Gene mutations</b></br>' + 
									'X: <b>' + d.x + '</b></br>' + 
									'Y: <b>' + d.y + '</b></br>' + 
									'Type: </br><b>' + d.value + '</b>' + 
									typeStr,
									
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
			if (m.isText)	{
				return m.x[i] + m.padding * 2;
			} else {
				var nw = m.shape + (m.padding * 3) + m.mw,
						res = 0, nx = 0;

				m.x[i - 1] ? 
				m.x[i - 1] + nw > m.w ? 
				(nx = m.padding, res = nx) : 
				(nx = m.x[i - 1] + nw, res = nx - nw) :
				(nx = m.padding, res = nx);

				return m.x.push(res), res;
			}
		},
		y: function (d, i, m) { 
			if (m.isText)	{
				var y = config.landscape.case(d) === 'var' ? 
								(m.shape * 2) / 3 : 0;

				return m.y[i] + m.shape - y;
			} else {
				var h = m.shape * 2,	
						y = config.landscape.case(d) === 'var' ? 
								h / 3 : 0;

				return m.x[i - 1] ? 
							 parseInt(m.x[i - 1]) !== 
							 parseInt(m.x[i]) ? 
							(m.y.push(0), 0) : 
							(m.y.push(i * h + m.padding + y), 
												i * h + m.padding + y) : 
							(m.y.push(0), 0);
			}
		},
		width: function (d, i, m) {
			return m.shape / 1.5;
		},
		height: function (d, i, m) { 
			var h = m.shape * 2;

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
		fontSize: function (d, i, m) { 
			return '11px'; 
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
		margin: [0, 10, 35, 90], 
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
		margin: [5, 10, 41, 90], 
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
			if (m.isText)	{
				return m.x[i] + m.padding * 2;
			} else {
				var nw = m.shape + (m.padding * 3) + m.mw,
						res = 0, nx = 0;

				m.x[i - 1] ? 
				m.x[i - 1] + nw > m.w ? 
				(nx = m.padding, res = nx) : 
				(nx = m.x[i - 1] + nw, res = nx) :
				(nx = m.padding, res = nx);

				return m.x.push(res), res;
			}
		},
		y: function (d, i, m) { 
			if (m.isText)	{
				var add = d === 'Mutation' ? m.shape / 3 : 0;

				return m.y[i] + m.shape / 2 + 1 - add;
			} else {
				var add = d === 'Mutation' ? m.shape / 3 : 0;

				return m.x[i - 1] ? 
							 parseInt(m.x[i - 1]) !== 
							 parseInt(m.x[i]) ? 
							(m.y.push(add), add) : 
							(m.y.push(i * m.shape + add), 
												i * m.shape + add) : 
							(m.y.push(add), add);
			}
		},
		width: function (d, i, m) {
			return m.shape / 2;
		},
		height: function (d, i, m) { 
			return d === 'Mutation' ? m.shape / 3 : m.shape;
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
						 draw.getTextWidth(d.text, m.font) - 
						 m.m.left / 2 - m.padding : 
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
						var bcr = this.previousSibling.getBoundingClientRect();
						
						return bcr.width + m.padding * 2;
					} else {
						var b1 = this.previousSibling.getBoundingClientRect(),
								b2 = this.previousSibling
												 .previousSibling.getBoundingClientRect();

						return b2.width + b1.width + 
									 m.padding + draw.getTextWidth('A', m.font);
					}
				}
			},
			y: function (d, i, m)	{
				if (i > 0)	{
					return -draw.getTextHeight('25px').height / 4.5;
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
	margin: [10, 10, 0, 0],
	attr: {
		x: function (d, i, m) { 
			if (m.isText)	{
				return m.x[i] + m.padding * 2;
			} else {
				var nw = m.shape + (m.padding * 3) + m.mw,
						res = 0, nx = 0;

				m.x[i - 1] ? 
				m.x[i - 1] + nw > m.w ? 
				(nx = m.padding, res = nx) : 
				(nx = m.x[i - 1] + nw, res = nx - nw) :
				(nx = m.padding, res = nx);

				return m.x.push(res), res;
			}
		},
		y: function (d, i, m) { 
			if (m.isText)	{
				return m.y[i];
			} else {
				return m.x[i - 1] ? 
							 parseInt(m.x[i - 1]) !== 
							 parseInt(m.x[i]) ? 
							(m.y.push(m.padding), m.padding) : 
							(m.y.push(i * m.mh + m.padding), 
												i * m.mh + m.padding) : 
							(m.y.push(m.padding), m.padding);
			}
		},
		r: function (d, i, m) {
			return m.shape;
		},
	},
	style: {
		fontSize: function (d, i, m) {
			return m.font;
		},
		fill: function (d, i, m) {
			return m.isText ? '#333333' : config.landscape.color(d);
		},
		stroke: function (d, i, m)	{
			return '#333333';
		},
	},
	text: function (d, i, m) {
		return draw.textOverflow(d, m.font, m.mw, 0);
	},
};

config.variants.needle = {
	margin: [10, 30, 70, 60],
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
				return -m.m.left * 2;
			} else if (m.sx(d.x) > m.w - m.m.right)	{
				return m.w + m.m.left * 2;
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
			console.log(this);

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
			console.log(m.sh)
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
			return m.font = draw.getFitTextSize(
				d.info.identifier, 
				config.variants.needleGraph.now.width[d.info.identifier],
				m.sh / 2), m.font;
		},
	},
	on: {
		mouseover: function (d, i, m)	{
			draw.toFront(this.parentNode);

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
			draw.toBack(this.parentNode, 
				'variants_needle_chart_base');

			tooltip('hide');
		},
	},
	text: function (d, i, m) {
		return draw.textOverflow(d.info.identifier, m.font, 
					 config.variants.needleGraph
					 			 .now.width[d.info.identifier], 5);
	},
};
/*
	Axises of variants configuration object.
 */
config.variants.axis = {
	left: { margin: [10, 60, 70, 0] },
	top: { margin: [5, 30, 0, 60] },
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
		margin: [5, 10, 0, 0],
		attr: {
			points: function (d, i, m)	{
				// 기존에 그려진 type legend 의 위치를 알아낸 뒤,
				// 그 아래에 위치하기 위해서 getBoundingClientRect 함수
				// 를 사용하였다.
				return m.padding + ',' + m.m.top + 
				 ' ' + (m.padding - m.shape / 2) + 
				 ',' + (m.m.top * 2.5) +
				 ' ' + (m.padding + m.shape / 2) + 
				 ',' + (m.m.top * 2.5) + 
				 ' ' + m.padding + ',' + m.m.top;
			},
			x: function (d, i, m)	{
				return m.shape / 2 + m.padding * 2;
			},
			y: function (d, i, m)	{
				return m.m.top / 2 + m.mh / 2;
			},
		},
		style: {
			fill: function (d, i, m)	{
				return m.isText ? '#333333' : '#FFFFFF';
			},
			stroke: function (d, i, m)	{
				return '#333333';
			},
			fontSize: function (d, i, m) {
				return m.font;
			},
		},
		text: function (d, i, m) { 
			return d;
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
				return m.isText ? m.m.left + m.padding * 2 : m.p;
			},
			y: function (d, i, m) {
				return m.isText ? 
				(m.mh * i + (m.mh / 4 + 0.5)) + (i * 3) : 
				(m.mh * i) + (i * 3);
			},
			width: function (d, i, m) {
				return m.mh / 2;}
				, 
			height: function (d, i, m) {
				return m.mh / 2;
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
			alignmentBaseline: function (d, i, m)	{
				return 'middle';
			},
			fontSize: function (d, i, m) {
				return '14px';
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
				return m.isText ? m.m.left + m.padding : m.p;
			},
			y: function (d, i, m) {
				return m.isText ? (m.mh * i) + 1: (m.mh * i);
			},
			r: function (d, i, m)	{
				return m.shape;
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
			var bcr = d3.select('.legend').node()
									.getBoundingClientRect();

			return m.data.patient.data === d.text ? 
						 bcr.right - bcr.left : -5;
		},
		y: function (d, m)	{
			var bcr = d3.select('.legend text').node()
									.getBoundingClientRect();

			return d.text.indexOf('Low') > -1 ? 
						 bcr.height / 2 + (bcr.height / 4) : 
						 draw.getTextHeight('14px').height * 0.7;
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