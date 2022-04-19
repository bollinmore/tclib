document.addEventListener( "plusready",  function()
{
    var _BARCODE = 'pluginPwd',
		B = window.plus.bridge;
    var pluginPwd = 
    {
		PluginPwdFuncArrayArgu : function (Argus, successCallback, errorCallback ) 
		{
			var success = typeof successCallback !== 'function' ? null : function(args) 
			{
				successCallback(args);
			},
			fail = typeof errorCallback !== 'function' ? null : function(code) 
			{
				errorCallback(code);
			};
			callbackID = B.callbackId(success, fail);
			return B.exec(_BARCODE, "PluginPwdFuncArrayArgu", [callbackID, Argus]);
		}
    };
    window.plus.pluginPwd = pluginPwd;
}, true );