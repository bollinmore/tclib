var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
var hisborrowNum = localStorage.getItem("hisborrowNum");
var hisborrowMessage = localStorage.getItem("hisborrowMessage");
var infoArr = "";
var defaultCurrentPage = 0,
    currentPage = 0;
var defaultPageSize = 20,
    pageSize = 20;
var totalCount = 0;
var num = 0;

mui.plusReady(function() {
		if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
		    infoArr = userInfo.split("#");
		} else {
		    ca.prompt("發生錯誤，請重新登入再嘗試!");
		    mui.back();
		}

		if (null != hisborrowNum && hisborrowNum != "0") {
		    totalCount = hisborrowNum;
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
});

function readLoad() {
    mui('#pullrefresh').pullRefresh().refresh(true); //重新触发上拉加载
    ca.get({
        url: baseUrl,
            data: {
                identify: "TCC",
                func: "hisronPatronLoan",
                username: infoArr[1],
                password: realPwd,
                startrow: currentPage,
                rownum: pageSize,
            },
        succFn: function(data) {
            ca.closeWaiting();
            if (data != "") {
                ca.closeWaiting();
                var jsonData = JSON.parse(data);
                var book_list = "";
                if (jsonData.length == 0 || num >= totalCount) {
                    mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
                } else {
                    for (var a in jsonData) {
												if (num >= totalCount) {
														mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
												    break;
												}

                        if (jsonData[a].title != undefined) {
													 	num++;
                            var title = jsonData[a].title == "" ? "" : jsonData[a].title;
                            var callNumber = jsonData[a].callNumber == "" ? "" : '<p>索書號： ' + jsonData[a].callNumber + '</p>';
                            var itemNumber = jsonData[a].itemNumber == "" ? "" : '<p>條碼號： ' + jsonData[a].itemNumber + '</p>';
                            var locationName = jsonData[a].locationName == "" ? "" : '<p>館藏地： ' + jsonData[a].locationName + '</p>';
                            var openDate = jsonData[a].openDate == "" ? "" : '<p>借出日： ' + jsonData[a].openDate + '</p>';
                            var closeDate = jsonData[a].closeDate == "" ? "" : '<p>還書日： ' + jsonData[a].closeDate + '</p>';
                            var dueDate = jsonData[a].dueDate == "" ? "" : '<p>到期日： ' + jsonData[a].dueDate + '</p>';

                            book_list += '' +
                                '<div class="padding-box book-text-info book-box">' +
                                '<h3 class="font-color-light">' + num + '.'  + jsonData[a].title + ' < /h3>' +
                                callNumber +
                                itemNumber +
                                locationName +
                                openDate +
                                closeDate +
                                dueDate +
                                '</div><!-- class="book-info" End -->';
                        }												
                    }

                    $("#bookList").append(book_list);
                    currentPage++;
                    mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);
                }
            }

        }
    });
}
