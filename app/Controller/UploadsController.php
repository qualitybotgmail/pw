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
	public $components = array('Paginator');

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
            
            $saved = ['Success' => [],'Failed' => []];
            
            $comment_id = null;
            $message_id = null;
            $thread_id = null;
            if(isset($this->request->data['Upload']['comment_id'])){
            	$comment_id = $this->request->data['Upload']['comment_id'];
            	$saved['comment_id'] = $comment_id;
            }
            
            if(isset($this->request->data['Upload']['message_id'])){
            	$message_id = $this->request->data['Upload']['message_id'];
            	$saved['message_id'] = $message_id;
            }
			
            if(isset($this->request->data['Upload']['thread_id'])){
            	$thread_id = $this->request->data['Upload']['thread_id'];
            	$saved['thread_id'] = $thread_id;
            }
						
			foreach($this->request->data['Upload']['file'] as $file){
				$path = WWW_ROOT . 'files/' . $this->Auth->user('username');
				
				@mkdir($path);
			//	chmod($path,0777);
				
				$filepath = $path . '/' .time(). $file['name'];
				$this->Upload->create();
			    move_uploaded_file($file['tmp_name'],$filepath);
				$urlpath = '/files/' . $this->Auth->user('username') . '/' . time().$file['name'];
				$data = ['path' => $urlpath,'comment_id' => $comment_id,'user_id' => $this->Auth->user('id'),'message_id' => $message_id,'thread_id'=>$thread_id ,'name' => $file['name']];
				$return = $this->Upload->save($data);
				
				if($return){
					$saved["Success"][] = ['name' => $file['name'], 'path' => $urlpath];
				}else{
					$saved["Failed"][] = ['name' => $file['name'], 'path' => $urlpath];
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
			$this->Session->setFlash(__('The upload has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The upload could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
}
