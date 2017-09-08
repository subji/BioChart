'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('sizing', [], factory);
 	} else {
 		factory(sizing);
 	}
} (function ()	{
	var appendChilds = function (base, childs)	{
		for (var i = 0, l = childs.length; i < l; i++)	{
			base.appendChild($(childs[i].id)[0]);
		}
	}

	return {
		'createElement' : function (eleStr, tagName, base)	{
			var attrType = (/#+/).exec(eleStr) ? 'id' : 'class',
					attrStr  = eleStr.replace((/#|./), ''),
					element  = $('<' + tagName + '>');

					element.attr(attrType, attrStr);

					base.append(element);

			return element;
		},
		'setArea' 	: function (base, target, tagName)	{
			var element   = $(base) 													 					  			 ,
					offset    = element.offset()             				   							 ,
					pt 				= parseInt(element.css('padding-top'))   							 ,
					pl        = parseInt(element.css('padding-left'))  							 ,
					pr  			= parseInt(element.css('padding-right')) 							 ,
					pb 				= parseInt(element.css('padding-bottom'))							 ,
					width     = window.innerWidth  - (offset.left + pl + pr + 
										 (window.innerWidth  - (element.width() + offset.left))),
					height    = window.innerHeight - (offset.top  + pt + (pb || 10));
					
			this.container = $(target).length < 1 ? 
			this.createElement(target, tagName, element) : $(target);
			this.container.css('width' , width)
						 	 			.css('height', height)
						 	 			.css('padding', '10px');

			return this;
		},
		'setSize' 			: function (obj)	{
			this.width  = obj.width  || parseInt(this.container.css('width'));
			this.height = obj.height || parseInt(this.container.css('height')); 

			return this;
		},
		'setBase'				: function (id)	{
			var border  = 2,
					padding = 20;

			this.parent = document.getElementById(id);
			this.parent.style.width  = (this.width - padding)  + 'px';
			this.parent.style.height = (this.height - padding) + 'px';

			return this;
		},
		'setGrid'		 		: function (grids, rec)	{
			var width 	= this.width  - 20,
					height  = this.height - 20;

			if (rec)	{
				rec.type === 'row' ? width = rec.value : height = rec.value;
			}

			for (var i = 0, l = grids.length; i < l; i++)	{
				var grid    = grids[i],
						ratio   = grid.ratio * 0.01,
						type    = grid.type === 'row' ? 'width'  : 'height',
						untype  = grid.type === 'row' ? 'height' : 'width',
						value   = 0,
						unvalue = 0;

				if (grid.childs)	{
					if (grid.type === 'row')	{
						value = width * ratio;

						var div = document.createElement('div');
								div.style.cssFloat = 'left';
								div.style.width    = value  + 'px';
								div.style.height   = height + 'px';

						appendChilds(div, grid.childs);

						for (var i = 0, l = this.parent.childNodes.length; i < l; i++)	{
							var el = this.parent.childNodes[i];

							if (!el.id)	{
								el.parentNode.removeChild(el);
							}
						}

						// this.parent.childNodes.forEach(function (el)	{
						// 	if (!el.id)	{
						// 		el.parentNode.removeChild(el);
						// 	}
						// });
						
						this.parent.appendChild(div);
					} else {
						value = height * ratio;
						// column이 여러개 일 때, 나중에 추가해야 한다.
						// Childs 를 새로이 생성한 div에 넣어주기만 하면 될거 같다.
						// 굳이 float : left 를 할 필요는 없을 것 같다.
					}

					this.setGrid(grid.childs, { 'type': grid.type, 'value': value });
				} else {
					try {
						value   = grid.type === 'row' ?  width * ratio : height * ratio;
						unvalue = grid.type === 'row' ? height : width;

						if ($(grid.id).length < 1) {
							throw new Error('Not found element: "' + grid.id + '"');
						}	
						
						$(grid.id).css(type  , value)
											.css(untype, unvalue)
									 		.css(grid.style);

					} catch(err)	{
						console.info(err);
						// console.error(err);// replace undefined error ?
					}
				}
			}

			return this;
		},
	}
}));