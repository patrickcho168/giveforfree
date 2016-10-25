$(function() {
    initializeForm();

    $('[data-toggle="popover"]').popover();

    $('#date').bootstrapMaterialDatePicker({
        weekStart: 0,
        time: false
    });

    $('#date').bootstrapMaterialDatePicker('setMinDate', moment());


    $('textarea').autosize();

    var oldScroll = window.onscroll;
    $(document).on('focus', 'input', function(e) {
        window.onscroll = function() {
            window.scroll(0, 0);
        };
        setTimeout(function() {
            window.onscroll = oldScroll;
        }, 100);
    });

});

$(document).ready(function() {
    $('.donation-input').focus(function(evt) {
        evt.preventDefault();
    });

    $('.donation-input').keyup(function() {
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
        console.log(theirs);
        console.log(theirs.toFixed(2));
        $('.actual-amount').text(theirs.toFixed(2));
        $('.fee').text(fee.toFixed(2));
        $('.ours').text(ours.toFixed(2));
    });
});

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

function initializeForm() {
    $.validate({
        modules : 'logic',
        validateHiddenInputs: true,
        validateOnBlur: false,
        onError : function($form) {
          $.notify({
              // options
                message: "You didn't fill up some fields. Please check again."
          }, {
              // settings
              type: 'danger'
          });
        },
        onSuccess: function($form) {
            // If image is cropped
            if ($("input[name='croppedImage']").val() != "") {
                return true;

            // If image selected but not cropped
            } else if ($("div.image-preview").length == 0) {

                $.notify({
                    // options
                      message: "Please finish cropping your image."
                }, {
                    // settings
                    type: 'danger'
                });

                return false;

            // If image not yet uploaded
            } else {
                $.notify({
                    // options
                      message: "Please upload an image for your item!"
                }, {
                    // settings
                    type: 'danger'
                });

                return false;
            }
        }
    });
}

function triggerUpload() {
    $('#upload-trigger').trigger('click');
}

function previewFile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        var cropperWidth = 180;
    } else {
        var boxWidth = $("div[id=\"cropperHolder\"]").width() * 0.7;
        var cropperWidth = boxWidth > 180 ? boxWidth : 180;
    }


    $('#create-upload').attr("disabled", "disabled");
    var node = document.getElementById('image');
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
    var cropbox = document.querySelector('#image');
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();

    if (file) {
        // Check file type
        if (file.type.indexOf("image") == -1) {
            $('#create-upload').attr("disabled", "disabled");
            $.notify({
                // options
                message: "That file you tried to upload doesn't look like an image. Please try a different file."
            }, {
                // settings
                type: 'danger'
            });
        }
        // Check file size
        else if (file.size > 5 * 1024 * 1024) {
            $('#create-upload').attr("disabled", "disabled");
            $.notify({
                // options
                message: 'Your image is too large. Please upload a smaller image.'
            }, {
                // settings
                type: 'danger'
            });
        } else {
            $('#image-holder').hide();
            $('#image').show();
            reader.addEventListener("load", function() {
                $uploadCrop = $('#image').croppie({
                    viewport: {
                        width: cropperWidth*0.9,
                        height: cropperWidth*0.9,
                    },
                    boundary: {
                        width: cropperWidth,
                        height: cropperWidth,
                    },
                    enforceBoundary: false,
                    enableExif: true,
                    showZoomer: true
                });

                // Add something to the input text field
                $(".image-preview-filename").val("pic.img");
                $("div.image-preview").remove();
                $(".image-crop").attr('style', '');
                $uploadCrop.croppie('bind', {
                    url: reader.result
                }).then(function() {
                    // console.log('jQuery bind complete');
                });

            }, false);

            $(".image-confirm").click(function() {
                $uploadCrop.croppie('result', {
                    type: 'canvas',
                    format: 'jpeg',
                    size: {'width': 400},
                    quality: 1
                }).then(function(resp) {
                    // Replace cropbox with image
                    $(".image-crop").html("<img src='" + resp + "'width='90%' style='padding: 15px; margin-left: 15px; margin-right: 15px; position: relative;'/>");
                    $("input[name='croppedImage']").val(resp);
                    $('#create-upload').removeAttr("disabled");

                });
            });
            reader.readAsDataURL(file);
        }
    }

}

function toggleShareColor() {
    $('.share-info i').toggleClass('active');
}

function selectCharity(currentSelection) {
    var checkBox = $(currentSelection).prev();
    var checked = checkBox.prop('checked');

    var allBoxes = $('.charity-selection input');
    var freeBox = $("input[name='givefree']");
    var moneyInput = $('.money-input input');
    var allImg = $('.charity-selection img');

    allBoxes.prop('checked', false);
    freeBox.prop('checked', false);
    allImg.addClass('covered');

    if (!checked) {
        checkBox.prop('checked', true);
        $(currentSelection).removeClass('covered');

        $('.no-charity').removeClass('covered');
        if (moneyInput.val() == 0) {
            moneyInput.val(2);
            $('.actual-amount').text(1.4);
            $('.fee').text(0.58);
            $('.ours').text(0.02);
        }

        moneyInput.prop('disabled', false);
    } else if ($('.no-charity').is(':visible')) {
        $('.no-charity').addClass('covered');
        moneyInput.prop('disabled', true);
    }
}

function giveFree(freebox) {
    if ($(freebox).prop('checked') == true) {
        var moneyInput = $('.money-input input');

        // Set charities to zero
        $('.no-charity').addClass('covered');
        moneyInput.prop('disabled', true);
        moneyInput.val(0);
        $('.actual-amount').text(0);
        $('.fee').text(0);
        $('.ours').text(0);

        var allBoxes = $('.charity-selection input');
        var allImg = $('.charity-selection img');

        allBoxes.prop('checked', false);
        allImg.addClass('covered');
    }
}
