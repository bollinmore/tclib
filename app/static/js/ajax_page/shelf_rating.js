var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
var webpacUrl = AntiSqlValidate(localStorage.getItem("webpacUrl"));
var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
var infoArr = "";
var defaultCurrentPage = 0,
    currentPage = 0;
var defaultPageSize = 10,
    pageSize = 10;
var totalCount = 0;
var num = 0;

mui.plusReady(function() {
    window.addEventListener("update_rating", function(e) {
        location.reload();
    });


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
                try {
                    setContent(data);
                } catch (e) {
                    ca.prompt("發生錯誤，請稍後再嘗試!");
                    mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);
                }
            }
        });
    } else {
        var data = localStorage.getItem('shelf_rating_' + currentPage);
        num = currentPage * pageSize;
        ca.closeWaiting();
        try {
            setContent(data);
        } catch (e) {
            ca.prompt("發生錯誤，請稍後再嘗試!");
            mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);
        }
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
                    var isPublic = "" ;
                    
                    if (undefined != jsonData[a].is_public){
                        if (jsonData[a].is_public == '1'){
                            isPublic = '<p>開放狀態：公開</p>';
                        } else if (jsonData[a].is_public == '0'){
                            isPublic = '<p>開放狀態：隱藏</p>';
                        }
                    }

                    book_list += '' +
                        '<div class="padding-box book-text-info book-box">' +
                        '<h3 class="font-color-light">' + num + '.' + title + '</h3>' +
                        appraise +
                        lastUpdateDate +
                        isPublic +
                        '<div class="btn-box" >' +
                        '<a class="butn editBtn" data-bibId="' + jsonData[a].bib_id + '" data-title="' + jsonData[a].title + '" data-isPublic="' + jsonData[a].is_public + '" data-appraise="' + jsonData[a].appraise + '">編輯</a>' +
                        '<a class="butn deleteBtn" data-id="' + jsonData[a].uuid + '">刪除</a>' +
                        '</div>' +
                        '</div><!-- class="book-info" End -->';
                }

            }
            

            $(".mui-scroll").append(book_list);
            currentPage++;
            mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);

            $(".editBtn").on('click', function() {
                var bibId = $(this).attr('data-bibId');
                var title = $(this).attr('data-title');
                var isPublic = $(this).attr('data-isPublic');
                var appraise = $(this).attr('data-appraise');
                localStorage.setItem("edit_rating_bibId", bibId);
                localStorage.setItem("edit_rating_title", title);
                localStorage.setItem("edit_rating_appraise", appraise);
                localStorage.setItem("edit_rating_isPublic", isPublic);
                clicked('shelf_rating_edit.html');
            });

            $(".deleteBtn").on('click', function() {
                var id = $(this).attr('data-id');
                var btnArray = ['確認', '取消'];
                mui.confirm('確定刪除嗎', '溫馨提醒', btnArray, function(e) {
                    if (e.index == 0) {
                        deleteRating(id);
                    } else {
                        return;
                    }
                });
            });
        }

    }
}

function deleteRating(id) {
    if (undefined == id || id == '') {
        mui.alert('刪除發生錯誤', function() {
            return;
        });
    } else {
        if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
            infoArr = userInfo.split("#");
        } else {
            ca.prompt("發生錯誤，請重新登入再嘗試!");
            mui.back();
        }
        ca.showWaiting();

        ca.get({
            url: webpacUrl,
            data: {
                method: "editAppraise",
                userid: infoArr[1],
                action: "del",
                uuid: id
            },
            succFn: function(data) {

                if (null != data) {
                    var result = trim(data);
                    if (result == "success") {
                        mui.alert('刪除成功', function() {
                            clearShelfRatingData();
                            setTimeout(function() {
                                location.reload();
                            }, 1500);
                        });
                    } else {
                        mui.alert('請先登入才能使用此功能', function() {
                            return;
                        });
                    }
                }

                ca.closeWaiting();
            }
        });
    }
}