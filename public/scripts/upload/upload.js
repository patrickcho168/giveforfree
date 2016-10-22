$(function() {
    var REGEX_ALPHA_NUMERIC = '([^\w\s])';

    var categories = [
        "clothes",
        "accessories",
        "furniture & home",
        "parenting",
        "health",
        "beauty",
        "kitchen appliances",
        "gardening",
        "property",
        "design & craft",
        "electronics",
        "sports",
        "photography",
        "antiques",
        "toys",
        "games",
        "music",
        "tickets & vouchers",
        "auto accessories",
        "books",
        "stationery",
        "textbooks",
        "notes",
        "pets",
        "other"
    ];

    $('[data-toggle="popover"]').popover();

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
