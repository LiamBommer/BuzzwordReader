$(document).ready(function() {

	// 模态框初始化
	$('#signup-modal').modal();
	$('#login-modal').modal();

	var server_url = 'http://116.57.53.135/BuzzwordReader/';
	// var server_url = 'http://127.0.0.1/BuzzwordReader/';


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
	 *
	 * 待完成功能：
	 *
	 */
	$('#login-btn').click(function() {

		// 输入合法性检验
		var username = $('#username-login').val();
		var password = $('#password-login').val();
		var email = $('#email-login').val();
		var phone = $('#phone-login').val();

		// ajax 传输
		$.ajax({
			type:'POST',
			url: server_url + 'User/login',
			timeout: 5000,
			// 同步进行
			async: false,
			dataType: 'json',
			data: {
				username: username,
				password: password,
				email: email,
				phone: phone
			},
			success: function(result) {
				if(result.result == 'success') {
					// $('.modal-content > h4').html('注册成功');
					console.log(JSON.stringify(result));
					$('#login-modal').modal('close');
				}
				if(result.result == 'failure') {
					// $('.modal-content > h4').html('注册失败');
					alert('注册失败!\n' + result.error_msg);
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


});
