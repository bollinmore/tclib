(function() {

	var gP,
		gM,
		gObject,
		topBarType,
		gRuntime,
		gOs,
		gPackage, errornum = 0;
	window.dongyi = window.dj = window.castapp = window.ca = {

		/**
		 * 初始化
		 */
		init: function(BarType, packageName) {
			/**
			 * true 深色  | false 淺色
			 */
			if (BarType) {
				topBarType = 'UIStatusBarStyleDefault';
			} else {
				topBarType = 'UIStatusBarStyleBlackOpaque';
			}
			var topBar = dongyi.tagName('header')['0'];
			gM = mui;
			gM.plusReady(function() {
				gP = plus;
				gOs = plus.os;
				gRuntime = plus.runtime;
				if (packageName) {
					localStorage.setItem('packageName', packageName);
					gPackage = packageName;
				} else {
					gPackage = localStorage.getItem('packageName');
					if (gPackage == null) {
						gPackage = dongyi.getRuntime('appid');
					}
				}
				if (topBar) {
					var topBarColor = getComputedStyle(topBar, false)['backgroundColor'];
					if (gM.os.ios) {
						gP.navigator.setStatusBarStyle(topBarType);
						gP.navigator.setStatusBarBackground(topBarColor);
					}
				}

			});
		},
		/**
		 * 通過ID獲取元素
		 * id_element 為id名
		 * @param {Object} id_data
		 */
		id: function(id_element) {
			return document.getElementById(id_element);
		},
		/**
		 * 通過Class獲取元素
		 * classElement 為class名
		 * @param {Object} parentElement 父級元素
		 * @param {Object} classElement
		 */
		className: function(parentElement, classElement) {
			if (classElement == undefined) {
				return document.getElementsByClassName(parentElement);
			}
			return parentElement.getElementsByClassName(classElement);
		},
		/**
		 * 通過標籤獲取元素
		 * tagElement 為元素名
		 * @param {Object} parentElement 父級元素
		 * @param {Object} tagElement
		 */
		tagName: function(parentElement, tagElement) {
			if (tagElement == undefined) {
				return document.getElementsByTagName(parentElement);
			}
			return parentElement.getElementsByTagName(tagElement);
		},
		/**
		 * 獲得螢幕的高度
		 * @param {Object} element
		 */
		getScreenInfo: function(element) {
			if (element == 'width') {
				return document.documentElement.clientWidth || document.body.clientWidth;
			} else {
				return document.documentElement.clientHeight || document.body.clientHeigth;
			}
		},
		/**
		 * 獲得當前時間
		 */
		getCurrentTime: function() {
			var oDate = new Date();
			var aDate = [];
			aDate.push(oDate.getFullYear());
			aDate.push(oDate.getMonth() + 1);
			aDate.push(oDate.getDate());
			aDate.push(oDate.getHours());
			aDate.push(oDate.getMinutes());
			aDate.push(oDate.getSeconds());
			aDate.push(oDate.getDay());
			aDate.push(oDate.getTime());
			return aDate;
		},
		/**
		 * 單擊事件
		 * @param {Object} element 元素
		 * @param {Object} succfn  成功的回調
		 */
		click: function(elementData, succfn) {
			elementData.addEventListener('tap', function() {
				succfn(this);
			});
		},
		/**
		 * 打開新頁面
		 * @param {Object} jsonData
		 */
		newInterface: function(jsonData) {
			if (jsonData.styles == undefined) {
				var styles = {};
				styles.top = '0px';
				styles.bottom = '0px';
				styles.width = '100%';
				styles.height = '100%';
				jsonData.styles = styles;
			} else {
				if (jsonData.styles.top == undefined) {
					jsonData.styles.top = "0px";
				}
				if (jsonData.styles.bottom == undefined) {
					jsonData.styles.bottom = "0px";
				} else {
					jsonData.styles.height = dongyi.getScreenInfo('height') - parseInt(jsonData.styles.bottom) + 'px';
				}
				if (jsonData.styles.width == undefined) {
					jsonData.styles.width = "100%";
				}
				if (jsonData.styles.height == undefined) {
					jsonData.styles.height = "100%";
				}
			}
			if (jsonData.show == undefined) {
				jsonData.show = true;
			}
			if (jsonData.showType == undefined) {
				//			jsonData.showType = 'zoom-fade-out';
				var aniShow = "slide-in-right";
				if (!mui.os.android) {
					aniShow = 'zoom-fade-out';
				}
				jsonData.showType = aniShow;
			}
			if (jsonData.showTime == undefined) {
				jsonData.showTime = 200;
			}
			if (jsonData.waiting == undefined) {
				jsonData.waiting = false;
			}
			gM.openWindow({
				url: jsonData.url,
				id: jsonData.id,
				styles: {
					top: jsonData.styles.top,
					bottom: jsonData.styles.bottom,
					width: jsonData.styles.width,
					height: jsonData.styles.height,
				},
				show: {
					autoShow: jsonData.show,
					aniShow: jsonData.showType,
					duration: jsonData.showTime
				},
				waiting: {
					autoShow: jsonData.waiting,
				}
			});
		},
		/**	
		 * 關閉當前介面
		 */
		closeCurrentInterface: function() {
			gM.back();
		},
		/**
		 * 底部導航
		 * @param {Object} arrayData Url數組
		 */
		tabBar: function(arrayData) {
			var subpage_style = {
				top: '0px',
				bottom: '50px', //根據底部導航的實際高度
				scrollIndicator: "none",
			};
			gM.plusReady(function() {
				dongyi.getCurrentInterface(function(self) {
					for (var i = 0; i < arrayData.length; i++) {
						var subpage = arrayData[i];
						var suff = subpage.indexOf('.');
						var objectName = subpage.substring(0, suff);
						var sub = plus.webview.create(arrayData[i], objectName, subpage_style);
						if (i > 0) {
							sub.hide();
						}
						self.append(sub);
					}
				});
			});
			var activeTab = arrayData[0];
			gM('.mui-bar-tab').on('tap', 'a', function(e) {
				var targetTab = this.getAttribute('href');
				if (targetTab == activeTab) {
					return;
				}
				var suff = targetTab.indexOf('.');
				targetTab = targetTab.substring(0, suff);
				plus.webview.show(targetTab);
				plus.webview.hide(activeTab);
				activeTab = targetTab + '.html';
			});

			ca.receiveNotice('gohome', function() {
				goHome();
			});

			document.addEventListener('gohome', goHome);

			function goHome() {
				var defaultTab = document.getElementById("defaultTab");
				mui.trigger(defaultTab, 'tap');
				var current = document.querySelector(".mui-bar-tab>.mui-tab-item.mui-active");
				if (defaultTab !== current) {
					current.classList.remove('mui-active');
					defaultTab.classList.add('mui-active');
				}

			}
		},
		/**
		 * 初始化底部導航 / goHome
		 * @param {Object} isRoot 
		 * @param {Object} interfaceId
		 */
		tabBarInit: function(isRoot, interfaceId) {
			if (isRoot == true) {
				var objectId = 'root';
			} else {
				var objectId = interfaceId;
			}

			dongyi.sendNotice(objectId, 'gohome', {});
		},
		/**
		 * 上拉刷新和下拉加載
		 * @param {Object} element 容器的ID
		 * @param {Object} downFn  下拉刷新的回調
		 * @param {Object} upFn    上拉加載的回調
		 */
		refreshLoad: function(element, downFn, upFn) {
			gM.init({
				pullRefresh: {
					container: '#' + element,
					/*down: {
					    contentdown : "下拉可以刷新",
					    contentover : "釋放立即刷新",
					    contentrefresh : "正在刷新...",
					    callback: down
					},*/
					up: {
						contentrefresh: '正在加載...',
						callback: up
					}
				}
			});

			function down() {
				downFn(function() {
					mui('#' + element).pullRefresh().endPulldownToRefresh();
				});
			}

			function up() {
				var _this = this;
				/**
				 * true 為沒有數據
				 * false 為有更多數據
				 */
				upFn(function(state) {
					_this.endPullupToRefresh(state);
				});
			}
		},
		/**
		 * Ajax - get 請求
		 * @param {Object} url 請求Url
		 * @param {Object} data   參數-Json格式
		 * @param {Object} succFn	  回調
		 * 測試地址: http://test.dongyixueyuan.com/index.php/link_app/get?state=index
		 */
		get: function(jsonData) {
			if (jsonData.errFn)
				dongyi.ajax({
					url: jsonData.url,
					data: jsonData.data,
					succFn: jsonData.succFn,
					errFn: jsonData.errFn,
					type: 'get'
				});
			else
				dongyi.ajax({
					url: jsonData.url,
					data: jsonData.data,
					succFn: jsonData.succFn,
					type: 'get'
				});
		},
		/**
		 * Ajax - post 請求
		 * @param {Object} url 請求Url
		 * @param {Object} data   參數-Json格式
		 * @param {Object} succFn	  回調
		 * 測試地址: http://test.dongyixueyuan.com/index.php/link_app/post?state=index
		 */
		XMLpost: function(jsonData) {
			//alert(jsonData.success);
			dongyi.xmlajax({
				url: jsonData.url,
				data: jsonData.data,
				errFn: jsonData.error,
				succFn: jsonData.success,
				type: 'post',
				dataype:jsonData.dataType,
				contentType:jsonData.contentType
			});
			
		},
		/**
		 * Ajax - post 請求
		 * @param {Object} url 請求Url
		 * @param {Object} data   參數-Json格式
		 * @param {Object} succFn	  回調
		 * 測試地址: http://test.dongyixueyuan.com/index.php/link_app/post?state=index
		 */
		post: function(jsonData) {
			dongyi.ajax({
				url: jsonData.url,
				data: jsonData.data,
				succFn: jsonData.succFn,
				type: 'post'
			});
		},/**
		 * Ajax
		 * @param {Object} json
		 */
		xmlajax: function(json) {
			var timer = null;
			var oAjax = null;
			json = json || {};
			if (!json.url) {
				dongyi.prompt('請求url不存在');
				return;
			}
			json.type = json.type || 'get';
			json.time = json.time || 25;
			json.data = json.data || {};
			var funcName;
			if (json.data.func)
				funcName = json.data.func;
			if (json.url.indexOf("GetBulletin") == -1)
				json.data.mobile = true;
			mui.plusReady(function() {

				var param = 'func=' + funcName;
				if ((plus.os.name == 'Android' && parseFloat(mui.os.version) == 4.1) ||
					plus.os.name != 'Android')
					oAjax = new plus.net.XMLHttpRequest();
				else
					oAjax = new XMLHttpRequest();

				oAjax.onreadystatechange = function() {		
					if (oAjax.readyState == 4) {
						if (oAjax.status >= 200 && oAjax.status < 300 || oAjax.status == 304) {
							clearTimeout(timer);
							json.succFn && json.succFn(oAjax.responseText);
						} else {
							if (oAjax.responseText != undefined && oAjax.responseText != '') {
								clearTimeout(timer);
								json.succFn && json.succFn(oAjax.responseText);
							} else {
								dongyi.prompt(json.url + '請確認網路連線！');
								ca.closeWaiting();
								clearTimeout(timer);
								json.errFn && json.errFn(oAjax.status);
							}
						}
					}
				}
				switch (json.type.toLowerCase()) {
					case 'get':
						if (json2url(json.data) == "")
							oAjax.open('GET', json.url, true);
						else
							oAjax.open('GET', json.url + '?' + json2url(json.data), true);
						console.log(json.url + '?' + json2url(json.data));
						oAjax.send();
						break;
					case 'post':
						oAjax.open('POST', json.url, true);
						oAjax.setRequestHeader('Content-Type', json.contentType);
						oAjax.send(json.data);
						break;
				}

			});

			timer = setTimeout(function() {
				//dongyi.prompt('網路超時，請稍後再試！');
				//ca.closeWaiting();
				errornum++;
				if (errornum >= 10) {
					//dongyi.prompt('網路超時，請稍後再試！');
					dongyi.prompt("ResponseTimeoutException_" + funcName + ".");
					ca.closeWaiting();
					oAjax.onreadystatechange = null;

					clearTimeout(timer);

				} else {

					oAjax.onreadystatechange = null;

					clearTimeout(timer);

					dongyi.ajax(json);

				}

				//},json.time*1000);
			}, json.time * 1000);

			function json2url(json) {
				//				json.t = Math.random();
				//				json.package_name_data = gPackage;
				var arr = [];
				for (var name in json) {
					arr.push(name + '=' + json[name]);
				}
				return arr.join('&');
			}
		},
		/**
		 * Ajax
		 * @param {Object} json
		 */
		ajax: function(json) {
			var timer = null;
			var oAjax = null;
			json = json || {};
			if (!json.url) {
				dongyi.prompt('請求url不存在');
				return;
			}
			json.type = json.type || 'get';
			json.time = json.time || 25;
			json.data = json.data || {};
			var funcName;
			if (json.data.func)
				funcName = json.data.func;
//			if (json.url.indexOf("GetBulletin") == -1)
//				json.data.mobile = true;
			mui.plusReady(function() {

                var param = 'func=' + funcName;
				if ((plus.os.name == 'Android' && parseFloat(mui.os.version) == 4.1) ||
					plus.os.name != 'Android')
					oAjax = new plus.net.XMLHttpRequest();
				else
					oAjax = new XMLHttpRequest();
                
				oAjax.onreadystatechange = function() {
					if (oAjax.readyState == 4) {
						if (oAjax.status >= 200 && oAjax.status < 300 || oAjax.status == 304) {
							clearTimeout(timer);
							//alert(oAjax.responseText);
							json.succFn && json.succFn(oAjax.responseText);
						} else {
							if (oAjax.responseText != undefined && oAjax.responseText != '') {
								clearTimeout(timer);
								//alert(oAjax.responseText);
								json.succFn && json.succFn(oAjax.responseText);
							} else {
								dongyi.prompt(json.url + '請確認網路連線！');
								ca.closeWaiting();
								clearTimeout(timer);
								json.errFn && json.errFn(oAjax.status);
							}
						}
					}
				}
               
				switch (json.type.toLowerCase()) {
					case 'get':
						if (json2url(json.data) == "")
							oAjax.open('GET', json.url, true);
						else
							oAjax.open('GET', json.url + '?' + json2url(json.data), true);
                    //		alert(json.url + '?' + json2url(json.data));
//                            var JSBridge = plus.android.importClass("com.claridy.util.JSBridge");
//                            var JSBridgeinstance = new JSBridge();
//                            JSBridgeinstance.debugTest(json.url + '?' + json2url(json.data));
                            oAjax.send();
						break;
					case 'post':
						oAjax.open('POST', json.url, true);
						oAjax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
						oAjax.send(json2url(json.data));
						break;
				}

			});
            
			timer = setTimeout(function() {
				//dongyi.prompt('網路超時，請稍後再試！');
				//ca.closeWaiting();
				errornum++;
				if (errornum >= 10) {
					//dongyi.prompt('網路超時，請稍後再試！');
					dongyi.prompt("ResponseTimeoutException_" + funcName + ".");
					ca.closeWaiting();
					oAjax.onreadystatechange = null;

					clearTimeout(timer);

				} else {

					oAjax.onreadystatechange = null;

					clearTimeout(timer);

					dongyi.ajax(json);

				}

				//},json.time*1000);
			}, json.time * 1000);

			function json2url(json) {
				//				json.t = Math.random();
				//				json.package_name_data = gPackage;
				var arr = [];
				for (var name in json) {
					arr.push(name + '=' + json[name]);
				}
				return arr.join('&');
			}
		},
		/**
		 * 獲得起始頁對象或者首頁
		 * @param {Object} 
		 */
		getStartInterface: function(callback) {
			gM.plusReady(function() {
				callback && callback(gP.webview.getLaunchWebview());
			});
		},
		/**
		 * 獲得當前頁對象 
		 * @param {Object} 
		 */
		getCurrentInterface: function(callback) {
			gM.plusReady(function() {
				callback && callback(gP.webview.currentWebview());
			});
		},
		/**
		 * 獲得目標頁對象
		 * @param {Object} 
		 */
		getTargetInterface: function(targetInterface, callback) {
			gM.plusReady(function() {
				callback && callback(gP.webview.getWebviewById(targetInterface));
			});
		},
		/**
		 * 發送通知
		 * @param {Object} targetId     通知對象 & 可單個id也可批量通知idArr = ['a','b'] , *注意: root 為根(起始頁)
		 * @param {Object} fnName		頻道號或者通知號
		 * @param {Object} jsonData		參數
		 */
		sendNotice: function(targetId, fnName, jsonData) {
			if (targetId.constructor == Array) {
				for (var i = 0; i < targetId.length; i++) {
					if (targetId[i] == 'root') {
						dongyi.getStartInterface(function(targetObject) {
							gM.fire(targetObject, fnName, jsonData);
						});
					} else {
						dongyi.getTargetInterface(targetId[i], function(targetObject) {
							gM.fire(targetObject, fnName, jsonData);
						});
					}
				}
			} else {

				if (targetId == 'root') {
					dongyi.getStartInterface(function(targetObject) {
						gM.fire(targetObject, fnName, jsonData);
					});
				} else {
					dongyi.getTargetInterface(targetId, function(targetObject) {
						gM.fire(targetObject, fnName, jsonData);
					});
				}
			}
		},
		/**
		 * 接收通知
		 * @param {Object} fnName 函數名稱
		 * @param {Object} fn	  回調
		 */
		receiveNotice: function(fnName, fn) {
			document.addEventListener(fnName, function(event) {
				fn(event);
			});
		},
		/**
		 * 預加載
		 * @param {Object} arrayData
		 * @param {Object} fn
		 */
		preLoad: function(arrayData, fn) {
			var array = [];
			gM.plusReady(function() {
				for (var a = 0; a < arrayData.length; a++) {
					var productView = gM.preload({
						url: arrayData[a].url,
						id: arrayData[a].id,
					});
					array.push(productView);
				}
				fn && fn(array)
			});
		},
		/**
		 * 彈出框
		 * @param {Object} jsonData
		 */
		alert: function(jsonData) {
			gM.alert(jsonData.content, jsonData.title, function() {
				jsonData.callback && jsonData.callback();
			});
		},
		/**
		 * 確認提示框
		 * @param {Object} jsonData
		 */
		confirm: function(jsonData) {
			var btnArray = ['是', '否'];
			gM.confirm(jsonData.content, jsonData.title, btnArray, function(e) {
				if (e.index == 0) {
					jsonData.callback && jsonData.callback(true);
				} else {
					jsonData.callback && jsonData.callback(false);
				}
			});
		},
		/**
		 * 輸入提示框
		 * @param {Object} jsonData
		 */
		inputPrompt: function(jsonData) {
			var btnArray = ['確定', '取消'];
			gM.prompt(jsonData.content, '', jsonData.title, btnArray, function(e) {
				if (e.index == 0) {
					jsonData.callback && jsonData.callback(e.value);
				} else {
					jsonData.callback && jsonData.callback(false);
				}
			});
		},
		/**
		 * 日期選擇框
		 * @param {Object} jsonData
		 */
		dateSelect: function(jsonData) {
			var dDate = new Date();
			dDate.setFullYear(jsonData.defaultTime.split('-')['0'], jsonData.defaultTime.split('-')['1'] - 1, jsonData.defaultTime
				.split('-')['2']);
			var minDate = new Date();
			minDate.setFullYear(jsonData.minTime.split('-')['0'], jsonData.minTime.split('-')['1'] - 1, jsonData.minTime.split(
				'-')['2']);
			var maxDate = new Date();
			maxDate.setFullYear(jsonData.maxTime.split('-')['0'], jsonData.maxTime.split('-')['1'] - 1, jsonData.maxTime.split(
				'-')['2']);
			gM.plusReady(function() {
				plus.nativeUI.pickDate(function(e) {
					var d = e.date;
					if (d.getDate() < 10) {
						var day = '0' + d.getDate();
					} else {
						var day = d.getDate();
					}
					jsonData.callback && jsonData.callback(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + day);
				}, function(e) {
					jsonData.callback && jsonData.callback(false);
				}, {
					title: "請選擇日期",
					date: dDate,
					minDate: minDate,
					maxDate: maxDate
				});
			});
		},
		/**
		 * 時間選擇框
		 * @param {Object} jsonData
		 */
		timeSelect: function(jsonData) {
			var dTime = new Date();
			dTime.setHours(jsonData.defaultTime.split(':')['0'], jsonData.defaultTime.split(':')['1']);
			gM.plusReady(function() {
				plus.nativeUI.pickTime(function(e) {
					var d = e.date;
					if (d.getHours() < 10) {
						var h = '0' + d.getHours();
					} else {
						var h = d.getHours();
					}
					if (d.getMinutes() < 10) {
						var m = '0' + d.getMinutes();
					} else {
						var m = d.getMinutes();
					}
					jsonData.callback && jsonData.callback(h + ":" + m);
				}, function(e) {
					jsonData.callback && jsonData.callback(false);
				}, {
					title: "請選擇時間",
					is24Hour: true,
					time: dTime
				});
			});
		},
		/**
		 * 自動消失提示框
		 * @param {Object} m 提示資訊
		 */
		prompt: function(m) {
			mui.toast(m);
		},
		/**
		 * 原生actionSheet 
		 * @param {Object} arrayData
		 * @param {Object} jsonData & isUpload | uploadUrl
		 */
		actionSheet: function(arrayData, jsonData) {
			if (arrayData[0].title == undefined) {
				var transferArr = [];
				for (var a = 0; a < arrayData.length; a++) {
					var json = {
						'title': arrayData[a]
					};
					transferArr.push(json);
				}
				arrayData = transferArr;
			}

			if (!jsonData.title) {
				jsonData.title = "請選擇";
			}

			gM.plusReady(function() {
				plus.nativeUI.actionSheet({
						title: jsonData.title,
						cancel: "取消",
						buttons: arrayData
					},
					function(e) {
						var index = e.index;
						if (index == 0) {
							return;
						}
						index--;
						if (arrayData[index].title == '照相機') {
							dongyi.camera({
								succFn: function(path, name) {
									if (jsonData && jsonData.isUpload) {
										dongyi.uploadFiles(jsonData.uploadUrl, path, function(imgPath) {
											jsonData.succFn(imgPath);
										}, function(error) {
											jsonData.errFn && jsonData.errFn(error);
										});
									} else {
										jsonData.succFn(path, name)
									}
								}
							});
						} else if (arrayData[index].title == '相冊') {
							dongyi.album({
								succFn: function(path) {
									if (jsonData && jsonData.isUpload) {
										dongyi.uploadFiles(jsonData.uploadUrl, path, function(imgPath) {
											jsonData.succFn(imgPath);
										}, function(error) {
											jsonData.errFn && jsonData.errFn(error);
										});
									} else {
										jsonData.succFn(path);
									}
								}
							});
						} else {
							jsonData.succFn(index);
						}
					});
			});
		},
		/**
		 * 手勢
		 * @param {Object} element 
		 * @param {Object} event
		 * @param {Object} fn
		 */
		gesture: function(element, event, fn) {
			gM.init({
				gestureConfig: {
					tap: true,
					doubletap: true,
					longtap: true,
					swipe: true,
					drag: true,
					hold: true,
					release: true
				}
			});
			element.addEventListener(event, function() {
				fn();
			});
		},
		/**
		 * 遮罩
		 * @param {Object} callback
		 * * @param {Object} closeId 關閉的id
		 */
		showMask: function(callback, closeId) {
			var mask = gM.createMask(callback);
			mask.show();
			var closeId = dongyi.id(closeId);
			closeId.addEventListener('tap', function() {
				mask.close();
			});
		},
		/**
		 * 圖片輪播
		 * @param {Object} callback
		 * @param {Object} isAutoScroll
		 * @param {Object} scrollTime
		 */
		pictureScroll: function(jsonData) {
			var gallery = gM('.mui-slider');
			if (jsonData.isAutoScroll) {
				gallery.slider({
					interval: jsonData.scrollTime * 1000
				});
			}
			document.querySelector('.mui-slider').addEventListener('slide', function(event) {
				jsonData.callback && jsonData.callback(event.detail.slideNumber + 1);
			});
		},
		/**
		 * 創建子頁面
		 * @param {Object} jsonData
		 */
		createChildInterface: function(jsonData) {
			var styles = {};
			if (jsonData.styles == undefined) {
				styles.top = '0px';
				styles.bottom = '0px';
				styles.width = '100%';
				styles.height = '100%';
				jsonData.styles = styles;
			} else {
				if (jsonData.styles.top == undefined) {
					jsonData.styles.top = "0px";
				}
				if (jsonData.styles.bottom == undefined) {
					jsonData.styles.bottom = "0px";
				} else {
					jsonData.styles.height = dongyi.getScreenInfo('height') - parseInt(jsonData.styles.bottom) - parseInt(jsonData.styles
						.top) + 'px';
				}
				if (jsonData.styles.width == undefined) {
					jsonData.styles.width = "100%";
				}
				if (jsonData.styles.height == undefined) {
					jsonData.styles.height = "100%";
				}
			}
			gM.init({
				subpages: [{
					url: jsonData.url,
					id: jsonData.id,
					styles: {
						top: jsonData.styles.top,
						bottom: jsonData.styles.bottom,
						width: jsonData.styles.width,
						height: jsonData.styles.height,
					},
				}]
			});
		},
		/**
		 * 顯示等待框
		 * @param {Object} watingPrompt
		 */
		showWaiting: function(watingPrompt) {
			mui.plusReady(function() {
				plus.nativeUI.showWaiting(watingPrompt);
			});
		},
		/**
		 * 關閉等待框
		 */
		closeWaiting: function() {
			mui.plusReady(function() {
				plus.nativeUI.closeWaiting();
			});
		},
		/**	
		 * 照相機 
		 * @param {Object} succFn
		 * @param {Object} errFn
		 */
		camera: function(jsonData) {
			gM.plusReady(function() {
				var cmr = plus.camera.getCamera();
				cmr.captureImage(function(p) {
					plus.io.resolveLocalFileSystemURL(p, function(entry) {
						var img_name = entry.name;
						var img_path = entry.toLocalURL();
						jsonData.succFn && jsonData.succFn(img_path, img_name);
					}, function(e) {
						jsonData.errFn && jsonData.errFn(e.message);
					});
				}, function(e) {
					jsonData.errFn && jsonData.errFn(e.message);
				}, {
					filename: '_doc/camera/',
					index: 1
				});
			});
		},
		/**
		 * 相冊
		 * @param {Object} succFn
		 * @param {Object} errFn
		 * @param {Object} isMultiple 是否為選
		 */
		album: function(jsonData, isMultiple) {
			if (!isMultiple) {
				var Ddata = false;
			} else {
				var Ddata = true;
			}
			gM.plusReady(function() {
				plus.gallery.pick(function(path) {
					jsonData.succFn && jsonData.succFn(path);
				}, function(e) {
					jsonData.errFn && jsonData.errFn(e.message);
				}, {
					filter: "image",
					multiple: Ddata,
					system: false
				});
			});
		},
		/**
		 * 相冊多選
		 * @param {Object} succFn
		 * @param {Object} errFn
		 */
		galleryImgs: function(jsonData) {
			dongyi.album({
				succFn: function(data) {
					var imgs = [];
					for (var a in data) {
						imgs.push(data[a]);
					}
					jsonData.succFn && jsonData.succFn(imgs);
				},
				errFn: function(error) {
					jsonData.errFn && jsonData.errFn(error);
				}
			}, true)
		},
		/**
		 * 蜂鳴
		 */
		beep: function() {
			gM.plusReady(function() {
				switch (plus.os.name) {
					case "iOS":
						if (plus.device.model.indexOf("iPhone") >= 0) {
							plus.device.beep();
						} else {
							dongyi.prompt('此設備不支持蜂鳴');
						}
						break;
					default:
						plus.device.beep();
						break;
				}
			});
		},
		/**	
		 * 手機震動
		 */
		vibrate: function() {
			gM.plusReady(function() {
				switch (plus.os.name) {
					case "iOS":
						if (plus.device.model.indexOf("iPhone") >= 0) {
							plus.device.vibrate();
						} else {
							dongyi.prompt('此設備不支持震動');
						}
						break;
					default:
						plus.device.vibrate();
						break;
				}
			});
		},
		/**
		 * 設備資訊
		 * @param {Object} callback
		 */
		getDeviceInfo: function(callback) {
			gM.plusReady(function() {
				var json = {};
				json.model = gP.device.model;
				json.vendor = gP.device.vendor;
				json.imei = gP.device.imei;
				json.uuid = gP.device.uuid;
				var str = '';
				for (i = 0; i < gP.device.imsi.length; i++) {
					str += gP.device.imsi[i];
				}
				json.imsi = str;
				json.resolution = gP.screen.resolutionWidth * gP.screen.scale + " x " + gP.screen.resolutionHeight * gP.screen
					.scale;
				json.pixel = gP.screen.dpiX + " x " + gP.screen.dpiY;
				callback(json);
			});
		},
		/**
		 * 手機資訊 
		 * @param {Object} callback
		 */
		getMachineInfo: function(callback) {
			gM.plusReady(function() {
				var json = {};
				json.name = gP.os.name;
				json.version = gP.os.version;
				json.language = gP.os.language;
				json.vendor = gP.os.vendor;
				var types = {};
				types[gP.networkinfo.CONNECTION_UNKNOW] = "未知";
				types[gP.networkinfo.CONNECTION_NONE] = "未連接網路";
				types[gP.networkinfo.CONNECTION_ETHERNET] = "有線網路";
				types[gP.networkinfo.CONNECTION_WIFI] = "WiFi網路";
				types[gP.networkinfo.CONNECTION_CELL2G] = "2G蜂窩網路";
				types[gP.networkinfo.CONNECTION_CELL3G] = "3G蜂窩網路";
				types[gP.networkinfo.CONNECTION_CELL4G] = "4G蜂窩網路";
				json.network = types[gP.networkinfo.getCurrentType()];
				callback(json);
			});
		},
		/**
		 * 發送短信
		 * @param {Object} sendPhone
		 * @param {Object} sendContent
		 */
		sendSms: function(sendPhone, sendContent) {
			var msg = gP.messaging.createMessage(plus.messaging.TYPE_SMS);
			msg.to = sendPhone;
			msg.body = sendContent;
			gP.messaging.sendMessage(msg);
		},
		/**
		 * 撥打電話
		 * @param {Object} phone
		 */
		callPhone: function(targetPhone) {
			gP.device.dial(targetPhone, false);
		},
		/**	
		 * 郵件
		 * @param {Object} targetEmail
		 */
		sendEmail: function(targetEmail) {
			location.href = "mailto:" + targetEmail;
		},
		/**
		 * 圖片上傳
		 * @param {Object} uploadUrl 上傳地址
		 * @param {Object} filePath  檔路徑
		 * @param {Object} succFn 	   成功回調
		 * @param {Object} errFn     失敗回調
		 */
		uploadFiles: function(uploadUrl, filePath, succFn, errFn) {
			var files = [];
			var n = filePath.substr(filePath.lastIndexOf('/') + 1);
			files.push({
				name: "uploadkey",
				path: filePath
			});
			if (files.length <= 0) {
				this.prompt("沒有添加上傳檔");
				return;
			}
			dongyi.showWaiting('上傳中...');
			var task = gP.uploader.createUpload(uploadUrl, {
					method: "POST"
				},
				function(t, status) {

					if (status == 200) {
						var responseText = t.responseText;
						var json = eval('(' + responseText + ')');
						var files = json.files;
						var img_url = files.uploadkey.url;
						succFn(img_url);
						dongyi.closeWaiting();
					} else {
						errFn && errFn(status);
						dongyi.closeWaiting();
					}
				});
			task.addData("client", "");
			task.addData("uid", Math.floor(Math.random() * 100000000 + 10000000).toString());
			for (var i = 0; i < files.length; i++) {
				var f = files[i];
				task.addFile(f.path, {
					key: f.name
				});
			}
			task.start();
		},
		/**
		 * 地理位置 - 獲得當前位置
		 * @param {Object} succFn 成功回調
		 * @param {Object} errFn  失敗回調
		 */
		getCurrentPosition: function(jsonData) {
			gM.plusReady(function() {
				gP.geolocation.getCurrentPosition(function(position) {
					var timeflag = position.timestamp;
					var codns = position.coords;
					var lat = codns.latitude;
					var longt = codns.longitude;
					var alt = codns.altitude;
					var accu = codns.accuracy;
					var altAcc = codns.altitudeAccuracy;
					var head = codns.heading;
					var sped = codns.speed;
					var baidu_map =
						"http://api.map.baidu.com/geocoder/v2/?output=json&ak=BFd9490df8a776482552006c538d6b27&location=" + lat +
						',' + longt;
					dongyi.ajax({
						url: baidu_map,
						data: {},
						succFn: function(data) {
							jsonData.succFn && jsonData.succFn(data);
						}
					});
				}, function(e) {
					jsonData.errFn && jsonData.errFn(e.message);
				});
			})
		},
		/**
		 * 流覽器打開網頁
		 * @param {Object} targetUrl
		 */
		openUrl: function(targetUrl) {
			dongyi.getRuntime().openURL(targetUrl);
		},
		/**
		 * 設置完手動關閉啟動頁 manifest.json -> 啟動圖片 -> 選擇手動關閉啟動介面
		 * 關閉啟動頁
		 */
		closeStartPage: function() {
			gM.plusReady(function() {
				plus.navigator.closeSplashscreen();
			});
		},
		/**
		 * 設置首次啟動引導輪播頁面
		 * @param {Object} jsonData 
		 * url 預加載URL
		 * id  預加載ID
		 */
		setStartpage: function(jsonData) {
			gM.init({
				swipeBack: true,
				scrollIndicator: "none"
			});
			var vH = dongyi.getScreenInfo('height');
			var slider = document.getElementById('slider');
			slider.style.height = vH + 'px';
			var img = slider.getElementsByTagName('img');
			for (var a = 0; a < img.length; a++) {
				img[a].style.height = vH + 'px';
			}

			//判斷是否為第一次登錄
			var appWelcome = localStorage.getItem('appWelcome');
			if (appWelcome) {
				gM.plusReady(function() {
					var terger_path = plus.webview.create(jsonData.url, jsonData.id, '');
					terger_path.show();
					setTimeout(function() {
						dongyi.closeStartPage();
					}, 500);

				});
			} else {
				//預加載
				gM.plusReady(function() {
					dongyi.closeStartPage();
					dongyi.preLoad([{
						url: jsonData.url,
						id: jsonData.id
					}], function(data) {
						var productView = data['0'];
						if (productView) {
							clickEvent(productView);
						}
					});
				});

				function clickEvent(productView) {
					var dy_enter = dongyi.id('dy_enter');
					dy_enter.onclick = function() {
						localStorage.setItem('appWelcome', true);
						productView.show("pop-in", 300);
					}
				}
			}
			dongyi.dblclickExit();
		},
		/**
		 * 雙擊返回鍵退出
		 */
		dblclickExit: function() {
			var first = null;
			gM.back = function() {
				if (!first) {
					first = new Date().getTime();
					dongyi.prompt('再按一次退出應用');
					setTimeout(function() {
						dongyi.dblclickExit();
					}, 1000);
				} else {
					if (new Date().getTime() - first < 1000) {
						gP.runtime.quit();
					}
				}
			}
		},
		/**
		 * 隱藏介面滾動條
		 */
		hiddenScroll: function() {
			gM.plusReady(function() {
				var self = plus.webview.currentWebview();
				self.setStyle({
					scrollIndicator: 'none'
				});
			});
		},
		/**
		 * 禁止介面彈動
		 */
		stopBounce: function() {
			var self = gP.webview.currentWebview();
			self.setStyle({
				setBounce: 'none'
			});
		},
		/**
		 * 獲得驗證碼
		 * length 為驗證碼長度
		 */
		getIdCode: function(length) {
			if (length == undefined) {
				length = 4;
			}
			var pow = Math.pow(10, length);
			var code = Math.floor(Math.random() * pow + pow / 10).toString();
			return code.substr(0, length);
		},
		/**
		 * 側滑導航
		 * @param {Object} type main-move 主介面和導航滑動  menu-move 導航滑動 main-move-scalable 仿QQ效果
		 * @param {Object} showObjId 展示側滑數組
		 * @param {Object} closeObjId 關閉側滑數組
		 */
		sideslipNav: function(type, showObjId, closeObjId) {
			var offCanvasWrapper = gM('#offCanvasWrapper');
			var offCanvasInner = offCanvasWrapper[0].querySelector('.mui-inner-wrap');
			var offCanvasSide = dongyi.id("offCanvasSide");
			var classList = offCanvasWrapper[0].classList;
			offCanvasSide.classList.remove('mui-transitioning');
			offCanvasSide.setAttribute('style', '');
			classList.remove('mui-slide-in');
			classList.remove('mui-scalable');
			switch (type) {
				case 'main-move':
					offCanvasWrapper[0].insertBefore(offCanvasSide, offCanvasWrapper[0].firstElementChild);
					break;
				case 'main-move-scalable':
					offCanvasWrapper[0].insertBefore(offCanvasSide, offCanvasWrapper[0].firstElementChild);
					classList.add('mui-scalable');
					break;
				case 'menu-move':
					classList.add('mui-slide-in');
					break;
			}
			offCanvasWrapper.offCanvas().refresh();
			for (var a = 0; a < showObjId.length; a++) {
				var showObj = ca.id(showObjId[a]);
				showObj.addEventListener('tap', function() {
					offCanvasWrapper.offCanvas('show');
				});
			}
			for (var a = 0; a < closeObjId.length; a++) {
				var closeObj = ca.id(closeObjId[a]);
				closeObj.addEventListener('tap', function() {
					offCanvasWrapper.offCanvas('close');
				});
			}
			mui('#offCanvasSideScroll').scroll();
			mui('#offCanvasContentScroll').scroll();
			if (mui.os.plus && mui.os.ios) {
				mui.plusReady(function() { //5+ iOS暫時無法遮罩popGesture時傳遞touch事件，故該demo直接遮罩popGesture功能
					plus.webview.currentWebview().setStyle({
						'popGesture': 'none'
					});
				});
			}
		},
		/**
		 * 索引列表
		 */
		indexes: function() {
			var header = ca.tagName('header')['0'];
			var list = ca.id('list');
			list.style.height = (document.body.offsetHeight - header.offsetHeight) + 'px';
			window.indexedList = new mui.IndexedList(list);
		},
		/**
		 * 滑動九宮格
		 */
		gridPagination: function() {
			var slider = document.getElementById('Gallery');
			var group = slider.querySelector('.mui-slider-group');
			var items = mui('.mui-slider-item', group);
			var first = items[0].cloneNode(true);
			first.classList.add('mui-slider-item-duplicate');
			var last = items[items.length - 1].cloneNode(true);
			last.classList.add('mui-slider-item-duplicate');
			var sliderApi = mui(slider).slider();

			function toggleLoop(loop) {
				if (loop) {
					group.classList.add('mui-slider-loop');
					group.insertBefore(last, group.firstChild);
					group.appendChild(first);
					sliderApi.refresh();
					sliderApi.gotoItem(0);
				} else {
					group.classList.remove('mui-slider-loop');
					group.removeChild(first);
					group.removeChild(last);
					sliderApi.refresh();
					sliderApi.gotoItem(0);
				}
			}
			document.getElementById('Gallery_Toggle').addEventListener('toggle', function(e) {
				var loop = e.detail.isActive;
				toggleLoop(loop);
			});
		},
		/**
		 * 圖片預覽
		 */
		imageViewer: function() {
			gM.previewImage();
		},
		/**
		 * 左右滑動導航
		 * @param {Object} fn 
		 */
		slideNav: function(fn) {
			var dongyi_nav = document.getElementById('dongyi_nav');
			var dongyi_nav_ul = document.getElementById('dongyi_nav_ul');
			var dongyi_nav_li = dongyi_nav.getElementsByTagName('li');
			var oWidth = dongyi_nav_li['0'].offsetWidth;
			var oLeft = dongyi_nav_li['0'].offsetLeft;
			var down_line = document.getElementById('down_line');
			var ulWidth = (oWidth * dongyi_nav_li.length) + (oLeft * 2);
			dongyi_nav_ul.style.width = ulWidth + 'px';
			down_line.style.width = oWidth + 'px';
			var slide_data = 0;
			var screenWidth = 0;
			var target = 0;
			dongyi_nav_ul.ontouchstart = function(ev) {
				var vW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
				var touch = ev.touches['0'];
				var oldX = touch.clientX;
				var oldLeft = dongyi_nav_ul.offsetLeft;
				dongyi_nav_ul.ontouchmove = function(ev) {
					var touch = ev.touches['0'];
					var newX = touch.clientX;
					target = newX - oldX;
					var currentLeft = parseInt(dongyi_nav_ul.offsetLeft);
					if (target > 0 && currentLeft >= 0) {
						dongyi_nav_ul.style.left = 0 + 'px';
						return;
					} else {
						if (-currentLeft >= ulWidth - vW && target < 0) {
							dongyi_nav_ul.style.left = vW - ulWidth + 'px';
						} else {
							dongyi_nav_ul.style.left = oldLeft + target + 'px';
						}
					}
					ev.preventDefault();
				}
			}
			for (var a = 0; a < dongyi_nav_li.length; a++) {
				(function(index) {
					dongyi_nav_li[a].onclick = function() {
						for (var s = 0; s < dongyi_nav_li.length; s++) {
							dongyi_nav_li[s].className = '';
						}
						this.className = "default";
						fn && fn(index, this.innerHTML);
						dongyi_Move(this, index);
					}
				})(a);
			}
			var timer = null;

			function dongyi_Move(obj, index) {
				clearInterval(timer);
				var count = Math.floor(500 / 30);
				var start = down_line.offsetLeft;
				var dis = obj.offsetLeft - start - oLeft;
				var num = 0;
				timer = setInterval(function() {
					num++;
					var s = 1 - num / count;
					var data = start + dis * (1 - s * s * s);
					down_line.style.left = data + "px";
					if (num == count) {
						clearInterval(timer);
					}
				}, 30)
			}
		},
		////////////////////////////////////////*功能模組*///////////////////////////////////////////////////////
		/**
		 * 支付 @ 需配合伺服器端完成
		 * @param {Object} json
		 * name         支付名稱
		 * json.url     請求支付地址
		 * json.type    支付類型 alipay&weixin
		 * josn.money   支付金額
		 * json.succFn  支付成功回調
		 * json.errFn   支付失敗回調
		 *  
		 */
		pay: function(json) {
			gM.ready(function() {
				var pays = {};
				plus.payment.getChannels(function(channels) {
					for (var i in channels) {
						var channel = channels[i];
						pays[channel.id] = channel;
					}
				}, function(e) {
					dongyi.prompt("獲取支付通道失敗：" + e.message);
				});
				var url = '';
				if (json.type == 'alipay' || json.type == 'wxpay') {
					if (json.type == 'wxpay') {
						url = 'http://aigougou.tianzhengtong.com/weixin_pay/index.php?payid=alipay';
					} else {
						url = 'http://aigougou.tianzhengtong.com/alipay.php?payid=wxpay';
					}
				} else {
					dongyi.prompt("不支持此支付通道！");
					return;
				}
				url += '&appid=dongyijs&total=';
				mui.plusReady(function() {
					dongyi.showWaiting();
				});
				var amount = json.money;
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					switch (xhr.readyState) {
						case 4:
							if (xhr.status == 200) {
								mui.plusReady(function() {
									dongyi.closeWaiting();
								});
								var order = xhr.responseText;
								if (json.url == undefined || json.url == '') {
									if (order == '-1') {
										dongyi.prompt('連接伺服器錯誤');
										return;
									} else if (order == '-2') {
										dongyi.prompt('應用配置資訊錯誤');
										return;
									}
								}
								plus.payment.request(pays[json.type], order, function(result) {
									json.succFn && json.succFn();
								}, function(e) {
									json.errFn && json.errFn(e.code + e.message);
								});
							} else {
								json.errFn && json.errFn(xhr.status);
							}
							break;
						default:
							break;
					}
				}
				console.log(url + amount);
				xhr.open('GET', url + amount);
				xhr.send();
			});
		},
		/**
		 * 第三方分享
		 * @param {Object} jsonData
		 * 
		 * shareTitle 
		 * shareContent
		 * shareImg
		 * shareLink
		 */
		share: function(jsonData) {
			var shares = null,
				bhref = false;
			var Intent = null,
				File = null,
				Uri = null,
				main = null;

			/**
			 * 更新分享服務
			 */
			function updateSerivces() {
				plus.share.getServices(function(s) {
					shares = {};
					for (var i in s) {
						var t = s[i];
						shares[t.id] = t;
					}
				}, function(e) {
					dongyi.closeWaiting();
					dongyi.prompt("獲取分享服務列表失敗：" + e.message);
				});
			}
			gM.ready(function() {

				updateSerivces();
				if (plus.os.name == "Android") {
					Intent = plus.android.importClass("android.content.Intent");
					File = plus.android.importClass("java.io.File");
					Uri = plus.android.importClass("android.net.Uri");
					main = plus.android.runtimeMainActivity();
				}
				/**
				 * 分享操作
				 * @param {String} id
				 */
				function shareAction(id, ex) {
					var s = null;

					if (!id || !(s = shares[id])) {
						dongyi.prompt("無效的分享服務！");
						return;
					}
					if (s.authenticated) {
						console.log("---已授權---");
						shareMessage(s, ex);
					} else {
						console.log("---未授權---");
						s.authorize(function() {
							shareMessage(s, ex);
						}, function(e) {
							dongyi.prompt("認證授權失敗：" + e.code + " - " + e.message);
						});
					}

				}
				/**
				 * 發送分享消息
				 * @param {plus.share.ShareService}
				 */
				function shareMessage(s, ex) {
					var msg = {
						content: jsonData.shareContent,
						extra: {
							scene: ex
						}
					};
					var pic = jsonData.shareImg;
					if (jsonData.shareLink) {
						msg.href = jsonData.shareLink;
						if (jsonData.shareTitle) {
							msg.title = jsonData.shareTitle;
						}
						if (jsonData.shareContent) {
							msg.content = jsonData.shareContent;
						}
						if (jsonData.shareImg) {
							msg.thumbs = [jsonData.shareImg];
							msg.pictures = msg.thumbs = [jsonData.shareImg];
						}
					} else {
						if (jsonData.shareImg) {
							msg.pictures = msg.thumbs = [jsonData.shareImg];
						}
					}
					console.log(JSON.stringify(msg));
					s.send(msg, function() {
						dongyi.closeWaiting();
						dongyi.prompt("分享成功");
					}, function(e) {
						dongyi.closeWaiting();
						dongyi.prompt("分享取消");
					});
				}
				var ids = [{
						id: "weixin",
						ex: "WXSceneSession"
					}, {
						id: "weixin",
						ex: "WXSceneTimeline"
					}, {
						id: "sinaweibo"
					}],
					bts = [{
						title: "發送給微信好友"
					}, {
						title: "分享到微信朋友圈"
					}, {
						title: "分享到新浪微博"
					}];
				if (plus.os.name == "iOS") {
					ids.push({
						id: "qq"
					});
					bts.push({
						title: "分享到QQ"
					});
				}
				plus.nativeUI.actionSheet({
						cancel: "取消",
						buttons: bts
					},
					function(e) {
						var i = e.index;
						if (i == 0) {
							return;
						}
						if (i > 0) {
							shareAction(ids[i - 1].id, ids[i - 1].ex);
						}
						dongyi.showWaiting();
						setTimeout(function() {
							dongyi.closeWaiting();
						}, 1000);
					}
				);
			});
		},
		/**
		 * 獲得通訊錄
		 * type     為獲取類型 phone 為本機通訊錄 其他 為本機sim通訊錄
		 * callbacl 回調函數
		 */
		getAddressBook: function(type, callback) {
			gM.plusReady(function() {
				var listLength = 0;
				if (type == 'phone') {
					var getType = 'plus.contacts.ADDRESSBOOK_PHONE';
				} else {
					var getType = 'plus.contacts.ADDRESSBOOK_SIM';
				}
				gP.contacts.getAddressBook(getType, function(addressbook) {
					addressbook.find(null, function(contacts) {
						dongyi.showWaiting();
						if (contacts.length < 1) {
							dongyi.prompt('沒有發現通訊錄內容');
							dongyi.closeWaiting();
						} else {
							listLength = contacts.length;
							listFilter(contacts);
						}
					}, function(e) {}, {
						multi: true
					});
				});

				function listFilter(arr) {
					var backArr = [];
					for (var i = 0; i < arr.length; i++) {
						if (gM.os.ios) {
							var data = arr[i];
							var json = JSON.stringify(data);
							var datas = eval('(' + json + ')');
							var ios_name = datas['name'];
							if (ios_name['familyName'] != null) {
								if (ios_name['givenName'] != null) {
									var name = ios_name['familyName'] + ios_name['givenName'];
								} else {
									var name = ios_name['familyName'];
								}
							} else {

								if (ios_name['givenName'] != null) {
									var name = ios_name['givenName'];
								} else {
									var name = '#';
								}
							}
							var ios_phone = datas['phoneNumbers'];
							var phone = '';
							var telephone = '';
							for (var a in ios_phone) {
								var data = ios_phone[a];
								if (data['type'] == 'home') {
									telephone = ios_phone[a].value;
								}
								if (data['type'] == 'mobile') {
									phone = ios_phone[a].value;
								}
								if (phone == '') {
									if (data['type'] == 'other') {
										phone = ios_phone[a].value;
									}
								}
							}
							//email
							var ios_emails = datas['emails'];
							var email = '';
							for (var b in ios_emails) {
								email = ios_emails[b].value;
							}

							var company = '';

						} else {
							if (arr[i].displayName) {
								var name = arr[i].displayName;
							}
							if (arr[i].phoneNumbers[0]) {
								var phone = arr[i].phoneNumbers[0].value;
							}
						}

						if (/^[\u4e00-\u9fa5]+$/.test(name)) { //是中文
							var first = dongyi.getFirstLetter(name);
						} else {
							//判斷是否為特殊字元
							if (name) {
								var s = name.substring(0, 1);
								if (/^[A-Za-z]+$/.test(s)) { //判斷是否為英文名稱
									var first = s.toUpperCase();
								} else { // 判斷是否為特殊字元
									if (!/^[0-9]+$/.test(s)) { //判斷如果不是數字				
										var containSpecial = RegExp(
											/[(\ )(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\-)(\_)(\+)(\=)(\[)(\])(\{)(\})(\|)(\\)(\;)(\:)(\')(\")(\,)(\.)(\/)(\<)(\>)(\?)(\)]+/
										);
										if (!containSpecial.test(s)) {
											name = escape(name);
										}
									}
									var first = '#';
								}
							} else {
								var first = '#';
							}
						}

						if (phone.length != '11') {

							var s = phone.substring(0, 5);
							if (s == '17951' || s == '12593') {
								phone = phone.substring(5, 16);
							}

						}
						phone = phone.replace('+86', "");
						phone = phone.replace('/ /g', "");
						phone = phone.replace(/-/g, "");

						var str = '{"name":"' + name + '","phone":"' + phone + '","firstLetter":"' + first.toUpperCase() + '"}';
						backArr.push(str);
						dongyi.closeWaiting();
					}
					callback(backArr, listLength);
				}
			});
		},
		/**
		 * 獲得Runtime資訊
		 */
		getRuntime: function(path) {
			if (path) {
				return gRuntime[path];
			} else {
				return gRuntime;
			}
		},
		/**
		 * 獲得Os
		 * 
		 */
		getOs: function(path) {
			if (path) {
				return gOs[path];
			} else {
				return gOs;
			}
		},
		/**
		 * 獲得中文字拼音首字母
		 */
		getFirstLetter: function(data) {
			var val = data.substr(0, 1);
			var name = arraySearch(val);
			if (name) {
				var first = name.substr(0, 1);
			} else {
				var first = '#';
			}
			return first.toUpperCase();

			function arraySearch(l1) {
				for (var name in PinYin) {
					if (PinYin[name].indexOf(l1) != -1) {
						return name;
						break;
					}
				}
				return false;
			}
		},
		/**
		 * 多級組合選擇 支持1,2,3級組合
		 * selectNumber 選擇數
		 * data         數據
		 * callback     回調
		 * 
		 */
		combinationSelect: function(selectNumber, data, callback) {
			if (!selectNumber) {
				selectNumber = 1
			};
			var selector = new gM.PopPicker({
				layer: selectNumber
			});
			if (!selectNumber || selectNumber == 1) {
				var transferArr = [];
				for (var a = 0; a < data.length; a++) {
					var datajson = {
						text: data[a]
					};
					transferArr.push(datajson);
				};
				data = transferArr;
			}
			selector.setData(data);
			selector.show(function(items) {
				var backArr = [];
				if (selectNumber == 1) {
					backArr = [items[0].text];
				} else if (selectNumber == 2) {
					backArr = [items[0].text, items[1].text];
				} else if (selectNumber == 3) {
					backArr = [(items[0] || {}).text, (items[1] || {}).text, (items[2] || {}).text];
				}
				callback && callback(backArr);
			});
		},

		/**
		 * 
		 */

	}

})();

function trim(str) {
	return str.replace(/(^\s*)|(\s*$)/g, "");
};

function clearXSS(value) {
	var re = /<[^<>]+>/g; //去除HTML标签
	return value = value.replace(re, '');
};
