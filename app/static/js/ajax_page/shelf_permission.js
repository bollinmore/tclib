mui.plusReady(function() {

	var baseUrl = localStorage.getItem("baseUrl");

	var func = "getPenality",
		infoArr = [];

	var $content = $('.font-align-c');
	readLoad();

	function readLoad() {
		var userInfo = localStorage.getItem("user_info");
		var realPwd = localStorage.getItem("realPwd");
		if(null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
			infoArr = userInfo.split("#");
		}
		ca.showWaiting();
		ca.get({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: func,
				username: infoArr[1],
				password: realPwd
			},
			succFn: function(data) {
				try {
					ca.closeWaiting();
					if(data.indexOf("#") > -1) {
						var PermissionResult = data.split("#");
						if(PermissionResult[0] == "ok") {
							var isBorrowStop = false;
							var isReserveStop = false;
							var isLostPay = false;
							var isPay = false;
							for(var i = 0; i < PermissionResult.length; i++) {
								if(PermissionResult[i].indexOf("借閱停權") > -1) {
									isBorrowStop = true;
									$content.eq(1).html(PermissionResult[i].replace("(", "：").replace(")", ""));
								} else if(PermissionResult[i].indexOf("預約停權") > -1) {
									isReserveStop = true;
									$content.eq(2).html(PermissionResult[i].replace("(", "：").replace(")", ""));
								} else if(PermissionResult[i].indexOf("遺失賠款") > -1) {
									isLostPay = true;
									$content.eq(3).html(PermissionResult[i].replace("(", "：").replace(")", ""));
								} else if(PermissionResult[i].indexOf("罰款") > -1) {
									isPay = true;
									$content.eq(4).html(PermissionResult[i].replace("(", "：").replace(")", ""));
								}
							}
							if(!isBorrowStop && !isReserveStop && !isLostPay && !isPay) {
								$content.eq(0).html("無停權資料");

							} else {}

						} else {
							mui.alert('網路發生錯誤，請稍後再嘗試。', '錯誤', function() {
								ca.closeWaiting();
							});
						}
					} else {
						$content.eq(0).html("無停權資料");

					}
				} catch(e) {
					ca.prompt(data.split("#").length >= 2 ? data.split("#")[1] : e.message);
				} finally {
					ca.closeWaiting();
				}
			}

		});
	}
});