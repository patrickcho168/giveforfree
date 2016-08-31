$(document).ready(function() {

	setTimeout(function(){
		$('body').addClass('loaded');
	}, 1);

	$("a.notification-link").click(function(notification) {
	    var href = this.href;  
	    var apiUrl = '/api/read_notification/' + $(this).attr('notificationid');
	    notification.preventDefault();  
	    $.ajax({
	        url: apiUrl,
	        success: function(){
	            document.location = href;  
	        }
	    });
	});

	$("a.clear-notifications").click(function(notification) {
		console.log("clearing");
	    var apiUrl = '/api/clear_notifications';
	    notification.preventDefault();
	    $.ajax({url: apiUrl});
	    $("span.badge").text(0);
	});

});
