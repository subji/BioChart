 $(function() {
   var $dropbox;

   $dropbox = document.getElementById("dropbox");
   $dropbox.addEventListener("dragenter", dragenter, false);
   $dropbox.addEventListener("dragover", dragover, false);
   $dropbox.addEventListener("drop", drop, false);

   function dragenter(e) {
     e.stopPropagation();
     e.preventDefault();
   }

   function dragover(e) {
     e.stopPropagation();
     e.preventDefault();
     $('#dropbox').addClass('dragover');
   }

   function drop(e) {
     e.stopPropagation();
     e.preventDefault();

     $('#dropbox').removeClass('dragover');
     //  var dt = e.dataTransfer;$dropbox
     //  var files = dt.files;
     createTable(e.dataTransfer.files[0]);
   }
   // Method that checks that the browser supports the HTML5 File API
   var browserSupportFileUpload = function() {
     var isCompatible = false;
     if (window.File && window.FileReader && window.FileList && window.Blob) {
       isCompatible = true;
     }
     return isCompatible;
   };

   // Method that reads and processes the selected file
   var upload = function(evt) {
     if (!browserSupportFileUpload()) {
       alert('The File APIs are not fully supported in this browser!');
     } else {
       var data = null;
       var file = evt.target.files[0];
       createTable(file);
     }
   };
   var removeTableDiv = function() {
     $('#tablediv > div').remove();
   };
   var createTable = function(file) {
     fadeInOut('#step2div', '#step3div');

     var reader = new FileReader();
     reader.readAsText(file);
     reader.onload = function(event) {
       var csvData = event.target.result;
       //  data = $.csv.toArrays(csvData);
       var option = {separator:"\t"};
       var data = $.csv.toObjects(csvData,option);
       if (data.length < 1) return alert('No Data!');

       // 계속 업로드할 수 있으므로, 이전 데이터는 지우고 새로 업로드한다.
       //  $('#tablediv > div').remove();
       removeTableDiv();
       $('#tablediv').append('<table id=table></table>');
       var $table = $('#table');
       var columns = [];
       // Make Header
       for (var name in data[0]) {
         columns.push({
           field: name,
           title: name
         });
       }
       // Insert Data
       $table.bootstrapTable({
         pagination: true,
         pageSize: 10,
         columns: columns,
         data: data
       });
       // Finally Show Upload Button
       $('#uploadbutton').removeClass('hidden');
     };
     reader.onerror = function() {
       alert('Unable to read ' + file.fileName);
     };
   };
   var fadeInOut = function(div1, div2) {
     $(div1).slideUp('slow', function() {
       $(div2).removeClass('hidden');
     });
   };
   // The event listener for the file upload
   document.getElementById('txtFileUpload').addEventListener('change', upload, false);
   // reload page
   $('#resetlink').on('click', function(e) {
     document.location.reload(true);
   });
   $('#resetbutton').on('click', function(e) {
     document.location.reload(true);
   });
   $('#step1nextbutton').on('click', function(e) {
     var cancer_type = $(":input:radio[name=cancer_type]:checked").val();
     //  console.log(cancer_type);
     if (cancer_type) {
       fadeInOut('#step1div', '#step2div');
       $('#cancertypemsg').addClass('hidden');
       $('#cancertypetitle').text(cancer_type.toUpperCase());
     } else
       $('#cancertypemsg').removeClass('hidden');
   });
   // upload rows
   $('#uploadbutton').on('click', function(e) {
     fadeInOut('#step3div', '#step4div');
     var cancer_type = $(":input:radio[name=cancer_type]:checked").val();
     var rows = $('#table').bootstrapTable('getData');
     //  console.log(rows);
     //  $(this).addClass('hidden');
     //  $('#step4div').removeClass('hidden');
     var success = 0;
     var error = 0;
     rows.forEach(function(row) {
       //  console.log(row);
       $.ajax({
           method: "POST",
           url: "/models/sample/clinical",
           //  data: rows
           data: {
             cancer_type: cancer_type,
             row: JSON.stringify(row)
           }
         })
         .done(function(message) {
          //  console.log('success', message);
           if (message.type === 'success') {
             success++;
             //$('#msgtbody').append('<tr><td class=text-success>' + row.sample_id + '<td>Success</td></tr>');
           } else {
             error++;
             $('#errormsgtable').bootstrapTable('insertRow', {
               index: 1,
               row: {
                 sample_id: row.sample_id,
                 message: message.msg,
               }
             });
             //$('#msgtbody').append('<tr><td class=text-danger>' + row.sample_id + '<td>' + message.msg + '</td></tr>');
           }
         })
         .fail(function(data) {
           console.log('등록 오류: ', data);
         })
         .always(function() {
           if (rows.length == success + error) {
             $('#success').text(success);
             $('#error').text(error);
             if(error !== 0) $('#errormsgdiv').removeClass('hidden');
           }
         });
     });
   });
 });
