var landscapeScaleOption = (function (landscapeScaleOption)	{
	'use strict';

	var model = {
	};
	/*
	 Button 별 Icon Class name 반환해주는 함수.
	 */
	function setIcon (name)	{
		return {
			'upscale': 'fa fa-caret-up',
			'downscale': 'fa fa-caret-down',
			'initialize': 'fa fa-refresh',
		}[name];
	};
	/*
	 Scale 이벤트 함수.
	*/
	function scaleEvent (evt)	{
		var input = document.querySelector('#viewscale');

		switch(this.id)	{
			case 'upscale': model.status += model.interval; break;
			case 'downscale': model.status -= model.interval; break;
			case 'initialize': model.status = model.default; break;
			default: return; break;
		}

		var sign = this.id === 'upscale' ? 1 : -1,
				chNum = parseInt(model.defaultValue * 0.1);

		model.nowValue = this.id === 'initialize' ? 
		model.defaultValue : this.id === 'upscale' ? 
		model.nowValue + (sign * chNum) : 
		model.nowValue + (sign * chNum); 
		// 보이는 최대 가로 길이에 맞을 때 까지 비율을 줄어들게 하였다.
		model.status = 
		model.defaultValue / 2 > model.nowValue ? 
	 (model.status += model.interval, model.status) : 
		model.status > 200 ? 200 : model.status;

		input.value = model.status + ' %';
		// 현재 값이 기본값의 절반보다 작으면 기본값의 절반으로,
		// 현재 값이 기본값의 한계치인 2배 값보다 높으면 
		// 기본값의 한계치로 대치한다.
		model.nowValue = 
		model.defaultValue / 2 > model.nowValue ? 
		model.defaultValue / 2 : 
		model.defaultValue * 2 < model.nowValue ? 
		model.defaultValue * 2 : model.nowValue;

		model.change ? 
		model.change(this.id, model.nowValue) : false;
	};
	/*
	 Scalable button 들을 만들어주는 함수.
	 */
	function button (parent, opts)	{
		for (var i = 0, l = opts.btn.length; i < l; i++)	{
			var b = opts.btn[i],
					btn = document.createElement('button'),
					icon = document.createElement('i');

			icon.className = setIcon(b.id);

			btn.id = b.id;
			btn.addEventListener('click', scaleEvent);
			btn.appendChild(icon);
			parent.appendChild(btn);
		}
	};
	/*
	 input 태그를 만들어주는 함수.
	 tabIndex 속성을 -1 값으로 주어 Tab 동작에도 Focusing 이 안되게 했다.
	 또한 readOnly 속성을 Enable 해서 수정이 불가능하게 하였다.
	 */
	function input (p, o)	{
		util.loop(o.input, function (d, i)	{
			var ip = document.createElement('input');

			ip.id = d.id;
			ip.readOnly = true;
			ip.tabIndex = -1;
			ip.value = (model.value || model.default) + 
						' ' + model.unit;

			p.appendChild(ip);
		});
	};
	/*
	 단위가 % 인지 그냥 정수 인지 체크 하는 함수.
	 */
	function setUnit (unit)	{
		if (unit === 'percentage' || unit === '%')	{
			model.unit = '%';
		} else if (unit === 'int' || !unit)	{	
			model.unit = '';
		}
	};
	/*
	 {
		 element: targeted element,
		 default: initialize number(default number) of scale,
		 interval: how to increase or decrease number,
		 unit: unit of number (ex. '%' or 'percent', 'int' or '0'),
	 }
	 */
	landscapeScaleOption.set = function (opts)	{
		if (d3.select('.scale-option-frame').empty())	{
			var div = document.createElement('div');

			div.className = 'scale-option-frame';

			model = opts;
			model.status = opts.default;
			model.e = document.querySelector(opts.element);
			model.width = parseFloat(
			opts.width || model.e.style.width || 140);
			model.height = parseFloat(
			opts.height || model.e.style.height || 105);
			model.change = opts.change || null;
			model.defaultValue = opts.defaultValue;
			model.nowValue = model.defaultValue;
			model.e.appendChild(div);

			opts.btn = opts.btn.length ? opts.btn : [opts.btn];
			opts.input = opts.input.length ? 
									 opts.input : [opts.input];
				
			input(div, opts);
			button(div, opts);
		}

		return landscapeScaleOption;
	};
	/*
	 	버튼 클릭 후 값이 변경될 때마다 호출되는 함수.
	 */
	landscapeScaleOption.change = function (callback)	{
		return callback(model), landscapeScaleOption;
	};

	return landscapeScaleOption;
}(landscapeScaleOption||{}));