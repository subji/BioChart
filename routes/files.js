var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var glob = require('glob');

router.get('/', function (req, res, next)	{
	res.render('index');
})
/* GET home page. */
router.post('/datas', function(req, res, next) {
	var chart = req.body.name;
	var url = 'D:\\subji\\BioChart/public/datas';
	// glob 는 파일 또는 디렉토리를 찾을때 패턴 또는 와일드카드를 사용
	// 할 수 있게 도와주는 모듈이다.
	glob(url + '/' + chart + '*', function (err, files)	{
		var sendSet = [];

		console.log(files)
		files.forEach(function (file)	{
			var fileData = fs.readFileSync(file, 'utf8');
			
			file.indexOf('json') > - 1 ? 
			sendSet.push(JSON.parse(fileData)) : 
			sendSet.push(fileData);
		});

		res.send(sendSet);
	});
});

module.exports = router;
