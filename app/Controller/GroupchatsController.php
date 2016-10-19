<?php
App::uses('AppController', 'Controller');
/**
 * Groupchats Controller
 *
 * @property Groupchat $Groupchat
 * @property PaginatorComponent $Paginator
 */
class GroupchatsController extends AppController {

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
	public function add() {
		if ($this->request->is('post')) {
			$this->Groupchat->create();
			if ($this->Groupchat->save($this->request->data)) {
				$this->Session->setFlash(__('The groupchat has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The groupchat could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
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
