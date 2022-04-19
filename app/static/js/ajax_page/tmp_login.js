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
			$account.on('click','.account-list li',function() {
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
	clicked("card_barcode.html");
}