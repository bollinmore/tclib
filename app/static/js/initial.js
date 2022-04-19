$( document ).ready(function(){
	// 當 ul li 設置 display:inline-block 時去除 li 與 li 之間的空隙
	$('.remove-text-nodes').contents().filter(function() {
    	return this.nodeType === 3;
	}).remove();
	
	// 暫且判斷 bg banner 圖片是否為大圖 調整 back btn 樣式
	$('#bg-banner img').each(function(){
		var url = $(this).attr('src').split('/');
		if(url[url.length-1]=='bg_banner.png') {
			$('#bg-banner .back').css({'height':'24%','top':'6%'});
		}
	})

	// 快捷列當下選中換圖顯示(li class="on")
	if($('#fast-link').length>0?true:false) {
		var $fastLinkCurrentImg = $('#fast-link').find('.on').find('img'),
			fastLinkCurrentImgSrc = $fastLinkCurrentImg.attr('src');
		fastLinkCurrentImgSrc = fastLinkCurrentImgSrc.substring(0, fastLinkCurrentImgSrc.length-4);
		$fastLinkCurrentImg.attr('src', fastLinkCurrentImgSrc+'hover.png');
	}

	chgWrapPosition();
	dataDisplay();

	// 若是行動借閱證頁面
	if($('div').is('.card')){
		chgCardPosition();
	}
});

$(window).resize(function(){
	chgWrapPosition();
});

// 調適頁面內容位置(for Android 4.x 版本)
function chgWrapPosition(){
	var isMoveTop = $('h1').is('.move-top'); // Bg Banner: true(大圖) false(小圖)
	var bgBannerDes = 'bg_banner';
	var bgBannerHeight = $(window).outerWidth() / (isMoveTop==true?2.88:9);
	var linkHeight = bgBannerHeight*(isMoveTop==true?0.23:0.7); // 返回 or link 連結框框高度(大Banner:小Banner)
	var titleHeight = ($(window).outerWidth() / 9)-10;
	titleHeight<38?(titleHeight=38):(titleHeight>60?(titleHeight=60):titleHeight);

	$('#header #bg-banner img').each(function(){ // select ba banner img
		var imgSrc = $(this).attr('src');
		if(imgSrc.indexOf(bgBannerDes) > 0){
			$(this).css('height', bgBannerHeight+'px'); // bg banner img
			return false;
		}
	});

	$('#header h1 img').css('height', titleHeight + 'px');
	$('#header h1 p').css({'height':titleHeight + 'px', 'line-height':titleHeight + 'px'});
	if($('div').is('#header')){
		$('#wrap').css({'padding':(bgBannerHeight+titleHeight-(isMoveTop==true?25:0))+'px 0 ' + ($('#fast-link').innerHeight()==null?0:$('#fast-link').innerHeight())+'px'});
		if($('#bg-banner a').is('.back') || $('#bg-banner a').is('.link-url')) {
			$('#bg-banner a.back, #bg-banner a.link-url').css({'height':linkHeight+'px','line-height':linkHeight+'px'});
		}
	}
}

// 輸入資料暗明碼
function dataDisplay(){
	$('.data-display').click(function(){
		var $inputTd = $(this).parent();
		$inputTd.find('input').attr('type',($(this).hasClass('data-hide')==true?'text':'password'));
		$(this).hasClass('data-hide')==true?($(this).removeClass('data-hide')):($(this).addClass('data-hide'));
	})
}

// 調適行動借閱證頁面位置(for Android 4.x 版本)
function chgCardPosition(){
	var cardHeight = $(window).outerHeight()-$('#header').outerHeight()-10;
	$('.card').css('height', cardHeight+'px');
	var centerPlaceMargin = (cardHeight - $('.card .center-place').outerHeight()-10)/2
	$('div').is('.card-login')==true?'':$('.card .center-place').css('margin', centerPlaceMargin+'px 0'); // card login 畫面不寫margin
	$('div').is('.card-bar-code')==true?($('.card .bar-code').css({'width':($('.card').outerWidth()-40)+'px','height':($(window).outerHeight()*0.2)+'px'})):''; // card bar code 畫面對 bar code 區塊進行高寬配置
	$('.card .btn-box').css('width', ($('.card').outerWidth()-40)+'px');
}
