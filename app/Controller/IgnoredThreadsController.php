<?php
App::uses('AppController', 'Controller');
/**
 * IgnoredThreads Controller
 *
 * @property IgnoredThread $IgnoredThread
 * @property PaginatorComponent $Paginator
 */
class IgnoredThreadsController extends AppController {

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
		$i = $this->IgnoredThread->find('list',array('conditions'=>array('user_id'=>$this->Auth->user('id')),'fields'=>array('thread_id')));
		$this->set('ignoredThreads',array_values($i));
	}
	public function off($thread_id){
		header("Content-Type: application/json");
		$uid = $this->Auth->user('id');
		if(!$this->IgnoredThread->Thread->exists($thread_id)){
			echo '{status: "NOT_EXISTING_THREAD"}';
			exit;
		}
		if($this->IgnoredThread->findByThreadIdAndUserId($thread_id,$uid)){
			echo '{status: "ALREADY_OFF"}';
			exit;
		}
		$uid = $this->Auth->user('id');
		$r = $this->IgnoredThread->save(['user_id'=>$uid,'thread_id'=>$thread_id]);
		if($r){
			echo '{status: "OK"}';
		}else {
			echo '{status: "ERROR}';
		}
		exit;
	}
	public function on($thread_id){
		header("Content-Type: application/json");
		$uid = $this->Auth->user('id');
		$i = $this->IgnoredThread->findByThreadIdAndUserId($thread_id,$uid);
		
		if($i){
			$this->IgnoredThread->delete($i['IgnoredThread']['id']);
			echo '{status: "SUCCESS"}';
			exit;
		}
		echo '{status: "ALREADY_ON}';
		exit;
	}	
/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->IgnoredThread->exists($id)) {
			throw new NotFoundException(__('Invalid ignored thread'));
		}
		$options = array('conditions' => array('IgnoredThread.' . $this->IgnoredThread->primaryKey => $id));
		$this->set('ignoredThread', $this->IgnoredThread->find('first', $options));
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			$this->IgnoredThread->create();
			if ($this->IgnoredThread->save($this->request->data)) {
				$this->Session->setFlash(__('The ignored thread has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The ignored thread could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		}
		$users = $this->IgnoredThread->User->find('list');
		$threads = $this->IgnoredThread->Thread->find('list');
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
		if (!$this->IgnoredThread->exists($id)) {
			throw new NotFoundException(__('Invalid ignored thread'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->IgnoredThread->save($this->request->data)) {
				$this->Session->setFlash(__('The ignored thread has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The ignored thread could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('IgnoredThread.' . $this->IgnoredThread->primaryKey => $id));
			$this->request->data = $this->IgnoredThread->find('first', $options);
		}
		$users = $this->IgnoredThread->User->find('list');
		$threads = $this->IgnoredThread->Thread->find('list');
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
		$this->IgnoredThread->id = $id;
		if (!$this->IgnoredThread->exists()) {
			throw new NotFoundException(__('Invalid ignored thread'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->IgnoredThread->delete()) {
			$this->Session->setFlash(__('The ignored thread has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The ignored thread could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
}
