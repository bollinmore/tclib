mui.plusReady(function() {
    var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
    baseUrl = baseUrl.replace('APPAPI', 'API');

    readyLoad();

    function readyLoad() {
        var userInfo = localStorage.getItem("user_info");
        if (null == userInfo) {
            mui.alert('您尚未登入，請先進行登錄', '溫馨提醒', function() {
                clicked('login.html');
            });
        } else {
            ca.showWaiting();
            try {
                if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
                    getLocationList();
                }
            } catch (e) {} finally {
                ca.closeWaiting();

            }
        }
    }

    function getLocationList() {
        ca.get({
            url: baseUrl,
            data: {
                identify: "TCC",
                func: "Readingpoint_getsetting"
            },
            succFn: function(data) {
                ca.closeWaiting();
                try {
                    if (data.indexOf("failure") > -1)
                        mui.alert("發生錯誤，請稍後再嘗試!", '錯誤', function() {
                            ca.closeWaiting();
                            return;
                        });
                    else {
                        if (data != "") {
                            ca.closeWaiting();
                            var jsonData = JSON.parse(data);
                            var pointList = "";

                            if (jsonData.length == 0) {
                                return;
                            } else {

                                if (undefined != jsonData[0].pointRange) {
                                    for (var a in jsonData[0].pointRange) {
                                        var pointRangeArray = jsonData[0].pointRange;
                                        var minPoint = undefined == pointRangeArray[a].min_point ? "" : pointRangeArray[a].min_point;
                                        var maxPoint = undefined == pointRangeArray[a].max_point ? "" : pointRangeArray[a].max_point;


                                        pointList += '<li><a data-point="' + minPoint + ',' + maxPoint + '">' + minPoint + '&emsp;~&emsp;' + maxPoint + '&ensp;點</a></li>';
                                    }
                                }
                                pointList == "" ? '<li>無點數區間資料</li>' : pointList;
                                $(".reward-points-inventory").html(pointList);

                                $('ul.reward-points-inventory li a').on('click', function() {
                                    var pointlist = $(this).attr('data-point');
                                    if (undefined != pointlist && pointlist != '') {
                                        var pointArray = pointlist.split(',');
                                        var minPoint = pointArray[0];
                                        var maxPoint = "";
                                        if (pointArray.length > 1) {
                                            maxPoint = pointArray[1];
                                        }
                                        search(minPoint, maxPoint);
                                    }
                                });
                            }
                        }
                    }
                } catch (e) {
                    ca.prompt("發生錯誤，請稍後再嘗試!");
                }

            }
        });
    }

    function search(min, max) {
        var minPoint = min;
        var maxPoint = max;
        if (undefined == minPoint || minPoint == "") {
            mui.alert('請選擇點數', '溫馨提醒', function() {
                return;
            });
        } else {
            localStorage.setItem("passbook_minPoint", minPoint);
            localStorage.setItem("passbook_maxPoint", maxPoint);
            clicked('passbook_rewardDetail_result.html');
        }

    }


});