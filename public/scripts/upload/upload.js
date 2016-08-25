function previewFile() {
  var cropbox = document.querySelector('#image');
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  // $uploadCrop = $('#image').croppie({
  //   viewport: {
  //     width: 100,
  //     height: 100,
  //     type: 'circle'
  //   },
  //   boundary: {
  //     width: 300,
  //     height: 300
  //   },
  //   enableExif: true
  // });

  reader.addEventListener("load", function () {
    // Add something to the input text field
    $(".image-preview-filename").val("pic.img");

    var $uploadCrop;
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
    }).then(function(){
      console.log('jQuery bind complete');
    });
  }, false);

  if (file) {
    reader.readAsDataURL(file);
 }
}
