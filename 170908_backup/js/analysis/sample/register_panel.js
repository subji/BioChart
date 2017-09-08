// $.fn.serializeObject = function() {
//   var o = {};
//   var a = this.serializeArray();
//   $.each(a, function() {
//     if (o[this.name] !== undefined) {
//       if (!o[this.name].push) {
//         o[this.name] = [o[this.name]];
//       }
//       o[this.name].push(this.value || '');
//     } else {
//       o[this.name] = this.value || '';
//     }
//   });
//   return o;
// };

var addMessage = function(txt) {
	$('<samp>', {
		text: txt,
		css: {
			display: 'table'
		}
	}).appendTo($('#message'));
};

$(function() {
	function msToTime(s) {
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;

		return hrs + ':' + mins + ':' + secs + '.' + ms;
	}

	$('#gotoList').click(function(e) {
		$('#myPleaseWait').modal('hide');
		location.href = '/menu/panel/index';
	});

	$("#registerForm").submit(function(event) {
		event.preventDefault();
		var form = $('#registerForm')[0];

		if (!$('#vcffile').val()) return alert('vcf 파일을 선택하십시오!');
		if (!$('#bamfile').val()) return alert('bam 파일을 선택하십시오!');
		if (!$('#baifile').val()) return alert('bai 파일을 선택하십시오!');

		var data = new FormData(form);
		// if (!sample.wes_normal && !sample.wes_tumor && !sample.wts_normal && !sample.wts_tumor)
		//   return alert('Must check an analysis type at least.');
		$('#myPleaseWait').modal('show');
		var $progressbar = $('#progressbar');
		var $ellapsed = $('#ellapsed');
		var start = new Date().getTime();

		addMessage('1/4: 파일 업로드 시작.');
		$.ajax({
				method: "POST",
				url: "/models/sample/panel",
				enctype: "multipart/form-data",
				data: data,
				processData: false,
				contentType: false,
				cache: false,
				// timeout: 600000,
				xhr: function() {
					var xhr = new window.XMLHttpRequest();
					//Upload progress
					xhr.upload.addEventListener("progress", function(evt) {
						if (evt.lengthComputable) {
							var ratio = evt.loaded / evt.total;
							var pct = parseInt(ratio * 100);
							//Do something with upload progress
							// console.log(pct);
							var ellapsed = new Date().getTime() - start;
							$progressbar.prop('aria-valuenow', pct);
							$progressbar.css('width', pct + '%');
							$progressbar.text(pct + '%');
							$ellapsed.text(msToTime(ellapsed));
							if (pct === 100) {
								addMessage('2/4: 파일 업로드 완료.');
								addMessage('3/4: 분석 실행함.');
							}
						}
					}, false);
					// //Download progress
					// xhr.addEventListener("progress", function(evt) {
					// 	if (evt.lengthComputable) {
					// 		var percentComplete = evt.loaded / evt.total;
					// 		//Do something with download progress
					// 		console.log(percentComplete);
					// 	}
					// }, false);
					return xhr;
				},
			})
			.done(function(sample) {
				console.log('success', sample);
				addMessage('4/4: ' + sample.sample_id + ' 로 샘플 등록.');
				addMessage(' * 분석 시간은 파일 크기에 따라 10~20분 걸립니다.');
				// setTimeout(function() {
				// 	// addMessage('BioBank에 등록 완료');
				// 	setTimeout(function() {
				// 		addMessage('목록 화면으로 이동합니다.');
				// 		setTimeout(function() {
				// 			location.href = '/menu/panel/index';
				// 		}, 500);
				// 	}, 1000);
				// }, 1000);
			})
			.fail(function(data) {
				addMessage('등록 오류: ' + data);
			})
			.always(function() {
				$('#gotoList').removeClass('hidden');
			});
	});
});
