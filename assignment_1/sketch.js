var lines;
var newLine;
var lock;
var selectedPoint;
var intersections;

function setup(){
    createCanvas(window.innerWidth,window.innerHeight);
    lines = [];
    intersections = 0;
    // Uma linha, nese programa, consiste de um objeto que contém necessariamente dois pontos
    newLine = {point1:[],point2:[]};
    lock = true;
    selectedPoint = {status:false,lineIndex:null,point: null};
}

function draw(){
    background(249,249,249);
    
    // Conjunto de mensagens para facilitar a visualização do usuário sobre o desenho
    fill(255,0,0);
    text("Aperte DELETE para limpar a tela", 40, 40);
    fill(134);
    text("Número de interseções: " + intersections, window.innerWidth -300, 20);
    text("Número de retas: " + lines.length, window.innerWidth -300, 40);
    //
    
    intersections = 0;
    
    // Se lock for true é porque já começamos a desenhar uma reta e desejamos definir o seu segundo ponto
    if(!lock){
        line(newLine.point1[0],newLine.point1[1],mouseX,mouseY);
    }
    // Desenha as linhas na tela
    for(i = 0; i < lines.length; i++){
        line(lines[i].point1[0],lines[i].point1[1],lines[i].point2[0],lines[i].point2[1])
    }
    // Calcula as interseções
    for(i = 0; i < lines.length; i++){
        for(j = 0; j < lines.length; j++){
            if(i != j){
                line1 = [{x:lines[i].point1[0], y:lines[i].point1[1]},{x:lines[i].point2[0],y:lines[i].point2[1]}]
                line2 = [{x:lines[j].point1[0], y:lines[j].point1[1]},{x:lines[j].point2[0],y:lines[j].point2[1]}]
                var intersec = line_intersect(line1,line2);
                if(intersec != null){
                    // 0.5 porque essa condição será satisfeita nas duas linhas que se interceptam e irá somar 1
                    intersections += 0.5;
                    ellipse(intersec.x,intersec.y,8,8);
                }
            }
        }
    }
    
}


function mousePressed() {
    // verifica se o usuário clicou em algum ponto próximo a uma extremidade de linha existente
    nearPoint(mouseX,mouseY);
    // selectedPoint.status indica que o usuário clicou próximo a uma linha existente e selecionou uma extremidade para alterar de local
    if(selectedPoint.status && lock === true){
        // modifica a extremidade da linha selecionada
        var baseLine = [lines[selectedPoint.lineIndex].point2,lines[selectedPoint.lineIndex].point1];
        lines.splice(selectedPoint.lineIndex,1);
        newLine.point1 = baseLine[selectedPoint.point - 1];
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
    var range = 15;
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

function keyPressed() {
  if (keyCode === DELETE) {
    lines = []
  }
}

// Calcula os pontos de interseção entre duas retas

function line_intersect(line1,line2){
    
    var x1 = line1[0].x;
    var x2 = line1[1].x;
    var x3 = line2[0].x;
    var x4 = line2[1].x;
    var y1 = line1[0].y;
    var y2 = line1[1].y;
    var y3 = line2[0].y;
    var y4 = line2[1].y;
        
    var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
    if (denom == 0) {
        return null;
    }
    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
    
    var x_intersect = x1 + ua*(x2 - x1);
    var y_intersect = y1 + ua*(y2 - y1);
    
    // Verifica se o ponto encontrado está dentro de um segmento desenhado
    // vamos ordenar os pontos para tornar o processo de verificação mais simples
    max_l1_x = max(line1[0].x,line1[1].x);
    min_l1_x = min(line1[0].x,line1[1].x);
    max_l1_y = max(line1[0].y,line1[1].y);
    min_l1_y = min(line1[0].y,line1[1].y);
    max_l2_x = max(line2[0].x,line2[1].x);
    min_l2_x = min(line2[0].x,line2[1].x);
    max_l2_y = max(line2[0].y,line2[1].y);
    min_l2_y = min(line2[0].y,line2[1].y);
    

    if((x_intersect > min_l1_x  && x_intersect < max_l1_x || y_intersect > min_l1_y && y_intersect <  max_l1_y) &&
       (x_intersect > min_l2_x  && x_intersect < max_l2_x || y_intersect > min_l2_y && y_intersect <  max_l2_y )){
            return { x: x_intersect,y: y_intersect};    
    }
    else{
        return null;
    }
}