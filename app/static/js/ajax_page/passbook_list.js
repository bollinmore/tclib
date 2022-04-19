mui.plusReady(function() {

	var $list = $("div.passbook-list ul li a");

	readyLoad();

	$($list).eq(0).on('click', function() {
		clicked('passbook_rewardDetail.html');
	});
	$($list).eq(1).on('click', function() {
		clicked('passbook_change_gift.html');
	});
	$($list).eq(2).on('click', function() {
	    clicked('passbook_pointDetail.html');
	});
	$($list).eq(3).on('click', function() {
	    clicked('passbook_qrcode_scan.html');
	});

	function readyLoad() {
		var userInfo = localStorage.getItem("user_info");
		if(null == userInfo) {
			mui.alert('您尚未登入，請先進行登錄', '溫馨提醒', function() {
				clicked('login.html');
			});
		}
	}

});