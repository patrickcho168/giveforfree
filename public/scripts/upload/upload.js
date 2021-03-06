$(function() {
    initializeForm();

    $('[data-toggle="popover"]').popover();

    $('#date').bootstrapMaterialDatePicker({
        weekStart: 0,
        time: false,
        clearButton: true
    }).on('dateSelected', function(e, date) {
        $(".dtp-btn-ok").click();
    });

    $('#date').bootstrapMaterialDatePicker('setMinDate', moment());


    $('textarea').autosize();

    // var oldScroll = window.onscroll;
    // $(document).on('focus', 'input', function(e) {
    //     window.onscroll = function() {
    //         window.scroll(0, 0);
    //     };
    //     setTimeout(function() {
    //         window.onscroll = oldScroll;
    //     }, 100);
    // });

});

$(document).ready(function() {

    $('.donation-input').keyup(function(evt) {
        updateDonationDetail();
    });

    $('.charity-selection #charity1').prop('checked', true);
    $('.charity-selection img').removeClass('covered');
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
    $('.actual-amount').text('$'+theirs.toFixed(2));
    $('.fee').text('$'+fee.toFixed(2));
    $('.ours').text('$'+ours.toFixed(2));
}

function initializeForm() {
    $.validate({
        modules : 'logic, html5',
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

    var cropbox = document.querySelector('#image');
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();

    if (file) {
        console.log('check');
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
                        width: cropperWidth*0.8,
                        height: cropperWidth*0.8
                    },
                    boundary: {
                        width: cropperWidth,
                        height: cropperWidth,
                    },
                    enableExif: true,
                    showZoomer: true,
                    enforceBoundary: true
                });

                // Add something to the input text field
                $("div.image-preview").hide();
                $(".image-crop").show();
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

            $(".image-cancel").click(function() {
                $('#image-holder').show();
                $("div.image-preview").show();
                $(".image-crop").hide();
                $('#image').hide();
                $uploadCrop.croppie('destroy');

                var filebtn = $('#upload-trigger');
                filebtn.replaceWith( filebtn = filebtn.clone( true ) );
            });
            reader.readAsDataURL(file);
        }
    }

}

function selectCharity(currentSelection) {
    var checkBox = $(currentSelection).prev();
    var checked = checkBox.prop('checked');

    var allBoxes = $('.charity-selection input');
    var moneyInput = $('.money-input input');
    var allImg = $('.charity-selection img');

    allBoxes.prop('checked', false);
    allImg.addClass('covered');

    if (!checked) {
        checkBox.prop('checked', true);
        $(currentSelection).removeClass('covered');

        if (moneyInput.val() == 0) {
            moneyInput.val(2);
            $('.actual-amount').text('$1.4');
            $('.fee').text('$0.58');
            $('.ours').text('$0.02');
        }

    } else if ($('.no-charity').is(':visible')) {

    }
}
