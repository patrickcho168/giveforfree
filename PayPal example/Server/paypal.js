var Paypal = require('paypal-adaptive');


module.exports = function(app){
	var express = require('express');
	var bodyparser = require('body-parser');
	var jsonParser = bodyparser.json()
	app.use(bodyparser());
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
			memo:           'Chained payment example',
			cancelUrl:      'http://tenzy.ddns.net',
			returnUrl:      'http://tenzy.ddns.net',
			receiverList: {
				receiver: [
					{
						email:  'tzyinc-facilitator@hotmail.com',
						amount: toPay.toString(),
						primary:'true'
					},{
						email:	'secondary-business@hotmail.com',
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

	

/*
var payload = {
    currencyCode:                   'SGD',
    startingDate:                   new Date().toISOString(),
    endingDate:                     new Date('2020-01-01').toISOString(),
    returnUrl:                      'http://your-website.com',
    cancelUrl:                      'http://your-website.com',
    ipnNotificationUrl:             'http://your-ipn-listener.com',
    maxNumberOfPayments:            1,
    displayMaxTotalAmount:          true,
    maxTotalAmountOfAllPayments:    '100.00',
    requestEnvelope: {
        errorLanguage:  'en_US'
    }
}

paypalSdk.preapproval(payload, function (err, response) {
    if (err) {
        console.log(err);
    } else {
        // Response will have the original Paypal API response
        console.log(response);
        // But also a preapprovalUrl, so you can redirect the sender to approve the payment easily
        console.log('Redirect to %s', response.preapprovalUrl);
    }
});

var payload = {
    requestEnvelope: {
        errorLanguage:  'en_US'
    },
    actionType:     'PAY',
    currencyCode:   'SGD',
    feesPayer:      'EACHRECEIVER',
    memo:           'Chained payment example',
    cancelUrl:      'http://test.com/cancel',
    returnUrl:      'http://test.com/success',
    receiverList: {
        receiver: [
            {
                email:  'primary@test.com',
                amount: '100.00',
                primary:'true'
            },
            {
                email:  'secondary@test.com',
                amount: '10.00',
                primary:'false'
            }
        ]
    }
};

paypalSdk.pay(payload, function (err, response) {
    if (err) {
        console.log(err);
    } else {
        // Response will have the original Paypal API response
        console.log(response);
        // But also a paymentApprovalUrl, so you can redirect the sender to checkout easily
        console.log('Redirect to %s', response.paymentApprovalUrl);
    }
});
*/
