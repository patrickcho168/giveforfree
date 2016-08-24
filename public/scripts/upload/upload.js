$(document).on('click', '#close-preview', function() {
    $('.image-preview').popover('hide');
    // Hover befor close the preview
    $('.image-preview').hover(
        function() {
            $('.image-preview').popover('show');
        },
        function() {
            $('.image-preview').popover('hide');
        }
    );
});

$(function() {
    // Create the close button
    var closebtn = $('<button/>', {
        type: "button",
        text: 'x',
        id: 'close-preview',
        style: 'font-size: initial;',
    });
    closebtn.attr("class", "close pull-right");
    // Set the popover default content
    $('.image-preview').popover({
        trigger: 'manual',
        html: true,
        title: "<strong>Preview</strong>" + $(closebtn)[0].outerHTML,
        content: "There's no image",
        placement: 'top'
    });
    // Clear event
    $('.image-preview-clear').click(function() {
        $('.image-preview').attr("data-content", "").popover('hide');
        $('.image-preview-filename').val("");
        $('.image-preview-clear').hide();
        $('.image-preview-input input:file').val("");
        $(".image-preview-input-title").text("Browse");
    });
    // Create the preview image
    $(".image-preview-input input:file").change(function() {
        var img = $('<img/>', {
            id: 'dynamic',
            width: 250,
            height: 200
        });
        // var file = filename;
        var reader = new FileReader();
        // Set preview image into the popover data-content
        reader.onload = function(e) {
            $(".image-preview-input-title").text("Change");
            $(".image-preview-clear").text("Clear");
            $(".image-preview-clear").show();
            $(".image-preview-filename").val("input-file-preview");
            img.attr('src', e.target.result);
            $(".image-preview").attr("data-content", $(img)[0].outerHTML).popover("show");
        }
        var file = document.querySelector('input[type=file]').files[0];
        if (file) {
            reader.readAsDataURL(file);
        }
    });

    $('#date').bootstrapMaterialDatePicker({
        weekStart: 0,
        time: false
    });

    $('textarea').autosize();

});

// $("myDropdown").onblur(function() {
//     document.getElementById('myDropdown').style.display = 'none';
// });

function toggle() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("category");
    filter = input.value.toUpperCase();
    div = document.getElementById("myDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

function changeValue(value) {
    var input, filter, ul, li, a, i;
    input = document.getElementById("category");
    input.value = value;
}

function checkValue() {
    var input, filter, ul, li, a, i;
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

    input = document.getElementById("category");

    var found = $.inArray(input.value, categories);

    if (found == -1) {
        input.value = "other";
    }
}
