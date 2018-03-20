/*
 * background-script
 */


	// 本机测试用服务器
	// var server_url = 'http://127.0.0.1/BuzzwordReader/';
	// 生产环境公网服务器
	var server_url = 'http://119.29.58.165:81/index.php/';


/*
 * 输入过滤器！
 *
 *	将特殊字符变为空格
 *  被过滤的字符列表如下。。。
 *
 */
function strFilter(str, type) {
	if(type == 'search') {
		// 搜索
		// 	过滤所有特殊符号，转为空格
		var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%+_]");

	} else if(type == 'entry') {
		// 词条名
		//	过滤除以下符号： ？ ！ ， 。、
		var pattern = new RegExp("[`~@#$^&*()=|{}':;'\\[\\]<>/~@#￥……&*（）——|{}【】‘；：”“'%+_]");

	} else if(type == 'inte') {
		// 释义内容
		//	暂未想好
	}
  var specialStr = "";
  for(var i=0;i<str.length;i++)
  {
       specialStr += str.substr(i, 1).replace(pattern, ' ');
  }
  return specialStr;
}


function search_entry(filtedStr) {

	var json = Object();

		$.ajax({
			type:'GET',
			url: server_url + 'Entry/search_entry',
			dataType: 'json',
			async: false,
			data: {
				search_content: filtedStr
			},
			success: function(result) {
				json = result;
			},
			error: function(error) {
				alert('查询请求错误，请重试');
				console.log(JSON.stringify(error));
				// error display
				return;
			},
			scriptCharset: 'utf-8'
		});

	return json;
}


function search_inte(id_entry) {
	var json = Object();
	$.ajax({
		type:'GET',
		url: server_url + 'Entry/search_inte/',
		async: false,
		dataType: 'json',
		data: {
			entry_id: id_entry
		},
		success: function(result) {
			json = result;
		},
	});
	return json;
}


function search_user(id_user) {
	var json = Object();
	$.ajax({
		type:'GET',
		url: server_url + 'User/search_user/',
		async: false,
		dataType: 'json',
		data: {
			id_user: id_user
		},
		success: function(result) {
			json = result;
		}
	});
	return json;
}


function like(id_user, id_inte) {
	var json = Object();
	$.ajax({
		type:'POST',
		url: server_url + 'Entry/like/',
		async: false,
		dataType: 'json',
		data: {
			id_user: id_user,
			id_inte: id_inte
		},
		success: function(result) {
			json = result;
		},
		error: function(error) {
			console.log(JSON.stringify(error));
		}
	});
	return json;
}


function dislike(id_user, id_inte) {
	var json = Object();
	$.ajax({
		type:'POST',
		url: server_url + 'Entry/dislike/',
		async: false,
		dataType: 'json',
		data: {
			id_user: id_user,
			id_inte: id_inte
		},
		success: function(result) {
			json = result;
		}
	});
	return json;
}


/*
 * Listen from content-js & popup
 */
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

		// 搜索词条
		if(request.act == "search_entry") {
			var result = search_entry(request.filtedStr);
			sendResponse(result);
		}

		// 搜索释义
		if(request.act == "search_inte") {
			var result = search_inte(request.id_entry);
			sendResponse(result);
		}

		// 搜索用户名
		if(request.act == "search_user") {
			var result = search_user(request.id_user);
			sendResponse(result);
		}

		// 点赞
		if(request.act == "like") {
			var result = like(request.id_user, request.id_inte);
			sendResponse(result);
		}

		// 点灭
		if(request.act == "dislike") {
			var result = dislike(request.id_user, request.id_inte);
			sendResponse(result);
		}

	}
);
