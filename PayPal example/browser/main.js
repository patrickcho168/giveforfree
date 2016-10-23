function test(objPrice){
	var body = {
		charityName:"ten zhi yang charity",
		charityEmail:"tzyinc-facilitator@hotmail.com",
		cost:objPrice,
		redirectUrl:"http://tenzy.ddns.net"
	};
	$.ajax({type:'post',
			url:'/paypalAdpay',
			data:body,
			datatype:'json',
			success: function(data){
				console.log(data);
				window.location = data;
			}
	});
	
 }
 
