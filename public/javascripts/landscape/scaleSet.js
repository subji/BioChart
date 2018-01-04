function scaleSet ()	{
	'use strict';

	var model = {};
	/*
		가장 테두리가 되는 Form 태그를 만드는 함수. 
	 */
	function makeDiv ()	{
		var e = document.createElement('div');
				e.id = 'scale_set_div';

		return e;
	};
	/*
		비율값을 보여 줄 Input 태그를 만드는 함수
	 */
	function makeInput (value)	{
		var e = document.createElement('input');
				e.id = 'scale_set_input';
				e.value = value || '100%';

		return e;
	};		
	/*
		Option 버튼의 종류를 반환하는 함수.
	 */
	function getOptionType (className)	{
		return className.indexOf('caret') > -1 ? 
					 className.indexOf('up') > -1 ? 
					 'up' : 'down' : 'refresh';
	}
	/*
		Scale button 들에 대한 이벤트 함수.
	 */
	function scaleEvent (event)	{
		if (!model.change)	{
			return;
		}	

		var type = getOptionType(this.className),
				sTerm = parseInt(model.defaultValue * 0.1),
				sign = { up: 1, down: -1 }[type];
		// 실제 크기에 변경 값 적용.
		model.scaleValue = type !== 'refresh' ? type === 'up' ? 
		model.scaleValue + (sign * sTerm) : 
		model.scaleValue + (sign * sTerm) : 
		model.defaultValue; 
		// Input 태그에 보여질 비율 값 변경 적용.
		model.scaleRate = type !== 'refresh' ? type === 'up' ? 
		(model.scaleRate += model.termRate, model.scaleRate) : 
		(model.scaleRate -= model.termRate, model.scaleRate) : 
		model.defaultRate;
		// Input 태그 값 범위 제한.
		// model.scaleRate = 
		// model.defaultValue / 2 > model.scaleValue ? 
		// (model.scaleRate += model.termRate, model.scaleRate) : 
		// model.defaultValue * 2 < model.scaleValue ? 
		// model.defaultRate * 2 : model.scaleRate;
		// // 실제 크기 값 범위 제한.
		// model.scaleValue = 
		// model.defaultValue / 2 > model.scaleValue ? 
		// model.defaultValue / 2 : 
		// model.defaultValue * 2 < model.scaleValue ? 
		// model.defaultValue * 2 : model.scaleValue;
		// 2018.01.02 Paper support code.
		model.scaleRate = 
		model.defaultValue > model.scaleValue ? 
		(model.scaleRate += model.termRate, model.scaleRate) : 
		model.defaultValue * 2 < model.scaleValue ? 
		model.defaultRate * 2 : model.scaleRate;
		// 실제 크기 값 범위 제한.
		model.scaleValue = 
		model.defaultValue > model.scaleValue ? 
		model.defaultValue : 
		model.defaultValue * 2 < model.scaleValue ? 
		model.defaultValue * 2 : model.scaleValue;
		// Input 태그 값 변경 적용.
		model.input.value = model.scaleRate + '%';
		// Option type 과 현재 실제 값을 반환한다.
		model.change.call(this, event, { 
			type: type, value: model.scaleValue,
		});
	};
	/*
		비율 증감 버튼 및 초기화 버튼을 만드는 함수.
	 */
	function makeButtons ()	{
		var div = document.createElement('div'),
				btns = ['caret-up', 'caret-down', 'refresh'];

		div.id = 'scale_options';

		bio.iteration.loop(btns, function (btn)	{
			var i = document.createElement('i'),
					d = document.createElement('div'),
					b = document.createElement('button');

			b.className = 'scale-' + btn;		
			i.className = 'fa fa-' + btn + ' fa-lg';
			b.addEventListener('click', scaleEvent);

			b.appendChild(i);
			d.appendChild(b);
			div.appendChild(d);
		});

		return div;
	};	

	return function (opts)	{
		if (!opts.element)	{
			throw new Error ('Please, pass the element');
		}

		var dom = bio.dom().get(opts.element);
		// scale set 의 기본 값들.
		model = {
			unit: opts.unit || '%',
			change: opts.change || null,
			termRate : opts.termRate || 10,
			scaleRate: opts.defaultRate || 100,			// 변경 뷰 적용 값.
			defaultRate: opts.defaultRate || 100,		// 기본 뷰 적용 값.
			scaleValue : opts.defaultValue || 100,	// 변경 스케일 적용 값.
			defaultValue: opts.defaultValue || 100, // 기본 스케일 적용 값.
		};

		model.div = makeDiv();
		model.input = makeInput();
		model.buttons = makeButtons();
		model.div.appendChild(model.input);
		model.div.appendChild(model.buttons);

		dom.appendChild(model.div);
	};
};