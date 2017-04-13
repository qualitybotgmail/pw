<?php 

class ImageCorrector{
    function orientationFixedImage($input, $output){
        $image = imagecreatefromstring(file_get_contents($input));
        $exif = exif_read_data($input);
        if(!empty($exif['Orientation'])) {
            switch($exif['Orientation']) {
                case 8:
                    $image = imagerotate($image,90,0);
                    break;
                case 3:
                    $image = imagerotate($image,180,0);
                    break;
                case 6:
                    $image = imagerotate($image,-90,0);
                    break;
            }
        }
        imagejpeg($image ,$output);
        imagedestroy($image);
    }
}