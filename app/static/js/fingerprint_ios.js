document.addEventListener("plusready", function() {
	try {
		if(plus.os.name == "iOS") {
			// 声明的JS“扩展插件别名”
			var _BARCODE = 'FingerprintIdent',
				B = window.plus.bridge;
			var fingerprintIdent = {
				canEvaluatePolicy: function(successCallback, errorCallback) {
					var success = typeof successCallback !== 'function' ? null : function(args) {
							successCallback(args);
						},
						fail = typeof errorCallback !== 'function' ? null : function(code) {
							errorCallback(code);
						};
					callbackID = B.callbackId(success, fail);
					// 通知Native层plugintest扩展插件运行”PluginTestFunction”方法
					return B.exec(_BARCODE, "canEvaluatePolicy", [callbackID]);
				},
				evaluatePolicy: function(Argus1, successCallback, errorCallback) {
					var success = typeof successCallback !== 'function' ? null : function(args) {
							successCallback(args);
						},
						fail = typeof errorCallback !== 'function' ? null : function(code) {
							errorCallback(code);
						};
					callbackID = B.callbackId(success, fail);
					// 通知Native层plugintest扩展插件运行”PluginTestFunction”方法
					return B.exec(_BARCODE, "evaluatePolicy", [callbackID, Argus1]);
				}
			};
			window.plus.fingerprintIdent = fingerprintIdent;
			checkIsRegristerFingerPrint();
		} else if(plus.os.name == "Android") {
			var activity = plus.android.runtimeMainActivity();
			var FingerprintIdentify = plus.android.importClass("com.wei.android.lib.fingerprintidentify.FingerprintIdentify");
			var mFingerprintIdentify = new FingerprintIdentify(activity);
			window.plus.fingerprintIdent = mFingerprintIdentify;
			//plus.fingerprintIdent.init();
			checkIsRegristerFingerPrint();

			var old_back = mui.back;
			mui.back = function() {
				if($("#login-fingerprint").css("display") != "none") {
					plus.fingerprintIdent.cancelIdentify();
					$("#login-fingerprint").hide();
				} else {
					old_back.apply(this, arguments);
				}
			}
		}
	} catch(e) {
		ca.prompt(e.message);
	}
}, true);

// 是否支持指纹识别
function iscanEvaluatePolicy() {
	if(plus.os.name == "iOS") {
		var openFinger = localStorage.getItem("isOpenFinger");
		if(openFinger != null && openFinger == "true")
			plus.fingerprintIdent.canEvaluatePolicy(function(result) {
					var isRegriter = localStorage.getItem("isRegriter_ios");

					if(result == 1 && isRegriter != null & isRegriter == "true") {
						var logined = localStorage.getItem("logined");
						if(logined != null) {
							var card = localStorage.getItem("cardTxt");
							var fingerprint_username = localStorage.getItem("fingerprint_username_ios");
							if(card == fingerprint_username)
								toEvaluatePolicy();
						} else {
							var fingerprint_username = localStorage.getItem("fingerprint_username_ios");
							var btnArray = ['是', '否'];
							mui.confirm('您已綁定' + fingerprint_username + '指紋辨識，是否以該組帳號登入？', '指紋辨識登入', btnArray, function(e) {
								if(e.index == 0) {
									toEvaluatePolicy();
								}
							});
						}
					} else {
						// toEvaluatePolicy();
					}
				},
				function(result) {
					//alert(result)
				});
	} else if(plus.os.name == "Android") {
		var isRegriter = localStorage.getItem("isRegriter_android");
		if(plus.fingerprintIdent.isFingerprintEnable() && isRegriter != null && isRegriter == "true") {
			var logined = localStorage.getItem("logined");
			var finger_username = localStorage.getItem("finger_username_android");
			var cardTxt = localStorage.getItem("cardTxt");
			var openFinger = localStorage.getItem("isOpenFinger");
			if(logined != null) {
				if(cardTxt == finger_username && openFinger != null && openFinger == "true") {
					toEvaluatePolicy();
				}
			} else {
				if(openFinger != null && openFinger == "true")
					toEvaluatePolicy();
			}
		} else {
			// return false;
		}
	}
}

