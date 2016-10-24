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
/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			
			header('Content-Type: application/json;charset=utf-8');
            
            $saved = ['Success' => [],'Failed' => []];
            
            $comment_id = null;
            $message_id = null;
            
            if(isset($this->request->data['File']['comment_id']))
            	$comment_id = $this->request->data['File']['comment_id'];
            
            if(isset($this->request->data['File']['message_id']))
            	$message_id = $this->request->data['File']['message_id'];
			
			foreach($this->request->data['File']['files'] as $file){
				$path = WWW_ROOT . 'uploads/' . $this->Auth->user('username');
				
				@mkdir($path,777);
				
				$filepath = $path . '/' . $file['name'];
				
			    move_uploaded_file($file['tmp_name'],$filepath);
				$urlpath = '/uploads/' . $this->Auth->user('username') . '/' . $file['name'];
				$data = ['path' => $urlpath,'comment_id' => $comment_id,'user_id' => $this->Auth->user('id'),'message_id' => $message_id,'name' => $file['name']];
				$return = $this->File->save($data);
				
				if($return){
					$saved["Success"][] = $file['name'];
				}else{
					$saved["Failed"][] = $file['name'];
				}
				
			}
			echo json_encode($saved);
			exit;

		}

	}

	
}
