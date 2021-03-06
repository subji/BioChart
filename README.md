BioChart 0.0.35
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
            isDefault: true,
            func: function (data)  {
              input data : 
              [
               {
                pid: participant id
                values: [
                         {
                          gene: name,
                          tpm: value, 
                         },
                         ...
                        ]
               },
               ...
              ]

              output data : 
              [
               {
                pid: participant id,
                score: calculated value,
               },
               ...
              ]
            },
          }
        ],
        divisionFunc: function (left, mid, right, geneList, allRnaList) {
          // console.log(left, mid, right)
        },
        onSubtypeSelection: function (subtypeName) {
          // console.log(subtypeName)
        },
			});

			bio.loading().end();
		},
	});

  ps.

  bio.survival option 추가
  pvalueURL: 'URL Address',
  legends: {
    high: {
      text: 'High score group',
      color: '#FF6252',
    },
    low: {
      text: 'Low score group',
      color: '#00AC52',
    }
  },
  styles: {
    size: {
      chartWidth: chart width,
      chartHeight: chart height,
    },
    position: {
      chartTop: chart top position (survival 이 그려지는 위쪽 좌표),
      chartLeft: chart left position (survival 이 그려지는 왼쪽 좌표),
      axisXtitlePosX: X-axis title left position (가로축 제목 왼쪽 좌표),
      axisXtitlePosY: X-axis title top position (가로축 제목 위쪽 좌표), 
      axisYtitlePosX: Y-axis title top position (세로축 제목 위쪽 좌표),
      axisYtitlePosY: Y-axis title left position (세로축 제목 왼쪽 좌표),
      pvalX: P-value left position (P-value 의 왼쪽 좌표),
      pvalY: P-value top position (P-value 의 위쪽으로부터의 좌표),
    },
  },

  옵션을 추가하면 범례의 색과 이름 그리고

  라인의 색상을 변경할 수 있다.

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
      clinicalFunc: function (data, colors) {
        // console.log(data, colors);
      },
      onClickClinicalName: function (clinicalName)  {
        // console.log(clinicalName)
      },
    })
    
    bio.loading().end();
  },
});
```