// 校验指纹识别
function toEvaluatePolicy() {
	if(plus.os.name == "iOS") {
		plus.fingerprintIdent.evaluatePolicy('掃描指紋並登入系統', function(result) {
				var data = mui.parseJSON(result);
				if(!data.error) {
					//					alert('erre' + data.error);
					//					if(plus.webview.currentWebview().id == 'tmp_login') {
					//						validateLogin(undefined);
					//					} else if(plus.webview.currentWebview().id == 'card_pwd' ||
					//						plus.webview.currentWebview().id == 'login') {
					//						validateLogin(undefined);
					//					}
					localStorage.setItem("isOpenFinger", "true");
					validateLogin(undefined);
				} else {
					//alert( '掃描失敗，原因：'+data.error);
					//					alert('erre' + data.error);
				}
			},
			function(result) {
				//alert(result)
			});
	} else if(plus.os.name == "Android") {
		var isOpenFinger = localStorage.getItem("isOpenFinger");
		if(isOpenFinger != null && isOpenFinger == "true") {
			//ca.id("mask-cover").style.display = 'flex';
			$("#login-fingerprint").show();
		}
		$("#login-fingerprint   .butn").on("click", function() {
			plus.fingerprintIdent.cancelIdentify();
			$("#login-fingerprint").hide();
		})
		var FingerprintIdentifyListener = plus.android.implements("com.wei.android.lib.fingerprintidentify.base.BaseFingerprint$FingerprintIdentifyListener", {
			"onSucceed": function() {
				$("#login-fingerprint").hide();
				localStorage.setItem("isOpenFinger", "true");
				validateLogin(undefined);

			},
			"onNotMatch": function() {
				//	$("#login-fingerprint").hide();
				plus.fingerprintIdent.cancelIdentify();
				$("#login-fingerprint").hide();
				mui.alert("指紋不符", "", "確定", null);
			},
			"onFailed": function() {
				//$("#login-fingerprint").hide();
				plus.fingerprintIdent.cancelIdentify();
				$("#login-fingerprint").hide();

				//				mui.alert("指紋辨識失敗", "", "確定", null);
			}
		});
		plus.android.invoke(plus.fingerprintIdent, "startIdentify", 3, FingerprintIdentifyListener);
	}
}

// 校验指纹识别
function checkIsRegristerFingerPrint() {
	iscanEvaluatePolicy();
}

// 校验指纹识别
function FingerPrint_Logincheck(data, pwdTxt, cardTxt, e) {
	if(plus.os.name == "iOS") {

		plus.fingerprintIdent.canEvaluatePolicy(function(result) {
				var isRegriter = localStorage.getItem("isRegriter_ios");

				if(result == 1) {

					if(e != undefined) {
						var btnArray = ['是', '否'];
						var fingerprint_username = localStorage.getItem("fingerprint_username_ios");
						var fingerprint_password = localStorage.getItem("fingerprint_password_ios");
						var openFinger = localStorage.getItem("isOpenFinger");

						if((fingerprint_password != pwdTxt || fingerprint_username != cardTxt) && openFinger != null && openFinger == "true")
							mui.confirm('該組帳號密碼是否要綁定指紋辨識功能？', '指紋辨識登入', btnArray, function(e) {
								if(e.index == 0) {
									var isregrister = localStorage.getItem("isRegriter_ios");
									if(isregrister != null && isregrister) {

										if(fingerprint_password != pwdTxt || fingerprint_username != cardTxt) {
											localStorage.setItem("fingerprint_username_ios", cardTxt);
											localStorage.setItem("fingerprint_password_ios", pwdTxt);

										}
									} else {
										localStorage.setItem("isRegriter_ios", true);
										localStorage.setItem("fingerprint_username_ios", cardTxt);
										localStorage.setItem("fingerprint_password_ios", pwdTxt);
									}
								}
								loginSuccess(data, pwdTxt, cardTxt);
							});
						else
							loginSuccess(data, pwdTxt, cardTxt);

					} else
						loginSuccess(data, pwdTxt, cardTxt);

				} else
					loginSuccess(data, pwdTxt, cardTxt);

			},
			function(result) {
				//alert(result)
			});
	} else if(plus.os.name == "Android") {
		if(plus.fingerprintIdent.isFingerprintEnable()) {
			if(e != undefined) {
				var btnArray = ['是', '否'];
				var fingerprint_username = localStorage.getItem("finger_username_android");
				var fingerprint_password = localStorage.getItem("finger_password_android");
				var openFinger = localStorage.getItem("isOpenFinger");
				if(fingerprint_password != pwdTxt || fingerprint_username != cardTxt) {
					if((fingerprint_password != pwdTxt || fingerprint_username != cardTxt) && openFinger != null && openFinger == "true") {
						mui.confirm('該組帳號密碼是否要綁定指紋辨識功能？', '指紋辨識登入', btnArray, function(e) {
							if(e.index == 0) {
								var isregrister = localStorage.getItem("isRegriter_android");
								localStorage.setItem("isOpenFinger", "true");
								mui.fire(plus.webview.getWebviewById('account_add_1'), "refresh");
								if(isregrister != null && isregrister) {
									mui.confirm('已有其他帳號綁定指紋辨識，要覆蓋綁定?', '指紋辨識登入', btnArray, function(e) {
										if(e.index == 0) {
											localStorage.setItem("finger_username_android", cardTxt);
											localStorage.setItem("finger_password_android", pwdTxt);
										}
										loginSuccess(data, pwdTxt, cardTxt);
									});
								} else {
									localStorage.setItem("isRegriter_android", "true");
									localStorage.setItem("finger_username_android", cardTxt);
									localStorage.setItem("finger_password_android", pwdTxt);
									loginSuccess(data, pwdTxt, cardTxt);

								}
							} else
								loginSuccess(data, pwdTxt, cardTxt);
						});

					} else
						loginSuccess(data, pwdTxt, cardTxt);

				} else
					loginSuccess(data, pwdTxt, cardTxt);
			} else
				loginSuccess(data, pwdTxt, cardTxt);
		} else
			loginSuccess(data, pwdTxt, cardTxt);

	}
}

