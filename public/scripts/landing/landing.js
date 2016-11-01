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

$(document).scroll(function() {
    var y = $(document).scrollTop();
    var midHeight = $(window).height()/2;
    if(y > midHeight) {
        $('.back-to-top').removeClass('hidden');
    } else {
        $('.back-to-top').addClass('hidden');
    }
})

function backToTop() {
    $('html, body').animate({ scrollTop: 0 }, 500);
}

function clickUserGuide() {
    var y = $('.help-panel').offset().top - 87;
    $('html, body').animate({ scrollTop: y }, 500);
}
