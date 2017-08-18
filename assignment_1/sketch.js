var lines;
var newLine;
var lock;
var selectPoint;
function setup(){
    createCanvas(400,400);
    lines = [];
    newLine = {point1:[],point2:[]};
    lock = true;
    selectPoint = false;
}

function draw(){
    background(0);
    stroke(153);
    if(!lock){
        line(newLine.point1[0],newLine.point1[1],mouseX,mouseY);
    }
    for(var i = 0; i < lines.length; i++){
        line(lines[i].point1[0],lines[i].point1[1],lines[i].point2[0],lines[i].point2[1])
    }
    for(var i = 0; i < lines.length; i++){
        for(var j = 0; j < lines.length; j++){
            if(i != j){
                line1 = [{x:lines[i].point1[0], y:lines[i].point1[1]},{x:lines[i].point2[0],y:lines[i].point2[1]}]
                line2 = [{x:lines[j].point1[0], y:lines[j].point1[1]},{x:lines[j].point2[0],y:lines[j].point2[1]}]
                var intersec = line_intersect(line1,line2);
                if(intersec != null){
                    ellipse(intersec.x,intersec.y,5,5);
                }
            }
        }
    }
    //ellipse(100,100,10,10);
    
}


// When the user clicks the mouse
function mousePressed() {
    if(selectPoint){
        console.log("TODO");
    }
    else{
         if(lock){
            newLine.point1.push(mouseX);
            newLine.point1.push(mouseY);
            lock = false;
        }
        else{
            newLine.point2.push(mouseX);
            newLine.point2.push(mouseY);
            lines.push(newLine);
            newLine = {point1:[],point2:[]};
            lock = true;
    }       
    }

}

// range on click

//function clickRange(m_x,m_y,x,y){
//    var dist = sqrt(Math.pow(m_x - x) + Math.pow(m_y - y))
//    if(dist < 20){
//       return dist;
//    }
//    else{
//        return -1;
//    }
//}
//
//function checkMinimunDist(m_x,m_y){
//    var point = {index:-1,dist:-1};
//    var dist = clickRange(m_x,m_y,lines[0].point1[0],lines[0].point1[1]);
//    for(var i = 0; i < lines.length; i++){
//        if(clickRange(m_x,m_y,lines[i].point1[0],lines[i].point1[1])){
//        }
//    }
//}



function line_intersect(a,b){
    a.m = (a[0].y-a[1].y)/(a[0].x-a[1].x);  // slope of line 1
    b.m = (b[0].y-b[1].y)/(b[0].x-b[1].x);  // slope of line 2
    var x_intersect = (a.m * a[0].x - b.m*b[0].x + b[0].y - a[0].y) / (a.m - b.m)
    var y_intersect = (a.m*b.m*(b[0].x-a[0].x) + b.m*a[0].y - a.m*b[0].y) / (b.m - a.m)
    
    if((x_intersect > a[0].x && x_intersect < a[1].x || y_intersect > a[0].y && y_intersect < a[1].y) &&
       (x_intersect > b[0].x && x_intersect < b[1].x || y_intersect > b[0].y && y_intersect < b[1].y )){  
            return a.m - b.m < Number.EPSILON ? undefined
                                    : { x: x_intersect,
                                        y: y_intersect};    
    }
    else{
        return null;
    }

}