/*
* Reference to:
*	https://stackoverflow.com/questions/24641592/injecting-iframe-into-page-with-restrictive-content-security-policy
*/

var mouseoverTimer;
var mouseoutTimer;
var finalSelected = 'a';

/*
 * 划取区域的类
 * selected （应该）是节点或对象，所以需要
 * finalSelected 来保存其字符串值
 */
function Select() {
	var selectItem = new Object();
	// 私有
	var selected = "";
	var finalSelected = "";
	// setter
	selectItem.setSelected = function() {
		// 获取选取文本
		if(document.selection) {
			this.selected = document.selection.createRange().text;
		} else if(window.getSelection()) {
			this.selected = window.getSelection();
		}
		this.finalSelected = this.selected.toString();
	}
	// getter: selected (object)
	selectItem.getSelected = function() {
		return this.selected;
	}
	// getter: finalSelected (string)
	selectItem.getFinalSelected = function() {
		return this.finalSelected;
	}
	return selectItem;
}

var selectItem = new Select();

/*
* 鼠标点击后松开的事件
*
*/
$('body').on('mouseup', function(e) {

	// // 获取选取文本
	selectItem.setSelected();

	// 若选中不为空		此处选择有bug:双击空白会出现按钮
	// if(selectItem.getSelected() != "") {
	if(selectItem.getFinalSelected() != "") {

		// 提示框html代码，用于后面插入时使用
		var float_div_html = "<a id='__float-div__' " +
		" class='br-btn-floating disabled'><i>BR</i></div>";

		// 判断浮动框是否存在
		if($('#__float-div__').length > 0) {

			// 浮动框存在
			// 则改为可见，并更改其位置至鼠标旁边
			$('#__float-div__').css({'display': 'block',
			'top': e.clientY+7+'px', 'left': e.clientX+7+'px'});

			clearTimeout(mouseoutTimer);

		} else {
			// 不存在，创建一个
			$('body').append(float_div_html);
			$('#__float-div__').css({'top': e.clientY+7+'px', 'left': e.clientX+7+'px'});

			// 未放置则3秒自动消失
			mouseoutTimer = setTimeout(function() {
				$('#__float-div__').remove();
			}, 30000);
		}

	} else {
		// 选择为空
		$('#__float-div__').remove();
	}

});


/*
* 提示框点击事件,这种方法才能使动态添加的元素绑定事件
*/
$('body').on('click', '#__float-div__', function(event) {

	if(selectItem.getFinalSelected() != "") {

		// create an iframe		(new method)
		// Avoid recursive frame insertion...
		var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
		if(!location.ancestorOrigins.contains(extensionOrigin)) {
			var iframe = document.createElement('iframe');
			iframe.id = "BW-iframe";
			// Must be declared at web_accessible_resources in manifest.json
			var url = 'content-scripts/iframe.html';
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
				act: 'search_content',
				msg: selectItem.getFinalSelected()
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

	} else {
		alert('null');
	}

});


/*
* 不继承父类事件，并关闭提示框
*/
$('body').on('mouseup', '#__float-div__', function(event) {
	event.stopPropagation();
	$('#__float-div__').css({'display':'none'});
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
$('body').on('mouseover', '#__float-div__', function() {

	$('#__float-div__').removeClass('disabled');

	clearTimeout(mouseoutTimer);

	mouseoverTimer = setTimeout(function() {
		$('#__float-div__').addClass('br-pulse');
	},1000);

});
$('body').on('mouseout', '#__float-div__', function() {

	$('#__float-div__').addClass('disabled');
	$('#__float-div__').removeClass('pulse');

	clearTimeout(mouseoverTimer);

	mouseoutTimer = setTimeout(function() {
		$('#__float-div__').remove();
	}, 3000);

})
