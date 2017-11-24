
// SLIDER FUNCTIONS

var rangeSlider = function(){
    var slider = $('.range-slider'),
        range = $('.range-slider__range'),
        value = $('.range-slider__value');
      
    slider.each(function(){
  
      value.each(function(){
        var value = $(this).prev().attr('value');
        $(this).html(value);
      });
  
      range.on('input', function(){
        onCanvas = false;
        $(this).next(value).html(this.value);
      });
    });
  };
  
  rangeSlider();

  // FRAMES FUNCTIONS

  // Generate the frames` buttons and add to the html
  var states = [];
  var framesInUse = [];

  var framesNumber = 50;
  for (var i=1; i<=framesNumber; i++){
      // Creates the buttons:
      var btn = document.createElement("BUTTON");
      btn.setAttribute("id", "frame"+i);
      btn.setAttribute("class", "btn-circle");
      btn.innerHTML = i;
      btn.addEventListener("click", saveFrame.bind(null, i) );
      // Saves initial position state:
      states[i] = {"quaternion":new THREE.Quaternion(),"position":new THREE.Vector3()};
      // Appends the button:
      var frame = document.getElementById("frames");
      frame.appendChild(btn);
    }

  // Save the object state at some frame  
  function saveFrame(i){
    settings();
    var used = {"bool":false,"index":-1};
    for(var j=0; j <framesInUse.length;j++){
      if(framesInUse[j] == i){
        used.bool = true;
        used.index = j;
      }
    }
    if(used.bool){
      document.getElementById("frame"+i).style.backgroundColor = "#e8eaed";
      framesInUse.splice(used.index, 1)
      states[i] = {"quaternion":new THREE.Quaternion(),"position":new THREE.Vector3()}
    }
    else{
      document.getElementById("frame"+i).style.backgroundColor = "#2ecc71";
      framesInUse.push(i);
      states[i].quaternion._x = skeleton.quaternion._x;
      states[i].quaternion._y = skeleton.quaternion._y;
      states[i].quaternion._z = skeleton.quaternion._z;
      states[i].quaternion._w = skeleton.quaternion._w;
      states[i].position = new THREE.Vector3(skeleton.position.x,skeleton.position.y,skeleton.position.z);
    }
  }

  /// Animate (interpolate) frames using lerp and slerp

  var delta;
  var frameIndex;

  function playAnimation(){
    frameIndex = 0;
    setInterval(move, 40);
  }
  
  function move(){
    var step = 0.01;
    if(delta < 1 && framesInUse[frameIndex-1] != undefined){
      delta += step;
      skeleton.position.lerp(states[framesInUse[frameIndex-1]].position,delta);
      skeleton.quaternion.slerp(states[framesInUse[frameIndex-1]].quaternion,delta);
    }
    else{
      delta = 0;
      frameIndex += 1;
    }
  }