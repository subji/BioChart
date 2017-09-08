"use strict";
var chooseUrl = function (_type)	{
	switch(_type)	{
		case "xy" : return "/rest/xyplot"; break;
		case "ma" : return "/rest/maplot"; break;
		case "deg" : return "/rest/degplot"; break;
		case "pca" : return "/data/PCA.dat.tsv"; break;
		case 'needle' : return '/rest/needleplot?cancer_type=luad&sample_id=Test099113&gene=EGFR&transcript=ENST00000275493&classification=All&filter='; break;
		// case "needle" : "/rest/needleplot?cancer_type=luad&sample_id=Pat1099&gene=EGFR&transcript=ENST00000275493&classification=All&filer"; break;
		case "comutation" : return "/rest/tumorportal_cmp?type=BRCA"; break;
	}
}

var startChart = function(_type)	{
	Init.requireJs(_type, chooseUrl(_type));
}

var startPathway = function(_type, _id, _seq, _filter)	{
	// 페이지 새로고침 후 svg가 완전히 로드되지 못한 상태에서 위치값을 가져오지 못해 발생하는 오류를 막기위한 코드.
	d3.selectAll("text, rect")
	.attr("class", "preserve_events");

	Init.requireJs("analysis_pathway", "/rest/pathwayplot?cancer_type=" + _type + "&sample_id=" + _id + "&filter=" + _filter);
}

var startComutation = function (_is, _type, _id, _filter)	{
	// console.log(_is, _type, _id, _filter);
	if(_is === "ERCSB")	{
		Init.requireJs("mutational_landscape_comutation", "/rest/comutationplotForERCSB");
	}
	else {
		Init.requireJs("mutational_landscape_comutation", "/rest/comutationplot?cancer_type=" + _type + "&sample_id=" + _id + "&filter=" + _filter);
	}
}
