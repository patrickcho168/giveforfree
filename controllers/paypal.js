var Paypal = require('paypal-adaptive');
var ipn = require('paypal-ipn');
var db = require('../models/db');

module.exports = function(app){
	var express = require('express');
	var bodyparser = require('body-parser');
	var jsonParser = bodyparser.json()
	//app.use(bodyparser());
	
	var bpJSON = bodyparser.json();
	var bpUrl = bodyparser.urlencoded({
		   extended: false
	});

	var parseRaw = function(req, res, next) {
		req.body = '';
		req.setEncoding('utf8');

		req.on('data', function(chunk) { 
			 req.body += chunk;
		});

		req.on('end', function() {
			 next();
		});
	};

	app.use(function(req, res, next){
		if (!~req.url.indexOf('/api/paid')) bpJSON(req, res, next)
		else return next();  
	});

	app.use(function(req, res, next){
		if (!~req.url.indexOf('/api/paid')) bpUrl(req, res, next)
		else return next();  
	});

	app.use(function(req, res, next){
		if (~req.url.indexOf('/api/paid')) parseRaw(req, res, next)
		else return next();  
	});
	
	
	app.post('/api/paid/:id', function(req, res) {
		console.log("ipn received");
		res.sendStatus(200);
		res.end();
		var itemId = req.params.id;
		var params = req.body;
		var payKey = getAtt(params, "&pay_key=");
		var paymentStatus = getAtt(params, "&status=");
		var totalAmountPaid = getAtt(params, "&transaction%5B0%5D.amount=");
		new db.Item().where({
            itemID: itemId
        }).save({
            payKey: payKey
        }, {patch: true}).then(function() {
			ipn.verify(params,{'allow_sandbox': true}, function callback(err, msg) {
				console.log("ipn verify");
				if (err) {
					console.log(err);
				} else {
					console.log("ipn success");
					console.log("payKey "+payKey);	
					console.log("status "+paymentStatus);
					console.log("paid "+totalAmountPaid.split('+')[1]);
					console.log("itemId "+itemId);
					if (paymentStatus === "COMPLETED") {
						new db.Item().where({
							itemID: itemId,
							payKey: payKey
						}).save({
							donatedAmount: totalAmountPaid.split('+')[1]
						}, {patch: true}).then(function() {
							console.log("DONATION DONE");
						});
					}
				}
			});
		});
	})

	function getAtt(params, toGet){		
		var strArr = params.split(toGet);
		var strArr2 = strArr[1].split("&");
		return strArr2[0];	
	}

	app.post('/api/paypalAdpay',jsonParser, paypalAdpay);

	var paypalSdk = new Paypal({
		userId:    'giveforfree.payments-facilitator_api1.gmail.com',
		password:  'Y3NQYMLS7YZ5RFGS',
		signature: 'AFcWxV21C7fd0v3bYYYRCpSSRl31Az.ETR2blugwnUp.idvqpoBMj20s',
		sandbox:   true //defaults to false
	});

	function paypalAdpay(req, res){
		console.log(req.body.cost);
		var toPay = parseFloat(req.body.cost);
		var fees = toPay/100*3.9 +0.5;
		var ours = Math.min(toPay/100*1.1,1)+fees;
		ours = Math.round(ours * 100) / 100
		var theirs = toPay-ours;
		var itemId = parseInt(req.body.itemId);
		console.log(theirs,"theirs");
		console.log(ours,"ours");
		var payload = {
			requestEnvelope: {
				errorLanguage:  'en_US'
			},
			actionType:     'PAY',
			currencyCode:   'SGD',
			feesPayer:      'SECONDARYONLY',
			memo:           'Donation to ' + req.body.charityName, // Add Charity Name
			ipnNotificationUrl: 'https://giveforfree.sg/api/paid/' + itemId, // TO CHANGE THIS
			cancelUrl:      req.body.redirectUrl, // Back to Item Page
			returnUrl:      req.body.redirectUrl, // Back to Item Page
			receiverList: {
				receiver: [
					{
						email:  req.body.charityEmail, // Generated from Request (Charity's Email)
						amount: toPay.toString(),
						primary:'true'
					},{
						email:	'giveforfree.payments-facilitator@gmail.com', // Give For Free Payment email
						amount: ours.toString(),
						primary: 'false'
					}
				]
			}
		};

		paypalSdk.pay(payload, function (err, response) {
			if (err) {
				console.log(err);
				console.log(response);
			} else {
				// Response will have the original Paypal API response
				//console.log(response);
				// But also a paymentApprovalUrl, so you can redirect the sender to checkout easily
				//console.log('Redirect to %s', response.paymentApprovalUrl);
				res.send(response.paymentApprovalUrl);
			}
		});
		
	};
}