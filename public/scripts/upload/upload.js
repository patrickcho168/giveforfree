function previewFile() {
    var cropbox = document.querySelector('#image');
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();

  var $uploadCrop;

  if (file) {
    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      alert("Your image is too large. Please upload a smaller image.");
    } else {
      reader.addEventListener("load", function () {
        $uploadCrop = $('#image').croppie({
          viewport: {
            width: 200,
            height: 200,
          },
          boundary: {
            width: 300,
            height: 300
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
        }).then(function(){
          console.log('jQuery bind complete');
        });

      }, false);

      $(".image-confirm").click(function() {
        $uploadCrop.croppie('result', {
          type: 'canvas',
          format: 'png',
          size: 'viewport'
        }).then(function (resp) {
          // Replace cropbox with image
          $(".image-crop").html("<p><strong>Item Pic</strong></p><img src='"+ resp +"' height='300' width='300'/>");
          $("input[name='croppedImage']").val(resp);
          $("input[type=file]").remove();
        });
      });
      reader.readAsDataURL(file);  
    }
  }
}

$('#date').bootstrapMaterialDatePicker({
    weekStart: 0,
    time: false
});

$('textarea').autosize();

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
