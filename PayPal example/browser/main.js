function test(objPrice){
	console.log( "asdf" );
	var body = {
		charity:{
			name:"ten zhi yang charity",
			email:"tzyinc-facilitator@hotmail.com"
		},
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
 
