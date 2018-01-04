function setting ()	{
	'use strict';

	var model = null;	
	/*
		ID 또는 ClassName 으로 된 노드를 찾아
		DOM 객체로 반환해주는 함수.
	 */
	function setTargetedElement (element)	{
		return model.dom = bio.dom().get(element), model.dom;
	};
	/*
		파라미터에 width, height 값이 있으면 그 값을 
		없는 경우 전달 된 Dom 의 가로, 세로 길이를 반환하는 함수.
	 */
	function setTargetedElementSize (opts)	{
		model.size.width = opts.width || 
		parseFloat(model.dom.style.width),
		model.size.height = opts.height || 
		parseFloat(model.dom.style.height)

		return { 
			width: model.size.width, 
			height: model.size.height,
		};
	};
	/*
		Layout 의 ID 목록 데이터를 만들어주는 함수.
		여기서 각각의 Layout 의 크기도 설정해준다.
	 */
	function setLayoutIdData (chart, element, width, height, add, isPlotted)	{
		model.ids = 
		bio.sizing.chart[chart](element, width, height, add, isPlotted);

		return model.ids;
	};
	/*
		구성된 Layout 에 svg 엘리먼트를 만들어준다.
	 */
	function setSVGElement (chart, ids, isPlotted)	{
		return bio.layout()[chart](ids, isPlotted);
	};

	return function (chart, opts)	{
		model = bio.initialize('setting');

		var groupLayout = null,
				isPlotted = opts.plot ? opts.plot : null;

		if (opts.data.data && opts.data.data.name)	{
			groupLayout = opts.data.data.group_list;
		}

		return {
			defaultData: opts.data,
			targetedElement: setTargetedElement(opts.element),
			targetedElementSize: setTargetedElementSize(opts),
			preprocessData: bio.preprocess(chart)(opts.data, isPlotted),
			layoutIds: setLayoutIdData(
									chart,
									model.dom, 
									model.size.width, 
									model.size.height, groupLayout, isPlotted),
			svgs: setSVGElement(chart, model.ids, isPlotted),
		};
	};
};