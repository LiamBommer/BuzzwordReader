/*
* !!! IMPORTANT !!!
*
* chrome storage 事件为异步，故总是在其他异步代码(js一般都是)后执行
* 故在callback函数外下一步取id_user时失败
*
* solution:
*	将涉及到取得的值的操作，都放在callback函数里操作
*
* refer:
*	https://stackoverflow.com/questions/12252817/how-chrome-storage-local-get-sets-a-value
*/


/*
 * 解析 URL 的类

 * 实现功能：
 * 	解析url，并根据url中的action做具体的操作
 *	在使用时只用调用 resolve 函数即可

 * URL 代码格式
		var url = "options-page/options.html?";
		url += "action=addInte&id_entry="+this.prop_id_entry+"&name_entry="+this.prop_name_entry;
		window.open(chrome.runtime.getURL(url));
 */
function ResolveURL() {
	var resolver = new Object();
	resolver.GetQueryString = function(name) {
		/*
		* 读取url中的参数
		* 以打开特定页面做某些操作
		* （网上的代码）
		*
		* 假设url地址是http://www.xxx.com?ProID=100&UserID=200，
		* 可用GetQueryString("ProID")或GetQueryString("UserID")获取相应参数值。
		*/
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r =  window.location.search.substr(1).match(reg);
		// 为了能够传输中文
		if (r != null) return  unescape(decodeURI(r[2])); return null;
	}

	// 添加释义
	// @param
	// 	id_entry, name_entry
	resolver.addInte = function() {
		var id_entry = this.GetQueryString('id_entry');
		var name_entry = this.GetQueryString('name_entry');

		$('#new-inte-modal').modal('open');
		$('#name-entry').val(name_entry);
		$('#id-entry').val(id_entry);
	}

	resolver.addEntry = function() {
		// 添加释义
		// @param
		// 	name_entry
		var name_entry = this.GetQueryString('name_entry');

		$('#new-entry-modal').modal('open');
		$('#entry-name').val(name_entry);
	}

	resolver.login = function() {
		// 登录
		// @param
		// login

		$('#login-modal').modal('open');
	}

	resolver.signup = function() {
		// 注册
		// @param
		// login

		$('#signup-modal').modal('open');
	}


	// 统一处理函数
	// 先取action的值，然后根据action做不同的操作

	// 要添加新的动作，则新添加 resolver.xxx = function() {}
	// 然后在次函数中判断并执行即可
	resolver.resolve = function() {
		var action = this.GetQueryString('action');
		if(action == 'addInte') {
			this.addInte();
		}
		if(action == 'addEntry') {
			this.addEntry();
		}
		if(action == 'login') {
			this.login();
		}
		if(action == 'signup') {
			this.signup();
		}
	}

	return resolver;
}


/*
 * 更新用户数据
 * 并显示登录用户
 */
function update_user() {
	chrome.storage.sync.get({
		BW_username: 'unknown',
		BW_userIdentity: -1,
		BW_userEmail: '',
		BW_userPhone: ''
	},
	function(items) {
		$('#username-sideNav').html(items.BW_username);
		$('#email-sideNav').html(items.BW_userEmail+"<br/>"+items.BW_userPhone);
		// 验证用户身份，来显示不同区域
		var user_identity = items.BW_userIdentity;
		if(user_identity == 0) {
			// 普通用户
			$('section.admin-visible').hide();
		} else if(user_identity == 1) {
			// 管理员
			$('section.admin-visible').slideDown();
		} else if(user_identity == 2) {
			// 超级管理员
		}
	});
}


/*
 * 输入过滤器！
 *
 *  过滤特殊字符, 被过滤的字符列表如下。。。
 */
function strFilter(str, type) {

	if(type == 'search') {
		// 搜索
		// 	过滤所有特殊符号，转为空格
		var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%+_]");

	  var specialStr = "";
	  for(var i=0;i<str.length;i++)
	  {
	       specialStr += str.substr(i, 1).replace(pattern, ' ');
	  }
	  return specialStr;

	} else if(type == 'entry_name') {

		// 词条名
		//	过滤除以下符号： ？ ！ ， 。、
		var pattern = new RegExp("[`~@#$^&*()=|{}':;'\\[\\]<>/~@#￥……&*（）——|{}【】‘；：”“'%+_]");

		if(pattern.test(str)) {
			// 含有特殊符号，不合格， return false
			return false;
		} else {
			// 不含特殊符号，合格，  return true
			return true;
		}

	} else if(type == 'inte') {

		// 释义内容
		//	防 SQL 注入
		var re= /select|update|drop|delete|exec|count|’|"|=|;|>|<|%/i;
    if(re.test(str))
    {
     return false;
	  } else {
		 return true;
	 }

 }
}


