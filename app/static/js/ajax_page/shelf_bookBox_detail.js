var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
var webpacUrl = AntiSqlValidate(localStorage.getItem("webpacUrl"));
var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
var tagId = localStorage.getItem("tagId");
var tagName = localStorage.getItem("tagName");
var infoArr = "";
var defaultCurrentPage = 0,
    currentPage = 0;
var defaultPageSize = 10,
    pageSize = 10;
var totalCount = 0;
var num = 0;

mui.plusReady(function() {

    window.addEventListener("update_bookBox_detail", function(e) {
        location.reload();
    });

    var old_back = mui.back;
    mui.back = function() {
        if (localStorage.getItem("bookBox_isEdit") && localStorage.getItem("bookBox_isEdit") == "true") {
            var arr = ['shelf_bookBox.html'];
            ca.sendNotice(arr, 'update_bookBox', {});
        } else {
            old_back();
        }
    }

    if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
        infoArr = userInfo.split("#");
    } else {
        ca.prompt("發生錯誤，請重新登入再嘗試!");
        mui.back();
    }

    if (tagName != undefined) {
        $('.page-title #tagName').text(' - ' + tagName);
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
    if (!localStorage.getItem('shelf_bookBoxDetail_' + tagId + '_' + currentPage)) {
        num = currentPage * pageSize;
        ca.get({
            url: webpacUrl,
            data: {
                method: "getShelfBoxListByTagIdAndUserId_Range",
                userid: infoArr[1],
                tagid: tagId,
                page: currentPage,
                num: pageSize,
            },
            succFn: function(data) {
                ca.closeWaiting();
                try{
                    setContent(data);
                }catch(e){
                    ca.prompt("發生錯誤，請稍後再嘗試!");
                    mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);
                }
                
            }
        });
    } else {
        var data = localStorage.getItem('shelf_bookBoxDetail_' + tagId + '_' + currentPage);
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
        if (!localStorage.getItem('shelf_bookBoxDetail_' + tagId + '_' + currentPage)) {
            localStorage.setItem('shelf_bookBoxDetail_' + tagId + '_' + currentPage, data);
            localStorage.setItem('shelf_bookBoxDetail_currentSavePage_' + tagId, currentPage);
        }
        if (jsonData.length == 0) {
            mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
        } else {

            for (var a in jsonData) {
                if (jsonData[a].bookid != undefined) {
                    num++;
                    var title = jsonData[a].title == "" ? "" : jsonData[a].title;
                    var authors = jsonData[a].authors == "" ? "" : '<p>作者： ' + jsonData[a].authors + '</p>';
                    var publishers = jsonData[a].publishers == "" ? "" : '<p>出版者： ' + jsonData[a].publishers + '</p>';
                    var publishyears = jsonData[a].publishyears == "" ? "" : '<p>出版年： ' + jsonData[a].publishyears + '</p>';
                    var itemcount = jsonData[a].itemcount == "" ? "" : '<p>館藏數量： ' + jsonData[a].itemcount + '</p>';

                    book_list += '' +
                        '<div class="padding-box book-text-info book-box">' +
                        '<h3 class="font-color-light">' + num + '.' + title + '</h3>' +
                        authors +
                        publishers +
                        publishyears +
                        itemcount +
                        '<div class="btn-box" >' +
                        '<a class="butn editBtn" data-id="' + jsonData[a].uuid + '" data-tagid="' + jsonData[a].tagid + '" data-title="' + jsonData[a].title + '">貼標籤</a>' +
                        '<a class="butn deleteBtn" data-id="' + jsonData[a].uuid + '">移出書櫃</a>' +
                        '</div>' +
                        '</div><!-- class="book-info" End -->';
                }

            }

            $(".mui-scroll").append(book_list);
            currentPage++;
            mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);


            $(".editBtn").on('click', function() {
                var id = $(this).attr('data-id');
                var tagid = $(this).attr('data-tagid');
                var title = $(this).attr('data-title');
                localStorage.setItem("edit_bookBox_detail_id", id);
                localStorage.setItem("edit_bookBox_detail_tagid", tagid);
                localStorage.setItem("edit_bookBox_detail_title", title);
                clicked('shelf_bookBox_editTag.html');
            });

            $(".deleteBtn").on('click', function() {
                var id = $(this).attr('data-id');
                var btnArray = ['確認', '取消'];
                mui.confirm('確定要移出嗎', '溫馨提醒', btnArray, function(e) {
                    if (e.index == 0) {
                        deleteBook(id);
                    } else {
                        return;
                    }
                });
            });
        }

    }
}

function deleteBook(id) {
    if (undefined == id || id == '') {
        mui.alert('發生錯誤', function() {
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
                method: "editShelfBox",
                userid: infoArr[1],
                action: "del",
                uuid: id
            },
            succFn: function(data) {

                if (null != data) {
                    var result = trim(data);
                    if (result == "del_success") {
                        mui.alert('刪除成功', function() {
                            localStorage.setItem("bookBox_isEdit", "true");
                            clearShelfBookBoxDetailData();
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