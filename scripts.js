var ctx = document.getElementById("canvas1").getContext("2d");
var grd = ctx.createLinearGradient(0, 0, 500, 0);
grd.addColorStop(0, "rgb(0,0,200)");
grd.addColorStop(1, "rgb(255,255,255)");
ctx.strokeStyle = grd;

document.getElementById("canvas1").addEventListener("click", function(event) {
 getCursorPosition(document.getElementById("canvas1"), event);
}, false);

var constants = {
 maxObj: 100,
 maxLevels: 5,
 frametime: 20,
 thelta: Math.PI * 5/ 4
};


function Orbiter(){
 this.center = -1; //id of center
 this.x = 0;
 this.y = 0;
 this.rad = 0; //radius
 this.vel = 0; //degrees per frame
 this.acw = false; //false for clockwise
 /*
 How far away an orbiter is from a 
 stationary object.
 0 means it is the stationary object.
 */
 this.level = 0;
 this.angle = 0; //in degrees
 this.alive = 0; //object pool flag
 }


var orbiters = [];

function makeOrbiterPool(){
 var obj;
 for (var i = 0; i < constants.maxObj; i++){
  obj = new Orbiter();
  orbiters.push(obj);
  }
} //i think 100 is enough

makeOrbiterPool();


//Done so far
function updateOrbiters(){
 for (var j = 1; j  < constants.maxLevels; j++){
 //start at 1 because 0 is stationary
  for (var i = 0; i < constants.maxObj; i++){
   if (orbiters[i].alive && j==orbiters[i].level){
    //do updates
    if (orbiters[i].acw){ orbiters[i].angle -= orbiters[i].vel; }
    else { orbiters[i].angle += orbiters[i].vel; }
    
    if (orbiters[i].angle > 360 || orbiters[i].angle < -360) orbiters[i].angle %= 360;
    
    orbiters[i].x = orbiters[orbiters[i].center].x + orbiters[i].rad * Math.cos(orbiters[i].angle * Math.PI / 180);
    orbiters[i].y = orbiters[orbiters[i].center].y + orbiters[i].rad * Math.sin(orbiters[i].angle * Math.PI / 180);
    var tr = document.getElementById(i + "-row");
    tr.cells[2].firstChild.nodeValue = orbiters[i].x.toFixed(2);
    tr.cells[3].firstChild.nodeValue = orbiters[i].y.toFixed(2);
    tr.cells[8].firstChild.nodeValue = orbiters[i].angle.toFixed(1);
    //alert("x: " + orbiters[i].x +  "y: " + orbiters[i].y + "a: " + orbiters[i].angle);
    }
  }
 }
}

function drawMovingOrbits(){
 ctx.beginPath();
 for (var i = 0; i < constants.maxObj; i++){
  if (orbiters[i].alive && orbiters[i].level > 0){
   if(orbiters[i].acw) var deltangle = (orbiters[i].angle * Math.PI / 180) + constants.thelta; 
   else var deltangle = (orbiters[i].angle * Math.PI / 180) - constants.thelta;
   
 if (i > 0) ctx.moveTo(orbiters[i].x, orbiters[i].y);

  ctx.arc(orbiters[orbiters[i].center].x, orbiters[orbiters[i].center].y, orbiters[i].rad,  orbiters[i].angle * Math.PI / 180, deltangle, !orbiters[i].acw);
  }
 }
 ctx.stroke();
}

function drawOrbiter(){
 for (var i = 0; i < constants.maxObj; i++){
  if (orbiters[i].alive){
   if (target==i) ctx.fillStyle = "rgba(0,200,0,0.5)";
   else ctx.fillStyle = "rgba(0,0,200,0.5)";
   ctx.beginPath();
   ctx.arc(orbiters[i].x, orbiters[i].y, 3, 0, Math.PI * 2, true);
   ctx.fill();
   if (orbiters[i].center > -1) {
    ctx.strokeStyle = "rgba(0,0, 200, 0.2)";
    ctx.moveTo(orbiters[i].x, orbiters[i].y);
    ctx.lineTo(orbiters[orbiters[i].center].x, orbiters[orbiters[i].center].y);
   }
   ctx.stroke();
  }
 }
}

function killOrbiter(id){
 if (orbiters[id].alive){
	 var traverser;
	 var hitList = [];
	 //store id and all dependent orbiters to the hitlist
		 for (var i = 0; i < constants.maxObj; i++){
		  if (orbiters[i].alive){
		   if (i == id){
		    hitList.push(i);
		   } else {
		    traverser = i;
		    
		    while (traverser > -1){
		     if (traverser == id){
		      hitList.push(i);
		      traverser = -1;
		  		 } else {
		  		  traverser = orbiters[traverser].center;
		  		 }
		    }
		    
		   } 
		  }
		 }
		//eliminate all orbiters in the hitlist
		alert(hitList);
		while (hitList.length > 0){
		 traverser = hitList.pop();
		 orbiters[traverser].alive = 0;
   document.getElementById("orbiters").deleteRow(document.getElementById(traverser + "-row").rowIndex-1);
   //maybe i should get jquery...
		}
		target = -1;
		
	} else {
	 alert("What is dead may never die. Unable to kill because Orbiter ID[" + id + "] is not alive.");
	}
}

