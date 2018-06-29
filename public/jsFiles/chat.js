
//basic____variables
var i = 0;
var flag = false;

var chatLines = [];
var chatLine = {};

var user = {};
//End_variables_____

class CHATView{
	
	//chat lines
	static render(){
	  var chat = document.getElementById("chatDiv");
	  
	  while(chat.firstChild){
		chat.removeChild(chat.firstChild);
	  }
		
	  var line;
	  var t;
	  for(i=0; i < chatLines.length; i++){
		line = document.createElement('P');
		line.innerHTML = chatLines[i].username + ": " + chatLines[i].cont;
		
		document.getElementById("chatDiv").appendChild(line);
	  }
	  scrollDown();
	}
	
}

function setThings(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/user', true);
		
	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4){
			var status = xhr.status;
				
			if((status >= 200 && status< 300) || (status === 304)){
				user = JSON.parse(xhr.responseText);
				getChatHistory();
			}
		}
	}
	xhr.send(null);
}

function getChatHistory(){
	setTimeout(function(){getChatHistory();}, 1000);
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", '/chat/history', true);
		
	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4){
			var status = xhr.status;
				
			if((status >= 200 && status< 300) || (status === 304)){
				if(xhr.responseText === ""){
					
				}else{
					chatLines = [];
					chatLines = JSON.parse(xhr.responseText);
					
					if(!chatLines){
					  console.log("No chatLines");
					}else{
					  CHATView.render();
					}
				}
			}
		}
	}
	xhr.send(null);
}

function sendData(chatLine){
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/chat/history', true);
	
	var whole = JSON.stringify(chatLine);
	xhr.send(whole);
}

function sendBtnHandler(){
	var inputVal = document.getElementById("chatInput").value;
	if(inputVal === ""){}else{
		var chatLine = document.createElement("p");
		chatLine.textContent = user.username + ": " + inputVal;
		document.getElementById("chatDiv").appendChild(chatLine);
		scrollDown();
		
		var d = new Date();
		var time = d.getHours().toString() + ":" + d.getMinutes().toString();
		
		obj = {
			username: user.username,
			cont: inputVal
		}
		
		document.getElementById("chatInput").value = "";
		
		chatLine = obj;
		sendData(chatLine);
	}
}

//___BASIC____FUNCTIONS____
function scrollDown(){
	document.getElementById("chatDiv").scrollTo(0,10000);
}

//___After___Load
window.addEventListener("load", () =>{
	setThings();
	$("#sendBtn").click(sendBtnHandler);
	$("#chatInput").keyup(()=>{ if(event.keyCode === 13){sendBtnHandler();} });
});