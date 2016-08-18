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
    // var snag_count = parseInt($(this).parent().siblings('small').text()) + 1;
    // $(this).parent().siblings('small').text(String(snag_count) + (snag_count === 1 ? ' person' : ' people') + ' snagged this.');

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
    // var snag_count = parseInt($(this).parent().siblings('small').text()) - 1;
    // $(this).parent().siblings('small').text(String(snag_count) + (snag_count === 1 ? ' person' : ' people') + ' snagged this.');


    // Send post request
    $.post("/api/unwant/" + itemId)
        .done(function() {

        })
        .fail(function() {

        })
        .always(function() {

        });
});

jQuery(document).ready(function($) {

      $('#myCarousel').carousel({
              interval: 5000
      });

      $('#carousel-text').html($('#slide-content-0').html());

      //Handles the carousel thumbnails
     $('[id^=carousel-selector-]').click( function(){
          var id = this.id.substr(this.id.lastIndexOf("-") + 1);
          var id = parseInt(id);
          $('#myCarousel').carousel(id);
      });


      // When the carousel slides, auto update the text
      $('#myCarousel').on('slid.bs.carousel', function (e) {
               var id = $('.item.active').data('slide-number');
              $('#carousel-text').html($('#slide-content-'+id).html());
      });
});
