mui.plusReady(function() {
	$input = $("input");
	$nickname = $input.eq(0);
	$username = $input.eq(1);
	$(".butn").eq(1).click(function(e) {
		e.preventDefault(); // 組織默認事件
		validate();
	});
});

function validate() {

	if($username.prop("lockedAt")!=undefined  ||!$username.prop("lockedAt") || +new Date() - $username.prop("lockedAt") > 1500) {
		var nickname = AntiSqlValidate(trim($nickname.val()));
		var card = AntiSqlValidate(trim($username.val()));
		if(nickname == '') {
			ca.prompt(AntiSqlValidate("請輸入暱稱!"));
			$nickname.focus();
			return false;
		}
		if(nickname.length > 8) {
			$nickname.focus();
			ca.prompt(AntiSqlValidate("暱稱最多只能輸入8個中英文字或數字!"));
			return false;
		}
		if(card == '') {
			ca.prompt(AntiSqlValidate("請輸入讀者帳號!"));
			return false;
		}
		if(card.length < 7) {
			$username.focus();
			ca.prompt(AntiSqlValidate("讀者帳號字數不足!"));
			return false;
		}
		$username.blur();
		$nickname.blur();
		var localNickName = AntiSqlValidate(plus.storage.getItem("nickname"));
		var localCard = AntiSqlValidate(plus.storage.getItem("card"));
		plus.storage.setItem("nickname", AntiSqlValidate(localNickName + "#" + nickname));
		plus.storage.setItem("card", AntiSqlValidate(localCard + "#" + card));
		mui.fire(mui.currentWebview.opener(), "update_account");
		mui.fire(plus.webview.getWebviewById("login.html"), "update_account");
		mui.fire(plus.webview.getWebviewById("tmp_login.html"), "update_account");
		mui.back();
	}
	$username.prop('lockedAt', +new Date()); // 組織默認事件
	return false;
}