mui.plusReady(function() {
	var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
	var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
	var realPwd = AntiSqlValidate(localStorage.getItem("tmpPwd64"));
	var listbook = ca.className("list-book");
	var reservationData = null;
	if(null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
		infoArr = userInfo.split("#");
	}
	ca.showWaiting();
	readLoad();

	function readLoad() {
		listbook[0].innerHTML = "";

		var params = 'func=patronHolds';
		var sign;
		var KeyNum;
		if(plus.os.name == 'Android') {
			var APISecurity = plus.android.importClass("com.claridy.util.security.APISecurity");
			sign = APISecurity.encrypt(params);
			KeyNum = APISecurity.getKeyNum();
		} else {
			var APISecurity = plus.ios.newObject("APISecurity");
			sign = plus.ios.invoke(APISecurity, "encrypt:", params);
			KeyNum = plus.ios.invoke(APISecurity, "getKeyNum");
			plus.ios.deleteObject(APISecurity);
		}

		ca.post({
			url: baseUrl,
			data: {
				identify: "ntcl",
				func: "patronHolds",
				username: infoArr[1],
				password: realPwd
//				sign: sign,
//				key: KeyNum
			},
			succFn: function(data) {
			    ca.closeWaiting();
				var jsonData = JSON.parse(data);
				var num = 0;
				reservationData = new StringBuilder();
				for(var a in jsonData) {
					if(jsonData[a].status == "failure") {
						ca.prompt(jsonData[a].cause);
						return;
					} else if(jsonData[a].title) {
						num++;

						reservationData.append('<div class="book">');
						reservationData.append('<div class="info">');
						reservationData.append('<h3>' + AntiSqlValidate(jsonData[a].title) + '</h3>');
						reservationData.append('<p>條碼號：' + AntiSqlValidate(jsonData[a].itemNumber) + '</p>');
						reservationData.append('<p>館藏地：' + AntiSqlValidate(jsonData[a].locationName) + '</p>');
						reservationData.append('<p>索書號：' + AntiSqlValidate(jsonData[a].callNumber) + '</p>');
						reservationData.append('<p>資料類型：' + AntiSqlValidate(jsonData[a].materialType) + '</p>');
						reservationData.append('<p>取書期限：' + AntiSqlValidate(jsonData[a].dueDate.substring(0, 11)) + '</p>');
						reservationData.append('<p>取書館：' + AntiSqlValidate(jsonData[a].pickupLocationName) + '</p>');
						reservationData.append('</div></div><!-- class="book-info" End -->');
					}
				}
				listbook[0].innerHTML = reservationData.toString() == "" ? '<div id="no" align="center">無預約到館資料</div>' : reservationData.toString();

			}
		});
	}
});