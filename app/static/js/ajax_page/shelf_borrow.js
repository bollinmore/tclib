mui.plusReady(function() {

	function timeConverter(UNIX_timestamp) {
		var a = new Date(UNIX_timestamp * 1000);
		var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
		var year = a.getFullYear();
		var month = months[a.getMonth()];
		var date = a.getDate();
		var hour = a.getHours();
		var min = a.getMinutes();
		var sec = a.getSeconds();
		var time = year + '-' + month + '-' + date;
		return time;
	}
	var baseUrl = localStorage.getItem("baseUrl");

	var $bookInfo = $(".main");
	var func = "patronLoans",
		infoArr = [],
		txtBtn = "續借";

	$bookInfo.on("click", ".butn", function() {
		var transactionId = this.getAttribute("data");
		var userInfo = localStorage.getItem("user_info");
		if(null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
			infoArr = userInfo.split("#");
		}
		var realPwd = localStorage.getItem("realPwd");
		ca.showWaiting();
		ca.get({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: "continuePatronBorrow",
				username: infoArr[1],
				password: realPwd,
				transactionId: transactionId
			},
			succFn: function(data) {
				try {
					var resultData = JSON.parse(data);
					for(var b in resultData) {
						if(resultData[b].status == "ok") {
							mui.alert('續借成功！', '溫馨提醒', function() {});
							readLoad();
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
							var datum = Date.parse(jsonData[a].dueDate.substring(0, 10));
							arr.push({
								'materialType': jsonData[a].materialType,
								'title': jsonData[a].title,
								'transactionId': jsonData[a].transactionId,
								'callNumber': jsonData[a].callNumber,
								'locationName': jsonData[a].locationName,
								'itemNumber': jsonData[a].itemNumber,
								'dueDate': datum / 1000,
								'openDate': jsonData[a].openDate.substring(0, 11),
								'renewCount': jsonData[a].renewCount
							});
						}
					}
					var byDate = arr.slice(0);
					byDate.sort(function(a, b) {
						return a.dueDate - b.dueDate;
					});

					for(var a in byDate) {
						num++;
						var duedatestring = timeConverter(byDate[a]['dueDate']);
						var dateTime = new Date().getTime();
						var timestamp = Math.floor(dateTime / 1000);
						var duedatenode = '';
						if(byDate[a]['dueDate'] < timestamp)
							duedatenode = '<p class="font-color-remind">還書期限：' + duedatestring + '</p>';
						else
							duedatenode = '<p>還書期限：' + duedatestring + '</p>';
						tmp += ' <div class="padding-box book-text-info">' +
							'	<h3 class="font-color-light">' +
							num + '.' +
							byDate[a]['title'] +
							'	</h3>' +
							'    ' +
							'    	<p>條碼號：' + byDate[a]['itemNumber'] + '</p>' +
							'        <p>館藏地：' + byDate[a]['locationName'] + '</p>' +
							//'        <p>索書號：' + byDate[a]['callNumber'] + '</p>' +
							//'        <p>資料類型：' + byDate[a]['materialType'] + '</p>' +
							'        <p>借閱日期：' + byDate[a]['openDate'] + '</p>' +
							duedatenode +
							'        <p>續借次數：' + byDate[a]['renewCount'] + '</p>' +
							'    <div class="btn-box" ><a class="butn" data="' + byDate[a]['transactionId'] + '">' + txtBtn + '</a></div>' +
							'</div><!-- class="book-info" End -->';

					}

					$bookInfo.html(tmp == "" ? '<div id="no" align="center">無書籍資料</div>' : tmp);
				} catch(e) {
					ca.prompt(e.message);
				}
			}

		});
	}
});