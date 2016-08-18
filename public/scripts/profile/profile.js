$(function() {

    'use strict';
    ////

    var $container = $('.grid');

    $container.imagesLoaded(function() {
        $container.masonry({
            itemSelector: '.item',
            columnWidth: '.item'
        });
    });

});

// Want or Unwant
$(document).on("click", ".snag", function() {
    var itemId = $(this).attr('itemId');
    console.log("Item", itemId, "has been snagged");

    // Change text
    $(this).text("UNSNAG");

    // Change color
    $(this).removeClass("btn-primary");
    $(this).addClass("btn-danger");

    // Change type
    $(this).removeClass("snag");
    $(this).addClass("unsnag");

    // Send post request
    // Should check for success
    $.post("/api/want/" + itemId)
        .done(function() {
            console.log("DONE");
        })
        .fail(function() {
            console.log("ERROR");
        })
        .always(function() {

        });
});

$(document).on("click", ".unsnag", function() {
    var itemId = $(this).attr('itemId');
    console.log("Item", itemId, "has been unsnagged");

    // Change text
    $(this).text("SNAG");

    // Change color
    $(this).removeClass("btn-danger");
    $(this).addClass("btn-primary");

    // Change type
    $(this).removeClass("unsnag");
    $(this).addClass("snag");

    // Send post request
    $.post("/api/unwant/" + itemId)
        .done(function() {
            console.log("DONE");
        })
        .fail(function() {
            console.log("ERROR");
        })
        .always(function() {

        });
});

// Navbar Selection Fix
var friendListView = false;

$(document).ready(function() {

    if (!isMine) {
        $("#but-friends").addClass("hidden");
        $("#tab-friends").addClass("hidden");
    } else {
        $("#tab-self").addClass("hidden");
    }

    $(".cd-main-nav a").on("click", function() {
        if (!$(this).parent().hasClass('active') && $(this).parent().attr('id') !== $(this).parent().find(".active").attr('id')) {
            // TODO:Add logic to determine whether to clear or not
            // Clear section
            var node = document.getElementById('infinite-scroll-container');
            while (node.hasChildNodes()) {
                node.removeChild(node.lastChild);
            }

            $(".cd-main-nav").find(".active").removeClass("active");
            $(this).parent().addClass("active");
            var currentTab = $(this).parent().attr('id');

            switch (currentTab) {
                case 'tab-snagged':
                    friendListView = false;
                    urlAJAX = '/api/myWants/0/' + numItems + '/' + appProfileId;
                    addRealViews(html, urlAJAX);
                    break;

                case 'tab-gifted':
                    friendListView = false;
                    urlAJAX = '/api/myItems/0/' + numItems + '/' + appProfileId;
                    addRealViews(html, urlAJAX);
                    break;

                case 'tab-friends':
                    friendListView = true;

                    var html = "<div class=\"list-group\">";
                    for (var i = 0; i < myFriends.length; i++) {

                        html += "<a class=\"list-group-item list-group-item-action\" href=\"/profile/" + myFriends[i].userID + "\">" + myFriends[i].name + "</a>";
                    }

                    html += "</div>";

                    $('#infinite-scroll-container').append(html);

                    break;

                case 'tab-self':
                    document.getElementById("myprofile-link").click();
                    break;

                default:
                    //...
            }
            $('.cd-nav-trigger').toggleClass('menu-is-open');
            $('#cd-nav').find('#cd-main-nav ul').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend').toggleClass('is-visible');
        }

    });
});

