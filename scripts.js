//Set up default drawing colors.

var ctx = $("#canvas1")[0].getContext("2d");
var grd = ctx.createLinearGradient(0, 0, 500, 0);
grd.addColorStop(0, "rgb(0,0,200)");
grd.addColorStop(1, "rgb(255,255,255)");
ctx.strokeStyle = grd;

//Adjust size and resize canvas according to window

$("#canvas1").attr("width", $(window).attr("innerWidth"));
$("#canvas1").attr("length", $(window).attr("innerLength"))

$(window).resize(function() {
 $("#canvas1").attr("width", $(window).attr("innerWidth"));
 $("#canvas1").attr("length", $(window).attr("innerLength"));
})

var canvas = $("#canvas1")[0]; //so that there's not too much jquery

//
// document.addEventListener("keypress", function (event) {
//   toggleTable(document, )
// }, false);

$("#canvas1").click(function(e) {
 getCursorPosition($("#canvas1")[0], e);
});

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
}

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
    var tr = $("#" + i + "-row")[0];
    //just update the values in the table to reflect changes
    //this is a bad way to do this?
    tr.cells[2].firstChild.nodeValue = orbiters[i].x.toFixed(2);
    tr.cells[3].firstChild.nodeValue = orbiters[i].y.toFixed(2);
    tr.cells[5].firstChild.nodeValue = orbiters[i].vel.toFixed(2);
    tr.cells[8].firstChild.nodeValue = orbiters[i].angle.toFixed(1);
    }
  }
 }
}

//called in draw loop
function drawOrbiter(){
 for (var i = 0; i < constants.maxObj; i++){
  if (orbiters[i].alive){
   if (targetrow == i) ctx.fillStyle = "rgba(0,200,0,0.5)"; //selection indicator
   else ctx.fillStyle = "rgba(0,0,200,0.5)";
   if (dots){
   ctx.beginPath();
   ctx.arc(orbiters[i].x, orbiters[i].y, 3, 0, Math.PI * 2, true);
   ctx.fill();
   ctx.stroke();
  }
   //creates the line that joins an orbiter to its center
   if (orbiters[i].center > -1 && line) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,0, 200, 0.2)";
    ctx.moveTo(orbiters[i].x, orbiters[i].y);
    ctx.lineTo(orbiters[orbiters[i].center].x, orbiters[orbiters[i].center].y);
    ctx.stroke();
   }
  }
 }
}

//kills the orbiter and all dependent orbiters
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
		console.log(hitList);
		while (hitList.length > 0){
		 traverser = hitList.pop();
		 orbiters[traverser].alive = 0;
   $("#orbiters > #" + traverser + "-row").remove();
   //maybe i should get jquery...
		}
		targetrow = -1;
	} else {
	 console.log("What is dead may never die. Unable to kill because Orbiter ID[" + id + "] is not alive.");
	}
}


