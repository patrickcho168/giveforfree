$(document).ready(function() {
	$('body').addClass('loaded');

	$("a.notification-link").click(function(notification) {
	    var href = this.href;
	    var id = $(this).attr('notificationid')
	    var apiUrl = '/api/read_notification/' + id;
	    notification.preventDefault();
	    $.ajax({
	        url: apiUrl,
	        dataType: "json",
	        method: "post",
	        success: function(){
	            document.location = href;
	        }
	    });
	});

	$("a.clear-notifications").one("click", function(notification) {
		console.log("clearing");
	    var apiUrl = '/api/clear_notifications';
	    notification.preventDefault();
	    $.ajax({url: apiUrl, dataType: "json", method: "post"});
	    $("span.badge").text(0);
	    $("div[id='all-notifications']").empty();
	});

});


function loginLoader() {
    $('body').removeClass('loaded');
}

function loginSpecial() {
    $('body').removeClass('loaded');
	window.location.href="/login/facebook";
}

function scrollDown(n) {
for (i = 0; i < n; i++) {
	console.log(i)
	document.body.scrollTop = document.body.scrollHeight;
	sleep(5);
}
}
