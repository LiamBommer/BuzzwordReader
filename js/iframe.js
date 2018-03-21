

// receive message function from parent window
// Here because it can't wait to receive message until
// the page is loaded
var search_content = "";

// receive message from parent window
window.addEventListener('message', function(event) {
	if(event.data.act == 'search_content') {
		search_content = event.data.msg;
	}
}, false);

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

		var specialStr = "";
	  for(var i=0;i<str.length;i++)
	  {
	       specialStr += str.substr(i, 1).replace(pattern, '');
	  }

	}

	return specialStr;
}


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
				is_searched: false,
				search_input: search_content,
				search_note: '暂未有相关词条',
				entrys: [],
				intes: [],
				intes: [],
				username: [],
				likes: []
			}
		},
		methods: {
		  	search_entry() {
				// 搜索栏回车搜索时，进行词条查询
				var _this = this;
				var filtedStr = "";
				// 过滤输入内容： 空格，特殊符号等
				filtedStr = strFilter(_this.search_input, 'search');
				if(filtedStr == '' || filtedStr == null) {
					// 空搜索内容，提示并返回
					_this.search_note = 'oops...未能获取到您想搜索什么？';
					_this.is_empty = true;
					_this.is_searched = false;
					return;
				} else {
					_this.is_empty = false;
					_this.is_searched = true;
				}

				// send message to background for searching result
				chrome.runtime.sendMessage({
					act: 'search_entry',
					filtedStr: filtedStr
				}, function(result) {
					console.log('词条查询ajax结果： '+JSON.stringify(result));
					// 清空原来的结果
					_this.entrys = [];
					_this.intes = [];
					if(result.result == 'empty') {
						_this.search_note = '暂未有相关词条';
						_this.is_empty = true;
						_this.is_searched = false;
						return;
					} else {
						// 将查找到的词条数组存起来
						for(i in result) {
							_this.entrys.push(result[i]);
						}

						// 遍历词条数组，查询释义
						for(i in _this.entrys) {

							// send message to background for searching result
							chrome.runtime.sendMessage({
								act: 'search_inte',
								// id_entry: _this.entrys.id_entry
								id_entry: _this.entrys[i].id_entry
							}, function(result) {

								console.log("查找释义ajax结果: "+JSON.stringify(result));
								if(JSON.stringify(result.inte) == '[]') {
									// return;
									// 此处为了不出错： read property of undefined
									// 需要手动赋值为空
									result.inte[0]['interpretation'] = ' ';
									result.inte[0]['username'] = ' ';
								}

								// 只插入第一条释义
								// _this.intes.push(result.inte[0]);
								_this.intes.push(result.inte[0]);

								// console.log("释义数组: "+JSON.stringify(_this.intes))
								console.log("释义数组: "+JSON.stringify(_this.intes));

							});

						}
					}
				});

				// 改变search_content,使得返回这界面时能够保存查找信息
				search_content = _this.search_input;
		  	},
			goto_inte(id_entry, name_entry) {
				// 将词条id赋值给释义列表页面
				this.$emit('id_entry_pass', {
					id_entry: id_entry,
					name_entry: name_entry
				});
				// 更改视图
				search_entry_vue.currentView = 'inte-list';
			},
			shortcut(index) {
				if(JSON.stringify(this.intes[index]) != '[]') {
					return this.intes[index].username + ": " + this.intes[index].interpretation;
				} else {
					return ''
				}
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
			this.search_entry();
		},
		template: `
			<div class="row">
				<div class="col m11 s11">
					<div class="input-field z-depth-2">
						<input type="search" id="search"
						placeholder="搜索词条"
						v-model="search_input"
						v-on:keyup.enter="search_entry" />
						<i class="material-icons" id="search-icon">search</i>
					</div>
				</div>
				<div class="col m1 s1">
					<i class="material-icons small modal-action modal-close" id="close-btn">close</i>
				</div>
			</div>

			<template v-if="is_empty">
				<div class="row">
					<div class="col m12 s12">
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
				v-for="(index, entry) in entrys"
				v-bind:key="entry.id_entry">
					<div class="card white hoverable" style="cursor:pointer"
					v-on:click="goto_inte(entry.id_entry, entry.name)">
						<div class="card-content black-text ">
							<a>
								<span class="card-title">
									{{ entry.name }}
								</span>
							</a>
							<div class="truncate">
								<!-- {{ intes[index].username }}: {{ intes[index].interpretation }} -->
								{{ shortcut(index) }}
							</div>
						</div>
						<div class="card-action">
							<span class="note">创建于 {{ entry.datetime }}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="row" v-if="is_searched">
				<div class="col m12 s12">
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
				username: [],
				likes: [],
			}
		},
		methods: {
			// 从Entry_List中接收词条id
			back_to_entry() {
				// 返回词条列表组件
				search_entry_vue.currentView = 'entry-list';
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

					chrome.runtime.sendMessage({
						act: 'like',
						id_user: id_user,
						id_inte: id_inte
					}, function(result) {

						console.log("点赞： "+JSON.stringify(result));
						if(result.result == 'success') {
							// 更新like_total

							chrome.runtime.sendMessage({
								act: 'search_inte',
								id_entry: _this.id_entry
							}, function(result) {
									//更新点赞数组
									console.log("点赞后刷新词条： "+JSON.stringify(result));
									if(result.like !== undefined) {
										_this.likes = [];
										_this.likes.push(result.like);
									}
							});

						} // result == 'success'
						if(result.result == 'failure') {
							alert('点赞失败!\n' + result.error_msg);
						}

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

					chrome.runtime.sendMessage({
						act: 'dislike',
						id_user: id_user,
						id_inte: id_inte
					}, function(result) {

						console.log("点灭： "+JSON.stringify(result));
						if(result.result == 'success') {
							// 更新like_total

							chrome.runtime.sendMessage({
								act: 'search_inte',
								id_entry: _this.id_entry
							}, function(result) {
									//更新点赞数组
									console.log("点灭后刷新词条： "+JSON.stringify(result));
									if(result.like !== undefined) {
										_this.likes = [];
										_this.likes.push(result.like);
									}
							});

						} // result == 'success'
						if(result.result == 'failure') {
							alert('点灭失败!\n' + result.error_msg);
						}

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

			// 查找词条下的释义
			if(_this.id_entry != -1) {

				// send message to background for searching result
				chrome.runtime.sendMessage({
					act: 'search_inte',
					id_entry: _this.id_entry
				}, function(result) {

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
				<div class="col m1 s1">
					<i class="material-icons small" id="back-btn"
					v-on:click="back_to_entry"
					v-on:esc="back_to_entry">arrow_back</i>
				</div>
				<div class="col m10 s10">
					<h5 class="entry-title">{{ prop_name_entry }}</h5>
				</div>
				<div class="col m1 s1">
					<i class="material-icons small modal-action modal-close" id="close-btn">close</i>
				</div>
			</div>

			<template v-if="is_empty">
				<div class="row">
					<div class="col m12 s12">
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
				<div class="col m12 s12">
					<ul class="collapsible popout" data-collapsible="accordion">
						<li v-for="(index, inte) in intes">
							<div class="collapsible-header truncate ">
								<i class='material-icons'>account_circle</i>
								{{ inte.username }}
							</div>
							<div class="collapsible-body ">
								{{ inte.interpretation }}
								<br/><br/><div class="divider"></div>
								<p><b>来源：</b>
									<a target="_blank" href="{{ inte.resource }}">{{ inte.resource }}</a>
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
