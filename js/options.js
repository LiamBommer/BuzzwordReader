$(document).ready(function() {

	// 模态框初始化
	$('#signup-modal').modal();
	$('#login-modal').modal();
	$('#info-modal').modal();
	$('#pw-modal').modal();

	var server_url = 'http://116.57.53.135/BuzzwordReader/';
	// var server_url = 'http://127.0.0.1/BuzzwordReader/';


	// 显示登录用户
	chrome.storage.sync.get('BW_username',
	 function(items) {
		 $('#user-div').html(items.BW_username);
	});


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
		if(gender != 'male' || gender != 'female') {
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
					// 将用户名存入storage
					chrome.storage.sync.set({
						BW_username: result.username
					},function() {
						// 更新登录用户
						chrome.storage.sync.get('BW_username',
						 function(items) {
							 $('#user-div').html(items.BW_username);
						});
					});
				}
				if(result.result == 'failure') {
					// $('.modal-content > h4').html('注册失败');
					alert('登录失败!\n' + result.error_msg);
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
			BW_username: 'not set'
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
						$('#info-collec-ul').append("<li class='collection-item'>"+result.data.email+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.data.phone+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.data.identity+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.data.gender+"</li>");
						$('#info-collec-ul').append("<li class='collection-item'>"+result.data.profile+"</li>");
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

});
