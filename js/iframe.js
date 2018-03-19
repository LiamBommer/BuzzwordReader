

	// 本机测试用服务器
	var server_url = 'http://127.0.0.1/BuzzwordReader/';
	// 生产环境公网服务器
	// var server_url = 'http://119.29.58.165:81/index.php/';


// receive message function from parent window
// Here because it can't wait to receive message until
// the page is loaded
var search_content = "";
window.addEventListener('message', function(event) {
	if(event.data.act == 'search_content') {
		search_content = event.data.msg;
	}

}, false);


$(document).ready(function() {

	// modal init
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
	// modal default open
	$('#search-entry-div').modal('open');


	/*
	 * 组件：
	 *   词条搜索列表
	 */
	var Entry_list = {
		data: function() {
			return {
				is_empty: false,
				search_input: search_content,
				search_note: '暂未有相关词条',
				entrys: [],
				intes: [],
				likes: []
			}
		},
		methods: {
		  search() {
				// 搜索栏回车搜索时，进行词条查询
				var _this = this;
				if(_this.search_input == '' || _this.search_input == null) {
					// 空搜索内容，提示并返回
					_this.search_note = '总要搜索点什么吧？';
					_this.is_empty = true;
					return;
				} else {
					_this.is_empty = false;
				// 过滤输入内容： 空格，特殊符号等
				}
				$.ajax({
					type:'GET',
					url: server_url + 'Entry/search_entry/',
					dataType: 'json',
					data: {
						search_content: _this.search_input
					},
					success: function(result) {
						console.log('ajax结果： '+JSON.stringify(result));
						// 清空原来的结果
						_this.entrys = [];
						if(result.result == 'empty') {
							_this.search_note = '暂未有相关词条';
							_this.is_empty = true;
							return;
						} else {
							// 将查找到的词条数组存起来
							for(i in result) {
								console.log(result[i]);
								_this.entrys.push(result[i]);
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

				// 改变search_content,使得返回这界面时能够保存查找信息
				search_content = _this.search_input;
		  },
			inte(id_entry, name_entry) {
				// 将词条id赋值给释义列表页面
				this.$emit('id_entry_pass', {
					id_entry: id_entry,
					name_entry: name_entry
				});
				// 更改视图
				search_entry_vue.currentView = 'inte-list';
			},
			get_shortcut(id_entry) {
				// 获取第一个释义，和用户名
				// 获取本词条下所有释义和点赞数组
				var intes = [];
				if(id_entry != -1) {
					// 查找词条下的释义
					$.ajax({
						type:'GET',
						url: server_url + 'Entry/search_inte/',
						async: false,
						dataType: 'json',
						data: {
							entry_id: id_entry
						},
						success: function(result) {
							// console.log("查找释义ajax结果: "+JSON.stringify(result));
							if(result.result == 'empty') {
								return;
							} else {
								if(JSON.stringify(result.inte) != '[]')
									for(i in result.inte) {
										intes.push(result.inte[i]);
									}
									console.log("释义数组: "+JSON.stringify(intes));
							}
						},
					});
				} else {
					// 获取不到词条id
					alert('id_entry = '+id_entry);
					return ;
				}
				if(JSON.stringify(intes) != '[]') {
					// 释义不为空
					// 根据用户id，获取用户名
					var username = "";
					var top_user_id = intes[0].id_user;
					$.ajax({
						type:'GET',
						url: server_url + 'User/search_user/',
						async: false,
						dataType: 'json',
						data: {
							id_user: top_user_id
						},
						success: function(result) {
							console.log("用户信息： "+JSON.stringify(result));
							if(result.result == 'empty') {
								username = "can't find user";
							} else {
								username = result.username;
							}
						}
					});

					return username+": "+intes[0].interpretation;

				} else {
					return '';
				}

				var likes = _this.likes[0];
				// var like_most = -1;
				// var top_inte_id = -1;
				// var top_inte = "";
				// var top_user_id = -1;
				// // 遍历点赞数组和词条数组
				// for(var i=0; i<likes.length; i++) {
				// 	for(var j=0; j<_this.intes.length; j++) {
				// 		// 取出本词条的数组
				// 		if(likes[i].id_interpretation == _this.intes[j].id_interpretation) {
				// 			// 比较是否是最多赞的释义
				// 			top_inte_id = likes[i].id_interpretation;
				// 			top_inte = _this.intes[j].interpretation;
				// 			like_most = likes[i].like_total;
				// 			top_user_id = _this.intes[j].id_user;
				// 		}
				// 	}
				// }

			},
			addEntry(name_entry) {
				// 添加词条
				// 跳转到options页中，包含参数
				var url = "options-page/options.html?";
				url += "action=addEntry&name_entry="+name_entry;
				window.open(chrome.runtime.getURL(url));
			},
		},
		created() {
		  // 在创建后自动查询传来的词条名
			this.search();
		},
		template: `
			<div class="row">
				<div class="col m11">
					<div class="input-field z-depth-2">
						<input type="search" id="search"
						placeholder="搜索词条"
						v-model="search_input"
						v-on:keyup.enter="search" />
						<i class="material-icons" id="search-icon">search</i>
					</div>
				</div>
				<div class="col m1">
					<i class="material-icons small modal-action modal-close" id="close-btn">close</i>
				</div>
			</div>

			<template v-if="is_empty">
				<div class="row">
					<div class="col m12">
						<h5>{{ search_note }}</h5>
						<!-- 请求创建词条模块 -->
						<br/><br/>
						<p class="note">您可以通过
							<a style="cursor:pointer"
							v-on:click="addEntry(search_input)">创建词条</a>
							来开垦这片荒原！
						</p>
					</div>
				</div>
			</template>

			<div class="row" v-if="! is_empty">
				<div class="col m6 s12"
				v-for="entry in entrys"
				v-bind:key="entry.id_entry">
					<div class="card white hoverable" style="cursor:pointer"
					v-on:click="inte(entry.id_entry, entry.name)">
						<div class="card-content black-text">
							<a>
								<span class="card-title">
									{{ entry.name }}
								</span>
							</a>
							<p>{{ get_shortcut(entry.id_entry) }}</p>
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col m12">
					<br/>
					<p class="note">没有找到想要的词条？ 您还可以通过 <a style="cursor:pointer"
					v-on:click="addEntry(search_input)">创建词条</a>
					来丰富词条库！
					</p>
				</div>
			</div>
			`
	}


	/*
	 * 组件：
	 *   某词条具体释义列表
	 */
	var Inte_List= {
		props: ['prop_id_entry', 'prop_name_entry'],
		data: function() {
			return {
				id_entry: this.prop_id_entry,
				is_empty: false,
				intes: [],
				likes: [],
				likeClass: '',
				likeTextClass: '',
				dislikeClass: '',
				dislikeTextClass: ''
			}
		},
		methods: {
			// 从Entry_List中接收词条id
			back_to_entry() {
				// 返回词条列表组件
				search_entry_vue.currentView = 'entry-list';
			},
			get_username(id_user) {
				var username = "";

				// 根据id查找用户
				$.ajax({
					type:'GET',
					url: server_url + 'User/search_user/',
					async: false,
					dataType: 'json',
					data: {
						id_user: id_user
					},
					success: function(result) {
						console.log("用户信息： "+JSON.stringify(result));
						if(result.result == 'empty') {
							username = "can't find user";
						} else {
							username = result.username;
						}
					}
				});

				// 返回 用户名
				// var inte_arr = _this.intes.filter(item => item.id_interpretation == id_inte);
				// var inte = inte_arr[0].interpretation;
				// 截取开头10个字符
				// var inte_short = inte.substr(0, 10);
				// return_str = username+": "+inte_short+"...";
				return username;
			},
			like_total(id_inte) {
				// 根据释义id在点赞数组里找出点赞数并返回
				var likes = this.likes[0];
				var like_total = 0;
				for(var i=0; i<likes.length; i++) {
					if(likes[i].id_interpretation == id_inte) {
						like_total = likes[i].like_total;
						return like_total;
					}
				}
				return like_total;
			},
			like(id_inte) {
				// 释义点赞
				var _this = this;
				// 用户id获取
				var id_user = -1;
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
							console.log("点赞： "+JSON.stringify(result));
							if(result.result == 'success') {
								// 更新like_total
								$.get(server_url+'Entry/search_inte',
									{entry_id: _this.id_entry}, function(result_inte) {
										//更新点赞数组
										if(result_inte.like !== undefined) {
											_this.likes = [];
											_this.likes.push(result_inte.like);
										}
									}, 'json');
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

			},
			dislike(id_inte) {
				// 点灭

				// 用户id获取
				var _this = this;
				var id_user = -1;
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
						url: server_url + 'Entry/dislike/',
						timeout: 5000,
						async: true,
						dataType: 'json',
						data: {
							id_user: id_user,
							id_inte: id_inte
						},
						success: function(result) {
							console.log("点灭： "+JSON.stringify(result));
							if(result.result == 'failure') {
								alert('点灭失败!\n' + result.error_msg);
							}else {
								// 更新like_total
								$.get(server_url+'Entry/search_inte',
									{entry_id: _this.id_entry}, function(result_inte) {
										//更新点赞数组
										if(result_inte.like !== undefined) {
											_this.likes = [];
											_this.likes.push(result_inte.like);
										}
									}, 'json');
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
			},
			addInte() {
				// 添加释义
				// 跳转到options页中，包含参数
				var url = "options-page/options.html?";
				url += encodeURI("action=addInte&id_entry="+this.prop_id_entry+"&name_entry="+this.prop_name_entry);
				window.open(chrome.runtime.getURL(url));
			},
		},
		created() {
			var _this = this;
			if(_this.id_entry != -1) {
				// 查找词条下的释义
				$.ajax({
					type:'GET',
					url: server_url + 'Entry/search_inte/',
					async: false,
					dataType: 'json',
					data: {
						entry_id: _this.id_entry
					},
					success: function(result) {
						console.log("查找释义ajax结果: "+JSON.stringify(result));
						if(result.result == 'empty') {
							return;
						}
						for(i in result.inte) {
							_this.intes.push(result.inte[i]);
						}
						if(result.like !== undefined) {
							_this.likes.push(result.like);
						}
						console.log("点赞数组: "+JSON.stringify(_this.likes))
						console.log("释义数组: "+JSON.stringify(_this.intes))
						// 若释义为空，则显示添加释义界面
						if(_this.intes === undefined || _this.intes.length == 0) {
							_this.is_empty = true;
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
			} else {
				// 获取不到词条id
				alert('id_entry = '+_this.id_entry);
				return;
			}

			// 在dom渲染完成后执行
			this.$nextTick(function() {
				$('.collapsible').collapsible();

				setTimeout(function() {
					$('.collapsible').collapsible('open', 0);
				}, 200);
			});
		},
		template: `
			<div class="row">
				<div class="col m1">
					<i class="material-icons small" id="back-btn"
					v-on:click="back_to_entry">arrow_back</i>
				</div>
				<div class="col m10">
					<h5 class="entry-title">{{ prop_name_entry }}</h5>
				</div>
				<div class="col m1">
					<i class="material-icons small modal-action modal-close" id="close-btn">close</i>
				</div>
			</div>

			<template v-if="is_empty">
				<div class="row">
					<div class="col m12">
						<br/>
						<h5>暂未有相关释义</h5>
						<!-- 添加释义模块 -->
						<br/>
						<p class="note">快来 <a style="cursor:pointer"
						v-on:click="addInte()">添加释义</a> 让别人能更方便地查找！
						</p>
					</div>
				</div>
			</template>

			<div class="row" v-if="! is_empty">
				<div class="col m12">
					<ul class="collapsible popout" data-collapsible="accordion">
						<li v-for="(index, inte) in intes">
							<div class="collapsible-header truncate ">
								<i class='material-icons'>account_circle</i>
								{{ get_username(inte.id_user) }}
							</div>
							<div class="collapsible-body ">
								{{ inte.interpretation }}
								<br/><br/><div class="divider"></div>
								<p><b>来源：</b>
									<a href="{{ inte.resource }}">{{ inte.resource }}</a>
								</p>
								<div class='chip like-btn' style='cursor:pointer;'
								v-on:click="like(inte.id_interpretation)">赞{{ like_total(inte.id_interpretation) }}
									<i class='material-icons like-icon'>arrow_drop_up</i>
								</div>
								<div class='chip dislike-btn' style='cursor:pointer;'
								v-on:click="dislike(inte.id_interpretation)">
									灭<i class='material-icons like-icon'>arrow_drop_down</i>
								</div>
							</div>
						</li>
					</ul>
					<br/>
					<p class="note">对这些解释都不满意？ 那不如动手
						<a style="cursor:pointer"
						v-on:click="addInte()">添加释义</a>
						来提供更准确的信息吧！
					</p>
				</div>
			</div>
			`
	}


	/*
	 * Vue 实例
	 */
	var search_entry_vue = new Vue({
		el: '#search-entry-div',
		data: {
			id_entry: -1,
			name_entry: 'entry_name',
			currentView: 'entry-list'
		},
		methods: {
			// 接收来自Entry List的Entry Id
			// 并传到Inte List中
			passEntryId: function(data) {
				this.id_entry = data.id_entry;
				this.name_entry = data.name_entry;
			}
		},
		components: {
		  'entry-list': Entry_list,
			'inte-list': Inte_List
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
