
(function(){

  var tem = [] ;
  var time = 0;
  var canvas = document.getElementById('tablero');
  var tono = document.getElementById('tono');
  var vel = document.getElementById('velocidad');
  var boton = document.getElementById('boton');
  boton.addEventListener("click", velocidad);
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
            "googNoiseSuppression": "false",
            "googHighpassFilter": "false"

        },'opciones':[]
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

  function velocidad(){
    tem = [];
    time = Date.now();
    showData();

  }


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
		correlations[offset] = correlation; // store it, forhttps://developer.mozilla.org/es/search?q=math+javascrit the tweaking we need to do below.
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







  var draw = 0 ;
  function showData(){

    if(time + 1000 > Date.now()){
      analyser.getFloatTimeDomainData( buf );
      ac = autoCorrelacion(buf, audioContext.sampleRate);

      tem.push(ac);
      draw = (time + 990 - Date.now())/5
      ctx.clearRect(0, 0,400, 20);
      ctx.fillRect(0,0,draw,400)
      //console.log(ac);
      //console.log(ac);
      rafID = window.requestAnimationFrame( showData );
    }else {


      for (var i = tem.length - 1; i >= 0 ; i--) {
        if (tem[i] === -1 || tem[i] > 1000 || tem[i] < 200)
        tem.splice(i,1);
      }
      console.log(tem);
      var min = Math.min.apply(null, tem),
          max = Math.max.apply(null, tem);
      //console.log(tem,min,max);
      var velo = Math.floor(((max/min)*340 - 340) / ((max/min) + 1 ))

      vel.innerHTML = velo;

    }
  };


})();
