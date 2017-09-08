'use strict';

var Igv 					= (function ()									  {
	return {
		seq_prefix : 'http://203.255.191.19/data/seq/hg19/',
		bam_prefix : '/data/bam/' 												 ,
		browser 	 : null 																 ,
		nowData		 : null 																 ,
		idx 			 : 0 																		 ,
		files  		 : [] 																	 ,
		view   		 : function (type, i, data)	{
			var that 	  			= this;
					that.idx 			= i;

			if (data.length === 0)	{
				if (that.browser)	{
					removeBrowser(that);
				}
				return;
			}

			setModalBody(type, +that.idx, data);

 		// 	if (type === 'modal')	{
			// 	$('#igvModal')
			// 	.modal('show')
			// 	// 이벤트를 단 한번만 실행시켜주는 메소드.
			// 	.one('shown.bs.modal', function (e)	{
			// 		setModalBody(type, +that.idx, data);
			// 	});

			// 	$('#igvPrev, #igvNext')
			// 	// Off -> On 으로 이벤트를 등록해야 여러번 호출되지 않는다.
			// 	// 클릭 이벤트 안에 클릭 이벤트가 바인딩 되므로 여러번 이벤트가 호출되게 된다.
			// 	// 이를 방지하려면 이벤트 안에 이벤트를 등록하지 말아야 하지만, 현재는 불가능하므로 클릭이벤트를 해제 후 다시 등록하는 코드로 대체한다.
			// 	.off('click').on('click', function (e)	{
			// 		var value = this.id.replace(/igv/g, '') === 'Prev' ? -1 : 1;
			// 		    that.idx 	= +that.idx + value;

			// 		setModalBody(type, +that.idx, data);
			// 	});
			// } else {
			// 	 setModalBody(type, +that.idx, data);
			// }
		},
		create  : function (type, i, data)	{
			var that 	= this;
			var popup = $('#changeData');
			var doc 	= $(document);

			popup.popover({
				'container' : 'body' 			 ,
				'title' 		: 'Choose data',
				'content' 	: function ()	{
					return showDataList(that);
				},
				'html'			: true 				 ,
			});

			showBrowser(type, i, data, that);

			// doc.on('click', '.list-group-item', function (e)	{
			// 	var self = $(this);

			// 	self.parent().find('.list-group-item').removeClass('active');
			// 	self.addClass('active');

			// 	that.nowData = self.text();

			// 	if (that.browser)	{
			// 		removeBrowser(that);

			// 		showBrowser(type, i, data, that);
			// 	}
			// });

			// $.ajax({
			// 	'url' : '/menu/analysis/variants/collectdata',
			// 	'type' : 'GET',
			// 	'error' : function (err)	{
			// 		console.log('error : ', err);
			// 	},
			// 	'success' : function (res)	{
			// 		that.files = res.files;

			// 		if (!that.nowData)	{
			// 			that.nowData = that.files[0];
			// 		}

			// 		showBrowser(type, i, data, that);
			// 	}
			// });
		},
	}
}());

var removeBrowser =  function (that)	 						  {
	$('#igvView2').html('');

	that.browser = null;

	delete igv['browser'];
}

var showBrowser   = function (type, i, data, that)	{
	var chr 		 = 'chr' + data[i].chr + ':';
	var locus 	 = data[i].start_pos;
	var bp_str 	 = makeComma(locus - 100) + '-' + makeComma(locus + 100);

  if (that.browser === null)	{
		var add 		 = type === 'tab' ? '2' : '';
   	var div 		 = $('#igvView' + add);
		var config 	 = {
      'showNavigation'		: true 				  ,
      'showCenterGuide'		: true					,
      'showCursorTrackingGuide' : true 		,
      'genome'						: "hg19"  			,
     	'locus' 						: (chr + bp_str),
     	'flanking'					: 1 						,
      'tracks'						: [
         {
         		'name' 				: data[0].sample_id 																		 ,
            'url' 		 		: that.bam_prefix + data[0].sample_id + '.bam' 				   ,
            'indexURL'		: that.bam_prefix + data[0].sample_id +
            								(data[0].sample_id === 'Sample3' ? '.bam.bai' : 
            							 !(data[0].sample_id + '.bai') ? '.bam.bai' : '.bai'),
            // 'indexURL'		: that.bam_prefix + data[0].sample_id +
            // 								(data[0].sample_id === 'Sample3' ? '.bam.bai' : '.bai'),
            // 'type' 		 		: 'bam'																									 ,
            'type' 		 		: 'alignment'																									 ,
            'height' 			: 600																										 ,
            'maxHeight'		: 600,
            // 'displayMode': 'SQUISHED',
            'alignmentRowHeight': 1,
            // 'squishedRowHeight': 15,
         },
      ]
	  };

   	that.browser = new igv.createBrowser(div, config);
   // 	setTimeout(function ()	{
   // 	html2canvas(div, {
   // 		'onrendered' : function (canvas)	{
   // 			console.log(canvas.toDataURL())


   // 				var pwin = window.open('about:blank', '_blank');
   //  			var html = '<html><head>' +
   //  								 '</head>' +
   //  								 '<body style="-webkit-print-color-adjust:exact;">' +
   //  								 '<img src=\'' + canvas.toDataURL() + '\' onload=\'javascript:window.print();\'/>' +
   //  								 '</body>';
   //  					pwin.document.write(html);

   // 		}
   // 	})
   // }, 5000);
  } else {
   	that.browser.search(chr + bp_str);
  }

 //  drawLine(locus, that.browser);

	// $('.igv-content-div')
	// .mousedown(function ()	{
	// 	$(this)
	// 	.mousemove(function ()	{
	//  	drawLine(locus, that.browser);
	//  })
	// })
	// .mouseup(function ()	{
	// 	drawLine(locus, that.browser);
	// });

	// window.onresize = function ()	{
	// 	drawLine(locus, that.browser);
	// };
}

