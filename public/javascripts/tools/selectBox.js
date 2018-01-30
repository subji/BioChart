function selectBox ()	{
	'use strict';

	var model = {};
	/*
		select box frame 구현 함수.
	 */
	function makeSelectBoxFrame (className)	{
		var div = document.createElement('div'),
				width = (model.width - model.margin.left * 2),
				height = (model.height - model.margin.top * 2) < 40 ? 
								 (model.height - model.margin.top * 2) : 40;

		div.className = className + ' drop-menu';
		div.style.width = width + 'px';
		div.style.height = height + 'px';
		div.style.marginLeft = model.margin.left + 'px';
		div.style.marginTop = model.margin.top + 'px';
		div.style.fontSize = model.fontSize;

		return div;
	};
	/*
		처음 select box 에 표시될 문자열을 설정.
	 */
	function defaultText (className, defText)	{
		var div = document.createElement('div'),
				span = document.createElement('span'),
				itag = document.createElement('i');

		div.className = className + ' select';
		div.style.paddingTop = 10 - model.margin.top + 1 + 'px';
		div.style.paddingBottom = 10 - model.margin.top + 1 + 'px';
		div.style.paddingLeft = 10 - model.margin.left + 1 + 'px';
		div.style.paddingRight = 10 - model.margin.left + 1 + 'px';

		span.title = defText;
		span.innerHTML = defText;

		itag.className = 'fa fa-chevron-down';

		return div.appendChild(span), div.appendChild(itag), div;
	};
	/*
		선택한 값이 표시 될 input 태그를 만드는 함수.
	 */
	function inputViewer (viewName)	{
		var input = document.createElement('input');

		return input.type = 'hidden', input.name = viewName, input;
	};
	/*
		Item 들을 list 형식으로 만드는 함수.
	 */
	function addItems (items)	{
		var ul = document.createElement('ul');

		ul.className = 'dropeddown';

		bio.iteration.loop(items, function (item)	{
			var li = document.createElement('li');

			li.id = item;
			li.title = item;
			li.innerHTML = bio.drawing().textOverflow(
				item, model.fontSize, model.width * 0.80);

			ul.appendChild(li);
		});

		return ul;
	};
	/*
		Animation 및 Click 이벤트 처리 함수.
	 */
	function selectEvent (className, callback)	{
		// var tag = document.querySelector('.drop-menu');

		// tag.addEventListener('click', function (e)	{
		// 	e.stopPropagation();
		// 	e.preventDefault();

		// 	var ul = bio.drawing().findDom(this, '.dropeddown');
		// 	this.setAttribute('tabindex', 1);
		// 	this.focus();
		// 	this.className += ' active';
		// 	// Target 의 display 를 처음에 설정해주지 않으면,
		// 	// max-height 값이 적용되어진다. 그러므로 처음에 실행하도록하자.
		// 	ul.style.display = 'block';
		// 	bio.drawing().slideDown(ul);
		// }, true);

		// tag.addEventListener('blur', function (e)	{
		// 	e.stopPropagation();
		// 	e.preventDefault();

		// 	var ul = bio.drawing().findDom(this, '.dropeddown');
			
		// 	this.classList.remove('active');
		// 	bio.drawing().slideUp(ul);
		// }, true);

		// var items = Array.prototype.slice.call(
		// 						document.querySelectorAll('.dropeddown li'));

		// bio.iteration.loop(items, function (item)	{
		// 	item.addEventListener('click', function (e)	{
		// 		// Event bubbling 을 방지하기 위함.
		// 		e.stopPropagation();
		// 		e.preventDefault();

		// 		var sele = document.querySelector('.select'),
		// 				drmn = document.querySelector('.drop-menu'),
		// 				span = bio.drawing().findDom(sele, 'span'),
		// 				input = bio.drawing().findDom(drmn, 'input'),
		// 				ul = bio.drawing().findDom(tag, '.dropeddown');

		// 		span.textContent = this.id;
		// 		span.title = this.id;
		// 		input.value = this.id;

		// 		tag.classList.remove('active');
		// 		bio.drawing().slideUp(ul);

		// 		return !callback ? false : 
		// 						callback(this.id.toLowerCase());
		// 	}, true);
		// });
		className = '.' + className;

		// Click Event 중복 발생 금지 방법.
		$(className).click(function (e) {
      $(this).attr('tabindex', 1).focus();
      $(this).toggleClass('active');
      $(this).find('.dropeddown').slideToggle(300);
    });
    $(className).focusout(function () {
      $(this).removeClass('active');
      $(this).find('.dropeddown').slideUp(300);
    });
    $(className + ' .dropeddown li').click(function (e) {
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

	return function (opts)	{
		model = {};
		model.element = document.querySelector(opts.id);
		model.className = opts.className || '';
		model.margin = bio.sizing.setMargin(
			opts.margin || [0, 0, 0, 0]);
		model.width = 
		opts.width || parseFloat(model.element.style.width);
		model.height = 
		opts.height || parseFloat(model.element.style.height);
		model.defaultText = opts.defaultText || 'Select';
		model.viewName = opts.viewName || 'viewName';
		model.fontSize = opts.fontSize || '10px';
		model.items = opts.items || [''];
		model.clickItem = opts.clickItem || null;
		model.frame = makeSelectBoxFrame(model.className);
		model.defaultText = defaultText(
			model.className, model.defaultText);
		model.viewer = inputViewer(model.viewName);
		model.addItems = addItems(model.items);

		if (model.element.children.length < 1)	{
			model.frame.appendChild(model.defaultText);
			model.frame.appendChild(model.viewer);
			model.frame.appendChild(model.addItems);

			model.element.appendChild(model.frame);

			selectEvent(model.className, model.clickItem);

			document.querySelector('.drop-menu .select')
							.style.lineHeight = model.fontSize;
		}
	};
};