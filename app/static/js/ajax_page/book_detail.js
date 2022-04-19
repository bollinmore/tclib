mui.plusReady(function() {
	locID = '';
	yearnum = '';
	volum = '';
	ishelf = 'no';
	var baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));

	var $bibcontent = $(".book-box");
	var $itemcontent = $(".mui-scroll");
	var bookData = null,
		reservationData = null;
	defaultCurrentPage = 0,
		currentPage = 0;
	defaultPageSize = 10,
		pageSize = 10;

	totalCount = 0;
	var pullrefresh = mui('#pullrefresh');
	var num = 0;
	var remark_data = [];
	var isFirstLoad = true;
	var isinitialFileter = false;
	var isLoading = true;

	window.readLoad = function() {

		var mid = AntiSqlValidate(localStorage.getItem("mid"));

		//AntiSqlValidate(localStorage.getItem("mid"));
		if(mid == null || mid == undefined || mid == "")
			mid = AntiSqlValidate(plus.storage.getItem("mid"));
		//		alert(ishelf);
		//		alert(yearnum);
		var isshelft = "no";
		if(ishelf == true)
			isshelft = "yes";
		else if(ishelf == false)
			isshelft = "no";
		var Getdata = {
			identify: "TCC",
			func: "findBibliographicDetail",
			mId: mid,
			start: currentPage,
			limit: pageSize,
			loc: locID,
			volno: volum,
			year: yearnum,
			shelf: isshelft
		};
		if(locID == '' || locID == '0')
			delete Getdata['loc'];
		if(volum == '')
			delete Getdata['volno'];
		if(yearnum == '')
			delete Getdata['year'];

		//console.log(Getdata.volno);
		//console.log(Getdata.loc);
		//console.log(Getdata.year);
		if(currentPage > 0 & currentPage >= totalCount) {
			mui('#pullrefresh').pullRefresh().disablePullupToRefresh();
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
			//mui('.mui-pull-bottom-pocket')[0].className = 'mui-pull-bottom-pocket';
			console.log("test");
			return;
		}
		var imagelink = plus.storage.getItem("imagelink");
		//		if(currentPage == 0)
		//			ca.showWaiting();
		ca.get({
			url: baseUrl,
			data: Getdata,
			succFn: function(data) {
				console.log(data);
				ca.closeWaiting();
				if(trim(data.split("#")[0]) == "failure") {
					ca.prompt(data.split("#")[1]);
				} else {
					var jsonData = JSON.parse(data);
					var startnum = currentPage;
					var tmp = "",
						reservationTmp = "",
						locationTmp = "",
						strTemp = "";
					var isReservate = "不可預約";

					for(var a in jsonData) {
						num = 0;
						totalCount = jsonData[a].itemCount;

						if(isFirstLoad) {
							isFirstLoad = false;
							bookData = new StringBuilder();
							bookData.append('<h3>' + AntiSqlValidate(jsonData[a].title) + '</h3>');
							bookData.append('<div class="cover"><img src="dist/img/default.png" data-lazyload="' + imagelink + '" /></div>');
							bookData.append('<div class="info"><p>作者：' + AntiSqlValidate(jsonData[a].authors) + '</p>');
							bookData.append('<p>出版地：' + AntiSqlValidate(jsonData[a].placeOfPublication == null ? "" : jsonData[a].placeOfPublication.replace(":", "")) + '</p>');
							bookData.append('<p>出版者：' + AntiSqlValidate(jsonData[a].publishers == null ? "" : jsonData[a].publishers) + '</p>');
							bookData.append('<p>出版年：' + AntiSqlValidate((jsonData[a].year == null ? "" : jsonData[a].year)) + '</p>');
							bookData.append('</div>');
							$bibcontent.html(bookData.toString());
							var filtercontent = '<div class="padding-box form-box">' +
								'<form name="" action="POST" onsubmit="return check();">' +
								'<div>' +
								'<p class="title">館藏地</p>' +
								'<select name="sort">' +
								'<option value="0">所有館別</option>' +
								'' +
								'</select>' +
								'</div>' +
								'<div class="two">' +
								'<div>' +
								'<p class="title">年代號</p>' +
								'<input id="test" type="text" name="year" maxlength="20" />' +
								'</div>' +
								'<div>' +
								'<p class="title">卷號</p>' +
								'<input type="text" name="" maxlength="20" />' +
								'</div>' +
								'</div>' +
								'<div class="bg">' +
								'<label class="check-box">' +
								'<input type="checkbox" name="shelf" />' +
								'<div class="check"></div> 僅顯示在架' +
								'</label><input type="submit" name="submit" style="margin-left: -1000px" value=""/>' +
								'</div>' +
								'<div class="butn-box">' +
								'<button class="butn">查詢</button>' +
								'</div>' +
								'</form>' +
								'</div>';
							$itemcontent.append(filtercontent);
							setTimeout(function() {
								(function($) {
									$(document).imageLazyload({
										placeholder: 'dist/img/default.png'
									});
								})(mui);
							}, 500);

							$('.butn').eq(0).click(function(e) {
								e.stopPropagation();
								ca.showWaiting();
								document.querySelector('input[type="submit"]').click();
								//readLoad();
							});
							$('input').eq(2).change(function() {
								$("#items").html("");
								currentPage = 0;
								pageSize = defaultPageSize;
								ishelf = $(this).prop("checked");
								//yearnum = $('input').eq(0).val();
								//volum = $('input').eq(1).val();
								console.log("test2");
								document.querySelector('input[type="submit"]').click();
								//readLoad();
							});
							ca.get({
								url: baseUrl,
								data: {
									identify: "TCC",
									func: "findItemsLocations",
									mId: mid
								},
								succFn: function(data) {
									try {
										if(trim(data.split("#")[0]) == "failure") {
											ca.prompt(data.split("#")[1]);
										} else {
											ca.closeWaiting();
											var jsonData = JSON.parse(data);
											var locationTmp = new StringBuilder(1000);
											for(var n in jsonData) {
												var select = AntiSqlValidate((locID == jsonData[n].id) ? 'selected="selected"' : '');
												locationTmp += '<option value="' + AntiSqlValidate(jsonData[n].id) + '"' + select + '>' + AntiSqlValidate(jsonData[n].name) + '</option>';
											}
											$("select").append(locationTmp.toString());
											locationsFlag = true;
											$("select").change(function() {
												locID = $(this).val();
												$("#items").html("");
												currentPage = 0;
												pageSize = defaultPageSize;
												//yearnum = $('input').eq(0).val();
												//volum = $('input').eq(1).val();
												document.querySelector('input[type="submit"]').click();
												//readLoad();
											});
										}
									} catch(e) {
										ca.prompt(e.message);
									}
								}
							});
						}
						var bookinfo = JSON.stringify(jsonData[a]);
						var reservationInfo = jsonData[a].items;
						if(reservationInfo.length == 0)
							totalCount = currentPage;
						for(var b in reservationInfo) {
							currentPage++;
							if(reservationInfo[b].allowReserve == "1") {
								isReservate = "預約";
							}
							if(strTemp.indexOf(reservationInfo[b].locationName) == -1) {
								locationTmp += '<option>' + reservationInfo[b].locationName + '</option>';
							}
							strTemp += reservationInfo[b].locationName + ",";
							reservationTmp += '<div class="padding-box book-text-info">' +
								' <p>條碼號：' + reservationInfo[b].itemnumber + '</p>' +
								' <p>館藏地：<span class="locName">' + reservationInfo[b].locationName + '</span></p>' +
								' <p>索書號：' + reservationInfo[b].callNumber + '</p>' +
								' <p>資料類型：' + reservationInfo[b].usageClassName + '</p>' +
								' <p>借閱狀態：' + reservationInfo[b].inventoryStatus + '</p>' +
								' <p>預約人數：' + reservationInfo[b].reserveCount + '</p>' +
								' <p>館藏流通類別：' + reservationInfo[b].itemClassName + '</p>' +
								' <p>年代號：' + reservationInfo[b].year + '</p>' +
								' <p>卷號：' + reservationInfo[b].volno + '</p>' +
								' <div class="butn-box" ><a class="butn" bookinfo="' + reservationInfo + '" data="' + reservationInfo[b].itemid + '">' + isReservate + '</a></div>' +
								'</div>';
						}
					}
					if(!isinitialFileter) {
						$itemcontent.append('<div id="items">' + reservationTmp + '</div');
						$itemcontent = $("#items");
						isinitialFileter = true;
												console.log("1");

					} else {
						console.log("2");
												console.log(currentPage);

						if(Getdata.start == 0)
							$itemcontent.html(reservationTmp);
						else
							$itemcontent.append(reservationTmp);

					}

					if(mui('#pullrefresh').pullRefresh() && mui('#pullrefresh').pullRefresh().endPullupToRefresh) {
						mui('#pullrefresh').pullRefresh().endPullupToRefresh((Math.ceil(currentPage / 10) >= Math.ceil(totalCount / 10)));
						//
						return;
					}
				}
			}
		});
	}

	function StringBuilder() {
		this.data = Array("");
	}
	StringBuilder.prototype.append = function() {
		this.data.push(arguments[0]);
		return this;
	}
	StringBuilder.prototype.toString = function() {
		return this.data.join("");
	}
	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			up: {
				auto: true,
				contentrefresh: '',
				callback: window.readLoad
			}
		}
	});

	$("body").on("click", ".butn-box", function() {
		var userInfo = AntiSqlValidate(localStorage.getItem("user_info"));
		if(userInfo != 'null' && userInfo != '' && null != userInfo && userInfo.split("#")[0].toUpperCase() == "ok".toUpperCase()) {
			var itemid = $(this).find("a").attr("data");
			localStorage.setItem("itemid", AntiSqlValidate(itemid));
			plus.storage.setItem("bookinfo", $bibcontent.html());
			clicked("book_detail_reservation.html");
		} else {
			mui.alert('請到登入頁完成登入後再進行此操作。', '溫馨提醒', function() {
				localStorage.setItem("prePage", "book_detail");
				clicked("login.html");
			});
		}
	});

});

function check() {

	//locID = $(this).val();
	//var form = $("form");
	//form.validate();
	//if(!form.valid())
	//	return false;

	$("input").blur();

	yearnum = $('input').eq(0).val();
	volum = $('input').eq(1).val();
	//	if(yearnum == '' && volum == '') {
	//
	//		mui.alert("請輸入關鍵詞", function() {
	//			if(yearnum == '')
	//				$('input').eq(0).focus();
	//			else
	//				$('input').eq(1).focus();
	//
	//		});
	//		return false;
	//
	//	}
	currentPage = 0;
	pageSize = defaultPageSize;
	console.log("test");
	mui('#pullrefresh').pullRefresh().pullupLoading();
	//	readLoad();
	return false;
}