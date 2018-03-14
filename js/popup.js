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

					$('#result-collection').html('');

					if(result.result == 'empty') {
						$('#result-not-found').show();
						return;
					}

					if($('#result-not-found').css('display') != 'none'){
						$('#result-not-found').hide();
					}

					for(i in result) {
						var html = "<a href='#' class='collection-item' id='entry_no"+i+"'>"+result[i].name+"</a>";
						$('#result-collection').append(html);
					}
					$('#result-collection').show();

				},

				error: function(error) {
					alert('查询请求错误，请重试');
					console.log(JSON.stringify(error));
					// error display
					$('.section').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

      // 测试用
			// alert(entry_content);
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
