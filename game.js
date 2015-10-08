
// all the foods Array
var foodArray = [];
// all the bugs Array
var bugsArray = [];
//all the scores Array
var scoresArray =[];
//pause indicator
var isGamePause = false;

var gameLevel; // current gameLevel selected by the player

//setup timerCount
var timerCount = 60;

//setup scoreboard
var score=0;

// * this is the entry point to the game *//
function clickButton(){
	var radios = document.getElementsByName('level');
	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].checked) {
			gameLevel = radios[i].value;
			break;
		}

	}
	if(gameLevel==1 ||gameLevel==2){
		document.getElementById("firstPage").style.display = 'none';
		// show secondPage as a block
		document.getElementById("secondPage").style.display = 'block';
		startGame();
	}
	else{
		alert('Please Select a gameLevel !');
	}

};


function startGame (){
	resetCanvas();
	startGameLoop();
}


/* reset the game by
1. clearing the canvas
2. resetting the timer
3. emptying foodArray and bugsArray
*/
function resetCanvas (){
	// reset timer
	count = 60;
	document.getElementById("timer").innerHTML= count+" secs";

	// clear the canvas
	c = document.getElementById('gameCanvas');
	ctx = c.getContext('2d');
	ctx.clearRect(0, 0, c.width, c.height)

	//empty bugsArray
	bugsArray=[];

	//empty foodArray
	foodArray = [];

	// setup the event listner
	c.addEventListener('click', function (evt) {
		var mousePos = getMousePos(c, evt);
		//mousePos.x + mousePos.y;
		checkClick(mousePos.x,mousePos.y);
	}, false);

	var overlap = false;
	// create 5 food here for now
	for(var i = 0; i < 5; i++){
		foodArray[i] = {
			// dont want food in the boarder of canvas
			"x": Math.floor((Math.random()* (c.width-40))+20),
			//no food in first 20% of screen
			"y": Math.floor((Math.random()* (c.height-140))+120)
		}
		for(var j=0; j < i; j++){
			overlap = overLap(foodArray[j],foodArray[i]);
			if(overlap){
				foodArray[i] = {
					// dont want food in the boarder of canvas
					"x": Math.floor((Math.random()* (c.width-40))+20),
					//no food in first 20% of screen
					"y": Math.floor((Math.random()* (c.height-140))+120)
				}
				// if overlap check again in loop
				j = 0;
			}
		}
	}
	// draw new food onto screen
	renderFoodArray();
}

// create 5 food
function renderFoodArray() {
	for(var i = 0; i < foodArray.length; i++){
		drawFood(foodArray[i].x,foodArray[i].y);
	}
}


// draw food ---- need to draw realistic food here :)
function drawFood (x,y){
	ctx.beginPath();
	ctx.rect(x, y, 20,20);
	ctx.strokeStyle="blue";
	ctx.stroke();
}

//get the x-y coordinates of the mouse
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

//check if a bug was clicked by player
function checkClick(clickX,clickY){
	if (!isGamePause){
		for(var i=0;i<bugsArray.length;i++){
			var bug = bugsArray[i];
			if((bug.x-15<clickX && bug.x+15>clickX)
			&& (bug.y-15<clickY && bug.y+15>clickY)){

				if (bug.type == 1) {
					score = score + 5;
				}else if (bug.type == 2){
					score = score + 3;
				}else {
					score = score + 1;
				}
				bugsArray.splice(i,1);
				renderBugs ()
			}
		}
	}
};

//TODO: Game loop


// here we setup interrupts
function startGameLoop(){
	//time in miliseconds
	window.requestAnimationFrame(draw);
	bugEnterTime    = setTimeout(addBug, 1000); // new bug enters to screen
	//drawBugs        = setInterval(renderBugs,100); // render the bugs every 1 s , calculate shortest path etc..
	updateTimer     = setInterval(updateTimer,1000); // update the count down every second starting from 60s
	updateScore     = setInterval(function(){document.getElementById("score").innerHTML="Score :" + score;},1000); // update score every second
}



// update bug position
function renderBugs (){

	for(var b=0;b<bugsArray.length;b++){
		renderbug (bugsArray[b]);

	}
}


function addBug(){
	var bug = createBug();
	bug.x =  Math.floor(Math.random()*380) +10;
	bug.type = Math.floor((Math.random() * 3) + 1);
	bugsArray.push(bug);

	var randT = Math.floor((Math.random() * 3) + 1) * 1000;
	bugEnterTime    = setTimeout(addBug, randT);
}

