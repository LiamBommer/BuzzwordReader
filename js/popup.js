$(document).ready(function() {

	var server_url = 'http://119.29.58.165:81/index.php/';
	// var server_url = 'http://127.0.0.1/BuzzwordReader/';
	$('.tabs').tabs();

	document.getElementById('search').onsearch=function(event){
		var entry_content = $('#search').val();
		if( entry_content == null || entry_content == '' ){
			alert('不能为空！');
			return;
		}

		else{

			$.ajax({
				type:'GET',
				url: server_url + 'Entry/search_entry/',
				timeout: 3000,
				async: true,
				dataType: 'json',
				data: {
					search_content: entry_content
				},

				success: function(result) {
					console.log(JSON.stringify(result));
					if(result.result == 'empty') {
						$('#search-result-div').append("<br/><h6>没有相关结果</h6>");
						return;
					}

					for(i in result) {
						var html = "<div class='col l4 m6 s12'>" +
						"<div class='card z-depth-2'>" +
						"<div class='card-content'>" +
						"<a class='modal-trigger' href='#entry-modal'>" +
						"<span class='card-title'>"+result[i].name+"</span>" +
						"</a>" +
						"<p>"+result[i].id_entry+"</p>" +
						"<p>是否已开放: "+result[i].is_open+"</p>" +
						"<p>请求次数: "+result[i].request+"</p>" +
						"<p>创建时间: "+result[i].datetime+"</p>";
						html += "</div>" +
						"</div>" +
						"</div>";
						$('#search-result-div').append(html);
					}
				},

				error: function(error) {
					alert('查询请求错误，请重试');
					console.log(JSON.stringify(error));
					// error display
					$('#search-result-div').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

      // 测试用
			// alert(entry_content);

			$("#entry-modal").show();
			$("#search-modal").hide();
		}
	};

	$('#login-btn').click(function(){
		chrome.tabs.create({url: '/options-page/options.html'});
		$('#signup-modal').open();
	});

	$('#signup-btn').click(function(){
		window.open(chrome.extension.getURL('/options-page/options.html'));
	});

	$('#return-search').click(function(){
		$("#search-modal").show();
		$("#entry-modal").hide();
	});

	$('#add-meaning').click(function(){
		window.open(chrome.extension.getURL('/options-page/options.html'));
	});

});
