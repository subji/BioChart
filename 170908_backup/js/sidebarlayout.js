$(document).ready(function() {
	// for performance, save selector.
	var sidebar = $('#sidebar');
	var seperator = $('#seperator');
	var maincontent = $('#maincontent');
	var seperatorbar = $('#seperatorbar');
	var directionmark = $('#directionmark');
	var directionicon = $('#directionicon');

	seperatorbar.mouseover(function(e) {
		directionmark.css('visibility', 'visible');
	});
	seperatorbar.mouseout(function(e) {
		directionmark.css('visibility', 'hidden');
	});
	/*
	 * when click 'seperator', toggle side-menu
	 */
	directionmark.click(function(e) {
		e.preventDefault();

		var pos = (sidebar.css('margin-left') === '0px') ? '-250px' : '0px';
		sidebar.animate({
			'margin-left': pos
		}, {
			duration: 400,
			step: function(now, fx) {
				var newMarginLeft = 250 + now;
				seperator.css('margin-left', newMarginLeft);
				maincontent.css('margin-left', newMarginLeft);
			},
			done: function(animation, jumpedToEnd) {
				directionicon.toggleClass('fa-chevron-left fa-chevron-right');
			}
		});
		//- $('.sidebar').toggle();
		//- $('.seperator').toggleClass('toggled',500,'easeOutSine');
		//- $('.maincontent').toggleClass('toggled',500,'easeOutSine');
	});
});
