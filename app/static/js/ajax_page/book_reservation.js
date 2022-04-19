$(document).ready(function() {
	mui.plusReady(function() {
		var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
		var $reservationBtn = $(".butn");
		var $pickUpLocation = $("select");
		var bookinfoDetail = plus.storage.getItem("bookinfo");
		var itemid = AntiSqlValidate(localStorage.getItem("itemid"));
		var $bibcontent = $(".book-box");
		$bibcontent.html(bookinfoDetail);
		var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
		var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
		var infoArr = userInfo.split("#");
		ca.showWaiting();
		ca.get({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: "getPickupLocations",
				username: infoArr[1],
				password: realPwd,
				itemId: itemid
			},
			succFn: function(data) {
				if(trim(data.split("#")[0]) == "failure") {
					ca.prompt(data.split("#")[1]);
				} else {
					var jsonData = JSON.parse(data);
					ca.get({
						url: baseUrl,
						data: {
							identify: "TCC",
							func: "lastPickupLoc",
							username: infoArr[1],
							password: realPwd
						},
						succFn: function(data2) {
							ca.closeWaiting();
							try {
								if((trim(data2).indexOf("您沒有")>-1) ||(trim(data2).indexOf("尚未提供")>-1) ||  (trim(data2.split("#")[0])== "failure")) {
									var getPickupLocationsTmp = '<option value="">請選擇</option>';
									for(var a in jsonData) {
										if(a == 0)
											getPickupLocationsTmp += '<option selected value="' + AntiSqlValidate(jsonData[a].id) + '">' + AntiSqlValidate(jsonData[a].name) + '</option>';
										else {
											getPickupLocationsTmp += '<option value="' + AntiSqlValidate(jsonData[a].id) + '">' + AntiSqlValidate(jsonData[a].name) + '</option>';
										}
									}
									$pickUpLocation.html(getPickupLocationsTmp);
								} else {
									var jsonData2 = JSON.parse(data2);
									var getPickupLocationsTmp = '<option value="">請選擇</option>';
									var getDefaltLocationTmp = '';
									var isHaveLastLocation = false;
									for(var a in jsonData) {
										if(a == 0)
											getDefaltLocationTmp = '<option selected value="' + AntiSqlValidate(jsonData[a].id) + '">' + AntiSqlValidate(jsonData[a].name) + '</option>';
										else {
											if(jsonData2['Location_id'] != undefined &&
												jsonData2['Location_id'] == jsonData[a].id) {
												getPickupLocationsTmp += '<option selected value="' + AntiSqlValidate(jsonData[a].id) + '">' + AntiSqlValidate(jsonData[a].name) + '</option>';
												isHaveLastLocation = true;
											} else
												getPickupLocationsTmp += '<option value="' + AntiSqlValidate(jsonData[a].id) + '">' + AntiSqlValidate(jsonData[a].name) + '</option>';
										}
									}
									if(isHaveLastLocation)
										getPickupLocationsTmp += getDefaltLocationTmp.replace('selected', '');
									else
										getPickupLocationsTmp += getDefaltLocationTmp;

									$pickUpLocation.html(getPickupLocationsTmp);
								}
							} catch(e) {} finally {
								ca.closeWaiting();
							}

						}
					});

				}

			}
		});


		$reservationBtn.click(function() {
			if($pickUpLocation.val() == "") {
				mui.alert('請選擇取書館。', '溫馨提醒', function() {});
				return;
			}
			ca.showWaiting();
			ca.post({
				url: baseUrl,
				data: {
					identify: "TCC",
					func: "patronReservation",
					username: infoArr[1],
					password: realPwd,
					itemId: itemid,
					pickupLocationId: $pickUpLocation.val()
				},
				succFn: function(data) {
					ca.closeWaiting();
					var succJson = JSON.parse(data);
					for(var b in succJson) {
						if(succJson[b].status == "ok") {
							mui.fire(plus.webview.getWebviewById("shelf_library"), "update_num");
							mui.fire(plus.webview.getWebviewById("shelf_reservation"), "update_list");
							mui.alert('預約書籍成功，請等候到館通知，謝謝。', '成功', function() {
								mui.back();
							});
							break;
						} else {
							mui.alert(succJson[b].cause, '預約失敗', function() {});
							break;
						}
					}
				}
			})
		});

	});
});