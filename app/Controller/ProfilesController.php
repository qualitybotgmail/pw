<?php
App::uses('AppController', 'Controller');
App::import('Vendor','NotifCounts');

/**
 * Profiles Controller
 *
 * @property Profile $Profile
 * @property PaginatorComponent $Paginator
 */


class ProfilesController extends AppController {

/**
 * Components
 *
 * @var array
 */
	public $components = array('Paginator');
	public function beforeFilter(){
		parent::beforeFilter();
		$this->Auth->allow('me','getnotif','froks');
	}
	public function logged(){
		$prof = $this->Profile->findByUserId($this->Auth->user('id'));
		if(count($prof)){
			$id = $prof['Profile']['id'];
			$now = date("Y:m:d G:i:s");
			
			$this->Profile->id=$id;
			$this->Profile->saveField('lastsync',$now);
		//	exit;
		}
		file_put_contents("/tmp/loggged",date("g:i:s")."\n".print_r(array(
			'User'=>$this->Auth->user('username')),true),FILE_APPEND);
		exit;
	}
/**
 * index method
 *
 * @return void
 */
	public function index() {
		$this->Profile->recursive = 0;
		$this->set('profiles', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->Profile->exists($id)) {
			throw new NotFoundException(__('Invalid profile'));
		}
		$options = array('conditions' => array('Profile.' . $this->Profile->primaryKey => $id));
		$this->set('profile', $this->Profile->find('first', $options));
	}

	public function renewfcm(){
		$this->layout = null;
		$id = $this->Auth->user('id');
		$profile = $this->Profile->findByUserId($id);
		if(!$profile){
			$profile = $this->Profile->save(array('user_id' => $id));
		}
		
		$this->Profile->id = $profile['Profile']['id'];
		$this->Profile->saveField('fcm_id','');
		
		
	}
/**
 * add method
 *
 * @return void
 */	
 
