mui.plusReady(function() {

	////http://10.1.5.71/toread_NTL/APPAPI?identify=TCC&func=findProclaimList&locationid=
	var baseUrl = localStorage.getItem("baseUrl");

	var $bookInfo = $(".main");
	var func = "findProclaimList",
		infoArr = [];
	readLoad();

	function readLoad() {
		var userInfo = localStorage.getItem("user_info");
		var realPwd = localStorage.getItem("realPwd");
		if(null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
			infoArr = userInfo.split("#");
		}
		ca.showWaiting();
		ca.get({
			url: baseUrl,
			data: {
				identify: "TCC",
				func: func,
				locationid: 3,
				publishstart: "20200101"
			},
			succFn: function(NewsData) {
				try {
					ca.closeWaiting();
					//<li>
					//                  <a href="bulletin_detail.html">
					//                      <div class="public">
					//                          <div class="date">2019-08-12</div>
					//                      </div>
					//                      <p>圖書館e學堂開課囉!-親子手機APP鬥陣來學</p>
					//                  </a>
					//              </li>

					var tempString = "";
					var resultData = JSON.parse(NewsData);
					for(var b in resultData) {
                        if(resultData[b].publishend){
                            var endDateStr = resultData[b].publishend.replace(/\//g, '-');
                            var endDate = new Date(endDateStr);
                            var nowDate = new Date();

                            if(endDate >= nowDate){
                                if(resultData[b].gist) {
                                    tempString += '<li><a data="' + resultData[b].proclaimid + '" onclick="clickdetail(this);">' +
                                         '<div class="public">' +
                                         resultData[b].publishstart + '</div><p>' + resultData[b].content +
                                         '</p></a></li>';
                                         //tempString += '<li><a data="'+resultData[b].id+'">' + resultData[b].gist + '</a></li>';

                                } else {

                                }
                            }

                        }

					}

					$(".bulletin ul").html(tempString==""?"無資料":tempString);

				} catch(e) {
					ca.prompt("無法取得最新消息資料1" + NewsData + e.message);

				}
			}

		});
	}
});

function clickdetail(target) {
	window.event ? window.event.cancelBubble = true : target.stopPropagation();
	var newsid = target.getAttribute("data");
	//localStorage.setItem("newsid", AntiSqlValidate(newsid));
	plus.storage.setItem("newsid", AntiSqlValidate(newsid));
	clicked("bulletin_detail.html");
}