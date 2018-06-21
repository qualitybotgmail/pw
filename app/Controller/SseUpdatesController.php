<?php
App::uses('AppController', 'Controller');
/**
 * SseUpdates Controller
 *
 * @property SseUpdate $SseUpdate
 * @property PaginatorComponent $Paginator
 */
class SseUpdatesController extends AppController {

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
		$this->SseUpdate->recursive = 0;
		$this->set('sseUpdates', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->SseUpdate->exists($id)) {
			throw new NotFoundException(__('Invalid sse update'));
		}
		$options = array('conditions' => array('SseUpdate.' . $this->SseUpdate->primaryKey => $id));
		$this->set('sseUpdate', $this->SseUpdate->find('first', $options));
	}
	public function test(){
		$this->SseUpdate->setUpdate(2,'foo');
		echo 'test';exit;
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			$this->SseUpdate->create();
			if ($this->SseUpdate->save($this->request->data)) {
				$this->Session->setFlash(__('The sse update has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The sse update could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		}
		$users = $this->SseUpdate->User->find('list');
		$this->set(compact('users'));
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->SseUpdate->exists($id)) {
			throw new NotFoundException(__('Invalid sse update'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->SseUpdate->save($this->request->data)) {
				$this->Session->setFlash(__('The sse update has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The sse update could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('SseUpdate.' . $this->SseUpdate->primaryKey => $id));
			$this->request->data = $this->SseUpdate->find('first', $options);
		}
		$users = $this->SseUpdate->User->find('list');
		$this->set(compact('users'));
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->SseUpdate->id = $id;
		if (!$this->SseUpdate->exists()) {
			throw new NotFoundException(__('Invalid sse update'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->SseUpdate->delete()) {
			$this->Session->setFlash(__('The sse update has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The sse update could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
}
