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
	public function _unsets($obj,$name){

		$ex = explode("/",$name);

		switch(count($ex)){
			case 1:
				unset($obj[$ex[0]]);
				break;
			case 2: 
				unset($obj[$ex[0]][$ex[1]]);
				break;
			case 3:
				unset($obj[$ex[0]][$ex[1]][$ex[2]]);
				break;
			case 4:
				unset($obj[$ex[0]][$ex[1]][$ex[2]][$ex[3]]);
				break;		
			default:
				break;
		}

		
		return $obj;
	}

	public function _unsetall($obj,$name,$subnames){
		foreach($subnames as $sn){
			
			$obj = $this->_unsets($obj,$name.'/'.$sn);
		}
		
		return $obj;
	}
	public function _unsetallr($obj,$name,$subnames){
		$rets = [];
		foreach($obj[$name] as $u){
			$rets[]=$this->_unsetall(array($name=>$u),$name,$subnames);
		}
		$obj[$name] = $rets;
		return $obj;
	}	
	
	public function timeline(){
		header("Content-Type: application/json");
		$t = array('Owner' => ['User' => ['foo' => 'fff']]);
		
		$this->Profile->User->recursive=4;
		$u = $this->Profile->User->findById($this->Auth->user('id'));
		$threads = [];
		foreach($u['Thread'] as $t){
			$t=$this->_unsetall($t,'Owner',array('modified','password','created','role','Comment','Groupchat','Head','Message','Thread','IgnoredThread',"Like","Log","Setting","Upload"));
			$t=$this->_unsetallr($t,'Head',array('Owner/Comment'));
			$t=$this->_unsetallr($t,'User',array('modified','password','created','role','Comment','Groupchat','Head','Message','Thread','UsersThread','IgnoredThread','Like','Log','Profile/0/User','Profile/0/modified','Profile/0/created'));

			
			$threads[]=$t;
			break;
		}
		echo json_encode($threads);
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
		
		$this->Profile->recursive = -1;
		$this->Thread->recursive = -1; 
		$this->Head->recursive = -1; 
		 
		$keyword = str_replace("+", " ", $keyword);
		$keyword = explode(" ",trim($keyword));
		
		 $data=[];
		foreach($keyword as $k){
			
			$prof = $this->Profile->find('all',
			['conditions' =>
				['OR'=>[
					['Profile.firstname LIKE' => '%'.$k.'%'],
					['Profile.lastname LIKE' => '%'.$k.'%']
				]],
			],	['order' =>['User.created' => 'desc']]);
			
			
			// $user = $this->User->find('all',
			// // ['fields' => ['id','username','role','created','modified','firstname','lastname']],
			// ['conditions' =>
			// 	['OR'=>[
			// 		['User.firstname LIKE' => '%'.$k.'%'],
			// 		['User.lastname LIKE' => '%'.$k.'%']
			// 	]],
			// ], 
			// ['order' =>['User.created' => 'desc']]);
			
			
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
		
		$this->set('profile', $data);  
		
	}
	
	
	
}
