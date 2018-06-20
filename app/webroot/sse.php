<?php
include(dirname(__DIR__)."/Vendor/Util.php");
if(@$_GET['client']=='evtSource.js'){
    if(!isset($_GET['user_id'])){
        echo "Include user id";
        exit;
    }
    header("Content-Type: text/javascript")
    ?>
    
var EventSource = new EventSource("sse.php?user_id=<?php echo $_GET['user_id']; ?>");
EventSource.onmessage = function(e) {
 
  console.log(e.data);
}
    <?php
    exit;
}
if(@$_GET['send']){
    if(!isset($_GET['user_id'])){
        echo "Include user id";
        exit;
    }    
    save_mem($_GET['send'],$_GET['user_id']);
    exit;
}

$user_id = @$_GET['user_id'];
if(!$user_id){
    echo "No user id";
    exit;
}

date_default_timezone_set("America/New_York");
header('Cache-Control: no-cache');
header("Content-Type: text/event-stream\n\n");

$old_data = null;
while (1) {
  // Every second, send a "ping" event.
  
  echo "event: ping\n";
  $curDate = date(DATE_ISO8601);
  echo 'data: {"time": "' . $curDate . '"}';
  echo "\n\n";
  
  // Send a simple message at random intervals.
  
  
  $data = get_mem($user_id);
  
  //If no changes, dont trigger
  //this also makes other devices be notified
  if ($data && $old_data != $data) {
    echo 'data: '.$data. "\n\n";
    $old_data = $data;
  }
  
  ob_end_flush();
  flush();
  sleep(3);
}

?>