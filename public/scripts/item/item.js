// Want
$(document).on("click", ".snag", function() {
    var itemId = $(this).attr('itemId');
    console.log("Item", itemId, "has been snagged");

    // Change text
    $(this).children('b').text("UNSNAG");

    // Change color
    $(this).removeClass("btn-primary");
    $(this).addClass("btn-danger");

    // Change type
    $(this).removeClass("snag");
    $(this).addClass("unsnag");

    // Increment number of people snagging
    var snag_count = parseInt($(this).children(".badge").text()) + 1;
    $(this).children(".badge").text(snag_count);

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

// Unwant
$(document).on("click", ".unsnag", function() {
    var itemId = $(this).attr('itemId');
    console.log("Item", itemId, "has been unsnagged");

    // Change text
    $(this).children('b').text("SNAG");

    // Change color
    $(this).removeClass("btn-danger");
    $(this).addClass("btn-primary");

    // Change type
    $(this).removeClass("unsnag");
    $(this).addClass("snag");

    // Decrement number of people snagging
    var snag_count = parseInt($(this).children(".badge").text()) - 1;
    $(this).children(".badge").text(snag_count);

    // Send post request
    $.post("/api/unwant/" + itemId)
        .done(function() {

        })
        .fail(function() {

        })
        .always(function() {

        });
});

// Carousel Logic
jQuery(document).ready(function($) {

    $('.carousel').carousel({
        interval: false
    });

    $('#carousel-text').html($('#slide-content-0').html());

    //Handles the carousel thumbnails
    $('[id^=carousel-selector-]').click(function() {
        var id = this.id.substr(this.id.lastIndexOf("-") + 1);
        var id = parseInt(id);
        $('#myCarousel').carousel(id);
    });


    // When the carousel slides, auto update the text
    $('.carousel').on('slid.bs.carousel', function(e) {
        var id = $('.item.active').data('slide-number');
        $('#carousel-text').html($('#slide-content-' + id).html());
    });

});

$(function() {
    var cw = $('.carousel').width();

    $('.display-item').css({
        'height': cw + 'px'
    });

    $("textarea").height($("textarea")[0].scrollHeight);

    $('#date').bootstrapMaterialDatePicker({
        weekStart: 0,
        time: false
    });

    $('#date').bootstrapMaterialDatePicker('setMinDate', moment());


    $('textarea').autosize();

    $('#input-tags').selectize({
        delimiter: ',',
        persist: false,
        create: function(input) {
            // var options = ["clothes", "accessories", "furniture & home", "parenting", "health", "beauty", "kitchen appliances", "gardening", "property", "design & craft", "electronics", "sports", "photography", "antiques", "toys", "games", "music", "tickets & vouchers", "auto accessories", "books", "stationeries", "textbooks", "notes", "pets", "other"];

            return {
                value: "other",
                text: "other"
            }
        }
    });

    $('#select-mode').selectize({
        create: true,
        sortField: 'text'
    });

    $('.description-field').popover({
        container: 'body',
        content: 'E.g. Size and measurements, old/new, used/unused, etc.',
        placement: 'bottom'
    });

    $("[name='share-checkbox']").bootstrapSwitch();

    $('#confirm-delete').on('show.bs.modal', function(e) {
        $(this).find('.btn-ok').attr('href', $(e.relatedTarget).data('href'));
    });
});

$(window).resize(function() {
    var cw = $('.carousel').width();

    $('#display-item').css({
        'height': cw + 'px'
    });
});

function handleBrokenImage(image) {
    image.onerror = "";
    image.src = "/images/common/default-placeholder.png";
    return true;
}
