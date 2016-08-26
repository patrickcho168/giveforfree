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

    $('#image').show();

    reader.addEventListener("load", function() {
        // Add something to the input text field
        $(".image-preview-filename").val("pic.img");

        var $uploadCrop;

        $('#image-holder').hide();


        $uploadCrop = $('#image').croppie({
            viewport: {
                width: 200,
                height: 200,
            },
            boundary: {
                width: 300,
                height: 300
            },
            enableExif: true
        });

        $uploadCrop.croppie('bind', {
            url: reader.result
        }).then(function() {
            console.log('jQuery bind complete');
        });

    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }

}
