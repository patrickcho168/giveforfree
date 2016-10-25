// Want
$(document).on("click", ".snag", function() {
    var itemId = $(this).attr('itemId');

    // Change text
    $($(this).children('span')[1]).text(" Unwant ");

    // Change color
    $(this).css('background-color', '#565656');
    $(this).children('.badge').css('color', '#565656');

    // Change type
    $(this).removeClass("snag");
    $(this).addClass("unsnag");

    // Increment number of people snagging
    var snag_count = parseInt($(this).children(".badge").text()) + 1;
    if (snag_count == 1) {
        $(this).children(".badge").text(snag_count + " wanter");
    } else {
        $(this).children(".badge").text(snag_count + " wanters");
    }
    $('#progress-want').addClass("completed");
    $('#progress-want').removeClass("active");
    $('#progress-give').addClass("active");

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

    // Change text
    $($(this).children('span')[1]).text(" Want ");

    // Change color
    $(this).css('background-color', '#c09f80');
    $(this).children('.badge').css('color', '#c09f80');
    // Change type
    $(this).removeClass("unsnag");
    $(this).addClass("snag");

    // Decrement number of people snagging
    var snag_count = parseInt($(this).children(".badge").text()) - 1;
        if (snag_count == 1) {
        $(this).children(".badge").text(snag_count + " wanter");
    } else {
        $(this).children(".badge").text(snag_count + " wanters");
    }
    $('#progress-want').removeClass("completed");
    $('#progress-want').addClass("active");
    $('#progress-give').removeClass("active");

    // Send post request
    $.post("/api/unwant/" + itemId)
        .done(function() {

        })
        .fail(function() {

        })
        .always(function() {

        });
});

// Rate Giver
$(document).on("click", ".ratingForTaker", function() {
    var itemId = $(this).parent().attr("itemId");
    var score = $(this).attr("value");

    // Change text
    $(this).parent().siblings('.ratingText').text("Thanks for giving a rating!");

    // Send post request
    $.post("/api/item/" + itemId + "/rateTaker/" + score)
        .done(function() {

        })
        .fail(function() {

        })
        .always(function() {

        });
})

// Rate Giver
$(document).on("click", ".ratingForGiver", function() {
    var itemId = $(this).parent().attr("itemId");
    var score = $(this).attr("value");

    // Change text
    $(this).parent().siblings('.ratingText').text("Thanks for giving a rating!");

    // Send post request
    $.post("/api/item/" + itemId + "/rateGiver/" + score)
        .done(function() {

        })
        .fail(function() {

        })
        .always(function() {

        });
})

// Rate Giver
$(document).on("click", "#delivered", function() {
    var itemId = $(this).attr("itemId");
    $('#progress-deliver').removeClass("active");
    $('#progress-deliver').addClass("completed");
    $(this).addClass('disabled');

    // Send post request
    $.post("/api/item/deliver/" + itemId)
        .done(function() {

        })
        .fail(function() {

        })
        .always(function() {

        });
})

// For modification
$(document).on('click', '.btn-modify', function() {
    $('.mobile-modify-button').toggleClass('hidden');
    $('.modify-button').toggleClass('hidden');
    $('.want-button').toggleClass('hidden');
    $('.edit-button-group').toggleClass('hidden');
    $('.mobile-edit-button-group').toggleClass('hidden');
    $('.info-edit').toggleClass('hidden');
    $('.info-display').toggleClass('hidden');
    $('.charity-info').css('display', 'block');
});

$(document).on('click', '.btn-cancel', function() {
    $('.mobile-modify-button').toggleClass('hidden');
    $('.modify-button').toggleClass('hidden');
    $('.want-button').toggleClass('hidden');
    $('.edit-button-group').toggleClass('hidden');
    $('.mobile-edit-button-group').toggleClass('hidden');
    $('.info-edit').toggleClass('hidden');
    $('.info-display').toggleClass('hidden');
    $('.charity-info').css('display', 'flex');
});

$(document).on('click', '.mobile-btn-modify', function() {
    $('.mobile-modify-button').toggleClass('hidden');
    $('.modify-button').toggleClass('hidden');
    $('.want-button').toggleClass('hidden');
    $('.edit-button-group').toggleClass('hidden');
    $('.mobile-edit-button-group').toggleClass('hidden');
    $('.info-edit').toggleClass('hidden');
    $('.info-display').toggleClass('hidden');
    $('html, body').animate({ scrollTop: 0 }, 500);
});

