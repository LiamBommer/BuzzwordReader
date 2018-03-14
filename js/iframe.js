// receive message function from parent window
// Here because it can't wait to receive message until
// the page is loaded
var search_content = "";
window.addEventListener('message', function(event) {
	if(event.data.act == 'search_content') {
		search_content = event.data.msg;
	}

}, false);

// 本机测试用服务器
var server_url = 'http://127.0.0.1/BuzzwordReader/';
// 生产环境公网服务器
// var server_url = 'http://119.29.58.165:81/index.php/';

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

	// search input default focus
	$('#search').click();

	var search_entry_vue = new Vue({
		el: '#search-entry-div',
		data: {
			is_empty: false,
			search_input: search_content,
			entry_list: []
		},
		methods: {
		  search() {
				// 搜索栏回车搜索时，进行词条查询
				this.is_empty = false;
				$.ajax({
					type:'GET',
					url: server_url + 'Entry/search_entry/',
					dataType: 'json',
					data: {
						search_content: search_entry_vue.search_input
					},
					success: function(result) {
						console.log('ajax结果： '+JSON.stringify(result));
						if(result.result == 'empty') {
							search_entry_vue.is_empty = true;
							return;
						} else {
							// 将查找到的词条数组存起来
							for(i in result) {
								console.log(result[i]);
								search_entry_vue.entry_list.push(result[i]);
							}
						}
					},
					error: function(error) {
						alert('查询请求错误，请重试');
						console.log(JSON.stringify(error));
						// error display
						return;
					},
					scriptCharset: 'utf-8'
				});
		  }
		},
		created() {
		  // 在创建后自动查询传来的词条名
			$.ajax({
				type:'GET',
				url: server_url + 'Entry/search_entry/',
				dataType: 'json',
				data: {
					search_content: search_content
				},
				success: function(result) {
					console.log('ajax结果： '+JSON.stringify(result));
					if(result.result == 'empty') {
						search_entry_vue.is_empty = true;
						return;
					} else {
						// 将查找到的词条数组存起来
						for(i in result) {
							console.log(result[i]);
							search_entry_vue.entry_list.push(result[i]);
						}
					}
				},
				error: function(error) {
					alert('查询请求错误，请重试');
					console.log(JSON.stringify(error));
					// error display
					return;
				},
				scriptCharset: 'utf-8'
			});
		}
	});


});



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