	public function add() {
		if ($this->request->is('post')) {
		$user_id = $this->Auth->user('id');
			
			$this->Profile->create();
			$data = array(
				'Profile' => array(
						'user_id'=>$user_id, 
						'firstname'=> $this->request->data['firstname'], 
						'lastname'=>$this->request->data['lastname']
					)
				);
			$saveResult = $this->Profile->save($data);
			if ($saveResult) {
				echo json_encode($saveResult);
				exit;
			} else {
				$this->Session->setFlash(__('The profile could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		}
		$users = $this->Profile->User->find('list');
		$this->set(compact('profiles'));
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->Profile->exists($id)) {
			throw new NotFoundException(__('Invalid profile'));
		}
		if ($this->request->is(array('post', 'put'))) {
			$result = $this->Profile->save($this->request->data);
			if ($result) {
				$this->Session->setFlash(__('The profile has been saved.'), 'default', array('class' => 'alert alert-success'));
				echo json_encode($result);
				exit;
				// return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The profile could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Profile.' . $this->Profile->primaryKey => $id));
			$this->request->data = $this->Profile->find('first', $options);
		}
		$users = $this->Profile->User->find('list');
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
		$this->Profile->id = $id;
		if (!$this->Profile->exists()) {
			throw new NotFoundException(__('Invalid profile'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Profile->delete()) {
			$this->Session->setFlash(__('The profile has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The profile could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
	
	
	public function checkProfile($id = null){
		$pcount = $this->Profile->find('count',
				array('conditions' => array('Profile.user_id' => $id)));  
		
		if($pcount!=0){ 
		echo json_encode(array('status' => 'With Profile')); 
		}else{ 
		echo json_encode(array('status' => 'No Profile')); 
		}
		 
		 exit;
	}
	public function clearNotifCount(){
		header('Content-Type: application/json;charset=utf8');
		$notif = new NotifCounts($this->Profile,$this->Auth->user('id'));
		$notif->clear();
		echo '{status: "OK"}';
		exit;
	}
	public function getnotif(){

		error_reporting(0);
		$notif = $this->notifications(true);
		
		$uid = $this->Auth->user('id');
		$return = array();
		$link_head = "https://" . $_SERVER['HTTP_HOST'];
		$skipped = array();
		//print_r($notif);exit;
		foreach($notif as $k => $n){
	
			if($n['type'] != 'User.logged' && $n['user_id'] == $uid){
				
				$skipped[] = $k;
				continue;
			}
			
			if($this->Session->read('Backoffice.notified')==null){
				$this->Session->write('Backoffice.notified',array($n['id']));
			}else{
				$ses = $this->Session->read('Backoffice.notified');
				if(in_array($n['id'],$ses)){
					
					continue;
				}else{
					$ses[] = $n['id'];
					$this->Session->write('Backoffice.notified',$ses);
				}
			}
			$link = '';
			$body = "";
			$title = "";
			
			if(isset($n['thread_id']) && $n['thread_id'] != 0){
					$this->loadModel("IgnoredThread");
					$e = $this->IgnoredThread->findByThreadIdAndUserId($n['thread_id'],$uid);
					if($e){
		
						continue;
					}
			}
			
			if($n['type'] == 'Comment.like'){
				$uname = $n['User']['username'];
				$head = $n['Head']['body'];
				$title = "Back office 通知";
				$thread = $n['Thread']['title'];
				if($uid == $n['Comment']['user_id'])
					$body = "$uname さんがあなたのコメントに「いいね」と言っています。";
				else {
					$body = "$uname さんがグループ投稿コメントに「いいね」と言っています。";
				}
				$link = '/index.html#/heads/'.$n['Head']['id'];
				
			}elseif($n['type'] == 'Comment.add'){
				$uname = $n['User']['username'];
				$head = $n['Head']['body'];
				$title = "Back office 通知";
				$thread = $n['Thread']['title'];
				$body = "$uname さんが「 $thread 」のグループ投稿にコメントを投稿しました。";
				$link = '/index.html#/heads/'.$n['Head']['id'];
				
			}elseif($n['type'] == 'Head.like'){
				$uname = $n['User']['username'];
				$head = $n['Head']['body'];
				$title = "Back office 通知";
				$thread = $n['Thread']['title'];
				$body = "$uname さんが「 $thread 」のグループ投稿に「いいね」と言っています。";
				$link = '/index.html#/heads/'.$n['Head']['id'];		
				
			}elseif($n['type'] == 'Head.add'){
				$uname = $n['User']['username'];
				$head = $n['Head']['body'];
				$title = "Back office 通知";
				$thread = $n['Thread']['title'];
				$body = "$uname さんが「 $thread 」のグループにグループ投稿を投稿しました。";
				$link = '/index.html#/heads/'.$n['Head']['id'];		
			
			}elseif($n['type'] == 'Head.edit'){
				$uname = $n['User']['username'];
				$head = $n['Head']['body'];
				$title = "Back office 通知";
				$thread = $n['Thread']['title'];
				$body = "$uname さんがグループ投稿を変更しました。";
				$link = '/index.html#/heads/'.$n['Head']['id'];		
			}elseif($n['type'] == 'Thread.edit'){
				$uname = $n['User']['username'];
				$title = "Back office 通知";
				$thread = $n['Thread']['title'];
				$body = "$uname さんがグループを変更しました。";
				$link = '/index.html#/threads/'.$n['Thread']['id'];		
			}elseif($n['type'] == 'Message.add'){
				$uname = $n['User']['username'];
				$title = "$uname さんからメッセージ：";
				
				$body = $n['Message']['body'];//"$uname さんがグループを変更しました。";
				$link = '/index.html#/message/'.$n['Groupchat']['id'];		
			}elseif($n['type'] == 'Thread.joined'){
				$uname = $n['User']['username'];
				$thread = $n['Thread']['title'];
				$member = unserialize($n['member']);
				
				$members = count($member) > 1 ? implode("さん、",$member)."さん": array_pop($member). "さん";
				
				$body = "$uname さんがグループのメンバーに\n"."$members \nを追加しました。";
				//who was added here?
				
				$title = "Back office 通知";
				$link = '/index.html#/threads/'.$n['Thread']['id'];			
			}	
		
			$return[$n['id']] = array('body' => $body,'type' => $n['type'],'title' => $title,'link' => $link_head.$link);
		
		}
	
		file_put_contents("/tmp/lastcurl",date("g:i:s")."\n".print_r(array(
			'Gotnotif'=>$return,'User'=>$this->Auth->user('username'),'N'=>$notif,'S'=>$skipped
			),true),FILE_APPEND);
		echo json_encode($return);
		exit;
	}
	public function froks(){
		
		exit;
	}
	public function setregid(){
		if($this->request->is('post')){
			$data = $this->request->data;
			$fcmid = $data['fcmid'];
			
			$uid = $this->Auth->user('id');
		
			$profile = $this->Profile->findByUserId($uid);
			if(count($profile)==0){
				$existing = $this->Profile->findByFcmId($fcmid);
				if($existing){
					$eid = $existing['Profile']['id'];
					$this->Profile->id = $eid;
			//		$this->Profile->saveField('fcm_id','');
				}
				$profile = $this->Profile->save(array('user_id' => $uid,'fcm_id' => $fcmid));
				
			}else{
				$this->Profile->id = $profile['Profile']['id'];
				$this->Profile->saveField('fcm_id',$fcmid);
			}
			
		}
		exit;
	}
	public function myfcmid(){
	
		$profile = $this->Profile->findByUserId($this->Auth->user('id'));
		echo $profile['Profile']['fcm_id'];
		exit;
	}

	public function me(){ 
		error_reporting(0);
		$this->loadModel('User'); 
		$this->view = 'view'; 
		if($this->Auth->user('id')==null){
			exit;
		}
		
		$id = $this->Auth->user('id');
    	
    	//look for existing
        $usercount = $this->Profile->find('count', array('conditions'=> array('Profile.user_id' => $id))); 
		$created_profile = false;
		//if has profile
		if($usercount!=0){
	    	 $user = $this->Profile->find('first', 
	    	 array('conditions'=> array('Profile.user_id' => $id)),
	    	 array('fields' => array('Profile.id','Profile.user_id','User.username','Profile.firstname', 'Profile.lastname','Profile.created','Profile.modified', 'User.role','User.created','User.modified'))); 
		
		//if no profile yet
		}else{
			$this->Profile->save(
				array(
					'user_id' => $id
				)	
			);
			$created_profile = true;
			$this->User->Behaviors->load('Containable'); 
			$user = $this->User->find('first', 
			array('contain' => array('Profile.id','Profile.user_id','User.username','Profile.firstname', 'Profile.lastname','Profile.created','Profile.modified', 'User.role','User.created','User.modified')),
			array('conditions'=> array('User.id' => $id),
			array('fields' => array('id','username','created','modified')))); 
			
		}
		if($user['Profile']['notifications_count'] == null){
			$this->User->Profile->id = $user['Profile']['id'];
			$this->User->Profile->saveField('notifications_count',json_encode(array(
				'Threads' => array(),'Groupchats' => array()	
			)));
			$user['Profile']['notifications_count'] = json_encode(array(
				'Threads' => array(),'Groupchats' => array()	
			));
		}
		if($created_profile) $this->redirect(array('controller'=>'profiles','action'=>'me.json'));
        unset($user['User']['password']);
        $this->set('profiles',$user);
        
	}

	public function _loadasoc(&$obj,$modelA,$modelB,$recursive = -1,$fields = array()){
		$this->loadModel($modelB);
		$this->$modelB->recursive=$recursive;
		$find = "findAllBy".$modelA."Id";
		$result = $this->$modelB->$find($obj[$modelA]['id'],$fields);
		$obj[$modelB] = $result;
		return $result;
	}
	public function timeline(){
	//	error_reporting(0);
		
		header("Content-Type: application/json");
		
		$this->Profile->User->recursive=1;
		$this->Profile->User->Thread->recursive=-1;
		$this->Profile->User->Thread->Head->recursive=-1;
		$this->Profile->User->Thread->Head->Comment->recursive=2;
		
		$u = $this->Profile->User->findById($this->Auth->user('id'));
		$threads = array();
		foreach($u['Thread'] as $t){
			$threads[] = array("Thread" => $t);
		}
		
		foreach($threads as $k => $t){
			$threads[$k]['Head'] = array();
			$tid = $t['Thread']['id'];
			$heads = $this->Profile->User->Thread->Head->findAllByThreadId($tid);
		
			foreach($heads as $kh=> $head){
				$hid = $head['Head']['id'];
				if($t['Thread']['modified'] < $head['Head']['modified']){
					$threads[$k]['Thread']['modified'] = $head['Head']['modified'];
				}
				if($t['Thread']['modified'] < $head['Head']['created']){
					$threads[$k]['Thread']['modified'] = $head['Head']['created'];
				}				
				$threads[$k]['Head'][] = $head['Head'];
				
				
				$comments = $this->_loadasoc($head,'Head','Comment',1);
				$this->Profile->User->recursive =-1;
	            $head['Head']['Owner'] = $this->Profile->User->findById($head['Head']['user_id'],array('username'));
				
				$this->_loadasoc($head,'Head','Upload');
				
				$this->_loadasoc($head,'Head','Like');
				$head['Head']['likes'] = isset($head['Like'])?count($head['Like']):0;
				$userLiked = $this->Profile->User->Head->Like->findByUserIdAndHeadId($this->Auth->user('id'),$hid);
				$head['Head']['isUserLiked'] = count($userLiked)>0;
				$threads[$k]['Head'][$kh] = $head;
				
				for($i = 0 ; $i < count($comments); $i++){
					$comment = $threads[$k]['Head'][$kh]['Comment'][$i];
					
					if($threads[$k]['Thread']['modified'] < $comment['Comment']['modified']){
						$threads[$k]['Thread']['modified'] = $comment['Comment']['modified'];
					}					
					if($threads[$k]['Thread']['modified'] < $comment['Comment']['created']){
						$threads[$k]['Thread']['modified'] = $comment['Comment']['created'];
					}					
										
					$this->_loadasoc($threads[$k]['Head'][$kh]['Comment'][$i],'Comment','Like');
					$threads[$k]['Head'][$kh]['Comment'][$i]['Comment']['likes'] = count($threads[$k]['Head'][$kh]['Comment'][$i]['Like']);
					$userCommentLiked = $this->Profile->User->Like->findByUserIdAndCommentId($this->Auth->user('id'),$comment['Comment']['id']);
					$threads[$k]['Head'][$kh]['Comment'][$i]['Comment']['isUserLiked'] = count($userCommentLiked)>0;
					$this->_loadasoc($threads[$k]['Head'][$kh]['Comment'][$i],'Comment','Upload');
					
				}
				
			}
			
			
		}

		$sort = array();
		foreach($threads as $i => $v){
			$sort[$i] = $v['Thread']['modified'];
			
		}
		arsort($sort);
		$result = array();
		$this->Profile->User->recursive=-1;
		foreach($sort as $i => $v){
			$o = $this->Profile->User->findById($threads[$i]['Thread']['user_id'],'username');
			$threads[$i]['Owner']['username'] = $o['User']['username'];
			$result[] = $threads[$i];
		}
		
		echo json_encode($result);
		exit;
	}
	public function timeline2(){ 
	////this should have logs then query threads owner
		$this->loadModel('Log'); 
		$this->loadModel('Thread'); 
		$this->loadModel('Head'); 
		$this->loadModel('Comment'); 
		$user_id = $this->Auth->user('id'); 
		 $data=[];
		 
		// $this->Thread->recursive = 2; 
		$this->Thread->recursive = 3; 
		//////////////////////////////////////////
		// $timeline = $this->Log->Thread->find('all',
		// ['conditions' => ['Thread.user_id' => $user_id]], 
		// ['order' =>['Log.created' => 'desc']] 
		// );
		///////////////////////////////////////
		$timelines = $this->Log->find('all', 
		['order' =>['Log.created' => 'desc']] 
		);
		 
		foreach($timelines as $timeline){
			
			$thread_id = $timeline['Log']['thread_id']; 
			$head_id = $timeline['Log']['head_id']; 
			$comment_id = $timeline['Log']['comment_id']; 
			
				$thread = $this->Thread->find('all',
					array('conditions' =>
						array('AND'=>array(
							array('Thread.user_id' => $user_id),
							array('Thread.id' => $thread_id)
						)),
					),
					array('order' =>array('Thread.created' => 'desc')));
			
				// $head = $this->Head->find('all',
				// 	['conditions' =>
				// 		['AND'=>[
				// 			['Head.user_id' => $user_id],
				// 			['Head.id' => $head_id]
				// 		]],
				// 	]);
			
				// $comment = $this->Comment->find('all',
				// 	['conditions' =>
				// 		['AND'=>[
				// 			['Comment.user_id' => $user_id],
				// 			['Comment.id' => $comment_id]
				// 		]],
				// 	]);
					
				// $head = $this->Head->find('all',
				// 	['conditions' => ['Head.user_id' => $user_id]] 
				// 	);
					
				// $comment = $this->Comment->find('all',
				// 	['conditions' => ['Comment.user_id' => $user_id]] 
				// 	);
					
				if(!empty($thread))$data['Threads'][] = $thread; 
				// if(!empty($head))$data['Heads'][] = $head; 
				// if(!empty($comment))$data['Comment'][] = $comment; 
			
			
		}
		$this->set('profile', $data); 	
		
	}
	
	public function message(){
		$this->loadModel('Message');
		$user_id = $this->Auth->user('id');  
		$this->Message->recursive = 4; 
		$message = $this->Message->find('all', 
		// ['fields' => ['id','user_id','groupchat_id','body','created','modified']],
		array('conditions' => array('Message.user_id' => $user_id)), 
		array('order' =>array('Message.created' => 'desc')));  
		 
		$this->set('profile', $message); 
	}
	
	
	public function likedhead(){
		
		$user_id = $this->Auth->user('id'); 
		$like = $this->Profile->User->Like->find('all', 
		// ['fields' => ['id','head_id','created','modified']],
		array('conditions' => array('Like.user_id' => $user_id), array('head_id !='=>'0')), 
		array('order' =>array('Like.created' => 'desc')));   
		
		$this->set('profile', $like); 
	}
	
	public function addedtogroupchat(){
		$this->loadModel('Groupchat'); 
		$user_id = $this->Auth->user('id');
		
		$groupchat = $this->Groupchat->find('all', 
		// ['fields' => ['id','created','modified']],
		array('conditions' => array('Groupchat.user_id' => $user_id)), 
		array('order' =>array('Groupchat.created' => 'desc')));   
		
		$this->set('profile', $groupchat); 
		
	}
	
	public function attachment(){
		$this->loadModel('Upload');
		$user_id = $this->Auth->user('id');
		
		$groupchat = $this->Upload->find('all', 
		// ['fields' => ['id','comment_id','name','size','path','created','modified']],
		array('conditions' => array('Upload.user_id' => $user_id)), 
		array('order' =>array('Upload.created' => 'desc')));   
		
		$this->set('profile', $groupchat); 
		
	}
	
	public function likedcomment(){
		$this->loadModel('User');
		$this->loadModel('Like');
		$this->User->Like->recursive = 0;
		// $this->loadModel('Like');
		$user_id = $this->Auth->user('id');
		$like = $this->User->Like->find('all', 
		// ['fields' => ['id','comment_id','created','modified']],
		array('conditions' => array('Like.user_id' => $user_id), array('comment_id >='=>'1')), 
		array('order' =>array('Like.created' => 'desc')));   
		
		$this->set('profile', $like); 
	}
	
	
	public function search($keyword = null){
		error_reporting(0);
		
		header('Content-Type: application/json;charset=utf-8'); 
		if($keyword == null || strlen(trim($keyword)) == 0) {
			echo json_encode(array('Threads'=>null,'Heads'=>null));
			exit;
		}
		$this->loadModel('Thread');
		$this->loadModel('Head'); 
		$this->loadModel('User'); 
		
		
		$this->Profile->recursive = 1;
		$this->Thread->recursive = -1; 
		$this->Head->recursive = -1; 
		$this->User->recursive = -1;
		
		$user_id = $this->Auth->user('id');
		
		 
		$keyword = str_replace("+", " ", $keyword);
		$keyword = explode(" ",trim($keyword));
		
		$data=array();
		foreach($keyword as $k){
			
			$users = $this->User->find('all',
			array('conditions' => array('User.username LIKE' => '%'.$k.'%'),
			'fields' => array('id','username')));
			
			$prof_cond = array(
					'Profile.firstname LIKE' => '%'.$k.'%',
					'Profile.lastname LIKE' => '%'.$k.'%' ,
					'Profile.user_id' => array_keys($users)
			);
			
			$prof = $this->Profile->find('all',
			array('fields'=>array(
					'Profile.id',
					'Profile.user_id',
					'Profile.firstname','Profile.lastname',
					'User.id',
					'User.username'
				),
				'conditions' =>
				array('OR'=>$prof_cond),
			),	array('order' =>array('User.created' => 'desc')));
			
			
			$pusers = array();
			foreach($prof as $p){
				$pusers[] = array('User' => $p['User']);
			}

			$pusers = array_unique(array_merge($users,$pusers),SORT_REGULAR);
			
			$thread = $this->Thread->find('all', 
				array('conditions' => array('Thread.title LIKE' => '%'.$k.'%', 'user_id' => $user_id)));
			
			$options = array(
				'conditions' => array('Thread.title LIKE' => '%'.$k.'%'),
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
			$user_threads = $this->Thread->find('all', $options);
			// echo json_encode(array_merge($thread,$user_threads));die();
			
			
			$this->Head->Behaviors->load("Containable");
			$head = $this->Head->find('all', 
				array(
					'conditions' =>  array('Head.body LIKE' => '%'.$k.'%'),
					'fields'  => array('body','id'),
					'contain' => array(
						'Thread' => array('User.id = ' .$this->Auth->user('id'))
					)
				));  
			$heads = array();
			foreach($head as $h){
				if(count($h['Thread']['User'])>0){
					$heads[] = array('Head' => $h['Head']);
				}
			}
		//	print_r($heads);exit;
			$thread = $this->Thread->find('all', 
				array('conditions' => array(
					'OR' =>
					array('Thread.title LIKE' => '%'.$k.'%',
					'Thread.id' => $threadis))));  
			
			// $thread = $this->Thread->find('all', 
			// 	['conditions' => ['Thread.title LIKE' => '%'.$k.'%'] ], 
			// 	['order' =>['Thread.created' => 'desc']]);  
			// $thread = $this->User->Thread->Head->find('all', 
			// ['conditions' =>
			// 	['OR'=>[
			// 		['Head.body LIKE' => '%'.$k.'%'], 
			// 		['Thread.title LIKE' => '%'.$k.'%']
			// 	]],
			// ], 
			// ['order' =>['Head.created' => 'desc']]);  
			 
			// echo json_encode(array($user,$head));

			// if(!empty($users))$data['Users'] = $users;
			if(!empty($pusers))$data['Users'] = array_merge($pusers,[]);
			if(!empty($thread) || !empty($user_threads))$data['Threads'] = array_merge($thread,$user_threads);
			// if(!empty($thread))$data['Threads'] = $users_threads;
			if(!empty($heads))$data['Heads'] = $heads;
		
			//$data[] = array_merge($user, $thread, $head); 
		}
		function m($v){
			return $v[0]['Thread']['modified'];
		}
		
		array_multisort(
			array_map('m',$data['Threads']),
			SORT_DESC ,SORT_REGULAR ,
			$data['Threads']);
		
		echo json_encode($data);
		exit;
	}
	public function notifications_count($return = false) { 
	
		header('Content-Type: application/json;charset=utf8');
		$uid = $this->Auth->user("id");
		$noty = new NotifCounts($this->Profile,$uid);
		// if(!$noty->modified()){
		// 	header("HTTP/1.1 304 Not Modified");
		// 	exit;
		// }else{
		// 	header("ETag: ".$noty->hash());
		// }

	
		$not = $noty->getNotif();
		
		$ret = array('Threads' => array(),'Groupchats' => array());
		
		foreach($not['Threads'] as $k=>$n){
			$ret["Threads"][] = array("thread_id" => (string)$k,"count"=>(string) $n);
		}
		foreach($not['Groupchats'] as $k=>$n){
			$ret["Groupchats"][] = array("groupchat_id" => (string)$k,"count" => (string)$n);
		}
				
	
		
		echo json_encode($ret);
		exit;
	}	
	public function notifications($ret = false){
		header('Content-Type: application/json;charset=utf-8'); 
		$notifications = $this->Profile->User->Log->notifications($this->Auth->user('id'));
		
		if($ret) return $notifications;
		
		echo json_encode($notifications);
		exit;
	
	}
	public function notified($lid = null){
		header('Content-Type: application/json;charset=utf-8'); 
		$r = $this->Profile->User->Log->setNotified($lid);
		echo json_encode(array('status' => $r));
		exit;
	}
	
	public function fooa(){
		$ifnonmatch = null;
		if(isset($_SERVER['HTTP_IF_NONE_MATCH'])){
			$ifnonmatch = $_SERVER['HTTP_IF_NONE_MATCH'];
		}
		
		
		$p = $this->Profile->findByUserId($this->Auth->user('id'));
		$hash = md5($p['Profile']['notifications_count']);
		if($hash == $ifnonmatch){
			header("HTTP/1.1 304 Not Modified");
			exit;
		}
		
		header('Content-Type: application/json;charset=utf-8'); 
		header("ETag: $hash");
	//	echo $hash;
		
		echo $p['Profile']['notifications_count'];
		exit;

	}
	public function notificationsoff(){
		
		$uid = $this->Auth->user('id');
		$prof = $this->Profile->findByUserId($uid);
		
		if(count($prof) > 0){
			$r = $this->Profile->save(array('notifications' => 0,'id' => $prof['Profile']['id']));
			if(!$r){
				echo json_encode(array('status' => 'FAILED'));
				exit;
			}
		}else{
			$prof = array(
				'notifications' => 0,'user_id' => $uid
			);
			$this->Profile->save($prof);
		}
		echo json_encode(array('status' => 'OK'));
		exit;
	}

	public function notificationson(){
		
		$uid = $this->Auth->user('id');
		$prof = $this->Profile->findByUserId($uid);
		
		if(count($prof) > 0){
			$r = $this->Profile->save(array('notifications' => 1,'id' => $prof['Profile']['id']));
			if(!$r){
				echo json_encode(array('status' => 'FAILED'));
				exit;
			}
		}else{
			$prof = array(
				'notifications' => 1,'user_id' => $uid
			);
			$this->Profile->save($prof);
		}
		echo json_encode(array('status' => 'OK'));
		exit;
	}
	
	
}
