var ws = null,
    wo = null;
var scan = null,
    domready = false;
// H5 plus事件處理

mui.plusReady(function() {
    if (plus.os.name == "Android") {
        var _BARCODE = 'plugintest',
            B = window.plus.bridge;
        var plugintest = {
            getPermisionCamera: function(successCallback, errorCallback) {
                var success = typeof successCallback !== 'function' ? null : function(args) {
                        successCallback(args);
                    },
                    fail = typeof errorCallback !== 'function' ? null : function(code) {
                        errorCallback(code);
                    };
                callbackID = B.callbackId(success, fail);
                return B.exec(_BARCODE, "getPermisionCamera", [callbackID]);
            },
            goTOsettings: function(Argus1, Argus2, Argus3, Argus4) {
                return B.execSync(_BARCODE, "goTOsettings", [Argus1, Argus2, Argus3, Argus4]);
            },
            checkIsForeverSayNO: function(Argus1, Argus2, Argus3, Argus4) {
                return B.execSync(_BARCODE, "checkIsForeverSayNO", [Argus1, Argus2, Argus3, Argus4]);
            }
        };
        window.plus.plugintest = plugintest;

        plus.plugintest.getPermisionCamera(
            function(result) {
                if (result == "1") {
                    // 獲取窗口對象
                    ws = plus.webview.currentWebview();
                    wo = ws.opener();
                    // 開始掃描
                    var filter = [plus.barcode.QR];
                    scan = new plus.barcode.Barcode('bcid', filter);
                    scan.onmarked = onmarked;
                    scan.start({
                        conserve: true,
                        filename: "_doc/barcode/"
                    });
                    // 顯示頁麵並關閉等待框
                    wo.evalJS("closeWaiting()");

                } else {
                    if (plus.plugintest.checkIsForeverSayNO("", "", "", "") == "true")
                        mui.confirm('您已關閉相機權限，請至設定開啟相機權限。', '溫馨提醒', ['前往設定', '取消'], function(e) {
                            if (e.index == 1) {
                                mui.back();
                            } else {
                                mui.back();
                                plus.plugintest.goTOsettings("", "", "", "");

                            }
                        });
                }

            },
            function(result) {

            });

    } else {

        var AVCaptureDevice = plus.ios.importClass("AVCaptureDevice");
        var Status = AVCaptureDevice.authorizationStatusForMediaType("vide");
        if (Status == 1 || Status == 2) {
            var btnArray = ['前往設定', '取消'];
            mui.confirm(' ', '相機權限已被關閉。', btnArray, function(e) {
                if (e.index == 0) {
                    var DigestPassword = plus.ios.newObject("DigestPassword");
                    plus.ios.invoke(DigestPassword, "getappsetting");
                    plus.ios.deleteObject(DigestPassword);

                } else {

                }
                ws = plus.webview.currentWebview();
                wo = ws.opener();
                wo.evalJS("closeWaiting()");
                mui.back();

            });
            //return;

        } else if (Status == 0 || Status == 3) {
            // 獲取窗口對象
            ws = plus.webview.currentWebview();
            wo = ws.opener();
            // 開始掃描
            var filter = [plus.barcode.QR];
            scan = new plus.barcode.Barcode('bcid', filter);
            scan.onmarked = onmarked;
            scan.start({
                conserve: true,
                filename: "_doc/barcode/"
            });
            // 顯示頁麵並關閉等待框
            wo.evalJS("closeWaiting()");
        }

    }
    // 獲取窗口對象

		// 二維碼掃描成功
		function onmarked(type, result, file) {
		    result = result.replace(/\n/g, '');
				doPoint(result);
		}

		function doPoint(code) {
		    var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
		    var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
		    var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
		    var infoArr = "";
		    baseUrl = baseUrl.replace('APPAPI', 'API');

		    if (null == userInfo) {
		        mui.alert('您尚未登入，請先進行登錄', '溫馨提醒', function() {
		            clicked('login.html');
		        });
		    } else {
		        ca.showWaiting();
		        try {
		            if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
		                infoArr = userInfo.split("#");
		                ca.get({
		                    url: baseUrl,
		                    data: {
		                        identify: "TCC",
		                        func: "Readingpoint_actionpoint",
		                        username: infoArr[1],
		                        password: realPwd,
		                        code: code
		                    },
		                    succFn: function(data) {
		                        ca.closeWaiting();
		                        var jsonData = JSON.parse(data);

		                        if (undefined == jsonData.status || jsonData.status == 'failure')
		                            mui.alert('點數補登失敗，' + jsonData.message, '溫馨提醒', function() {
		                                mui.back();
		                            });
		                        else
		                            mui.alert('點數補登成功', '溫馨提醒', function() {
		                                mui.back();
		                            });
		                    }
		                });
		            }
		        } catch (e) {
		            mui.alert('資料信息異常，請稍後再嘗試', function() {
		                mui.back();
		            });
		        } finally {
		            ca.closeWaiting();
		        }
		    }
		}

});
//if(window.plus) {
//	plusReady();
//} else {
//	document.addEventListener("plusready", plusReady, false);
//}
// 監聽DOMContentLoaded事件
document.addEventListener("DOMContentLoaded", function() {
    domready = true;
    //plusReady();
}, false);


