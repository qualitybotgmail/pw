<?php
App::uses('AppController', 'Controller');
/**
 * Attachements Controller
 *
 * @property Attachement $Attachement
 * @property PaginatorComponent $Paginator
 */
class AttachementsController extends AppController {

/**
 * Components
 *
 * @var array
 */
	public $components = array('Paginator','RequestHandler');

/**
 * index method
 *
 * @return void
 */
	public function index() {
		$this->Attachement->recursive = 0;
		$this->set('attachements', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->Attachement->exists($id)) {
			throw new NotFoundException(__('Invalid attachement'));
		}
		$options = array('conditions' => array('Attachement.' . $this->Attachement->primaryKey => $id));
		$this->set('attachement', $this->Attachement->find('first', $options));
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
            
            if(isset($this->request->data['Attachement']['comment_id']))
            	$comment_id = $this->request->data['Attachement']['comment_id'];
            
            if(isset($this->request->data['Attachement']['message_id']))
            	$message_id = $this->request->data['Attachement']['message_id'];
			
			foreach($this->request->data['Attachement']['files'] as $file){
				$path = WWW_ROOT . 'uploads/' . $this->Auth->user('id');
				
				@mkdir($path,777);
				
				$filepath = $path . '/' . $file['name'];
				
			    move_uploaded_file($file['tmp_name'],$filepath);
				$urlpath = '/uploads/' . $this->Auth->user('id') . '/' . $file['name'];
				$data = array('path' => $urlpath,'comment_id' => $comment_id,'user_id' => $this->Auth->user('id'),'message_id' => $message_id,'name' => $file['name']);
				$return = $this->Attachement->save($data);
				
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
		if (!$this->Attachement->exists($id)) {
			throw new NotFoundException(__('Invalid attachement'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->Attachement->save($this->request->data)) {
				$this->Session->setFlash(__('The attachement has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The attachement could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Attachement.' . $this->Attachement->primaryKey => $id));
			$this->request->data = $this->Attachement->find('first', $options);
		}
		$users = $this->Attachement->User->find('list');
		$comments = $this->Attachement->Comment->find('list');
		$messages = $this->Attachement->Message->find('list');
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
		$this->Attachement->id = $id;
		if (!$this->Attachement->exists()) {
			throw new NotFoundException(__('Invalid attachement'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Attachement->delete()) {
			$this->Session->setFlash(__('The attachement has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The attachement could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
}
