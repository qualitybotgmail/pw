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
	
	public function index_old() { 
		
		$user_id = $this->Auth->user('id');
		$this->Thread->Owner->recursive=2;
		
		$options = [
				'order' => 'Thread.created DESC',
				'joins' => [
					[
					   'table' => 'users_threads',
	                   'alias' => 'users_threads',
	                   'type' => 'INNER',
	                   'conditions' => [
	                           "users_threads.thread_id = Thread.id",
	                           "users_threads.user_id = {$user_id}",
	                    ]
					]
                ]
			];
        // this query if to get all the threads
        // where user is a member only
		$users_threads = $this->Thread->find('all', $options);

		// ['fields' => ['id','user_id','thread_id','body','created','modified']],		
		$threads = $this->Thread->find('all',['conditions' => ['Thread.user_id' => $user_id], 'order' => 'Thread.created DESC'] ); 
		$result = array();
		$this->set('threads', array_merge($threads, $users_threads));
	}

	public function index() { 
		
		$user_id = $this->Auth->user('id');
		$this->Thread->Owner->recursive=2;
		

        // this query if to get all the threads
        // where user is a member only
        $this->Thread->Owner->Behaviors->load("Containable");
		$users_threads = $this->Thread->Owner->find('first', array(
			'conditions' => array('Owner.id' => $user_id),
			'contain' => array('Thread.id','Thread.title','Thread.created','Thread' => array('Owner.id','Owner.username','User.id','User.username')),
			'fields' => array('id','username')
		));

		
		$result = array();
		foreach($users_threads['Thread'] as $thread){
			$owner = $thread['Owner'];
			$user = $thread['User'];
			unset($thread['Owner']);
			unset($thread['User']);
			
			$result[] = array('Thread' => $thread,'Owner' => $owner,'User' => $user);
							
		}
		$this->set('threads', $result);
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
		$this->Auth->allow('index2','notifications');
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
		$this->Thread->Behaviors->load('Containable');
		$thread = $this->Thread->find('first',array(
			'conditions' => array('Thread.id' => $id),
			'contain' => array('Head'=>'Like','User.username','User.id','Owner.username','Owner.id')
		));
		$tid = $id;
		$uid = $this->Auth->user('id');

		unset($thread['Owner']['password']);

			
		foreach($thread['Head'] as $kk => $head){
			$thread['Head'][$kk]['likes'] = count($head['Like']);
			$thread['Head'][$kk]['isUserLiked'] = $this->Thread->Head->isLiked($head['id'],$uid);
			unset($thread['Head'][$kk]['Owner']['password']);
			unset($thread['Head'][$kk]['Like']);
			unset($thread['Head'][$kk]['Thread']);
			
		} 
		$this->Thread->notified($id,$uid);
		//set viewed for the user
		
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

				$id = $data['Thread']['id'];
				header('Content-Type: application/json;charset=utf-8');
				echo json_encode($data);
				exit;

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
 *
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
			$this->request->data['Thread']['id'] = $this->request->data['id'];
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
		$members[] = $this->Auth->user('id');
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
	
	public function deleteownthread($thread_id = null){ 
		// header('Content-Type: application/json;charset=utf-8'); 
		
		// $thread = $this->Thread->findById($thread_id);
		// $thread_owner = $thread['Thread']['user_id'];
		
		// $current_user = $this->Auth->user('id');
		
		// if($thread_owner == $current_user){
		// 	//allow delete
		// }else{
		// 	//cannot delete thread
		// }	
		
		// echo json_encode('asda');
		// 	
		 
		$this->set('threads', $thread_id); 
		exit;
	}
}
