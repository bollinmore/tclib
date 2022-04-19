mui.plusReady(function() {
	ca.init();
	var timer = null;
	var num = localStorage.getItem("passbook_time");
	var Brightness;
	var $userdata = $(".font-color-light");
	var $timer = $("#timer");
	var $barcode = $(".barcode-img");

	plus.screen.lockOrientation("portrait-primary");
	plus.webview.currentWebview().setStyle({
		popGesture: "none"
	});
	document.addEventListener("pause", onAppPause, false);
	document.addEventListener("resume", onAppResume, false);
	try {
		if(plus.os.name == "Android") {
			activity = plus.android.runtimeMainActivity();
			var Bright = plus.android.importClass("com.claridy.util.Brightness");
			var mBrightness = new Bright();
			window.plus.Brightness = mBrightness;
			mui.back = function() {
				plus.Brightness.resetBrightness(activity);

				document.removeEventListener("pause", onAppPause, false);
				document.removeEventListener("resume", onAppResume, false);
				clearInterval(timer); //避免計時器累計
				clicked("index.html");
			};
			plus.Brightness.setBrightness(activity, 1);

		} else {
			Brightness = plus.screen.getBrightness();
			var DigestPassword = plus.ios.newObject("DigestPassword");
			plus.ios.invoke(DigestPassword, "setHighestBrightness");
			plus.ios.deleteObject(DigestPassword);
			mui.back = function() {
				var DigestPassword = plus.ios.newObject("DigestPassword");
				plus.ios.invoke(DigestPassword, "setBrightness:", Brightness + "");
				plus.ios.deleteObject(DigestPassword);
				document.removeEventListener("pause", onAppPause, false);
				document.removeEventListener("resume", onAppResume, false);
				clearInterval(timer); //避免計時器累計
				clicked("index.html");
			};

		}
		oldclicked = clicked;
		clicked = function() {
			if(plus.os.name == "Android") {
				plus.Brightness.resetBrightness(activity);
			} else {
				var DigestPassword = plus.ios.newObject("DigestPassword");
				plus.ios.invoke(DigestPassword, "setBrightness:", Brightness + "");
				plus.ios.deleteObject(DigestPassword);
			}
			document.removeEventListener("pause", onAppPause, false);
			document.removeEventListener("resume", onAppResume, false);
			clearInterval(timer); //避免計時器累計
			oldclicked.apply(this, arguments);
		};
	} catch(e) {
		ca.prompt("亮度控制發生問題!");
	}
	readyLoad();

	function readyLoad() {
		try {
			var cardNumber = localStorage.getItem("passbook_barcode");
			var giftName = localStorage.getItem("passbook_giftName");
			if(cardNumber != null) {
				ca.showWaiting();
				var date = new Date();
				var today = date.toLocaleDateString();
				$('#giftName').text(giftName);
				$barcode.barcode(cardNumber, 'code39', {
					output: "bmp",
					barWidth: 2,
					barHeight: $barcode.height() * 0.92,
					showHRI: false
				});
				$barcode.removeAttr("style");
				if (undefined == num || '' == num) {
					num = 600;
				}
				timer = setInterval(function() {
					num--;
					if(num < 1) {
						clicked("index.html");
						clearInterval(timer); //避免計時器累計

					} else {
						var minute = Math.floor(num / 60);
						var second = Math.floor(num % 60);
						$timer.html(minute + "分" + second + "秒後返回首頁");
					}

				}, 1000);

			}
			localStorage.removeItem("passbook_barcode");
		} catch(e) {
			ca.prompt(e.message);
		} finally {
			ca.closeWaiting();

		}
	}

	function onAppPause() {
		if(plus.os.name == "Android") {
			plus.Brightness.resetBrightness(activity);
			var date = new Date(); // "18/03/2015", month is 0-index
			var card_number_time = localStorage.setItem("card_number_time", AntiSqlValidate((date.getTime() / 1000)));
			clearInterval(timer);
		} else {
			var DigestPassword = plus.ios.newObject("DigestPassword");

			plus.ios.invoke(DigestPassword, "setBrightness:", Brightness + "");

			plus.ios.deleteObject(DigestPassword);

		}

	}

	function onAppResume() {
		if(plus.os.name == "Android") {
			plus.Brightness.setBrightness(activity, 1);
			var date = new Date();
			var seconds = new Date().getTime() / 1000;
			var card_number_time = AntiSqlValidate(localStorage.getItem("card_number_time"));
			var subtime = (seconds - card_number_time);
			num = num - subtime;
			timer = setInterval(function() {
				num--;
				if(num < 1) {
					clicked("index.html");
					clearInterval(timer); //避免計時器累計

				} else {
					var minute = Math.floor(num / 60);
					var second = Math.floor(num % 60);
					$timer.html(minute + "分" + second + "秒後返回首頁");
				}

			}, 1000);
		} else {
			var DigestPassword = plus.ios.newObject("DigestPassword");
			plus.ios.invoke(DigestPassword, "setHighestBrightness");
			plus.ios.deleteObject(DigestPassword);
		}
	}
});