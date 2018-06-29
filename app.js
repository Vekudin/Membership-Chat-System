var path = require('path');
var url = require('url');
var crypto = require('crypto');
var redis = require('redis');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');


//________Variables___________
var i,j;
var ses;

var queryUser = {};
var usersOnline = [];
var currentID = 1;

var chatHistory = [];
//______END___VARIABLES_______

let client = redis.createClient();
const app = express();
var router = express.Router();

client.on('connect', function(){
	getChatHistory();
	console.log("Connected to Redis");
});

app.use(cookieParser());
app.use('/route', router);
/*app.use(session({
	secret: 'LifeIsReal',
	resave: false,
	saveUninitialized: true
}));*/

//____FOLDERS___OF___SERVER______________________________
app.use('/public', express.static(__dirname + '/public'));
app.use('/jsFiles', express.static(__dirname + '/public/jsFiles'));
app.use('/cssFiles', express.static(__dirname + '/public/cssFiles'));

//____________BASE____________________________________________________________________________

app.post('/chat/history', function(req, res){
	if(checkUser(req, res)){
		var bodyCHAT = '';
		req.on('error', (err)=>{
			console.log(err);
			bodyCHAT = '';
			req.abort();
			
		}).on('data', (data)=>{
			bodyCHAT += data;
		}).on('end', (data)=>{
			storeChatHistory(req, res, bodyCHAT);
		});
	}else{
		res.redirect('/login');
	}
});

app.post('/login', function(req, res){
	var bodyUSER = '';
	req.on('error', (err)=>{
		console.log(err);
		bodyUSER = '';
		req.abort();

	}).on('data', (data)=>{
		bodyUSER += data;
		
	}).on('end', ()=>{
		queryUser = JSON.parse(bodyUSER);
		authenticate(req, res, queryUser);
	});
});
//________POST___&___GET_______________________________

app.get('/chat/history', function(req, res){
	if(checkUser(req, res)){
		var uIndex = getUserIndex(JSON.parse(req.cookies['user']).username);
		
		if(usersOnline[uIndex].chat === false){
			console.log(usersOnline);
			sendChatHistory(req, res);
			usersOnline[uIndex].chat = true;
			
		}else{
			res.end("");
		}
	}else{
		res.redirect('/login');
	}
});

app.get('/user', function(req, res){
	if(checkUser(req, res)){
		var username = JSON.parse(req.cookies['user']).username
		var user = {
			username: username
		}
		res.send(user);
		
	}else{
		res.redirect('/login');
	}
});

app.get('/logout', function(req, res){
	if(checkUser(req, res)){
		var username = JSON.parse(req.cookies['user']).username;
		for(i=0; i<usersOnline.length; i++){
			if(usersOnline[i].username === username){
				usersOnline.splice(i, 1);
			}
		}
		res.clearCookie('user');
		res.redirect('/login');
	}
});
app.get('/index', function(req, res){
	if(checkUser(req, res)){
	  usersOnline[getUserIndex(JSON.parse(req.cookies['user']).username)].chat = false;
	  res.sendFile("index.html", {root: path.join(__dirname, "/public")});
	}else{
	  res.redirect('/login');
	}

});
app.get('/login', function(req, res){
	if(checkUser(req, res)){
		res.redirect('/index');
	}else{
		res.sendFile("login.html", {root: path.join(__dirname, "/public")});
	}
});
app.get('/', function(req, res){
	res.redirect('/login');
});
//_________END___BASE_________________________________________________________________________

function checkUser(req, res){
	if(req.cookies['user']){
		userChecked = JSON.parse(req.cookies['user']);
		var hash;
		
		for(i=0; i<usersOnline.length; i++){
			if(userChecked.username === usersOnline[i].username){
				hash = cryptID(usersOnline[i].ID, usersOnline[i].salt);
				if(userChecked.id === hash){
					return true;
				}
			}
		}
	}
	return false;
}

function authenticate(req, res, user){
	var key = "user:".concat(user.username);
	
	client.hgetall(key, function(err, reply){
		if(err){
			console.log(err);
			res.end("error");
			queryUser = {};
		}else{
			
			var hash = cryptID(user.password, reply.salt);
			if(hash === reply.hash){
				var obj = {
					ID: currentID++,
					salt: genSalt(10),
					username: user.username,
					chat: false,
					status: "basic"
				}
				
				usersOnline.push(obj);
				
				var cliObj = {
					id: cryptID(obj.ID, obj.salt),
					username: user.username
				}
				var strObj = JSON.stringify(cliObj);
				queryUser = {};
				res.cookie('user', strObj);
				res.end("dawe");
			}else{
				queryUser = {};
				res.end("newe");
			}
		}
	});
}

function genSalt(len){
	return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0, len);
}

function cryptID(ID, salt){
	var hash = crypto.createHmac('sha512', salt);
	hash.update(ID.toString());
	var val = hash.digest('hex');
	
	return val;
}

//_______DATABASE____REDIS____FUNCTIONS__________________________________________
function storeChatHistory(req, res, chatLine){
	chatHistory = chatHistory.substring(0, chatHistory.length-1);
	chatHistory = chatHistory.concat(",", chatLine, "]");
	client.set('chatHistory', chatHistory);
	
	for(i=0; i<usersOnline.length; i++){
		usersOnline[i].chat = false;
	}
	res.end();
}

function getChatHistory(){
	client.get('chatHistory', function(err, reply){
		if(err){
			console.log(err);
		}else{
			chatHistory = reply;
		}
	});
}

function sendChatHistory(req, res){
	client.get('chatHistory', function(err, reply){
		if(err){
			console.log(err);
			res.send(JSON.stringify([{username:"Database", cont:"Error getting chat history from the database"}]));
		}else{
			res.send(reply);
		}
		
	});
}
//_____________END___DATABASE___FUNC_____________________________________________

//________BASIC______FUNCS_______________________________________________________

function getUserIndex(username){
	for(i=0; i<usersOnline.length; i++){
		if(username === usersOnline[i].username){
			return i;
		}
	}
	return -1;
}
//________END_____BASIC___FUNCS__________________________________________________

//_______________________________________________________________________________
app.listen(8000, function(){
	console.log("server listening at port: 8000");
});