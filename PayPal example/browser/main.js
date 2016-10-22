function test(objPrice){
	console.log( "asdf" );
	var input = {cost:objPrice};
	$.ajax({type:'post',
			url:'/paypalAdpay',
			data:input,
			datatype:'json',
			success: function(data){
				console.log(data);
				window.location = data;
			}
	});
	
 }
 
