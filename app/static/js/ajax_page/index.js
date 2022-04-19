mui.plusReady(function() {
	function accountDataTransfer() {
		var localNickName = localStorage.getItem("nickname");
		var localCard = localStorage.getItem("card");
		if(plus.webview.currentWebview() == plus.webview.getLaunchWebview())
			if(localNickName != null && localNickName != "") {
				plus.storage.setItem("nickname", localNickName);
				plus.storage.setItem("card", localCard);
				localStorage.removeItem("nickname");
				localStorage.removeItem("card");
			}

	}
	accountDataTransfer();
});

function openMobile(itemNumber) {
	mui.openWindow({
		url: 'mobile_borrowed.html',
		id: 'mobile_borrowed',
		extras: {
			itemNumber: itemNumber
		},
		createNew: false
	});
}

function mobileItemNumber(itemnumber) {
	var btnArray = ['確認', '取消'];
	mui.confirm('條碼號：' + itemnumber + ' \n\n 確認借書？', '手機借書', btnArray, function(e) {
		if(e.index == 2) {
			//由條碼號獲取館藏資料
			$.ajax({
				url: baseUrl,
				data: {
					identify: "TCC",
					func: "CAT_GetBookstatusByItemNumber",
					item_number: itemnumber
				},
				success: function(data) {
					var jsonData = JSON.parse(data);

				}
			})
		}
	})
}

function getOverDueDateData(user, pwd) {

	var baseUrl = localStorage.getItem("baseUrl");
	dueBook.innerHTML = "";
	localStorage.removeItem("overDues_info");
	ca.get({
			url: baseUrl,
			data: {
				identify: "TCC",

				func: "patronOverdues",
				username: user,
				password: pwd
			},
			succFn: function(data2) {
				ca.closeWaiting();
				var dueData = JSON.parse(data2);
				if(dueData != "" && dueData != null && data2 != "[]") {
					for(var b in dueData) {
						if(dueData[b].status != "failure") {
							dueBook.innerHTML += '<a id="tip-msg"  class="overdue">' +
								'  	您尚有書逾期' +
								'      <img src="template/img/arrow_down_pushing.png" />' +
								'  </a><!-- id="tip-msg" End -->';

							var tipBtn = ca.className("overdue");

							tipBtn[0].addEventListener('tap', function() {
								clicked("expired.html");
							});
							break;
						}
					}
					localStorage.setItem("overDues_info", data2);
					getHoldDateData(user, pwd);
					getDueDateData(user, pwd);

				} else {
					if(dueBook.innerHTML != "") {

					} else {
						dueBook.innerHTML = "";
						localStorage.removeItem("overDues_info");
					}
					getHoldDateData(user, pwd);
					getDueDateData(user, pwd);

				}
				ca.closeWaiting();
				//console.log('qweqwe');
			}
		}

	);

	//ca.closeWaiting();

}

function getHoldDateData(user, pwd) {
	var baseUrl = localStorage.getItem("baseUrl");
	holdBook.innerHTML = "";

	localStorage.removeItem("patronHolds_info");

	mui.ajax(baseUrl, {
		data: {
			identify: "TCC",
			func: "patronHolds",
			username: user,
			password: pwd
		},
		dataType: 'text', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		success: function(data1) {
			console.log('before holdData' + data1);
			var holdData = JSON.parse(data1);
			console.log('holdData' + data1 + "frmat" + holdData);
			if(holdData != "" && null != holdData && data1 != "[]") {
				for(var b in holdData) {
					if(holdData[b].status != "failure") {
						holdBook.innerHTML = '<a id="tip-msg" class="holds">' +
							'  	您的預約書到囉!' +
							'  </a><!-- id="tip-msg" End -->';
						localStorage.setItem("patronHolds_info", holdData);
						var tipBtn = ca.className("holds");

						tipBtn[0].addEventListener('tap', function() {
							clicked("patronHold.html");
						});
						break;
					}
				}
			}
			ca.closeWaiting();

		},
		error: function(xhr, type, errorThrown) {
			//holdBook.innerHTML="";
			localStorage.removeItem("patronHolds_info");
			ca.closeWaiting();

		}
	});
}

function getDueDateData(user, pwd) {
	var baseUrl = localStorage.getItem("baseUrl");
	//dueBook.innerHTML = "";
	localStorage.removeItem("patronDues_info");
	mui.ajax(baseUrl, {
		data: {
			identify: "TCC",
			func: "patronDues",
			username: user,
			password: pwd
		},
		dataType: 'text', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		success: function(data1) {
			var dueData = JSON.parse(data1);
			if(dueData != "" && null != dueData && data1 != "[]") {
				for(var b in dueData) {
					if(dueData[b].status != "failure") {
						dueBook.innerHTML += '<a id="tip-msg" class="duebook">' +
							'  	您有書快到期囉!' +
							'  </a><!-- id="tip-msg" End -->';
						localStorage.setItem("patronDues_info", dueData);
						var tipBtn = ca.className("duebook");;
						tipBtn[0].addEventListener('tap', function() {
							clicked("due_book.html");
						});
						break;
					}
				}
			}
			ca.closeWaiting();

		},
		error: function(xhr, type, errorThrown) {
			//holdBook.innerHTML="";
			localStorage.removeItem("patronDues_info");
			ca.closeWaiting();

		}
	});
}

mui.plusReady(function() {
	ca.init();
	var boxIcons = ca.className("group");
	//http://ipac.library.taichung.gov.tw/toread
	//http://211.23.94.4/toread //內部測試http://10.1.5.71/toread_NTL/  //外部測試http://210.63.206.103/toread_NTL/
	localStorage.setItem("baseUrl", "https://211.23.94.4/toread/APPAPI");
	localStorage.setItem("otherLink", "https://ipac.library.taichung.gov.tw/tccladmin/tclApp");
	localStorage.setItem("mobileUrl", "http://117.56.144.183/mobile.asmx");

	var otherLink = localStorage.getItem("otherLink");
	var device_token = "";
	if(plus.os.name == "Android") {
		try {
			var JSBridge = plus.android.importClass("com.claridy.util.JSBridge");
			var JSBridgeinstance = new JSBridge();
			JSBridgeinstance.initPushService(plus.android.runtimeMainActivity());
			var token = JSBridgeinstance.getToken(plus.android.runtimeMainActivity());
			device_token = token;
			localStorage.setItem("device_token", AntiSqlValidate(device_token));
		} catch(e) {
			//TODO handle the exception
			console.log('e' + e);
		}

	} else {
		device_token = plus.push.getClientInfo().token;
		//device_token="A59697FE33EC303C30403A1B50367BF20A8589CFE870F8E34D12B7C371FF41A6";
	}
	localStorage.setItem("device_token", device_token);

	//首頁返回鍵處理
	//處理邏輯：1秒內，連續兩次按返回鍵，則退出應用；
	var first = null;
	mui.back = function() {
		//首次按鍵，提示‘再按一次退出應用’
		if(!first) {
			first = new Date().getTime();
			mui.toast('再按一次退出應用');
			setTimeout(function() {
				first = null;
			}, 2000);
		} else {
			if(new Date().getTime() - first < 2000) {
				plus.runtime.quit();
			}
		}
	};
});