var userInfo = localStorage.getItem("user_info");
var webpacUrl = localStorage.getItem("webpacUrl");
var infoArr = "";


mui.plusReady(function() {
    window.addEventListener("update_bookBox", function(e) {
        localStorage.removeItem('bookBox_isEdit');
        location.reload();
    });

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
                            tmpStr += '<li class="tag" data-tagId="' + json[a].uuid + '"><a><span class="name">' + json[a].tagname + '</span> (<span class="num font-color-light">查詢中...</span>)</a></li>';
                        }
                    }
                }
                $('#tagList').append(tmpStr);
                getTagNum();

                $(".tag").on('click', function() {
                    var tempTagid = $(this).attr('data-tagId');
                    var tempTagName = $(this).find('span.name').text();
                    localStorage.setItem("tagId", tempTagid);
                    localStorage.setItem("tagName", tempTagName);
                    clicked('shelf_bookBox_detail.html');
                });

                ca.closeWaiting();
            }
        });

    }

    function getTagNum() {

        if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
            infoArr = userInfo.split("#");
        } else {
            ca.prompt("發生錯誤，請重新登入再嘗試!");
            return;
        }

        var tagList = $('#tagList li.tag');
        var temptagIdArray = [];
        var tagIdListJson = "";

        $.each(tagList, function(i) {
            var tagid = $(tagList[i]).attr("data-tagId");
            temptagIdArray.push(tagid);
            var num = "0";
            ca.get({
                url: webpacUrl,
                data: {
                    method: "getShelfBoxListByTagIdAndUserIdCount",
                    userid: infoArr[1],
                    tagid: tagid
                },
                succFn: function(data) {
                    var json = JSON.parse(data);
                    if (null != json) {
                        num = json.count;
                    } else {
                        ca.prompt("擷取數量錯誤");
                    }

                    $(tagList[i]).find('span.num').text(num);

                }
            });
        });

        if (null != temptagIdArray && temptagIdArray.length != 0) {
            tagIdListJson = JSON.stringify(temptagIdArray);
        }
        localStorage.setItem("shelf_bookBox_List", tagIdListJson);
    }
});