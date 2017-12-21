<?php
App::uses('AppController', 'Controller');
App::import("Vendor","NotifCounts");
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
	public $components = array('Paginator','RequestHandler');

/**
 * index method
 *
 * @return void
 */
	

	public function index_old() { 
		
		$user_id = $this->Auth->user('id');
		$this->Thread->Owner->recursive=2;
		
		$options = array(
				'order' => 'Thread.created DESC',
				'joins' => array(
					array(
					   'table' => 'users_threads',
	                   'alias' => 'users_threads',
	                   'type' => 'INNER',
	                   'conditions' => array(
	                           "users_threads.thread_id = Thread.id",
	                           "users_threads.user_id = {$user_id}",
	                    )
					)
                )
			);
        // this query if to get all the threads
        // where user is a member only
		$users_threads = $this->Thread->find('all', $options);

		// ['fields' => ['id','user_id','thread_id','body','created','modified']],		
		$threads = $this->Thread->find('all',array('conditions' => array('Thread.user_id' => $user_id), 'order' => 'Thread.created DESC') ); 
		$result = array();
		$this->set('threads', array_merge($threads, $users_threads));
	}

	public function index($lastid=0) { 
		
		$cache = $this->getCache('threads');
		//$cache->clear();
		$list = $cache->get();

		if($list && count($list)> 0){
			$this->set('threads',$list);
			return;
		}
		
		$user_id = $this->Auth->user('id');
		$this->Thread->Owner->recursive=2;
		
		
        // this query if to get all the threads
        // where user is a member only
        $this->Thread->Owner->Behaviors->load("Containable");
		$users_threads = $this->Thread->Owner->find('first', array(
			'conditions' => array('Owner.id' => $user_id),
			'contain' => array('Thread.id','Thread.title','Thread.created','Thread' => array('Owner.id','Owner.username','User.id','User.username','User.avatar_img','conditions'=>array('Thread.id >'=>$lastid))),
			'fields' => array('id','username')
		));

		
		$result = array();
		$allidkey=-1;
		foreach($users_threads['Thread'] as $key=> $thread){

			$owner = $thread['Owner'];
			$user = $thread['User'];
			unset($thread['Owner']);
			unset($thread['User']);
			
			
			
			$this->loadModel('IgnoredThread');
			$this->IgnoredThread->recursive=-1;
			$ignored=$this->IgnoredThread->find('count',array('conditions'=>array('thread_id'=>$thread['id'],'user_id'=>$user_id)));
			if($ignored > 0)
			 $thread['notIgnored'] = false;
			else
			 $thread['notIgnored'] = true;
			
			if($thread['user_id']==0){
				array_unshift($result,array('Thread' => $thread,'Owner' => $owner,'User' => $user));
			}else{
				array_push($result,array('Thread' => $thread,'Owner' => $owner,'User' => $user));
			}				
		}

	
		$cache->set($result);		
		$this->set('threads', $result);
	}
	
	public function threadTitle($id){
		
		$threadTitle=$this->Thread->find('first',array('fields'=>'Thread.title','conditions'=>array('Thread.id'=>$id)));
		echo json_encode(array('title'=>$threadTitle['Thread']['title']));
		exit;
	}
	
	public function updates($lastid=0) { 
	
		$user_id = $this->Auth->user('id');
		$cache = $this->getCache('threads');
		$result = $cache->get();
		if($result){
			echo json_encode($result);
			exit;			
		}
		$this->Thread->Owner->recursive=2;
		

        // this query if to get all the threads
        // where user is a member only
        $this->Thread->Owner->Behaviors->load("Containable");
		$users_threads = $this->Thread->Owner->find('first', array(
			'conditions' => array('Owner.id' => $user_id),
			'contain' => array('Thread.id','Thread.title','Thread.created','Thread' => array('Owner.id','Owner.username','User.id','User.username','conditions'=>array('Thread.id >'=>$lastid))),
			'fields' => array('id','username')
		));

		
		$result = array();
		foreach($users_threads['Thread'] as $thread){

			$owner = $thread['Owner'];
			$user = $thread['User'];
			unset($thread['Owner']);
			unset($thread['User']);
			
			$this->loadModel('IgnoredThread');
			$this->IgnoredThread->recursive=-1;
			$ignored=$this->IgnoredThread->find('count',array('conditions'=>array('thread_id'=>$thread['id'],'user_id'=>$user_id)));
			if($ignored > 0)
			 $thread['notIgnored'] = false;
			else
			 $thread['notIgnored'] = true;
			
			$result[] = array('Thread' => $thread,'Owner' => $owner,'User' => $user);
							
		}
	$cache->set($result);
	echo json_encode($result);
	exit;
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
		parent::beforeFilter();
		$this->loadModel('User'); 
		$this->Auth->allow('index','threadTitle','updateThread','testThread','view','updates','edit','delete','notifications','addmember','userstoadd','deletemember','cache','delete_cache');
	}
	public function delete_cache(){
		
		Cache::clear(false);
		exit;
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id,$lastid=0,$ajax=false) {
		
		//error_reporting(2);
		$notif = new NotifCounts($this->User->Profile,$this->Auth->user('id'));
		$notif->clear('thread',$id);
		$cache = $this->getCache('threads');
		$viewCached = null;//$cache->get();
		if($viewCached){
			if($ajax){
				
				return $viewCached;
			}else{
				$this->set('thread',$viewCached);
				return;
			}
				
		}
		if (!$this->Thread->exists($id)) {
			throw new NotFoundException(__('Invalid thread'));
		}
		$this->Thread->recursive = 3;
		$this->Thread->Behaviors->load('Containable');
		$thread = $this->Thread->find('first',array(
			'conditions' => array('Thread.id' => $id),
			'contain' => array('Head'=>
				array(
					'Like'=> array('User'),
					'Comment' => array('User.username'),
					'Owner',
					'conditions'=>array('Head.id >'=>$lastid),
					'order' => array('Head.created DESC')
				),
				'User.username','User.avatar_img','User.id','Owner.username','Owner.avatar_img','Owner.id'
			)
		));
		
		$tid = $id;
		$uid = $this->Auth->user('id');
		
		unset($thread['Owner']['password']);
		
		$this->loadModel('Upload');
		$this->Upload->recursive=-1;
		foreach($thread['Head'] as $kk => $head){
			$thread['Head'][$kk]['likes_count'] = count($head['Like']);
			$thread['Head'][$kk]['likes'] = $head['Like'];
			$thread['Head'][$kk]['Comment'] = $head['Comment'];
			
			$thread['Head'][$kk]['Uploads']=$this->Upload->find('all',array('fields'=>array('name','path'),'conditions'=>array('head_id'=>$thread['Head'][$kk]['id'])));
			
			$thread['Head'][$kk]['isUserLiked'] = $this->Thread->Head->isLiked($head['id'],$uid);
			unset($thread['Head'][$kk]['Owner']['password']);
			unset($thread['Head'][$kk]['Like']);
			unset($thread['Head'][$kk]['Thread']);
			
		
			
		} 
		
		$this->Thread->notified($id,$uid);
		//set viewed for the user
		
		$cache->set($thread);
		
		if($ajax){
			
			return $thread;
		}else{
			$this->set('thread',$thread);
		}
	}

	public function updateThread($id,$lastid=0){
		
		$newthreads=$this->view($id,$lastid,true);
		
		echo json_encode($newthreads);
		exit;
	}
	
	public function testThread(){
		$users=$this->User->find('list',array('fields'=>'id'));
		
		$x=implode(",",$users);
		
		$this->addmember(22371,$x);
		
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {

		$cache = new CacheObj($this->Auth->user('id'),'threads');
		$cache->clear();
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
	public function ignoredt(){
		$this->loadModel('IgnoredThread');
		$t = $this->IgnoredThread->find('list',array(
			'conditions' => array('thread_id' => 199),
			'fields' => 'user_id'
		));
		print_r($t);
		exit;
	}
	public function addmember($thread_id = null,$member_id = null) {
		header('Content-Type: application/json;charset=utf-8');
		$ids = explode(",",$member_id);
		
		$me = $this->Thread->User->findById($this->Auth->user('id'));
		try{
			$thread = $this->Thread->findById($thread_id);
			$users = array();
						
			foreach($thread['User'] as $i => $u){
				if(is_numeric($i)){
					$users[] = $u['id'];
				}
			}
			
			$oldcount = count($users);
			$users = array_merge($ids,$users);
			$users = array_unique($users);
			
			$toclear_cache = $users;
			$toclear_cache[] = $this->Auth->user('id');
			
			foreach($toclear_cache as $t_uid){
				
					foreach(array("threads","heads") as $n){
							$cache = new CacheObj($t_uid,$n);
							$cache->clear();
					}
				
				
			}
			$usernames = $this->Thread->User->find('list',array('fields' => 'username','recursive'=>-1,'conditions'=>array(
				'User.id' => $ids	
			)));
			
			if(count($users)!=$oldcount){
				
				$result = $this->Thread->save(array(
					'Thread' => array('id' => $thread_id),
					'User' => array('User' => $users)
				));
				
				$this->Thread->Log->save(array(
						'user_id' => $this->Auth->user('id'),
						'thread_id' => $thread_id,
						'member' => serialize($usernames),
						'type' => 'Thread.joined'
				));	
				
				echo json_encode(array('status' => 'OK'));
				exit;
			}
			echo json_encode(array('status' => 'EXISTS'));
			
			exit;
		}catch(Exception $e){
			echo json_encode(array('status' => 'FAILED'));
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
				echo json_encode(array('status' => 'OK')); 
			else {
				echo json_encode(array('status' => 'FAILED'));
			}
			exit;
		}
		echo json_encode(array('status' => 'EXISTS'));
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
				echo json_encode(array('status' => 'OK'));
			} else {
				echo json_encode(array('status' => 'FAILED'));
			}
			exit;
		}else{
			echo json_encode(array('status' => 'NOT_EXISTING'));
		}
		exit;
	

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
	public function cache($id){
		print_r($this->Thread->members($id));
		exit;
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
			$message='OK';
			$this->Session->setFlash(__('The thread has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$message='FAILED';
			$this->Session->setFlash(__('The thread could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		if($this->request->params['ext']=='json'){
		 $this->set(array(
            'message' => $message,
            '_serialize' => array('message')
        ));
        exit;
		}else{
		return $this->redirect(array('action' => 'index'));
		}
	}
	
	public function userstoadd($thread_id){
		header('Content-Type: application/json;charset=utf-8');
		$members = $this->Thread->members($thread_id);
		$members[] = $this->Auth->user('id');
		$this->Thread->User->recursive=-1;
		$users = $this->Thread->User->find("all",
		
			array(
				'fields' => array('id','username'),
				'conditions' => array(
					'NOT' => array(
						'User.id' => $members
					)
		)));
		
		if(count($users) == 0){
			$users = $this->Thread->User->find("all",array('fields' => array('id','username')));
		}
		echo json_encode(array('users'=> $users));
		exit;
	}
	
	
	public function deletemember($thread_id = null, $member_id = null) { 
		$this->loadModel('User');
		header('Content-Type: application/json;charset=utf-8'); 
		$members = $this->Thread->members($thread_id);
		$members[] =  $this->Auth->user('id');
		//Clear the caches
		foreach($members as $uid){
					$cache = new CacheObj($uid,"threads");
					$cache->clear();
						
		}
		try{ 
    		 $this->Thread->query("delete from users_threads where user_id = $member_id and thread_id = $thread_id");
    		// $result = $this->User->deleteAssoc($member_id,'Thread',$thread_id);
			echo json_encode(array('status' => 'DELETED'));
			exit;
		}catch(Exception $e){
			echo json_encode(array('status' => 'FAILED to catch'));
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
