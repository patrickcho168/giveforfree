// Smooth Scrolling to Anchors
$(function () {
    $('a[href*="#"]:not([href="#"])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });
});

// Linking Navbar with Scroll
$(function () {

    var loginHeightThreshold = $("#login").offset().top - 50;
    var loginHeightThreshold_end = $("#login").offset().top + $("#login").height() - 50;

    var aboutHeightThreshold = $("#login").offset().top + $("#login").height() - 49;
    var aboutHeightThreshold_end = $("#about").offset().top + $("#about").height() - 50;

    var contactHeightThreshold = $("#about").offset().top + $("#about").height() - 49;
    var contactHeightThreshold_end = $("#contact").offset().top + $("#contact").height();

    $(window).resize(function () {
        loginHeightThreshold = $("#login").offset().top - 50;
        loginHeightThreshold_end = $("#login").offset().top + $("#login").height() - 50;

        aboutHeightThreshold = $("#login").offset().top + $("#login").height() - 49;
        aboutHeightThreshold_end = $("#about").offset().top + $("#about").height() - 50;

        contactHeightThreshold = $("#about").offset().top + $("#about").height() - 49;
        contactHeightThreshold_end = $("#contact").offset().top + $("#contact").height();
    });

    $(window).scroll(function () {
        var scroll = $(window).scrollTop();

        if (scroll >= loginHeightThreshold && scroll <= loginHeightThreshold_end) {
            $(".nav").find(".active").removeClass("active");
            $("#nav-login").addClass("active");
            $("#nav-about").removeClass("active");
            $("#nav-contact").removeClass("active");
        } else if (scroll >= aboutHeightThreshold && scroll <= aboutHeightThreshold_end) {
            $(".nav").find(".active").removeClass("active");
            $("#nav-about").addClass("active");
            $("#nav-login").removeClass("active");
            $("#nav-contact").removeClass("active");
        } else if (scroll >= contactHeightThreshold && scroll <= contactHeightThreshold_end) {
            $(".nav").find(".active").removeClass("active");
            $("#nav-contact").addClass("active");
            $("#nav-login").removeClass("active");
            $("#nav-about").removeClass("active");
        } else {}
    });
});

// Dynamic animation class for icons at "About" section
$(function () {
    var gift = $('#gift-icon');
    var friends = $('#friends-icon');
    var karma = $('#karma-icon');

    var icon1 = $('#feat-1');
    var icon2 = $('#feat-2');
    var icon3 = $('#feat-3');

    var icon4 = $('#feat-4');
    var icon5 = $('#feat-5');
    var icon6 = $('#feat-6');

    var heightThreshold = $("#about-container").offset().top - 70;
    var heightThreshold_end = $("#about-container").offset().top + $("#about-container").height();

    var secondaryHeightThreshold = $("#sub-first").offset().top - 130;
    var secondaryHeightThreshold_end = $("#sub-first").offset().top + $("#sub-first").height();

    var tertiaryHeightThreshold = $("#sub-second").offset().top - 170;
    var tertiaryHeightThreshold_end = $("#sub-second").offset().top + $("#sub-second").height();

    $(window).scroll(function () {
        var scroll = $(window).scrollTop();

        if (scroll >= heightThreshold && scroll <= heightThreshold_end) {
            gift.addClass('animated rubberBand');
            friends.addClass('animated rubberBand');
            karma.addClass('animated rubberBand');
        } else {
            gift.removeClass('animated rubberBand');
            friends.removeClass('animated rubberBand');
            karma.removeClass('animated rubberBand');
        }

        if (scroll >= secondaryHeightThreshold && scroll <= secondaryHeightThreshold_end) {
            icon1.addClass('animated wobble');
            icon2.addClass('animated wobble');
            icon3.addClass('animated wobble');
        } else {
            icon1.removeClass('animated wobble');
            icon2.removeClass('animated wobble');
            icon3.removeClass('animated wobble');
        }

        if (scroll >= tertiaryHeightThreshold && scroll <= tertiaryHeightThreshold_end) {
            icon4.addClass('animated wobble');
            icon5.addClass('animated wobble');
            icon6.addClass('animated wobble');
        } else {
            icon4.removeClass('animated wobble');
            icon5.removeClass('animated wobble');
            icon6.removeClass('animated wobble');
        }
    });

});
