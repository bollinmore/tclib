var userInfo = localStorage.getItem("user_info");
var webpacUrl = localStorage.getItem("webpacUrl");
var bibId = localStorage.getItem("edit_rating_bibId");
var title = localStorage.getItem("edit_rating_title");
var appraise = localStorage.getItem("edit_rating_appraise");
var isPublic = localStorage.getItem("edit_rating_isPublic");
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
        $('#ratingTitle').text("標題：" + title);
        $('select[name=isPublic]').val(isPublic);
        $('select[name=appraise]').val(appraise);
        ca.closeWaiting();

    }

    $("#sendBtn").on('click', function() {
        var newIsPublic = trim($('select[name=isPublic]').find(":selected").val());
        var newAppraise = trim($('select[name=appraise]').find(":selected").val());
        editRating(newIsPublic, newAppraise);
    });

    function editRating(newIsPublic, newAppraise) {
        if (undefined == newIsPublic || newIsPublic == '') {
            mui.alert('請選擇公開狀態', function() {
                return;
            });
        } else if (undefined == newAppraise || newAppraise == '') {
            mui.alert('請選擇評分', function() {
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
                    action: "edit",
                    appraise: encodeURI(newAppraise),
                    is_public: encodeURI(newIsPublic),
                    bib_id: bibId
                },
                succFn: function(data) {

                    if (null != data) {
                        var result = trim(data);
                        if (result == "success") {
                            mui.alert('更新成功', function() {
                                var arr = ['shelf_rating.html'];
                                clearShelfRatingData();
                                setTimeout(function() {
                                    ca.sendNotice(arr, 'update_rating', {});
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