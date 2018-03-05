$(document).ready(function() {

	// var server_url = 'http://116.57.53.135/BuzzwordReader/';
	var server_url = 'http://127.0.0.1/BuzzwordReader/';

	$(window).keyup(function(e){
		if( e.which == 13){
			$("#entry-modal").show();
			$("#search-modal").hide();
		}
	})


});
