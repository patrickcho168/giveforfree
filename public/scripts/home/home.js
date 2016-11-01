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
                    html = '<div class="col-xs-6 col-sm-3 single-item">';
                    html += '<div class="panel">';
                    html += '<a href="/item/' + value.itemID + '"><img src="https://d24uwljj8haz6q.cloudfront.net/' + value.imageLocation + '" alt="" class="img-responsive"/></a>';
                    html += '<a href="/item/' + value.itemID + '">';
                    html += '<div class="item-info">';
                    html += '<a href="/item/' + value.itemID + '"><p class="hide-overflow">' + value.title + '</p></a>';
                    html += '<a href="/profile/' + value.userID + '" class="seller-info row">';
                    html += '<img src="https://graph.facebook.com/' + value.fbID + '/picture" alt="" />';
                    html += '<span class="hide-overflow name-on-card">' + value.name + '</span>';
                    html += '</a>';
                    html += '<a href="/item/' + value.itemID + '">';
                    html += '<p>';
                    if (value.donationAmount % 1 == 0) {
                        html += '<span style="inline-block"><img src="../images/upload/charity' + value.charityID + '.png" alt="" class="small-charity-logo" /> $' + value.donationAmount;
                    } else {
                        html += '<span style="inline-block"><img src="../images/upload/charity' + value.charityID + '.png" alt="" class="small-charity-logo" /> $' + value.donationAmount.toFixed(2);
                    }
                    html += '</span>';
                    if (value.meWant) {
                        html += '<span class="pull-right"><i class="fa fa-heart addition-info pull-right me-want"></i>' + value.numWants + '</span>';
                    } else {
                        html += '<span class="pull-right"><i class="fa fa-heart addition-info pull-right"></i>' + value.numWants + '</span>';
                    }
                    html += '</p></a>';
                    if (value.meWant) {
                        html += '<div class="ribbon-wrapper-green">';
                        html += '<div class="ribbon-green">';
                        html += 'wanted';
                        html += '</div>';
                        html += '</div>';
                    }
                    html += '</div></a></div></div>';


                    $('#infinite-scroll-container2').append(html);
                    $('#placeholder-main').hide();

                });
                canAJAX = true;
                triggered = 0;


            } else {
                console.log("no data to load already");

            }

            if($('.single-item').length > 0) {
                $('.gifts-banner').css('height', 300);
                $('.empty-placeholder-text').addClass('hidden');
                $('.placeholder-text').removeClass('hidden');
            } else {
                $('.gifts-banner').css('height', '73vh');
                $('.empty-placeholder-text').removeClass('hidden');
                $('.placeholder-text').addClass('hidden');
            }
            $("#item-loader-wrapper").addClass('hidden');
        },

        error: function(data) {
            console.log ("error loading");
            $("#item-loader-wrapper").addClass('hidden');
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
        $('.main-container').toggleClass('sidebar-open');
        $('footer').toggleClass('sidebar-open');
    });

    $('a.category').on('click', function() {
        triggered = 0;
        category = $(this).attr('id');
        urlAJAX = '/api/items/' + category + '/' + 0 + '/' + numItems;
        $('#infinite-scroll-container2').empty();
        addRealViews(html, urlAJAX);
        console.log(urlAJAX);
        return false;
    });

    $('a.category-clear').on('click', function() {
        triggered = 0;
        urlAJAX = '/api/allItems/' + 0 + '/' + numItems;
        category = null;
        $('#infinite-scroll-container2').empty();
        addRealViews(html, urlAJAX);
        console.log(urlAJAX);
        return false;
    })

    $("#main-page-carousel").swiperight(function() {
        $(this).carousel('prev');
    });

    $("#main-page-carousel").swipeleft(function() {
        $(this).carousel('next');
    });
});

$(document).scroll(function() {
    var y = $(document).scrollTop();
    var x = $(document).scrollLeft();
    var floatingBar = $('.floating-bar-full');
    if(y > 0) {
        if (x > 0) {
            floatingBar.css({"position": "absolute", "top": y + 83, "padding-right": "30px"});
        } else {
            floatingBar.css({"position": "fixed", "top": "83px", "padding-right": "30px"});
        }
    } else {
        floatingBar.css({"position": "relative", "top": "0px", "padding-right": "15px"});
    }
});

$(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
        triggered += 1;

        if (canAJAX && triggered == 1 && lastItemId > 1 && category != null) {
            canAJAX = false;
            urlAJAX = '/api/items/' + category + '/' + lastItemId + '/' + numItems;
            $("#item-loader-wrapper").removeClass('hidden');
            addRealViews(html, urlAJAX);
        } else if (canAJAX && triggered == 1 && lastItemId > 1) {
            canAJAX = false;
            urlAJAX = '/api/allItems/' + lastItemId + '/' + numItems;
            $("#item-loader-wrapper").removeClass('hidden');
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
