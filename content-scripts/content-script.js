
var selected = "";


/*
 * 鼠标点击后松开的事件
 */
$('body').mouseup(function(e) {

	// 获取选取文本
	if(document.selection) {
		selected = document.selection.createRange().text;
	} else if(window.getSelection()) {
		selected = window.getSelection();
	}

	// 若有选中文本
	if(selected != "") {
		// 提示框
		var float_div_html = "<div id='__float-div__' class=''>BW</div>";
		// 结果框
		var result_div_html = "<div id='__result-div__' class=''></div>";

		// 判断浮动框是否存在
		if($('#__float-div__').length > 0) {
			// 存在，则改为可见，并更改位置
			$('#__float-div__').css({'display': 'block',
					'top': e.clientY+3+'px', 'left': e.clientX+3+'px'});
		} else {
			// 不存在，创建一个
			$('body').append(float_div_html);
			$('#__float-div__').css({'top': e.clientY+3+'px', 'left': e.clientX+3+'px'});
		}

		// 若结果框不存在，则创建一个，并置为不可见
		if($('#__result-div__').length == 0) {
			$('body').append(result_div_html);
			$('#__result-div__').css({'top': e.clientY+3+'px', 'left': e.clientX+3+'px'});
		}

	}
}).mousedown(function() {
	// body鼠标事件，按下时隐藏两框
	// 若选中内容，则关闭弹窗
	$('#__float-div__').css({'display': 'none'});
	$('#__result-div__').css({'display': 'none'});
});


/*
 * 提示框点击事件,这种方法才能使动态添加的元素绑定事件
 */
$('body').delegate('#__float-div__', 'mousedown', function(event) {

	// 阻止继承父元素的事件
	event.stopPropagation();

	// 显示结果框
	$('#__result-div__').css({'display': 'block',
					'top': event.clientY+3+'px', 'left': event.clientX+3+'px'});

	// 从background-script中获得查询结果的json字符串
	var request = {"type": "search", "keyword": selected.toString() };
	chrome.runtime.sendMessage(request, function(result) {
		// 将结果写入框内
		$('#__result-div__').empty();
		$('#__result-div__').html('<h5>You might be looking for: </h5>');

		// 若无词条内容，则写未找到		有内容则写入内容
		if(result.total == 0) {
			$('#__result-div__').append('<p>暂时未找到词条！</p>');
		} else {
			for(item in result.entry_name) {
				$('#__result-div__').append('<p>'+result.entry_name[item]+'</p>');
			}
		}
	});

});


/*
 * 不继承父类事件，并关闭提示框
 */
$('body').delegate('#__float-div__', 'mouseup', function(event) {
	event.stopPropagation();
	$('#__float-div__').css({'display': 'none'});
});
// 不继承父类鼠标事件
$('body').delegate('#__result-div__', 'mousedown', function(event) {
	event.stopPropagation();
});
$('body').delegate('#__result-div__', 'mouseup', function(event) {
	event.stopPropagation();
});
