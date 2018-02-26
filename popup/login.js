$(document).ready(function(){
	// 本机测试用服务器
	// var server_url = 'http://127.0.0.1/BuzzwordReader/';
	// 生产环境公网服务器
	var server_url = 'http://119.29.58.165:81/index.php/';


/*
	 * 登录提交按钮事件
	 * 功能:
	 *	输入邮箱、电话、用户名任一个进行登录
	 *	登录成功后，服务器存用户session，插件storage存用户名
	 *
	 * 待完成功能：
	 *	鼠标离开后，进行检验
	 */
	$('#submit-btn').click(function() {
alert('success');

		// 输入合法性检验
		var email = $('#email').val();
		// var phone = $('#phone-login').val();
		var password = $('#password').val();

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
				// phone: phone,
				password: password
			},
			success: function(result) {
				if(result.result == 'success') {
					console.log(JSON.stringify(result));

					// 关闭模态框，清空内容
					// $('#login-modal').modal('close');
					// $('#email-login').val('');
					// $('#phone-login').val('');
					// $('#password-login').val('');

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
						chrome.storage.sync.get({
							// 取值： 默认值
							BW_username: 'unknown',
							BW_userId: -1
						},
						 function(items) {
							 // $('#username-div').html(items.BW_username);
							 // $('#userId-div').html(items.BW_userId);
						});
					});


				}
				if(result.result == 'failure') {
					// $('.modal-content > h4').html('注册失败');
					alert('登录失败!\n' + result.error_msg);
					$('#password').val('');
				}
			},
			
			error: function(error) {
				alert('登录错误，请重试');
				console.log(JSON.stringify(error));
				$('body').html(error.responseText);
				return;
			},
			scriptCharset: 'utf-8'
		});

		// 阻止表单提交
		return false;

	});


});