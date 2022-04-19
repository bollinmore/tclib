var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
var passbookSvcUrl = AntiSqlValidate(localStorage.getItem("passbookSvcUrl"));
var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
var minPoint = localStorage.getItem("passbook_minPoint");
var maxPoint = localStorage.getItem("passbook_maxPoint");
var locationId = localStorage.getItem("passbook_locationId");
var infoArr = "";
var defaultCurrentPage = 1,
    currentPage = 1;
var defaultPageSize = 10,
    pageSize = 10;
var totalCount = 0;
var num = 0;

baseUrl = baseUrl.replace('APPAPI', 'API');

mui.plusReady(function() {
    if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
        infoArr = userInfo.split("#");
    } else {
        ca.prompt("發生錯誤，請重新登入再嘗試!");
        mui.back();
    }


    mui.init({
        pullRefresh: {
            container: '#pullrefresh',
            up: {
                auto: true,
                contentrefresh: '',
                contentnomore: '',
                callback: readLoad
            }
        }
    });



    function readLoad() {
        mui('#pullrefresh').pullRefresh().refresh(true); //重新触发上拉加载
        num = currentPage * pageSize;
        ca.get({
            url: baseUrl,
            data: {
                identify: "TCC",
                func: "Readingpoint_getgiftList",
                location_id: locationId,
                min_point: minPoint,
                max_point: maxPoint,
                page: currentPage,
                records_perpage: pageSize,
            },
            succFn: function(data) {
                ca.closeWaiting();
                try {
                    if (data.indexOf("failure") > -1)
                        mui.alert("發生錯誤，請稍後再嘗試!", '錯誤', function() {
                            ca.closeWaiting();
                            mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);
                            return;
                        });
                    else
                        setContent(data);
                } catch (e) {
                    ca.prompt("發生錯誤，請稍後再嘗試!");
                    mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);
                }

            }
        });

    }

    function setContent(data) {
        if (data != "") {
            ca.closeWaiting();
            var jsonData = JSON.parse(data);
            var book_list = "";

            if (jsonData.count == '' || jsonData.count == 0) {
                mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
            } else {
                var pointgiftList = jsonData.pointgift;
                for (var a in pointgiftList) {
                    if (undefined != pointgiftList[a].gift_id) {
                        num++;
                        var locationName = undefined == pointgiftList[a]['gift_location _name'] ? "" : pointgiftList[a]['gift_location _name'];
                        var endDate = undefined == pointgiftList[a]['gift_endDate'] ? "" : pointgiftList[a]['gift_endDate'];
                        var name = undefined == pointgiftList[a]['gift_name'] ? "" : pointgiftList[a]['gift_name'];
                        var point = undefined == pointgiftList[a]['point'] ? "" : pointgiftList[a]['point'];
                        var availableCount = undefined == pointgiftList[a]['available_count'] ? "" : pointgiftList[a]['available_count'];
                        var giftId = undefined == pointgiftList[a]['gift_id'] ? "" : pointgiftList[a]['gift_id'];

                        var defaultImg = 'dist/img/default.png';
                        var imgShow = defaultImg;
                        if (pointgiftList[a].gift_img) {
                            imgShow = passbookSvcUrl + pointgiftList[a].gift_id;
                        }


                        book_list += '' +
                            '<li>' +
                            ' <a>' +
                            ' <div class="commodity-title">' +
                            '  <div>' +
                            '   <img src = "dist/img/house.png" alt = "" >' +
                            '   <p>' + locationName + '</p>' +
                            '  </div> ' +
                            '  <span> 截止兌換日期： ' + endDate + ' </span>' +
                            ' </div>' +
                            ' <div class="commodity-content">' +
                            '  <div class="commodity-img">' +
                            '   <img src="' + imgShow + '" onerror="this.src=' + "'" + defaultImg + "'" + '" alt="">' +
                            '  </div>' +
                            '  <div class="commodity-text">' +
                            '   <h1>' + name + '</h1>' +
                            '   <div class="commodity-text-content">' +
                            '    <div>' +
                            '     <h2>商品點數</h2>' +
                            '     <p>' + point + '</p>' +
                            '    </div>' +
                            '    <div>' +
                            '     <h2>剩餘數量</h2>' +
                            '     <p>' + availableCount + '</p>' +
                            '    </div>' +
                            '   </div>' +
                            '  </div>' +
                            ' </div>' +
                            ' </a>' +
                            ' <div class="quantity-control">' +
                            '  <div class="quantity-box">' +
                            '   <button class="controlNumber">+</button>' +
                            '   <span class="changeNum">1</span>' +
                            '   <button class="controlNumber">-</button>' +
                            '  </div>' +
                            '  <button class="delivery" data-giftId="' + giftId + '" data-giftName="' + name + '">兌換獎品</button>' +
                            ' </div>' +
                            ' <p class="font-size-l font-align-c font-color-remind">兌換獎品限臨櫃時點選顯示，數量以現場為準</p>' +
                            '</li>';
                    }

                }

                $("#result-list").append(book_list);
                currentPage++;
                mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);

            }

        }

    }

    function plusOrReduceNumber(num, action) {
        if ('' != action) {
            if (action == '+') {
                num++;
            } else if (action == '-') {
                if (num != '1')
                    num--;
            }
        }
        return num;
    }

    function createBarcode(id, giftName, num) {
        ca.get({
            url: baseUrl,
            data: {
                identify: "TCC",
                func: "Readingpoint_changegift",
                username: infoArr[1],
                password: realPwd,
                gift_id: id,
                location_id: locationId,
                gift_count: num
            },
            succFn: function(data) {
                ca.closeWaiting();
                if(data != ''){
                    try {
                        var jsonData = JSON.parse(data);
                        if (undefined != jsonData.status && jsonData.status != '' && jsonData.status == 'ok') {
                           localStorage.setItem("passbook_giftName", giftName);
                           localStorage.setItem("passbook_barcode", jsonData.code);
                           localStorage.setItem("passbook_time", jsonData.time);
                           clicked('passbook_change_gift_barcode.html');
                        } else {
                            mui.alert('失敗，'+jsonData.message, '溫馨提醒', function() {
                                ca.closeWaiting();
                                return;
                            });
                        }
                    } catch (e) {
                        ca.prompt("發生錯誤，請稍後再嘗試!");
                    }
                }
                

            }
        });
    }

    $(document).on('click', '#result-list .quantity-control .controlNumber', function() {
        var action = $(this).text();
        var num = $(this).parent().find('span.changeNum').text();
        $(this).parent().find('span.changeNum').text(plusOrReduceNumber(num, action));
    });

    $(document).on('click', '#result-list .quantity-control .delivery', function() {
        var id = $(this).attr('data-giftId');
        var giftName = $(this).attr('data-giftName');
        var num = $(this).parent().find('span.changeNum').text();
        createBarcode(id, giftName, num);
    });

});