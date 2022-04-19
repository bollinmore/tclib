var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
var webpacUrl = AntiSqlValidate(localStorage.getItem("webpacUrl"));
var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
var defaultCurrentPage = 0,
    currentPage = 0;
var defaultPageSize = 10,
    pageSize = 10;
var totalCount = 0;
var num = 0;

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
});

function readLoad() {
    mui('#pullrefresh').pullRefresh().refresh(true); //重新触发上拉加载
    if (!localStorage.getItem('shelf_rating_' + currentPage)) {
        num = currentPage * pageSize;
        ca.get({
            url: webpacUrl,
            data: {
                method: "getShelfAppraiseListByUserId_Range",
                userid: infoArr[1],
                page: currentPage,
                num: pageSize,
            },
            succFn: function(data) {
                ca.closeWaiting();
                setContent(data);
            }
        });
    } else {
        var data = localStorage.getItem('shelf_rating_' + currentPage);
        num = currentPage * pageSize;
        ca.closeWaiting();
        setContent(data);
    }
}

function setContent(data) {
    if (data != "") {
        ca.closeWaiting();
        var jsonData = JSON.parse(data);
        var book_list = "";
        if (!localStorage.getItem('shelf_rating_' + currentPage)) {
            localStorage.setItem('shelf_rating_' + currentPage, data);
            localStorage.setItem('shelf_rating_currentSavePage', currentPage);
        }
        if (jsonData.length == 0) {
            mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
        } else {

            for (var a in jsonData) {
                if (jsonData[a].bib_id != undefined) {
                    num++;
                    var title = jsonData[a].title == "" ? "" : jsonData[a].title;
                    var appraise = jsonData[a].appraise == "" ? "" : '<p>評分： ' + jsonData[a].appraise + '分</p>';
                    var lastUpdateDate = jsonData[a].last_update_date == "" ? "" : '<p>評分時間： ' + jsonData[a].last_update_date + '</p>';

                    book_list += '' +
                        '<div class="padding-box book-text-info book-box">' +
                        '<h3 class="font-color-light">' + num + '.' + title + '</h3>' +
                        appraise +
                        lastUpdateDate +
                        '</div><!-- class="book-info" End -->';
                }

            }

            $("#bookList").append(book_list);
            currentPage++;
            mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);

        }

    }
}