function createBug(){
	return {
		// bug's position
		"x": 0,
		"y": 0,
		// bug's current target
		"target" :-1,
		// bug's rotation
		"rotation" : 0,

		"fade": false,

		"movdir": 0,

		"speed": 20,

		//bug's type
		"type":-1
	}
}

// draw bug TODO add a nicer drawing for bug
function renderbug (bug){

	ctx.save();
	ctx.beginPath();
	ctx.translate(bug.x, bug.y);
	ctx.rotate(bug.rotation);

	ctx.rect(-5, -20, 10, 40);
	if (bug.type == 1) {
		ctx.fillStyle="black";
	}else if (bug.type == 2){
		ctx.fillStyle="orange";
	}else {
		ctx.fillStyle="red";
	}
	ctx.fill();
	// reset current transformation matrix to the identity matrix
	ctx.restore();
}

function calDist (){

	if(bugsArray.length == 0){
		return;
	}

	for (var n=0; n<bugsArray.length; n++){
		// default distance
		var minDist = 9999;

		// calculate closest food item location to the bug
		for(var i = 0; i < foodArray.length; i++){

			var xDist = Math.floor(Math.abs(foodArray[i].x-bugsArray[n].x));
			var yDist = Math.floor(Math.abs(foodArray[i].y-bugsArray[n].y));
			var newDist = Math.floor(Math.sqrt((xDist*xDist)+(yDist*yDist)));

			if(newDist<minDist){
				minDist = newDist;
				bugsArray[n].target = i;
			}

			// bug ate the food
			if(minDist < 25){
				foodArray.splice(i,1)
				minDist = 9999;
				i = -1; // recalculatethe nearest food item
			}
		}

		// calculate bug movement angle
		if(foodArray.length != 0){ // need at least one food in the array
			bugsArray[n].movdir = Math.atan2(foodArray[bugsArray[n].target].y - bugsArray[n].y,foodArray[bugsArray[n].target].x - bugsArray[n].x)
			bugsArray[n].rotation = Math.PI - Math.atan2(foodArray[bugsArray[n].target].x-bugsArray[n].x,foodArray[bugsArray[n].target].y-bugsArray[n].y)
			}

		}
	}


	function updateTimer(){
		timerCount --;
		if(timerCount == 0 || foodArray.length == 0){
			timerCount = 60;
			if(gameLevel == 1){
				gameLevel = 2;
				startGame ()
			}
			else {
				timerCount = 60;
				//alert('Game Over !');
				startGame ()
			}
		}
		document.getElementById("timer").innerHTML= timerCount+" secs";
}

function overLap(obj1,obj2){
		var xOverlap = (obj2.x >= obj1.x - 80) && (obj2.x <= obj1.x + 40);
		var yOverlap = (obj2.y >= obj1.y - 80) && (obj2.y <= obj1.y + 40);
		return (xOverlap && yOverlap);
}




function checkPause(){
		if(!isGamePause){
			stopLoop();
			isGamePause = true
			document.getElementById("pause").innerHTML="Play";
		}else{
			startGameLoop();
			isGamePause = false;
			document.getElementById("pause").innerHTML="||";
		}
	}

	// we use time difference for smooth drawing
var prevtime = (new Date()).getTime();
var curtime = 0;

function draw (){

		// if game is paused just update the time and return
		if(isGamePause){
			prevtime = (new Date()).getTime();
			return;
		}

		curtime =(new Date()).getTime();
		var timeDiff = curtime - prevtime;

		for (var i=0; i < bugsArray.length; i++){
			// pixels / second
			if (!bugsArray[i].fade){
				bugsArray[i].x += Math.cos(bugsArray[i].movdir)*bugsArray[i].speed
				* timeDiff / 1000;
				bugsArray[i].y += Math.sin(bugsArray[i].movdir)*bugsArray[i].speed
				* timeDiff / 1000;
			}
		}
 calDist();
 ctx.clearRect(0, 0, c.width, c.height)
 renderBugs ();
 renderFoodArray();

 prevtime = curtime;
 // setup the draw call back
 window.requestAnimationFrame(draw);
}



function stopLoop(){
	clearInterval(bugEnterTime);
	clearInterval(updateTimer);
	clearInterval(updateScore);
}
