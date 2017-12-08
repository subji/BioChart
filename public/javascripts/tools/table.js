function table ()	{
	'use strict';

	var model = { cellData: [], cellWidth: [] };

	function makeTable (width, height)	{
		var tb = document.createElement('div');

		tb.className = 'table-frame';
		tb.style.width = width + 'px';
		tb.style.height = height + 'px';

		return tb;
	};

	function caption (text)	{
		var capt = document.createElement('div');

		capt.innerHTML = text || '';
		capt.className = 'table-caption';
		capt.style.display = 'table-caption';

		return capt;
	};

	function rows (id)	{
		var row = document.createElement('div');

		row.id = id || '';
		row.className = 'table-row';
		row.style.display = 'table-row';

		return row;
	};

	function cells (text, width, height)	{
		var cell = document.createElement('div');

		cell.className = 'table-cell ' + text.removeWhiteSpace();
		cell.style.padding = '5px';
		cell.style.width = width + 'px';
		cell.style.height = (height || 35) + 'px';
		cell.style.lineHeight = (height || 25) + 'px';
		cell.style.display = 'table-cell';
		cell.innerHTML = text;

		return cell;
	};

	function getWidth (text)	{
		var div = document.createElement('div'),
				txt = text.indexOf('<') > -1 ? 
					 		text.substring(0, text.indexOf('<')) : text,
				width = 0;

		div.id = 'temp_width';
		div.style.fontSize = '16px';
		div.style.fontWeight = 'bold';
		div.style.overflow = 'hidden';
		div.style.border = '1px solid';
		div.style.whiteSpace = 'nowrap';
		div.style.display = 'table-cell';
		div.style.textOverflow = 'ellipse';

		div.innerHTML = txt;

		document.body.appendChild(div);

		width = div.getBoundingClientRect().width;

		document.body.removeChild(
			document.querySelector('#temp_width'));

		return width + 12;
	};
	/*
		각 컬럼의 최대 크기를 구한다.
	 */
	function getColumnSize (heads, datas, callback)	{
		model.cellWidth.fill(heads.length, 0);

		bio.iteration.loop(heads, function (head, col)	{
			model.cellWidth[col] = getWidth(head);
		});

		bio.iteration.loop(datas, function (data, row)	{
			var temp = [];

			bio.iteration.loop(heads, function (head, col)	{
				var cols = callback(col, row, head, data);

				model.cellWidth[col] = 
				model.cellWidth[col] > getWidth(cols) ? 
				model.cellWidth[col] : getWidth(cols);

				temp.push(cols);
			});

			model.cellData.push(temp);
		});
		// 최상위 div 가 table 이 아니므로 크기를 설정해준다.
		var width = 0;

		bio.iteration.loop(model.cellWidth, function (cell)	{
			width += cell;
		});

		model.frame.style.width = (width + 20) + 'px';
	};

	function makeHeads (frame, list)	{
		var div = document.createElement('div'),
				header = rows();

		div.className = 'table-header';

		bio.iteration.loop(list, function (l, i)	{
			header.appendChild(cells(l, model.cellWidth[i]));
		});

		div.appendChild(header);
		frame.appendChild(div);

		return header;
	}

	function makeContents (frame, cellDatas, opts)	{
		var div = document.createElement('div');

		div.className = 'table-contents';
		div.style.height = opts.height + 'px';

		bio.iteration.loop(cellDatas, function (cell)	{
			var row = rows();

			bio.iteration.loop(cell, function (c, i)	{
				row.appendChild(cells(c, model.cellWidth[i]));
			});
			
			div.appendChild(row);
		});

		if (opts.data.length < 1)	{
			return div;
		} else {
			frame.appendChild(div);			
		}
	};

	return function (opts)	{
		if (document.querySelector('.table-frame'))	{
			opts.element.removeChild(
				document.querySelector('.table-frame'));
		}

		if (!opts.columns)	throw new Error('Not found Columns');
		model = { cellData: [], cellWidth: [] };
		
		model.element = opts.element;
		model.width = opts.width || 0;
		model.height = opts.height || 0;

		model.frame = makeTable(model.width, model.height);

		getColumnSize(opts.heads, opts.data, opts.columns);

		model.frame.appendChild(caption(opts.title));
		makeHeads(model.frame, opts.heads);
		makeContents(model.frame, model.cellData, opts);

		model.element.appendChild(model.frame);
	};
};