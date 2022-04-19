var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
var passbookSvcUrl = AntiSqlValidate(localStorage.getItem("passbookSvcUrl"));
var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
var minPoint = localStorage.getItem("passbook_minPoint");
var maxPoint = localStorage.getItem("passbook_maxPoint");
var infoArr = "";
var defaultCurrentPage = 1,
    currentPage = 1;
var defaultPageSize = 10,
    pageSize = 10;
var totalCount = 0;
var num = 0;
var today = new Date();
var year = today.getFullYear();
var month = today.getMonth() + 1;

baseUrl = baseUrl.replace('APPAPI', 'API');

mui.plusReady(function() {
    if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
        infoArr = userInfo.split("#");
    } else {
        ca.prompt("發生錯誤，請重新登入再嘗試!");
        mui.back();
    }

    getYearList();
    getMonthList();

    readLoad();

});

function readLoad() {
    ca.showWaiting();
    num = currentPage * pageSize;
    var startDate = formatDate(getMonthFirstDay(year, month), '/');
    var endDate = formatDate(getMonthLastDay(year, month), '/');

    ca.get({
        url: baseUrl,
        data: {
            identify: "TCC",
            func: "Readingpoint_getpatronpointlist",
            username: infoArr[1],
            password: realPwd,
            startDate: startDate,
            endDate: endDate
        },
        succFn: function(data) {
            ca.closeWaiting();
            try {
                if (data.indexOf("failure") > -1)
                    mui.alert("發生錯誤，請稍後再嘗試!", '錯誤', function() {
                        ca.closeWaiting();
                        return;
                    });
                else
                    setContent(data);
            } catch (e) {
                ca.closeWaiting();
                ca.prompt("發生錯誤，請稍後再嘗試!");
                return;
            }

        }
    });

}

function setContent(data) {
    var book_list = "";
    if (data != "") {
        ca.closeWaiting();
        var jsonData = JSON.parse(data);
        
        var point = undefined == jsonData['point'] || '' == jsonData['point'] ? "0" : jsonData['point'];
        var vaildDate = undefined == jsonData['vaild_date'] ? "" : jsonData['vaild_date'];
        var pointStr = '<span>' + point + '點</span>';
        /*if (vaildDate != ''){
            pointStr += ' (' + vaildDate + '到期)';
        }*/
        $('#point').html(pointStr);
        $('#useDetail').text(year + '年' + month + '月使用明細');

        var pointlist = jsonData.pointlist;
        for (var a in pointlist) {
            if (undefined != pointlist[a].name) {
                num++;
                var name = undefined == pointlist[a]['name'] ? "" : pointlist[a]['name'];
                var date = undefined == pointlist[a]['date'] ? "" : pointlist[a]['date'];
                var type = undefined == pointlist[a]['type'] ? "" : pointlist[a]['type'];
                var location = undefined == pointlist[a]['location'] ? "" : pointlist[a]['location'];
                var point_plus = undefined == pointlist[a]['point_plus'] ? "" : pointlist[a]['point_plus'];
                var point_mines = undefined == pointlist[a]['point_mines'] ? "" : pointlist[a]['point_mines'];

                book_list += '' +
                    '<li class="points-block">' +
                    ' <ul class="points-box">' +
                    '  <li>' +
                    '   <div class="points-title">日期</div>' +
                    '   <p>' + date + '</p>' +
                    '  </li>' +
                    '  <li>' +
                    '   <div class="points-title">類型</div>' +
                    '   <p>' + type + '</p>' +
                    '  </li>' +
                    '  <li>' +
                    '   <div class="points-title">品項/兌換地點</div>' +
                    '   <p>' + name + '/' + location + '</p>' +
                    '  </li>' +
                    '  <li>' +
                    '   <div class="points-title">增加點數</div>' +
                    '   <p>' + point_plus + '</p>' +
                    '  </li>' +
                    '  <li> ' +
                    '   <div class="points-title">減少點數</div>' +
                    '   <p>' + point_mines + '</p>' +
                    '  </li>' +
                    ' </ul>' +
                    '</li>';
            }

        }

    }
    book_list = book_list == '' ? '<p class="font-align-c">查無資料</p>' : book_list;

    $("#result-list").html(book_list);
    currentPage++;
    ca.closeWaiting();

}

function getYearList() {
    var $select = $('select[name="year"]');
    var list = '';
    var form = year;
    var to = 2010;
    for (form; form >= to; form--) {
        if (form == year)
            list += '<option selected value="' + form + '">' + form + '</option>';
        else
            list += '<option value="' + form + '">' + form + '</option>';
    }
    $($select).append(list);
}

function getMonthList() {
    var $select = $('select[name="month"]');
    var list = '';
    var form = 1;
    var to = 12;
    for (form; form <= to; form++) {
        if (form == month)
            list += '<option selected value="' + form + '">' + form + '</option>';
        else
            list += '<option value="' + form + '">' + form + '</option>';
    }
    $($select).append(list);
}

function getMonthFirstDay(y, m) {
    return new Date(y, m - 1, 1);
}

function getMonthLastDay(y, m) {
    return new Date(y, m, 0);
}

function formatDate(date, format) {
    var str = '';
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();

    if (m < 10) {
        m = '0' + m;
    }
    if (d < 10) {
        d = '0' + d;
    }
    str = y + format + m + format + d;
    return str;
}

$(document).on('click', '.three #search', function(){
    var y = $('select[name="year"]').find(":selected").val();
    var m = $('select[name="month"]').find(":selected").val();
    if(undefined == y || '' == y){
        mui.alert('請選擇年份', '溫馨提醒', function() {
            return;
        });
    } else if (undefined == m || '' == m) {
        mui.alert('請選擇月份', '溫馨提醒', function() {
            return;
        });
    } else {
        year = y;
        month = m;
        readLoad();
    }
});