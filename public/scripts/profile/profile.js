// Navbar Selection Fix
$(document).ready(function() {
    $(".nav a").on("click", function() {
        if (!$(this).parent().hasClass('active') && $(this).parent().attr('id') !== $(this).parent().find(".active").attr('id')) {
            // TODO:Add logic to determine whether to clear or not
            // Clear section
            var node = document.getElementById('infinite-scroll-container');
            while (node.hasChildNodes()) {
                node.removeChild(node.lastChild);
            }

            var currentTab = $(this).parent().attr('id');

            switch (currentTab) {
                case 'tab-snagged':
                    // urlAJAX = '/api/friendItems/0/' + numItems;
                    // ajaxRequest = null;
                    // addRealViews(html, urlAJAX);
                    addViews(4);
                    break;

                case 'tab-gifted':
                    // urlAJAX = '/api/allItems/0/' + numItems;
                    // ajaxRequest = null;
                    // addRealViews(html, urlAJAX);
                    addViews(5);
                    break;

                case 'tab-friends':
                    // urlAJAX = null;
                    // ajaxRequest = null;

                    var html = "<ul class=\"list-group\">";

                    // var myFriends = !{friends};

                    console.log(myFriends);

                    for(var i=0; i< myFriends.length; i++) {

                        console.log(myFriends[i]);

                        // html += "<li class=\"list-group-item\"><a href=\"/profile/" /*+ myFriends[i].attributes.userID*/ + myFriends[i].attributes.name + "</a></li><br/>";
                    }

                    html += "</ul>";

                    $('#infinite-scroll-container').append(html);

                    break;

                default:
                //...
            }

            $(".nav").find(".active").removeClass("active");
            $(this).parent().addClass("active");

            //     // addViews(3);
            //     var activeTab = $(".nav").find(".active");
            //     var name = "null";
            //     lastItemId = 0;
            //
            //     var ajaxRequest = null;
            //
            //     if (activeTab != null) {
            //         name = activeTab.attr('id');
            //     }
            //     console.log(name);
            //
            //     // Construct AJAX Request based on type
            //     switch (name) {
            //         case 'nav-feed':
            //             urlAJAX = '/api/friendItems/0/' + numItems;
            //             ajaxRequest = null;
            //             addRealViews(html, urlAJAX);
            //             break;
            //
            //         case 'nav-discover':
            //             urlAJAX = '/api/allItems/0/' + numItems;
            //             ajaxRequest = null;
            //             addRealViews(html, urlAJAX);
            //             break;
            //
            //         case 'nav-gift':
            //             urlAJAX = null;
            //             ajaxRequest = null;
            //             break;
            //
            //         // default:
            //         //     urlAJAX = '/api/friendItems/0/' + numItems;
            //         //     ajaxRequest = null;
            //     }
            //
            //
        }

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

function addRealViews(html, urlAJAX) {
    // AJAX to fetch JSON objects from server
    $.ajax({
        url: urlAJAX,
        dataType: "json",
        method: 'get',
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
                    html += '<h6 class="item-header">' + value.title + '</h6>';
                    // Item Owner
                    html += '<p class="item-author">' + value.ownedBy.name + '</p>';
                    // Item Caption
                    html += '<p class="item-caption">' + value.description + '</p>';
                    // Item Call-to-Action Snag Button
                    html += '<div class="col-lg-12 text-center call-button"><a class="btn btn-primary itemcall" id="itemcall' + value.itemID + '" role="button">SNAG THIS ITEM</a></div>';
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

$(document).ready(function() {

    // Test Mode
    var test = true;
    // $('#first').val(1);
    // $('#limit').val(1);
    // addViews(6);
    // first = $('#first').val();
    // limit = $('#limit').val();
    urlAJAX = '/api/friendItems/' + lastItemId + '/' + numItems;
    console.log(urlAJAX);
    // addRealViews(html, urlAJAX);
    addViews(6);

    // AJAX Server-End URL
    // var urlAJAX = 'ajax.php';
    flag = true;

    $(window).scroll(function() {

        // Trigger the loading early
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            first = $('#first').val();
            limit = $('#limit').val();
            no_data = true;

            triggered += 1;

            if (flag && no_data && !test && triggered == 1) {
                flag = false;

                var activeTab = $(".nav").find(".active");
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
                        urlAJAX = '/api/friendItems/' + lastItemId + '/' + numItems;
                        ajaxRequest = null;
                        break;

                    case 'nav-discover':
                        urlAJAX = '/api/allItems/' + lastItemId + '/' + numItems;
                        ajaxRequest = null;
                        break;

                    case 'nav-gift':
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
                    addRealViews(html, urlAJAX);
                }

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
