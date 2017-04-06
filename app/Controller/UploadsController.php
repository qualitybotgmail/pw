<?php
App::uses('AppController', 'Controller');
/**
 * Uploads Controller
 *
 * @property Upload $Upload
 * @property PaginatorComponent $Paginator
 */
class UploadsController extends AppController {

/**
 * Components
 *
 * @var array
 */
	public $components = array('Paginator','RequestHandler');
	
	public function beforeFilter(){
		parent::beforeFilter();
		$this->loadModel('User'); 
		$this->Auth->allow('add','edit','delete','mobileUploads');
	}

/**
 * index method
 *
 * @return void
 */
	public function index() {
		$this->Upload->recursive = 0;
		$this->set('uploads', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->Upload->exists($id)) {
			throw new NotFoundException(__('Invalid upload'));
		}
		$options = array('conditions' => array('Upload.' . $this->Upload->primaryKey => $id));
		$this->set('upload', $this->Upload->find('all', $options));
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {
		
		if ($this->request->is('post')) {
			
			header('Content-Type: application/json;charset=utf-8');
            
            $saved = array('Success' => array(),'Failed' => array());
            
            $comment_id = null;
            $message_id = null;
            $head_id = null;
            if(isset($this->request->data['Upload']['comment_id'])){
            	$comment_id = $this->request->data['Upload']['comment_id'];
            	$saved['comment_id'] = $comment_id;
            }
            
            if(isset($this->request->data['Upload']['message_id'])){
            	$message_id = $this->request->data['Upload']['message_id'];
            	$saved['message_id'] = $message_id;
            }
			
            if(isset($this->request->data['Upload']['head_id'])){
            	$head_id = $this->request->data['Upload']['head_id'];
            	$saved['head_id'] = $head_id;
            }
						
			foreach($this->request->data['Upload']['file'] as $file){
				$path = WWW_ROOT . 'files/' . $this->Auth->user('id');
				
				@mkdir($path);
			//	chmod($path,0777);
				$fname = preg_replace('/\s+/', '_', $file['name']);
				$filepath = $path . '/' .time(). $fname;
				$this->Upload->create();
			    move_uploaded_file($file['tmp_name'],$filepath);
				$urlpath = '/files/' . $this->Auth->user('id') . '/' . time().$fname;
				$data = array('path' => $urlpath,'comment_id' => $comment_id,'user_id' => $this->Auth->user('id'),'message_id' => $message_id,'head_id'=>$head_id ,'name' => $file['name']);
				$return = $this->Upload->save($data);
				
				if($return){
					$saved["Success"][] = array('name' => $file['name'], 'path' => $urlpath);
				}else{
					$saved["Failed"][] = array('name' => $file['name'], 'path' => $urlpath);
				}
				
			}
			echo json_encode($saved);
			exit;

		}

	}


/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->Upload->exists($id)) {
			throw new NotFoundException(__('Invalid upload'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->Upload->save($this->request->data)) {
				$this->Session->setFlash(__('The upload has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The upload could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Upload.' . $this->Upload->primaryKey => $id));
			$this->request->data = $this->Upload->find('first', $options);
		}
		$users = $this->Upload->User->find('list');
		$comments = $this->Upload->Comment->find('list');
		$messages = $this->Upload->Message->find('list');
		$this->set(compact('users', 'comments', 'messages'));
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->Upload->id = $id;
		if (!$this->Upload->exists()) {
			throw new NotFoundException(__('Invalid upload'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Upload->delete()) {
			// $this->Session->setFlash(__('The upload has been deleted.'), 'default', array('class' => 'alert alert-success'));
			echo json_encode(array('status' => 'OK')); 
			exit;
		} else {
			// $this->Session->setFlash(__('The upload could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			echo json_encode(array('status' => 'FAILED')); 
			exit;
		}
		// return $this->redirect(array('action' => 'index'));
	}
	
	function mobileUploads(){
			$saved = array();
            
            
            $comment_id = null;
            $message_id = null;
            $head_id = null;
            
            if(isset($_POST['comment_id'])){
            	$comment_id = $_POST['comment_id'];
            	//$saved['comment_id'] = $comment_id;
            }
            
            if(isset($_POST['message_id'])){
            	$message_id = $_POST['message_id'];
            	//$saved['message_id'] = $message_id;
            }
			
            if(isset($_POST['head_id'])){
            	$head_id = $_POST['head_id'];
            	//$saved['head_id'] = $head_id;
            }
						
		foreach($_FILES as $file){
				$path = WWW_ROOT . 'files/' . $this->Auth->user('id');
				
				@mkdir($path);
				$fname = preg_replace('/\s+/', '_', $file['name']);
				$filepath = $path . '/' .time(). $fname;
				$this->Upload->create();
			    move_uploaded_file($file['tmp_name'],$filepath);
				$urlpath = '/files/' . $this->Auth->user('id') . '/' . time().$fname;
				$data = array('path' => $urlpath,'comment_id' => $comment_id,'user_id' => $this->Auth->user('id'),'message_id' => $message_id,'head_id'=>$head_id ,'name' =>$file['name']);
				$return = $this->Upload->save($data);
				
				if($return){
					
						$this->Upload->recursive=-1;
						$insert_id=$this->Upload->getInsertID();
						$saved=$this->Upload->find('all',array('conditions'=>array('id'=>$insert_id)));
				}else{
					$saved["Failed"]= array('name' => $file['name'], 'path' => $urlpath);
				}
				
			}
			echo json_encode($saved);
			exit;

		}
		
		public function profileImageUploads(){
			foreach($_FILES as $file){
				$path = WWW_ROOT . 'files/' . $this->Auth->user('id');
				
				@mkdir($path);
				$fname = preg_replace('/\s+/', '_', $file['name']);
				$filepath = $path . '/' .time(). $fname;
				$this->Upload->create();
			    move_uploaded_file($file['tmp_name'],$filepath);
				$urlpath = '/files/' . $this->Auth->user('id') . '/' . time() . $fname;
				$data = array('path' => $urlpath,'comment_id' => $comment_id,'user_id' => $this->Auth->user('id'),'message_id' => $message_id,'head_id'=>$head_id ,'name' =>$file['name']);
				$return = $this->Upload->save($data);
				
				
			}
			echo json_encode($urlpath);
			exit;
		}
}
