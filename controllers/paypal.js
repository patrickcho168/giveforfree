var Paypal = require('paypal-adaptive');

module.exports = function(app){
	var express = require('express');
	var bodyparser = require('body-parser');
	var jsonParser = bodyparser.json()
	app.use(bodyparser());

	app.post('/api/paid', function(req, res) {
		console.log(req);
	})

	app.post('/paypalAdpay',jsonParser, paypalAdpay);
	var paypalSdk = new Paypal({
			userId:    'tzyinc-facilitator_api1.hotmail.com',
			password:  'D9VNC4727MW2VYUZ',
			signature: 'AFcWxV21C7fd0v3bYYYRCpSSRl31AG70SeSsL6EeTScO827AqD.YaY4p',
			sandbox:   true //defaults to false
	});
	
	function paypalAdpay(req, res){
		console.log(req.body.cost);
		var toPay = parseFloat(req.body.cost);
		var fees = toPay/100*3.9 +0.5;
		var ours = toPay/100*1.1+fees;
		var theirs = toPay-ours;
		console.log(theirs,"theirs");
		console.log(ours,"ours");
		var payload = {
			requestEnvelope: {
				errorLanguage:  'en_US'
			},
			actionType:     'PAY',
			currencyCode:   'SGD',
			feesPayer:      'SECONDARYONLY',
			memo:           'Donation to ' + req.body.charity.name, // Add Charity Name
			ipnNotificationUrl: 'http://localhost:8080/api/paid', // TO CHANGE THIS
			cancelUrl:      req.body.redirectUrl, // Back to Item Page
			returnUrl:      req.body.redirectUrl, // Back to Item Page
			receiverList: {
				receiver: [
					{
						email:  req.body.charity.email, // Generated from Request (Charity's Email)
						amount: toPay.toString(),
						primary:'true'
					},{
						email:	'secondary-business@hotmail.com', // Give For Free Payment email
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
				console.log(response);
				// But also a paymentApprovalUrl, so you can redirect the sender to checkout easily
				console.log('Redirect to %s', response.paymentApprovalUrl);
				res.send(response.paymentApprovalUrl);
			}
		});
		
	};
}