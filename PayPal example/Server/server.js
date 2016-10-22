var https = require('https');
var http = require('http');
var path = require('path');
var express = require('express');
var app = express();
var fs = require('fs');
var $ = require('jquery');


const port=80;

app.use('/node_modules', express.static(__dirname + '/../node_modules'));
app.use('/browser', express.static(__dirname + '/../browser'));
app.use('/charge', express.static(__dirname + '/../Server'));

//paypal router
var Paypal = require('./paypal.js');

var options = {
  key: fs.readFileSync('../../../etc/letsencrypt/live/tenzy.ddns.net/privkey.pem'),
  cert: fs.readFileSync('../../../etc/letsencrypt/live/tenzy.ddns.net/cert.pem'),
  ca: fs.readFileSync('../../../etc/letsencrypt/live/tenzy.ddns.net/chain.pem')
};

https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8000);

function handleRequest(request, response){
    response.end('It Works!! Path Hit: ' + request.url);
}
app.get('/*', function(req,res, next){
	res.sendFile(path.join(__dirname, '/../browser/index.html'));
});
app.listen(port, function(err) {
	if(err){
		throw err
	}else{

	console.log('Listening on port: ', port);
	}
});

Paypal(app);
