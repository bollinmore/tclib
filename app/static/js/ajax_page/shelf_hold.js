mui.plusReady(function() {

	var baseUrl = localStorage.getItem("baseUrl");

	var $bookInfo = $(".main");
	var func = "patronHolds",
		infoArr = [],
		txtBtn = "取消預約";

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
								'    	  <p>條碼號：' + jsonData[a].itemNumber + '</p>' +
								'        <p>館藏地：' + jsonData[a].locationName + '</p>' +
								'        <p>索書號：' + jsonData[a].callNumber + '</p>' +
								'        <p>取書期限：' + jsonData[a].dueDate.substring(0, 11) + '</p>' +
								'    	  <p>取書館：' + jsonData[a].pickupLocationName + '</p>' +
								'</div><!-- class="book-info" End -->';
						}
					}
					$bookInfo.html(tmp == "" ? '<div id="no" align="center">無書籍資料</div>' : tmp);
				} catch(e) {
					ca.prompt(e.message);
				} finally {
					ca.closeWaiting();
				}
			}

		});
	}
});