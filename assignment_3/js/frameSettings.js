
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
      states[i] = new THREE.Vector4();
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
      states[i] = new THREE.Vector4();
    }
    else{
      document.getElementById("frame"+i).style.backgroundColor = "#2ecc71";
      framesInUse.push(i);
      states[i] = skeleton.position;
    }
    console.log(framesInUse);
  }