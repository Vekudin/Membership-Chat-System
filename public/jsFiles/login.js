var queryUser = {};

function authenticate(){
	var uNameVal = document.getElementById("uNameIn").value;
	var passVal = document.getElementById("passIn").value;
	
	if(uNameVal == "" || passVal == ""){
		alert("Don't leave a field empty");
	}else{
		queryUser = {
			username: uNameVal,
			password: passVal
		}
		sendData(queryUser);
	}
}

function sendData(queryUser){
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/login', true);
	
	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4){
			var status = xhr.status;
			if((status >= 200 && status<300) || (status === 304)){
				if(xhr.responseText === "dawe"){
					document.getElementById("ai").innerHTML = "Redirecting";
					window.location.replace("/index");
				}else{
					document.getElementById("ai").innerHTML = "The password is incorrect buddy...";
				}
			}
		}
	}
	var data = JSON.stringify(queryUser);
	xhr.send(data);
}

//________ACTIONS______________
window.addEventListener('load', ()=>{
	document.getElementById("loginBtn").addEventListener("click", authenticate);
	document.getElementById("uNameIn").addEventListener("keyup", function(event){
		if(event.keyCode === 13){authenticate();}
	});
	document.getElementById("passIn").addEventListener("keyup", function(event){
		if(event.keyCode === 13){authenticate();}
	});
	
});