var showDataList  = function (self)									{
	var start = '<div id="dataList"><div class="list-group">';
	var end 	= '</div></div';
	var list  = '';

	self.files.forEach(function (d)	{
		var active = self.nowData === d ? ' active' : '';

		list += '<a href="#" class="list-group-item' + active + '">' + d + '</a>'
	});

	return start + list + end;
}

var setLabelText  = function (type, idx, data)			{
	var d = data[idx];

 	if (type === 'modal')	{
 		var gene  = $('#igvGene'),  chr = $('#igvChr'),
		 	  locus = $('#igvLocus'), cds = $('#igvCds'),
		 	  vaf 	= $('#igvVaf');

 		gene.text(d.gene);
	 	chr.text(d.chr);
	 	locus.text(makeComma(+(d.start_pos)));
	 	cds.text(d.cds);
	 	vaf.text(((d.vaf * 100) + '%'));
 	}
}

var setModalBody  = function (type, idx, data)			{
	if (idx === 0)	{
		$('#igvPrevBtn').addClass('disabled');
	} else if (idx === (data.length - 1)) {
		$('#igvNextBtn').addClass('disabled');
	} else {
		$('#igvPrevBtn, #igvNextBtn').removeClass('disabled');
	}

	setLabelText(type, idx, data);

	Igv.create(type, idx, data);
}

var makeComma 		= function (locus)							  {
	var parts 	 = locus.toString().split('.');
   	  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	return parts.join('.');
}
// 임시방편으로 만든 코드이며, igv 측에서 새로 만든 옵션이 적용될 경우
// 삭제 할 것이다.
// var drawLine = function (locus, browser)	{
// 	// Browser 가 생성 완료 되었음을 알리는 Sign 이 있어야 한다.
// 	// 인터벌을 이용하여 로딩이 완료되어 로딩 아이콘이 사라졌을때를 추적해 선을 그려주는 방식.
// 	var isLoaded = setInterval(function ()	{
// 		if (!$('.igv-spinner-container').is(':visible'))	{
// 			clearInterval(isLoaded);

// 			var pixel 				= browser.referenceFrame.bpPerPixel;
// 			var prevariant 		= locus - 1, aftervariant = locus + 1;
//       var bpstart       = browser.trackViews[2].tile.startBP;
// 			var fullheight 		= browser.trackViews[2].contentDiv.clientHeight;
// 			var xoff 					= browser.trackViews[2].xOffset;
// 			var startvariant 	= (locus + prevariant) / 2;
// 			var endvariant 		= (locus + aftervariant) / 2;
// 			var sposx 				= (((startvariant - 0.5 - bpstart) / pixel)) + xoff;
// 			var eposx 				= (((endvariant - 0.5 - bpstart) / pixel)) + xoff;
// 			var canvas 				= browser.trackViews[2].canvas;
// 			var ctx 					= canvas.getContext('2d');

// 			ctx.setLineDash([5, 3]);
// 			ctx.beginPath();
// 			ctx.moveTo(sposx, 0);
// 			ctx.lineTo(sposx, fullheight);
// 			ctx.moveTo(eposx, 0);
// 			ctx.lineTo(eposx, fullheight);
// 			ctx.stroke();
// 		}
// 	}, 500);
// }
