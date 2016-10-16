// Views to append into the scroll container
var html = '';

// Boolean to record the number of times the scroll hits the floor
var triggered = 0;

// Tracker
var lastItemId = 0;

// Number of items to load every AJAX
var numItems = 12;

var canAJAX = true;

var urlAJAX = '/api/allItems/' + 0 + '/' + numItems;;

// AJAX Infinite Scrolling Function
function addRealViews(html, url) {

    // AJAX to fetch JSON objects from server
    $.ajax({
        url: url,
        dataType: "json",
        method: 'get',
        cache: false,

        // Success Callback
        success: function(data) {

            flag = true;

            if (data.length > 0) {

                // Increment trackers to track load state
                lastItemId = data[data.length - 1].itemID;


                /*** Factory for views ***/
                $.each(data, function(key, value) {
                    html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px;">';
                    // Main Item Photo
                    html += '<a href="/item/' + value.itemID + '" target="_blank"><div class="thumbnail" style="padding: 0; border: none;" align="center">';

                    html += '<div class="box"><img style="display: block;" class="clipped" src="https://d24uwljj8haz6q.cloudfront.net/' + value.imageLocation + '" onerror="handleBrokenImage(this);"></div>';

                    // Item Title
                    html += '<div class="caption-area" align="left">';
                    html += '<br/><h6 class="item-header hide-overflow" style="padding-left: 10px; padding-top: 0px; margin: 5px  auto;"><a href="/item/' + value.itemID + '" target="_blank">' + value.title + '</a></h6>';
                    html += '<row><p class="item-author hide-overflow" style="margin: 5px auto;">';

                    html += '<a href="/profile/' + value.userID + '" target="_blank" class="small-avatar col-lg-4" style="background-image: url(http://graph.facebook.com/' + value.fbID + '/picture?type=large);" style="margin: auto 10px; padding: 0; width: 30px; height: 30px; border-radius:50%;"><span style="padding-left: 20px;">' + value.name + '</span></a></p></row>';
                    // Item Snag Counts
                    if (value.numWants >= 1) {
                        html += '<small class="item-snags pull-right text-muted" align="right" style="padding-right: 10px; padding-top: 0; padding-bottom: 10px;"><b>' + value.numWants + ' people want this.</b></small>';
                    } else {
                        html += '<small class="item-snags pull-right text-muted" align="right" style="padding-right: 10px; padding-top: 0;padding-bottom: 10px;">' + '<b>Be the first to check this out!</b></small>';

                    }
                    if (value.meWant) {
                        html += '<div class="ribbon-wrapper-green">';
                        html += '<div class="ribbon-green">';
                        html += 'wanted';
                        html += '</div>';
                        html += '</div>';
                    }

                    html += '</div>';
                    html += '</div></a>';
                    html += '</div>';


                    $('#infinite-scroll-container').append(html);
                    $('#placeholder-main').hide();

                });
                canAJAX = true;
                triggered = 0;

            } else {
                // console.log("no data to load already");
            }
        },

        error: function(data) {
            console.log ("error loading");
            canAJAX = true;
            triggered = 0;
        }
    });
}

// On loaded webpage ...
$(document).ready(function() {

    addRealViews(html, urlAJAX);

});

$(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {

        triggered += 1;

        if (canAJAX && triggered == 1 && lastItemId > 1) {
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
