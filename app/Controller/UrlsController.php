<?php
App::uses('AppController', 'Controller');
/**
 * Urls Controller
 *
 * @property Url $Url
 * @property PaginatorComponent $Paginator
 */
class UrlsController extends AppController {

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
		$this->Url->recursive = 0;
		$this->set('urls', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->Url->exists($id)) {
			throw new NotFoundException(__('Invalid url'));
		}
		$options = array('conditions' => array('Url.' . $this->Url->primaryKey => $id));
		$this->set('url', $this->Url->find('first', $options));
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			$this->Url->create();
			if ($this->Url->save($this->request->data)) {
				$this->Session->setFlash(__('The url has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The url could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		}
		$categories = $this->Url->Category->find('list');
		$this->set(compact('categories'));
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->Url->exists($id)) {
			throw new NotFoundException(__('Invalid url'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->Url->save($this->request->data)) {
				$this->Session->setFlash(__('The url has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The url could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Url.' . $this->Url->primaryKey => $id));
			$this->request->data = $this->Url->find('first', $options);
		}
		$categories = $this->Url->Category->find('list');
		$this->set(compact('categories'));
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->Url->id = $id;
		if (!$this->Url->exists()) {
			throw new NotFoundException(__('Invalid url'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Url->delete()) {
			$this->Session->setFlash(__('The url has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The url could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
}