$(document).ready(function() {

	// 模态框初始化
	$('#entry-modal').modal();
	$('#signup-modal').modal();
	$('#login-modal').modal();
	$('#info-modal').modal();
	$('#pw-modal').modal();
	$('#new-entry-modal').modal();
	$('#new-inte-modal').modal();
	$('#edit-entry-modal').modal();
	$('#delete-entry-modal').modal();
	$('#edit-inte-modal').modal();
	$('#delete-inte-modal').modal();
	$('#turn-report-modal').modal();
	$('#submit-report-modal').modal();
	$('.dropdown-button').dropdown({
		hover: true,
		belowOrigin: true,	// 在原来的按钮下面出现
	});

	$('select').material_select();

	// 本机测试用服务器
	// var server_url = 'http://127.0.0.1/BuzzwordReader/';
	// 生产环境公网服务器
	var server_url = 'http://119.29.58.165:81/index.php/';


	// 执行函数，更新用户状态
	update_user();


	/*
	 * 在此判断url中是否有参数，以做出相应的操作
	 */
	// 类的实例化
	var resolver = new ResolveURL();
	resolver.resolve();


	/*
	* 注册提交按钮事件
	* 功能:
	* 	先进行输入合法性检验，然后用ajax进行提交
	* 	成功后关闭模态框
	* 	失败时在console中输出结果
	* 待完成功能：
	*	输入合法性检验
	*	鼠标离开后，检查用户名等是否已经存在
	*	提交时再次进行检查
	*	完成后的动作
	*/
	$('#signup-btn').click(function() {

		// 输入合法性检验
		var username = $('#username').val();
		var password = $('#password').val();
		var email = $('#email').val();
		var phone = $('#phone').val();
		var gender = $('#gender').val();
		var profile = $('#profile').val();
		if(gender != 'male' && gender != 'female') {
			alert('性别问题');
		}else if(gender == 'male') {
			gender = 0;
		}else {
			gender = 1;
		}

		// ajax 传输
		$.ajax({
			type:'POST',
			url: server_url + 'User/signup',
			timeout: 5000,
			// 同步进行
			async: false,
			dataType: 'json',
			data: {
				username: username,
				password: password,
				email: email,
				phone: phone,
				gender: gender,
				profile: profile
			},
			success: function(result) {
				if(result.result == 'success') {
					// $('.modal-content > h4').html('注册成功');
					console.log(JSON.stringify(result));
					$('#signup-modal').modal('close');
					alert('注册失败!\n');
				}
				if(result.result == 'failure') {
					// $('.modal-content > h4').html('注册失败');
					alert('注册失败!\n' + result.error_msg);
				}
			},
			error: function(error) {
				alert('注册错误，请重试');
				console.log(JSON.stringify(error));
				$('#signup-modal').html(error.responseText);
				return;
			},
			scriptCharset: 'utf-8'
		});

		// 阻止表单提交
		return false;
	});

  // 转换登录方式
	$('#trun-to-phone').click(function(){
		$('#email-login-div').css('display','none');
		$('#phone-login-div').css('display','block');
		$('#trun-to-phone').css('display','none');
		$('#trun-to-email').css('display','block');
	});


	$('#trun-to-email').click(function(){
		$('#phone-login-div').css('display','none');
		$('#email-login-div').css('display','block');
		$('#trun-to-email').css('display','none');
		$('#trun-to-phone').css('display','block');
	});


	/*
	* 登录提交按钮事件
	* 功能:
	*	输入邮箱、电话、用户名任一个进行登录
	*	登录成功后，服务器存用户session，插件storage存用户名
	*
	* 待完成功能：
	*	鼠标离开后，进行检验
	*/
	$('#login-btn').click(function() {

		// 输入合法性检验
		var email = $('#email-login').val();
		var phone = $('#phone-login').val();
		var password = $('#password-login').val();

		if(email == null && phone == null) {
			alert('请填写邮箱或手机号');
			return;
		}

		// ajax 传输
		$.ajax({
			type:'POST',
			url: server_url + 'User/login',
			timeout: 5000,
			async: true,
			dataType: 'json',
			data: {
				email: email,
				phone: phone,
				password: password
			},
			success: function(result) {
				if(result.result == 'success') {
					console.log(JSON.stringify(result));
					// 关闭模态框，清空内容
					$('#login-modal').modal('close');
					$('#email-login').val('');
					$('#phone-login').val('');
					$('#password-login').val('');

					// 将用户名，用户Id存入storage
					chrome.storage.sync.set({
						BW_username: result.row.username,
						BW_userId: result.row.id_user,
						BW_userIdentity: result.row.identity,
						BW_userIsBanned: result.row.is_banned,
						BW_userEmail: result.row.email,
						BW_userPhone: result.row.phone,
						BW_userGender: result.row.gender,
						BW_userProfile: result.row.profile,
					},function() {
						// 更新登录用户
						// chrome.storage.sync.get({
						// 	// 取值： 默认值
						// 	BW_username: 'unknown',
						// 	BW_userIdentity: -1,
						// 	BW_userEmail: '',
						// 	BW_userPhone: ''
						// },
						// function(items) {
						// 	$('#username-sideNav').html(items.BW_username);
						// 	$('#email-sideNav').html(items.BW_userEmail+"<br/>"+items.BW_userPhone);
						// 	// 验证用户身份，来显示不同区域
						// 	var user_identity = items.BW_userIdentity;
						// 	if(user_identity == 0) {
						// 		// 普通用户
						// 	} else if(user_identity == 1) {
						// 		// 管理员
						// 	} else if(user_identity == 2) {
						// 		// 超级管理员
						// 	}
						// });
						update_user();
					});
				}
				if(result.result == 'success') {
					// $('.modal-content > h4').html('注册失败');
					alert('登录成功！');
				}

				if(result.result == 'failure') {
					// $('.modal-content > h4').html('注册失败');
					alert('登录失败!\n' + result.error_msg);
					$('#password-login').val('');
				}
			},
			error: function(error) {
				alert('登录错误，请重试');
				console.log(JSON.stringify(error));
				$('#login-modal').html(error.responseText);
				return;
			},
			scriptCharset: 'utf-8'
		});

		// 阻止表单提交
		return false;

	});


	/*
	* 个人信息显示按钮
	* 功能:
	*	打开模态框，用ajax请求数据并显示
	*
	* 待完成功能：
	*
	*/
	$('#info-btn').click(function() {

		$('#info-modal').modal('open');

		// 从存储中获取用户名
		chrome.storage.sync.get({
			BW_username: 'unknown'
		}, function(items) {
			var username = items.BW_username;
			// $('#info-collec-ul').append("<li class='collection-item'>"+username+"</li>");
			if(!username) {
				alert('username from storage didnt get'+username);
			}

			// ajax 传输
			// 根据用户名获取用户信息
			$.ajax({
				type:'GET',
				url: server_url + 'User/getInfo',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					username: username
				},
				success: function(result) {
					if(result.result == 'success') {
						$('#info-collec-ul').append("<li class='collection-item'>"+result.row.email+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.row.phone+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.row.identity+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.row.gender+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.row.profile+"</li>");
					}
					if(result.result == 'failure') {
						alert('获取信息失败!\n' + result.error_msg);
					}
				},
				error: function(error) {
					alert('错误，请重试');
					console.log(JSON.stringify(error));
					$('#info-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});

	});


	/*
	* 修改密码按钮
	* 功能:
	*	打开模态框，
	*	确认旧密码正确性
	*	确认新密码有效性，发送ajax请求修改
	*
	* 待完成功能：
	*	密码格式检验
	*/
	$('#pw-btn').click(function() {

		// 从存储中获取用户名
		chrome.storage.sync.get({
			BW_username: 'not set'
		}, function(items) {
			var username = items.BW_username;
			if(!username) {
				alert('username from storage didnt get'+username);
				return;
			}

			var pw_origin = $('#password-origin').val();
			var pw_new_1 = $('#password-new-1').val();
			var pw_new_2 = $('#password-new-2').val();

			// validate
			if(pw_origin==null || pw_new_1==null || pw_new_2==null) {
				alert('不能有空');
				return;
			}
			if(pw_origin == pw_new_1) {
				alert('新旧密码不能一样');
				return;
			}
			if(pw_new_1 != pw_new_2) {
				alert('两次密码输入不同！');
				return;
			}
			// if() {
			// 	// 验证密码有效性
			// }

			$.ajax({
				type:'POST',
				url: server_url + 'User/pwEdit',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					username: username,
					pw_origin: pw_origin,
					pw_new_1: pw_new_1,
					pw_new_2:	pw_new_2
				},
				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						// 关闭模态框，清空内容
						$('#pw-modal').modal('close');
						$('#password-origin').val('');
						$('#password-new-1').val('');
						$('#password-new-2').val('');
					}
					if(result.result == 'failure') {
						alert('密码重置失败!\n' + result.error_msg);
						$('#password-new-1').val('');
						$('#password-new-2').val('');
					}
				},
				error: function(error) {
					alert('密码重置错误，请重试');
					console.log(JSON.stringify(error));
					$('#pw-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});

	});


	/*
	* 搜索框提交事件
	* 功能：
	*  根据输入的关键词搜索
	*  并输出相关词条
	*
	* 待完成功能：
	*
	*/
	// document.getElementById('search-field').onsearch=function() {
	document.getElementById('search-field').addEventListener('search', function() {

		// 清空结果
		$('#search-result-div').html('');

		var search_content = $('#search-field').val();
		if(search_content == null) {
			alert('Must Search Something! ');
			return ;
		}

		// for(i in result) {
		// 	var html = "<div class='col l4 m6 s12'>" +
		// 	"<div class='card z-depth-2'>" +
		// 	"<div class='card-content'>" +
		// 	"<a class='modal-trigger' href='#entry-modal'>" +
		// 	"<span class='card-title'>"+result[i].name+"</span>" +
		// 	"</a>" +
		// 	"<p>"+result[i].id_entry+"</p>" +
		// 	"<p>是否已开放: "+result[i].is_open+"</p>" +
		// 	"<p>请求次数: "+result[i].request+"</p>" +
		// 	"<p>创建时间: "+result[i].datetime+"</p>";
		// 	html += "</div>" +
		// 	"</div>" +
		// 	"</div>";
		// 	$('#search-result-div').append(html);
		// }

		$.ajax({
			type:'GET',
			url: server_url + 'Entry/search_entry/',
			timeout: 3000,
			async: true,
			dataType: 'json',
			data: {
				search_content: search_content
			},
			success: function(result) {
				console.log(JSON.stringify(result));
				if(result.result == 'empty') {
					// $('#search-result-div').append("<br/><h6>没有相关结果</h6>");
					alert('没有相关结果');
					return;
				}

				// 显示词条和添加置顶释义

				for(var i=0;i<result.length;i++) {

					var id_entry = result[i].id_entry; // 词条id号
					var id_inte = result[i].id_interpretation;
					var name = result[i].name; // 词条名称
					var most_like = 0;
					var inte_number = 0; // 释义数目

					var top_id_inte;
					var top_inte;
					var top_inte_source;
					var top_inte_daytime;

        	// 更改为同步
					$.ajaxSettings.async = false;

					$.get(server_url+'Entry/search_inte',
						{entry_id: id_entry}, function(result) {
							console.log(JSON.stringify(result));
							if(JSON.stringify(result.inte) === '[]'|| result.inte.length === 0){
								inte_number = 0;
							}
							else{
								inte_number = result.inte.length;
							}

						}, 'json');

						var html;

						if(inte_number == 0){
							html = '<li class="collection-item avatar"><div class="collapsible-header no-inte" id="entry-id'+id_entry+'">'
									+'<i class="material-icons teal-text text-darken-3 large">attach_file</i>'
									+'<h6 class="top-title" id="entry-title-top">'+name+'</h6><span class="badge">共有'+inte_number+'条释义</span></div>'
									+'<div class="collapsible-body"><a href="#!" class="secondary-content modal-trigger" title="其他释义" href="#entry-modal">'
									+'<i class="material-icons cyan-text">more</i></a>'
									+'<div class="entry-top"><div class="row">'
									+'<div class="col s12 m10 l9"><p id="entry-inte-top"></p></div>'
									+'</div><i class="material-icons cyan-text tiny close blue-grey-text">find_in_page</i><span class="top-inte-source"></span><br>'
									+'<i class="material-icons cyan-text tiny close blue-grey-text">access_time</i><span class="top-inte-daytime"></span><br>'
									+"<div class='chip chip-like'><a href='#' class='like'>"
									+"<i class='small material-icons myclose'>arrow_drop_up</i><span class='like-number' id='top_like_total'></span></a></div>"
									+"<div class='chip chip-dislike'><a href='#' class='dislike'>"
									+" <i class='small material-icons myclose'>arrow_drop_down</i></a></div>"
									+'</div></div></li>';
						}

						else if(inte_number == 1){
							html = '<li class="collection-item avatar"><div class="collapsible-header" id="entry-id'+id_entry+'">'
									+'<i class="material-icons teal-text text-darken-3 large">attach_file</i>'
									+'<h6 class="top-title" id="entry-title-top">'+name+'</h6><span class="badge">共有'+inte_number+'条释义</span></div>'
									+'<div class="collapsible-body"><a href="#!" class="secondary-content modal-trigger no-other-inte" title="其他释义" href="#entry-modal">'
									+'<i class="material-icons cyan-text">more</i></a>'
									+'<div class="entry-top"><div class="row">'
									+'<div class="col s12 m10 l9"><p id="entry-inte-top"></p></div>'
									+'</div><i class="material-icons cyan-text tiny close blue-grey-text">find_in_page</i><span class="top-inte-source"></span><br>'
									+'<i class="material-icons cyan-text tiny close blue-grey-text">access_time</i><span class="top-inte-daytime"></span><br>'
									+"<div class='chip chip-like'><a href='#' class='like'>"
									+"<i class='small material-icons myclose'>arrow_drop_up</i><span class='like-number' id='top_like_total'></span></a></div>"
									+"<div class='chip chip-dislike'><a href='#' class='dislike'>"
									+" <i class='small material-icons myclose'>arrow_drop_down</i></a></div>"
									+'<a href="#submit-report-modal" class="top-inte-report right report" title="举报"><i class="material-icons cyan-text">report</i></a>'
									+'<a href="#new-inte-modal" class="top-add-inte right modal-trigger" title="贡献释义"><i class="material-icons cyan-text">edit</i></a>'
									+'</div></div></li>';
						}

						else{
							html = '<li class="collection-item avatar"><div class="collapsible-header" id="entry-id'+id_entry+'">'
									+'<i class="material-icons teal-text text-darken-3 large">attach_file</i>'
									+'<h6 class="top-title" id="entry-title-top">'+name+'</h6><span class="badge">共有'+inte_number+'条释义</span></div>'
									+'<div class="collapsible-body"><a href="#!" class="secondary-content modal-trigger" title="其他释义" href="#entry-modal">'
									+'<i class="material-icons cyan-text">more</i></a>'
									+'<div class="entry-top"><div class="row">'
									+'<div class="col s12 m10 l9"><p id="entry-inte-top"></p></div>'
									+'</div><i class="material-icons cyan-text tiny close blue-grey-text">find_in_page</i><span class="top-inte-source"></span><br>'
									+'<i class="material-icons cyan-text tiny close blue-grey-text">access_time</i><span class="top-inte-daytime"></span><br>'
									+"<div class='chip chip-like'><a href='#' class='like'>"
									+"<i class='small material-icons myclose'>arrow_drop_up</i><span class='like-number' id='top_like_total'></span></a></div>"
									+"<div class='chip chip-dislike'><a href='#' class='dislike'>"
									+" <i class='small material-icons myclose'>arrow_drop_down</i></a></div>"
									+'<a href="#submit-report-modal" class="top-inte-report right report" title="举报"><i class="material-icons cyan-text">report</i></a>'
									+'<a href="#new-inte-modal" class="top-add-inte right modal-trigger" title="贡献释义"><i class="material-icons cyan-text">edit</i></a>'
									+'</div></div></li>';
						}
						$('#main-page-search-results').show();
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

	});


	/*
	* 词条其他释义显示
	* 功能：
	*	点开词条，显示其他释义
	*
	* 待完成功能：
	*	现在只做了能查询到，查询的id是固定的
	*	链接还没跟指定的词条名称关联
	*	接下来要设置点击时自动获取词条id进行查询
	*
	*/

	$('body').on('click','a[id^="otherinte-"]',function(){
		var ids = $(this).attr('id');
		ids = ids.split('-');
		var id_entry = ids[1];
		var top_id_inte = ids[2];

		// console.log(trigger[0]);

		// 清空词条框
		$('#entry-modal-content').html('');

		// 获取trigger(a标签)的同级下一个节点，即之前查询词条时放在那的p标签里的词条id
		// var entry_id = trigger[0].nextSibling.innerHTML;

		if($(this).hasClass('no-other-inte').toString()=='true'){
			var html = "<div class='div-otherinte'><p>目前该词条没有其他释义</p><span>可点击右侧按钮添加你的答案</span>"
			+'<a class="btn-floating btn-tiny waves-light waves-effect add-meaning modal-trigger right" id="addinte-'
			+id_entry+'"><i class="material-icons">edit</i></a></div>';

			$('#entry-modal-content').append(html);
		}

		else{
			$.ajax({
				type:'GET',
				url: server_url + 'Entry/search_inte/',
				timeout: 3000,
				async: true,
				dataType: 'json',
				data: {
					entry_id: id_entry
				},
				success: function(result) {
					console.log(JSON.stringify(result));
					if(result.result == 'empty') {
						$('#entry-modal-title').html("没有相关结果");
						return;
					}
					for(i in result.inte) {
						// "<h5>词条id: "+id_entry+"</h5>" +
						// "<p id='id-inte-p'> "++"</p>" +
						// "<p>用户id: "+result.inte[i].id_user+"</p>" +
						// "<p>释义: "+result.inte[i].interpretation+"</p>" +
						// "<p>来源: "+result.inte[i].resource+"</p>" +
						// "<p>创建时间: "+result.inte[i].datetime+"</p>";

						if(result.inte[i].id_interpretation != top_id_inte){
							var like = result.like.filter(item => item.id_interpretation == result.inte[i].id_interpretation);
							var like_total = 0;
							if(JSON.stringify(like) === '[]' || like.length === 0) {
								like_total = 0;
							} else {
								like_total = like[0].like_total;
							}

							var html = '<div class="row"><div class="col s12 m10"><div class="card blue-grey darken-1">'
							+'<div class="card-content white-text"><span class="card-inte-title">'+result.inte[i].interpretation+'</span><br><br>'
							+'<i class="material-icons tiny close">find_in_page</i><span class="other-inte-source">'+result.inte[i].resource+'</span><br>'
							+'<i class="material-icons tiny close">access_time</i><span class="other-inte-daytime">'+result.inte[i].datetime+'</span><br>'
							+'</div><div class="card-action"><a href="#" class="like other-inte"  id="othermeaning-'+id_entry+"-"+result.inte[i].id_interpretation+'"><i class="tiny material-icons other-close">thumb_up</i>'
							+'<span class="like-number" id="other_like_total">'+like_total+'</span></a>'
							+'<a href="#" class="dislike other-inte" id="othermeaning-'+id_entry+"-"+result.inte[i].id_interpretation+'"><i class="tiny material-icons other-close">thumb_down</i></a>'
							+'<a href="#submit-report-modal" class="other-inte-report report" title="举报"><i class="material-icons">report</i></a>'
							+'</div></div></div></div>';

							$('#entry-modal-content').append(html);
						}

					}

				},
				error: function(error) {
					alert('查询请求错误，请重试');
					console.log(JSON.stringify(error));
					// error display
					$('#entry-modal-content').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});
		}

		$('#entry-modal').modal('open');
	});


	// $('#entry-modal').modal({
	// 	ready: function(modal, trigger) {
		// 	console.log(trigger[0]);
    //
		// 	// 清空词条框
		// 	$('#entry-modal-content').html('');
		// 	$('#entry-modal').modal('open');
    //
		// 	获取trigger(a标签)的同级下一个节点，即之前查询词条时放在那的p标签里的词条id
		// 	var entry_id = trigger[0].nextSibling.innerHTML;
    //
		// 	$.ajax({
		// 		type:'GET',
		// 		url: server_url + 'Entry/search_inte/',
		// 		timeout: 3000,
		// 		async: true,
		// 		dataType: 'json',
		// 		data: {
		// 			entry_id: entry_id
		// 		},
		// 		success: function(result) {
		// 			console.log(JSON.stringify(result));
		// 			if(result.result == 'empty') {
		// 				$('#entry-modal-title').html("没有相关结果");
		// 				return;
		// 			}
		// 			for(i in result.inte) {
		// 				var html = "<h4>词条id: "+entry_id+"</h4>" +
		// 				"<p id='id-inte-p'> "+result.inte[i].id_interpretation+"</p>" +
		// 				"<p>用户id: "+result.inte[i].id_user+"</p>" +
		// 				"<p>释义: "+result.inte[i].interpretation+"</p>" +
		// 				"<p>来源: "+result.inte[i].resource+"</p>" +
		// 				"<p>创建时间: "+result.inte[i].datetime+"</p>";
		// 				var like = result.like.filter(item => item.id_interpretation == result.inte[i].id_interpretation);
		// 				var like_total = 0;
		// 				if(JSON.stringify(like) === '[]' || like.length === 0) {
		// 					like_total = 0;
		// 				} else {
		// 					like_total = like[0].like_total;
		// 				}
		// 				html += "<a class='chip like-btn' style='cursor:pointer;'>赞"+
		// 					like_total+"<i class='material-icons'>arrow_drop_up</i></a>";
		// 				$('#entry-modal-content').append(html);
		// 			}
    //
		// 		},
		// 		error: function(error) {
		// 			alert('查询请求错误，请重试');
		// 			console.log(JSON.stringify(error));
		// 			// error display
		// 			$('#entry-modal-content').html(error.responseText);
		// 			return;
		// 		},
		// 		scriptCharset: 'utf-8'
		// 	});
    //
		// }
  //
	// });

	/*
	* 词条置顶释义显示
	* 功能：
	*	点开词条，显示释义（只显示置顶释义）
	*
	*/
	$('body').on('click','div[id^="entry-id"]',function(){
		var this_node = $(this);
		var id_entry=$(this).attr('id');
		var id_entry=id_entry.substring(8);

		if($(this).hasClass('no-inte').toString()=='true'){
			this_node.next().html('');

			var html = "<div class='div-otherinte'><p>目前该词条没有释义</p><span>可点击右侧按钮添加新的释义</span>"
			+'<a class="btn-floating btn-tiny waves-light waves-effect add-meaning modal-trigger right" id="addinte-'
			+id_entry+'"><i class="material-icons">edit</i></a></div>';

			this_node.next().append(html);
		}

		else{
			// 更改为同步
			$.ajaxSettings.async = false;

			$.get(server_url+'Entry/search_inte',
				{entry_id: id_entry}, function(result) {
					console.log(JSON.stringify(result));
					if(JSON.stringify(result.inte) === '[]'|| result.inte.length === 0){
						inte_number = 0;
					}
					else{
						inte_number = result.inte.length;
					}

					// 当词条没有释义时，出现提示
					if(inte_number==0){
						this_node.next().html('');
					}

					// 显示置顶释义
					else{
						var most_like = 0;
						var top_id_inte = result.inte[0].id_interpretation;
						var top_inte = result.inte[0].interpretation;
						var top_inte_source = result.inte[0].resource;
						var top_inte_daytime = result.inte[0].datetime;

						// 选出置顶释义
						for(i in result.inte) {
							var like_total = 0;
							var like = result.like.filter(item => item.id_interpretation == result.inte[i].id_interpretation);
							if(JSON.stringify(like) === '[]' || like.length === 0) {
								like_total = 0;
							} else {
								like_total = like[0].like_total;
							}

					    if(like_total > most_like){
								most_like = like_total;
								top_inte = result.inte[i].interpretation;
								top_id_inte = result.inte[i].id_interpretation;
								top_inte_source = result.inte[i].resource;
								top_inte_daytime = result.inte[i].datetime;
							}
						}

						var inte_node = this_node.next().children('.entry-top').children('.row').children('.col').children('#entry-inte-top');
						inte_node.html(top_inte);
						var source_node = this_node.next().children('.entry-top').children('.top-inte-source');
						source_node.html(top_inte_source);
						var daytime_node = this_node.next().children('.entry-top').children('.top-inte-daytime');
						daytime_node.html(top_inte_daytime);
						var like_node = this_node.next().children('.entry-top').children('.chip-like').children('a');
						like_node.attr('id',"toplike-"+id_entry+"-"+top_id_inte);
						like_node.children('#top_like_total').html(most_like);
						var dislike_node = this_node.next().children('.entry-top').children('.chip-dislike').children('a');
						dislike_node.attr('id',"topdislike-"+id_entry+"-"+top_id_inte);
						var other_inte_node = this_node.next().children('a:first-child');
						other_inte_node.attr('id','otherinte-'+id_entry+'-'+top_id_inte);

					}

				}, 'json');
		}

	});

	/*
	* 点赞
	* 功能：
	*  获取释义id
	*  获取用户id
	*
	* 待完成功能：
	*
	*/
	$('body').on('click','.like',function(){
		var id_user = -1;
		var id= $(this).attr("id").split('-');
		var id_entry = id[1];
		var id_inte = id[2];
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
						// console.log(JSON.stringify(like_number));
						// $('#like_number').text(like_number);

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
								alert(like_total)

								if(son_node.hasClass('other-inte').toString()!='true'){
									son_node.children('#top_like_total').text(like_total);
									parent_node.css('background-color','#80cbc4');
									son_node.addClass('white-text');
									if(parent_node.next().children("a:first-child").hasClass('white-text').toString()=='true'){
										var nex=parent_node.next();
										nex.children("a:first-child").removeClass('white-text');
										nex.css('background-color','#eeeeee')
									}
								}

								else{
									son_node.children('#other_like_total').text(like_total);
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

	/*
	* 点灭
	*
	* 功能：
	*  获取释义id
	*  获取用户id
	*
	* 待完成功能：
	*
	*/
	$('body').on('click','.dislike',function(){
		var id_user = -1;
		var id= $(this).attr("id").split('-');
		var id_entry = id[1];
		var id_inte = id[2];
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
						// console.log(JSON.stringify(like_number));
						// $('#like_number').text(like_number);

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

								if(son_node.hasClass('other-inte').toString()!='true'){
									parent_node.prev().children("a:first-child").children('#top_like_total').text(like_total);
									parent_node.css('background-color','#80cbc4');
									son_node.addClass('white-text');
									if(parent_node.prev().children("a:first-child").hasClass('white-text').toString()=='true'){
										var pre=parent_node.prev();
										pre.children("a:first-child").removeClass('white-text');
										pre.css('background-color','#eeeeee')
									}
								}
								else{
									son_node.prev().children('#other_like_total').text(like_total);
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

	$('#entry-modal').on('click', 'a.like-btn', function() {

		var id_user = -1;
		/*



		// 这里有BUG！！！
		// 释义id不是这么获取的


		*/
		var id_inte = $('#id-inte-p').html();

		chrome.storage.sync.get({
			BW_userId: -1
		},
		function(items) {
			id_user = items.BW_userId;
			// validate
			if(id_user == -1 || id_inte == null) {
				alert('Cannot get correct user ID.')
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


	/*
	* 创建词条
	* 功能：
	*  根据名字创建词条
	*	请求次数为1
	*
	* 待完成功能：
	*
	*/
	$('#new-entry-btn').click(function() {

		var entry_name = $('#entry-name').val();

		if( ! strFilter(entry_name, 'entry_name')) {
			alert('不能输入特殊符号！除: ? ! , 。')
			return;
		}

		$.ajax({
			type:'GET',
			url: server_url + 'Entry/new_entry',
			timeout: 5000,
			async: true,
			dataType: 'json',
			data: {
				entry_name: entry_name
			},
			success: function(result) {
				if(result.result == 'success') {
					console.log(JSON.stringify(result));
					alert('词条创建成功！\n可进行查询')
					$('#new-entry-modal').modal('close');
				}
				if(result.result == 'failure') {
					alert('创建词条失败!\n' + result.error_msg);
				}
			},
			error: function(error) {
				alert('创建时ajax错误，请重试');
				console.log(JSON.stringify(error));
				$('#new-entry-modal').html(error.responseText);
				return;
			},
			scriptCharset: 'utf-8'
		});

	});


	/*
	* 为词条添加释义
	* 功能：
	*  确定词条id，提取用户id
	*	填写释义和来源（可选）并提交
	*
	* 待完成功能：
	*	词条id由点击词条时自动获取
	*
	*/
	$('#new-inte-btn').click(function() {

		var id_entry = $('#id-entry').val();
		var inte = $('#inte').val();
		var resource = $('#resource').val();
		var id_user = -1;

		// 验证 inte 和 resource 的内容， 防SQL注入
		if( ! (strFilter(inte, 'inte') && strFilter(resource, 'inte'))) {
	    alert("大佬放过我吧"); //注意中文乱码
			return false;
		}

		// 获取当前登录用户id
		/*
		* !!! IMPORTANT !!!
		*
		* chrome storage 事件为同步，故总是在其他异步代码(js一般都是)后执行
		* 故在callback函数外下一步取id_user时失败
		*
		* solution:
		*	将涉及到取得的值的操作，都放在callback函数里操作
		*
		* refer:
		*	https://stackoverflow.com/questions/12252817/how-chrome-storage-local-get-sets-a-value
		*/
		chrome.storage.sync.get({
			BW_userId: -1
		},
		function(items) {
			id_user = items.BW_userId;
			// validate
			if(id_entry == null || inte == null) {
				alert('Entry Id & intepretation are required!');
				return;
			}
			if(id_user == -1) {
				alert('Cannot get correct user ID.')
				return;
			}

			$.ajax({
				type:'POST',
				url: server_url + 'Entry/insert_inte/',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					id_entry: id_entry,
					id_user: id_user,
					inte: inte,
					resource: resource
				},
				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						alert('添加释义成功！')
						$('#new-inte-modal').modal('close');
					}
					if(result.result == 'failure') {
						alert('添加释义失败!\n' + result.error_msg);
					}
				},
				error: function(error) {
					alert('ajax错误，请重试');
					console.log(JSON.stringify(error));
					$('#new-inte-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});

		//阻止表单提交
		return false;

	});


	/*
	* 编辑词条
	* 功能：
	*  确定词条id，验证用户身份权限
	*	输入词条新内容
	*
	* 待完成功能：
	*	词条id由点击词条时自动获取
	*	用户权限身份验证
	*
	*/
	$('#edit-entry-btn').click(function() {

		var entry_id = $('#edit-entry-id').val();
		var entry_name = $('#edit-entry-name').val();
		var id_user = -1;

		// 输入内容过滤验证
		if( ! strFilter(entry_name, 'entry_name')) {
			alert('不能输入特殊符号！除: ? ! , 。')
			return;
		}

		// 获取当前登录用户id
		/*
		* !!! IMPORTANT !!!
		*
		* chrome storage 事件为同步，故总是在其他异步代码(js一般都是)后执行
		* 故在callback函数外下一步取id_user时失败
		*
		* solution:
		*	将涉及到取得的值的操作，都放在callback函数里操作
		*
		* refer:
		*	https://stackoverflow.com/questions/12252817/how-chrome-storage-local-get-sets-a-value
		*/
		chrome.storage.sync.get({
			BW_userId: -1,
			BW_userIdentity: -1
		},
		function(items) {
			id_user = items.BW_userId;
			user_identity = items.BW_userIdentity;
			// validate
			if(entry_id == null || entry_name == null) {
				alert('Entry Id & Entry Name are required!');
				return;
			}
			if(id_user == -1 || user_identity == -1) {
				alert('Cannot get correct user ID.\n请尝试重新登录')
				return;
			}

			$.ajax({
				type:'POST',
				url: server_url + 'Entry/edit_entry/',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					entry_id: entry_id,
					entry_name: entry_name,
					id_user: id_user,
					user_identity: user_identity
				},
				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						alert('编辑词条成功！')
						$('#edit-entry-modal').modal('close');
					}
					if(result.result == 'failure') {
						alert('编辑词条失败!\n' + result.error_msg);
					}
				},
				error: function(error) {
					alert('ajax错误，请重试');
					console.log(JSON.stringify(error));
					$('#edit-entry-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});

		//阻止表单提交
		return false;

	});


	/*
	* 删除词条
	* 功能：
	*  确定词条id，验证用户身份权限
	*	确认删除词条
	*
	* 待完成功能：
	*	词条id由点击词条时自动获取
	*	用户权限身份验证
	*
	*/
	$('#delete-entry-btn').click(function() {

		var entry_id = $('#delete-entry-id').val();
		var id_user = -1;
		chrome.storage.sync.get({
			BW_userId: -1,
			BW_userIdentity: -1
		},
		function(items) {
			id_user = items.BW_userId;
			user_identity = items.BW_userIdentity;
			// validate
			if(entry_id == null) {
				alert('Entry Id is required!');
				return;
			}
			if(id_user == -1 || user_identity == -1) {
				alert('Cannot get correct user ID.\n请尝试重新登录')
				return;
			}

			$.ajax({
				type:'POST',
				url: server_url + 'Entry/delete_entry/',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					entry_id: entry_id,
					id_user: id_user,
					user_identity: user_identity
				},
				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						alert('删除词条成功！')
						$('#delete-entry-modal').modal('close');
					}
					if(result.result == 'failure') {
						alert('删除词条失败!\n' + result.error_msg);
					}
				},
				error: function(error) {
					alert('ajax错误，请重试');
					console.log(JSON.stringify(error));
					$('#edit-entry-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});

		//阻止表单提交
		return false;

	});


	/*
	* 编辑释义
	* 功能：
	*  确定释义id，验证用户身份权限
	*	输入释义新内容
	*
	* 待完成功能：
	*	释义id由点击释义时自动获取
	*	用户权限身份验证
	*
	*/
	$('#edit-inte-btn').click(function() {

		var inte_id = $('#edit-inte-id').val();
		var inte = $('#edit-inte').val();
		var resource = $('#edit-resource').val();
		var id_user = -1;

		// 验证 inte 和 resource 的内容， 防SQL注入
		if( ! (strFilter(inte, 'inte') && strFilter(resource, 'inte'))) {
	    alert("大佬放过我吧"); //注意中文乱码
			return false;
		}

		chrome.storage.sync.get({
			BW_userId: -1,
			BW_userIdentity: -1
		},
		function(items) {
			id_user = items.BW_userId;
			user_identity = items.BW_userIdentity;
			// validate
			if(inte_id == null || inte == null) {
				alert('Interpretation Id & Interpretation are required!');
				return;
			}
			if(id_user == -1 || user_identity == -1) {
				alert('Cannot get correct user ID.\n请尝试重新登录')
				return;
			}

			$.ajax({
				type:'POST',
				url: server_url + 'Entry/edit_inte/',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					inte_id: inte_id,
					inte: inte,
					resource: resource,
					id_user: id_user,
					user_identity: user_identity
				},
				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						alert('编辑释义成功！')
						$('#edit-inte-modal').modal('close');
					}
					if(result.result == 'failure') {
						alert('编辑释义失败!\n' + result.error_msg);
					}
				},
				error: function(error) {
					alert('ajax错误，请重试');
					console.log(JSON.stringify(error));
					$('#edit-entry-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});

		//阻止表单提交
		return false;

	});


	/*
	* 删除释义
	* 功能：
	*  确定释义id，验证用户身份权限
	*	确认删除释义
	*
	* 待完成功能：
	*	释义id由点击词条时自动获取
	*	用户权限身份验证
	*
	*/
	$('#delete-inte-btn').click(function() {

		var inte_id = $('#delete-inte-id').val();
		var id_user = -1;
		chrome.storage.sync.get({
			BW_userId: -1,
			BW_userIdentity: -1
		},
		function(items) {
			id_user = items.BW_userId;
			user_identity = items.BW_userIdentity;
			// validate
			if(inte_id == null) {
				alert('Interpretation Id is required!');
				return;
			}
			if(id_user == -1 || user_identity == -1) {
				alert('Cannot get correct user ID.\n请尝试重新登录')
				return;
			}

			$.ajax({
				type:'POST',
				url: server_url + 'Entry/delete_inte/',
				timeout: 5000,
				async: true,
				dataType: 'json',
				data: {
					inte_id: inte_id,
					id_user: id_user,
					user_identity: user_identity
				},
				success: function(result) {
					if(result.result == 'success') {
						console.log(JSON.stringify(result));
						alert('删除释义成功！')
						$('#delete-inte-modal').modal('close');
					}
					if(result.result == 'failure') {
						alert('删除释义失败!\n' + result.error_msg);
					}
				},
				error: function(error) {
					alert('ajax错误，请重试');
					console.log(JSON.stringify(error));
					$('#edit-entry-modal').html(error.responseText);
					return;
				},
				scriptCharset: 'utf-8'
			});

		});

		//阻止表单提交
		return false;

	});


	$('#exit').click(function(){
		// 将用户名，用户Id存入storage
		chrome.storage.sync.set({
			BW_username: 'unknown',
			BW_userId: -1,
			BW_userIdentity: -1,
			BW_userIsBanned: -1,
			BW_userEmail: '',
			BW_userPhone: '',
			BW_userGender: '',
			BW_userProfile: '',
		},function() {
			update_user();
		});
	});

	$('body').on('click','a[id^="addinte-"]',function(){
		// var id_entry = $(this).attr('id');
		// var temp = id_entry.split('-');
		// id_entry = temp[1];

		$('#new-inte-modal').modal('open');
		// $('#id-entry').val(id_entry);
		// $('#name-entry').val(name_entry);
	});

	$('#first-page-search').click(function(){
		$('#main-page').show();
		$('#first-page').hide();

	});

	$('body').on('click','.report',function(){
		alert('已经向管理员成功发送举报消息！');
		// alert('发送举报消息失败！\n请再次尝试！');
	});


	// 背景粒子特效

	var canvas = document.getElementById("cas");
	var ctx = canvas.getContext("2d");

	resize();
	window.onresize = resize;

	function resize() {
	  canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	  canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	}

	var RAF = (function() {
	  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
	        window.setTimeout(callback, 1000 / 60);
	      };
	})();

	// 鼠标活动时，获取鼠标坐标
	var warea = {x: null, y: null, max: 20000};
	window.onmousemove = function(e) {
	  e = e || window.event;

	  warea.x = e.clientX;
	  warea.y = e.clientY;
	};
	window.onmouseout = function(e) {
	  warea.x = null;
	  warea.y = null;
	};

	// 添加粒子
	// x，y为粒子坐标，xa, ya为粒子xy轴加速度，max为连线的最大距离
	var dots = [];
	for (var i = 0; i < 175; i++) {
	  var x = Math.random() * canvas.width;
	  var y = Math.random() * canvas.height;
	  var xa = Math.random() * 2 - 1;
	  var ya = Math.random() * 2 - 1;

	  dots.push({
	    x: x,
	    y: y,
	    xa: xa,
	    ya: ya,
	    max: 6500
	  })
	}

	// 延迟100秒开始执行动画，如果立即执行有时位置计算会出错
	setTimeout(function() {
	  animate();
	}, 100);

	// 每一帧循环的逻辑
	function animate() {
	  ctx.clearRect(0, 0, canvas.width, canvas.height);

	  // 将鼠标坐标添加进去，产生一个用于比对距离的点数组
	  var ndots = [warea].concat(dots);

	  dots.forEach(function(dot) {

	    // 粒子位移
	    dot.x += dot.xa;
	    dot.y += dot.ya;

	    // 遇到边界将加速度反向
	    dot.xa *= (dot.x > canvas.width || dot.x < 0) ? -1 : 1;
	    dot.ya *= (dot.y > canvas.height || dot.y < 0) ? -1 : 1;

	    // 绘制点
	    ctx.fillRect(dot.x - 0.5, dot.y - 0.5, 1, 1);

	    // 循环比对粒子间的距离
	    for (var i = 0; i < ndots.length; i++) {
	      var d2 = ndots[i];

	      if (dot === d2 || d2.x === null || d2.y === null) continue;

	      var xc = dot.x - d2.x;
	      var yc = dot.y - d2.y;

	      // 两个粒子之间的距离
	      var dis = xc * xc + yc * yc;

	      // 距离比
	      var ratio;

	      // 如果两个粒子之间的距离小于粒子对象的max值，则在两个粒子间画线
	      if (dis < d2.max) {

	        // 如果是鼠标，则让粒子向鼠标的位置移动
	        if (d2 === warea && dis > (d2.max / 2)) {
	          dot.x -= xc * 0.03;
	          dot.y -= yc * 0.03;
	        }

	        // 计算距离比
	        ratio = (d2.max - dis) / d2.max;

	        // 画线
	        ctx.beginPath();
	        ctx.lineWidth = ratio / 2;
	        ctx.strokeStyle = 'rgba(0,128,128,' + (ratio + 0.2) + ')'; // 暂定线条颜色为绿色
	        ctx.moveTo(dot.x, dot.y);
	        ctx.lineTo(d2.x, d2.y);
	        ctx.stroke();
	      }
	    }

	    // 将已经计算过的粒子从数组中删除
	    ndots.splice(ndots.indexOf(dot), 1);
	  });

	  RAF(animate);
	}

});
