var selectBox = (function (selectBox)	{
	'use strict';

	var model = {};
	/*
		Select Box 가 그려질 Frame 을 만드는 함수.
	 */
	function makeSBFrame (className)	{
		var div = document.createElement('div'),
				height = (model.h - model.m.top * 2) < 40 ? 
								 (model.h - model.m.top * 2) : 40;

		div.className = (className + ' drop-menu');
		div.style.width = (model.w - model.m.left * 2) + 'px';
		div.style.height = height + 'px';
		div.style.marginLeft = model.m.left + 'px';
		div.style.marginTop = model.m.top + 'px';
		div.style.fontSize = model.fontSize;

		return div;
	};
	/*
		처음에 표기될 문자열과 화살표를 만드는 함수.
	 */
	function initText (className, text)	{
		var div = document.createElement('div'),
				spn = document.createElement('span'),
				itg = document.createElement('i');

		div.className = className + ' select';
		// 기본값을 10으로 했는데, 그보다 더 커지면 방법을 또 
		// 찾아야 한다.
		div.style.paddingTop = 10 - model.m.top + 1 + 'px';
		div.style.paddingBottom = 10 - model.m.top + 1 + 'px';
		div.style.paddingLeft = 10 - model.m.left + 1 + 'px';
		div.style.paddingRight = 10 - model.m.left + 1 + 'px';
		spn.innerHTML = text;
		itg.className = 'fa fa-chevron-down';

		return div.appendChild(spn), 
					 div.appendChild(itg), div;
	};	
	/*
		선택된 값이 표시될 input 태그를 만드는 함수.
	 */
	function inputView (name)	{
		var inp = document.createElement('input');

		inp.type = 'hidden';
		inp.name = name;

		return inp;
	};
	/*
		Item 을 만드는 함수.
	 */
	function addItems (list)	{
		var ult = document.createElement('ul');

		ult.className = 'dropeddown';
		
		util.loop(list, function (d)	{
			var lit = document.createElement('li');

			lit.id = d.toLowerCase();
			lit.title = d;
			lit.innerHTML = draw.textOverflow(
				d, model.fontSize, model.w * 0.40);

			ult.appendChild(lit);
		});	

		return ult;
	};
	/*
		Slide 동작 및 기타 동작을 실행해주는 함수.
	 */
	function execution (className, callback)	{
		var cls = '.' + className;

		// Click Event 중복 발생 금지 방법.
		$(cls).click(function (e) {
      $(this).attr('tabindex', 1).focus();
      $(this).toggleClass('active');
      $(this).find('.dropeddown').slideToggle(300);
    });
    $(cls).focusout(function () {
      $(this).removeClass('active');
      $(this).find('.dropeddown').slideUp(300);
    });
    $(cls + ' .dropeddown li').click(function (e) {
      $(this).parents('.drop-menu')
      			 .find('span').text($(this).text());
      $(this).parents('.drop-menu')
      			 .find('span').attr('title', $(this).attr('id'));
      $(this).parents('.drop-menu')
      			 .find('input').attr('value', $(this).attr('id'));

      return !callback ? false : 
      				callback($(this).attr('id').toLowerCase());
    });
	};

	return function (o)	{
		// Set configurations.
		model = {};
		model.e = document.querySelector(o.element);
		model.m = size.setMargin(o.margin || [0, 0, 0, 0]);
		model.w = o.width || parseFloat(model.e.style.width);
		model.h = o.height || parseFloat(model.e.style.height);
		model.className = o.className || '';
		model.initText = o.initText || 'Select item';
		model.viewName = o.viewName || 'select';
		model.fontSize = o.fontSize || '14px';
		model.items = o.items || [''];
		model.click = o.click || null;
		model.frame = makeSBFrame(model.className);
		model.initText = initText(model.className, model.initText);
		model.viewer = inputView(model.viewName);
		model.setItemts = addItems(model.items);

		if (model.e.children.length < 1)	{
			// Make select box.
			model.frame.appendChild(model.initText);
			model.frame.appendChild(model.viewer);
			model.frame.appendChild(model.setItemts);
			model.e.appendChild(model.frame);
			// Add click event.
			execution(model.className, model.click);
		}
	};

}(selectBox||{}));