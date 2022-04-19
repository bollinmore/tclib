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
	$('.butn').eq(1).click(function(e) {
		e.preventDefault(); // 組織默認事件
		validateLogin(e);

	});
});

function validateLogin(e) {
	try {
		var pwdTxt = "";
		var cardTxt = "";
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
			var userInfo = localStorage.getItem("user_info");
			cardTxt = userInfo.split("#")[1];
			pwdTxt = trim($("#password").val());
		}

		if(pwdTxt == "") {
			ca.prompt("請輸入密碼！");
			$("#password").focus();
			return false;
		}
		$("#password").blur();

		ca.showWaiting();
		ca.get({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: "queryNormalCardNumber",
				username: cardTxt,
				password: DigestPassword(pwdTxt)
			},
			succFn: function(data) {
				try {
					var arrInfo = data.split("#");
					if(arrInfo[0].toUpperCase() == "ok".toUpperCase()) {
						localStorage.setItem("barcode", data);
						if(typeof FingerPrint_tmpLogincheck === 'function') {
							try {
								FingerPrint_tmpLogincheck(pwdTxt, cardTxt, e);
							} catch(e) {
								loginSuccess();
							}
						} else
							loginSuccess();
					} else {
						ca.prompt(arrInfo[1].replace("failure", ""));
					}
				} catch(e) {
					ca.prompt(e.message);
				} finally {
					ca.closeWaiting();
				}
			}
		});
		return false;
	} catch(exception) {
		ca.prompt(exception);
		return false;
	}
}

function loginSuccess() {
	$("#password").val("");
	clicked("card_barcode.html");
}