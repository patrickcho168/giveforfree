function previewFile() {
  var cropbox = document.querySelector('#image');
  var file    = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  reader.addEventListener("load", function () {
    cropbox.src = reader.result;

    $("#image").cropper({
      aspectRatio: 1 / 1,
      crop: function(e) {
        // Output the result data for cropping image.

        $("input[name='x']").val(e.x);
        $("input[name='y']").val(e.y);
        $("input[name='height']").val(e.height);
        $("input[name='width']").val(e.width);
        $("input[name='rotate']").val(e.rotate);
        $("input[name='scaleX']").val(e.scaleX);
        $("input[name='scaleY']").val(e.scaleY);
      }
    });

    $(".image-preview-filename").val("pic.img");
    
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
}
