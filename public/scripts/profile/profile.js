// Views to append into the scroll container
var html = '';

// Boolean to record the number of times the scroll hits the floor
var triggered = 0;

// Individual trackers for each tab
var lastGiftsId = 0;
var lastWantsId = 0;
var lastThanksId = 0;
var lastFriendsId = 0;
var lastItem = 0;

// Number of items to load every AJAX
var numItems = 9;

var canAJAX = false;

var firstGifts = true;
var firstWants = true;
var firstThanks = true;
var firstFriends = true;

var isFirst = true;

var urlAJAX = null;

// var actualClass = ".cd-main-nav";
// var friendListView = false;

// AJAX Infinite Scrolling Function
function addRealViews(html) {

    // var $tab = $('#my-tabs-contents')
    // var $active = $tab.find('.tab-pane.active');
    // var currentTab = $active.attr('id');
    var currentTab = $(".nav-tabs").find(".active").attr('id');

    console.log("GIFT: " + firstGifts);
    console.log("WANTS: " + firstWants);


    switch (currentTab) {
        case "tab-gifts":
            $("#my-tabs-contents").find(".active").removeClass("active");
            $("#my-tabs-contents").find(".active").removeClass("in");
            $("#gifts").addClass("active");
            $("#gifts").addClass("in");
            currentTab = "gifts";
            isFirst = firstGifts;
            if (firstGifts) {
                urlAJAX = '/api/myItems/' + 0 + '/' + numItems + '/' + appProfileId;
            } else {
                urlAJAX = '/api/myItems/' + lastGiftsId + '/' + numItems + '/' + appProfileId;
            }
            lastItem = lastGiftsId;
            break;
        case "tab-wants":
            $("#my-tabs-contents").find(".active").removeClass("active");
            $("#my-tabs-contents").find(".active").removeClass("in");
            $("#wants").addClass("active");
            $("#wants").addClass("in");
            currentTab = "wants";
            isFirst = firstWants;
            if (firstWants) {
                urlAJAX = '/api/myWants/' + 0 + '/' + numItems + '/' + appProfileId;
            } else {
                urlAJAX = '/api/myWants/' + lastWantsId + '/' + numItems + '/' + appProfileId;
            }
            lastItem = lastWantsId;
            break;
        case "tab-thanks":
            $("#my-tabs-contents").find(".active").removeClass("active");
            $("#my-tabs-contents").find(".active").removeClass("in");
            $("#thanks").addClass("active");
            $("#thanks").addClass("in");
            currentTab = "thanks";
            isFirst = firstThanks;
            urlAJAX = null;
            lastItem = lastThanksId;
            break;
        case "tab-friends":
            $("#my-tabs-contents").find(".active").removeClass("active");
            $("#my-tabs-contents").find(".active").removeClass("in");
            $("#friends").addClass("active");
            $("#friends").addClass("in");
            currentTab = "friends";
            isFirst = firstFriends;
            urlAJAX = null;
            lastItem = lastFriendsId;

            break;
        default:
            break;
    }

    console.log(currentTab);
    console.log(urlAJAX);
    console.log(lastItem);
    console.log(isFirst);

    if (urlAJAX != null && lastItem >= 1 || isFirst) {
        // AJAX to fetch JSON objects from server
        $.ajax({
            url: urlAJAX,
            dataType: "json",
            method: 'get',
            cache: false,

            // Success Callback
            success: function(data) {
                canAJAX = true;

                // Data available to display / append
                if (data.length > 0) {
                    // Increment tracker
                    switch (currentTab) {
                        case "gifts":
                            lastGiftsId = data[data.length - 1].itemID;
                            console.log("GIFTS: " + lastGiftsId);
                            break;
                        case "wants":
                            lastWantsId = data[data.length - 1].itemID;
                            console.log("WANTS: " + lastWantsId);
                            break;
                        case "thanks":
                            lastThanksId = data[data.length - 1].itemID;
                            break;
                        case "friends":
                            lastFriendsId = data[data.length - 1].itemID;
                            break;
                        default:
                            break;
                    }
                    // lastItemId = data[data.length - 1].itemID;

                    /*** Factory for views ***/
                    $.each(data, function(key, value) {
                        html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px;">';
                        // Main Item Photo
                        html += '<a href="/item/' + value.itemID + '" target="_blank"><div class="thumbnail" style="padding: 0; border: none;" align="center">';
                        // html += '<img src="' + '/images/home/default-placeholder.png' + '">';
                        html += '<div class="box"><img style="display: block;" class="clipped" src="https://d24uwljj8haz6q.cloudfront.net/' + value.imageLocation + '" onerror="handleBrokenImage(this);"></div>';
                        // Item Title
                        html += '<div class="caption-area" align="left">';
                        html += '<br/><h6 class="item-header hide-overflow" style="padding-left: 10px; padding-top: 0px; margin: 5px  auto;"><a href="/item/' + value.itemID + '" target="_blank">' + value.title + '</a></h6>';
                        // Item Owner
                        // html += '<p class="item-author">' + value.ownedBy.name + '</p>';
                        // Item Caption
                        html += '<row><p class="item-author hide-overflow" style="margin: 5px auto;"><img class="col-lg-4" src="http://graph.facebook.com/' + value.fbID + '/picture?type=large" style="margin: auto 10px; padding: 0; width: 30px; height: 30px; border-radius:50%;"><a href="/profile/' + value.userID + '" target="_blank">' + value.name + '</a></p></row>';
                        // Item Snag Counts
                        if (value.numWants > 1) {
                            html += '<small class="item-snags pull-right" align="right" style="padding-right: 10px; padding-top: 0; padding-bottom: 10px;">' + value.numWants + ' people want this.</small>';
                        } else {
                            html += '<small class="item-snags pull-right" align="right" style="padding-right: 10px; padding-top: 0;padding-bottom: 10px;">' + '<b>Be the first to check this out!</b></small>';

                        }
                        // // html += '<p class="item-caption">' + value.description + '</p>';
                        // // Item Call-to-Action Snag Button
                        // if (value.giverID !== myAppId && value.takerID !== null && value.takerID !== myAppId) {
                        //     html += '<div class="col-lg-12 text-center call-button"><a href="/item/' + value.itemID + '" class="btn btn-default other-given raised bold-link" itemId="' + value.itemID + '" role="button">TAKEN BY OTHERS</a></div>';
                        // } else if (value.giverID !== myAppId && value.takerID !== null && value.takerID === myAppId) {
                        //     html += '<div class="col-lg-12 text-center call-button"><a href="/item/' + value.itemID + '" class="btn btn-success given-to-you raised bold-link" itemId="' + value.itemID + '" role="button">GIVEN TO YOU</a></div>';
                        // } else if (loggedIn && value.giverID !== myAppId && value.meWant === 0 && !value.expired) { // NEED TO ADD NOT EXPIRED
                        //     html += '<div class="col-lg-12 text-center call-button"><a class="btn btn-primary snag raised bold-link" itemId="' + value.itemID + '" role="button">SNAG</a></div>';
                        // } else if (loggedIn && value.giverID !== myAppId && value.meWant > 0 && !value.expired) {
                        //     html += '<div class="col-lg-12 text-center call-button"><a class="btn btn-danger unsnag raised bold-link" itemId="' + value.itemID + '" role="button">UNSNAG</a></div>';
                        // } else if (value.giverID !== myAppId && value.expired) {
                        //     html += '<div class="col-lg-12 text-center call-button"><a href="/item/' + value.itemID + '" class="btn btn-success wait raised bold-link" itemId="' + value.itemID + '" role="button">EXPIRED</a></div>';
                        // } else if (value.giverID === myAppId && value.takerID !== null) {
                        //     html += '<div class="col-lg-12 text-center call-button"><a href="/item/' + value.itemID + '" class="btn btn-success given raised bold-link" itemId="' + value.itemID + '" role="button">GIVEN AWAY BY YOU</a></div>';
                        // } else if (value.giverID === myAppId && value.takerID === null) {
                        //     html += '<div class="col-lg-12 text-center call-button"><a href="/item/' + value.itemID + '" class="btn btn-primary not-given raised bold-link" itemId="' + value.itemID + '" role="button">PENDING SNAGGERS</a></div>';
                        // } else if (!loggedIn) {
                        //     html += '<div class="col-lg-12 text-center call-button"><a href="/login" class="btn btn-sm btn-primary raised bold-link" role="button">LOGIN TO SNAG</a></div>';
                        // }

                        html += '</div>';
                        html += '</div></a>';
                        html += '</div>';
                        console.log(currentTab);

                        switch (currentTab) {
                            case "gifts":
                                firstGifts = false;
                                $('#gifts').append(html);
                                console.log($('#gifts-placeholder'));
                                $('#gifts-placeholder').hide();
                                break;
                            case "wants":
                                firstWants = false;

                                $('#wants').append(html);
                                $('#wants-placeholder').hide();
                                break;
                            case "thanks":
                                firstThanks = false;

                                $('#thanks').append(html);
                                $('#thanks-placeholder').hide();
                                break;
                            case "friends":
                                firstFriends = false;

                                $('#friends').append(html);
                                $('#friends-placeholder').hide();
                                break;
                            default:
                                break;
                        }
                    });
                    triggered = 0;

                } else {
                    // alert('No more data to show');
                    // no_data = true;
                }
            },
            error: function(data) {
                canAJAX = true;
                // no_data = false;
                triggered = 0;
                // console.log(data);
                // alert('Something went wrong, Please contact administrator.');
            }
        });
    }
}


