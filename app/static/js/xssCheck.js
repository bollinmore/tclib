//URL地址防注入
function locationProtect() {
	//过滤URL非法SQL字符
	var sUrl = location.search.toLowerCase();
	var sQuery = sUrl.substring(sUrl.indexOf("=") + 1);
	re = /select|update|delete|truncate|join|union|exec|insert|drop|count|'|"|;|>|<|%/i;
	if(re.test(sQuery)) {
//		alert("请勿输入非法字符");
		location.href = sUrl.replace(sQuery, "");
	}
}

function urlProtect(sUrl) {
	var sQuery = sUrl.substring(sUrl.indexOf("=") + 1);
	re = /select|update|delete|truncate|join|union|exec|insert|drop|count|'|"|;|>|<|%/i;
	if(re.test(sQuery)) {
//		alert("请勿输入非法字符");
		sUrl = sUrl.replace(sQuery, "");
	}
	return sUrl;
}
//输入文本
function AntiSqlValid(oField) {
	re = /select|update|delete|exec|count|'|"|=|;|>|<|%/i;
	if(re.test(oField)) {
		oField = "";
//		alert("请您不要在参数中输入特殊字符和SQL关键字！"); //注意中文乱码
		return false;
	}
}

function AntiSqlValidate(value) {
	AntiSqlValid(value);
	return filterXSS(value);
}
