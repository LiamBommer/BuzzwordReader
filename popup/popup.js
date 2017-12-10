$(document).ready(function() {

	var server_url = 'http://116.57.53.135/BuzzwordReader/';
	// var server_url = 'http://127.0.0.1/BuzzwordReader/';


	/*
	 * 登录页面提交按钮事件
	 */
	$('#submit-btn').click(function() {

		$.ajax({
			type:'POST',
			url: server_url + 'User/login',
			timeout: 5000,
			// 同步进行
			async: false,
			dataType: 'json',
			data: {
				email: $('#email').val(),
				password: $('#password').val()
			},
			success: function(result) {
				if(result.result == 'success') {
					alert('Welcome back! ');
					// chrome.browserAction.setPopup({
					// 	popup: '/popup/popup.html'
					// });
				}
				if(result.result == 'failure') {
					alert('Wrong password or email!');
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log('Ajax Error' +
					'\nXMLHttpRequest status: ' + XMLHttpRequest.status +
					'\nXMLHttpRequest readyState: ' + XMLHttpRequest.readyState +
					'\ntextStatus' + textStatus);
				alert('可能由于网络问题，登录失败，请重试');
				return;
			},
			scriptCharset: 'utf-8'
		});

	});


	/*
	 * 搜索框表单提交事件
	 */
	$('#search-form').on('submit', function() {

		var search_content = $('#search').val();

		// ajax查询
		$.ajax({
			type: 'GET',
			url: server_url + 'Popup/search/' + search_content,
			dataType: 'json',
			success: function(result) {
				// 删除原来的结果
				$('.result-div').empty();
				// 添加结果
				if(result.total == 0) {
					$('.result-div').append('<p>未找到结果</p>');
				} else {
					for(row in result.entry_name) {
						var content_html = '<div class="chip">'+result.entry_name[row]+'</div>';
						$('.result-div').append(content_html);
					}
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert('Ajax Error' +
					'\nXMLHttpRequest status: ' + XMLHttpRequest.status +
					'\nXMLHttpRequest readyState: ' + XMLHttpRequest.readyState +
					'\ntextStatus' + textStatus);
				return;
			},
			scriptCharset: 'utf-8'
		});


		// 阻止表单提交
		return false;
	});

});
