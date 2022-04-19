mui.plusReady(function() {

	////http://10.1.5.71/toread_NTL/APPAPI?identify=TCC&func=findProclaimList&locationid=
	var baseUrl = localStorage.getItem("baseUrl");
	//localStorage.getItem("newsid", AntiSqlValidate(newsid));
	var newsid = plus.storage.getItem("newsid", AntiSqlValidate(newsid));
	var $bookInfo = $(".main");
	var func = "findProclaimList",
		infoArr = [];
	readLoad();
//<div class="main bulletin">
//      <div class="padding-box detail">
//          <!--<h2>圖書館e學堂開課囉!-親子手機APP鬥陣來學</h2>
//          <div class="public">
//              <span>發布日期：2019-08-12</dispanv>
//          </div>
//          <article>
//              <p>想要擁有獨一無二的親子貼圖嗎？或是留下珍貴的親子出遊畫面？臺中市立圖書館自去年辦理「圖書館e學堂」資訊推廣研習課程以來，深獲民眾喜愛，今（108）年8月17日起，更將於龍井、新社、潭子、太平坪林、李科永、后里、南區、大雅、大安及烏日等10所圖書館分館擴大辦理，教導民眾學習時下最流行的手機APP課程，即日起受理報名，智慧生活歡迎大家e起來！</p>
//          </article>-->
//      </div>
//  </div>
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
				proclaimid:newsid
			},
			succFn: function(NewsData) {
				try {
					console.log(NewsData);
					ca.closeWaiting();
//<div class="main bulletin">
//      <div class="padding-box detail">
//          <!--<h2>圖書館e學堂開課囉!-親子手機APP鬥陣來學</h2>
//          <div class="public">
//              <span>發布日期：2019-08-12</dispanv>
//          </div>
//          <article>
//              <p>想要擁有獨一無二的親子貼圖嗎？或是留下珍貴的親子出遊畫面？臺中市立圖書館自去年辦理「圖書館e學堂」資訊推廣研習課程以來，深獲民眾喜愛，今（108）年8月17日起，更將於龍井、新社、潭子、太平坪林、李科永、后里、南區、大雅、大安及烏日等10所圖書館分館擴大辦理，教導民眾學習時下最流行的手機APP課程，即日起受理報名，智慧生活歡迎大家e起來！</p>
//          </article>-->
//      </div>
//  </div>

					var tempString = "無資料";
					var resultData = JSON.parse(NewsData);
					for(var b in resultData) {
						if(resultData[b].gist) {
							tempString = '<h2>'+resultData[b].content+'</h2>'
         +'<div class="public">'
+'<span>發布日期：'+resultData[b].publishstart+'</span>'
+ '</div>'
+ '<article>'
+ '<p>'+resultData[b].gist+'</p></article>';
         
						} else {

						}
					}

					$(".detail").html(tempString);

				} catch(e) {
					ca.prompt("無法取得最新消息資料1" + NewsData + e.message);

				}
			}

		});
	}
});
