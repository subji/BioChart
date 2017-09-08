'use strict';

var browserCheck = (function (browserCheck)	{
	var ua = navigator.userAgent,
			versions = {
				'IE': 11,
				'Edge': 14,
				'Chrome': 58,
				'Firefox': 52,
				'Safari': 10,
			},
			tem,
			m = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

	if (/trident/i.test(m[1]))	{
		tem = /\brv[ :]+(\d+)/g.exec(ua) || [];

		if (tem[2] < versions[tem[1]])	{
			alert('Update ' + tem[1] + ' version');
		}
	}

	if (m[1] === 'Chrome')	{
		tem = ua.match(/\b(OPR|Edge)\/(\d+)/);

		if (tem != null)	{
			console.log(tem)
			if (tem[2] < versions[tem[1]])	{
				alert('Updata ' + tem[1] + ' version');	
			}
		}

		m = m[2] ? [m[1], m[2]] : [navigator.appName, navigator.appVersion, '-?'];

		if ((tem = ua.match(/version\/(\d+)/i)) != null)	{
			m.splice(1, 1, tem[1]);
		}

		if (m[1] < versions[m[0]])	{
			alert('Update ' + m[0] + ' version');
		}
	}
}(browserCheck || {}));