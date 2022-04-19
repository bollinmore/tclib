mui.plusReady(function() {
	let $account = $('.account-list');
	var $fingerCtrl = $(".fingerprint");
	window.addEventListener("update_account", function(e) {
		loadListed();
	});

	$account.on("click", "button", function(e) {
		e.preventDefault();
		var _this = $(this);
		var btnArray = ['確認', '取消'];
		mui.confirm('確定刪除嗎', '溫馨提醒', btnArray, function(e) {
			if(e.index == 0) {
				ca.showWaiting();
				var parentNode = _this.parent();
				parentNode.remove();
				plus.storage.removeItem("card");
				plus.storage.removeItem("nickname");
				var card = "";
				var nickname = "";
				var size = $account.find("button").length;
				for(var i = 0; i < size; i++) {
					card += "#" + $("button").eq(i).attr("data");
					nickname += "#" + $("button").eq(i).attr("name");
				}
				plus.storage.setItem("card", card);
				plus.storage.setItem("nickname", nickname);
				mui.fire(mui.currentWebview.opener(), "update_account");
				mui.fire(plus.webview.getWebviewById("login.html"), "update_account");
				mui.fire(plus.webview.getWebviewById("tmp_login.html"), "update_account");
				ca.closeWaiting();
			}
		});
	});

	function loadListed() {
		var tmp = "";
		var localNickName = AntiSqlValidate(plus.storage.getItem(AntiSqlValidate("nickname")));
		var localCard = AntiSqlValidate(plus.storage.getItem(AntiSqlValidate("card")));
		if(localCard != null) {
			var cardArr = localCard.split("#");
			var nickNameArr = localNickName.split("#");
			for(var i = 1; i < cardArr.length; i++) {
				var cardId1 = cardArr[i].substring(0, 4);
				var cardId2 = cardArr[i].length > 15 ? cardArr[i].substring(8, 17) + "..." : cardArr[i].substring(8, cardArr[i].length);
				var cardId = cardId1 + "***" + cardId2;
				var nickName = nickNameArr[i].length > 5 ? nickNameArr[i].substring(0, 4) + "..." : nickNameArr[i];
				tmp += '<li>' +
					'   <div class="name">' + nickName + '</div>' +
					'   <div class="id">' + cardId + '</div>' +
					'   <button data="' + cardArr[i] + '" name="' + nickNameArr[i] + '" >刪除</button>' +
					' </li>';
			};
			$account.html(tmp);
		}
	}

	function checkIsFinger() {
		try {
			//			var isFinger = (plus.os.name == "iOS") ? localStorage.getItem("isRegriter_ios") : localStorage.getItem("isRegriter_android");
			//			if(isFinger == null || isFinger == "false") {
			//				$fingerCtrl.css("display", "none");
			//				return;
			//			}

			$('.account .fingerprint .switch div span').click(function() {
				if($(this).html() == "開啟中")
					localStorage.setItem("isOpenFinger", "true");
				else
					localStorage.setItem("isOpenFinger", "false")
			})
			var isOpenFinger = localStorage.getItem("isOpenFinger");
			let isAnimation = false;
			if(isOpenFinger != null && isOpenFinger == "true") {} else {
				let $self = $('.account .fingerprint .switch div span').eq(1);
				let $switchDiv = $('.account .fingerprint .switch div span').eq(1).parent();
				let prevOptionIdx = $switchDiv.find('span').index($switchDiv.find('.active'));
				let isTurnOn = $switchDiv.hasClass('off') ? false : true;

				// running animation or click item and previous item is same itme
				if(isAnimation || (prevOptionIdx === $self.index())) return false;
				isAnimation = true;

				isTurnOn ? $switchDiv.addClass('off') : $switchDiv.removeClass('off');
				$switchDiv.find('span').removeClass('active');

				// over animation
				setTimeout(function() {
					$self.addClass('active');
					isAnimation = false;
				}, 300)
			}
		} catch(e) {
			ca.prompt("初始化指紋辨識失敗!");
		}

	}
	loadListed();
	checkIsFinger();

});