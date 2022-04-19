mui.plusReady(function() {
  ca.init();

    var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
    var patronData_address = localStorage.getItem('patronData_address');
    var patronData_email = localStorage.getItem('patronData_email');
    var patronData_mobile_phone = localStorage.getItem('patronData_mobile_phone');
    var patronData_educationLevel = localStorage.getItem('patronData_educationLevel');
    var patronData_occupation = localStorage.getItem('patronData_occupation');
    var patronData_use_card_expired_date = localStorage.getItem('patronData_use_card_expired_date');

    readyLoad();

    $('#sendBtn').on('click', function(e){
      e.preventDefault(); // 組織默認事件
      updatePatronData();
    });

    function readyLoad() {
        var userInfo = localStorage.getItem("user_info");
        if (null == userInfo) {
            mui.alert('您尚未登入，請先進行登錄', '溫馨提醒', function() {
                clicked('login.html');
            });
        } else {
            ca.showWaiting();
            try {
                if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
                    $('input[name=email]').val(patronData_email);
                    $('input[name=phone]').val(patronData_mobile_phone);
                    $('input[name=address]').val(patronData_address);
                    getEducationList();
                    getCareerList();
                }
            } catch (e) {} finally {
                ca.closeWaiting();

            }
        }
    }

    function getEducationList() {
        var tmpStr = "";
        ca.get({
            url: baseUrl,
            data: {
                identify: "TCC",
                func: "getPickList",
                limbaId: "4",
                picklistname: "Education%20Level"
            },
            succFn: function(data) {
                var json = JSON.parse(data);
                for (var a in json){
                    if (undefined != json[a].Count && json[a].Count != '0') {
                        var picklistArray = json[a].PicklistValue;
                        for (var b in picklistArray) {
                            if (picklistArray[b].PicklistValue_id) {
                                if (picklistArray[b].PicklistValue_value.indexOf(patronData_educationLevel) != -1)
                                    tmpStr += '<option selected value="' + picklistArray[b].PicklistValue_value + '">' + picklistArray[b].PicklistValue_message + '</option>';
                                else
                                    tmpStr += '<option value="' + picklistArray[b].PicklistValue_value + '">' + picklistArray[b].PicklistValue_message + '</option>';
                            }
                        }
                    } else {
                        ca.prompt("教育程度資料擷取錯誤");
                    }
                }
                

                $('select[name=education]').html(tmpStr);
            }
        });
    }

    function getCareerList() {
        var tmpStr = "";
        ca.get({
            url: baseUrl,
            data: {
                identify: "TCC",
                func: "getPickList",
                limbaId: "4",
                picklistname: "Occupation"
            },
            succFn: function(data) {
                var json = JSON.parse(data);
                for (var a in json) {
                    if (undefined != json[a].Count && json[a].Count != '0') {
                        var picklistArray = json[a].PicklistValue;
                        for (var b in picklistArray) {
                            if (picklistArray[b].PicklistValue_id) {
                                if (picklistArray[b].PicklistValue_value.indexOf(patronData_occupation) != -1)
                                    tmpStr += '<option selected value="' + picklistArray[b].PicklistValue_value + '">' + picklistArray[b].PicklistValue_message + '</option>';
                                else
                                    tmpStr += '<option value="' + picklistArray[b].PicklistValue_value + '">' + picklistArray[b].PicklistValue_message + '</option>';
                            }
                        }
                    } else {
                        ca.prompt("職業別資料擷取錯誤");
                    }
                }    
                

                $('select[name=career]').html(tmpStr);
            }
        });
    }

    function updatePatronData() {
        var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
        var realPwd = AntiSqlValidate(localStorage.getItem("realPwd"));
        var infoArr = "";
        var addr = $('input[name=address]').val();
        var email = $('input[name=email]').val();
        var phone = $('input[name=phone]').val();
        var occupation = $('select[name=career]').find(":selected").val();
        var educationLevel = $('select[name=education]').find(":selected").val();
        if (null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
            infoArr = userInfo.split("#");
        } else
            return;

        ca.showWaiting();
        ca.get({
            url: baseUrl,
            data: {
                identify: "TCC",
                func: "updatePatronData",
                username: infoArr[1],
                password: realPwd,
                address: addr,
                email: email,
                mobile_phone: phone,
                occupation: occupation,
                educationLevel: educationLevel
            },
            succFn: function(data) {
                ca.closeWaiting();
                try{
                    var json = JSON.parse(data);
                    if (null != json.status && json.status == "successful") {
                        var arr = ['shelf_library.html'];
                        mui.alert("展期成功", "溫馨提示", function() {
                            mui.back();
                            ca.sendNotice(arr, 'update_cardDate', {});
                        });
                    } else {
                        mui.alert("失敗，" + json.cause, "溫馨提示", function() {
                            mui.back();
                        });
                    }
                }catch(e){
                    mui.alert("發生錯誤，請稍後再嘗試!", "溫馨提示", function() {
                        mui.back();
                    });
                }
                
            }
        });
    }

});