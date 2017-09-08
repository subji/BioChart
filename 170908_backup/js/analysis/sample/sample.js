$(document).ready(function() {
  $('#historyModal').on('show.bs.modal', function(event) {
    var obj = $(event.relatedTarget);
    var id = $('#sampleid').text();
    var list = obj.data('json');
    var title = obj.data('title');
    var type = obj.data('type');
    var tissue = obj.data('tissue');
    $('#historyModalLabel').text(title + ' History ').append($('<small>').text(id + ' (' + type + ' / ' + tissue + ')'));
    var modal = $(this);
    var tbody = $('#historyTable tbody');
    tbody.empty();
    list.forEach(function(item) {
      console.log(item);
      tbody.append($('<tr>')
        .append($('<td>').text(item.seq_no))
        .append($('<td>').text(item.status_short))
        .append($('<td>').text(item.modify_user))
        .append($('<td>').text(item.modify_date))
        .append($('<td>').text(item.message))
      );
    });
  });
});
