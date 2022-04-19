mui.plusReady(function() {
	baseUrl = localStorage.getItem("baseUrl");
	$currentpassword = $("input").eq(0);
	$newpassword = $("input").eq(1);
	$confirmnewpassword = $("input").eq(2);

	baseUrl = localStorage.getItem("baseUrl");
	$('.butn').eq(1).click(function(e) {
		e.preventDefault(); // 組織默認事件
		formsubmit(e);

	});
});

function formsubmit(e) {

	var currentpassword = "";
	var newpassword = "";
	var confirmnewpassword = "";
	var userInfo = localStorage.getItem("user_info");
	var infoArr = userInfo.split("#");
	if(infoArr.length == 0) {
		ca.prompt("帳號出現錯誤!");
		return false;
	}
	currentpassword = trim($currentpassword.val());
	newpassword = trim($newpassword.val());
	confirmnewpassword = trim($confirmnewpassword.val());
	if(currentpassword == "") {
		ca.prompt("請輸入目前密碼！");
		$currentpassword.focus();
		return false;
	}
	if(newpassword == "") {
		ca.prompt("請輸入新密碼！");
		$newpassword.focus();
		return false;
	}
	if(confirmnewpassword == "") {
		ca.prompt("請再次輸入新密碼！");
		$confirmnewpassword.focus();
		return false;
	}
	if(newpassword != confirmnewpassword) {
		ca.prompt("再次輸入新密碼不一致！");
		$confirmnewpassword.focus();
		return false;
	}

	if(newpassword.length < 8) {
		ca.prompt("密碼至少8碼以上，需包含英文字母與數字！");
		$newpassword.focus();
		return false;
	}

	$currentpassword.blur();
	$newpassword.blur();
	$confirmnewpassword.blur();

	ca.showWaiting();
	ca.get({
		url: baseUrl,
		data: {
			identify: "TCC",
			func: "chpw", //  patronAuthNonEncode
			username: infoArr[1],
			password: currentpassword,
			newpw: newpassword
		},
		succFn: function(data) {
			ca.closeWaiting();
			try {
				var resetpwResult = data.split("#");
				if(resetpwResult[0].trim() == "ok") {
					mui.alert('密碼重新設定成功。', '溫馨提醒', function() {
						mui.back();
					});

					var device_token = localStorage.getItem("device_token");
					var device_type = plus.os.name;
					ca.get({
						url: baseUrl,
						data: {
							identify: "TCC",
							func: "gcmInsertUser",
							username: userInfo.split("#")[1],
							password: userInfo.split("#")[7],
							device_token: device_token,
							device_type: device_type.toLocaleLowerCase(),
							login: "true"
						},
						succFn: function(dataOut) {}
					});

				} else {
					if(resetpwResult.length > 1) {
						mui.alert(resetpwResult[1], '錯誤', function() {});
					} else {
						mui.alert('網路發生錯誤，請稍後再嘗試。', '錯誤', function() {});
					}
				}
			} catch(e) {
				ca.prompt(data.split("#").length >= 2 ? data.split("#")[1] : e.message);
			} finally {
				ca.closeWaiting();
			}
		}
	});
	return false;

}