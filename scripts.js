var ctx = document.getElementById("canvas1").getContext("2d");
var grd = ctx.createLinearGradient(0, 0, 500, 0);
grd.addColorStop(0, "rgb(0,0,200)");
grd.addColorStop(1, "rgb(255,255,255)");
ctx.strokeStyle = grd;

var canvas = document.getElementById("canvas1");
canvas.width = window.innerWidth;
canvas.length = window.innerLength;

window.onresize = function() {
 canvas.width = window.innerWidth;
 canvas.length = window.innerLength;
}


canvas.addEventListener("click", function(event) {
 getCursorPosition(document.getElementById("canvas1"), event);
}, false);

var constants = {
 maxObj: 100,
 maxLevels: 25,
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

function drawOrbiter(){
 for (var i = 0; i < constants.maxObj; i++){
  if (orbiters[i].alive){
   if (target==i) ctx.fillStyle = "rgba(0,200,0,0.5)";
   else ctx.fillStyle = "rgba(0,0,200,0.5)";
   ctx.beginPath();
   ctx.arc(orbiters[i].x, orbiters[i].y, 3, 0, Math.PI * 2, true);
   ctx.fill();
   if (orbiters[i].center > -1 && line) {
    ctx.strokeStyle = "rgba(0,0, 200, 0.2)";
    ctx.moveTo(orbiters[i].x, orbiters[i].y);
    ctx.lineTo(orbiters[orbiters[i].center].x, orbiters[orbiters[i].center].y);
    ctx.stroke();
   }
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
	    insert.firstChild.id = i + j + "-c";
     if (j == "rad" || j == "vel"){
		    insert.appendChild(document.createElement("INPUT"));
		    insert.lastChild.id = i + j;
		    insert.lastChild.type = "text";
		    insert.lastChild.size = 10;
		    insert.lastChild.style.position = "relative";
		    insert.lastChild.style.bottom = "0px";
		    insert.lastChild.style.display = "none";
		   } else if (j == "acw"){
		    insert.appendChild(document.createElement("BUTTON"));
		    insert.lastChild.appendChild(document.createTextNode("Toggle"));
		    insert.lastChild.id = i + j;
		    insert.lastChild.addEventListener("click", function() {
		     var select = i;
		     toggleDir(select);
		    }, false);
		    insert.lastChild.className = "btn btn-sm btn-danger";
		    insert.lastChild.style.position = "relative";
		    insert.lastChild.style.bottom = "0px";
		    insert.lastChild.style.display = "none";
		   }
    }
   }
   insert = row.insertCell(-1); //for Options
   row.addEventListener("click", function(event) {
    var select = i;
    var arr = [].slice.call(this.children);
    if (arr.indexOf(event.target) > -1) modify(select);
   }, false);
   var btn;/*
   btn = document.createElement("BUTTON");
   btn.addEventListener("click", function() {
    var select = i;
    modify(select);
   }, false);
   btn.id = i + "-btnmod";
   btn.className = "btn btn-sm btn-default";
   btn.appendChild(document.createTextNode("Modify"));
   insert.appendChild(btn);
   */
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
 var modList = ["rad", "vel", "acw"];
 for (var i = 0; i < modList.length; i++){
  document.getElementById(select + modList[i]).style.display = "inline";
  document.getElementById(select + modList[i]).value = orbiters[select][modList[i]];
 }
 document.getElementById(select + "-row").style.background = "rgba(0,0,200,0.3)";
}

function hideMod(select){
 var modList = ["rad", "vel", "acw"];
 for (var i = 0; i < modList.length; i++){
 document.getElementById(select + modList[i]).style.display = "none";
 changeProperty(select, modList[i]);
 }
 document.getElementById(select + "-row").style.background = "";
}

function changeProperty(select, property){
	if(property != "acw"){
	 var input = document.getElementById(select + property);
	 var pass = true;
	 
	 /*if (property == "center" && orbiters[select].center != input.value) {
	  if (orbiters[select].level > 0){
		  if (input.value > -1 && input.value < constants.maxObj) {
		   if (orbiters[input.value].alive){
		   }
		    else {
		    alert("Cannot assign to a non-existant orbiter");
		    pass = false;
		   }
		  } else {
		   alert("Invalid center id: select from 0 to " + constants.maxObj);
		   pass = false;
		  }
		 }
	 }*/
	 
	 if (property == "rad") {
	  if (input.value < 0) {
	   alert("Radius too small. Positive numbers only.");
	   pass = false;
	  } else if (input.value > 100000) {
	   alert("Radius too large! Try numbers below 100000");
	   pass = false;
	  }
	 }
	 
	 if (property == "vel"){
	  if (input.value < 0){
	   alert("No negative velocities allowed (in this app). Try reversing the direction instead");
	   pass = false;
	  } else if (input.value > 359){
	   alert("Too fast! Velocity unchanged.");
	   pass = false;
	  }
	 }
	 
	 if (pass){
		 /*if (property == "center" && orbiters[select].center != input.value) {
		 adjustLevels(select, input.value); 
		 }*/
	  orbiters[select][property] = input.value; 
	  input.previousSibling.nodeValue = input.value;
	 }
 }
}

function toggleDir(select){
 orbiters[select].acw = !orbiters[select].acw;
 document.getElementById(select + "acw").previousSibling.nodeValue = orbiters[select].acw;
}

function getCursorPosition(canvas, event) {
 var rect = canvas.getBoundingClientRect();
 var x = event.clientX - rect.left;
 var y = event.clientY - rect.top;
 var dist;
 if (target > -1){
 var xd = Math.abs(orbiters[target].x - x);
 var yd = Math.abs(orbiters[target].y - y);
  dist = Math.sqrt(xd*xd + yd*yd).toFixed(2);
  reviveOrbiter(x,y,2, true, target, orbiters[target].level + 1, dist);
 } else {
  reviveOrbiter(x,y,1, true, -1, 0, 50);
 }
}

function adjustLevels(id, destination){
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


		while (hitList.length > 0){
		 traverser = hitList.pop();
		 alert(traverser + " " + destination);
		 //this level += destination - firstattached + 1
		 orbiters[traverser].level += orbiters[destination].level - orbiters[id].level + 1;
 //document.getElementById(traverser + "level-c").nodeValue = orbiters[traverser].level;
		}
		dbgPrintProperty("level");
	} else {
	}
}

function dbgPrintProperty (property){
 var print = property;
 for (var i = 0; i < constants.maxObj; i++){
  if (orbiters[i].alive) print = print + orbiters[i][property];
 }
 alert(print);
}

var fade = true;
var line = true;

function toggleFade () {
 fade = !fade;
}

function clearScreen () {
 ctx.clearRect(0,0,canvas.width, canvas.height)
}

function toggleLine () {
 line = !line;
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
  ctx.fillStyle = "rgba(255,255,255, 0.1)";
  if (fade) ctx.fillRect(0,0,canvas.width,canvas.height);
  drawOrbiter();
 }
}

setInterval(looper, 0);
