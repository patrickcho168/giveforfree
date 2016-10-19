// Views to append into the scroll container
var html = '';

// Boolean to record the number of times the scroll hits the floor
var triggered = 0;

// Tracker
var lastItemId = 0;

// Number of items to load every AJAX
var numItems = 12;

var sideBarOpen = false;

var category = null;

var canAJAX = true;

var urlAJAX = '/api/allItems/' + 0 + '/' + numItems;

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
                    html = '<div class="col-xs-6 col-sm-4 col-md-3 single-item">';
                    html += '<div class="panel">';
                    html += '<a href="/item/' + value.itemID + '"><img src="https://d24uwljj8haz6q.cloudfront.net/' + value.imageLocation + '" alt="" class="img-responsive"/></a>';
                    html += '<div class="item-info">';
                    html += '<a href="/item/' + value.itemID + '"><p class="hide-overflow">' + value.title + '</p></a>';
                    html += '<a href="/profile/' + value.userID + '" class="seller-info row">';
                    html += '<img src="http://graph.facebook.com/' + value.fbID + '/picture" alt="" />';
                    html += '<span>' + value.name + '</span>';
                    html += '</a>';
                    if (value.numWants >= 1) {
                        html += '<small class="addition-info pull-right">' + value.numWants + ' people want this.</small>';
                    } else {
                        html += '<small class="addition-info pull-right">Be the first to check this out!</small>';
                    }
                    if (value.meWant) {
                        html += '<div class="ribbon-wrapper-green">';
                        html += '<div class="ribbon-green">';
                        html += 'wanted';
                        html += '</div>';
                        html += '</div>';
                    }
                    html += '</div></div></div>'


                    $('#infinite-scroll-container2').append(html);
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

    $('.navbar-logo').on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 500);
    });

    $('.category-button').on('click', function() {
        $('.floating-bar-mobile').toggleClass('show-bar');
        $('.main-container').toggleClass('open');
    });

    $('a.category').on('click', function() {
        category = $(this).attr('id');
        urlAJAX = '/api/items/' + category + '/' + 0 + '/' + numItems;
        $('#infinite-scroll-container2').empty();
        addRealViews(html, urlAJAX);
        console.log(urlAJAX);
        return false;
    });
});

// $(document).scroll(function() {
//     var y = $(document).scrollTop();
//     var x = $(window).width();
//     var floatingBar = $('.floating-bar-full');
//     if(x >= 753 && y >= 590) {
//         floatingBar.css({"position": "fixed", "top": "92px", "padding-right": "30px"});
//     } else if(x >= 753 && y < 590) {
//         floatingBar.css({"position": "relative", "top": "0px", "padding-right": "15px"});
//     }
// });

$(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {

        triggered += 1;

        if (canAJAX && triggered == 1 && lastItemId > 1 && category != null) {
            canAJAX = false;
            urlAJAX = '/api/items/' + category + '/' + lastItemId + '/' + numItems;
            addRealViews(html, urlAJAX);
        } else if (canAJAX && triggered == 1 && lastItemId > 1) {
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

function scrollDown() {
    $('html, body').animate({ scrollTop: $('.gifts-banner').offset().top - 87 }, 500);
}

$(window).load(function() {
    $('.thumbnail').find('img').each(function() {
        var imgClass = (this.width / this.height > 1) ? 'wide' : 'tall';
        $(this).addClass(imgClass);
    })
});
