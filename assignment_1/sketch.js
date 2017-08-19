var lines;
var newLine;
var lock;
var selectedPoint;
var intersections;

function setup(){
    createCanvas(400,400);
    lines = [];
    intersections = 0;
    newLine = {point1:[],point2:[]};
    lock = true;
    selectedPoint = {status:false,lineIndex:null,point: null};
}

function draw(){
    intersections = 0;
    background(0);
    stroke(153);
    if(!lock){
        line(newLine.point1[0],newLine.point1[1],mouseX,mouseY);
    }
    for(i = 0; i < lines.length; i++){
        line(lines[i].point1[0],lines[i].point1[1],lines[i].point2[0],lines[i].point2[1])
    }
    for(i = 0; i < lines.length; i++){
        for(j = 0; j < lines.length; j++){
            if(i != j){
                line1 = [{x:lines[i].point1[0], y:lines[i].point1[1]},{x:lines[i].point2[0],y:lines[i].point2[1]}]
                line2 = [{x:lines[j].point1[0], y:lines[j].point1[1]},{x:lines[j].point2[0],y:lines[j].point2[1]}]
                var intersec = line_intersect(line1,line2);
                if(intersec != null){
                    intersections += 1;
                    // sinaliza interseções das linhas
                    fill(134);
                    ellipse(intersec.x,intersec.y,8,8);
                }
            }
        }
    }
    
}


// When the user clicks the mouse
function mousePressed() {
    console.log(intersections);
    // verifica se o usuário clicou em algum ponto próximo a uma extremidade de linah existente
    nearPoint(mouseX,mouseY);
    if(selectedPoint.status && lock === true){
        // modifica a extremidade da linha selecionada
        var baseLine = [lines[selectedPoint.lineIndex].point2,lines[selectedPoint.lineIndex].point1];
        lines.splice(selectedPoint.lineIndex,1);
        newLine.point1 = baseLine[selectedPoint.point-1];
        selectedPoint.status =false;
        lock = false;
    }
    else{
        if(lock){
            // começa a desenhar uma nova linha com o ponto clicado
            // o outro ponto da linha será a localização do mouse no momento
            newLine.point1.push(mouseX);
            newLine.point1.push(mouseY);
            lock = false;
        }
        else{
            // termina de desenhar uma linha a qual já se sabe um ponto
            newLine.point2.push(mouseX);
            newLine.point2.push(mouseY);
            lines.push(newLine);
            newLine = {point1:[],point2:[]};
            lock = true;
    }       
    }

}

// Calcula se uma das extremidades de alguma das linhas está próxima ao ponto clicado pelo mouse
// Manipula o objeto selectedPoint:
// status: false se não existe nenhum ponto perto e true se existe
// lineIndex: Index da linha a qual o ponto pertence no array lines
// point: indica qual exteminado da linha mencionado vamos querer alterar

function nearPoint(m_x,m_y){
    var range = 10;
    var dist = range;
    var pointIndex;
    for(i = 0; i < lines.length; i++){
        // dist to point 1 of line
        var t1_p1 = lines[i].point1[0] - m_x;
        var t2_p1 = lines[i].point1[1] - m_y;
        var pointDist = Math.sqrt(Math.pow((t1_p1),2)+Math.pow((t2_p1),2));
        
        if(pointDist < dist){
            dist = pointDist;
            selectedPoint.status = true;
            selectedPoint.lineIndex = i;
            selectedPoint.point = 1;
        }
           
        // dist to point 2 of line
        var t1_p2 = lines[i].point2[0] - m_x;
        var t2_p2 = lines[i].point2[1] - m_y;
        var pointDist = Math.sqrt(Math.pow((t1_p2),2)+Math.pow((t2_p2),2));
        
        if(pointDist < dist){
            dist = pointDist;
            selectedPoint.status = true;
            selectedPoint.lineIndex = i;
            selectedPoint.point = 2;
        }
            
    }
    if(dist > range){
        console.log({dist:dist,rang:range})
        selectedPoint.status = false;
    }
}


// Calcula os pontos de interseção entre duas retas
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