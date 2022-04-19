function getSoapMessage(Method, data) {
   // alert(JSON.stringify(data));
	if (Method == 'CAT_GetBookstatusByItemNumber')
		var data = '<web:item_number>' + aesEncrypt(data) + '</web:item_number>';
	else
		var data = '<web:cardid>' + aesEncrypt(data[0]) + '</web:cardid>' +
			'<web:password>' + aesEncrypt(data[1]) + '</web:password><web:item_number>' + aesEncrypt(data[2]) +
			'</web:item_number>';

	var soapMessage =
		'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://webservices.toread.claridy/">' +
		'<soapenv:Header/>' +
		'<soapenv:Body>' +
		'<web:' + Method + '>' +
		data +
		'</web:' + Method + '>' +
		'</soapenv:Body>' +
		'</soapenv:Envelope>';

  
    
	return soapMessage;
}

function getBookCover(txtValue) {
	var baseUrl = localStorage.getItem("baseUrl");
	ca.get({
		url: baseUrl,
		data: {
			identify: "TCC",
			func: "queryBibliographic",
			condition: '1',
			input: txtValue,
			locationId: '',
			start: '0',
			limit: "10",
			sb: 'title',
			ob: 'asc'
		},
		succFn: function(data) {
			var totalNum = "";
			var jsonData = trim(data) == "failure" ? "" : JSON.parse(data);
			if (jsonData != "") {
				var imgSrc = "img/default.png";
				for (var a in jsonData) {
					totalCount = jsonData[0].counts;
					var div = document.createElement('div');
					div.className = 'book-info';
					if (jsonData[a].externalCoverUrl != null) {
						imgSrc = jsonData[a].externalCoverUrl;
						break;
					}
				}
				jQuery("#cover_img").attr('src', imgSrc);
			}
		}
	});
}

function getCardNumber() {
	var baseUrl = localStorage.getItem("baseUrl");
	var userInfo = localStorage.getItem("user_info");
	var realPwd = localStorage.getItem("realPwd");
    var tmpPwd = "";
	if (plus.os.name == 'Android') {
		var JSBridge = plus.android.importClass("com.claridy.util.PasswordDigest");
		tmpPwd = JSBridge.digest(realPwd);
		localStorage.setItem("tmpPwd", AntiSqlValidate(tmpPwd));
	} else {
		var DigestPassword = plus.ios.newObject("DigestPassword");
		tmpPwd = plus.ios.invoke(DigestPassword, "Digest:", realPwd);
		plus.ios.deleteObject(DigestPassword);
		localStorage.setItem("tmpPwd", AntiSqlValidate(tmpPwd));
	}
		ca.get({
			url: baseUrl,
			async: false,
			data: {
				identify: "TCC",
				func: "queryNormalCardNumber",
				username: userInfo.split("#")[1],
				password: tmpPwd
			},
            succFn: function(reposneData){
                var cardnumber = "";
                var arrInfo = trim(reposneData).split("#");
                if (arrInfo[0].toUpperCase() == "ok".toUpperCase()) {
                    cardnumber = arrInfo[1];
                } else {
                    ca.prompt(arrInfo[1].replace("failure", ""));
                }
              //  alert(cardnumber);
                return cardnumber;
            }
		});

}