$(document).on('click', '.mobile-btn-cancel', function() {
    $('.mobile-modify-button').toggleClass('hidden');
    $('.modify-button').toggleClass('hidden');
    $('.want-button').toggleClass('hidden');
    $('.edit-button-group').toggleClass('hidden');
    $('.mobile-edit-button-group').toggleClass('hidden');
    $('.info-edit').toggleClass('hidden');
    $('.info-display').toggleClass('hidden');
    $('html, body').animate({ scrollTop: 0 }, 500);
});

// Donate
$(document).on('click', '#paypal', function() {
    $('body').removeClass('loaded');

    var itemId = $(this).attr("itemId");
    var price = $(this).attr("price");
    var charityName = $(this).attr("charityName");
    var charityEmail = $(this).attr("charityEmail");
    var charityId = $(this).attr("charityID");
    var redirectUrl = "https://giveforfree.sg";
    $('#progress-donate').removeClass("active");
    $('#progress-donate').addClass("completed");
    $('#progress-deliver').addClass("active");
    // $('#delivered').removeClass("hidden");
    $(this).addClass('disabled');
    if (false) {
        // Send post request
        $.post("/api/item/donate/" + itemId)
            .done(function() {

            })
            .fail(function() {

            })
            .always(function() {

            });
    } else {
        var body = {
            charityName: charityName,
            charityEmail: charityEmail,
            cost: price,
            redirectUrl: redirectUrl,
            itemId: itemId,
            charityId: charityId
        };
        $.ajax({type:'post',
            url:'/api/paypalAdpay',
            data:body,
            datatype:'json',
            success: function(data){
                window.location = data;
            }
        });
    }
})

