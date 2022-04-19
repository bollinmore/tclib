var userInfo = localStorage.getItem("user_info");
var webpacUrl = localStorage.getItem("webpacUrl");
var tagId = localStorage.getItem("rename_tagId");
var tagName = localStorage.getItem("rename_tagName");
var infoArr = "";
var isEdit = false;

mui.plusReady(function() {

    readyLoad();

    function readyLoad() {

        if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
            infoArr = userInfo.split("#");
        } else {
            ca.prompt("發生錯誤，請重新登入再嘗試!");
            mui.back();
        }
        ca.showWaiting();
        $('#tagName').val(tagName);
        ca.closeWaiting();

    }

    $("#renameBtn").on('click', function() {
        var newTagName = $('#tagName').val();
        renameTag(newTagName);
    });

    function renameTag(newTagName) {
        if (undefined == newTagName || newTagName == '') {
            mui.alert('請輸入標籤名稱', function() {
                return;
            });
        } else if (tagName == newTagName) {
            mui.alert('請輸入新的標籤名稱', function() {
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
                    action: "chg",
                    tagname: encodeURI(newTagName),
                    uuid: tagId
                },
                succFn: function(data) {

                    if (null != data) {
                        var result = trim(data);
                        if (result == "chg_tag_success") {
                            mui.alert('標籤更新成功', function() {
                                var arr = ['shelf_bookBox_edit.html'];
                                ca.sendNotice(arr, 'update_bookBox_edit', {});
                                setTimeout(function() {
                                    mui.back();
                                }, 500);
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

    
    
});