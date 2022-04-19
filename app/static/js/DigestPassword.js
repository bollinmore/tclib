function decimalToHexString(number) {
		if(number < 0) {
			number = 0xFFFFFFFF + number + 1;
		}

		return number.toString(16).toUpperCase();
	}
	//以下是md加密
	function byteArray_md5(s) {
		var output = [];
		var input = rstr_md5(s); //here it uses md5.js
		for(var i = 0; i < input.length; i++) {
			output[i] = input.charCodeAt(i);
		}
		return output;
	};

	//以下這是轉btype的語法
	function toUTF8Array(str) {
		var utf8 = [];
		for(var i = 0; i < str.length; i++) {
			var charcode = str.charCodeAt(i);
			if(charcode < 0x80) utf8.push(charcode);
			else if(charcode < 0x800) {
				utf8.push(0xc0 | (charcode >> 6),
					0x80 | (charcode & 0x3f));
			} else if(charcode < 0xd800 || charcode >= 0xe000) {
				utf8.push(0xe0 | (charcode >> 12),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f));
			}
			// surrogate pair
			else {
				i++;
				// UTF-16 encodes 0x10000-0x10FFFF by
				// subtracting 0x10000 and splitting the
				// 20 bits of 0x0-0xFFFFF into two halves
				charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
					(str.charCodeAt(i) & 0x3ff));
				utf8.push(0xf0 | (charcode >> 18),
					0x80 | ((charcode >> 12) & 0x3f),
					0x80 | ((charcode >> 6) & 0x3f),
					0x80 | (charcode & 0x3f));
			}
		}
		return utf8;
	}
	
	//以下是md5後的特殊處理！
	 function DigestPassword(str) {
	  var digest = byteArray_md5(str);
	  //  var digest = toUTF8Array(codess);
	  //console.log("digest" + digest);
	  var result = [];
	  var result2 = [];
	  for(var i = 0; i < digest.length; i++) {
	   //  var t=intFromBytes( -93 + 128);
	   var x = digest[i] + 128;
	   if(x > 256) {
	    x = x - 256;
	   }
	   if(x==256) {
	    x=0
	   }
	   //console.log('xxxx' + x);
	   ////78,85,120,111,109,101,81,51,52,82,101,73,103,194,163,104,99
	   ///前處理
	   if(x < 16) {
	    result.push('0');
	   }
	   result.push(
	    //   x.toString(16)
	    decimalToHexString(x).toLocaleLowerCase()
	   );
	  }
	  return result.join(''); //最後加密結果
	 };