
// all the foods Array
var foodArray;
// all the bugs Array
var bugsArray;
//all the scores Array
var scoresArray =[];
//pause indicator
var isGamePause = false;

var gameLevel; // current gameLevel selected by the player

//setup timerCount
var timerCount = 60;
var updateTimer;

//setup scoreboard
var score=0;

var highScore = localStorage['highScore'];
// * this is the entry point to the game *//
function clickButton(){
	var radios = document.getElementsByName('level');
	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].checked) {
			gameLevel = radios[i].value;
			break;
		}

	}
	if(gameLevel==1 || gameLevel==2){
		document.getElementById("firstPage").style.display = 'none';
		// show secondPage as a block
		document.getElementById("secondPage").style.display = 'block';
		startGame();
	}
	else{
		alert('Please Select a gameLevel !');
	}

	score = 0;
	document.getElementById("score").innerHTML="Score :" + score;
};


function startGame (){
	resetCanvas();
	startGameLoop();
	addBug()
}


/* reset the game by
1. clearing the canvas
2. resetting the timer
3. emptying foodArray and bugsArray
4. setting up click listner
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
	bugsArray = new Array();;

	//empty foodArray
	foodArray = new Array();;

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
			overlap = foodOverLap(foodArray[j],foodArray[i]);
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


// draw watermelon
function drawFood (x,y){

	// begin custom shape
			ctx.save();

		  ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI, false);
      ctx.closePath();
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.strokeStyle = '#550000';
      ctx.stroke();

			ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI, false);
      ctx.lineWidth = 5;
			ctx.strokeStyle = '#005500';
      ctx.stroke();

			// shadow
			ctx.beginPath();
			ctx.arc(x, y, 15, 0, Math.PI, false);
      ctx.shadowColor = '#999';
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 2;
      ctx.fill();
			ctx.stroke();

			ctx.restore();
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

				if (!bug.fade){
					if (bug.type == 1) {
						score = score + 5;
					}else if (bug.type == 2){
						score = score + 3;
					}else {
						score = score + 1;
					}
			}

				bug.fade = true;
			}
		}
		document.getElementById("score").innerHTML="Score :" + score;
	}
};


// here we setup interrupts
function startGameLoop(){
	//time in miliseconds
	window.requestAnimationFrame(draw);
	updateTimer     = window.setInterval(updateTime,1000); // update the count down every second starting from 60s
}



// update bug position
function renderBugs (){

	for(var b=0;b<bugsArray.length;b++){
		if(bugsArray[b].trans <= 0.01){
			bugsArray.splice(b,1);
			break;
		}
		renderbug (bugsArray[b]);

	}
}


function addBug(){
	var bug = createBug();
	bug.x =  Math.floor(Math.random()*380) +10;

	randType = Math.floor((Math.random() * 10) +1);

	if (randType < 3){
	bug.type = 1;
		if(gameLevel == 1)
		bug.speed = 150;
		else
		bug.speed = 200;
	}

	else if (randType < 6){
	bug.type = 2;
		if(gameLevel == 1)
		bug.speed = 75;
		else
		bug.speed = 100;
	}

	else if (randType < 11){
	bug.type = 3;
		if(gameLevel == 1)
		bug.speed = 60;
		else
		bug.speed = 80;
	}

	bugsArray.push(bug);

	if(!isGamePause){
	var randTime = (Math.floor((Math.random() * 3) +1)) * 1000;
	bugEnterTime    = window.setTimeout(addBug, randTime);
	}
}

function createBug(){
	return {
		// bug's position
		"x": 0,
		"y": 0,

		"oldx": 0,
		"oldy": 0,

		// bug's current target
		"target" :-1,
		// bug's rotation
		"rotation" : 0,

		"fade": false,
		"trans": 1,

		"movdir": 0,

		"speed": 0,

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

	// fade the bug if it been hit
	if(bug.fade){
		if(bug.trans > 0.01)
		bug.trans -= 0.01 ;
		ctx.globalAlpha = bug.trans;
	}

	ctx.scale(0.40, 1);
	ctx.arc(0, 0, 15, 0, 2 * Math.PI, false);
	ctx.scale(1, 1);
	ctx.arc(0, -13, 8, 0, 2 * Math.PI, false);

	if (bug.type == 1) {
		ctx.fillStyle="black";
		ctx.strokeStyle = "black";
	}else if (bug.type == 2){
		ctx.fillStyle="red";
		ctx.strokeStyle = "red";
	}else {
		ctx.fillStyle="orange";
		ctx.strokeStyle = "orange";
	}
	ctx.fill();

	if(!bug.fade){
	// draw the legs
	ctx.beginPath();
  ctx.lineWidth = 3;
	ctx.moveTo(- 15,  - 15);
	ctx.lineTo( + 15, + 15);
	ctx.stroke();
	ctx.beginPath();
  ctx.lineWidth = 2;
	ctx.moveTo(-23,  -8);
	ctx.lineTo( + 23, +8);
	ctx.stroke();
	ctx.beginPath();
  ctx.lineWidth = 2;
	ctx.moveTo(-23,  8);
	ctx.lineTo( + 23, - 8);
	ctx.stroke();
	ctx.beginPath();
  ctx.lineWidth = 3;
	ctx.moveTo( + 15,  - 15);
	ctx.lineTo( - 15,  + 15);
	ctx.stroke();
 }

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


	function updateTime(){
			if(isGamePause){
				return;
			}
		timerCount --;

		if(timerCount == 0){
			timerCount = 60;

			if(gameLevel == 1){
				if(confirm('You WON ! \nYour score is '+ score +'\nPress OK to continue to Level 2\nPress CANCEL to go to Main Menu') == true){
				gameLevel = 2;
				startGame ()
				}
				else {
					stopLoop()
					localStorage["highScore"] = Math.max.apply(null, scoresArray);
					document.getElementById("highestScore").innerHTML= parseInt(localStorage["highScore"]);
					document.getElementById("firstPage").style.display = 'block';
					// show firstPage as a block
					document.getElementById("secondPage").style.display = 'none';
				}
			}

			if(gameLevel == 2){
				scoresArray.push(score);
				gameLevel = 1;
				startGame ()
					if(confirm('You WON ! \nYour score is '+ score +'\nPress OK to replay the game'+'\nPress CANCEL to go to Main Menu') == true){
					}
					else {
						localStorage["highScore"] = Math.max.apply(null, scoresArray);
						document.getElementById("highestScore").innerHTML= parseInt(localStorage["highScore"]);
						document.getElementById("firstPage").style.display = 'block';
						// show firstPage as a block
						document.getElementById("secondPage").style.display = 'none';
					}
				}
			}
		if(foodArray.length == 0){
				timerCount = 60;
				scoresArray.push(score);
				startGame ()
				if(confirm('You LOST ! \nYour score is '+ score +'\nPress OK to replay the Level \nPress CANCEL to go to Main Menu') == true){
				}
				else {
					localStorage["highScore"] = Math.max.apply(null, scoresArray);
					document.getElementById("highestScore").innerHTML= parseInt(localStorage["highScore"]);
					document.getElementById("firstPage").style.display = 'block';
					// show firstPage as a block
					document.getElementById("secondPage").style.display = 'none';
				}
	}
	document.getElementById("timer").innerHTML= timerCount+" secs";
}

function foodOverLap(obj1,obj2){
		var xOverlap = (obj2.x >= obj1.x - 80) && (obj2.x <= obj1.x + 40);
		var yOverlap = (obj2.y >= obj1.y - 80) && (obj2.y <= obj1.y + 40);
		return (xOverlap && yOverlap);
}
function bugOverLap(obj1,obj2){
		var xOverlap = Math.floor(Math.abs(obj2.x - obj1.x));
		var yOverlap = Math.floor(Math.abs(obj2.y - obj1.y));

		var Dist = Math.floor(Math.sqrt((xOverlap*xOverlap)+(yOverlap*yOverlap)));
		return (Dist < 25);
}




function checkPause(){
		if(!isGamePause){
			stopLoop();
			isGamePause = true
			document.getElementById("pause").innerHTML="&#9658;";
		}else{
			isGamePause = false;
			startGameLoop();
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

		var overlap = false;

		for (var i=0; i < bugsArray.length; i++){
			// pixels / second
			if (!bugsArray[i].fade && !isGamePause){
				bugsArray[i].x += Math.cos(bugsArray[i].movdir)*bugsArray[i].speed
				* timeDiff / 1000;
				bugsArray[i].y += Math.sin(bugsArray[i].movdir)*bugsArray[i].speed
				* timeDiff / 1000;
			}
			for(var j=0; j < i; j++){
				overlap = bugOverLap(bugsArray[j],bugsArray[i]);
				// bug overlap logic
				if(overlap){
					if(bugsArray[j].type < bugsArray[i].type){
						// I am the slow one , so I wait
						bugsArray[i].x = bugsArray[i].oldx;
						bugsArray[i].y = bugsArray[i].oldy;
					}
					else if(bugsArray[j].type > bugsArray[i].type){
						// I am the fast one so pause the other one
						bugsArray[j].x = bugsArray[j].oldx;
					  bugsArray[j].y = bugsArray[j].oldy;
					}
					else if((bugsArray[j].type == bugsArray[i].type) && (bugsArray[j].x > bugsArray[i].x)){
							// I am in left so pause
							bugsArray[i].x = bugsArray[i].oldx;
							bugsArray[i].y = bugsArray[i].oldy;
					}
					else if((bugsArray[j].type == bugsArray[i].type) && (bugsArray[j].x < bugsArray[i].x)){
							// I am in right so pause other one
							bugsArray[j].x = bugsArray[j].oldx;
							bugsArray[j].y = bugsArray[j].oldy;
					}
				}
			}
			bugsArray[i].oldx = bugsArray[i].x;
			bugsArray[i].oldy = bugsArray[i].y;
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
	window.clearInterval(updateTimer);
}