// Main Navigation and Load Logic
$(document).ready(function() {
    addRealViews(html);

    // $('.my-tabs').bind('change', function(e) {
    //     triggered = 0;
    //
    // });
    $('.nav-tabs a').click(function() {
        $(".nav-tabs").find(".active").removeClass("active");
        $(this).parent().addClass("active");
        triggered = 0;

        setTimeout(addRealViews, 300, html);
        addRealViews(html);
    });

    $('.thumbnail').hover(
        function() {
            $(this).addClass("animated bounceIn");
        },
        function() {
            $(this).removeClass("animated bounceIn");
        }
    );



    $('#confirm-delete').on('show.bs.modal', function(e) {
        $(this).find('.btn-ok').attr('href', $(e.relatedTarget).data('href'));
    });

});

$(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        // no_data = true;
        triggered += 1;

        if (canAJAX && triggered == 1) {
            canAJAX = false;
            addRealViews(html);
        }
    }
});

function handleBrokenImage(image) {
    image.onerror = "";
    image.src = "/images/common/default-placeholder.png";
    return true;
}

$(window).load(function() {
    $('.thumbnail').find('img').each(function() {
        var imgClass = (this.width / this.height > 1) ? 'wide' : 'tall';
        $(this).addClass(imgClass);
    })
});
