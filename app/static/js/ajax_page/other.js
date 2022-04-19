ca.receiveNotice('update_user_info', function() {
	//更新資料 
	preload();
});
var boxIcons = ca.className("group");
checkBeaconOpen();
function openNewWebview(targetUrl) {
	plus.webview.create('append.html', 'append', {}, {
		targetUrl: targetUrl
	}).show(as);
}

function checkBeaconOpen() {
	/*(1)	判斷是否開啟Beacon功能是否開啟(預設為是)
	(2)	如有開啟，詢問是否要參加活動，如拒絕，app記憶拒絕時間，每當使用者到Index.html，判斷拒絕時間是否經過1小時，如已經過一小時再次跳出此是否要參加活動Dialog。
	(3)	如有開啟，使用API-獲取活動。*/
	var isOpenBeacon = AntiSqlValidate(localStorage.getItem("openBeacon"));
	var beaconBtn = document.getElementById("beacon-index-icon");
		//(3)如有開啟，直接跳至beacon_list.html (beacon掃描頁)。
		beaconBtn.addEventListener('tap', function() {
		    var isOpenBeacon = AntiSqlValidate(localStorage.getItem("openBeacon"));
		    if(null == isOpenBeacon || isOpenBeacon === "openBeacon") {
			    clicked('beacon_list.html');
		    } else {
                mui.alert('請先啟用Beacon功能', '溫馨提醒', function() {});
                clicked('beacon.html');
            }
		});

}

//分館資訊
boxIcons['2'].addEventListener('tap', function() {
	//clicked('http://www.tphcc.gov.tw/MobileMainPortal/htmlcnt/toquerylist/LyceumInfo');
	ca.openUrl("http://www.tphcc.gov.tw/MobileMainPortal/htmlcnt/toquerylist/LyceumInfo");
	//openNewWebview("http://www.tphcc.gov.tw/MobileMainPortal/htmlcnt/toquerylist/LyceumInfo");
});

//FAQ
boxIcons['5'].addEventListener('tap', function() {
	//clicked('http://www.tphcc.gov.tw/MobileMainPortal/htmlcnt/doQuerySingleHtmlCntByCNTID/e4459883d32a41a8a42c4c2d7b29cd09');
	ca.openUrl("http://www.tphcc.gov.tw/MobileMainPortal/htmlcnt/doQuerySingleHtmlCntByCNTID/e4459883d32a41a8a42c4c2d7b29cd09");
	//openNewWebview("http://www.tphcc.gov.tw/MobileMainPortal/htmlcnt/doQuerySingleHtmlCntByCNTID/e4459883d32a41a8a42c4c2d7b29cd09");
});
//行動版網頁
boxIcons['6'].addEventListener('tap', function() {
	//clicked('http://www.tphcc.gov.tw/MobileMainPortal/');
	ca.openUrl("http://www.tphcc.gov.tw/MobileMainPortal/");
	//openNewWebview("http://www.tphcc.gov.tw/MobileMainPortal/");
});
//登入
function loginAccount() {
var logined = AntiSqlValidate(localStorage.getItem("logined"));
		if(logined == null || logined == '') {
			localStorage.setItem("prePage", "index");
            	clicked('login.html');
		} else {
			//clicked('card_pwd.html');
		}

}

preload();

function preload() {

	//ca.showWaiting();
	var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
	var showLoginOut = ca.id("loginOut");
	var hidLogined = ca.id("login");

	if(userInfo != '' && null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {

		var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
		showLoginOut.style.display = "block";
		hidLogined.style.display = "none";
		//登出
		var loginBtn = ca.id("loginOut");
		var login_btn = ca.id("login");

		loginBtn.addEventListener('tap', function() {
			ca.showWaiting();
			var device_token = "temp",
				device_type = "android";
			device_type = plus.os.name;
			var params = 'func=gcmInsertUser';
			var sign;
			var KeyNum;
			if(plus.os.name == 'Android') {
				var APISecurity = plus.android.importClass("com.claridy.util.security.APISecurity");
				sign = APISecurity.encrypt(params);
				KeyNum = APISecurity.getKeyNum();
			} else {
				var APISecurity = plus.ios.newObject("APISecurity");
				sign = plus.ios.invoke(APISecurity, "encrypt:", params);
				KeyNum = plus.ios.invoke(APISecurity, "getKeyNum");
				plus.ios.deleteObject(APISecurity);
			}
			ca.post({
				url: baseUrl,
				timeout: 10,
				data: {
					identify: "ntcl",
					func: "gcmInsertUser",
					username: userInfo.split("#")[1],
					password: userInfo.split("#")[7],
					device_token: device_token,
					device_type: device_type,
					login: "false"
//					sign: sign,
//					key: KeyNum
				},
				succFn: function(dataOut) {

					showLoginOut.style.display = "none";

					//var arr = ['other'];
					//mui.fire(plus.webview.getLaunchWebview(), "update_user_info");
					//ca.sendNotice(arr, 'update_user_info', {});
					ca.closeWaiting();
					ca.prompt("登出成功!");

					localStorage.removeItem("logined");
                    localStorage.removeItem("user_info");
                    localStorage.removeItem("patronHolds_info");
                    hidLogined.style.display = "block";
                    login_btn.addEventListener('tap', loginAccount);


				}
			});
		});
	} else {
		showLoginOut.style.display = "none";
		hidLogined.style.display = "block";
	    hidLogined.addEventListener('tap', loginAccount);


	}
}