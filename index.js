var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

const APP_TOKEN = 'EAAKXVML0b6QBAPgM3dUZCL1C2wC9OOMzHeu1OCeRCW68cMALQAkzIDXLVtngzqfUZCb8bgRZAm43m9CiJsPHyRDvio1NJpTgnEkNSHrbRX0od6wYn9UpjM5r6WW5q177vd717HEihqEfQJZAMqOPtlj2LPCDxJqalTZCac10SGwZDZD'

var app = express();
app.use(bodyParser.json());

app.listen(3000, function(){
	console.log("El servidor se encuentra en el puerto 3000")
});

app.get('/', function(req, res){
	res.send("Bienvenido")
});

app.get('/webhook', function(req, res){
	if(req.query['hub.verify_token'] === 'token_01_octubre_2017'){
		res.send(req.query['hub.challenge']);
	}else{
		res.send('Acceso no autorizado');
	}
});

app.post('/webhook', function(req,res){
	var data = req.body;

	if(data.object == 'page'){
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){
				if(messagingEvent.message){
					receiveMessage(messagingEvent);
				}
			});
		});
	}
	res.sendStatus(200);
});

function receiveMessage(event){
	var senderID = event.sender.id;
	var messageText = event.message.text;

	console.log(senderID);
	console.log(messageText);

	evaluateMessage(senderID, messageText);
}

function evaluateMessage(recipientId, message){
	var finalMensage = '';

	if(isContain(message, 'ayuda')){
		finalMensage = 'No te puedo ayudar';
	}else if(isContain(message, 'hola')){
		sendMessageImage(recipientId);
	}else if(isContain(message, 'clima')){
		getWeather(function(temperature){
			var mensaje  = 'La temperatura en la Ciudad de Guatemala es de ' + temperature + '°';
			sendMessageText(recipientId, mensaje);
		});
	}else{
		finalMensage = 'Sólo se repetir: ' + message;
	}

	sendMessageText(recipientId, finalMensage)
;}

function sendMessageText(recipientId, message){
	var messageData = {
		recipient : {
			id : recipientId
		},
		message : {
			text: message
		}
	};
	callSendAPI(messageData);
}

function sendMessageImage(recipientId){
	var messageData = {
		recipient : {
			id : recipientId
		},
		message : {
			attachment : {
				type : "image",
				payload : {
					url : "https://pm1.narvii.com/6319/fb3d27f9b46ab2863b7a75d6d38605903bad056c_hq.jpg"
				}
			}
		}
	};
	callSendAPI(messageData);
}

function callSendAPI(messageData){
	request({
		uri : 'https://graph.facebook.com/v2.6/me/messages',
		qs : { access_token : APP_TOKEN },
		method : 'POST',
		json : messageData
	}, function(error, response, data){
		if(error){
			console.log(error);
		}else{
			console.log("Mensaje enviado");
		}
	});
}

function getWeather( callback ){
	request('http://api.geonames.org/findNearByWeatherJSON?lat=14.628434&lng=-90.522713&username=lextercruz',
		function(error, response, data){
			if(!error){
				var response = JSON.parse(data);
				var temperature = response.weatherObservation.temperature;
				callback(temperature);
			}
	});
}

function isContain(sentence, word){
	return sentence.indexOf(word) > -1;
}