// 校验指纹识别
function FingerPrint_tmpLogincheck(pwdTxt, cardTxt, e) {
	if(plus.os.name == "iOS") {
		plus.fingerprintIdent.canEvaluatePolicy(function(result) {
				var isRegriter = localStorage.getItem("isRegriter_ios");
				if(result == 1) {

					if(e != undefined) {
						if(plus.webview.currentWebview().id != 'card_pwd') {

							var btnArray = ['是', '否'];
							var fingerprint_username = localStorage.getItem("fingerprint_username_ios");
							var fingerprint_password = localStorage.getItem("fingerprint_password_ios");
							var openFinger = localStorage.getItem("isOpenFinger");

							if((fingerprint_password != pwdTxt || fingerprint_username != cardTxt) && openFinger != null && openFinger == "true")
								mui.confirm('該組帳號密碼是否要綁定指紋辨識功能？', '指紋辨識登入', btnArray, function(e) {

									if(e.index == 0) {
										var isregrister = localStorage.getItem("isRegriter_ios");
										if(isregrister != null && isregrister) {

											if(fingerprint_password != pwdTxt || fingerprint_username != cardTxt) {

												localStorage.setItem("fingerprint_username_ios", cardTxt);
												localStorage.setItem("fingerprint_password_ios", pwdTxt);

											}
										} else {
											localStorage.setItem("isRegriter_ios", true);
											localStorage.setItem("fingerprint_username_ios", cardTxt);
											localStorage.setItem("fingerprint_password_ios", pwdTxt);
										}
									}

									loginSuccess();
								});
							else
								loginSuccess();

						} else
							loginSuccess();

					} else
						loginSuccess();
				} else
					loginSuccess();

			},
			function(result) {
				//alert(result)
			});
	} else if(plus.os.name == "Android") {
		if(plus.fingerprintIdent.isFingerprintEnable()) {
			if(plus.webview.currentWebview().id != 'card_pwd') {
				var btnArray = ['是', '否'];
				var fingerprint_username = localStorage.getItem("finger_username_android");
				var fingerprint_password = localStorage.getItem("finger_password_android");
				var openFinger = localStorage.getItem("isOpenFinger");
				if((fingerprint_password != pwdTxt || fingerprint_username != cardTxt) && openFinger != null && openFinger == "true") {
					mui.confirm('該組帳號密碼是否要綁定指紋辨識功能？', '指紋辨識登入', btnArray, function(e) {
						if(e.index == 0) {
							var isregrister = localStorage.getItem("isRegriter_android");
							localStorage.setItem("isOpenFinger", "true");
							mui.fire(plus.webview.getWebviewById('account_add_1'), "refresh");
							if(isregrister != null && isregrister) {
								mui.confirm('已有其他帳號綁定指紋辨識，要覆蓋綁定?', '指紋辨識登入', btnArray, function(e) {
									if(e.index == 0) {
										localStorage.setItem("finger_username_android", cardTxt);
										localStorage.setItem("finger_password_android", pwdTxt);
									}
									loginSuccess();
								});
							} else {
								localStorage.setItem("isRegriter_android", "true");
								localStorage.setItem("finger_username_android", cardTxt);
								localStorage.setItem("finger_password_android", pwdTxt);
								loginSuccess();

							}
						} else
							loginSuccess();
					});
				} else
					loginSuccess();
			} else
				loginSuccess();
		} else
			loginSuccess();
	}
}