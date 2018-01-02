BioChart 0.0.17
==============

> This is a set of charts for Clinical Decision support.

> dist 폴더 안에 js/css 각각의 폴더 안의 js 파일과 css 파일을 import 하고 사용하시면 됩니다.

```
	Expression

	$.ajax({
		type: 'GET',
		url: expressionUrl,
		data: {
        source: "cohort_source",
        cancer_type: "sample_cancer_type",
        sample_id: "sample_id",
        signature: 'PAM50',
        filter: "cohort_filter_option",
      },
		beforeSend: function ()	{
			bio.loading().start(document.querySelector('#main'), width, height);
		},
		success: function (d)	{
			bio.expression({
				element: '#main',
				width: "userdefined width",
				height: "userdefined height",
				requestData: {
					source: "cohort_source",
					cancer_type: "sample_cancer_type",
					sample_id: "sample_id",
					signature: 'PAM50',
					filter: "cohort_filter_option",
				},
				data: d.data,
			});

			bio.loading().end();
		},
	});
  ```

```
	Exclusivity

	$.ajax({
    'type': 'GET',
    'url': '/rest/mutext',
    data: {
      source: 'GDAC',
      cancer_type: 'luad',
      sample_id: $('#sample_id').val(),
    },
    beforeSend: function () {
      bio.loading().start(document.querySelector('#main'), 1620, 850);
    },
    success: function (d) {
      bio.exclusivity({
        element: '#main',
        width: 1620,
        height: 850,
        data: {
          heatmap: d.data.file_list[1].contents,
          network: d.data.file_list[0].contents,
          sample: d.data.sample_variants,
          survival: {
            patient: d.data.patient_list,
            types: d.data.variant_types,
          },
          type: 'LUAD',
        }
      });

      bio.loading().end();
    },
  });
  ```

```
Landscape

$.ajax({
  type: 'GET',
  url: landscapeURL,
  data: {
    source: "cohort_source",
    cancer_type: "sample_cancer_type",
    sample_id: "sample_id",
    filter: "cohort_filter_option",
  },
  beforeSend: function () {
    bio.loading().start(document.querySelector('#main'), 1620, 850);
  },
  success: function (d) {
    bio.landscape({
      element: '#main',
      width: 1620,
      height: 850,
      data: {
        pq: 'p',
        type: cancer_type.toUpperCase(),
        data: d.data,
        title:d.data.name,
      },
    })
    
    bio.loading().end();
  },
});
```