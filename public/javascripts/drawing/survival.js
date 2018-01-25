function survival ()	{
	'use strict';

	var model = {};
	/*
		Survival data (id, months, status) 반환 함수.
	 */
	function getSurvivalData (data)	{
		var month = {os: [], dfs: []},
				pure = {os: [], dfs: []},
				all = {os: [], dfs: []};

		function forPatient (id, month, status, array)	{
			var obj = {};

			obj[id] = {
				case_id: id,
				months: month,
				status: status,
			};

			array.push(obj);
		};

		bio.iteration.loop(data, function (d)	{
			if (d)	{
				var osm = (d.os_days / 30),
						dfsm = (d.dfs_days / 30);

				month.os.push(osm);
				month.dfs.push(dfsm);

				if (!(osm == null || d.os_status == null))	{
					forPatient(d.participant_id, osm, d.os_status, pure.os);
				}

				if (!(dfsm == null || d.dfs_status == null))	{
					forPatient(d.participant_id, dfsm, d.dfs_status, pure.dfs);
				}

				forPatient(d.participant_id, osm, d.os_status, all.os);
				forPatient(d.participant_id, dfsm, d.dfs_status, all.dfs);
			}
		});

		return { month: month, pure: pure, all: all };
	};
	/*
		Tab 의 input 을 만드는 함수.
	 */
	function tabInput (id, idx)	{
		var input = document.createElement('input');

		input.id = id + '_survival';
		input.name = 'tabs';
		input.type = 'radio';
		input.checked = idx === 0 ? true : false;

		return input;
	};
	/*
		Tab 의 제목을 그린다.
	 */
	function tabLabel (id, name)	{
		var label = document.createElement('label');

		label.htmlFor = id + '_survival';
		label.innerHTML = name;

		return label;
	};
	/*
		선택 된 Tab 의 내용이 들어갈 div 를 만든다.
	 */
	function tabContent (id, content)	{
		var div = document.createElement('div');

		return div.id = id, div;
	};
	/*
		Survival tab ui 만드는 함수.
	 */
	function makeTab (element, tabs)	{
		document.querySelector(element).innerHTML = '';

		var div = document.querySelector(element);

		for (var i = 0, l = tabs.length; i < l; i++)	{
			var name = tabs[i],
					id = tabs[i].toLowerCase();

			div.appendChild(tabInput(id, i));
			div.appendChild(tabLabel(id, name));
		}

		for (var i = 0, l = tabs.length; i < l; i++)	{
			var area = tabContent(tabs[i].toLowerCase());

			area.appendChild(
				tabContent(tabs[i].toLowerCase() + '_survival_curve'));
			area.appendChild(
				tabContent(tabs[i].toLowerCase() + '_stat_table'))
			div.appendChild(area);
		}
	};

	return function (opts)	{
		model.survival_data = getSurvivalData(opts.data);

		makeTab(opts.element, ['OS', 'DFS']);

		SurvivalCurveBroilerPlate.subGroupSettings.legend = {
			low: opts.legends.low.text, high: opts.legends.high.text,
		};
		SurvivalCurveBroilerPlate.subGroupSettings.line_color = {
			low: opts.legends.low.color, high: opts.legends.high.color
		};

		SurvivalTab.init(opts.division, model.survival_data.pure);

		return model;
	};
};