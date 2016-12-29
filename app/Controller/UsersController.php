<?php
App::uses('AppController', 'Controller');
/**
 * Users Controller
 *
 * @property User $User
 * @property PaginatorComponent $Paginator
 */
class UsersController extends AppController {

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
		$this->User->recursive = 0;
		$this->set('users', $this->Paginator->paginate());
	}
	public function beforeFilter(){
		parent::beforeFilter();
		$this->Auth->allow('me','dd','notifications');
	}
	
	
	public function notifications(){
		header('Content-Type: text/event-stream');
		header('Cache-Control: no-cache');

		$i = 0;
		echo "data: " . $i . "\n\n";
		flush();

		//	sleep(3);
		
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
	
		if (!$this->User->exists($id)) {
			throw new NotFoundException(__('Invalid user'));
		}
		$options = array('conditions' => array('User.' . $this->User->primaryKey => $id));
		$this->set('user', $this->User->find('first', $options));
	}

	public function talk(){
		$this->redirect('/index.html');
		exit;
	}
/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			$this->User->create();
			if ($this->User->save($this->request->data)) {
				$this->Session->setFlash(__('The user has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The user could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		}
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->User->exists($id)) {
			throw new NotFoundException(__('Invalid user'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->User->save($this->request->data)) {
				$this->Session->setFlash(__('The user has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The user could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('User.' . $this->User->primaryKey => $id));
			$this->request->data = $this->User->find('first', $options);
		}
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->User->id = $id;
		if (!$this->User->exists()) {
			throw new NotFoundException(__('Invalid user'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->User->delete()) {
			$this->Session->setFlash(__('The user has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The user could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}

	public function login() {
	    if ($this->request->is('post')) {
	        if ($this->Auth->login()) {
	        	print_r($this->request->data);exit;
	            return $this->redirect($this->Auth->redirectUrl());
	        }
	        $this->Session->setFlash(__('Invalid username or password, try again'));
	    }
	}
	
	public function logout() {
	    return $this->redirect($this->Auth->logout());
	}	
	
	public function me(){ 
		
		$this->view = 'view'; 
		$id = $this->Auth->user('id');
		
		
		$this->User->recursive = 0;
        $user = $this->User->findById($id); 
        
        $this->set('user',$user);
        
	}
	
	public function timeline(){ 
 
		$this->loadModel('Comment');
		// $this->Head->recursive = -1; 
		$user_id = $this->Auth->user('id');
		// $this->User->Thread->Head->recursive = 4;  
		
		$thread = $this->User->Thread->find('all',  
		 ['conditions' => ['Thread.user_id' => $user_id]], 
		['order' =>['Thread.created' => 'desc']] );   
		
		
		$head = $this->User->Thread->Head->find('all', 
		['conditions' => ['Head.user_id' => $user_id]], 
		['order' =>['Head.created' => 'desc']]);  
		
		// $like = $this->User->Like->find('all', 
		// ['conditions' => ['Like.user_id' => $user_id]], 
		// ['order' =>['Like.created' => 'desc']]);  
		
		$comment = $this->Comment->find('all',
		['conditions'=>['Comment.user_id'=>$user_id]],
		['order'=>['Comment.created'=>'desc']]
		);
		   
		// $values = array_merge($thread, $head, $comment); 
		 
		if(!empty($thread))$data['Threads'][] = $thread;
		if(!empty($head))$data['Heads'][] = $head;
		if(!empty($comment))$data['Comments'][] = $comment;
		 
		$this->set('user', $data); 	
		
	}
	
	public function message(){
		$this->loadModel('Message');
		$user_id = $this->Auth->user('id');  
		$this->Message->recursive = 4; 
		$message = $this->Message->find('all', 
		// ['fields' => ['id','user_id','groupchat_id','body','created','modified']],
		['conditions' => ['Message.user_id' => $user_id]], 
		['order' =>['Message.created' => 'desc']]);  
		 
		$this->set('user', $message); 
	}
	
	public function likedhead(){
		
		$user_id = $this->Auth->user('id'); 
		$like = $this->User->Like->find('all', 
		// ['fields' => ['id','head_id','created','modified']],
		['conditions' => ['Like.user_id' => $user_id], ['head_id !='=>'0']], 
		['order' =>['Like.created' => 'desc']]);   
		
		$this->set('user', $like); 
	}
	
	public function addedtogroupchat(){
		$this->loadModel('Groupchat'); 
		$user_id = $this->Auth->user('id');
		
		$groupchat = $this->Groupchat->find('all', 
		// ['fields' => ['id','created','modified']],
		['conditions' => ['Groupchat.user_id' => $user_id]], 
		['order' =>['Groupchat.created' => 'desc']]);   
		
		$this->set('user', $groupchat); 
		
	}
	
	public function attachment(){
		$this->loadModel('Upload');
		$user_id = $this->Auth->user('id');
		
		$groupchat = $this->Upload->find('all', 
		// ['fields' => ['id','comment_id','name','size','path','created','modified']],
		['conditions' => ['Upload.user_id' => $user_id]], 
		['order' =>['Upload.created' => 'desc']]);   
		
		$this->set('user', $groupchat); 
		
	}
	
	public function likedcomment(){
		$this->User->Like->recursive = 0;
		// $this->loadModel('Like');
		$user_id = $this->Auth->user('id');
		$like = $this->User->Like->find('all', 
		// ['fields' => ['id','comment_id','created','modified']],
		['conditions' => ['Like.user_id' => $user_id], ['comment_id >='=>'1']], 
		['order' =>['Like.created' => 'desc']]);   
		
		$this->set('user', $like); 
	}
	
	public function search($keyword = null){
		$this->loadModel('Thread');
		$this->loadModel('Head');
		$this->loadModel('Profile');
		header('Content-Type: application/json;charset=utf-8'); 
		
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
		
		$this->set('user', $data);  
		
	}
	
	public function dd(){
		$this->User->Thread->find('all');
		exit;
	}
	
	 
}
