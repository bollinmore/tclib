var userInfo = localStorage.getItem("user_info");
var webpacUrl = localStorage.getItem("webpacUrl");
var id = localStorage.getItem("edit_bookBox_detail_id");
var tagid = localStorage.getItem("edit_bookBox_detail_tagid");
var title = localStorage.getItem("edit_bookBox_detail_title");
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
        $('#bookTitle').text("標題：" + title);

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
                            var isCheck = "";
                            if (undefined != json[a].uuid && tagid.indexOf(json[a].uuid) != -1){
                                isCheck = "checked";
                            }

                            tmpStr += ''
                            +'<div>'
							+' <label class="check-box">'
							+'  <input type="checkbox" name="tag" value="' + json[a].uuid + '" ' + isCheck + '>'
							+'  <div class="check"></div> ' + json[a].tagname
							+' </label>'
						    +'</div>';
                        }
                    }
                }
                $('#tagList').html(tmpStr);
                ca.closeWaiting();
            }
        });

        ca.closeWaiting();

    }

    $("#sendBtn").on('click', function() {
        var newTagList = "";
        var $checkboxList = $('input[name=tag]:checked');
        $($checkboxList).each(function(i, obj) {
            if (newTagList == ""){
                newTagList = obj.value;
            } else {
                newTagList += "," + obj.value;
            }
        });
        editTag(newTagList);
    });

    function editTag(newTagList) {
        if (true) {
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
                    action: "edit",
                    shelf_tag_list: encodeURI(newTagList),
                    uuid: id
                },
                succFn: function(data) {

                    if (null != data) {
                        var result = trim(data);
                        if (result == "stick_single_none" || result == "stick_single_success") {
                            mui.alert('更新成功', function() {
                                localStorage.setItem("bookBox_isEdit", "true");
                                var arr = ['shelf_bookBox_detail.html'];
                                clearShelfBookBoxDetailData();
                                setTimeout(function() {
                                    ca.sendNotice(arr, 'update_bookBox_detail', {});
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