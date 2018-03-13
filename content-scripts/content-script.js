/*
* Reference to:
*	https://stackoverflow.com/questions/24641592/injecting-iframe-into-page-with-restrictive-content-security-policy
*/

var selected = "";
var mouseoverTimer;
var mouseoutTimer;


/*
* 鼠标点击后松开的事件
*
*/
$('body').mouseup(function(e) {

	// 获取选取文本
	if(document.selection) {
		selected = document.selection.createRange().text;
	} else if(window.getSelection()) {
		selected = window.getSelection();
	}

	// 若选中不为空		此处选择有bug:双击空白会出现按钮
	if(selected != "") {

		// 提示框html代码，用于后面插入时使用
		var float_div_html = "<a id='__float-div__' " +
		" class='btn-floating disabled'><i>BW</i></div>";

		// 判断浮动框是否存在
		if($('#__float-div__').length > 0) {

			// 浮动框存在
			// 则改为可见，并更改其位置至鼠标旁边
			$('#__float-div__').css({'display': 'block',
			'top': e.clientY+5+'px', 'left': e.clientX+5+'px'});

			clearTimeout(mouseoutTimer);

		} else {
			// 不存在，创建一个
			$('body').append(float_div_html);
			$('#__float-div__').css({'top': e.clientY+3+'px', 'left': e.clientX+3+'px'});

			// 未放置则3秒自动消失
			mouseoutTimer = setTimeout(function() {
				$('#__float-div__').remove();
			}, 3000);
		}

	} else {
		// 选择为空
		$('#__float-div__').remove();
	}

});

/*
* 提示框点击事件,这种方法才能使动态添加的元素绑定事件
*/
$('body').delegate('#__float-div__', 'click', function(event) {

	// 阻止继承父元素的事件
	event.stopPropagation();

	/*
	* 从background-script中获得查询结果的json字符串
	*/

	// var request = {"type": "search", "keyword": selected.toString() };
	// chrome.runtime.sendMessage(request, function(result) {
	// 	// 将结果写入框内
	// 	$('#__result-div__').contents().find('body').empty();
	// 	$('#__result-div__').contents().find('body').append(
	// 		"<div class='container'><h4>You might be looking for: </h4></div>");
	//
	// 	// 若无词条内容，则写未找到		有内容则写入内容
	// 	if(result.total == 0) {
	// 		$('#__result-div__').contents().find('body').append('<p>暂时未找到词条！</p>');
	// 	} else {
	// 		for(item in result.entry_name) {
	// 			$('#__result-div__').append('<p>'+result.entry_name[item]+'</p>');
	// 		}
	// 	}
	// });


	// create an iframe		(new method)
	// Avoid recursive frame insertion...
	var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
	if(!location.ancestorOrigins.contains(extensionOrigin)) {
		var iframe = document.createElement('iframe');
		iframe.id = "BW-iframe";
		// Must be declared at web_accessible_resources in manifest.json
		var url = 'content-scripts/iframe.html?entry=abc';
		iframe.src = chrome.runtime.getURL(url);

		iframe.allowTransparency = "true";
		iframe.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;' +
		'display:block;width:100%;height:100%;z-index:20394;border:0px;';
		document.body.appendChild(iframe);
	}

	// send message to iframe
	var $BW_iframe = $('#BW-iframe');
	// ATTENTION: operations must be done after loaded
	$BW_iframe.on('load', function() {
		var data = {
			act: '',
			msg: 'Hello, this is BuzzwordReader'
		};
		$BW_iframe[0].contentWindow.postMessage(data, '*');
	});

	// receive message from iframe
	window.addEventListener('message', function(event) {
		if(event.data.act == 'close') {
			// close iframe
			$('#BW-iframe').remove();
		}
	}, false);
});


/*
* 不继承父类事件，并关闭提示框
*/
$('body').delegate('#__float-div__', 'mouseup', function(event) {
	event.stopPropagation();
	$('#__float-div__').css({'display': 'none'});
});
// 不继承父类鼠标事件
// $('body').delegate('#__result-div__', 'mousedown', function(event) {
// 	event.stopPropagation();
// });
// $('body').delegate('#__result-div__', 'mouseup', function(event) {
// 	event.stopPropagation();
// });


/*
* 按钮悬浮改变类的事件
*/
$('body').delegate( '#__float-div__', 'mouseover',function() {

	$('#__float-div__').removeClass('disabled');

	clearTimeout(mouseoutTimer);

	mouseoverTimer = setTimeout(function() {
		$('#__float-div__').addClass('pulse');
	},1000);

});
$('body').delegate( '#__float-div__', 'mouseout',function() {

	$('#__float-div__').addClass('disabled');
	$('#__float-div__').removeClass('pulse');

	clearTimeout(mouseoverTimer);

	mouseoutTimer = setTimeout(function() {
		$('#__float-div__').remove();
	}, 3000);

})
