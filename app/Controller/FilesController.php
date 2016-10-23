<?php
App::uses('AppController', 'Controller');
/**
 * Files Controller
 *
 * @property File $File
 * @property PaginatorComponent $Paginator
 * @property SessionComponent $Session
 */
class FilesController extends AppController {

/**
 * Components
 *
 * @var array
 */
	public $components = array('Paginator', 'Session');

	public function viewfile() {
	header('Content-Type: application/json;charset=utf-8');
		$this->File->recursive = 0;
        $file = $this->File->find('all'); 
        
       $file = $this->set('file',$file);
       
        echo json_encode($file);
	}
	public function view($id = null) {
		if (!$this->File->exists($id)) {
			throw new NotFoundException(__('Invalid file'));
		}	
		$this->File->recursive = 0;
        $file = $this->File->findById($id);
        
        $file = $this->set('file',$file);
	}	
	 
	
	public function upload(){ 
	if ($this->request->is('post')) {   
	$path=APP.WEBROOT_DIR.DS.'uploads'.DS;
	
	$files = $this->request->data['File']['files'];	
	// $comment_id = $this->request->data['comment_id'];
	$comment_id = 1;
	$user_id = $this->Auth->user('id'); 
	
		   foreach($files as $file){	 
		   	 $fileName = $file['name']; 
		   	/////////rename file ///////////
		   		ini_set('date.timezone', 'Asia/Manila');
				$now = date('Y-m-d-His');
				$full_url = $path.'/'.$now.$fileName;
				$url = $path.'/'.$now.$fileName;
				// $success = move_uploaded_file($file['tmp_name'], $url);
		   	//////////////////////////////
		   	 
				$this->File->create(); 
				$data = array('user_id' => $user_id, 'comment_id' => $comment_id, 'name' => $now.$fileName, 'path' => $path); 
				if($this->File->save($data)){
					
					/////////////   UPLOADING PROCESS START   ////////////////////////// 
						$uploadFile = $path.$fileName;  
						if(move_uploaded_file($file['tmp_name'], $url)){ 
							echo $now.$fileName; 
						}else{
							echo 'error upload ';
						} 
					///////////////   UPLOADING PROCESS END    ////////////////////////
				}	
			 
		   }
		} 
	}
	public function beforeFilter(){
		$this->Auth->allow('files');
	}
	public function files(){ 
		echo 'test';
		print_r($_FILES);
		echo 'test';
		print_r($this->request->data);
		exit;
		
	header('Content-Type: application/json;charset=utf-8');
	if ($this->request->is('post')) {   
	$path=APP.WEBROOT_DIR.DS.'uploads'.DS; 
	
	
	$files = $this->request->data['filename'];
	
	if(count($this->request->data['comment_id'])==0){
		$comment_id = 0;
	}else{
		$comment_id = $this->request->data['comment_id'];
	}
	
	if(count($this->request->data['message_id'])==0){
		$message_id = 0;
	}else{ 
		$message_id = $this->request->data['message_id'];
	}
	
	$user_id = $this->Auth->user('id'); 
	
		   foreach($files as $file){	 
		   	 $fileName = $file['name']; 
		   	/////////rename file ///////////
		   		ini_set('date.timezone', 'Asia/Manila');
				$now = date('Y-m-d-His');
				$full_url = $path.'/'.$now.$fileName;
				$url = $path.'/'.$now.$fileName;
				// $success = move_uploaded_file($file['tmp_name'], $url);
		   	//////////////////////////////
		   	 
				$this->File->create(); 
				
				$data = array('user_id' => $user_id, 'comment_id' => $comment_id, 'name' => $now.$fileName, 'path' => $path); 
				if($this->File->save($data)){
					
					/////////////   UPLOADING PROCESS START   ////////////////////////// 
						$uploadFile = $path.$fileName;  
						if(move_uploaded_file($file['tmp_name'], $url)){ 
							$result = $files; 
						}else{
							$result = 'error upload';
						} 
					///////////////   UPLOADING PROCESS END    ////////////////////////
				}	
			 
		   }
	
	
	
		}
		// else{
		// 	$result = 'FAILED - data unposted';
		// }
		
		
		 $this->set('files',$result);
		//  echo json_encode($result);
		 exit;
	}
	
}
