document.addEventListener( "plusready",  function() {
                          if(plus.os.name == "iOS"){
                          
                          // 声明的JS“扩展插件别名”
                          var _BARCODE = 'SpeechIdent',
                          B = window.plus.bridge;
                          var SpeechIdent = {
                          SpeechInit : function (successCallback, errorCallback ) {
                          var success = typeof successCallback !== 'function' ? null : function(args) {
                          successCallback(args);
                          },
                          fail = typeof errorCallback !== 'function' ? null : function(code) {
                          errorCallback(code);
                          };
                          callbackID = B.callbackId(success, fail);
                          // 通知Native层plugintest扩展插件运行”PluginTestFunction”方法
                          return B.exec(_BARCODE, "SpeechInit", [callbackID]);
                          },
                          SpeechStop : function (Argus1, successCallback, errorCallback ) {
                          var success = typeof successCallback !== 'function' ? null : function(args) {
                          successCallback(args);
                          },
                          fail = typeof errorCallback !== 'function' ? null : function(code) {
                          errorCallback(code);
                          };
                          callbackID = B.callbackId(success, fail);
                          // 通知Native层plugintest扩展插件运行”PluginTestFunction”方法
                          return B.exec(_BARCODE, "SpeechStop", [callbackID]);
                          }
                          ,
                          SpeechStart : function (Argus1, successCallback, errorCallback ) {
                          var success = typeof successCallback !== 'function' ? null : function(args) {
                          successCallback(args);
                          },
                          fail = typeof errorCallback !== 'function' ? null : function(code) {
                          errorCallback(code);
                          };
                          callbackID = B.callbackId(success, fail);
                          // 通知Native层plugintest扩展插件运行”PluginTestFunction”方法
                          return B.exec(_BARCODE, "SpeechStart", [callbackID]);
                          }
                          ,
                          gotosetting : function (Argus1, successCallback, errorCallback ) {
                          var success = typeof successCallback !== 'function' ? null : function(args) {
                          successCallback(args);
                          },
                          fail = typeof errorCallback !== 'function' ? null : function(code) {
                          errorCallback(code);
                          };
                          callbackID = B.callbackId(success, fail);
                          // 通知Native层plugintest扩展插件运行”PluginTestFunction”方法
                          return B.exec(_BARCODE, "gotosetting", [callbackID]);
                          }
                          };
                          window.plus.SpeechIdent = SpeechIdent;
                          
                          
                          
                          }
                          }, true );


// 是否支持指纹识别
function SpeechInitial(aa) {
    document.getElementById( 'keyword' ).focus();

   
                            
//                               if(result==3)
//                                {
//

    

                                
            plus.SpeechIdent.SpeechInit(function( result ) {
                                
                                        
                                        
                                        if(result==3){/////3
                                        var btnArray = ['取消', '前往設定'];
                                        
                                        mui.confirm('內建語音輸入功能\n請點選鍵盤上之麥克風按鈕即可使用。\n如未開啟，點選『前往設定』，開啟聽寫功能。', '語音輸入', btnArray, function(e) {
                                                    if(e.index==0)
                                                    {
                                                    //startEngine()
                                                    
                                                    }
                                                    else{
                                                    plus.SpeechIdent.gotosetting(function( result ) {},
                                                                                 function( result ) {});
                                                    }
                                                    
                                                    });
                                        }
                                        
                                else if(result==1)
                                {
                                //document.getElementById( 'keyword' ).blur();

                                
                                        startEngine();
                                
                                }
                                else{
                                document.getElementById( 'keyword' ).blur();

                                    var btnArray = ['取消', '前往設定'];

                                    mui.confirm('語音輸入未授權。', '語音輸入', btnArray, function(e) {
                                            if(e.index==0)
                                            {
                                            
                                            }
                                            else{
                                                plus.runtime.openURL('app-settings:root');
                                            }
      
                                     });
                                }
                                
                                
                                
                                
                                
                                
                                            },
                                            function(result){
                                            //alert(result)
                                            });
    //startEngine();

}



// 是否支持指纹识别
function startEngine() {
    
/*    mui.alert('請開始說話，說話完畢後，點選確定。', function(e) {
              //  if(e.index==0)
               // {
                //startEngine()
              stopEngine();
                //}
              
                
                });*/
    
    //alert('tset');
   /* plus.nativeUI.alert('請開始說話，說話完畢後，點選確定。', function(e) {
                        //  if(e.index==0)
                        // {
                        //startEngine()
                        stopEngine();
                        //}
                        
                        
                        }, "close", "ok");*/

    
    
    
    plus.SpeechIdent.SpeechStart( function( result ) {
                                 
                                         },
                                         function(result){
                                 
                                 
                                 //alert('erre'+data.speechresult);

                                 if(result!='error') {
                                 document.getElementById( 'keyword' ).value=result;
                                 }
                                 
                                 
                                         });
}


function stopEngine() {
    plus.SpeechIdent.SpeechStop( function( result ) {

                                 },
                                 function(result){
                                if(result!='error') {
                                document.getElementById( 'keyword' ).value=result;
                                } else {
                                //alert('擷取語音錯誤');
                                
                                ////alert( '掃描失敗，原因：'+data.error);
                                /////alert('erre'+data.data);
                                
                                }
                                
                                 
                                 });
}
