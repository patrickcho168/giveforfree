// Views to append into the scroll container
var html = '';

// Boolean to record the number of times the scroll hits the floor
var triggered = 0;

// Tracker
var lastItemId = 0;

// Number of items to load every AJAX
var numItems = 9;

var canAJAX = false;

var urlAJAX = '/api/allItems/' + 0 + '/' + numItems;;

// AJAX Infinite Scrolling Function
function addRealViews(html, url) {

    console.log("entered add views logic ... time for AJAX!");

    // AJAX to fetch JSON objects from server
    $.ajax({
        url: url,
        dataType: "json",
        method: 'get',
        cache: false,

        // Success Callback
        success: function(data) {

            console.log("ajax succeeded!");
            flag = true;

            if (data.length > 0) {

                // Increment trackers to track load state
                lastItemId = data[data.length - 1].itemID;


                /*** Factory for views ***/
                $.each(data, function(key, value) {
                    html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px;">';
                    // Main Item Photo
                    html += '<a href="/item/' + value.itemID + '" target="_blank"><div class="thumbnail" style="padding: 0; border: none;" align="center">';
                    // html += '<img src="' + '/images/home/default-placeholder.png' + '">';
                    //
                    // html += '<a class="avatar box clipped" style="background-image: url(https://d24uwljj8haz6q.cloudfront.net/' + value.imageLocation + ');" onerror="handleBrokenImage(this);"></a>';

                    html += '<div class="box"><img style="display: block;" class="clipped" src="https://d24uwljj8haz6q.cloudfront.net/' + value.imageLocation + '" onerror="handleBrokenImage(this);"></div>';

                    // Item Title
                    html += '<div class="caption-area" align="left">';
                    html += '<br/><h6 class="item-header hide-overflow" style="padding-left: 10px; padding-top: 0px; margin: 5px  auto;"><a href="/item/' + value.itemID + '" target="_blank">' + value.title + '</a></h6>';
                    // Item Owner
                    // html += '<p class="item-author">' + value.ownedBy.name + '</p>';
                    // Item Caption
                    html += '<row><p class="item-author hide-overflow" style="margin: 5px auto;">';

                    html += '<a href="/profile/' + value.userID + '" target="_blank" class="small-avatar col-lg-4" style="background-image: url(http://graph.facebook.com/' + value.fbID + '/picture?type=large);" style="margin: auto 10px; padding: 0; width: 30px; height: 30px; border-radius:50%;"><span style="padding-left: 20px;">' + value.name + '</span></a></p></row>';
                    // Item Snag Counts
                    if (value.numWants > 1) {
                        html += '<small class="item-snags pull-right text-muted" align="right" style="padding-right: 10px; padding-top: 0; padding-bottom: 10px;"><b>' + value.numWants + ' people want this.</b></small>';
                    } else {
                        html += '<small class="item-snags pull-right text-muted" align="right" style="padding-right: 10px; padding-top: 0;padding-bottom: 10px;">' + '<b>Be the first to check this out!</b></small>';

                    }

                    html += '</div>';
                    html += '</div></a>';
                    html += '</div>';


                    $('#infinite-scroll-container').append(html);
                    $('#placeholder-main').hide();

                });
                triggered = 0;

            } else {
                console.log("no data to load already");
                // alert('No more data to show');
                // no_data = true;
            }
        },

        error: function(data) {
            console.log ("error loading");
            canAJAX = true;
            // no_data = false;
            triggered = 0;
            // console.log(data);
            // alert('Something went wrong, Please contact administrator.');
        }
    });
}

// On loaded webpage ...
$(document).ready(function() {

    console.log("document ready... time for first load");
    addRealViews(html, urlAJAX);

});

$(window).scroll(function() {
    console.log("i am scrolling ... weeeeee!");
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {

        // no_data = true;
        triggered += 1;
        console.log("booooing");

        if (canAJAX && triggered == 1) {
            console.log("time for ajax!!!");
            canAJAX = false;
            urlAJAX = '/api/allItems/' + lastItemId + '/' + numItems;
            addRealViews(html, urlAJAX);
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
