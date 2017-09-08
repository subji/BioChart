'use strict';

(function ()	{
  var width = 1620,
      height = 840;



  $.ajax({
  	'type': 'GET',
  	'url': '/rest/mutext',
    data: {
      source: 'GDAC',
      cancer_type: 'luad',
      sample_id: $('#sample_id').val(),
    }
  }).done(function (data)	{
    $('.container').width(width)
                   .height(height);

    console.log(JSON.stringify(data.data.file_list[0].contents))

  	bio.exclusive({
      element: '#main',
      width: width,
      height: height,
      data: {
        heatmap: data.data.file_list[1].contents,
        network: data.data.file_list[0].contents,
        sample: data.data.sample_variants,
        survival: {
          patient: data.data.patient_list,
          types: data.data.variant_types,
        },
        type: 'LUAD',
      }
    });
  })
}());