function addRealViews(html, urlAJAX) {
    // AJAX to fetch JSON objects from server
    $.ajax({
        url: urlAJAX,
        dataType: "json",
        method: 'get',
        cache: false,
        // Success Callback
        success: function(data) {
            flag = true;

            if (data.length > 0) {

                // Increment trackers to track load state
                // first = parseInt($('#first').val());
                // limit = parseInt($('#limit').val());
                // $('#first').val(first + 1);
                // $('#limit').val(data.pagesFiltered);
                // totalPages = data.pagesFiltered;
                lastItemId = data[data.length - 1].itemID;

                /*** Factory for views ***/

                // Section headers, if applicable
                // $('#infinite-scroll-container').append('<li class="year">' + year + '</li>');

                $.each(data, function(key, value) {
                    html = '<div class="col-sm-6 col-md-4 item">';
                    // Main Item Photo
                    html += '<div class="thumbnail">';
                    // html += '<img src="' + '/images/home/default-placeholder.png' + '">';
                    html += '<img src="https://d24uwljj8haz6q.cloudfront.net/' + value.imageLocation + '">';
                    // Item Title
                    html += '<div class="caption-area">';
                    html += '<h6 class="item-header"><a href="/item/' + value.itemID + '" target="_blank">' + value.title + '</a></h6>';
                    // Item Owner
                    // html += '<p class="item-author">' + value.ownedBy.name + '</p>';
                    // Item Caption
                    html += '<p class="item-author"><a href="/profile/' + value.userID + '" target="_blank">' + value.name + '</a></p>';
                    html += '<p class="item-caption">' + value.description + '</p>';
                    // Item Call-to-Action Snag Button
                    if (value.giverID !== myAppId && value.meWant === 0) {
                        html += '<div class="col-lg-12 text-center call-button"><a class="btn btn-primary snag" itemId="' + value.itemID + '" role="button">SNAG</a></div>';
                    } else if (value.giverID !== myAppId && value.meWant > 0) {
                        html += '<div class="col-lg-12 text-center call-button"><a class="btn btn-danger unsnag" itemId="' + value.itemID + '" role="button">UNSNAG</a></div>';
                    }
                    // Item Snag Counts
                    html += '<small class="item-snags">' + value.numWants + ' people snagged this.</small>';
                    html += '</div>';
                    html += '</div>';
                    html += '</div>';
                    $('#infinite-scroll-container').append(html);
                });

                $("#loader").fadeTo(2000, 0.0);

                triggered = 0;

            } else {
                // alert('No more data to show');
                no_data = false;
            }
        },
        error: function(data) {
            flag = true;
            no_data = false;

            $("#loader").fadeTo(2000, 0.0);

            triggered = 0;
            console.log(data);
            alert('Something went wrong, Please contact administrator.');
        }
    });
}

var html = '';
var triggered = 0;
var lastItemId = 0;
var numItems = 6;
var actualClass = ".cd-main-nav";

$(document).ready(function() {
    if (!isMine) {
        $("#but-friends").addClass("hidden");
        $("#tab-friends").addClass("hidden");
    }

    // Test Mode
    var test = false;
    urlAJAX = '/api/myWants/' + lastItemId + '/' + numItems + '/' + appProfileId;
    console.log(urlAJAX);
    addRealViews(html, urlAJAX);
    flag = true;

    $(window).scroll(function() {

        // Trigger the loading early
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            no_data = true;

            triggered += 1;

            if (flag && no_data && !test && triggered == 1) {
                flag = false;

                console.log($(actualClass).find(".active"));
                var activeTab = $(actualClass).find(".active");
                var name = "null";

                var ajaxRequest = null;

                if (activeTab != null) {
                    name = activeTab.attr('id');
                }

                // Construct AJAX Request based on type
                console.log(name);
                console.log(lastItemId);
                switch (name) {
                    case 'tab-snagged':
                        urlAJAX = '/api/myWants/' + lastItemId + '/' + numItems + '/' + appProfileId;
                        ajaxRequest = null;
                        break;

                    case 'tab-gifted':
                        urlAJAX = '/api/myItems/' + lastItemId + '/' + numItems + '/' + appProfileId;
                        ajaxRequest = null;
                        break;

                    case 'tab-friends':
                        urlAJAX = null;
                        ajaxRequest = null;
                        break;

                        // default:
                        //     urlAJAX = '/api/friendItems/' + lastItemId + '/' + numItems;
                        //     ajaxRequest = null;
                }

                // Display AJAX Pre-Loader while loading
                $("#loader").fadeTo(2000, 0.8);
                // console.log(urlAJAX);
                // AJAX to fetch JSON objects from server
                console.log(lastItemId);
                if (lastItemId >= 1) {
                    console.log(urlAJAX);
                    if (urlAJAX != null) {
                        addRealViews(html, urlAJAX);
                    }
                }

                // Simulate Infinite Scroll and Content Population for UI/UX
            } else if (test && triggered == 1 && !friendListView) {

                // Display AJAX Pre-Loader while loading
                $("#loader").fadeTo(2000, 0.8);

                // Load and Append
                setTimeout(addViews, 1000, 3);
            }
        }
    });



});
