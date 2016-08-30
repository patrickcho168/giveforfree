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
                value: input,
                text: input
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
    var node = document.getElementById('image');
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
    var cropbox = document.querySelector('#image');
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();

    // reader.addEventListener("load", function() {
    //     // Add something to the input text field
    //     $(".image-preview-filename").val("pic.img");
    //
    //     var $uploadCrop;
    //
    //
    //
    //     $uploadCrop = $('#image').croppie({
    //         viewport: {
    //             width: 200,
    //             height: 200,
    //         },
    //         boundary: {
    //             width: 300,
    //             height: 300
    //         },
    //         enforceBoundary: false,
    //         enableExif: true,
    //         showZoomer: false
    //     });
    //
    //     // Add something to the input text field
    //     $(".image-preview-filename").val("pic.img");
    //     $("div.image-preview").remove();
    //     $(".image-crop").attr('style', '');
    //     $uploadCrop.croppie('bind', {
    //         url: reader.result
    //     }).then(function() {
    //         console.log('jQuery bind complete');
    //     });
    //
    // }, false);
    //
    // $(".image-confirm").click(function() {
    //     $uploadCrop.croppie('result', {
    //         type: 'canvas',
    //         format: 'png',
    //         size: 'viewport'
    //     }).then(function(resp) {
    //         // Replace cropbox with image
    //         $(".image-crop").html("<p><strong>Item Pic</strong></p><img src='" + resp + "' height='300' width='300'/>");
    //         $("input[name='croppedImage']").val(resp);
    //         $("input[type=file]").remove();
    //     });
    // });
    // reader.readAsDataURL(file);

    if (file) {
        // Check file size
        if (file.size > 5 * 1024 * 1024) {
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
                        width: 200,
                        height: 200,
                    },
                    boundary: {
                        width: 240,
                        height: 240,
                    },
                    enforceBoundary: false,
                    enableExif: true,
                    showZoomer: false
                });

                // Add something to the input text field
                $(".image-preview-filename").val("pic.img");
                $("div.image-preview").remove();
                $(".image-crop").attr('style', '');
                $uploadCrop.croppie('bind', {
                    url: reader.result
                }).then(function() {
                    console.log('jQuery bind complete');
                });

            }, false);

            $(".image-confirm").click(function() {
                $uploadCrop.croppie('result', {
                    type: 'canvas',
                    format: 'png',
                    size: 'viewport'
                }).then(function(resp) {
                    // Replace cropbox with image
                    $(".image-crop").html("<img src='" + resp + "'width='90%' style='padding: 15px; margin-left: 15px; margin-right: 15px; position: relative;'/>");
                    $("input[name='croppedImage']").val(resp);
                    $("input[type=file]").remove();
                });
            });
            reader.readAsDataURL(file);
        }
    }
}
