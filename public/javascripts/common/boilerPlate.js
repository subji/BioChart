function boilerPlate ()	{
	'use strict';

	var model = {};

	model.variantInfo = {
		// Mutation.
		'Amplification': { color: '#FFBDE0', order: 0},
		'Homozygous_deletion': { color: '#BDE0FF', order: 1},
		'Nonsense_mutation': { color: '#EA3B29', order: 2},
		'Splice_site': { color: '#800080', order: 3},
		'Translation_start_site': { color: '#AAA8AA', order: 4},
		'Missense_mutation': { color: '#3E87C2', order: 5},
		'Start_codon_snp': { color: '#3E87C2', order: 5 },
		'Nonstop_mutation': { color: '#070078', order: 6},
		'Frame_shift_indel': { color: '#F68D3B', order: 7},
		'Stop_codon_indel':{ color:  'F68D3B', order: 7},
		'In_frame_indel': { color: '#F2EE7E', order: 8},
		'Silent': { color: '#5CB755', order: 9},
		'Rna': { color: '#FFDF97', order: 10},
		'Intron': { color: '#A9A9A9', order: 11},
		'5\'utr': { color: '#A9A9A9', order: 11},
		'3\'utr': { color: '#A9A9A9', order: 11},
		'Igr': { color: '#A9A9A9', order: 11},
	};

	model.clinicalInfo = {
		// Group.
		// Vital Status of Group.
		'alive': { color: '#04CDA4', order: 1 },
		'dead': { color: '#C50E36', order: 2 },
		// Gender of Group.
		'female':{ color:  'E0A4E5', order: 1 },
		'male': { color: '#0F67B6', order: 2 },
		// Race of Group.
		'american indian or alaska native': { color: '#38120B', order: 1 },
		'asian': { color: '#CB771F', order: 2 },
		'black or african american': { color: '#302F24', order: 3 },
		'white': { color: '#9CB1CE', order: 4 },
		// Ethnicity of Group.
		'hispanic or latino': { color: '#B8642F', order: 1 },
		'not hispanic or latino': { color: '#55C53E', order: 2 },
		// Histological Type of Group.
		'lung acinar adenocarcinoma': { color: '#716190', order: 1 },
		'lung adenocarcinoma mixed subtype': { color: '#5154DE', order: 2 },
		'lung adenocarcinoma- not otherwise specified (nos)': { color: '#8E9A7E', order: 3 },
		'lung bronchioloalveolar carcinoma mucinous': { color: '#2F91DE', order: 4 },
		'lung bronchioloalveolar carcinoma nonmucinous': { color: '#ED6EBD', order: 5 },
		'lung clear cell adenocarcinoma': { color: '#1C8D7A', order: 6 },
		'lung micropapillary adenocarcinoma': { color: '#B2EE86', order: 7 },
		'lung mucinous adenocarcinoma': { color: '#785E54', order: 8 },
		'lung papillary adenocarcinoma': { color: '#69B4C4', order: 9 },
		'lung signet ring adenocarcinoma': { color: '#C1386E', order: 10 },
		'lung solid pattern predominant adenocarcinoma': { color: '#D7A355', order: 11 },
		'mucinous (colloid) carcinoma': { color: '#243833', order: 12 },
		// Anatomic Neoplasm Subdivision of Group.
		'bronchial': { color: '#F9E3B9', order: 1 },
		'l-lower': { color: '#FBA2A3', order: 2 },
		'l-upper': { color: '#0CA3C7', order: 3 },
		'other (please specify)': { color: '#D3A16C', order: 4 },
		'r-lower': { color: '#388A4E', order: 5 },
		'r-middle': { color: '#D61E43', order: 6 },
		'r-upper': { color: '#B81BCC', order: 7 },
		// Other Dx of Group.
		'no': { color: '#D73A64', order: 1 },
		'yes': { color: '#1990AA', order: 2 },
		'yes, history of prior malignancy': { color: '#3BDB11', order: 3 },
		'yes, history of synchronous/bilateral malignancy': { color: '#803F11', order: 4 },
		// History of Neoadjuvant Treatment of Group.
		'no': { color: '#D73A64', order: 1 },
		'yes': { color: '#1990AA', order: 2 },
		// Radiation Therapy of Group.
		'no': { color: '#D73A64', order: 1 },
		'yes': { color: '#1990AA', order: 2 },
		// Pathologic T of Group.
		't1': { color: '#060CDB', order: 1 },
		't1a': { color: '#696DE9', order: 2 },
		't1b': { color: '#CDCEF7', order: 3 },
		't2': { color: '#F6251D', order: 4 },
		't2a': { color: '#F96D69', order: 5 },
		't2b': { color: '#FDCECD', order: 6 },
		't3': { color: '#1AEB42', order: 7 },
		't4': { color: '#EBBD34', order: 8 },
		'tx': { color: '#9943DE', order: 9 },
		// Pathologic N of Group.
		'n0': { color: '#DC5B35', order: 1 },
		'n1': { color: '#217C1F', order: 2 },
		'n2': { color: '#18A6F3', order: 3 },
		'n3': { color: '#EA68C3', order: 4 },
		'nx': { color: '#F4E831', order: 5 },
		// Pathologic M of Group.
		'm0': { color: '#F0820D', order: 1 },
		'm1': { color: '#C45A43', order: 2 },
		'm1a': { color: '#A523C2', order: 3 },
		'm1b': { color: '#C97BDA', order: 4 },
		'mx': { color: '#EDD3F2', order: 5 },
		// Pathologic Stage of Group.
		'stage i': { color: '#01C606', order: 1 },
		'stage ia': { color: '#018404', order: 2 },
		'stage ib': { color: '#002C01', order: 3 },
		'stage ii': { color: '#0E22C3', order: 4 },
		'stage iia': { color: '#08136C', order: 5 },
		'stage iib': { color: '#040B41', order: 6 },
		'stage iiia': { color: '#BB0C2E', order: 7 },
		'stage iiib': { color: '#75081D', order: 8 },
		'stage iv': { color: '#F0CA53', order: 9 },
		// Residual Tumor of Group.
		'r0': { color: '#DB8EC0', order: 1 },
		'r1': { color: '#FFD046', order: 2 },
		'r2': { color: '#495C50', order: 3 },
		'rx': { color: '#0E5F8A', order: 4 },
		// EGFR Mutation Result.
		'exon 19 deletion': { color: '#4A312A', order: 1 },
		'l858r': { color: '#74C04C', order: 2 },
		'l861q': { color: '#FBED09', order: 3 },
		'other': { color: '#C91DAB', order: 4 },
		't790m': { color: '#2C517B', order: 5 },
		// KRAS Mutation Result.
		'g12a': { color: '#DED0D1', order: 1 },
		'g12c': { color: '#AE8A8E', order: 2 },
		'g12d': { color: '#5D161D', order: 3 },
		'g12s': { color: '#410F14', order: 4 },
		'g12v': { color: '#25080B', order: 5 },
		'other': { color: '#C91DAB', order: 6 },
		// Primary Therapy Outcome Success.
		'complete remission/response': { color: '#BDED73', order: 1 },
		'partial remission/response': { color: '#8649F3', order: 2 },
		'progressive disease': { color: '#C1746B', order: 3 },
		'stable disease': { color: '#CD4C2A', order: 4 },
		// Followup Treatment Success.
		'complete remission/response': { color: '#BDED73', order: 1 },
		'partial remission/response': { color: '#8649F3', order: 2 },
		'progressive disease': { color: '#C1746B', order: 3 },
		'stable disease': { color: '#CD4C2A', order: 4 },
		// Tobacco Smoking History.
		'Lifelong Non-Smoker': { color: '#C4B5BB', order: 1 },
		'Current Smoker': { color: '#896C78', order: 2 },
		'Current Reformed Smoker for > 15 yrs': { color: '#3B0A1E', order: 3 },
		'Current Reformed Smoker for < or = 15 yrs': { color: '#2F0818', order: 4 },
		'Current Reformed Smoker, Duration Not Specified': { color: '#17040C', order: 5 },
		'NA': { color: '#D6E2E3', order: 6 },
	};

	model.exclusivityInfo = {
		'Amplification': '#FFBDE0',
		'Deletion': '#BDE0FF',
		'Mutation': '#5CB755',
		'None': '#D3D3D3',
	};
	
	return model;
};