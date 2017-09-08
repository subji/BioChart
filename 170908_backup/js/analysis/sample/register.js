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

$(function() {
  // var l = Ladda.create(document.querySelector('#submitButton'));
  $("#registerForm").submit(function(event) {
    event.preventDefault();
    var sample = $(this).serializeObject();
    // console.log(sample);
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
});
