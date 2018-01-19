BioChart 0.0.22
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
        riskFunctions: [
          { 
            name: 'Test', 
            func: function (data)  {
              // data 는 
              // [
                  {
                    key: gene name,
                    value: tpm value, 
                  },
                  ...
                 ]
              // 넘어온다.
              // console.log(data);
              // sample 별 각 gene 들의 tpm 값이 return
              // ex) 평균 함수를 적용시켜 놓고자 할때
              // 아래와 같이 평균을 계산하고 그 평균을
              // 반환하면 된다.
              var sum = 0, avg = 0;

              data.forEach(function (d) {
                sum += d.value;
              });

              avg = sum / data.length;

              return avg;
            },
          }
        ],
        divisionFunc: function (left, mid, right) {
          // console.log(left, mid, right)
        },
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
      // false 하면 patient 와 pq plot 이 사라짐.
      plot: {
        patient: false, // true
        pq: false, // true
      },
      // division option
      divisionFunc: function (enable, disable)  {

        },
    })
    
    bio.loading().end();
  },
});
```