function initialize ()	{
	'use strict';
	// >>> Common.
	var SIZING = { ids: [], chart: {} };
	var SETTING = {
		idx: [],
		dom: null, 
		size: { width: 0, height: 0 },
	};
	var LAYOUT = {
		svg: {
			variants: {},
			landscape: {},
			expression: {},
			exclusivity: {},
		},
	};
	// >>> Preprocess.
	var PREPROCESS = {
		pathway: null,
		variants: {
			needle: { line: [], shape: [] },
			patient: { line: [], shape: [] },
			type: [],
			graph: [],
			axis: {
				needle: {x: [], y: []},
				now: { x: [], y: []},
			},
		},
		landscape: {
			type: {},
			group: { group: [], patient: [] },
			heatmap: [],
			patient: [],
			stack: { gene: {}, sample: {}, patient: {} },
			axis: {
				pq: { x: [], y: [] },
				gene: { x: [], y: [] },
				group: { x: [], y: [] },
				sample: { x: [], y: [] },
				heatmap: { x: [], y: [] },
				patient: { x: [], y: [] },
			},
		},
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
			survival: {},
			bar: [],
			axis: {
				gradient: { x: {}, y: {} },
				heatmap: { x: {}, y: {} },
				scatter: { x: {}, y: {} },
				bar: { x: {}, y: {} },
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
			geneset_all: [],
			axis: {
				heatmap: {x: {}, y: {}},
				division: {x: {}, y: []},
			},
			divisionIdx: {},
		},
	};
	// >>> Tools.
	var LOADING = {};
	// >>> Expression.
	var EXPRESSION = {
		init: {
			function: 'Average',
			signature: null,
			color_mapping: null,
		},
		now: {
			function: null,
			signature: null,
			color_mapping: null,
			osdfs: 'os',
		},
		divide: {},
	};
	// >>> Exclusivity.
	var EXCLUSIVITY = { now : { geneset: null } };
	var COLORGRADIENT = { show: [], data: [] };
	// >>> Variants.
	var VARIANTS = { div: {} };
	var VARIANTSNAVI = { start: 0, end: 0 };
	// >>> Landscape.
	var LANDSCAPE = {
		div: {},
		init: {
			axis: { x: [], y: [] },
			width: 0,
			height: 0,
			geneline: [],
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
			geneline: [],
		},
		exclusive: { init: null },
	};
	var LANDSCAPESORT = { exclusive: [] };
	var LANDSCAPEHEATMAP = {
		mutationType: ['cnv', 'var'], 
		value: {}, 
		duplicate: [],
	};

	var set = {
		layout: LAYOUT,
		sizing: SIZING,
		setting: SETTING,
		preprocess: PREPROCESS,
		loading: LOADING,
		expression: EXPRESSION,
		exclusivity: EXCLUSIVITY,
		colorGradient: COLORGRADIENT,
		variants: VARIANTS,
		variantsNavi: VARIANTSNAVI,
		landscape: LANDSCAPE,
		landscapeSort: LANDSCAPESORT,
		landscapeHeatmap: LANDSCAPEHEATMAP,
	}

	return function (name)	{
		return bio.objects.clone(
					!set[name] ? {} : set[name]);
	};
};