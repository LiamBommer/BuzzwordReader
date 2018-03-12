$(document).ready(function() {

	// init
	$('#login-modal').modal({
		// Modal can be dismissed by clicking outside of the modal
		dismissible: true,
		// callback for modal close
		complete: function() {
				// send back message
			window.parent.postMessage({
				act: 'close',
				msg: 'I got it!'
			}, '*');
		}
	});

	// default open
	$('#login-modal').modal('open');

	// receive message
	// window.addEventListener('message', function(event) {
	//
	// }, false);


});
