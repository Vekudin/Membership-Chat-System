var crypto = require('crypto');
var redis = require('redis');
var express = require('express');

let client = redis.createClient();

client.on('connect', ()=>{
	console.log("Connected to redis for passwords generator");
});

var app = express();
	
	var username = "ilina";
	var password = 123;
	
	var salt = genSalt(15);
	var val = cryptID(password, salt);
	
	var key = "user:".concat(username);
	
	client.hmset(key, ["hash", val, "salt", salt], function(err, reply){
		if(err){
			console.log(err);
		}
		console.log(reply);
	});
	
	/*client.hgetall(key, function(err, obj){
		if(!obj){
			console.log("user does not exist");
		} else {
			console.log(obj);
		}
	});*/
	
	app.get('/', (req, res)=>{
		/*var da = client.hmget("user:test", "id", "salt");
		console.log(typeof(da));
		res.end("da");*/
	});

//___________________________________________________________________________________
function genSalt(len){
	return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0, len);
}

function cryptID(ID, salt){
	var hash = crypto.createHmac('sha512', salt);
	hash.update(ID.toString());
	var val = hash.digest('hex');
	
	return val;
}
//___________________________________________________________________________________

app.listen(8001, ()=>{
	console.log("Password generator is listening");
});

