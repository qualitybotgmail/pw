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
	
	public function me(){ 
		 
		$this->loadModel('User'); 
		$this->view = 'view'; 
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
		
		header('Content-Type: application/json;charset=utf-8'); 
		$this->loadModel('Thread');
		$this->loadModel('Head'); 
		$this->loadModel('User'); 
		
		
		$this->Profile->recursive = 1;
		$this->Thread->recursive = -1; 
		$this->Head->recursive = -1; 
		$this->User->recursive = -1; 
		
		 
		$keyword = str_replace("+", " ", $keyword);
		$keyword = explode(" ",trim($keyword));
		
		$data=[];
		foreach($keyword as $k){
			
			$users = $this->User->find('list',
			['conditions' => ['User.username LIKE' => '%'.$k.'%'],
			'fields' => ['id']]);
			
			$prof = $this->Profile->find('all',
			['fields'=>[
				
				'Profile.id',
				'Profile.user_id',
				'Profile.firstname','Profile.lastname',
				'User.id',
				'User.username'
				],'conditions' =>
				['OR'=>[
					[
					'Profile.firstname LIKE' => '%'.$k.'%',
					'Profile.lastname LIKE' => '%'.$k.'%' ,
					'Profile.user_id' => $users
					]
				]],
			],	['order' =>['User.created' => 'desc']]);

			$thread = $this->Thread->find('all', 
				['conditions' => ['Thread.title LIKE' => '%'.$k.'%'] ]);  
			
			
			$head = $this->Head->find('all', 
				['conditions' =>  ['Head.body LIKE' => '%'.$k.'%'] ]);  
			
			
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
			if(!empty($prof))$data['Profiles'][] = $prof;
			if(!empty($thread))$data['Threads'][] = $thread;
			if(!empty($head))$data['Heads'][] = $head;
			
			//$data[] = array_merge($user, $thread, $head); 
		}
		
		echo json_encode($data);exit;
	}
	
	
	
}
