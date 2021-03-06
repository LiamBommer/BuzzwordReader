$(document).ready(function() {

	var server_url = 'http://119.29.58.165:81/index.php/';
	// var server_url = 'http://127.0.0.1/BuzzwordReader/';

	$('.tabs').tabs();

	// 判断用户是否已经登录，获取权限
	chrome.storage.sync.get({
		BW_username: 'unknown'
	},
	function(items) {
		name_user = items.BW_username;

		// validate
		if(name_user == 'unknown') {
			$('#username').hide();
			$('#login-btn').show();
			$('#login-btn').text('登录');
			$('#signup-btn').show();
			$('#signup-btn').text('注册');
			return;
		}

		else{
			$('#username').show();
			$('#username').text(name_user);
			$('#login-btn').hide();
			$('#signup-btn').hide();
		}
	});

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

	// 点击相应词条并显示置顶释义和其他释义
	$('body').on('click','a[id^="contentid"]',function(){
		$('#other-meaning-collection').empty();
		var entry_id=$(this).attr('id');
		var id=entry_id.substring(9,entry_id.length);
		var entry_name=$(this).text();

    // 测试用
		// alert(id+entry_name);

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

				if(JSON.stringify(result.inte) === '[]'|| result.inte.length === 0) {
					$('#meaning-not-found').show();
					$('#entry-heading-none').text(entry_name);
					$('#entry-heading-none').attr('id',"entry-heading-none"+id);
					$('#search-modal').hide();
					return;
				}

				$('#entry-modal').show();
				$('#search-modal').hide();
				var most_like = 0;
				var top_meaning;
				var top_meaning_id; // 做标记显示其他释义
				var top_meaning_source;
				var top_meaning_daytime;
				top_meaning = result.inte[0].interpretation;
				top_meaning_id = result.inte[0].id_interpretation;
				top_meaning_source = result.inte[0].resource;
				top_meaning_daytime = result.inte[0].datetime;

				for(i in result.inte) {
					var like = result.like.filter(item => item.id_interpretation == result.inte[i].id_interpretation);
					var like_total = 0;
					if(JSON.stringify(like) === '[]' || like.length === 0) {
						like_total = 0;
					} else {
						like_total = like[0].like_total;
					}

          if(like_total > most_like){
						most_like = like_total;
						top_meaning = result.inte[i].interpretation;
						top_meaning_id = result.inte[i].id_interpretation;
						top_meaning_source = result.inte[i].resource;
						top_meaning_daytime = result.inte[i].datetime;
					}
				}

				// 置顶释义显示
				$('#entry-heading').text(entry_name);
				$('#entry-heading').attr("id",'entry-heading-number'+id);
				$('#entry-meaning').text(top_meaning);
				$('#meaning-source').text("来源："+top_meaning_source);
				$('#meaning-daytime').text("创建时间："+top_meaning_daytime);
				$('#entry-meaning').attr("id","entry-meaning"+result.inte[0].id_interpretation);
				// alert($('#entry-meaning').attr());

        // 其他释义显示
				$('#entry-heading02').text(entry_name);

				// var other_meaning;
				// var other_meaning_id;
				// var other_meaning_source;
				// var other_meaning_daytime;

        // 排序
				var result_sort=new Array();
				for(i in result.inte) {
					var like = result.like.filter(item => item.id_interpretation == result.inte[i].id_interpretation);
					var like_total = 0;
					if(JSON.stringify(like) === '[]' || like.length === 0) {
						like_total = 0;
					}
					else {
						like_total = like[0].like_total;
					}

					if(result.inte[i].id_interpretation != top_meaning_id){
						var one_entry=new Object();
						one_entry.other_meaning_id = result.inte[i].id_interpretation;
						one_entry.other_meaning = result.inte[i].interpretation;
						one_entry.other_meaning_source = result.inte[i].resource;
						one_entry.other_meaning_daytime = result.inte[i].datetime;
						one_entry.like_total = like_total;
						result_sort.push(one_entry);
					}
				}

				result_sort.sort(function(a,b){
					return b.like_total-a.like_total;
				});
				console.log(JSON.stringify(result_sort));


        // 其他释义

				for(i in result_sort){
					other_meaning_id = result_sort[i].other_meaning_id;
					other_meaning = result_sort[i].other_meaning;
					other_meaning_source = result_sort[i].other_meaning_source;
					other_meaning_daytime = result_sort[i].other_meaning_daytime;
					like_total = result_sort[i].like_total;

					var other="<li><div class='collapsible-header' id='collection-username'>"
					+"<i class='material-icons'>account_circle</i>"+result.inte[i].id_user+"</div>"
					+"<div class='collapsible-body'><span id='other-meaning"+other_meaning_id+"'>"
					+other_meaning+"</span><br/><span class='other-meaning-source'>来源："+other_meaning_source
					+"</span><br/><span class='other-meaning-daytime'>添加时间："+other_meaning_daytime+"</span>"
					+"<div class='chip right'><a href='#' class='dislike' id='dislike"+other_meaning_id+"'>"
					+"<i class='small material-icons myclose'>"
					+"arrow_drop_down</i></a></div>"
					+"<div class='chip right'><a href='#' class='like' id='like-number"+other_meaning_id+"'>"
					+"<i class='small material-icons myclose'>arrow_drop_up</i>"
					+"<span class='like-number' id='"+other_meaning_id+"'>"+like_total+"</span></a></div>"
					+"</div></li>";
					$('#other-meaning-collection').append(other);
				}
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

  // 返回搜索框
	$('#return-search').click(function(){
		$("#search-modal").show();
		$("#entry-modal").hide();
	});

  // 返回搜索框
	$('#return-search02').click(function(){
		$('#search').val('');
		$("#search-modal").show();
		$("#meaning-not-found").hide();
	});

  // 点击添加释义按钮
	$('.add-meaning').click(function(){

		var url="options-page/options.html?";
		if($('#entry-modal').css('display') != "none"){
			var id = $('h1[id^=entry-heading-number]').attr('id');
			id = id.substring(20);
			url += encodeURI("action=addInte&id_entry="+id
			+"&name_entry="+$('h1[id^=entry-heading-number]').text());
		}

		else{
			var id = $('h1[id^=entry-heading-none]').attr('id');
			id = id.substring(18);
			url += encodeURI("action=addInte&id_entry="+id
			+"&name_entry="+$('h1[id^=entry-heading-none]').text());
		}
		window.open(chrome.runtime.getURL(url));
	});

  // 点击添加词条按钮
	$('.add-entry').click(function(){
		var url="options-page/options.html?";
		if($('#entry-modal').css('display') == "none"){
			url += encodeURI("action=addEntry&name_entry="+$('#search').val());
		}

		else{
			url += encodeURI("action=addEntry&name_entry=");
		}
		window.open(chrome.runtime.getURL(url));
	});

  // 点击举报按钮
	$('#report').click(function(){
		// window.open(chrome.extension.getURL('/options-page/options.html'));
	});

  // popup页面点赞功能
	$('#like').click(function(){
		var id_user = -1;
		var id_inte = $('p[id^="entry-meaning"]').attr("id");
		id_inte = id_inte.substring(13,id_inte.length);

		chrome.storage.sync.get({
			BW_userId: -1
		},
		function(items) {
			id_user = items.BW_userId;
			// validate
			if(id_user == -1 || id_inte == null) {
				console.log('Cannot get correct user ID.');
				alert('请先登录！');
				return;
			}

			$.ajax({
				type:'POST',
				url: server_url + 'Entry/like/',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					id_user: id_user,
					id_inte: id_inte
				},

				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						alert('点赞成功！')
					}
					if(result.result == 'failure') {
						alert('点赞失败!\n' + result.error_msg);
					}
				},

				error: function(error) {
					alert('ajax错误，请重试');
					console.log(JSON.stringify(error));
					$('#entry-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});

	});

	// popup页面点灭功能
	$('#dislike').click(function(){
		var id_user = -1;
		var id_inte = $('p[id^="entry-meaning"]').attr("id");
		id_inte = id_inte.substring(13,id_inte.length);

		chrome.storage.sync.get({
			BW_userId: -1
		},
		function(items) {
			id_user = items.BW_userId;
			// validate
			if(id_user == -1 || id_inte == null) {
				console.log('Cannot get correct user ID.');
				alert('请先登录！');
				return;
			}

			$.ajax({
				type:'POST',
				url: server_url + 'Entry/dislike/',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					id_user: id_user,
					id_inte: id_inte
				},

				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						alert('点灭成功！')
					}
					if(result.result == 'failure') {
						alert('点灭失败!\n' + result.error_msg);
					}
				},

				error: function(error) {
					alert('ajax错误，请重试');
					console.log(JSON.stringify(error));
					$('#entry-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});
	});

	$('body').on('click','.like',function(){
		var id_user = -1;
		var id_inte = $(this).attr("id");
		id_inte = id_inte.substring(11,id_inte.length);
		var son_node=$(this);
		var parent_node=$(this).parent();
		console.log(JSON.stringify(id_inte));

		chrome.storage.sync.get({
			BW_userId: -1
		},
		function(items) {
			id_user = items.BW_userId;
			// validate
			if(id_user == -1 || id_inte == null) {
				console.log('Cannot get correct user ID.');
				alert('请先登录！')
				return;
			}

			$.ajax({
				type:'POST',
				url: server_url + 'Entry/like/',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					id_user: id_user,
					id_inte: id_inte
				},

				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						// console.log(JSON.stringify(like_number));
						// $('#like_number').text(like_number);

						var id_entry = $('h1[id^=entry-heading-number]').attr('id');
						id_entry = id_entry.substring(20);
						$.get(server_url+'Entry/search_inte',
							{entry_id: id_entry}, function(result) {
								//更新点赞数组
								var like_total = 0;
								for(i in result.inte) {
				          if(result.inte[i].id_interpretation == id_inte){
										var like = result.like.filter(item => item.id_interpretation == result.inte[i].id_interpretation);

										if(JSON.stringify(like) === '[]' || like.length === 0) {
											like_total = 0;
										} else {
											like_total = like[0].like_total;
										}
									}
								}
								var select = '#'+id_inte;
								$(select).text(like_total);
								parent_node.css('background-color','#80cbc4');
								son_node.addClass('white-text');
								if(parent_node.prev().children("a:first-child").hasClass('white-text').toString()=='true'){
									var pre=parent_node.prev();
									pre.children("a:first-child").removeClass('white-text');
									pre.css('background-color','#eeeeee')
								}

							}, 'json');

						// alert('点赞成功！');
					}
					if(result.result == 'failure') {
						alert('点赞失败!\n' + result.error_msg);
					}
				},

				error: function(error) {
					alert('ajax错误，请重试');
					console.log(JSON.stringify(error));
					$('#entry-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});
	});

	$('body').on('click','.dislike',function(){
		var id_user = -1;
		var id_inte = $(this).attr("id");
		id_inte = id_inte.substring(7,id_inte.length);
		var son_node=$(this);
		var parent_node=$(this).parent();
		// console.log(JSON.stringify(id_inte));

		chrome.storage.sync.get({
			BW_userId: -1
		},
		function(items) {
			id_user = items.BW_userId;
			// validate
			if(id_user == -1 || id_inte == null) {
				console.log('Cannot get correct user ID.');
				alert('请先登录！')
				return;
			}

			$.ajax({
				type:'POST',
				url: server_url + 'Entry/dislike/',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					id_user: id_user,
					id_inte: id_inte
				},

				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));

						var id_entry = $('h1[id^=entry-heading-number]').attr('id');
						id_entry = id_entry.substring(20);
						$.get(server_url+'Entry/search_inte',
							{entry_id: id_entry}, function(result) {
								//更新点赞数组
								var like_total = 0;
								for(i in result.inte) {
				          if(result.inte[i].id_interpretation == id_inte){
										var like = result.like.filter(item => item.id_interpretation == result.inte[i].id_interpretation);

										if(JSON.stringify(like) === '[]' || like.length === 0) {
											like_total = 0;
										} else {
											like_total = like[0].like_total;
										}
									}
								}
								var select = '#'+id_inte;
								$(select).text(like_total);
								parent_node.css('background-color','#80cbc4');
								son_node.addClass('white-text');
								if(parent_node.next().children("a:first-child").hasClass("white-text").toString()=='true'){
									var nex=parent_node.next();
									nex.children("a:first-child").removeClass('white-text');
									nex.css('background-color','#eeeeee');
								}
								// alert(id_inte);

							}, 'json');
						// alert('点灭成功！');
					}
					if(result.result == 'failure') {
						alert('点灭失败!\n' + result.error_msg);
					}
				},

				error: function(error) {
					alert('ajax错误，请重试');
					console.log(JSON.stringify(error));
					$('#entry-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});
	});

  // 点击用户名可查看选项页
	$('#username').click(function(){
		var url="options-page/options.html";
		window.open(chrome.runtime.getURL(url));
	});

	$('#login-btn').click(function(){
		var url="options-page/options.html?action=login&";
		window.open(chrome.runtime.getURL(url));
	});

	$('#signup-btn').click(function(){
		var url="options-page/options.html?action=signup&";
		window.open(chrome.runtime.getURL(url));
	});

});