//looks for an unused orbiter and repurposes it
function reviveOrbiter(x, y, vel,acw,center,level,rad){
 for (var i = 0; i < constants.maxObj; i++){ //search orbiter pool for an unused space
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

   if(center > -1){ //implies that it is in a deeper level; then assign to an existing orbiter
    orbiters[i].angle =  Math.acos((orbiters[i].x-orbiters[center].x)/rad) * 180 / Math.PI;
    if (orbiters[i].y < orbiters[center].y) orbiters[i].angle *= -1; //acos cannot handle other angles
	  } else { //u
	   orbiters[i].angle = 0;
	  }

   var table = $("#orbiters")[0];
   var row = table.insertRow(-1);
   row.id = i + "-row";
   var insert = row.insertCell(-1); //for ID
   insert.innerHTML = i;
   var obj = orbiters[i];
   //loop creates display values and input elements
   for (var j in obj){
    if (j != "alive") {
	    insert = row.insertCell(-1);
	    insert.appendChild(document.createTextNode(obj[j]));
	    insert.firstChild.id = i + j + "-c";
     if (j == "rad" || j == "vel" || j == "center"){
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

   var btn;
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
 console.log("Max number of objects exceeded! Delete an orbiter first!");
 updateOrbiters();
}
//selecting a row
var targetrow = -1;

function modify(select){
 if (targetrow == -1){ //case 1: no current targetrow
  targetrow = select;
  showMod(select);
 } else {
  if (targetrow == select){ //case 2: selection is already targetrowed
  targetrow = -1;
  hideMod(select);
  } else { //case 3: currently selected different from previously selected
  hideMod(targetrow);
  targetrow = select;
  showMod(select);
  }
 }
}

//Where "select" is the ID of the orbiter

function showMod(select){
 var modList = ["center", "rad", "vel", "acw"];
 for (var i = 0; i < modList.length; i++){
  $("#" + select + modList[i]).show();
  $("#" + select + modList[i]).val(orbiters[select][modList[i]]);
 }
 $("#" + select + "-row").css("background", "rgba(0,0,200,0.3)");
}

function hideMod(select){
 var modList = ["center", "rad", "vel", "acw"];
 for (var i = 0; i < modList.length; i++){
  $("#" + select + modList[i]).hide();
 if (modList[i] != "acw") changeProperty(select, modList[i]);
 }
 $("#" + select + "-row").css("background", "rgba(255,255,255,0)");
}

//changes the property in the orbiters object and reflects changes to the table interface
function changeProperty(select, property){
	 var input = $("#" + select + property);
	 var pass = true;

	 if (property == "center") {
     console.log(input.val());
	    if (Number(input.val()) == orbiters[select].center){
	   pass = false;
	  }
	 }

	 if (property == "rad") {
	  if (input.val() < 0) {
	   console.log("Radius too small. Positive numbers only.");
	   pass = false;
	  } else if (input.val() > 100000) {
	   console.log("Radius too large! Try numbers below 100000");
	   pass = false;
	  }
	 }

	 if (property == "vel"){
	  if (input.val() < 0){
	   console.log("No negative velocities allowed (in this app). Try reversing the direction instead");
	   pass = false;
	  } else if (input.val() > 10){
	   console.log("Too fast! Velocity unchanged.");
	   pass = false;
	  }
	 }

	 if (pass){
	  orbiters[select][property] = Number(input.val());
	  if (property == "center") adjustLevels(select, Number(input.val()));
	  //updates the value in the table
	  input.prev().val(input.val());
	 }
}

//reverse direction
function toggleDir(select){
 orbiters[select].acw = !orbiters[select].acw;
 document.getElementById(select + "acw").previousSibling.nodeValue = orbiters[select].acw;
}

//creates a new orbiter at cursor position
function getCursorPosition(canvas, event) {
 var rect = canvas.getBoundingClientRect();
 var x = event.clientX - rect.left;
 var y = event.clientY - rect.top;
 var dist;
 if (targetrow > -1){ //append to selected orbit
 var xd = Math.abs(orbiters[targetrow].x - x);
 var yd = Math.abs(orbiters[targetrow].y - y);
  dist = Math.sqrt(xd*xd + yd*yd).toFixed(2);
  reviveOrbiter(x,y,Number((Math.random() * 2 + 0.8).toFixed(2)), trueOrFalse(), targetrow, orbiters[targetrow].level + 1, dist);
 } else {
  reviveOrbiter(x,y,Number((Math.random() * 2 + 0.8).toFixed(2)), trueOrFalse(), -1, 0, 50);
 }
 drawOrbiter();
}

function trueOrFalse(){
  return Math.random() < 0.5;
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
		 //this level += destination - firstattached + 1
     console.log("FOUND IT");
     console.log(orbiters[traverser].level);
     console.log(orbiters[destination].level);
     console.log(orbiters[id].level);
		 orbiters[traverser].level += orbiters[destination].level - orbiters[id].level + 1;
     console.log("FOUND IT");
 //document.getElementById(traverser + "level-c").nodeValue = orbiters[traverser].level;
		}
	} else {
	}
}


function dbgPrintProperty (property){
 var print = property;
 for (var i = 0; i < constants.maxObj; i++){
  if (orbiters[i].alive) print = print + orbiters[i][property];
 }
 console.log(print);
}


//render options
var fade = true;
var line = true;
var dots = true;
var running = true;

function togglePause(){
  running = !running;
}

function toggleDots(){
  dots = !dots;
  drawOrbiter();
}

function toggleFade () {
 fade = !fade;
}

function clearScreen () {
 ctx.clearRect(0,0,canvas.width, canvas.height)
}

function toggleLine () {
 line = !line;
 drawOrbiter();
}
//render options -end

function createEpicycloid(){
  var k = Number($("input[name=kvalue]").val());
  console.log(isNaN(k));
  var x = Number($("input[name=cx]").val());
  console.log(isNaN(x));
  var y = Number($("input[name=cy]").val());
  var rad = Number((200/(k+1)).toFixed(2));
  console.log(isNaN(rad));
  //revive an orbiter at the chosen center
  var center = reviveOrbiter(x,y,Number((Math.random() * 2 + 0.8).toFixed(2)), trueOrFalse(), -1, 0, 50);
  //create an orbiter with velocity 1 and radius 200 orbiting center, acw
  center = reviveOrbiter(x+200,y,1.00, true, center, 1, 200);
  //create an orbiter with velocity k+1 and radius 200/(k+1) orbiting previous, acw
  center = reviveOrbiter(x+200+rad,y,k + 1.00, true, center, 2, rad);
}

//logo
 ctx.fillStyle = "rgb(0,200,0)";
 ctx.fillRect(10,10,50,50);
 ctx.fillStyle = "rgba(0,0,200,0.5)";
 ctx.fillRect(40,40,50,50);

var last = Date.now();
var now, delta;

//main drawing loop
function looper(){
 if (running){
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
}

setInterval(looper, 0);
