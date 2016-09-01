// Want
$(document).on("click", ".snag", function() {
    var itemId = $(this).attr('itemId');
    console.log("Item", itemId, "has been snagged");

    // Change text
    $(this).children('b').text("UNWANT!");

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
    $(this).children('b').text("WANT!");

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

    $('#comments-container').comments({
        roundProfilePictures: true,
        // profilePictureURL: 'http://graph.facebook.com/' + userFbID + '/picture',
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
