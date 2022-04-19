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
    window.addEventListener("update_comment", function(e) {
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
    if (!localStorage.getItem('shelf_comment_' + currentPage)) {
        num = currentPage * pageSize;
        ca.get({
            url: webpacUrl,
            data: {
                method: "getShelfCommentsListByUserId_Range",
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
        var data = localStorage.getItem('shelf_comment_' + currentPage);
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
        if (!localStorage.getItem('shelf_comment_' + currentPage)){
            localStorage.setItem('shelf_comment_' + currentPage, data);
            localStorage.setItem('shelf_comment_currentSavePage', currentPage);
        }
        if (jsonData.length == 0) {
            mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
        } else {

            for (var a in jsonData) {
                if (jsonData[a].mid != undefined) {
                    num++;
                    var title = jsonData[a].book == "" ? "" : jsonData[a].book;
                    var desc = jsonData[a].des == "" ? "" : '<p style="word-break: break-word;">心得內容： ' + showTextLimit(jsonData[a].des) + '</p>';
                    var createdDate = jsonData[a].created_date == "" ? "" : '<p>發表時間： ' + jsonData[a].created_date + '</p>';
                    var isPublic = "";

                    if (undefined != jsonData[a].display) {
                        if (jsonData[a].display == '1') {
                            isPublic = '<p>開放狀態：公開</p>';
                        } else if (jsonData[a].display == '0') {
                            isPublic = '<p>開放狀態：隱藏</p>';
                        }
                    }

                    book_list += '' +
                        '<div class="padding-box book-text-info book-box">' +
                        '<h3 class="font-color-light">' + num + '.' + title + '</h3>' +
                        desc +
                        createdDate +
                        isPublic +
                        '<div class="btn-box" >' +
                        '<a class="butn editBtn" data-id="' + jsonData[a].uuid + '" data-title="' + jsonData[a].book + '" data-isPublic="' + jsonData[a].display + '" data-des="' + jsonData[a].des + '">編輯</a>' +
                        '<a class="butn deleteBtn" data-id="' + jsonData[a].uuid + '">刪除</a>' +
                        '</div>' +
                        '</div><!-- class="book-info" End -->';
                }

            }

            $(".mui-scroll").append(book_list);
            currentPage++;
            mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);


            $(".editBtn").on('click', function() {
                var id = $(this).attr('data-id');
                var title = $(this).attr('data-title');
                var isPublic = $(this).attr('data-isPublic');
                var des = $(this).attr('data-des');
                localStorage.setItem("edit_comment_id", id);
                localStorage.setItem("edit_comment_title", title);
                localStorage.setItem("edit_comment_des", des);
                localStorage.setItem("edit_comment_isPublic", isPublic);
                clicked('shelf_comment_edit.html');
            });

            $(".deleteBtn").on('click', function() {
                var id = $(this).attr('data-id');
                var btnArray = ['確認', '取消'];
                mui.confirm('確定刪除嗎', '溫馨提醒', btnArray, function(e) {
                    if (e.index == 0) {
                        deleteComment(id);
                    } else {
                        return;
                    }
                });
            });
        }

    }
}

function showTextLimit(text) {
    var limitNum = 80;
    if (text != undefined) {
        if (text.toString().length > limitNum) {
            text = text.toString().substring(0, limitNum - 2) + "...";
        }
        return text.toString();
    } else {
        return "";
    }

}

function deleteComment(id) {
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
                method: "editComments",
                userid: infoArr[1],
                action: "del",
                uuid: id
            },
            succFn: function(data) {

                if (null != data) {
                    var result = trim(data);
                    if (result == "success") {
                        mui.alert('刪除成功', function() {
                            clearShelfCommentData();
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