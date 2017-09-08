var survival = (function (survival)	{
	'use strict';

	var model = {};
	/*
		Survival 데이터 (case_id, months, status) 를 구하는 
		함수.
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

		util.loop(data, function (d, i)	{
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

		return {
			month: month,
			pure: pure,
			all: all,
		};
	};
	/*
		Tab 태그의 input 을 만드는 함수.
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
		Tab 태그의 라벨 즉, 탭의 제목을 그리는 함수.
	 */
	function tabLabel (id, name)	{
		var label = document.createElement('label');
				label.htmlFor = id + '_survival';
				label.innerHTML = name;

		return label;
	};
	/*
		선택된 탭의 내용이 들어갈 바탕 div 를 만드는 함수.
	 */
	function tabContent (id, content)	{
		var div = document.createElement('div');
				div.id = id;

		return div;
	};
	/*
		Survival 탭을 만드는 함수.
	 */
	function makeTab (target, tabNames)	{
		document.querySelector(target).innerHTML = '';

		var div = document.querySelector(target);

		for (var i = 0, l = tabNames.length; i < l; i++)	{
			var name = tabNames[i],
					id = tabNames[i].toLowerCase();

			div.appendChild(tabInput(id, i));
			div.appendChild(tabLabel(id, name));
		}

		for (var i = 0, l = tabNames.length; i < l; i++)	{
			var area = tabContent(tabNames[i].toLowerCase());

			area.appendChild(
				tabContent(tabNames[i].toLowerCase() + '_survival_curve'));
			area.appendChild(
				tabContent(tabNames[i].toLowerCase() + '_stat_table'))
			div.appendChild(area);
		}
	};

	return function (o)	{
		model.survivalData = getSurvivalData(o.data);

		makeTab(o.element, ['OS', 'DFS'])

		SurvivalTab.init(o.divisionData, model.survivalData.pure);

		return model;
	};
}(survival || {}));