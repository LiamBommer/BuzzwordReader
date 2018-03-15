$(document).ready(function() {

	var server_url = 'http://119.29.58.165:81/index.php/';
	// var server_url = 'http://127.0.0.1/BuzzwordReader/';
	$('.tabs').tabs();

	//搜索词条并反馈
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
						var html = "<a href='#' class='collection-item search-collection' id='contentid"
						+result[i].id_entry+"'>"+result[i].name+"</a>";
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

	// 点击相应词条并显示释义
	$('body').on('click','a[id^="contentid"]',function(){
		var entry_id=$(this).attr('id');
		var id=entry_id.substring(9,entry_id.length);
		var entry_name=$(this).text();
    // 测试用
		alert(id+entry_name);

		$.ajax({
			type:'GET',
			url: server_url + 'Entry/search_inte/',
			timeout: 3000,
			async: true,
			dataType: 'json',
			data: {
				entry_id: id
			},

			success: function(result) {
				console.log(JSON.stringify(result));

				if(result.result == 'empty') {
					$('#meaning-not-found').show();
					return;
				}

				$('#entry-modal').show();
				$('#search-modal').hide();
				var most_like = 0;
				var top_meaning;
				var top_meaning_id;
				var top_meaning_source;
				var top_meaning_daytime;

				var like = result.like.filter(item => item.id_interpretation == result.inte[0].id_interpretation);
				alert(typeof like[0].like_total);

				// for(i in result.inte) {
				// 	var like = result.like.filter(item => item.id_interpretation == result.inte[0].id_interpretation);
        //   if(like[0].like_total >= most_like){
				// 		most_like = like[0].like_total;
				// 		top_meaning = result.inte[0].interpretation;
				// 		top_meaning_id = result.inte[0].id_interpretation;
				// 		top_meaning_source = result.inte[0].resource;
				// 		top_meaning_daytime = result.inte[0].datetime;
				// 	}
				// }

				// 置顶释义显示
				// $('#entry-heading').text(entry_name);
				// $('#entry-meaning').text(top_meaning);
				// $('#meaning-source').text(top_meaning_source);
				// $('#meaning-daytime').text(top_meaning_daytime);

        // 其他释义显示
				// var other_meaning;
				// var other_meaning_id;
				// var other_meaning_source;
				// var other_meaning_daytime;
				// for(i in result.inte) {
				// 	var like = result.like.filter(item => item.id_interpretation == result.inte[i].id_interpretation);
        //   if(like[0].like_total != most_like){
				// 		most_like = like[0].like_total;
				// 		other_meaning = result.inte[i].interpretation;
				// 		other_meaning_id = result.inte[i].id_interpretation;
				// 		other_meaning_source = result.inte[i].resource;
				// 		other_meaning_daytime = result.inte[i].datetime;
        //
				// 		var other="<li><div class='collapsible-header' id='collection-username'>"
				// 		+"<i class='material-icons'>account_circle</i>"+result.inte[i].id_user+"</div>"
				// 		+"<div class='collapsible-body'><span id='other-meaning-span'></span></div></li>";
				// 		$('#other-meaning-collection').append(other);
				// 	}
				// }

			},

			error: function(error) {
				alert('查询请求错误，请重试');
				console.log(JSON.stringify(error));
				// error display
				$('#top-meaning').html(error.responseText);
				return;
			},
			scriptCharset: 'utf-8'
		});

	});

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

	$('#good').click(function(){
	// 	var id_user = -1;
	// 	var id_inte = $('#id-inte-p').html();
  //
	// 	chrome.storage.sync.get({
	// 		BW_userId: -1
	// 	},
	// 	function(items) {
	// 		id_user = items.BW_userId;
	// 		// validate
	// 		if(id_user == -1 || id_inte == null) {
	// 			alert('Cannot get correct user ID.')
	// 			return;
	// 		}
  //
	// 		$.ajax({
	// 			type:'POST',
	// 			url: server_url + 'Entry/like/',
	// 			timeout: 5000,
	// 			async: true,
	// 			dataType: 'json',
	// 			data: {
	// 				id_user: id_user,
	// 				id_inte: id_inte
	// 			},
	// 			success: function(result) {
	// 				if(result.result == 'success') {
	// 					console.log(JSON.stringify(result));
	// 					alert('点赞成功！')
	// 				}
	// 				if(result.result == 'failure') {
	// 					alert('点赞失败!\n' + result.error_msg);
	// 				}
	// 			},
	// 			error: function(error) {
	// 				alert('ajax错误，请重试');
	// 				console.log(JSON.stringify(error));
	// 				$('#entry-modal').html(error.responseText);
	// 				return;
	// 			},
	// 			scriptCharset: 'utf-8'
	// 		});
  //
	// 	});
	});

});