// Carousel Logic
jQuery(document).ready(function($) {
    updateDonationDetail();

    $('.donation-input').keyup(function() {
        updateDonationDetail();
    });

    $.ajaxSetup({
        headers: {'X-CSRF-Token': $('meta[name="_csrf"]').attr('content')}
    });

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

    $('#comments-container').comments({
        roundProfilePictures: true,
        readOnly: loggedIn ? false : true,
        profilePictureURL: 'http://graph.facebook.com/' + userFbId + '/picture',
        getComments: function(success, error) {
            $.ajax({
                url: '/item/' + currentItemId + '/comment',
                dataType: "json",
                method: 'get',
                cache: false,
                // Success Callback
                success: function(data) {
                    var commentsArray = [];
                    for (var i=0; i<data.length; ++i) {
                        var upvoted = false;
                        for (var j=0; j<data[i].upvote.length; ++j) {
                            if (data[i].upvote[j].userID === userId) {
                                upvoted = true;
                                break;
                            }
                        }
                        commentsArray.push({
                            id: data[i].commentID,
                            created: data[i].timeCreated,
                            content: data[i].message,
                            fullname: data[i].commentedBy.name,
                            // fullname: data[i].commentedBy.name,
                            upvote_count: data[i].upvote.length,
                            user_has_upvoted: upvoted,
                            profile_picture_url: 'http://graph.facebook.com/' + data[i].commentedBy.fbID + '/picture',
                            parent: data[i].parentComment,
                            created_by_current_user: data[i].commentedBy.userID === userId
                        })
                    }
                    success(commentsArray);
                },
                error: function(error) {
                    console.log("error loading");
                }
            });
        },
        postComment: function(commentJSON, success, error) {
            $.ajax({
                method: 'post',
                url: '/api/comment/' + currentItemId,
                data: commentJSON,
                dataType: "json",
                success: function(data) {
                    var upvoted = false;
                    for (var i=0; i<data.upvote.length; ++i) {
                        if (data.upvote[i].userID === userId) {
                            upvoted = true;
                            break;
                        }
                    }
                    success({
                        id: data.commentID,
                        created: data.timeCreated,
                        content: data.message,
                        fullname: data.commentedBy.name,
                        upvote_count: data.upvote.length,
                        user_has_upvoted: upvoted,
                        profile_picture_url: 'http://graph.facebook.com/' + data.commentedBy.fbID + '/picture',
                        parent: data.parentComment,
                        created_by_current_user: data.commentedBy.userID === userId
                    });
                },
                error: function(error) {
                    console.log("error posting");
                }
            });
        },
        putComment: function(commentJSON, success, error) {
            $.ajax({
                type: 'post',
                url: '/api/updatecomment/' + commentJSON.id,
                data: commentJSON,
                success: function(data) {
                    var upvoted = false;
                    for (var i=0; i<data.upvote.length; ++i) {
                        if (data.upvote[i].userID === userId) {
                            upvoted = true;
                            break;
                        }
                    }
                    if (data) {
                        success({
                            id: data.commentID,
                            created: data.timeCreated,
                            content: data.message,
                            fullname: data.commentedBy.name,
                            upvote_count: data.upvote.length,
                            user_has_upvoted: upvoted,
                            profile_picture_url: 'http://graph.facebook.com/' + data.commentedBy.fbID + '/picture',
                            parent: data.parentComment,
                            created_by_current_user: data.commentedBy.userID === userId
                        });
                    } else {
                        success({});
                    }
                },
                error: function(error) {
                    console.log("error editing");
                }
            });
        },
        deleteComment: function(commentJSON, success, error) {
            $.ajax({
                type: 'post',
                url: '/api/deletecomment/' + commentJSON.id,
                success: function(data) {
                    success();
                },
                error: function(error) {
                    console.log("error editing");
                }
            });
        },
        upvoteComment: function(commentJSON, success, error) {
            var upvotesURL = '/api/comment/upvotes/' + commentJSON.id;
            var downvotesURL = '/api/comment/downvotes/' + commentJSON.id;

            if(commentJSON.user_has_upvoted) {
                $.ajax({
                    type: 'post',
                    url: upvotesURL,
                    success: function(data) {
                        var upvoted = false;
                        for (var i=0; i<data.upvote.length; ++i) {
                            if (data.upvote[i].userID === userId) {
                                upvoted = true;
                                break;
                            }
                        }
                        if (data) {
                            success({
                                id: data.commentID,
                                created: data.timeCreated,
                                content: data.message,
                                fullname: data.commentedBy.name,
                                upvote_count: data.upvote.length,
                                user_has_upvoted: upvoted,
                                profile_picture_url: 'http://graph.facebook.com/' + data.commentedBy.fbID + '/picture',
                                parent: data.parentComment,
                                created_by_current_user: data.commentedBy.userID === userId
                            });
                        } else {
                            success({});
                        }
                    },
                    error:  function() {
                        console.log("error upvoting");
                    }
                });
            } else {
                $.ajax({
                    type: 'post',
                    url: downvotesURL,
                    success: function(data) {
                        var upvoted = false;
                        for (var i=0; i<data.upvote.length; ++i) {
                            if (data.upvote[i].userID === userId) {
                                upvoted = true;
                                break;
                            }
                        }
                        if (data) {
                            success({
                                id: data.commentID,
                                created: data.timeCreated,
                                content: data.message,
                                fullname: data.commentedBy.name,
                                upvote_count: data.upvote.length,
                                user_has_upvoted: upvoted,
                                profile_picture_url: 'http://graph.facebook.com/' + data.commentedBy.fbID + '/picture',
                                parent: data.parentComment,
                                created_by_current_user: data.commentedBy.userID === userId
                            });
                        } else {
                            success({});
                        }
                    },
                    error: function() {
                        console.log("error downvoting");
                    }
                });
            }
        }
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

    $('.description-field').popover({
        container: 'body',
        content: 'E.g. Size and measurements, old/new, used/unused, etc.',
        placement: 'bottom'
    });

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

function selectCharity(currentSelection) {
    var checkBox = $(currentSelection).prev();
    var checked = checkBox.prop('checked');

    var allBoxes = $('.charity-selection input');
    var moneyInput = $('.money-input input');
    var allImg = $('.charity-selection img');

    allBoxes.prop('checked', false);
    moneyInput.prop('disabled', true);
    allImg.addClass('covered');
    $('.no-charity').removeClass('hidden');

    if (!checked) {
        checkBox.prop('checked', true);
        moneyInput.prop('disabled', false);
        $(currentSelection).removeClass('covered');
        $('.no-charity').addClass('hidden');
    }
}

function culculateTheirs(total) {
    var fees = culculateFee(total);
    var ours = culculateOurs(total) + fees;
    return total - ours < 0 ? 0 : total - ours;
}

function culculateFee(total) {
    return 3.9 * total/100 + 0.5;
}

function culculateOurs(total) {
    return Math.min(1.1 * total/100, 1);
}

function updateDonationDetail() {
    var donationAmount = $('.donation-input').val();
    var total = parseFloat(donationAmount);
    var theirs, ours, fee;
    if (isNaN(total)) {
        theirs = 0;
        fee = 0;
        ours = 0;
    } else {
        theirs = culculateTheirs(total);
        fee = culculateFee(total);
        ours = culculateOurs(total);
    }
    $('.actual-amount').text(theirs.toFixed(2));
    $('.fee').text(fee.toFixed(2));
    $('.ours').text(ours.toFixed(2));
}
