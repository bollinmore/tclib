mui.plusReady(function() {
	baseUrl = localStorage.getItem("baseUrl");
	$username = $("input").eq(0);
	$email = $("input").eq(1);

	baseUrl = localStorage.getItem("baseUrl");
	$('.butn').eq(0).click(function(e) {
		e.preventDefault(); // 組織默認事件
		formsubmit(e);
	});
});

function formsubmit(e) {

	var username = "";
	var email = "";

	username = trim($username.val());
	email = trim($email.val());
	$("input").blur();
	if(username == "") {
		ca.prompt("請輸入帳號！");
		$username.focus();
		return false;
	}
	if(username.length < 6) {
		ca.prompt("帳號輸入有誤！");
		$username.focus();
		return false;
	}
	if(email == "") {
		ca.prompt("請輸入EMAIL！");
		$email.focus();
		return false;
	}
	if(!fChkMail(email)) {
		ca.prompt("請輸入正確EMAIL格式！");
		$email.focus();
		return false;
	}
	ca.showWaiting();
	ca.get({
		url: baseUrl,
		data: {
			identify: "TCC",
			func: "resetpw", //  patronAuthNonEncode
			username: username,
			email: email
		},
		succFn: function(data) {
			ca.closeWaiting();
			var resetpwResult = data.split("#");
			if(resetpwResult[0].indexOf('ok') > -1) {
				mui.alert('郵件發送成功。', '溫馨提醒', function() {
					mui.back();
				});
			} else {
				if(resetpwResult.length > 1)
					mui.alert(resetpwResult[1], '錯誤', function() {});
				else
					mui.alert('網路發生錯誤，請稍後再嘗試。', '錯誤', function() {});
			}

		}
	});
	return false;

}

function fChkMail(szMail) {
	var szReg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
	var bChk = szReg.test(szMail);
	if(!bChk) {
		var arr = szMail.split('@');
		if(arr.length > 2) {
			bChk = true;
		}
	}
	return bChk;
}