mui.plusReady(function() {
	
	$('div.share-list ul li a').eq(0).on('click', function() {
		clicked('shelf_rating.html');
	});
	$('div.share-list ul li a').eq(1).on('click', function() {
		clicked('shelf_comment.html');
	});

});