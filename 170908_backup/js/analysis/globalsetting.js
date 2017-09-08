/*
  이 모듈은 Cohort Selection을 클릭할 때 마다 로드된다.
  따라서 이벤트 리스너가 로드되는 횟수만큼 바인딩된다.
  이를 막기 위하여 event.stopImmediatePropagation();를 모든 리스너 상단에 기입한다.
 */
$(function() {
  // All Checkbox click event
  $('input[type=checkbox][name*="_all"]').click(function(event) {
    event.stopImmediatePropagation();
    // console.log(this.name, $(this).data('column-type'));
    if ($(this).data('column-type') === 'value') {
      //- All을 클릭하면, 하위 아이템을 모두 클리어해줌.
      if (this.checked) {
        getCBItemObject(this.name).prop('checked', false);
      }
    } else if ($(this).data('column-type') === 'range') {
      //- All을 클릭하면, From~To를 디폴트값(data-from, data-to)으로 설정한다.
      if (this.checked) {
        getRangeFromItemObject(this.name).val($(this).data('from'));
        getRangeToItemObject(this.name).val($(this).data('to'));
        getRangeItemObject(this.name).prop('disabled', true);
      }
    }
    getSubMessageObject(this.name).text('');
  });

  // Item Checkbox click event
  $('input[type=checkbox][name*="_item"]').click(function(event) {
    event.stopImmediatePropagation();
    // console.log(this.name);
    //- 하나라도 클릭하면, All을 클리어해준다.
    if (this.checked && getCBAllObject(this.name).prop('checked')) {
      getCBAllObject(this.name).prop('checked', false);
    }
    //- 모두 unchecked면 All를 checkd로 바꾼다.
    //- 즉 모두 uncheck 되어야 false임.
    var howManyChecked = $('input[type=checkbox][name=' + this.name.charAt(0) + '_item]:checked').length;
    // console.log('몇개 check여부:',howManyChecked);
    if (howManyChecked === 0) {
      getCBAllObject(this.name).prop('checked', true);
    }
    //- 클릭에 따라 몇개를 선택했는지 타이틀 오른쪽에 표시한다.
    var str = getCheckedString(getCBItemObject(this.name));
    getSubMessageObject(this.name).text(str);
  });

  $('#saveChanges').click(function(event) {
    event.stopImmediatePropagation();
    saveBGPublicSetting();
    //location.reload(true);
  });

  /**
   * Range 타입 값이 변경될 때 실행할 리스너(from,to 두가지가 있다).
   */
  $('input[type=number][name$=from]').change(function(event) {
    event.stopImmediatePropagation();
    // console.log('change event on ', this);
    getCBAllObject(this.name).prop('checked', false);
    setSubMessageForRange(this.name);
  });

  /**
   * Range 타입 값이 변경될 때 실행할 리스너(from,to 두가지가 있다).
   */
  $('input[type=number][name$=to]').change(function(event) {
    event.stopImmediatePropagation();
    // console.log('change event on ', this);
    getCBAllObject(this.name).prop('checked', false);
    setSubMessageForRange(this.name);
  });

  /**
   * 오른쪽에 사용자가 몇개를 선택했는지 보여준다.
   * @param  {[string]} name [subtype_id]
   */
  var setSubMessageForRange = function(name) {
    var item_from = getRangeFromItemObject(name).val();
    var item_to = getRangeToItemObject(name).val();
    getSubMessageObject(name).text(item_from + ' ~ ' + item_to);
  };
  //
  // var resetAll = function() {
  //   $('input[type=checkbox][name*="_all"]').prop('checked', true);
  //   $('input[type=checkbox][name*="_item"]').prop('checked', false);
  // };

  var getCBAllObject = function(name) {
    if (name === undefined) return null;
    return $('input[type=checkbox][name=' + name.charAt(0) + '_all]');
  };

  var getCBItemObject = function(name) {
    if (name === undefined) return null;
    return $('input[type=checkbox][name=' + name.charAt(0) + '_item]');
  };

  var getRangeItemObject = function(name) {
    if (name === undefined) return null;
    return $('input[type=number][name^=' + name.charAt(0));
  };

  var getRangeFromItemObject = function(name) {
    if (name === undefined) return null;
    return $('input[type=number][name=' + name.charAt(0) + '_from]');
  };

  var getRangeToItemObject = function(name) {
    if (name === undefined) return null;
    return $('input[type=number][name=' + name.charAt(0) + '_to]');
  };

  var getSubMessageObject = function(name) {
    if (name === undefined) return null;
    return $('#sub_message_' + name.charAt(0));
  };

  var getCheckedString = function(obj) {
    var total = 0;
    var checked = 0;
    //.each(function(_idx,_data){
    obj.each(function(_idx, _data) {
      total++;
      if (_data.checked) checked++;
    });
    if (checked === 0) return '';
    return checked + '/' + total;
  };

  var saveBGPublicSetting = function() {
    try {
      // 1.Checked Item column_type = 'value'
      var checkeditems = [];
      $('input[type=checkbox][name*="_item"]:checked').each(function(_idx, _data) {
        // console.log(_idx,_data.value);
        checkeditems.push(_data.value);
      });
      // console.log(checkeditems.join(','));

      // Cohort Source 저장
      var cohort_source = $('#cohortSource').val();
      cohort.setCohortSource(cohort_source);
      // console.log('cohort_source on saveBGPublicSetting', cohort_source);

      // Value Filter Option을 저장
      cohort.setFilterValueOption(checkeditems);

      // 2.Range Item column_type = 'range'
      var rangeditems = [];
      $('input[type=checkbox][data-column-type=range][name*="_all"]:not(:checked)').each(function(_idx, _data) {
        var id = this.name.charAt(0);
        var item_from = getRangeFromItemObject(_data.name).val();
        var item_to = getRangeToItemObject(_data.name).val();
        console.log('_data', _data.name, item_from, item_to);
        // Number 타입 체크
        if (isNaN(item_from) || item_from === '') throw new Error('Invalid Number!');
        if (isNaN(item_to) || item_to === '') throw new Error('Invalid Number!');
        rangeditems.push(id + '-' + item_from + '-' + item_to);
      });
      // Range Filter Option을 저장
      cohort.setFilterRangeOption(rangeditems);
      // console.log('source', cohort.getCohortSource());
      // console.log('options', cohort.getFilterOption());
      $.ajax({
          method: "GET",
          url: "/models/cohort/filter",
          data: {
            source: cohort_source,
            cancer_type: $('#cancer_type').val(),
            filter_option: cohort.getFilterOption(),
          }
        })
        .done(function(data) {
          // console.log('done', data);
          cohort.save(cohort_source, data.total, data.cnt);
          location.reload(true); // 좌상단 화면 갱신까지 해줌.
        })
        .fail(function(data) {
          // console.log('fail', data);
          throw new Error('Server Error:' + data);
        });
    } catch (err) {
      alert(err.message);
    }
  };

  var init = function() {
    // 1.Checked Item column_type = 'value'
    var valueOptions = cohort.getFilterValueOption();
    // console.log('valueOptions', valueOptions);
    valueOptions.forEach(function(value) {
      var obj = $('input[type=checkbox][value="' + value + '"]');
      var name = obj.prop('name');
      getCBAllObject(name).prop('checked', false);
      obj.prop('checked', true);
      // //
      var str = getCheckedString(getCBItemObject(name));
      getSubMessageObject(name).text(str);
    });
    // 2.Range Item column_type = 'range'
    var rangeOptions = cohort.getFilterRangeOption();
    // console.log('rangeOptions', rangeOptions);
    rangeOptions.forEach(function(range) {
      // range에는 subtype_id-MIN value-MAX value 로 구성되어 있다
      var items = range.split('-');
      // console.log(items);
      getCBAllObject(items[0]).prop('checked', false);
      getRangeItemObject(items[0]).prop('disabled', false);
      getRangeFromItemObject(items[0]).val(items[1]);
      getRangeToItemObject(items[0]).val(items[2]);

      getSubMessageObject(items[0]).text(items[1] + ' ~ ' + items[2]);
    });

    //첫번째 선택지 Open
    $('#collapse_a').addClass('in');
  };
  // console.log('globalsetting.js : reloading');
  // resetAll();
  init();

});
