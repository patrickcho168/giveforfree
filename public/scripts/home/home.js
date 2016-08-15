// Navbar Selection Fix
$(function() {
    $(".nav a").on("click", function() {

        // TODO:Add logic to determine whether to clear or not
        // Clear section
        var node = document.getElementById('infinite-scroll-container');
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }

        // addViews(3);


        $(".nav").find(".active").removeClass("active");
        $(this).parent().addClass("active");

    });
});

// AJAX Call for Infinite Scroll
function addViews(amount) {
    for (i = 1; i <= amount; ++i) {
        html = '<div class="col-sm-6 col-md-4 item">';
        // Main Item Photo
        html += '<div class="thumbnail">';
        html += '<a href="#" class="">';
        html += '<img src="' + '/images/home/default-placeholder.png' + '">';
        // Item Title
        html += '<div class="caption-area">';
        html += '<h6 class="item-header">' + 'Thumbnail label' + '</h6>';
        // Item Owner
        html += '<p class="item-author">' + 'Owner\'s name' + '</p>';
        // Item Caption
        html += '<p class="item-caption">' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' + '</p>';
        // Item Call-to-Action Snag Button
        html += '<div class="col-lg-12 text-center call-button"><a href="#" class="btn btn-primary item-call" role="button">SNAG THIS ITEM</a></div>';
        // Item Snag Counts
        html += '<p class="item-snags">' + '123' + ' people snagged this.</p>';
        html += '</div>';
        html += '</a>';
        html += '</div>';
        html += '</div>';
        $('#infinite-scroll-container').append(html);
    }

    triggered = 0;

    // "loading" done -> revert to normal state
    $("#loader").fadeTo(2000, 0.0);

}

function addRealViews(html, urlAJAX, first, limit) {
    // AJAX to fetch JSON objects from server
    $.ajax({
        url: urlAJAX,
        dataType: "json",
        method: 'get',
        data: {
            start: first,
            limit: limit
        },
        // Success Callback
        success: function(data) {
            console.log("FIRST");
            console.log(data);
            console.log(data.length);
            flag = true;

            if (data.resources.length > 0) {

                // Increment trackers to track load state
                first = parseInt($('#first').val());
                limit = parseInt($('#limit').val());
                $('#first').val(first + limit);

                /*** Factory for views ***/

                // Section headers, if applicable
                // $('#infinite-scroll-container').append('<li class="year">' + year + '</li>');

                $.each(data.resources, function(key, value) {
                    console.log(value);
                    html = '<div class="col-sm-6 col-md-4 item">';
                    // Main Item Photo
                    html += '<div class="thumbnail">';
                    // html += '<img src="' + '/images/home/default-placeholder.png' + '">';
                    html += '<img src="https://d24uwljj8haz6q.cloudfront.net/' + value.imageLocation + '">';
                    // Item Title
                    html += '<div class="caption-area">';
                    html += '<h6 class="item-header">' + value.title + '</h6>';
                    // Item Owner
                    html += '<p class="item-author">' + value.ownedBy.name + '</p>';
                    // Item Caption
                    html += '<p class="item-caption">' + value.description + '</p>';
                    // Item Call-to-Action Snag Button
                    html += '<div class="col-lg-12 text-center call-button"><a href="#" class="btn btn-primary item-call" role="button">SNAG THIS ITEM</a></div>';
                    // Item Snag Counts
                    html += '<p class="item-snags">' + '123' + ' people snagged this.</p>';
                    html += '</div>';
                    html += '</div>';
                    html += '</div>';
                    $('#infinite-scroll-container').append(html);
                });

                $("#loader").fadeTo(2000, 0.0);

                triggered = 0;

            } else {
                alert('No more data to show');
                no_data = false;
            }
        },
        error: function(data) {
            flag = true;
            no_data = false;

            $("#loader").fadeTo(2000, 0.0);

            triggered = 0;
            alert('Something went wrong, Please contact administrator.');
        }
    });
}

var html = '';
var triggered = 0;

$(document).ready(function() {

    // Test Mode
    var test = false;
    $('#first').val(0);
    $('#limit').val(6);
    // addViews(6);
    first = $('#first').val();
    limit = $('#limit').val();
    urlAJAX = '/allItems';
    addRealViews(html, urlAJAX, first, limit);


    // AJAX Server-End URL
    var urlAJAX = 'ajax.php';
    flag = true;

    $(window).scroll(function() {

        // Trigger the loading early
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            first = $('#first').val();
            limit = $('#limit').val();
            console.log(first);
            console.log(limit);
            no_data = true;

            triggered += 1;

            if (flag && no_data && !test && triggered == 1) {
                flag = false;

                var activeTab = $(".nav").find(".active");
                var name = "null";

                var ajaxRequest = null;

                if (activeTab != null) {
                    name = activeTab.attr('name');
                }

                // Construct AJAX Request based on type
                switch (name) {
                    case 'nav-feed':
                        urlAJAX = '/allItems'
                        ajaxRequest = null;
                        break;

                    case 'nav-discover':
                        ajaxRequest = null;
                        break;

                    case 'nav-gift':
                        ajaxRequest = null;
                        break;

                    default:
                        urlAJAX = '/allItems'
                        ajaxRequest = null;
                }

                // Display AJAX Pre-Loader while loading
                $("#loader").fadeTo(2000, 0.8);
                // console.log(urlAJAX);
                // AJAX to fetch JSON objects from server
                addRealViews(html, urlAJAX, first, limit);

                // Simulate Infinite Scroll and Content Population for UI/UX
            } else if (test && triggered == 1) {

                // Display AJAX Pre-Loader while loading
                $("#loader").fadeTo(2000, 0.8);

                // Load and Append
                setTimeout(addViews, 1000, 3);
            }
        }
    });

});
