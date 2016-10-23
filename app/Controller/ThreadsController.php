<?php
App::uses('AppController', 'Controller');
/**
 * Threads Controller
 *
 * @property Thread $Thread
 * @property PaginatorComponent $Paginator
 */
class ThreadsController extends AppController {

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
		$this->Thread->recursive = 1;
		$this->set('threads', $this->Paginator->paginate());
	}
	public function beforeFilter(){
//		$this->Auth->allow('comment');
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->Thread->exists($id)) {
			throw new NotFoundException(__('Invalid thread'));
		}
		$options = array('conditions' => array('Thread.' . $this->Thread->primaryKey => $id));
		$thread =  $this->Thread->find('first', $options);
		
		$this->set('thread',$thread);
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {

		if ($this->request->is('post')) {
			
			$this->Thread->create();
			$this->request->data['Thread']['user_id'] = $this->Auth->user('id');
			$data = $this->Thread->save($this->request->data);
			if ($data) {
				$this->Session->setFlash(__('The thread has been saved.'), 'default', array('class' => 'alert alert-success'));
				if($this->request->is('ajax')){
					$id = $data['Thread']['id'];
					return $this->redirect(array('action' => 'view',$id.".json"));
				}
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The thread could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		}
		$users = $this->Thread->User->find('list');
		$this->set(compact('users'));
	}
/**
 * add method
 *
 * @return void
 */
	public function addmember($thread_id = null,$member_id = null) {
		header('Content-Type: application/json;charset=utf-8');
		$ids = explode(",",$member_id);
		try{
			$thread = $this->Thread->findById($thread_id);
			$users = [];
						
			foreach($thread['User'] as $i => $u){
				if(is_numeric($i)){
					$users[] = $u['id'];
				}
			}
			
			$oldcount = count($users);
			$users = array_merge($ids,$users);
			$users = array_unique($users);
			
			
			if(count($users)!=$oldcount){
				
				$result = $this->Thread->save(array(
					'Thread' => array('id' => $thread_id),
					'User' => array('User' => $users)
				));
				
				echo json_encode(['status' => 'OK']);
				exit;
			}
			echo json_encode(['status' => 'EXISTS']);
			
			exit;
		}catch(Exception $e){
			echo json_encode(['status' => 'FAILED']);
			exit;
		}
	}
/**
 * add method
 *
 * @return void
 */
	public function like($id = null) {
		$this->Thread->id = $id;
		if (!$this->Thread->exists()) {
			throw new NotFoundException(__('Invalid thread'));
		}
		$user_id = $this->Auth->user('id');		
		$like = array(
			'Like' => array('user_id' => $user_id,'thread_id' => $id)
		);
		
		if(!$this->Thread->Like->threadLikeExists($id,$user_id)){
			$ret = $this->Thread->Like->save($like);
			if($ret)
				echo json_encode(['status' => 'OK']);
			else {
				echo json_encode(['status' => 'FAILED']);
			}
			exit;
		}
		echo json_encode(['status' => 'EXISTS']);
		exit;
		
		
		
// Array
// (
//     [Like] => Array
//         (
//             [user_id] => 3
//             [message_id] => 1
//             [thread_id] => 1
//         )

// )

		return $this->redirect(array('action' => 'index'));
	}
/**
 * add method
 *
 * @return void
 */
	public function unlike($id = null) {
		$this->Thread->id = $id;
		if (!$this->Thread->exists()) {
			throw new NotFoundException(__('Invalid thread'));
		}
		$user_id = $this->Auth->user('id');		
		
		if($this->Thread->Like->threadLikeExists($id,$user_id)){
			$ret = $this->Thread->Like->threadLike($id,$user_id);
			$this->Thread->Like->id  = $ret['Like']['id'];
			if($this->Thread->Like->delete()){
				echo json_encode(['status' => 'OK']);
			} else {
				echo json_encode(['status' => 'FAILED']);
			}
			exit;
		}else{
			echo json_encode(['status' => 'NOT_EXISTING']);
		}
		exit;
		
		
		
// Array
// (
//     [Like] => Array
//         (
//             [user_id] => 3
//             [message_id] => 1
//             [thread_id] => 1
//         )

// )

		return $this->redirect(array('action' => 'index'));
	}	
		
/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->Thread->exists($id)) {
			throw new NotFoundException(__('Invalid thread'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->Thread->save($this->request->data)) {
				$this->Session->setFlash(__('The thread has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The thread could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Thread.' . $this->Thread->primaryKey => $id));
			$this->request->data = $this->Thread->find('first', $options);
		}
		$users = $this->Thread->User->find('list');
		$this->set(compact('users'));
	}

	public function comment($id = null) {
		header('Content-Type: application/json;charset=utf-8');
		if (!$this->Thread->exists($id)) {
			$this->notExisting();
		}
		$user_id = $this->Auth->user('id');
		$this->request->data['Comment']['body'] = $this->request->data['body'];
		if ($this->request->is(array('post', 'put'))) {
			$this->request->data['Comment']['thread_id'] = $id;
			$this->request->data['Comment']['user_id']   = $user_id;
			$data = $this->Thread->Comment->save($this->request->data);
			if ($data) {
				echo json_encode($data);
				exit;
			} else {
				$this->failed();
			}
		}
		$this->status("INVALID_REQUEST");
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->Thread->id = $id;
		if (!$this->Thread->exists()) {
			throw new NotFoundException(__('Invalid thread'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Thread->delete()) {
			$this->Session->setFlash(__('The thread has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The thread could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
	
	public function userstoadd($thread_id){
		header('Content-Type: application/json;charset=utf-8');
		$members = $this->Thread->members($thread_id);
		
		$users = $this->Thread->User->find("all",['fields' => ['id','username'],'conditions' => [
			'NOT' => [
				'User.id' => $members
			]
		]]);
		
		if(count($users) == 0){
			$users = $this->Thread->User->find("all",['fields' => ['id','username']]);
		}
		echo json_encode(['users'=> $users]);
		exit;
	}
}
