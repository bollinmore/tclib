var userInfo = localStorage.getItem("user_info");
var webpacUrl = localStorage.getItem("webpacUrl");
var id = localStorage.getItem("edit_comment_id");
var title = localStorage.getItem("edit_comment_title");
var des = localStorage.getItem("edit_comment_des");
var isPublic = localStorage.getItem("edit_comment_isPublic");
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
        $('#commentTitle').text("標題：" + title);
        $('select[name=isPublic]').val(isPublic);
        $('textarea[name=des]').val(des);
        ca.closeWaiting();

    }

    $("#sendBtn").on('click', function() {
        var newIsPublic = trim($('select[name=isPublic]').find(":selected").val());
        var newDes = trim($('textarea[name=des]').val());
        editComment(newIsPublic, newDes);
    });

    function editComment(newIsPublic, newDes) {
        if (undefined == newIsPublic || newIsPublic == '') {
            mui.alert('請選擇公開狀態', function() {
                return;
            });
        } else if (undefined == newDes || newDes == '') {
            mui.alert('請輸入心得內容', function() {
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
                    action: "edit",
                    des: encodeURI(newDes),
                    is_public: encodeURI(newIsPublic),
                    uuid: id
                },
                succFn: function(data) {

                    if (null != data) {
                        var result = trim(data);
                        if (result == "success") {
                            mui.alert('更新成功', function() {
                                var arr = ['shelf_comment.html'];
                                clearShelfCommentData();
                                setTimeout(function() {
                                    ca.sendNotice(arr, 'update_comment', {});
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

    
    
});