mui.init();
mui.back = function() {
  clicked("index.html");
};
mui.plusReady(function() {
	var isOK = 0;
	var baseUrl = localStorage.getItem("mobileUrl");
	var self = plus.webview.currentWebview();
	var itemNumber = localStorage.getItem("itemNumber");
	var userInfo = localStorage.getItem("user_info");
	var backBtn = ca.className("mui-action-back");
	// if (null == userInfo) {itemNumer
	// 	mui.alert('您尚未登入，請先進行登錄', '溫馨提醒', function() {
	// 		localStorage.setItem("prePage", "mobile_borrowed");
	// 		clicked("login.html");
	// 	});
	// 	return;
	// }
	//alert(itemNumber);
	ca.showWaiting();
	ca.XMLpost({
		url: baseUrl,
		type: "POST",
		dataType: "xml",
		data: getSoapMessage('CAT_GetBookstatusByItemNumber', itemNumber),
		contentType: "text/xml; charset=\"utf-8\"",
		timeout: 5000,
		success: function(data) {
			ca.closeWaiting();
			var result = $(data).find("allowborrow").text();
			isOK = result;
			var btn = ca.id("borrow_btn");
			var bookname = $(data).find("bookname").text();
			var CoverPath = "dist/img/default.png";
			var locationname = $(data).find("locationname").text();
			var callnumbe = $(data).find("callnumbe").text();
			var booktype = $(data).find("booktype").text();
			var bookinfo = ca.className('book-box')[0];
			bookinfo.innerHTML = '<h3>' + bookname + '</h3>' +
				'<div class="cover">' +
				'<img src="' + CoverPath + '" id="cover_img"/>' +
				'</div>' +
				'<div class="info">' +
				'<p>館藏地：' + locationname + '</p>' +
				'</div>' +
				'';
			if (result == 1) {

				btn.innerHTML = '借出';
				btn.className += ' btn-2';
				getBookCover(bookname.split("/")[0]);
				jQuery("#cancel_btn").show();
				// ca.id("cancel_btn").addEventListener('tap', function() {
				// 	mui.back();
				// });
                btn.addEventListener('tap', function() {
                    ca.showWaiting();
                    var userInfo = localStorage.getItem("user_info");
                    var realPwd = localStorage.getItem("SeatrealPwd");
                    var baseUrl2 = localStorage.getItem("baseUrl");
                    var realPwd = localStorage.getItem("realPwd");
                    var tmpPwd = "";
                    if (plus.os.name == 'Android') {
                        var JSBridge = plus.android.importClass("com.claridy.util.PasswordDigest");
                        tmpPwd = JSBridge.digest(realPwd);
                        localStorage.setItem("tmpPwd", AntiSqlValidate(tmpPwd));
                    } else {
                        var DigestPassword = plus.ios.newObject("DigestPassword");
                        tmpPwd = plus.ios.invoke(DigestPassword, "Digest:", realPwd);
                        plus.ios.deleteObject(DigestPassword);
                        localStorage.setItem("tmpPwd", AntiSqlValidate(tmpPwd));
                    }
                    
                    
                    ca.get({
                        url: baseUrl2,
                        data: {
                            identify: "TCC",
                            func: "queryNormalCardNumber",
                            username: userInfo.split("#")[1],
                            password: tmpPwd
                        },
                        succFn: function(data2) {
                            var cardnumber = "";
                            var arrInfo = trim(data2).split("#");
                            if (arrInfo[0].toUpperCase() == "ok".toUpperCase()) {
                                cardnumber = arrInfo[1];
                            } else {
                                mui.alert("借閱失敗，取得卡號失敗(1)! ", "溫馨提示", function() {});
                                return;
                            }
                            var Soapdata = [cardnumber, realPwd, itemNumber];
                            ca.XMLpost({
                                url: baseUrl,
                                type: "POST",
                                timeout: 10000,
                                dataType: "xml",
                                data: getSoapMessage('OnlineBorrow', Soapdata),
                                contentType: "text/xml; charset=\"utf-8\"",
                                success: function(OnlineBorrowdata) {
                                    ca.closeWaiting();
                                    var OnlineBorrowresult = $(OnlineBorrowdata).find("result").text();
                                    if (OnlineBorrowresult == 'true') {
                                        var closeopdatetime = $(OnlineBorrowdata).find("closeopdatetime").text();
                                        mui.alert("借閱成功，應還日期為：" + closeopdatetime, "溫馨提示", function() {
                                            clicked("index.html");
                                        });
                                    } else {
                                        var annotation = $(OnlineBorrowdata).find("annotation").text();
                                        mui.alert("借閱失敗， " + annotation, "溫馨提示", function() {
                                            clicked("index.html");
                                        })
                                    }
                                },
                                error: function(textStatus, errorThrown) {
                                    console.log(textStatus, errorThrown);
                                    ca.closeWaiting();
                                    mui.alert('網路逾時，請稍後再試!', function(e) {
                                     //   clicked("function-menu-APP.html");
                                    });

                                }
                            });

                        },
                        errFn: function(data) {
                            mui.alert("借閱失敗，取得卡號失敗(2)! ", "溫馨提示", function() {
                                clicked("index.html");
                            });
                        }
                    });

                    
                    
                });
			} else if (result == 2) {
			//	alert("已外借");
				$(".title").html('本書已外借');
				btn.innerHTML = '已外借';
				btn.className += ' btn-dim';
				getBookCover(bookname.split("/")[0]);
			} else if (result == 3) {
				var booktype = $(data).find("booktype").text();
				if (!booktype) {
					var bookinfo = ca.className('book-detail')[0];
					bookinfo.innerHTML = '<div class="padding-box book-box"><h3>無此館藏</h3>' +
						'<div class="cover">' +
						'<img data-lazyload="img/default.png" />' +
						'</div>' +
						'<div class="info">' +
						'<p>館藏地：</p>' +
						'</div>' +
						'</div>';
					mui.alert('無此館藏', "溫馨提示", function(e) {
						// mui.back();
						clicked("index.html");
					});
				} else {
				    mui.alert('手機借書服務，僅開放總館、大里、大里德芳、烏日、豐原、外埔、霧峰以文、太平坪林及精武圖書館之館藏使用。本書籍非上列之館藏。', "貼心提醒", function(e) {
                    });
				}
				$(".title").html('本書無手機借閱服務');
				$("#borrow_btn").hide();
				//btn.innerHTML = '本書無手機借閱服務';
				//btn.className += ' btn-dim';
				getBookCover(bookname.split("/")[0]);

			} else {
				mui.alert('資料信息異常，請稍後再嘗試', function(e) {
					// mui.back();
					clicked("index.html");
				});
			}
			(function($) {
				$(document).imageLazyload({
					placeholder: 'img/default.png'
				});
			})(mui);

		},
		error: function(textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
			ca.closeWaiting();
			mui.alert('資料信息異常，請稍後再嘗試', function(e) {
				// mui.back();
				clicked("index.html");
			});

		}
	});

	//返回時回到首頁
	$.each(backBtn, function(i){
		backBtn[i].addEventListener('tap', function() {
		    clicked("index.html");
		});
	});
	
})
