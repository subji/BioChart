function preprocPathway ()	{
	'use strict';

	var model = {};

	function makeDrugList (pathway, drugs)	{
		model.drugs = [];

		bio.iteration.loop(pathway, function (p)	{
			var obj = {};
			var tempList = [];

			bio.iteration.loop(drugs, function (dr)	{
				if (p.gene_id === dr.gene_id)	{
					tempList.push(dr);
				}
			});

			obj.gene = p.gene_id;
			obj.drugs = tempList;

			if (obj.drugs.length > 0)	{
				obj.drugs = obj.drugs.sort(function (a, b)	{
					return a.drug_type > b.drug_type ? 1 : -1;
				});
				model.drugs.push(obj);
			}
		});
	};

	return function (data)	{
		model = {};

		makeDrugList(data.pathway, data.drugs);

		// console.log('>>> Preprocess pathway data: ', data);
		// console.log('>>> Preprocess data: ', model);

		return model;
	};
};