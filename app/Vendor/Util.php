<?php
class imaging
{

    // Variables
    private $img_input;
    private $img_output;
    private $img_src;
    private $format;
    private $quality = 80;
    private $x_input;
    private $y_input;
    private $x_output;
    private $y_output;
    private $resize;

    // Set image
    public function set_img($img)
    {

        // Find format
        $ext = strtoupper(pathinfo($img, PATHINFO_EXTENSION));

        // JPEG image
        if(is_file($img) && ($ext == "JPG" OR $ext == "JPEG"))
        {

            $this->format = $ext;
            $this->img_input = ImageCreateFromJPEG($img);
            $this->img_src = $img;
            

        }

        // PNG image
        elseif(is_file($img) && $ext == "PNG")
        {

            $this->format = $ext;
            $this->img_input = ImageCreateFromPNG($img);
            $this->img_src = $img;

        }

        // GIF image
        elseif(is_file($img) && $ext == "GIF")
        {

            $this->format = $ext;
            $this->img_input = ImageCreateFromGIF($img);
            $this->img_src = $img;

        }

        // Get dimensions
        $this->x_input = imagesx($this->img_input);
        $this->y_input = imagesy($this->img_input);

    }

    // Set maximum image size (pixels)
    public function set_size($size = 100)
    {

        // Resize
        if($this->x_input > $size && $this->y_input > $size)
        {

            // Wide
            if($this->x_input >= $this->y_input)
            {

                $this->x_output = $size;
                $this->y_output = ($this->x_output / $this->x_input) * $this->y_input;

            }

            // Tall
            else
            {

                $this->y_output = $size;
                $this->x_output = ($this->y_output / $this->y_input) * $this->x_input;

            }

            // Ready
            $this->resize = TRUE;

        }

        // Don't resize
        else { $this->resize = FALSE; }

    }

    // Set image quality (JPEG only)
    public function set_quality($quality)
    {

        if(is_int($quality))
        {

            $this->quality = $quality;

        }

    }

    // Save image
    public function save_img($path)
    {

        // Resize
        if($this->resize)
        {

            $this->img_output = ImageCreateTrueColor($this->x_output, $this->y_output);
            ImageCopyResampled($this->img_output, $this->img_input, 0, 0, 0, 0, $this->x_output, $this->y_output, $this->x_input, $this->y_input);

        }

        // Save JPEG
        if($this->format == "JPG" OR $this->format == "JPEG")
        {

            if($this->resize) { imageJPEG($this->img_output, $path, $this->quality); }
            else { copy($this->img_src, $path); }

        }

        // Save PNG
        elseif($this->format == "PNG")
        {

            if($this->resize) { imagePNG($this->img_output, $path); }
            else { copy($this->img_src, $path); }

        }

        // Save GIF
        elseif($this->format == "GIF")
        {

            if($this->resize) { imageGIF($this->img_output, $path); }
            else { copy($this->img_src, $path); }

        }

    }

    // Get width
    public function get_width()
    {

        return $this->x_input;

    }

    // Get height
    public function get_height()
    {

        return $this->y_input;

    }

    // Clear image cache
    public function clear_cache()
    {

        @ImageDestroy($this->img_input);
        @ImageDestroy($this->img_output);

    }

}
function startsWith($haystack, $needle)
{
     $length = strlen($needle);
     return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    if ($length == 0) {
        return true;
    }

    return (substr($haystack, -$length) === $needle);
}

function make_thumb($src,$dest,$thumbwidth, $quality = 100, $type = 2) 
{ 
    error_reporting(0);
         
    // Image

    // Begin
    $img = new imaging;
    $img->set_img($src);
    $img->set_quality($quality);
    
    // Small thumbnail
    $img->set_size($thumbwidth);
    $img->save_img($dest);
    
    // Finalize
    $img->clear_cache();
         
} 

//SSE related functions
//Use shared memory cache to communicate 
//to an sse instance
function save_mem($data, $name) {
   
    delete_mem($name);
    // get id for name of cache
    $id=shmop_open($name, "c", 0644, strlen(serialize($data)));
    
    // return int for data size or boolean false for fail
    if ($id) {
        return shmop_write($id, serialize($data), 0);
    }
    else return false;
}
function delete_mem($name){
     // delete cache
    $id=shmop_open($name, "a", 0, 0);
    shmop_delete($id);
    shmop_close($id); 
}

function get_mem($name) {
  $id=shmop_open($name, "a", 0, 0);

  if ($id) $data=unserialize(shmop_read($id, 0, shmop_size($id)));
  else return false;          // failed to load data

  if ($data) {                // array retrieved
      shmop_close();
      return $data;
  }
  else return false;          // failed to load data

}
function bg_fcm($fcmids = null,$notifdata=null,$fcmkey){
    $data = array($fcmids,$notifdata,$fcmkey);
    $ser = serialize($data);
    // file_put_contents("/tmp/lastpush.txt","/usr/bin/php ".__FILE__." '$ser' > /dev/null 2>&1 &");
    exec("/usr/bin/php ".__FILE__." '$ser' > /dev/null 2>&1 &");

}
$isshell = false;
$arg = [];
if(isset($argv)){
    $arg = $argv;
}
$count = count($arg);

if($count>0){
    $isshell = true;
}

if($isshell){
    $uns = unserialize($arg[1]);
    $fcmids = $uns[0];
    $notifdata = $uns[1];
    $FCM_KEY = $uns[2];
 	
 	$title='PlayWork';
	$body='Notification';
	$data=array();
	if($fcmids != null){
		if(is_array($fcmids)){
			$fcmids = array_unique($fcmids);
		}
		if($notifdata!=null){
			$title=$notifdata['title'];
			$body=$notifdata['body'];
			$data=$notifdata['data'];
		}
	}
	
	$ch = curl_init();
	
	curl_setopt($ch, CURLOPT_URL,"https://fcm.googleapis.com/fcm/send");
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array( 
		'Authorization: key='.$FCM_KEY,
		"Content-Type: application/json",
	));
	curl_setopt($ch, CURLOPT_POSTFIELDS,
	            json_encode(array(
	            		'notification' => array(
	            			'title' => $title,
	            			'body' => $body,
	            			 'sound'=>'default',
				             'icon'=>'fcm_push_icon'
	            		),
	            	  'data'=>$data,
	            	'registration_ids' => $fcmids,
	            	'priority'=>'high'
					)
	            ));
	

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	
	$one = time();
	$server_output = curl_exec ($ch);
// 	file_put_contents('/tmp/ado.txt',"DONE NA ".(time()-$one));
	curl_close ($ch);
}