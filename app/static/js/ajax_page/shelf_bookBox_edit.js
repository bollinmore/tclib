var userInfo = localStorage.getItem("user_info");
var webpacUrl = localStorage.getItem("webpacUrl");
var infoArr = "";
var isEdit = false;

mui.plusReady(function() {

    window.addEventListener("update_bookBox_edit", function(e) {
        isEdit = true;
        readyLoad();
    });

    var old_back = mui.back;
    mui.back = function() {
        if (isEdit) {
            var arr = ['shelf_bookBox.html'];
            ca.sendNotice(arr, 'update_bookBox', {});
        } else {
            old_back();
        }
    }

    readyLoad();

    function readyLoad() {

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
                method: "getShelfTagListByUserId",
                userid: infoArr[1]
            },
            succFn: function(data) {
                var json = JSON.parse(data);
                var tmpStr = "";
                if (null != json) {
                    for (var a in json) {
                        if (json[a]) {
                            tmpStr += ''
                            +'<div class="book-text-info">'
                            +' <h3 >標籤名稱：' + json[a].tagname + '</h3>'
                            +' <div class="two" >'
                            +'  <div>'
                            +'   <button class="butn renameBtn" data-tagId="' + json[a].uuid + '" data-tagName="' + json[a].tagname + '">重命名</button>'
                            +'  </div>'
                            +'  <div>'
                            +'   <button class="butn deleteBtn"  data-tagId="' + json[a].uuid + '">移除</button>'
                            +'  </div>'
                            +' </div>'
                            +'</div>';
                        }
                    }
                }
                $('#tagList').html(tmpStr);
                
                $(".deleteBtn").on('click', function() {
                    var tagId = $(this).attr('data-tagId');
                    var btnArray = ['確認', '取消'];
                    mui.confirm('確定移除嗎', '溫馨提醒', btnArray, function(e) {
                        if(e.index == 0){
                            deleteTag(tagId);
                        } else {
                            return;
                        }
                    });
                });

                $(".renameBtn").on('click', function() {
                    var tagId = $(this).attr('data-tagId');
                    var tagName = $(this).attr('data-tagName');
                    localStorage.setItem("rename_tagId", tagId);
                    localStorage.setItem("rename_tagName", tagName);
                    clicked('shelf_bookBox_edit_rename.html');
                });

                ca.closeWaiting();
            }
        });

    }

    $("#addBtn").on('click', function() {
        var tagName = $('#tagName').val();
        addTag(tagName);
    });

    function addTag(tagName){
        if(undefined == tagName || tagName == ''){
            mui.alert('請輸入標籤名稱', function() {
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
                    method: "editShelfTag",
                    userid: infoArr[1],
                    action: "add",
                    tagname: encodeURI(tagName)
                },
                succFn: function(data) {

                    if (null != data) {
                        var result = trim(data);
                        if (result == "add_tag_success") {
                            mui.alert('新增標籤成功', function() {
                                isEdit = true;
                                readyLoad();
                            });
                        } else if (result == "error") {
                            mui.alert('此標籤已存在', function() {
                                return;
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

    function deleteTag(tagId) {
        if (undefined == tagId || tagId == '') {
            mui.alert('移除發生錯誤', function() {
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
                    method: "editShelfTag",
                    userid: infoArr[1],
                    action: "del",
                    uuid: encodeURI(tagId)
                },
                succFn: function(data) {

                    if (null != data) {
                        var result = trim(data);
                        if (result == "del_tag_success") {
                            mui.alert('此標籤已刪除成功', function() {
                                isEdit = true;
                                readyLoad();
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
    
});