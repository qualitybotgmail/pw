<?php
App::uses('AppController', 'Controller');
/**
 * UsersLogs Controller
 *
 * @property UsersLog $UsersLog
 * @property PaginatorComponent $Paginator
 */
class UsersLogsController extends AppController {

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
		$this->UsersLog->recursive = 0;
		$this->set('usersLogs', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->UsersLog->exists($id)) {
			throw new NotFoundException(__('Invalid users log'));
		}
		$options = array('conditions' => array('UsersLog.' . $this->UsersLog->primaryKey => $id));
		$this->set('usersLog', $this->UsersLog->find('first', $options));
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			$this->UsersLog->create();
			if ($this->UsersLog->save($this->request->data)) {
				$this->Session->setFlash(__('The users log has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The users log could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		}
		$logs = $this->UsersLog->Log->find('list');
		$users = $this->UsersLog->User->find('list');
		$this->set(compact('logs', 'users'));
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->UsersLog->exists($id)) {
			throw new NotFoundException(__('Invalid users log'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->UsersLog->save($this->request->data)) {
				$this->Session->setFlash(__('The users log has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The users log could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('UsersLog.' . $this->UsersLog->primaryKey => $id));
			$this->request->data = $this->UsersLog->find('first', $options);
		}
		$logs = $this->UsersLog->Log->find('list');
		$users = $this->UsersLog->User->find('list');
		$this->set(compact('logs', 'users'));
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->UsersLog->id = $id;
		if (!$this->UsersLog->exists()) {
			throw new NotFoundException(__('Invalid users log'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->UsersLog->delete()) {
			$this->Session->setFlash(__('The users log has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The users log could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
}