function reviveOrbiter(x, y, vel,acw,center,level,rad){
 for (var i = 0; i < constants.maxObj; i++){
  if (!orbiters[i].alive){
   //revive with properties
   orbiters[i].center = center;
   orbiters[i].alive = 1;
   orbiters[i].vel = vel;
   orbiters[i].acw = acw;
   orbiters[i].level = level;
   orbiters[i].rad = rad;
	  orbiters[i].x = x;
	  orbiters[i].y = y;
   
   
   if(center > -1){
    orbiters[i].angle =  Math.acos((orbiters[i].x-orbiters[center].x)/rad) * 180 / Math.PI;
    if (orbiters[i].y < orbiters[center].y) orbiters[i].angle *= -1;
	  } else {
	   orbiters[i].angle = 0;
	  }
   
   
   var table = document.getElementById("orbiters");
   var row = table.insertRow(-1);
   row.id = i + "-row";
   var insert = row.insertCell(-1); //for ID
   insert.innerHTML = i;
   var obj = orbiters[i];
   for (var j in obj){
    if (j != "alive") {
	    insert = row.insertCell(-1);
	    insert.appendChild(document.createTextNode(obj[j]));
     if (j == "center" || j == "rad" || j == "vel"){
		    insert.appendChild(document.createElement("INPUT"));
		    insert.lastChild.id = i + j;
		    insert.lastChild.type = "text";
		    insert.lastChild.style.display = "none";
		    insert.lastChild.addEventListener("keyDown", function(event) {
		     var select = i;
		     var property = j;
		     if (event.keyCode == 13) changeProperty(select, property);
		    }, false);
		   } else if (j == "acw"){
		    insert.appendChild(document.createElement("BUTTON"));
		    insert.lastChild.id = i + j;
		    insert.lastChild.addEventListener("click", function() {
		     var select = i;
		     toggleDir(select);
		    }, false);
		    insert.lastChild.className = "btn btn-sm btn-warning";
		    insert.lastChild.style.display = "none";
		   }
    }
   }
   insert = row.insertCell(-1); //for Options
   
   var btn;
   btn = document.createElement("BUTTON");
   btn.addEventListener("click", function() {
    var select = i;
    modify(select);
   }, false);
   btn.id = i + "-btnmod";
   btn.className = "btn btn-sm btn-default";
   btn.appendChild(document.createTextNode("Modify"));
   insert.appendChild(btn);
   
   btn = document.createElement("BUTTON");
   btn.addEventListener("click", function() {
    var select = i;
    killOrbiter(select);
   }, false);
   btn.id = i + "-btnkill";
   btn.className = "btn btn-sm btn-warning";
   btn.appendChild(document.createTextNode("Kill"));
   insert.appendChild(btn);
   
   return i;
  }
 }
 alert("Max number of objects exceeded! Delete an orbiter first!");
}

function modify(select){
 if (target == -1){ //case 1: no current target
  target = select;
  showMod(select);
 } else {
  if (target == select){ //case 2: selection is already targeted
  target = -1;
  hideMod(select);
  } else { //case 3: currently selected different from previously selected
  hideMod(target);
  target = select;
  showMod(select);
  }
 }
}

function showMod(select){
 var modList = ["center", "rad", "vel", "acw"];
 for (var i = 0; i < modList.length; i++){
  document.getElementById(select + modList[i]).style.display = "inline";
 }
 document.getElementById(select + "-row").style.background = "rgba(0,0,200,0.3)";
}

function hideMod(select){
 var modList = ["center", "rad", "vel", "acw"];
 for (var i = 0; i < modList.length; i++){
 document.getElementById(select + modList[i]).style.display = "none";
 }
 document.getElementById(select + "-row").style.background = "";
}

function changeProperty(select, property){
 var value = document.getElementById(select + property).value;
 orbiters[select][property] = value;
}

function toggleDir(select){
 orbiters[select].acw = !orbiters[select].acw;
}

function getCursorPosition(canvas, event) {
 var rect = canvas.getBoundingClientRect();
 var x = event.clientX - rect.left;
 var y = event.clientY - rect.top;
 var dist;
 if (target > -1){
 var xd = Math.abs(orbiters[target].x - x);
 var yd = Math.abs(orbiters[target].y - y);
  dist = Math.sqrt(xd*xd + yd*yd);
  reviveOrbiter(x,y,2, true, target, orbiters[target].level + 1, dist);
 } else {
  reviveOrbiter(x,y,1, true, -1, 0, 10);
 }
}

 ctx.fillStyle = "rgb(0,200,0)";
 ctx.fillRect(10,10,50,50);
 ctx.fillStyle = "rgba(0,0,200,0.5)";
 ctx.fillRect(40,40,50,50);

var target = -1;
/*

var id = reviveOrbiter(1, true, -1, 0, 5);

reviveOrbiter(2.22, false, id, orbiters[id].level + 1, 200);

id = reviveOrbiter(1.68, true, id, orbiters[id].level + 1, 80);


id = reviveOrbiter(3.14, false, id, orbiters[id].level + 1, 130);

id = reviveOrbiter(0.2, false, id, orbiters[id].level + 1, 100);

id = reviveOrbiter(5, true, id, orbiters[id].level + 1, 800);

*/
var last = Date.now();
var now, delta;

function looper(){
 now = Date.now();
 delta = now - last;
 if (delta > constants.frametime){
  last = Date.now(); 
  updateOrbiters();
  //ctx.clearRect(0,0,800,800);
  ctx.fillStyle = "rgba(255,255,255, 0.1)";
  ctx.fillRect(0,0,800,800);
  drawOrbiter();
  //drawMovingOrbits();
 }
}

setInterval(looper, 0);
