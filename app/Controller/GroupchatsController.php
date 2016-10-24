<?php
App::uses('AppController', 'Controller');
/**
 * Groupchats Controller
 *
 * @property Groupchat $Groupchat
 * @property PaginatorComponent $Paginator
 * @property SessionComponent $Session
 */
class GroupchatsController extends AppController {

/**
 * Components
 *
 * @var array
 */
	public $components = array('Paginator', 'Session');

/**
 * index method
 *
 * @return void
 */
	public function index() {
		$this->Groupchat->recursive = 0;
		$this->set('groupchats', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->Groupchat->exists($id)) {
			throw new NotFoundException(__('Invalid groupchat'));
		}
		$options = array('conditions' => array('Groupchat.' . $this->Groupchat->primaryKey => $id));
		$this->set('groupchat', $this->Groupchat->find('first', $options));
	}

/**
 * add method
 *
 * @return void
 */
	public function addgroupmember($user_id = null) {//
		// if ($this->request->is('post')) {
		// 	$this->Groupchat->create();
		// 	if ($this->Groupchat->save($this->request->data)) {
		// 		$this->Session->setFlash(__('The groupchat has been saved.'), 'default', array('class' => 'alert alert-success'));
		// 		return $this->redirect(array('action' => 'index'));
		// 	} else {
		// 		$this->Session->setFlash(__('The groupchat could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		// 	}
		// }
		// $users = $this->Groupchat->User->find('list');
		// $users = $this->Groupchat->User->find('list');
		// $this->set(compact('users', 'users'));
		
	header('Content-Type: application/json;charset=utf-8');
	
		$ids = explode(",",$user_id); 
		 
			$user_id = $this->Auth->user('id');  
			$this->Groupchat->create(); 
			 $data = $this->Groupchat->save(array('user_id' => $user_id));
	 
			if ($data) {
				$groupchat_id = $this->Groupchat->getLastInsertId();
				foreach($ids as $id){  
					$this->loadModel('UsersGroupchat');
					$this->UsersGroupchat->create(); 
					// if($this->{$this->UsersGroupchat}->save(array('user_id' => $id, 'groupchat_id' => $groupchat_id))){
					// if($this->UsersGroupchat->save(array('user_id' => $id, 'groupchat_id' => $groupchat_id))){
					// 	$result = $id;
					// }
						$result = $this->UsersGroupchat->save(array(
					'Groupchat' => array('id' => $groupchat_id),
					'User' => array('User' => $id)
				));
				} 
				
			} else {
				$result = 'failed';
			} 
		$this->set('groupchats',$ids);
		// $this->set('_serialize', array('groupchats'));
		echo json_encode($ids);
		exit; 
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->Groupchat->exists($id)) {
			throw new NotFoundException(__('Invalid groupchat'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->Groupchat->save($this->request->data)) {
				$this->Session->setFlash(__('The groupchat has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The groupchat could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Groupchat.' . $this->Groupchat->primaryKey => $id));
			$this->request->data = $this->Groupchat->find('first', $options);
		}
		$users = $this->Groupchat->User->find('list');
		$users = $this->Groupchat->User->find('list');
		$this->set(compact('users', 'users'));
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->Groupchat->id = $id;
		if (!$this->Groupchat->exists()) {
			throw new NotFoundException(__('Invalid groupchat'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Groupchat->delete()) {
			$this->Session->setFlash(__('The groupchat has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The groupchat could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
}
