<?php
App::uses('AppController', 'Controller');
/**
 * Heads Controller
 *
 * @property Head $Head
 * @property PaginatorComponent $Paginator
 */
class HeadsController extends AppController {

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
		$this->Head->recursive = 0;
		$this->set('heads', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->Head->exists($id)) {
			throw new NotFoundException(__('Invalid head'));
		}
		$options = array('conditions' => array('Head.' . $this->Head->primaryKey => $id));
		$this->set('head', $this->Head->find('first', $options));
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			$this->Head->create();
			if ($this->Head->save($this->request->data)) {
				$this->Session->setFlash(__('The head has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The head could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		}
		$users = $this->Head->User->find('list');
		$threads = $this->Head->Thread->find('list');
		$this->set(compact('users', 'threads'));
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->Head->exists($id)) {
			throw new NotFoundException(__('Invalid head'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->Head->save($this->request->data)) {
				$this->Session->setFlash(__('The head has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The head could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Head.' . $this->Head->primaryKey => $id));
			$this->request->data = $this->Head->find('first', $options);
		}
		$users = $this->Head->User->find('list');
		$threads = $this->Head->Thread->find('list');
		$this->set(compact('users', 'threads'));
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->Head->id = $id;
		if (!$this->Head->exists()) {
			throw new NotFoundException(__('Invalid head'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Head->delete()) {
			$this->Session->setFlash(__('The head has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The head could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
	
	
	
	public function like($id = null) {
		$this->Head->id = $id;
		if (!$this->Head->exists()) {
			throw new NotFoundException(__('Invalid thread'));
		}
		$user_id = $this->Auth->user('id');		
		$like = array(
			'Like' => array('user_id' => $user_id,'head_id' => $id)
		);
		
		if(!$this->Head->Like->headLikeExists($id,$user_id)){
			$ret = $this->Head->Like->save($like);
			if($ret)
				echo json_encode(['status' => 'OK']); 
			else {
				echo json_encode(['status' => 'FAILED']);
			}
			exit;
		}
		echo json_encode(['status' => 'EXISTS']);
		exit;
		 

		return $this->redirect(array('action' => 'index'));
	}
	public function unlike($id = null) {
		$this->Head->id = $id;
		if (!$this->Head->exists()) {
			throw new NotFoundException(__('Invalid thread'));
		}
		$user_id = $this->Auth->user('id');		
		
		if($this->Head->Like->headLikeExists($id,$user_id)){
			$ret = $this->Head->Like->headLike($id,$user_id);
			$this->Head->Like->id  = $ret['Like']['id'];
			if($this->Head->Like->delete()){
				echo json_encode(['status' => 'OK']);
			} else {
				echo json_encode(['status' => 'FAILED']);
			}
			exit;
		}else{
			echo json_encode(['status' => 'NOT_EXISTING']);
		}
		exit;
		 

		return $this->redirect(array('action' => 'index'));
	}	
}
