$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

var addMessage = function(txt) {
  $('<samp>', {
    text: txt,
    css: {
      display: 'table'
    }
  }).appendTo($('#message'));
};

//TODO
function setFileList() {
  // 개발과 실서버가 다르므로 글로벌변수에서 읽어온다.
  var url = $('#biobank_url').val() + '/system/files';
  // console.log('url',url);

  $.ajax({ method: 'GET', url: url, data: { institute_id: 'SMC'} })
    .done(function(data) {
      // console.log('set data', data);
      $('#wes_normal_r1_filename').select2({ data: data, placeholder: "Select WES Normal R1 File." });
      $('#wes_normal_r2_filename').select2({ data: data, placeholder: "Select WES Normal R2 File." });
      $('#wes_tumor_r1_filename').select2({ data: data, placeholder: "Select WES Tumor R1 File." });
      $('#wes_tumor_r2_filename').select2({ data: data, placeholder: "Select WES Tumor R2 File." });
      $('#wts_normal_r1_filename').select2({ data: data, placeholder: "Select WTS Normal R1 File." });
      $('#wts_normal_r2_filename').select2({ data: data, placeholder: "Select WTS Normal R2 File." });
      $('#wts_tumor_r1_filename').select2({ data: data, placeholder: "Select WTS Tumor R1 File." });
      $('#wts_tumor_r2_filename').select2({ data: data, placeholder: "Select WTS Tumor R2 File." });
    })
    .fail(function(err) {
      console.log(err);
    });
}

$(function() {
  $('#wes_normal_r1_filename').select2();
  setFileList();

  // var l = Ladda.create(document.querySelector('#submitButton'));
  $("#registerForm").submit(function(event) {
    event.preventDefault();
    var sample = $(this).serializeObject();
    console.log(sample);
    if (!sample.wes_normal && !sample.wes_tumor && !sample.wts_normal && !sample.wts_tumor)
      return alert('Must check an analysis type at least.');
    $('#myPleaseWait').modal('show');

    setTimeout(function() {
      $.ajax({
          method: "POST",
          url: "/models/sample",
          data: sample
        })
        .done(function(data) {
          // console.log('success', data);
          addMessage(data.sample.sample_id + ' 로 생성');
          addMessage('CGIS에 등록 완료');
          setTimeout(function() {
            addMessage('BioBank에 등록 완료');
            setTimeout(function() {
              addMessage('생성 내역 화면으로 이동');
              setTimeout(function() {
                location.href = '/models/sample?sample_id=' + data.sample.sample_id;
              }, 500);
            }, 1000);
          }, 1000);
        })
        .fail(function(data) {
          addMessage('등록 오류: ' + data);
        })
        .always(function() {});
    }, 1000);
  });

  // Toggle
  $('#wes_normal').change(function() {
    if ($(this).is(":checked")) {
      $("#wes_normal_r1_filename").prop("disabled", false);
      $("#wes_normal_r2_filename").prop("disabled", false);
    }else{
      $("#wes_normal_r1_filename").prop("disabled", true);
      $("#wes_normal_r2_filename").prop("disabled", true);
    }
  });

  $('#wes_tumor').change(function() {
    if ($(this).is(":checked")) {
      $("#wes_tumor_r1_filename").prop("disabled", false);
      $("#wes_tumor_r2_filename").prop("disabled", false);
    }else{
      $("#wes_tumor_r1_filename").prop("disabled", true);
      $("#wes_tumor_r2_filename").prop("disabled", true);
    }
  });

  $('#wts_normal').change(function() {
    if ($(this).is(":checked")) {
      $("#wts_normal_r1_filename").prop("disabled", false);
      $("#wts_normal_r2_filename").prop("disabled", false);
    }else{
      $("#wts_normal_r1_filename").prop("disabled", true);
      $("#wts_normal_r2_filename").prop("disabled", true);
    }
  });

  $('#wts_tumor').change(function() {
    if ($(this).is(":checked")) {
      $("#wts_tumor_r1_filename").prop("disabled", false);
      $("#wts_tumor_r2_filename").prop("disabled", false);
    }else{
      $("#wts_tumor_r1_filename").prop("disabled", true);
      $("#wts_tumor_r2_filename").prop("disabled", true);
    }
  });
});
