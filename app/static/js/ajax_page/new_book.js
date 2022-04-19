var bookList = null;
var lists = document.getElementById("list_book");
var FINDNEWBOOKLIST = AntiSqlValidate(localStorage.getItem("findNewbookList"));
ca.showWaiting();
ca.get({
    url:FINDNEWBOOKLIST,
	data: {},
	dataType: 'json', //服务器返回json格式数据
//	type: 'get', //HTTP请求类型
//	crossDomain: true,
//	timeout: 10000, //超时时间设置为10秒
	succFn: function(data) {
	    data = JSON.parse(data);
		ca.closeWaiting();
		if(data.responseCode === "dataFound") {
			var jsonData = data.rs;
			var imgSrc = "img/default.png";
			for(var a in jsonData) {
				var div = document.createElement('div');
				div.className = 'book-info';
				if(jsonData[a].img != null) {
					imgSrc = jsonData[a].img;
				}
				if(jsonData[a].bookname != undefined) {
					book_list = new StringBuilder();
					book_list.append('<a class="mId" data="' + AntiSqlValidate(jsonData[a].mid) + '">');
					book_list.append('<div class="book">');
					book_list.append('<div class="cover"><img data-lazyload="' + AntiSqlValidate(imgSrc) + '"/></div>');
					book_list.append('<div class="info"><h3>' + AntiSqlValidate(jsonData[a].bookname) + '</h3>');
					book_list.append('</div><!-- class="info" End -->');
					book_list.append('</div><!-- class="book" End --></a>');

					div.innerHTML = book_list.toString();
					lists.appendChild(div);
				}
			}
			(function($) {
				$(document).imageLazyload({
					placeholder: 'img/default.png'
				});
			})(mui);

			var bookDetail = ca.className("mId");
			for(var i = 0; i < bookDetail.length; i++) {
				bookDetail[i].addEventListener('tap', function() {
					var mid = this.getAttribute("data");
					//console.log(mid);
					localStorage.setItem("mid", AntiSqlValidate(mid.trim()));
					plus.storage.setItem("mid", AntiSqlValidate(mid.trim()));
					clicked("book_detail.html");
				});
			}
		}
	},
	error: function(xhr, type, errorThrown) {
		ca.closeWaiting();
	}
});