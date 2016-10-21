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
	
	public function addfile(){
	header('Content-Type: application/json;charset=utf-8');
	
		if ($this->request->is('post')) { 

		$folder_url=APP.WEBROOT_DIR.DS.'uploads'.DS;
		$rel_url = $folder;
			
			$conditions=[]; 
			
			$comment_id=[];
			$message_id=[];
			$filename=[];  
				 
			$comment_id = $this->request->data['comment_id'];
			$message_id = $this->request->data['message_id'];  
			$filename = $this->request->data['filename']; 
			
			 
			if(!empty($this->request->data['file']['comment_id'])){
				$savedata=$this->request->data;
			
				$user_id = $this->Auth->user('id'); 
				$this->File->create(); 
				
				if(!empty($this->request->data['file']['message_id'])){
					$data = array('user_id' => $user_id, 'message_id' => $message_id, 'name' => $filename, 'path' => $folder_url); 
				}
				
				if(!empty($this->request->data['file']['comment_id'])){
					$data = array('user_id' => $user_id, 'comment_id' => $comment_id, 'name' => $filename, 'path' => $folder_url); 
				} 
				
				$this->File->save($data);
			
			}   
		        // check filename already exists
						if(!file_exists($folder_url.'/'.$filename)) {
							// create full filename
							$full_url = $folder_url.'/'.$filename;
							$url = $folder_url.'/'.$filename;
							// upload the file
							$success = move_uploaded_file($file['tmp_name'], $url);
						} else {
							// create unique filename and upload file
							ini_set('date.timezone', 'Europe/London');
							$now = date('Y-m-d-His');
							$full_url = $folder_url.'/'.$now.$filename;
							$url = $folder_url.'/'.$now.$filename;
							$success = move_uploaded_file($file['tmp_name'], $url);
						}
						// if upload was successful
						if($success) {
							// save the url of the file
							$result['urls'][] = $url;
						} else {
							$result['errors'][] = "FAILED - d nagsave";
						}
				$file = $this->set('result',$result);
				 
	        echo json_encode($result); 
		
		
		}else{
			echo json_encode('FAILED - walang post dto brad');
		} 
		exit;
	}
}
