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

function clickLogo() {
    $('html, body').animate({ scrollTop: 0 }, 500);
}

$(document).ready(function() {

    $('.how-progress').on('click', function() {
        window.location.hash = '#how';
    });
    $('.who-progress').on('click', function() {
        window.location.hash = '#who';
    });
    $('.charity-progress').on('click', function() {
        window.location.hash = '#charity';
    });
    $('.faq-progress').on('click', function() {
        window.location.hash = '#faq';
    });
})