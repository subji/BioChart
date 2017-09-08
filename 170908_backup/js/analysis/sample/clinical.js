 $(function() {
   // Default Options
   //  $.fn.editable.defaults.mode = 'inline';
   $.fn.editable.defaults.url = '/models/sample/clinical/';
   $.fn.editable.defaults.ajaxOptions = {
     type: 'put',
     dataType: 'json',
     cache: false,
   };
   //  sample_id & cancer_type
   $.fn.editable.defaults.pk = $('#sampleid').text();
   $.fn.editable.defaults.params = function(params) {
     params.cancer_type = $('#cancer_type').text();
     return params;
   };

   $.fn.editable.defaults.success = function(res) {};
   $.fn.editable.defaults.error = function(res) {
     return res.responseText;
   };

   // Define a column: 개별항목은 전체 설정 전에 이루어져야 제대로 작동한다.
   $('#tobacco_smoking_history').editable({
     type: 'select',
     source: [{
       value: '1',
       text: 'Lifelong Non-Smoker'
     }, {
       value: '2',
       text: 'Current Smoker'
     }, {
       value: '3',
       text: 'Current Reformed Smoker for > 15 yrs'
     }, {
       value: '4',
       text: 'Current Reformed Smoker for < or = 15 yrs'
     }, {
       value: '5',
       text: 'Current Reformed Smoker, Duration Not Specified'
     }]
   });

   // Define All Columns
   $('.editable').editable({
     type: 'text'
   });
 });
