var notificationTriggered = 0;

$(document).ready(function() {

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    	$("#dropdownMenu1").attr("href", "/notifications");
    	$("#dropdownMenu1").removeAttr('data-toggle');
    }

	$('body').addClass('loaded');

	$("a.notification-link").click(function(notification) {
	    var href = this.href;
	    var id = $(this).attr('notificationid')
	    console.log(id);
	    var apiUrl = '/api/read_notification/' + id;
	    notification.preventDefault();
	    if ($(this).closest("li").hasClass("unread-notification")) {
	    	$(this).closest("li").removeClass("unread-notification");
	    	var notification_count = parseInt($("span.badge").text()) - 1;
		    console.log(notification_count);
		    if (notification_count == 0) {
		    	$("span.badge").text(notification_count);
		        $("span.badge").hide();
		    } else {
		        $("span.badge").text(notification_count);
		    }
	    }
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
	    $("span.badge").hide();
	    $("div[id='all-notifications']").find('li').removeClass("unread-notification");
	    // $("div[id='all-notifications']").empty();
	});

	jQuery(function($) {
	    $('#all-notifications').on('scroll', function() {
	        if(($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) && notificationTriggered===0) {
	        	$("#notification-loader-wrapper").removeClass('hidden');
	        	notificationTriggered = 1;
	        	var id = $(this).attr('smallest-id');
	        	console.log(id);
	        	var apiUrl = "/api/load_notification/" + id;
	        	var userId = $(this).attr('user-id');
	        	var additionalUnread = 0;
	            $.ajax({
			        url: apiUrl,
			        dataType: "json",
			        method: "get",
			        success: function(notification){
			        	if (notification.length > 0) {
				            var html="";
				            var smallestId = notification[0].notificationID;
				            for (var i=0; i<notification.length; i++) {
				            	if (notification[i].notificationID < smallestId) {
				            		smallestId = notification[i].notificationID;
				            	}
				            	html+='<li class="notification '; 
				            	if (!notification[i].readnotificationID) { 
				            		html+='unread-notification';
				            		additionalUnread++;
				            	}
				            	html+='" style="padding: 0px 9.6px;" notificationid="' + notification[i].notificationID + '">';
	                			html+='<div class="media">';
	                    		html+='<div class="media-left">';
	                        	html+='<div class="media-object">';
	                        	html+='</div>';
	                   			html+='</div>';
					            if (notification[i].notificationType === 5) {
			                    	html+='<a href="/profile/' + userId + '#thanks" class="notification-link" notificationid="' + notification[i].notificationID + '" style="background:transparent;">';
			                        html+='<div class="media-body">';
			                        html+='<div class="notification-title" style="color: black">';
			                        html+='<strong>' + notification[i].name + '</strong> left a new message on your <strong>Thank You Wall</strong>!';
			                        html+='</div>';
			                        html+='<div class="notification-meta">';
			                        html+='<small class="timestamp">' + moment(notification[i].timeCreated).format('MMM Do [at] h:mmA') + '</small>';
			                        html+='</div>';
			                        html+='</div>';
			                    	html+='</a>';
		                    	} else {
		                    		html+='<a href="/item/' + notification[i].itemID + '" class="notification-link" notificationID="' + notification[i].notificationID + '" style="background:transparent;">';
		                        	html+='<div class="media-body">';
		                            html+='<div class="notification-title" style="color: black">';
		                            if (notification[i].notificationType === 1) {
		                                html+='<strong>' + notification[i].name + '</strong> is interested in getting <strong>' + notification[i].title + '</strong>.';
		                            } else if (notification[i].notificationType === 2) {
		                                html+='<strong>' + notification[i].title + "'" + 's</strong> giveaway has expired. Pick your lucky winner now.';
		                            } else if (notification[i].notificationType === 3) {
		                                html+='<strong>' + notification[i].name + '</strong> left a comment about <strong>' + notification[i].title + '</strong>.';
		                            } else if (notification[i].notificationType === 4) {
		                                if (notification[i].takerID === id) {
		                                    if (notification[i].donationAmount > 0) {
		                                        html+='<strong>' + notification[i].title + '</strong> has been given to you! Please <strong>donate</strong> to receive your gift.';
		                                    } else {
		                                        html+='<strong>' + notification[i].title + '</strong> has been given to you! Please arrange delivery with giver.';
		                                    }
		                                } else {
		                                    html+='<strong>' + notification[i].title + '</strong> has been given to someone else!';
		                                }
		                            } else if (notification[i].notificationType === 6) {
		                                html+='<strong>' + notification[i].name + '</strong> has made a donation for <strong>' + notification[i].title + '</strong>. You may deliver the item now.';
		                            } else if (notification[i].notificationType === 7) {
		                                html+='<strong>' + notification[i].name + '</strong> has received <strong>' + notification[i].title + '</strong>. Thank you for your contribution!';
		                            }
		                            html+='</div>';
		                            html+='<div class="notification-meta">';
		                            html+='<small class="timestamp">' + moment(notification[i].timeCreated).format('MMM Do [at] h:mmA') + '</small>';
		                            html+='</div>';
		                        	html+='</div>';
		                    		html+='</a>';
		                    	}
		                    	html+='</div></li>';
		                    }
		                    $('#all-notifications').append(html);
		                    $('#all-notifications').attr("smallest-id", smallestId);
		                    notificationTriggered = 0;
		                    var notification_count = parseInt($("span.badge").text()) + additionalUnread;
						    $("span.badge").text(notification_count);
				        }
				        $("#notification-loader-wrapper").addClass('hidden');
				    },

			        error: function(data) {
			            console.log ("error loading");
			            notificationTriggered = 0;
			            $("#notification-loader-wrapper").addClass('hidden');
			        }
			    });
	        }
	    })
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