(function(){


  var frecuencia = document.getElementById('frecuencia');

  var canvas = document.getElementById('tablero');
  var tono = document.getElementById('tono');
  var ctx = canvas.getContext('2d');
  ctx.mozImageSmoothingEnabled = true;
  ctx.webkitImageSmoothingEnabled = true;
  ctx.msImageSmoothingEnabled = true;
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = "rgb(255, 117, 020)";
  //constante para inicializar el microfono
  var CONSTRAINTS = {
    "audio": {
        "mandatory": {
            "googEchoCancellation": "false",
            "googAutoGainControl": "false",
            //"googNoiseSuppression": "false",
            "googHighpassFilter": "false"
        },
        "optional": []
    }
  };
  //constantes para mostrar las notas
  var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  //crea bufer para procesar una mustra de datos y la extencion de el buffer
  var buflen = 1024;
  var buf = new Float32Array( buflen );
  //define la clase qie maneja el flijo de el sonido
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  var analyser;

  navigator.mediaDevices.getUserMedia(CONSTRAINTS)
  .then(function(mediaStream) {
    mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    mediaStreamSource.connect( analyser );
    analyser.connect(audioContext.destination);
    showData();
   })
  .catch(function(error) { console.log(error);})

  //funcion que nos permite diferenciar la pereosidad y frecuencia
  function autoCorrelacion( buf, sampleRate ) {
  var MIN_SAMPLES = 0;
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i])-(buf[i+offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation>0.9) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {

			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		return sampleRate/best_offset;
	}
	return -1;

}




function notaProny( frequency ) {
	var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
	return Math.round( noteNum ) + 69;
}






  var tem = 0 ;
  function showData(){
    analyser.getFloatTimeDomainData( buf );
    ac = autoCorrelacion(buf, audioContext.sampleRate);

    tem = ac;
    //console.log(ac);
    if (ac != -1){
      nota = notaProny(ac)
      tono.innerHTML = noteStrings[nota%12];
      frecuencia.innerHTML = Math.floor(ac) + ' Hz';
      ctx.clearRect(0, 0,400, 20);
      ctx.fillRect(0,0,nota,400)
    }
	  rafID = window.requestAnimationFrame( showData );
  };


})();
