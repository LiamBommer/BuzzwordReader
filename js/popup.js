$(document).ready(function() {

	// var server_url = 'http://119.29.58.165:81/index.php/';
	var server_url = 'http://127.0.0.1/BuzzwordReader/';

	$(window).keyup(function(e){
		if( e.which == 13){
			$("#entry-modal").show();
			$("#search-modal").hide();
		}
	})


});
