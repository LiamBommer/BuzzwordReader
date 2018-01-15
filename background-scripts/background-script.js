/*
 * background-script
 */

/*
 * @param String keyword
 * return String(json) result
 * 	result:
 *		result.total: num of entry searched
 *		result.entry_name: name of entries searched
 */
function getSearchResult(keyword) {

	var server_url = 'http://116.57.53.135/BuzzwordReader/';
	var search_result = {};

	$.ajax({
		type: 'GET',
		url: server_url + 'Popup/search/' + keyword,
		dataType: 'json',
		async: false,
		success: function(result) {
			search_result = result;
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log('Ajax Error' +
				'\nXMLHttpRequest status: ' + XMLHttpRequest.status +
				'\nXMLHttpRequest readyState: ' + XMLHttpRequest.readyState +
				'\ntextStatus' + textStatus);
		},
		scriptCharset: 'utf-8'
	});

	return search_result;
};


/*
 * Listen from content-js & popup
 */
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.type == "search") {
			if(request.keyword == "") {
				alert('keyword is null');
				return ;
			}else {
				// 获取搜索结果，json格式
				var search_result = getSearchResult(request.keyword);

				// // 写全 result 并返回
				// var result = {"total": search_result.total,
				// 			"content": 'not sure yet'};
				sendResponse(search_result);
			}
		}
	}
);
