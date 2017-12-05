function variantsPatient ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.patientData = opts.data;

		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.height - model.margin.bottom, 
										model.margin.top];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.shapeGroup = bio.rendering().addGroup(
			opts.element, 0, 0, 'needle-patient-shape');
		
		model.opts = bio.objects.clone(opts);
		model.opts.data = model.patientData;
		model.opts.element = 
		model.shapeGroup.selectAll(
			'#' + model.id + '_needle_patient_shape');
		
		bio.triangle(model.opts, model);
	};
};