<?php
App::uses('AppController', 'Controller');
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
		$this->Auth->allow('me','getnotif');
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

/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
		$user_id = $this->Auth->user('id');
			
			$this->Profile->create();
			$data = [
				'Profile' => [
						'user_id'=>$user_id, 
						'firstname'=> $this->request->data['firstname'], 
						'lastname'=>$this->request->data['lastname']
					]
				];
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
				['conditions' => ['Profile.user_id' => $id] ]);  
		
		if($pcount!=0){ 
		echo json_encode(['status' => 'With Profile']); 
		}else{ 
		echo json_encode(['status' => 'No Profile']); 
		}
		 
		 exit;
	}
	public function getnotif(){
		// $uid = $this->Auth->user('id');
		// $prof = $this->Profile->findByUserId($uid);
		// //echo json_encode($prof);
		$n = $this->notifications(true);
		$uid = $this->Auth->user('id');
		
		$n = $n[0];
		if($this->Session->read('Backoffice.notified')==null){
			$this->Session->write('Backoffice.notified',array($n['id']));
		}else{
			$ses = $this->Session->read('Backoffice.notified');
			if(in_array($n['id'],$ses)){
				
				exit;	
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
					exit;
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
				$body = "$uname さんがヘッドコメントに「いいね」と言っています。";
			}
			$link = '/index.html#/heads/'.$n['Head']['id'];
			
		}elseif($n['type'] == 'Comment.add'){
			$uname = $n['User']['username'];
			$head = $n['Head']['body'];
			$title = "Back office 通知";
			$thread = $n['Thread']['title'];
			$body = "$uname さんが「 $thread 」のヘッドにコメントを投稿しました。";
			$link = '/index.html#/heads/'.$n['Head']['id'];
			
		}elseif($n['type'] == 'Head.like'){
			$uname = $n['User']['username'];
			$head = $n['Head']['body'];
			$title = "Back office 通知";
			$thread = $n['Thread']['title'];
			$body = "$uname さんが「 $thread 」のヘッドに「いいね」と言っています。";
			$link = '/index.html#/heads/'.$n['Head']['id'];		
		}elseif($n['type'] == 'Head.add'){
			$uname = $n['User']['username'];
			$head = $n['Head']['body'];
			$title = "Back office 通知";
			$thread = $n['Thread']['title'];
			$body = "$uname さんが「 $thread 」のスレッドにヘッドを投稿しました。";
			$link = '/index.html#/heads/'.$n['Head']['id'];		
		
		}elseif($n['type'] == 'Head.edit'){
			$uname = $n['User']['username'];
			$head = $n['Head']['body'];
			$title = "Back office 通知";
			$thread = $n['Thread']['title'];
			$body = "$uname さんがヘッドを変更しました。";
			$link = '/index.html#/heads/'.$n['Head']['id'];		
		}elseif($n['type'] == 'Thread.edit'){
			$uname = $n['User']['username'];
			$title = "Back office 通知";
			$thread = $n['Thread']['title'];
			$body = "$uname さんがスレッドを変更しました。";
			$link = '/index.html#/threads/'.$n['Thread']['id'];		
		}elseif($n['type'] == 'Message.add'){
			$uname = $n['User']['username'];
			$title = "$uname さんからメッセージ：";
			
			$body = $n['Message']['body'];//"$uname さんがスレッドを変更しました。";
			$link = '/index.html#/message/'.$n['Groupchat']['id'];		
		}elseif($n['type'] == 'Thread.joined'){
			$uname = $n['User']['username'];
			$thread = $n['Thread']['title'];
			$member = unserialize($n['member']);
			
			$members = count($member) > 1 ? implode("さん、",$member)."さん": array_pop($member). "さん";
			
			$body = "$uname さんがスレッドのメンバーに\n"."$members \nを追加しました。";
			//who was added here?
			
			$title = "Back office 通知";
			$link = '/index.html#/threads/'.$n['Thread']['id'];			
		}		
		echo json_encode(array('body' => $body,'title' => $title,'link' => $link));
		exit;
	}
	public function setregid(){
		if($this->request->is('post')){
			$data = $this->request->data;
			$fcmid = $data['fcmid'];
			
			$uid = $this->Auth->user('id');
		
			$profile = $this->Profile->findByUserId($uid);
			if(count($profile)==0){
				$profile = $this->Profile->save(array('user_id' => $uid,'fcm_id' => $fcmid));
				
			}else{
				$this->Profile->id = $profile['Profile']['id'];
				$this->Profile->saveField('fcm_id',$fcmid);
			}
			
		}
		exit;
	}

	public function me($id = null){ 
		 
		$this->loadModel('User'); 
		$this->view = 'view'; 
		if($id==null)
			$id = $this->Auth->user('id');
        $usercount = $this->Profile->find('count', ['conditions'=> ['Profile.user_id' => $id]]); 
		if($usercount!=0){
	    	 $user = $this->Profile->find('first', 
	    	 ['conditions'=> ['Profile.user_id' => $id]],
	    	 ['fields' => ['Profile.id','Profile.user_id','User.username','Profile.firstname', 'Profile.lastname','Profile.created','Profile.modified', 'User.role','User.created','User.modified']]); 
		}else{
			$this->User->recursive = -1; 
			$user = $this->User->find('first', 
			['conditions'=> ['User.id' => $id],
			['fields' => ['id','username','role','created','modified']]]); 
		}
        
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
		foreach($sort as $i => $v){
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
					['conditions' =>
						['AND'=>[
							['Thread.user_id' => $user_id],
							['Thread.id' => $thread_id]
						]],
					],
					['order' =>['Thread.created' => 'desc']]);
			
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
		['conditions' => ['Message.user_id' => $user_id]], 
		['order' =>['Message.created' => 'desc']]);  
		 
		$this->set('profile', $message); 
	}
	
	
	public function likedhead(){
		
		$user_id = $this->Auth->user('id'); 
		$like = $this->Profile->User->Like->find('all', 
		// ['fields' => ['id','head_id','created','modified']],
		['conditions' => ['Like.user_id' => $user_id], ['head_id !='=>'0']], 
		['order' =>['Like.created' => 'desc']]);   
		
		$this->set('profile', $like); 
	}
	
	public function addedtogroupchat(){
		$this->loadModel('Groupchat'); 
		$user_id = $this->Auth->user('id');
		
		$groupchat = $this->Groupchat->find('all', 
		// ['fields' => ['id','created','modified']],
		['conditions' => ['Groupchat.user_id' => $user_id]], 
		['order' =>['Groupchat.created' => 'desc']]);   
		
		$this->set('profile', $groupchat); 
		
	}
	
	public function attachment(){
		$this->loadModel('Upload');
		$user_id = $this->Auth->user('id');
		
		$groupchat = $this->Upload->find('all', 
		// ['fields' => ['id','comment_id','name','size','path','created','modified']],
		['conditions' => ['Upload.user_id' => $user_id]], 
		['order' =>['Upload.created' => 'desc']]);   
		
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
		['conditions' => ['Like.user_id' => $user_id], ['comment_id >='=>'1']], 
		['order' =>['Like.created' => 'desc']]);   
		
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
		
		$data=[];
		foreach($keyword as $k){
			
			$users = $this->User->find('all',
			['conditions' => ['User.username LIKE' => '%'.$k.'%'],
			'fields' => ['id','username']]);
			
			$prof_cond = array(
					'Profile.firstname LIKE' => '%'.$k.'%',
					'Profile.lastname LIKE' => '%'.$k.'%' ,
					'Profile.user_id' => array_keys($users)
			);
			
			$prof = $this->Profile->find('all',
			['fields'=>[
					'Profile.id',
					'Profile.user_id',
					'Profile.firstname','Profile.lastname',
					'User.id',
					'User.username'
				],
				'conditions' =>
				['OR'=>$prof_cond],
			],	['order' =>['User.created' => 'desc']]);
			
			
			$pusers = [];
			foreach($prof as $p){
				$pusers[] = ['User' => $p['User']];
			}

			$pusers = array_unique(array_merge($users,$pusers),SORT_REGULAR);
			
			$thread = $this->Thread->find('all', 
				['conditions' => ['Thread.title LIKE' => '%'.$k.'%', 'user_id' => $user_id] ]);
			
			$options = [
				'conditions' => ['Thread.title LIKE' => '%'.$k.'%'],
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
				['conditions' => [
					'OR' =>
					['Thread.title LIKE' => '%'.$k.'%',
					'Thread.id' => $threadis]]]);  
			
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
		
		echo json_encode($data);exit;
	}
	public function notifications_count() { 
		header('Content-Type: application/json;charset=utf8');
		$uid = $this->Auth->user('id');

		$t = $this->Profile->query(
			'SELECT Thread.id id,count(distinct Logs.id) count FROM `users_threads` UsersThread
			inner join logs Logs on Logs.thread_id = UsersThread.thread_id
			inner join threads Thread on Thread.id = UsersThread.thread_id
			
			where (UsersThread.user_id = '.$uid.' or Thread.user_id = '.$uid.') 
			and Logs.user_id != '.$uid.' 
			and Logs.id not in 
			(select log_id from users_logs where users_logs.user_id = '.$uid.')
			group by UsersThread.thread_id'
		);
		
		$ret = array('Threads'=>array(),'Groupchats'=>array());
		foreach($t as $v){
			$ret["Threads"][] = array('thread_id' => $v['Thread']['id'],'count' => $v['0']['count']);
		}

		$t2q ='SELECT Groupchat.id id,count(Groupchat.id) count FROM `logs` 
			inner join groupchats Groupchat on Groupchat.id = logs.groupchat_id
			inner join users_groupchats on Groupchat.id = users_groupchats.groupchat_id
			where (Groupchat.user_id = '.$uid.' or users_groupchats.user_id = '.$uid.') and logs.user_id != '.$uid.' and logs.id not in (select log_id from users_logs where user_id = '.$uid.')
			group by Groupchat.id';

		$t2 = $this->Profile->query($t2q);
		
		foreach($t2 as $v){
			$ret["Groupchats"][] = array('groupchat_id' => $v['Groupchat']['id'],'count' =>  $v['0']['count']);
		}
		
		echo json_encode($ret);
		exit;
	}	
	public function notifications($ret = false){
		header('Content-Type: application/json;charset=utf-8'); 
		
		$uid = $this->Auth->user('id');
		$prof = $this->Profile->findByUserId($uid);
		$prof = @$prof['Profile'];
		if(isset($prof['notifications'])){
			
			if($prof['notifications'] == 0){
				echo json_encode(array('status' => 'OFF'));
				exit;
			}
		}		
		$this->loadModel('UsersLog');
		$notifiedIds = array_unique($this->UsersLog->find('list',array(
			'conditions' => array(
				'user_id' => $uid
			),
			'fields' => 'log_id'
		)));
		
		$this->Profile->User->Behaviors->load('Containable');

		$user = $this->Profile->User->find('first',array(
			'conditions' => array('id' => $uid),
			'contain' => array(
				
				'Thread' => array(
					'Log.thread_id',
					'Log.user_id',
					'Log.id',
					
					'Log.user_id != ' . $uid,
					'Log.type',
					'Log.member',
					'Log.created',
					'Log' => 
					array(
						'conditions' => array(
							'NOT' => array(
								'id' => $notifiedIds,'user_id' => $uid)	
						),
						
						'User.username',
						'Thread.id != 0',
						'Head.id != 0',
						'Comment.id != 0',
						'Like.id != 0'
						
						
					),
					
				),
				
				// 'Message.id' ,
				// 'Message' => array(
					
				// 	'Groupchat' => array(
				// 		'Log' => array(
				// 			'User.username',
				// 			'Message.body'
				// 		)
				// 	),'Groupchat.id'
				// )
			)
		));
	//	print_r($notifiedIds);
		//print_r($user);exit;
		$messages = $this->Profile->User->find('first',array(
			'conditions' => array('id' => $uid),
			'contain' => array(
				'Groupchat.id' => array(
					'Message.id' => array(
						
						'Log' => array(
							'conditions' => array(
								'NOT' => array('id' => $notifiedIds,'user_id' => $uid)
							),
							'Message.user_id' ,'Message.body','Groupchat.id', 'User.username'
						)	
					)	
				)
			)
		));
		
		$notifications = [];
		$notifications_dates = [];
		foreach($user['Thread'] as $t){
			foreach($t['Log'] as $log){
				$un = array('username' => $log['User']['username']);
				$un['id'] = $log['User']['id'];
				$log['User'] = $un;
				$notifications[] = $log;
				$notifications_dates[] = $log['created'];
			}
		}

		foreach($messages['Groupchat'] as $g){
				
				foreach($g['Message'] as $msg){
					
					foreach($msg['Log'] as $l){
						$notifications[] = $l;
						$notifications_dates[] = $l['created'];
					}
				}
			
		}
		

		
		array_multisort($notifications_dates,SORT_DESC,SORT_STRING,$notifications);
		if($ret)
			return $notifications;
		echo json_encode($notifications);
		exit;
	
	}
	public function notified($lid = null){
		header('Content-Type: application/json;charset=utf-8'); 
		$r = $this->Profile->User->Log->setNotified($lid);
		echo json_encode(['status' => $r]);
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
