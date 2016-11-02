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
    var y = $('.howitworks-panel').offset().top - 87;
    $('html, body').animate({ scrollTop: y }, 500);
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

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        $("#howitworksimg").attr("src", "/images/landing/howitworks.png");
    }
})

// send user to facebook login
$(document).on('click', '.btn-give-no-login', function(e) {
    e.preventDefault();
    swal({
        title: 'Login with Facebook!',
        text: 'You need to login to donate a gift',
        showCancelButton: true,
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        imageUrl: "../../images/common/gff-logo-s.svg",
    },
    function() {
        window.location.href = "/login?redirect=/upload";
    });
});
