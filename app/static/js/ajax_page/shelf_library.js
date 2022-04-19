mui.plusReady(function() {
	window.addEventListener("update_num", function(e) {
		readyLoad();
	});
	var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
	var $num = $(".font-color-light");
	var $status = $(".butn-box");
	var $userName = $(".member-name span");
	readyLoad();
	$(".reset-pwd").on('click', function() {
		clicked('pwd_reset.html');
	});

	$('div.status ul li a').eq(2).on('click', function() {
		clicked('shelf_permission.html');
	});
	$('div.status ul li a').eq(0).on('click', function() {
		clicked('shelf_reservation.html');
	});
	$('div.status ul li a').eq(1).on('click', function() {
		clicked('shelf_borrow.html');
	});
	$status.find(".butn").eq(0).click(function() {
		clicked("shelf_expired.html");
	});
	$status.find(".butn").eq(1).click(function() {
		clicked("shelf_hold.html");

	});
	$status.find(".butn").eq(2).click(function() {
		clicked("shelf_due.html");

	});

	function getOverduesDateData() {
		var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
		var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
		var infoArr = "";
		if(null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
			infoArr = userInfo.split("#");
		} else
			return;
		ca.post({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: "patronOverdues",
				username: infoArr[1],
				password: realPwd
			},
			succFn: function(data) {
				var dueData = JSON.parse(data);
				if(dueData != "" && dueData != null && data != "[]") {
					for(var b in dueData) {
						if(dueData[b].status != "failure") {
							($status.css('display') == "none") && $status.css('display', 'block');
							($status.find(".butn").eq(0).css('display') == "none") && $status.find(".butn").eq(0).css('display', 'block');
							break;
						}
					}
				} else {

					//$status.css('display', 'none');
				}
				try {
					var overnum = 0;
					for(var a in dueData) {
						if(dueData[a].title) {
							overnum++;
							break;
						} else {
							return;
						}
					}
//					alert('getOverduesDateData'+overnum);

					getDueDateData(overnum);
				} catch(e) {
					ca.prompt("無法取得逾期資料");

				}
			},
			error: function(xhr, type, errorThrown) {}
		});
	}

	function getDueDateData(overnum) {
		var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
		var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
		var infoArr = "";
		if(null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
			infoArr = userInfo.split("#");
		} else
			return;
		var baseUrl = localStorage.getItem("baseUrl");
		ca.post({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: "patronDues",
				username: infoArr[1],
				password: realPwd
			},
			succFn: function(data) {
				var dueData = JSON.parse(data);
				if(dueData != "" && dueData != null && data != "[]") {
					for(var b in dueData) {
						if(dueData[b].status != "failure") {
							($status.css('display') == "none") && $status.css('display', 'block');
							($status.find(".butn").eq(2).css('display') == "none") && $status.find(".butn").eq(2).css('display', 'block');
							break;
						}
					}
				} else {

					//$status.css('display', 'none');
				}
				try {
					var jsonData = JSON.parse(data);
					for(var a in jsonData) {
						if(jsonData[a].title) {
							overnum++;
							break;
						} else {
							return;
						}
					}
//					alert('getDueDateData'+overnum);

					getHoldDateData(overnum);
				} catch(e) {
					ca.prompt("無法取得即將到期資料");

				}
			},
			error: function(xhr, type, errorThrown) {}
		});
	}

	function getHoldDateData(overnum) {
		var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
		var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
		var infoArr = "";
		if(null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
			infoArr = userInfo.split("#");
		} else
			return;
		ca.post({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: "patronHolds",
				username: infoArr[1],
				password: realPwd
			},
			succFn: function(data) {
				var holdData = JSON.parse(data);
				if(holdData != "" && null != holdData && data != "[]") {
					for(var b in holdData) {
						if(holdData[b].status != "failure") {
							($status.css('display') == "none") && $status.css('display', 'block');
							($status.find(".butn").eq(1).css('display') == "none") && $status.find(".butn").eq(1).css('display', 'block');
							break;
						}
					}
				} else {

					//					$status.eq(0).css('display', 'none');
				}

				try {
					var holdnum = 0;
					for(var a in holdData) {
						if(holdData[a].title) {
							holdnum++;
							break;
						} else {
							return;
						}

					}
//					alert('getHoldDateData'+holdnum);
					//holdnum = 150;
					var subPages = $('header li');
					var totalnum = overnum + holdnum;
					var currentTotalNum = localStorage.getItem("totalnum");
					localStorage.setItem("totalnum", totalnum);
					if(totalnum > 0) {
//					mui.fire(plus.webview.currentWebview(), "getshelfTotalNum");
							if($("header li .msg").length) {
								$("header li .msg").text(totalnum);

							} else
								$('header li').eq(1).append('<div class="msg">' + totalnum + '</div>');

					} else
					if($("header li .msg").length)
						$("header li .msg").remove();

				} catch(e) {
					ca.prompt("無法取得預約到館資料");
				} finally {

					mui.fire(plus.webview.getLaunchWebview(), "init");
					mui.fire(plus.webview.getWebviewById("index.html"), "init");
				}

			},
			error: function(xhr, type, errorThrown) {}
		});
	}

	function getReserveNumNBorrowNum() {
		var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
		var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
		var infoArr = userInfo.split("#");
		$userName.html(infoArr[3]);
		ca.get({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: "queryPatronBorrowNReserveNumber", // patronAuth
				username: infoArr[1],
				password: realPwd
			},
			succFn: function(data) {
				var json = JSON.parse(data);
				for(var a in json) {
					if(json[a].reserveNum) {
						$num.eq(0).html(json[a].reserveNum);
						$num.eq(1).html(json[a].borrowNum);
					} else {
						ca.prompt("借閱、預約數量擷取錯誤");
						$num.eq(0).html("");
						$num.eq(1).html("");
					}
				}
			}
		});
	}

	function getPermisionData() {
		var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
		var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
		var infoArr = userInfo.split("#");
		ca.get({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: "getPenality", // patronAuth
				username: infoArr[1],
				password: realPwd
			},
			succFn: function(data) {
				var num = 0;
				if(data.indexOf("借閱停權") > -1)
					num++;
				if(data.indexOf("預約停權") > -1)
					num++;
				if(data.indexOf("遺失賠款") > -1)
					num++;
				if(data.indexOf("罰款") > -1)
					num++;
				$num.eq(2).html(num);
			}
		});
	}

	function readyLoad() {
		var userInfo = localStorage.getItem("user_info");
		if(null == userInfo) {
			mui.alert('您尚未登入，請先進行登錄', '溫馨提醒', function() {
				clicked('login.html');
			});
		} else {
			ca.showWaiting();
			try {
				if(null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
					getReserveNumNBorrowNum();
					//getHoldDateData();
					getOverduesDateData();
					getPermisionData();
				}
			} catch(e) {} finally {
				ca.closeWaiting();

			}
		}
	};
});