var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
mui.plusReady(function() {
	ca.init();
	//	try {
	//		if(plus.os.name == "Android") {
	//			plus.fingerprintIdent.cancelIdentify();
	//			checkIsRegristerFingerPrint();
	//		} else
	//			checkIsRegristerFingerPrint();
	//	} catch(e) {
	//		ca.prompt(e.message);
	//	}
	var $account = $('.login .account');

	window.addEventListener("update_account", function(e) {
		//更新資料 
		loadListed();
	});
	loadListed();
	$('.font-color-light').click(function(e) {
		clicked("pwd_forgotten.html");
	});
	$('.butn').eq(3).click(function(e) {
		e.preventDefault(); // 組織默認事件
		validateLogin(e);

	});

	function loadListed() {
		var tmp = "";
		var localNickName = AntiSqlValidate(plus.storage.getItem(AntiSqlValidate("nickname")));
		var localCard = AntiSqlValidate(plus.storage.getItem(AntiSqlValidate("card")));
		if(localCard != null) {
			var cardArr = localCard.split("#");
			var nickNameArr = localNickName.split("#");
			for(var i = 1; i < cardArr.length; i++) {
				var cardId1 = cardArr[i].substring(0, 4);
				var cardId2 = cardArr[i].length > 15 ? cardArr[i].substring(8, 17) + "..." : cardArr[i].substring(8, cardArr[i].length);
				var cardId = cardId1 + "***" + cardId2;
				var nickName = nickNameArr[i].length > 5 ? nickNameArr[i].substring(0, 4) + "..." : nickNameArr[i];
				tmp += '<li>' +
					'   <div class="name">' + nickName + '</div>' +
					'   <div class="id" data="' + cardArr[i] + '">' + cardId + '</div>' +
					' </li>';
			};
			$account.find('.account-list').html(tmp);
			$account.on('click', '.account-list li', function() {
				$('#account-id').val($(this).find('.id').attr("data"));
				$account.find('.chose').removeClass('focus').addClass('gray');
				$account.find('.account-list-box').css('display', 'none')
			})
		}
	}
});

function validateLogin(e) {
	try {
		var cardTxt = "";
		var pwdTxt = "";

		if(e == undefined) {
			if(plus.os.name == "iOS") {
				cardTxt = localStorage.getItem("fingerprint_username_ios");
				pwdTxt = localStorage.getItem("fingerprint_password_ios");
			} else if(plus.os.name == "Android") {
				cardTxt = localStorage.getItem("finger_username_android");
				pwdTxt = localStorage.getItem("finger_password_android");
			}
		} else {
			//e.preventDefault();
			// 組織默認事件
			cardTxt = trim($("#account-id").val());
			pwdTxt = trim($("#password").val());
		}
		if(cardTxt == "") {
			ca.prompt("請輸入帳號！");
			ca.id("account-id").focus();
			return false;
		}
		if(cardTxt.length < 6) {
			ca.prompt("帳號輸入有誤！");
			ca.id("account-id").focus();
			return false;
		}
		if(pwdTxt == "") {
			ca.prompt("請輸入密碼！");
			ca.id("password").focus();
			return false;
		}
		$("#password").blur();
		$("#account-id").blur();

		ca.showWaiting();
		ca.get({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: "patronAuth", //  patronAuthNonEncode
				username: cardTxt,
				password: DigestPassword(pwdTxt)
			},
			succFn: function(data) {
				ca.closeWaiting();
				if(data.indexOf("#") != -1) {
					var arrInfo = data.split("#");
					if(arrInfo[0].toUpperCase() == "ok".toUpperCase()) {
						var device_token = "",
							device_type = "android";
						var local_token = AntiSqlValidate(localStorage.getItem("device_token"));
						if(local_token != null && local_token != "" && local_token != '') {
							device_token = local_token;
						} else {
							if(plus.os.name == "Android") {
								try {
									var JSBridge = plus.android.importClass("com.claridy.util.JSBridge");
									var JSBridgeinstance = new JSBridge();
									JSBridgeinstance.initPushService(plus.android.runtimeMainActivity());
									var token = JSBridgeinstance.getToken(plus.android.runtimeMainActivity());
									device_token = token;
									localStorage.setItem("device_token", AntiSqlValidate(device_token));
								} catch(e) {
									console.log('e' + e);
									//getAndroidToke();
								}
							} else
								device_token = plus.push.getClientInfo().token;
						}

						if(typeof FingerPrint_Logincheck == 'function') {
							try {
								FingerPrint_Logincheck(data, pwdTxt, cardTxt, e);
							} catch(e) {
								loginSuccess(data, pwdTxt, cardTxt);
							}
						} else
							loginSuccess(data, pwdTxt, cardTxt);

						device_type = plus.os.name;
						ca.post({
							url: baseUrl,
							timeout: 10,
							data: {
								identify: "TCC",
								func: "gcmInsertUser",
								username: cardTxt,
								password: DigestPassword(pwdTxt),
								device_token: device_token,
								device_type: device_type.toLowerCase(),
								login: "true"
							},
							succFn: function(strArr) {}
						});
						//ca.closeWaiting();
					} else {
						mui.alert(arrInfo[1], '登入失敗', function() {
							//ca.closeWaiting();
						});
					}
				} else {
					//ca.closeWaiting();
					ca.prompt(clearXSS(data));
				}
			}
		});
		return false;
	} catch(exception) {
		ca.prompt(exception);
		return false;
	}
}

function loginSuccess(data, pwdTxt, cardTxt) {
	localStorage.setItem("user_info", data);
	localStorage.setItem("logined", "logined");
	localStorage.setItem("realPwd", pwdTxt);
	localStorage.setItem("cardTxt", cardTxt);
	if(plus.os.name == 'Android' && parseFloat(mui.os.version) == 4.1) {
		plus.storage.setItem("user_info", AntiSqlValidate(data));
		plus.storage.setItem("logined", AntiSqlValidate("logined"));
		plus.storage.setItem("realPwd", AntiSqlValidate(pwdTxt));
		plus.storage.setItem("cardTxt", cardTxt);

	}
	var prePage = AntiSqlValidate(localStorage.getItem("prePage"));
	mui.fire(plus.webview.getWebviewById("other.html"), "update_user_info");
	mui.fire(plus.webview.getWebviewById("result.html"), "update_user_info");
	mui.fire(plus.webview.getWebviewById("shelf_library.html"), "update_user_info");
	mui.fire(plus.webview.getLaunchWebview(), "init");
	mui.fire(plus.webview.currentWebview().opener(), "reload");

	ca.prompt("登入成功！");
	if(prePage === "search" || prePage === "book_detail") {
		mui.back();
	} else if(prePage) {
		clicked(prePage + ".html");
	} else {
		mui.back();

	}
}