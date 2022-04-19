function scaned(t, r, f) {
	update(t, r, f);
}

function update(t, r, f) {
	$select.eq(0).val("3");
	$keyword.val(r);
	do_search();
}

mui.plusReady(function() {

	$('.voice').on('click', function(e) {

		if(plus.os.name == "iOS") {
			e.preventDefault();
			e.stopPropagation();
			SpeechInitial(e);
		}

	});

	mui.init({
		pullRefresh: {
			container: '#pullrefresh',
			up: {
				contentrefresh: '',
				callback: pullupRefresh
			},

		}
	});
	$searchContent = $('.mui-scroll');
	$select = $("select");
	$keyword = $("input");
	baseUrl = AntiSqlValidate(localStorage.getItem("baseUrl"));
	ca.showWaiting();
	ca.get({
		url: baseUrl,
		data: {
			identify: "TCC",
			func: "getPhysicalLocations"
		},
		succFn: function(data) {
			try {
				var jsonData = JSON.parse(data.trim());
				var selectOp = "";
				for(var a in jsonData) {
					selectOp += "<option value='" + AntiSqlValidate(jsonData[a].id) + "'>" +
						AntiSqlValidate(jsonData[a].name) + "</option>"
				}
				$("select").eq(1).html('<option value="0">所有館別</option>' +
					selectOp);
			} catch(e) {
				ca.promp(e.message);
			} finally {
				ca.closeWaiting();
			}
		}
	});
	$("select").change(function() {
		do_search(false);
	});

});

document.querySelector('form').addEventListener('submit', function(e) {
	var $link = $(e.target);
	e.preventDefault();
	if(!$link.data('lockedAt') || +new Date() - $link.data('lockedAt') > 300) {
		do_search(true);
	}
	$link.data('lockedAt', +new Date()); // 組織默認事件

});

var totalCount = 0,
	currentPage = 0,
	currentNum = 0;

function do_search(flage) {
	type = $select.eq(0).val();
	locationId = trim($select.eq(1).val()) == "0" ? '' : trim($select.eq(1).val());
	txtValue = trim($keyword.val());
	order = $select.eq(2).val();

	if(txtValue == "" && flage) {
		$searchContent.html("");
		mui.alert('您尚未輸入任何檢索詞。', '溫馨提醒', function() {});
		return;
	} else {
		totalCount = 0,
			currentPage = 0,
			currentNum = 0;
		$keyword.blur();
		$searchContent.html("");

	}
	mui('#pullrefresh').pullRefresh().enablePullupToRefresh();

	dosub_search();
}

function dosub_search(pullRefreshObj) {
	orderType = order.split("#")[0];
	orderVal = order.split("#")[1];
	if(txtValue == '') {
		return;
	}

	if(currentPage == 0)
		ca.showWaiting();
	ca.get({
		url: baseUrl,
		data: {
			identify: "TCC",
			func: "queryBibliographic",
			condition: type,
			input: encodeURIComponent(txtValue),
			locationId: locationId,
			start: currentPage,
			limit: "20",
			sb: orderType,
			ob: orderVal
		},
		succFn: function(data) {
			ca.closeWaiting();
			var totalNum = "";
			if(data.indexOf(":\"failure\"") > -1) {
				ca.prompt("查詢發生錯誤，請稍後再嘗試!");
				return;
			}
			var jsonData = JSON.parse(data);
			var startnum = currentPage;
			var book_list = "";

			if(jsonData != "") {
				var imgSrc = "dist/img/default.png";
				for(var a in jsonData) {
					currentPage++;
					totalCount = jsonData[0].counts;
					if(jsonData[a].externalCoverUrl != null) {
						imgSrc = jsonData[a].externalCoverUrl;
					} else {
						imgSrc = "dist/img/default.png";
					}
					if(jsonData[a].title != undefined) {
						book_list += '<div class="padding-box book-box"><a class="mId" onclick="clickdetail(this);" data="' + AntiSqlValidate(jsonData[a].mId) + '" imagelink="' + AntiSqlValidate(imgSrc) + '">' +
							'<h3>' + AntiSqlValidate(jsonData[a].title) + '</h3>' +
							'<div class="cover"><img src="dist/img/default.png" data-lazyload="' + imgSrc + '"/></div>' +
							'<div class="info">' +
							'<p>書籍型態：' + AntiSqlValidate((jsonData[a].recordType == null ? "" : jsonData[a].recordType.split(",")[0])) + '</p>' +
							'<p>作者：' + AntiSqlValidate(jsonData[a].authors) + '</p>' +
							'<p>出版者：' + AntiSqlValidate(jsonData[a].publishers) + '</p>' +
							'<p>出版年：' + AntiSqlValidate((jsonData[a].year == null ? "" : jsonData[a].year)) + '</p>' +
							'<p>館藏數量：' + AntiSqlValidate(jsonData[a].itemCount) + '</p>' +
							'<p>可借閱數量：' + AntiSqlValidate(jsonData[a].availableItemCountForLoan) + '</p>' +
							/*book_list.append('<p>'+(jsonData[a].recordType==null?"":jsonData[a].recordType.split(",")[1])+'</p>');*/
							'</div><!-- class="info" End -->' +
							'</a></div>';
					}
				}
				if(startnum == 0)
					$searchContent.append('<p class="padding-box-h font-color-remind">' + AntiSqlValidate(txtValue) + " 共有" + AntiSqlValidate(totalCount) + "筆</p>" + book_list.toString());
				else
					$searchContent.append(book_list.toString());
				setTimeout(function() {
					(function($) {
						$(document).imageLazyload({
							placeholder: 'dist/img/default.png'
						});
					})(mui);
				}, 500);

				if(currentPage >= totalCount) {
					mui('#pullrefresh').pullRefresh().disablePullupToRefresh();

				}

			} else {
				if(currentPage == 0)
					$searchContent.html('<p class="padding-box-h font-color-remind">' + AntiSqlValidate(txtValue) + "共有0筆</p>");
			}

			/*if(pullRefreshObj == undefined) {
				ca.closeWaiting();
			}*/
			if(pullRefreshObj && pullRefreshObj.endPullupToRefresh) {
				pullRefreshObj.endPullupToRefresh((currentPage >= Math.ceil(totalCount / 20)));
				return;
			}
		},
		errFn: function(error) {
			ca.closeWaiting();
			$('.font-color-remind').html('<p class="padding-box-h font-color-remind">' + AntiSqlValidate(txtValue) + "共有0筆</p>");
		}

	});
}

function clickdetail(target) {
	window.event ? window.event.cancelBubble = true : target.stopPropagation();
	var mid = target.getAttribute("data");

	var imagelink = target.getAttribute("imagelink");
	localStorage.setItem("mid", AntiSqlValidate(mid));
	plus.storage.setItem("mid", AntiSqlValidate(mid));
	plus.storage.setItem("imagelink", AntiSqlValidate(imagelink));
	clicked("book_detail.html");
}

/**
 * 上拉加載具體業務實現
 */

function pullupRefresh() {
	var self = this;

	if(txtValue == undefined || txtValue.value == '' || (totalCount == 0 && currentPage == 1)) {
		//	this.endPullupToRefresh(true);
		//mui('.mui-pull-bottom-pocket')[0].className = 'mui-pull-bottom-pocket';
		return;
	}
	setTimeout(function() {
		dosub_search(self);
	}, 1500);
}