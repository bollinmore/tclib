mui.plusReady(function() {
$('.voice').on('click', function(e) {


		if(plus.os.name == "Android") {
				e.preventDefault();
        		e.stopPropagation();
			startRecognizeSpeech();

		}

	});
	function startRecognizeSpeech() {
		try {
			var RecognizerIntent = plus.android.importClass("android.speech.RecognizerIntent");
			var SpeechRecognizer = plus.android.importClass("android.speech.SpeechRecognizer");
			var activity = plus.android.runtimeMainActivity();
			var Intent = plus.android.importClass("android.content.Intent");
			var intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
			intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
			intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "請說話...");
			intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
			activity.startActivityForResult(intent, 1);
			activity.onActivityResult = function(requestCode, resultCode, data) {
				if(requestCode == 1 && resultCode == -1) {
					plus.android.importClass(data);
					var result = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
					document.getElementById("keyword").value=result.toString().slice(1,-1);
					//jQuery('.input[name="keyword"]').val(result.toString().slice(1,-1));
				} else {
				}
			}
		} catch(e) {
			alert(e);
		}
	}
});