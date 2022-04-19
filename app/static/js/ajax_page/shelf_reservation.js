mui.plusReady(function() {

	var baseUrl = localStorage.getItem("baseUrl");

	var $bookInfo = $(".main");
	var func = "patronReservations",
		infoArr = [],
		txtBtn = "取消預約";

	$bookInfo.on("click", ".butn", function() {
		var transactionId = this.getAttribute("data");
		var userInfo = localStorage.getItem("user_info");
		if(null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
			infoArr = userInfo.split("#");
		}
		var realPwd = localStorage.getItem("realPwd");
		var btnArray = ['確認', '返回'];
		mui.confirm('確定取消本次預約嗎？選擇確認將取消本次預約', '取消預約', btnArray, function(e) {
			if(e.index == 0) {
				ca.showWaiting();
				ca.get({
					url: baseUrl,
					data: {
						identify: "TCC",
						func: "cancelPatronReservation",
						username: infoArr[1],
						password: realPwd,
						transactionId: transactionId
					},
					succFn: function(data) {
						try {
							var resultData = JSON.parse(data);
							for(var b in resultData) {
								if(resultData[b].status == "ok") {
									var arr = ['shelf_library.html'];
									ca.sendNotice(arr, 'update_num', {});
									mui.alert('取消預約成功', '溫馨提醒', function() {
										readLoad();
									});
								} else {
									mui.alert(resultData[b].cause, '溫馨提醒', function() {});
								}
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

	});

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
					var jsonData = JSON.parse(data);
					var tmp = "",
						num = 0;
					var arr = [];
					for(var a in jsonData) {
						if(jsonData[a].status == "failure") {
							if(jsonData[a].cause == null) {
								mui.alert("網路不穩定，請重新嘗試。", function(e) {
									if(e.index == 0) {
										mui.back();
									}
								});

							} else
								ca.prompt(jsonData[a].cause);
							return;
						} else if(jsonData[a].title) {
							num++;
							tmp += '<div class="padding-box book-text-info">' +
								'	<h3 class="font-color-light">' +
									 num + '.' +
									 jsonData[a].title +
								'	</h3>' +
								'        <p>館藏地：' + jsonData[a].locationName + '</p>' +
								'    	  <p>取書館：' + jsonData[a].pickupLocationName + '</p>' +
								'    	  <p>條碼號：' + jsonData[a].itemNumber + '</p>' +
								'        <p>預約等候順位：' + jsonData[a].rank + '</p>' +
								//'        <p>索書號：' + jsonData[a].callNumber + '</p>' +
								'        <p>預約日期：' + jsonData[a].openDate.substring(0, 11) + '</p>' +
								'    <div class="btn-box"><a class="butn" data="' + jsonData[a].transactionId + '" >' + txtBtn + '</a></div>' +
								'</div><!-- class="book-info" End -->';
						}
					}
					$bookInfo.html(tmp == "" ? '<div id="no" align="center">無書籍資料</div>' : tmp);
				} catch(e) {
					ca.prompt(e.message);
				}finally
				{
					ca.closeWaiting();
				}
			}

		});
	}
});