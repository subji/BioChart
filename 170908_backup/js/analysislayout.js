$(document).ready(function() {
  //- 최초 페이지 로딩 시, 사용자가 클릭한 메뉴를 표시한다.
  //- 아울러 클릭한 메뉴가 collapse 안에 들어 있는 메뉴인 경우 이를 펼쳐준다.
  var menu = $('ul.sidebar-nav').find('a[href="' + location.pathname + '"]');
  //menu.closest('li').addClass('side-menu-active');//작동 안하는 이유가 뭘까?
  menu.css('color', '#337AB7');
  if (location.pathname.match(/^\/menu\/population/)) {
    //- menu.closest('ul').collapse('show'); //슬라이딩이라서, 화면로딩시에는 시각적으로 훌륭하지 않다.
    menu.closest('ul').addClass('in');
  }
  //- 서브 메뉴가 여러개인 경우, 클릭한 이외의 것은 닫는다.
  $('[data-toggle=collapse]').click(function() {
    var clicked_id = $(this).attr('data-target');
    var list = $('.sidebar-nav ul');
    for (var i = 0; i < list.length; i++) {
      if (clicked_id != '#' + list[i].id) {
        $(list[i]).collapse('hide');
      }
    }
  });
  //- Global Setting
  //- $('#bg_public_data_menu_str').text(' ' + cohort.getMenuCountText());
  // cohort.setMenuCohortText($('#cohort_source_str'));
  cohort.setMenuCountText($('#cohort_cnt_str'));

  //- chhortModal를 클릭했을 때 페이지 로딩.
  $('#cohortModal').on('shown.bs.modal', function(e) {
    var cohort_source = cohort.getCohortSource();
    console.log('cohort_source', cohort_source);
    $('#modalContent').load('/menu/analysis/globalsetting?source=' + cohort_source, null, function(text, status) {
      $('#cohortSource').val(cohort_source);
    });
  });

  $('#cohortSource').change(function(event) {
    event.stopImmediatePropagation();
    console.log('cohortSource changed', $(this).val());
    // cohort.setCohortSource($(this).val());
    var cohort_source = $(this).val();
    $('#modalContent').empty().hide().load('/menu/analysis/globalsetting?source=' + cohort_source).show('slow');
  });
});
