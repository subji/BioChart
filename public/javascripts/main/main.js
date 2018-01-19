/*
	BioChart 를 window 객체에 넣어주는 객체.
 */
// 초기 실행 시 window 객체를 넘겨받는다. window 객체가
// 존재하지 않을경우 빈 객체를 받는다.
(function (whole)	{
	'use strict';
	// Window 객체에 bio 라는 이름의 객체를 포함 시킨다.

	var bio = {
		// >>> Model.
		initialize: initialize(),
		// >>> Common.
		sizing: sizing(),
		layout: layout(),
		setting: setting(),
		boilerPlate: boilerPlate(),
		// >>> Configuration.
		commonConfig: commonConfig(),
		pathwayConfig: pathwayConfig(),
		variantsConfig: variantsConfig(),
		landscapeConfig: landscapeConfig(),
		expressionConfig: expressionConfig(),
		exclusivityConfig: exclusivityConfig(),
		// >>> Preprocess.
		preprocess: preprocess(),
		preprocPathway: preprocPathway(),
		preprocVariants: preprocVariants(),
		preprocLandscape: preprocLandscape(),
		preprocExpression: preprocExpression(),
		preprocExclusivity: preprocExclusivity(),
		// >>> Tools.
		modal: modal(),
		title: title(),
		table: table(),
		loading: loading(),
		tooltip: tooltip(),
		selectBox: selectBox(),
		clinicalGenerator: clinicalGenerator(),
		// >>> Drawing.
		bar: bar(),
		text: text(),
		path: path(),
		heat: heat(),
		axises: axises(),
		circle: circle(),
		scales: scales(),
		needle: needle(),
		legend: legend(),
		drawing: drawing(),
		scatter: scatter(),
		network: network(),
		triangle: triangle(),
		survival: survival(),
		rectangle: rectangle(),
		rendering: rendering(),
		divisionLine: divisionLine(),
		// >>> Utilities.
		dom: dom(),
		math: math(),
		// >>> Events.
		handler: handler(),
		// strings 객체는 String 의 프로토 타입을 
		// 확장한 객체로 여기서 실행만 시켜놓고 따로 객체를 호출하거나
		// 인스턴스를 생성하지 않는다.
		strings: strings(), 
		objects: objects(),
		iteration: iteration(),
		dependencies: dependencies(),
		// >>> Expression.
		expression: expression(),
		colorGradient: colorGradient(),
		// >>> Exclusivity.
		exclusivity: exclusivity(),
		// >>> Landscape.
		scaleSet: scaleSet(),
		sortTitle: sortTitle(),
		landscape: landscape(),
		landscapeSort: landscapeSort(),
		// >>> Variants.
		variants: variants(),
		variantsNavi: variantsNavi(),
		variantsGraph: variantsGraph(),
		variantsPatient: variantsPatient(),
		// >>> Pathway.
		pathway: pathway(),
	};

	whole.bio = bio;
}(window||{}));