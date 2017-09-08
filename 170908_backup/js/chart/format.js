'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('format', [], factory);
	} else {
		factory(format);
	}

} (function ()	{
  var upperToFirst = function (str) {
    return str.substring(0, 1).toUpperCase()
         + str.substring(1).toLowerCase();
  }

  var group = function (name, value)  {
    return {
      'Race'                                 : 1,
      'Histological type'                    : 1,
      'AJCC pathological tumor stage'        : 1,
      'Treatment outcome of primary therapy' : 1,
      'pathologic_pStage'                    : 1,
      'Age'                                  : 1,
      'Vital status'                         : {
        'alive' : 0, 'dead'   : 1 }[value],
      'gender'                               : {
        'F'     : 0, 'M'      : 1 }[value],
      'Gender'                               : {
        'male'  : 0, 'female' : 1 }[value],
      'Recurrence'                           : {
        'Yes'   : 0, 'No'     : 1 }[value],
      'Smoking'                              : {
        'YES'   : 0, 'No'     : 1 }[value],
      'death'                                : {
        'No'    : 0, 'Yes'    : 1, '알수없음' : 2 }[value],
      'ER status'                            : {
        'negative'      : 0, 'positive' : 1,
        'indeterminate' : 2 }[value],
      'PR status'                            : {
        'negative'      : 0, 'positive' : 1,
        'indeterminate' : 2 }[value],
      'HER2/neu status'                      : {
        'negative'  : 0, 'positive'      : 1,
        'equivocal' : 2, 'indeterminate' : 3 }[value],
      'Smoking history'              : {
        'Lifelong Non-Smoker' : 0, 'Current Smoker'       : 1,
        'Current Reformed Smoker for > 15 yrs'            : 2, 
        'Current Reformed Smoker for < or = 15 yrs'       : 3,
        'Current Reformed Smoker, Duration Not Specified' : 4 }[value],
    }[name];
  }

  var variants = function (val) {
    return {
      '2'       : 'CNV'     , '0'   : 'Somatic',
      'Somatic' : 'Somatic' , 'CNV' : 'CNV'
    }[val];
  }

  var mut = function (val)  {
    var repval = val.replace((/(_ins|_del)$/ig), '_indel');
    var name   = upperToFirst(repval);
    var result = {};

     switch (name) {
      case 'Amplification'          :
      result = { 'name' : name, 'color' : '#FFBDE0', 'idx' : 2, 'order' : 12 }; break;
      case 'Homozygous_deletion'    :
      result = { 'name' : name, 'color' : '#BDE0FF', 'idx' : 2, 'order' : 11 }; break;
      case 'Nonsense_mutation'      :
      result = { 'name' : name, 'color' : '#EA3B29', 'idx' : 0, 'order' : 10 }; break;
      case 'Splice_site'            :
      result = { 'name' : name, 'color' : '#800080', 'idx' : 0, 'order' : 9  }; break;
      case 'Translation_Start_Site' :
      result = { 'name' : name, 'color' : '#aaa8aa', 'idx' : 0, 'order' : 8  }; break;
      case 'Missense_mutation'      :
      result = { 'name' : name, 'color' : '#3E87C2', 'idx' : 0, 'order' : 7  }; break;
      case 'Start_codon_snp'        :
      result = { 'name' : name, 'color' : '#3E87C2', 'idx' : 0, 'order' : 7  }; break;
      case 'Nonstop_mutation'       :
      result = { 'name' : name, 'color' : '#070078', 'idx' : 0, 'order' : 6  }; break;
      case 'Frame_shift_indel'      : 
      result = { 'name' : name, 'color' : '#F68D3B', 'idx' : 0, 'order' : 5  }; break;
      case 'Stop_codon_indel'       :
      result = { 'name' : name, 'color' : '#F68D3B', 'idx' : 0, 'order' : 5  }; break;
      case 'In_frame_indel'         :
      result = { 'name' : name, 'color' : '#F2EE7E', 'idx' : 0, 'order' : 4  }; break;
      case 'Intron'                 :
      result = { 'name' : name, 'color' : '#A9A9A9', 'idx' : 0, 'order' : 1  }; break;
      case '5\'utr'                 :
      result = { 'name' : name, 'color' : '#A9A9A9', 'idx' : 0, 'order' : 1  }; break;
      case '3\'utr'                 :
      result = { 'name' : name, 'color' : '#A9A9A9', 'idx' : 0, 'order' : 1  }; break;
      case 'Igr'                    :
      result = { 'name' : name, 'color' : '#A9A9A9', 'idx' : 0, 'order' : 1  }; break;
      case 'Rna'                    :
      result = { 'name' : name, 'color' : '#ffdf97', 'idx' : 0, 'order' : 2  }; break;
      case 'Silent'                 :
      result = { 'name' : name, 'color' : '#5CB755', 'idx' : 0, 'order' : 3  }; break;
    }

    result.name = name;

    return result;
  }

  var exp = function (data, value) {
    var colorSet = [
      '#FF0000', '#FF7F00', '#FFFF00', '#00FF00',
      '#0000FF', '#4B0082', '#8B00FF'
    ];
    var result   = {}, turn = 0;

    data.forEach(function (d, i) {
      i === 0 ? turn = 0 : i % (colorSet.length - 1) === 0 
              ? turn += (colorSet.length - 1) : turn = turn; 

      result[data[i]] = colorGenerator(colorSet[(i - turn)], data)[data[i]];
    });

    if (!!result[value]) {
      return result[value].color;
    }
  }

  var makeGroupData = function (data) {
    var groupLength  = data.group_list.length;
    var defaultGroup = {}, result = [];
    var turn         = 0;
    var colorSet     = [ 
      '#E65100', '#1A237E', '#BF360C', '#1DE9B6', 
      '#3E2723', '#00C853', '#F50057',
    ];

    data.group_list.forEach(function (d, i) {
      var gItem = groupItemObj(d);

      i === 0 ? turn = 0 : i % (colorSet.length - 1) === 0 
              ? turn += (colorSet.length - 1) : turn = turn; 


      defaultGroup[d.name] = colorGenerator(colorSet[(i - turn)], gItem, d.name);
      
      data.default_group_setting = defaultGroup;

      setGroupProp(d, defaultGroup[d.name]);
    });
  }

  var colorGenerator = function (color, data, name) {
    var turn     = 0;
    var keys     = data.constructor === Object 
                 ? Object.keys(data) : data;
    var rgb      = d3.rgb(color);
    var colorSet = [
      '#D5DDDD', '#FF0000', '#FF7F00', '#FFFF00', 
      '#00FF00', '#0000FF', '#4B0082', '#8B00FF'
    ];
    var result  = {};

    for (var i = 0; i < keys.length; i++)  {
      var col, order, key  = keys[i];

      i === 0 ? turn = 0 : i % (colorSet.length - 1) === 0 
              ? turn += (colorSet.length - 1) : turn = turn;

      if (i % 3 === 0) {
        col = mixColor(col || color, (i % 6));        
      } else if (i % 3 === 1)  {
        col = complementaryColor(col || color);
      } else if (i % 3 === 2)  {
        col = shakeColor((col || color)
            , colorSet[(i - turn)], (i - turn) + 1);
      }

      result[key] = { 'order' : i, 'color' : key === 'NA' ? colorSet[0] : col };
    }

    return result;
  }
  // 보색 함수
  var complementaryColor = function (color)  {
    var rgb   = d3.rgb(color);
        rgb.r = 255 - rgb.r;
        rgb.g = 255 - rgb.g;
        rgb.b = 255 - rgb.b;

    return rgb.toString();
  }

  var mixColor            = function (color, num)  {
    var rgb = d3.rgb(color);
    var res = d3.rgb();

    if (num === 0)  {
      res.r = rgb.b;
      res.g = rgb.r;
      res.b = rgb.g;
      
    } else if (num === 1) {
      res.r = rgb.g;
      res.g = rgb.b;
      res.b = rgb.r;
    } else if (num === 2) {
      res.r = rgb.r;
      res.g = rgb.b;
      res.b = rgb.g;
    } else if (num === 3) {
      res.r = rgb.b;
      res.g = rgb.g;
      res.b = rgb.r;
    } else if (num === 4) {
      res.r = rgb.g;
      res.g = rgb.r;
      res.b = rgb.b;
    } else {
      res.r = rgb.r;
      res.g = rgb.g;
      res.b = rgb.b;
    }

    return res.toString();
  }
  // 두가지 색을 섞는 함수. (앞 또는 뒤에 NA 값이 있을 경우 NA 값이 아닌값을 반대 값으로 반환한다.)
  var shakeColor = function (aColor, bColor, num)  {
    var num = num || 1;

    if (aColor === '#d5dddd') {
      return complementaryColor(d3.rgb(bColor));
    } else if (bColor === '#d5dddd')  {
      return complementaryColor(d3.rgb(aColor));
    } else {
      var rgb   = d3.rgb(), argb = d3.rgb(aColor), brgb = d3.rgb(bColor);
          rgb.r = Math.floor(255 - Math.sqrt((Math.pow((255 - argb.r), 2) 
                + Math.pow((255 - brgb.r), 2)) / 2));
          rgb.g = Math.floor(255 - Math.sqrt((Math.pow((255 - argb.g), 2) 
                + Math.pow((255 - brgb.g), 2)) / 2));
          rgb.b = Math.floor(255 - Math.sqrt((Math.pow((255 - argb.b), 2) 
                + Math.pow((255 - brgb.b), 2)) / 2));

      return mixColor(rgb.toString(), num);
    }
  }

  var groupItemObj = function (data)  {
    var result = {};

    data.data.forEach(function (d) {
      result[d.value] = '';
    });

    return result;
  }

  var setGroupProp = function (data, obj)  {
    data.data.forEach(function (d)  {
      var dd = obj[d.value];

      d.color = dd.color;
      d.order = 0;
    });
  }

	return function () {
    return {
      'gr'            : group        ,
      'mut'           : mut          ,
      'exp'           : exp          ,
      'variants'      : variants     ,
      'makeGroupData' : makeGroupData,
    }
  }
}));