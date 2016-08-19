// AJAX Infinite Scroll Accessory Function
var html = '';
var triggered = 0;
var lastItemId = 0;
var numItems = 6;
var no_data = true;

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
                lastItemId = data[data.length - 1].itemID;

                /*** Factory for views ***/

                $.each(data, function(key, value) {
                    html = '<div class="col-xs-12 col-sm-4 col-md-3 col-lg-3 grid-item item">';
                    // Main Item Photo
                    html += '<div class="thumbnail">';
                    html += '<a href="/item/' + value.itemID + '" class=\"item-link\">';
                    // html += '<img src="' + '/images/home/default-placeholder.png' + '">';
                    html += '<img style="display: block;" class="clipped" src="https://d24uwljj8haz6q.cloudfront.net/' + value.imageLocation + '">';
                    // Item Title
                    html += '<div class="caption-area">';
                    html += '<p class="item-header hide-overflow"><a href="/item/' + value.itemID + '" target="_blank">' + value.title + '</p>';
                    // Item Owner
                    html += '<p class="item-author hide-overflow"><a href="/profile/' + value.userID + '" target="_blank">' + value.name + '</a></p>';
                    // Item Caption
                    // html += '<p class="item-caption">' + value.description + '</p>';
                    // Item Call-to-Action Snag Button
                    if (value.meWant > 0) {
                        html += '<div class="col-lg-12 text-center call-button"><a class="btn btn-danger unsnag" itemId="' + value.itemID + '" role="button">UNSNAG</a></div>';
                    } else {
                        html += '<div class="col-lg-12 text-center call-button"><a class="btn btn-primary snag" itemId="' + value.itemID + '" role="button">SNAG</a></div>';
                    }
                    // Item Snag Counts
                    html += '<small class="item-snags text-muted">' + value.numWants + (value.numWants == 1 ? ' person' : ' people') + ' snagged this.</small>';
                    html += '</div>';
                    html += '</a>';
                    html += '</div>';
                    html += '</div>';
                    $('#infinite-scroll-row').append(html);
                });

                triggered = 0;

            } else {
                // alert('No more data to show');
                no_data = false;
            }
        },
        error: function(data) {
            flag = true;
            no_data = false;

            triggered = 0;
            console.log(data);
            alert('Something went wrong, Please contact administrator.');
        }
    });
}

// On loaded webpage ...
$(document).ready(function() {

    'use strict';

    // Masonry Loading
    // var $container = $('.grid');
    // $container.masonry({
    //     itemSelector: '.grid-item',
    //     columnWidth: 400
    // });

    // Images Loaded
    // $container.imagesLoaded.progress(function() {
    //     $container.masonry({
    //         itemSelector: '.grid-item',
    //         columnWidth: 400
    //     });
    //
    // });

    // FAB Navigation Logic
    $(".cd-main-nav a").on("click", function() {

        // Get the current tab
        var currentTab = $(this).parent().attr('id');

        // Logic for navigation by tabs
        switch (currentTab) {
            case 'tab-create':
                window.location.href = '/upload';
                break;

            default:
                //...
        }

        // Animation
        $('.cd-nav-trigger').toggleClass('menu-is-open');
        $('#cd-nav').find('#cd-main-nav ul').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend').toggleClass('is-visible');

    });

    // AJAX Settings
    $(".nav a").on("click", function() {

        // Selection
        $(".nav").find(".active").removeClass("active");
        $(this).parent().addClass("active");

    });

    // Want|Snagging
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

        // Increment number of people snagging
        var snag_count = parseInt($(this).parent().siblings('small').text()) + 1;
        $(this).parent().siblings('small').text(String(snag_count) + (snag_count === 1 ? ' person' : ' people') + ' snagged this.');

        // Send post request

        // Should check for success
        $.post("/api/want/" + itemId)
            .done(function() {

            })
            .fail(function() {

            })
            .always(function() {

            });
    });

    // Unwant|Unsnagging
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

        // Decrement number of people snagging
        var snag_count = parseInt($(this).parent().siblings('small').text()) - 1;
        $(this).parent().siblings('small').text(String(snag_count) + (snag_count === 1 ? ' person' : ' people') + ' snagged this.');

        // Send post request
        $.post("/api/unwant/" + itemId)
            .done(function() {

            })
            .fail(function() {

            })
            .always(function() {

            });
    });

});

// Infinite Scroll
// Test Mode
var test = false;

// AJAX Address
var urlAJAX = '/api/allItems/' + lastItemId + '/' + numItems;
console.log(urlAJAX);

// Preload with views
addRealViews(html, urlAJAX);

// AJAX Server-End URL
var flag = false;

// Infinite Scroll
$(window).scroll(function() {

    // Trigger the loading
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        no_data = true;

        // Do not entertain multiple identical AJAX calls
        triggered += 1;

        // To call AJAX
        if (flag && no_data && !test && triggered == 1) {
            flag = false;

            var activeTab = $(".navbar-nav").find(".active");
            var name = "null";

            var ajaxRequest = null;

            if (activeTab != null) {
                name = activeTab.attr('id');
            }

            // Construct AJAX Request based on type
            console.log(name);
            console.log(lastItemId);

            switch (name) {
                case 'nav-feed':
                    urlAJAX = '/api/allItems/' + lastItemId + '/' + numItems;
                    ajaxRequest = null;
                    break;

                case 'nav-discover':
                    urlAJAX = '/api/allItems/' + lastItemId + '/' + numItems;
                    ajaxRequest = null;
                    break;

                case 'nav-gift':
                    ajaxRequest = null;
                    break;

                default:

            }

            // AJAX to fetch JSON objects from server
            console.log(lastItemId);
            if (lastItemId >= 1) {
                console.log(urlAJAX);
                addRealViews(html, urlAJAX);
            }
        }
    }
});
