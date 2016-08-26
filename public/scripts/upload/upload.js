function previewFile() {
  var cropbox = document.querySelector('#image');
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

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
          $(".image-crop").html("<h2>Item Pic</h2><img src='"+ resp +"' height='200' width='200'/>");
          $("input[name='croppedImage']").val(resp);
          $("input[type=file]").remove();
        });
      });
      reader.readAsDataURL(file);  
    }
  }
}
