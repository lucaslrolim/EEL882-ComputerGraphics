
/*
 * BASIC RANGE SLDIER FUNCTIONS.
 * Move the bar and get the value
 * 
 */

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


  /*
 * FRAMES FUNCTIONS.
 * Create the frame structures and also create buttons to the user interact
 * 
 */

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
      states[i].quaternion._x = object.quaternion._x;
      states[i].quaternion._y = object.quaternion._y;
      states[i].quaternion._z = object.quaternion._z;
      states[i].quaternion._w = object.quaternion._w;
      states[i].position = new THREE.Vector3(object.position.x,object.position.y,object.position.z);
    }
  }

  /// Animate (interpolate) frames using lerp and slerp


/*
 * ANIMATION FUNCTIONS
 * Functions to allow the user to create an automatic animation through the frames
 * 
 */

  var frameIndex;
  var step  = 0;
  var stop  = true;
  function playAnimation(){
    frameIndex = 0;
    setInterval(move, 30);
    stop = !stop;
  }
  
  function move(){
    if(step <= 1 && framesInUse[frameIndex-1] != undefined && !stop){
      step += 0.05;
      object.position.lerp(states[framesInUse[frameIndex-1]].position,step);
      object.quaternion.slerp(states[framesInUse[frameIndex-1]].quaternion,step);
    }
    else{
      step = 0;
      frameIndex += 1;
    }
    if(frameIndex > framesInUse.length && !stop){
      frameIndex = 0;
    }
  }

// Switch button state

  $(document).ready(function() {
    var btn = $(".button");
    btn.click(function() {
      btn.toggleClass("paused");
      return false;
    });
  });
  

/*
 * ANIMATION USING RANGE BAR FUNCTIONS
 * Create an animation according the way the user interact with the range bar
 * 
 */

setInterval(changeFrame, 40);


var lasRange = 0;
var frames = {"atMoment":-1,"next":-1}
var emptyFrames;
var n_s = 1;
var p_s = 1;

function changeFrame(){
  // sotr the state value of the range bar
  var momentRange = parseInt($('.range-slider__value').prev().attr('value'));
  // ##TODO Reverse function not working properly. Need to order this array
  framesInUse = framesInUse.sort((a, b) => a - b);
  // check if user move the range bar
  if(momentRange != lasRange){
    // store the direction the user move the range bar
    var direction;
    if(momentRange > lasRange){
      direction = 1;
    }
    else{
      direction = -1;
    }

    frames.atMoment = momentRange;
    defineNextFrame(direction);

    // If the frame is not been used the user interpolete the object to the next valid frame
    if($.inArray(momentRange, framesInUse) == -1 && frames.next != -1){
      emptyFrames = Math.abs(frames.next - frames.atMoment);
      var step = 1/emptyFrames;
      if (step <= 1){
        object.position.lerp(states[frames.next].position,step);
        object.quaternion.slerp(states[frames.next].quaternion,step);
      }
    }
    // reset temporary variables when arriving at a frame that is in use
    else{
      if(direction > 0 ){
        n_s += 1;
        ps_s = 1;
      }
      else{
        ps_s += 1;
        n_s = 1;
      }
    }
    lasRange = momentRange;
  }
}

// Define the frame that we will use to interpolate to the next position
function defineNextFrame(direction){
  var f_index;
  f_index = framesInUse.indexOf(frames.atMoment);
  // check if the range in the bar is a frame in use (f_index != -1)
  if(f_index != -1){
    // Depending on the direction, setting the next frame
    // if we are on the first or last frame in use, the next frame will be itself

    // user moves bar --->
    if(direction > 0){
      if(f_index + n_s < framesInUse.length){
        frames.next = framesInUse[f_index+n_s];
      }
      else{
        frames.next = frames.atMoment ;
      }
    }
    // user moves bar <---
    if(direction < 0){
      if(f_index - p_s > 0){
        frames.next = framesInUse[f_index-p_s];
      }
      else{
        frames.next = frames.atMoment;
      }
  }
  }
  // If we are not in a frame that is in use, we will find the next valid frame to interpolate
  else{
    if(direction > 0){
      frames.next = findIndex(1,frames.atMoment,framesInUse);
    }
    if(direction < 0 ){
      frames.next = findIndex(-1,frames.atMoment,framesInUse);
    }
    }
}


// Find the smaller frame in use bigger than the actual range on the bar (if dir == -1) or
// the smaller frame in use bigger than the actual range on the bar (if dir ==1)
function findIndex(dir,number,array){
  var ret;

  if(dir == 1){
    for(var i = 0;i < array.length;i++){
      if(array[i] > number){
        return array[i];
      }
    }
  }

  if(dir == -1){
    for(var i = 0;i < array.length;i++){
      if(array[i] > number){
        return array[i-1];
      }
    }
  }

}
