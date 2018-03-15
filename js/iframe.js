

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
				entrys: []
			}
		},
		methods: {
		  search() {
				// 搜索栏回车搜索时，进行词条查询
				var _this = this;
				_this.is_empty = false;
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
		  },
			inte(id_entry, name_entry) {
				// 将词条id赋值给释义列表页面
				this.$emit('id_entry_pass', {
					id_entry: id_entry,
					name_entry: name_entry
				});
				// 更改视图
				search_entry_vue.currentView = 'inte-list';
			}
		},
		created() {
		  // 在创建后自动查询传来的词条名
			var _this = this;
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
		},
		template: `
			<div class="row">
				<div class="col m11">
					<div class="input-field">
						<input type="search" id="search"
						v-model="search_input"
						v-on:keyup.enter="search" />
						<i class="material-icons" >search</i>
					</div>
				</div>
				<div class="col m1">
					<i class="material-icons small modal-action modal-close" id="close-btn">close</i>
				</div>
			</div>

			<template v-if="is_empty">
				<div class="row">
					<div class="col m11">
						<h5 >暂未有相关词条</h5>
						<!-- 请求创建词条模块 -->
					</div>
				</div>
			</template>

			<div class="row" >
					<div class="collection">
						<a class="collection-item"
						v-for="entry in entrys"
						v-bind:key="entry.id_entry"
						v-on:click="inte(entry.id_entry, entry.name)">
						{{ entry.name }}</a>
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
				intes: [],
				likes: []
			}
		},
		methods: {
			// 从Entry_List中接收词条id
			back_to_entry() {
				// 返回词条列表组件
				search_entry_vue.currentView = 'entry-list';
			}
		},
		created() {
			var _this = this;
			if(_this.id_entry != -1) {
				// 查找词条下的释义
				$.ajax({
					type:'GET',
					url: server_url + 'Entry/search_inte/',
					dataType: 'json',
					data: {
						entry_id: _this.id_entry
					},
					success: function(result) {
						console.log("总结果数组: "+JSON.stringify(result));
						if(result.result == 'empty') {
							return;
						}
						for(i in result.inte) {
							_this.intes.push(result.inte[i]);
							// var like = result.like.filter(item => item.id_interpretation == result.inte[i].id_interpretation);
							// html += "<a class='chip like-btn' style='cursor:pointer;'>赞"+
							// 	like[0].like_total+"<i class='material-icons'>arrow_drop_up</i></a>";
						}
						// _this.like.push(result.like);
						console.log("点赞数组: "+JSON.stringify(_this.like))
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

			<div class="row">
				<div class="col m12">
					<ul class="collapsible">
						<li>
							<div class="collapsible-header"></div>
							<div class="collapsible-body"></div>
						</li>
					</ul>
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
