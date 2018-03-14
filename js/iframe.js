// receive message function from parent window
// Here because it can't wait to receive message until
// the page is loaded
window.addEventListener('message', function(event) {
	if(event.data.act == 'search_content') {
		$('#search-entry-div').html(event.data.msg);
	}

}, false);


$(document).ready(function() {

	// init
	$('#search-entry-div').modal({
		// Modal can be dismissed by clicking outside of the modal
		dismissible: true,
		// callback for modal CLOSE
		complete: function() {
				// send back message
			window.parent.postMessage({
				act: 'close',
				msg: 'I got it!'
			}, '*');
		}
	});
	// default open
	$('#search-entry-div').modal('open');


	/*
	* 从background-script中获得查询结果的json字符串
	*/

	// var request = {"type": "search", "keyword": selected.toString() };
	// chrome.runtime.sendMessage(request, function(result) {
	// 	// 将结果写入框内
	//
	// 	// 若无词条内容，则写未找到		有内容则写入内容
	// 	if(result.total == 0) {
	//
	// 	} else {
	//
	// 	}
	// });

});
