mui.plusReady(function() {
    $("meta[name='viewport']").attr("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");

	Date.prototype.Format = function(fmt) { //author: meizz 
		var o = {
			"M+": this.getMonth() + 1, //月份 
			"d+": this.getDate(), //日 
			"h+": this.getHours(), //小时 
			"m+": this.getMinutes(), //分 
			"s+": this.getSeconds(), //秒 
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
			"S": this.getMilliseconds() //毫秒 
		};
		if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	};
	ca.init();

	function checkNewsNum() {
		var Newsnum = localStorage.getItem("Newsnum");
		if(Newsnum > 0) {
			if($(".menu-butn .msg").length) {
				$(".menu-butn .msg").text(Newsnum);
			} else
				$(".menu-butn").append('<div class="msg">' + Newsnum + '</div>');
		} else
		if($(".menu-butn .msg").length)
			$(".menu-butn .msg").remove();
	}

	function checktotalNum() {
		var totalnum = localStorage.getItem("totalnum");
		if(totalnum > 0) {
			if($("header li .msg").length) {
				$("header li .msg").text(totalnum);
			} else
				$('header li').eq(1).append('<div class="msg">' + totalnum + '</div>');
		} else
		if($("header li .msg").length)
			$("header li .msg").remove();
	}
	checktotalNum();
	checkNewsNum();
	window.addEventListener("reload", function(e) {
		getOverduesDateData();
	});
	window.addEventListener("getshelfTotalNum", function(e) {
		checktotalNum();
	});
	window.addEventListener("getNewsNum", function(e) {
		checkNewsNum();
	});
	//var cursorFocus = function(elem) {
	//var x = $(elem).scrollTop;
	////  alert(x+"-"+y);
	//  $('.main').animate({
	//  scrollTop: x
	//}, 5000);
	//console.log("test"+x);
	//}

	$('body').on('focusin', 'input', function(event) {
		//		$([document.documentElement, document.body]).animate({
		//			scrollTop: $("input").offset().top - $("header").height() - 50
		//		}, 500);
		if($('#keyword')) {
			$('.barcode').hide();
			$('#keyword').blur(function(e) {
				console.log("blur");
				setTimeout(function() {
					$('.barcode').show();
					 $(window).resize();
				}, 500);

			});
		}
	});
	//
	//$("input").focus(function(){
	//	alert("test");
	//	setTimeout(function(){
	//		
	//		$([document.documentElement, document.body]).animate({
	//      scrollTop: $("input").offset().top-230
	//  }, 1000);
	//		
	//	},5000);
	//
	//	//cursorFocus(this);
	//});

	var $logingbtntext = $(".member a p");
	var loginBtn = $(".member a");
	var $loginBtnimg = $(".member a img");

	//公共的footer部份，之前需引入castApp.js和mui.js
	window.addEventListener("init", function() {
		if($("input"))
			$("input").val("");
		if(localStorage.getItem("logined") == "logined") {
			$logingbtntext.html("登出");
			$loginBtnimg.attr({
				"src": "dist/img/icon_logout.png"
			});
		} else {
			$logingbtntext.html("登入");
			$loginBtnimg.attr({
				"src": "dist/img/icon_login.png"
			});
		}
		checkNewsNum();
		checktotalNum();
	});

	plus.screen.lockOrientation("portrait-primary");
	plus.webview.currentWebview().setStyle({
		popGesture: "none"
	});

	if(loginBtn) {
		if(localStorage.getItem("logined") == "logined") {
			$logingbtntext.html("登出");
			$loginBtnimg.attr({
				"src": "dist/img/icon_logout.png"
			});
		} else {
			$logingbtntext.html("登入");
			$loginBtnimg.attr({
				"src": "dist/img/icon_login.png"
			});
		}
		loginBtn.click(function() {
			if(localStorage.getItem("logined") == "logined") {
				var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
				var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
				var device_type = plus.os.name;
				var device_token = AntiSqlValidate(localStorage.getItem("device_token"));
				ca.showWaiting();
				ca.post({
					url: baseUrl,
					timeout: 10,
					data: {
						identify: "TCC",
						func: "gcmInsertUser",
						username: userInfo.split("#")[1],
						password: userInfo.split("#")[7],
						device_token: device_token,
						device_type: device_type.toLocaleLowerCase(),
						login: "false"
					},
					succFn: function(dataOut) {
						ca.closeWaiting();
						localStorage.removeItem("logined");
						localStorage.removeItem("user_info");
						localStorage.removeItem("patronHolds_info");
						localStorage.removeItem("overDues_info");
						plus.storage.removeItem("logined");
						plus.storage.removeItem("user_info");
						console.log(plus.webview.currentWebview().id);
						localStorage.setItem("totalnum", 0);
						if((plus.webview.currentWebview().id == "index.html") ||
							(plus.webview.currentWebview() == plus.webview.getLaunchWebview())) {
							$logingbtntext.html("登入");
						} else
							clicked("index.html");
						checktotalNum();

						ca.prompt("登出成功!");
					}
				});
			} else {
				clicked("login.html");
			}
		});
	}

	var subPages = $('header li');
	var totalnum = plus.storage.getItem("totalovernum") + plus.storage.getItem("totalholdnum");
	if(totalnum > 0)
		subPages['1'].append('<div class="msg">' + totalnum + '</div>');
	var logined = AntiSqlValidate(localStorage.getItem("logined"));
	//回首頁
	subPages['0'].addEventListener('tap', function(e) {
		e.preventDefault();
		var logined = AntiSqlValidate(localStorage.getItem("logined"));
		if(logined != null && logined != '') {
			clicked("card_pwd.html");
		} else {
			clicked("tmp_login.html");
		}

	});

	//我的書房
	subPages['1'].addEventListener('tap', function(e) {
		e.preventDefault();
		var logined = AntiSqlValidate(localStorage.getItem("logined"));
		if(logined == null || logined == '') {
			localStorage.setItem("prePage", "shelf_library");
			clicked('login.html');
			mui.alert('您尚未登入，請先進行登錄', '溫馨提醒', function() {});
		} else {
			clicked('shelf_library.html');
		}
	});

	//館藏查詢
	subPages['2'].addEventListener('tap', function(e) {
		e.preventDefault();
		clicked("search.html");
	});

	//數位資源
	/*subPages['3'].addEventListener('tap', function() {
		ca.openUrl("https://www.library.taichung.gov.tw/public/collection/index.asp?Parser=99,20,520,466,212#1");
	});*/

	//手機借書(上方menu)
    subPages['3'].addEventListener('tap', function() {
    	//plus.runtime.openURL( 'http://www.library.taichung.gov.tw/public/Latestevent/index.asp?Parser=22,20,214,50' ) ;
        var logined = AntiSqlValidate(localStorage.getItem("logined"));
        if(logined == null || logined == '') {
            localStorage.setItem("prePage", "shelf_library");
        	clicked('login.html');
        	mui.alert('您尚未登入，請先進行登錄', '溫馨提醒', function() {});
        } else {
        	//localStorage.setItem("itemNumber", "31706000561201");

        	clicked('mobileborrow_barcode_scan.html');
        }
    });

  //國資圖館藏查詢上方加入電子資源
  $('nav ol').append("<li><a>電子資源查詢</a></li>");
	$('nav li').eq(9).insertBefore($('nav li').eq(8));

	//閱讀存摺
	$('nav ol').append("<li><a>閱讀存摺</a></li>");

    //	$('nav ol').append("<li><a>手機借書</a></li>"); /* sidebar 手機借書 */

	var Nav = $('nav li');
	Nav.eq(0).hide();
	Nav.eq(1).hide();
	Nav.eq(2).hide();
	Nav.eq(3).hide();
	Nav.eq(4).hide();
	Nav.eq(5).hide();
	Nav['0'].addEventListener('tap', function() { //活動資訊
		//plus.runtime.openURL( 'http://www.library.taichung.gov.tw/public/Latestevent/index.asp?Parser=22,20,214,50' ) ; 
		if($("nav.menu").hasClass("active")) {
			$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png")
			$("nav.menu").removeClass("active");
		}
		ca.openUrl("https://www.library.taichung.gov.tw/public/activity/index.asp?Parser=10,20,541,50");
	});
	Nav['1'].addEventListener('tap', function() { //分館資訊
		if($("nav.menu").hasClass("active")) {
			$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png");
			$("nav.menu").removeClass("active");
			$(".main").removeClass("no-scroll");
		}
		ca.openUrl("http://www.library.taichung.gov.tw/public/libraryInfo/index.asp?Parser=99,20,49");
	});
	Nav['2'].addEventListener('tap', function() { //室往官網
		if($("nav.menu").hasClass("active")) {
			$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png");
			$("nav.menu").removeClass("active");
			$(".main").removeClass("no-scroll");

		}
		ca.openUrl("http://www.library.taichung.gov.tw/public/index.asp");
	});
	Nav['3'].addEventListener('tap', function() { //FB粉專
		if($("nav.menu").hasClass("active")) {
			$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png")
			$("nav.menu").removeClass("active");
			$(".main").removeClass("no-scroll");
		}
		ca.openUrl("https://www.facebook.com/TaichungCityLibrary/");
	});
	Nav['4'].addEventListener('tap', function() { //長見問提
		if($("nav.menu").hasClass("active")) {
			$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png")
			$("nav.menu").removeClass("active");
			$(".main").removeClass("no-scroll");
		}
		ca.openUrl("https://www.library.taichung.gov.tw/public/faq/index.asp?Parser=27,20,54");
	});
	Nav['5'].addEventListener('tap', function() { //帳號管理
		if($("nav.menu").hasClass("active")) {
			$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png");
			$("nav.menu").removeClass("active");
			$(".main").removeClass("no-scroll");
		}
		clicked("account_add_1.html");
	});

	if(Nav['6'])
		Nav['6'].addEventListener('tap', function() { //公佈欄
			if($("nav.menu").hasClass("active")) {
				$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png");
				$("nav.menu").removeClass("active");
				$(".main").removeClass("no-scroll");
			}
			clicked("bulletin.html");
			localStorage.setItem("Newsnum", 0);
			var currentDate = new Date().Format("yyyyMMdd");
			plus.storage.setItem("publishstart", currentDate);
		});
	if(Nav['7'])
		Nav['7'].addEventListener('tap', function() { //Line官方帳號
			if($("nav.menu").hasClass("active")) {
				$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png")
				$("nav.menu").removeClass("active");
				$(".main").removeClass("no-scroll");
			}
			ca.openUrl('https://line.me/R/ti/p/%40qkh0019v');
			//clicked("index.html");
		});
	if(Nav['8'])
    		Nav['8'].addEventListener('tap', function() { //電子資源查詢
    			if($("nav.menu").hasClass("active")) {
    				$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png")
    				$("nav.menu").removeClass("active");
    				$(".main").removeClass("no-scroll");
    			}
    			ca.openUrl('https://www.library.taichung.gov.tw/public/collection/index.asp?Parser=99,20,520,466,212#1');
    			//clicked("index.html");
    		});
	if(Nav['9'])
		Nav['9'].addEventListener('tap', function() { //國資圖館藏查詢
			if($("nav.menu").hasClass("active")) {
				$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png")
				$("nav.menu").removeClass("active");
				$(".main").removeClass("no-scroll");
			}
			ca.openUrl('http://ipac.nlpi.edu.tw');
			//clicked("index.html");
		});

		if (Nav['10'])
		  Nav['10'].addEventListener('tap', function() { //閱讀存摺
		    if ($("nav.menu").hasClass("active")) {
		      $("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png");
		      $("nav.menu").removeClass("active");
		      $(".main").removeClass("no-scroll");
		    }
		    clicked("passbook_list.html");
		  });

	//sidebar 手機借書
	/*
    if(Nav['9'])
		Nav['9'].addEventListener('tap', function() { //手機借書
			//plus.runtime.openURL( 'http://www.library.taichung.gov.tw/public/Latestevent/index.asp?Parser=22,20,214,50' ) ; 
			if($("nav.menu").hasClass("active")) {
				$("header .top .menu-butn img").attr("src", "dist/img/icon_menu.png")
				$("nav.menu").removeClass("active");
			}
			var logined = AntiSqlValidate(localStorage.getItem("logined"));
			if(logined == null || logined == '') {
				localStorage.setItem("prePage", "shelf_library");
				clicked('login.html');
				mui.alert('您尚未登入，請先進行登錄', '溫馨提醒', function() {});
			} else {
				//localStorage.setItem("itemNumber", "31706000561201");
				
				clicked('mobileborrow_barcode_scan.html');
			}
		});
	*/

	//	if(plus.webview.currentWebview() != plus.webview.getLaunchWebview() &&
	//		plus.webview.currentWebview().id != "index.html") {
	//		$("nav.menu ol").prepend('<li id="home"><a>首頁</a></li>');
	//		$("#home").click(function() {
	//			clicked("index.html");
	//		});
	//
	//	}

	var oldback = mui.back;
	mui.back = function() {
		var $input = $("input");
		if($input)
			$input.blur();
		oldback.apply(this, arguments);
	};

	$(".fast-link a").prop("style", "padding:" + $(".card").css("padding-top") + " 0 !important");
	$(".fast-link a div").prop("style", "height:" + $(".card div").height() + "px !important");
	if($(".page-title")) {
		$(".page-title").prop("style", "line-height:" + $(".page-title").height() + "px !important;" + "height:" + $(".page-title").height() + "px !important");
	}

	function getOverduesDateData() {
		var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
		var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
		var infoArr = "";
		if(null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
			infoArr = userInfo.split("#");
		} else
			return;
		ca.post({
			url: localStorage.getItem("baseUrl"),
			data: {
				identify: "TCC",
				func: "patronOverdues",
				username: infoArr[1],
				password: realPwd
			},
			succFn: function(data) {
				try {
					var overnum = 0;
					var jsonData = JSON.parse(data);
					for(var a in jsonData) {
						if(jsonData[a].title) {
							overnum++;
							break;
						} else {
							return;
						}
					}
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
			url: localStorage.getItem("baseUrl"),
			data: {
				identify: "TCC",
				func: "patronHolds",
				username: infoArr[1],
				password: realPwd
			},
			succFn: function(data) {
				try {
					var holdnum = 0;
					var jsonData = JSON.parse(data);
					for(var a in jsonData) {
						if(jsonData[a].title) {
							holdnum++;
							break;
						} else {
							return;
						}

					}
					//	holdnum = 150;
					var subPages = $('header li');
					var totalnum = overnum + holdnum;
					var currentTotalNum = localStorage.getItem("totalnum");
					localStorage.setItem("totalnum", totalnum);
					if(totalnum > 0) {
						if(currentTotalNum != totalnum) {
							mui.fire(plus.webview.currentWebview(), "getshelfTotalNum");
							if($("header li .msg").length) {
								$("header li .msg").text(totalnum);

							} else
								$('header li').eq(1).append('<div class="msg">' + totalnum + '</div>');
						}
					} else {
						if($("header li .msg").length)
							$("header li .msg").remove();
					}

				} catch(e) {

					ca.prompt("無法取得預約到館資料" + e.message);
				}

			},
			error: function(xhr, type, errorThrown) {}
		});
	}

	$(document).on('click', '.top .logo', function(){
	    if((plus.webview.currentWebview().id != "index.html") &&
    		(plus.webview.currentWebview() != plus.webview.getLaunchWebview())) {
    		clicked("index.html");
    	}
	});

	document.addEventListener("pause", function() {
	    clearShelfRatingData();
			clearShelfCommentData();
			clearShelfBookBoxDetailData();
	}, false);
		
	

});

	//刪除我的書房 > 我的分享暫存檔
	function clearShelfRatingData() {
	    var ratingPages = localStorage.getItem('shelf_rating_currentSavePage');
	    if (ratingPages != undefined) {

	        for (i = 0; i <= ratingPages; i++) {
	            try {
	                localStorage.removeItem('shelf_rating_' + i);
	            } catch (e) {
	                // console.log(e);
	            }
	        }
	        localStorage.removeItem('shelf_rating_currentSavePage');
	    }
	}

	//刪除我的書房 > 我的心得暫存檔
	function clearShelfCommentData() {
	    var comentPages = localStorage.getItem('shelf_comment_currentSavePage');
	    if (comentPages != undefined) {

	        for (i = 0; i <= comentPages; i++) {
	            try {
	                localStorage.removeItem('shelf_comment_' + i);
	            } catch (e) {
	                // console.log(e);
	            }
	        }
	        localStorage.removeItem('shelf_comment_currentSavePage');
	    }
	}

	//刪除我的書房 > 我的書櫃詳細暫存檔
	function clearShelfBookBoxDetailData() {
	    var list = localStorage.getItem("shelf_bookBox_List");
	    if (list != undefined && list != "") {
	        var jsonData = JSON.parse(list);
	        for (var a in jsonData) {
	            if (jsonData[a]) {
	                var tagid = jsonData[a];
	                var tempPages = localStorage.getItem('shelf_bookBoxDetail_currentSavePage_' + tagid);
	                if (tempPages != undefined) {

	                    for (i = 0; i <= tempPages; i++) {
	                        try {
	                            localStorage.removeItem('shelf_bookBoxDetail_' + tagid + '_' + i);
	                        } catch (e) {
	                            // console.log(e);
	                        }
	                    }
	                    localStorage.removeItem('shelf_bookBoxDetail_currentSavePage_' + tagid);
	                }
	            }
	        }
	    }


	}
