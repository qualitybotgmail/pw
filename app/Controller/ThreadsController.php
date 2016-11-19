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
		
		$user_id = $this->Auth->user('id');
		$users_threads = $this->Thread->query("select * from users_threads where user_id = $user_id");
		
		$threads = $this->Thread->find('all',
		// ['fields' => ['id','user_id','thread_id','body','created','modified']],
		['conditions' => ['Thread.user_id' => $user_id]]); 
		
		$this->set('threads', array_merge($threads, $users_threads));
 
		
	}
	
	private function formatQuery($threads) {
		foreach($threads as $k => $thread){
			
			$tid = $thread['Thread']['id'];
			$uid = $this->Auth->user('id');
			unset($threads[$k]['Owner']['password']);
			
			foreach($thread['Head'] as $kk => $head){
				$threads[$k]['Head'][$kk]['likes'] = count($head['Like']);
				$threads[$k]['Head'][$kk]['isUserLiked'] = $this->Thread->Head->isLiked($head['id'],$uid);
				unset($threads[$k]['Head'][$kk]['Like']);
				unset($threads[$k]['Head'][$kk]['Thread']);
				
			}
			//total likes of comments
		}
		
		return $threads;
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
		$this->Thread->recursive = 3;
		$thread = $this->Thread->findById($id);
		$tid = $id;
		$uid = $this->Auth->user('id');
		
	//	$thread['Thread']['isUserLiked'] = $this->Thread->isLiked($tid,$uid);
	//	$thread['Thread']['likes'] = count($thread['Like']);
		unset($thread['Owner']['password']);
	//	unset($thread['Like']);
			
		foreach($thread['Head'] as $kk => $head){
			$thread['Head'][$kk]['likes'] = count($head['Like']);
			$thread['Head'][$kk]['isUserLiked'] = $this->Thread->Head->isLiked($head['id'],$uid);
			unset($thread['Head'][$kk]['Owner']['password']);
			unset($thread['Head'][$kk]['Like']);
			unset($thread['Head'][$kk]['Thread']);
			
		} 
		// $this->loadModel('Upload');
		
		// $cond = array('conditions' => array('Upload.thread_id' => $id));
		// $uploads = $this->Upload->find('all', $cond);
			//total likes of comments
		
				
		
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
			// $this->request->data['Thread']['head'] = $this->request->data['head'];
			$this->request->data['Thread']['title'] = $this->request->data['title'];
			
			$data = $this->Thread->save($this->request->data);
			if ($data) {
				
				if(true){//$this->request->is('ajax')){
					$id = $data['Thread']['id'];
					header('Content-Type: application/json;charset=utf-8');
					echo json_encode($data);
					exit;
				}
				$this->Session->setFlash(__('The thread has been saved.'), 'default', array('class' => 'alert alert-success'));
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
			$this->request->data['Thread']['user_id'] = $this->Auth->user('id');
			$this->request->data['Thread']['title'] = $this->request->data['title'];
			$data = $this->Thread->save($this->request->data);
			
			if ($data) {
				// $this->Session->setFlash(__('The thread has been saved.'), 'default', array('class' => 'alert alert-success'));
				// return $this->redirect(array('action' => 'index'));
				echo json_encode($data);
				exit;
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
		if(isset($this->request->data['body'])){
			$this->request->data['Comment']['body'] = $this->request->data['body'];
		}
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
	
	
	public function deletemember($thread_id = null, $member_id = null) { 
		$this->loadModel('User');
		header('Content-Type: application/json;charset=utf-8'); 
		
		try{ 
    		 $this->Thread->query("delete from users_threads where user_id = $member_id and thread_id = $thread_id");
    		// $result = $this->User->deleteAssoc($member_id,'Thread',$thread_id);
			echo json_encode(['status' => 'DELETED']); 
		  
			exit;
		}catch(Exception $e){
			echo json_encode(['status' => 'FAILED to catch']);
			exit;
		}
	}	
}
