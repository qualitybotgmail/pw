<?php
App::uses('AppController', 'Controller');
/**
 * Attachments Controller
 *
 * @property Attachment $Attachment
 * @property PaginatorComponent $Paginator
 */
class AttachmentsController extends AppController {

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
		$this->Attachment->recursive = 0;
		$this->set('attachments', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->Attachment->exists($id)) {
			throw new NotFoundException(__('Invalid attachment'));
		}
		$options = array('conditions' => array('Attachment.' . $this->Attachment->primaryKey => $id));
		$this->set('attachment', $this->Attachment->find('first', $options));
	}

	public function add() {
		if ($this->request->is('post')) {
			
			header('Content-Type: application/json;charset=utf-8');
            
            $saved = ['Success' => [],'Failed' => []];
            
            $comment_id = null;
            $message_id = null;
            
            if(isset($this->request->data['Attachment']['comment_id']))
            	$comment_id = $this->request->data['Attachment']['comment_id'];
            
            if(isset($this->request->data['Attachment']['message_id']))
            	$message_id = $this->request->data['Attachment']['message_id'];
			
			foreach($this->request->data['Attachment']['files'] as $file){
				$path = WWW_ROOT . 'uploads/' . $this->Auth->user('username');
				
				@mkdir($path,777);
				
				$filepath = $path . '/' . $file['name'];
				
			    move_uploaded_file($file['tmp_name'],$filepath);
				$urlpath = '/uploads/' . $this->Auth->user('username') . '/' . $file['name'];
				$data = ['path' => $urlpath,'comment_id' => $comment_id,'user_id' => $this->Auth->user('id'),'message_id' => $message_id,'name' => $file['name']];
				$return = $this->Attachment->save($data);
				
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

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->Attachment->exists($id)) {
			throw new NotFoundException(__('Invalid attachment'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->Attachment->save($this->request->data)) {
				$this->Session->setFlash(__('The attachment has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The attachment could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Attachment.' . $this->Attachment->primaryKey => $id));
			$this->request->data = $this->Attachment->find('first', $options);
		}
		$users = $this->Attachment->User->find('list');
		$comments = $this->Attachment->Comment->find('list');
		$messages = $this->Attachment->Message->find('list');
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
		$this->Attachment->id = $id;
		if (!$this->Attachment->exists()) {
			throw new NotFoundException(__('Invalid attachment'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Attachment->delete()) {
			$this->Session->setFlash(__('The attachment has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The attachment could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
}
