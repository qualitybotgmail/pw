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
		$this->Auth->allow('me','dd');
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
		 
	
		$this->loadModel('Like'); 
		$this->loadModel('Head');
		
		$user_id = $this->Auth->user('id');
 
		
		
		$thread = $this->User->Thread->find('all'
		//  ['conditions' => ['Thread.user_id' => $user_id]], 
		// ['order' =>['Thread.created' => 'desc']]
		);   
		print_r($thread);exit;
		// $like = $this->Like->find('all', 
		// ['conditions' => ['Like.user_id' => $user_id]], 
		// ['order' =>['Like.created' => 'desc']]);  
		
		// $head = $this->Head->find('all', 
		// ['conditions' => ['Head.user_id' => $user_id]], 
		// ['order' =>['Head.created' => 'desc']]);  
		   
		//  $values = array_merge($thread, $head, $like); 
		 
		// $this->set('user', $values); 	
		
	}
	
	public function message(){
		$this->loadModel('Message');
		$user_id = $this->Auth->user('id');  
		$this->Message->recursive = 4; 
		$message = $this->Message->find('all', 
		['fields' => ['id','user_id','groupchat_id','body','created','modified']],
		['conditions' => ['Message.user_id' => $user_id]], 
		['order' =>['Message.created' => 'desc']]);  
		 
		$this->set('user', $message); 
	}
	
	public function likedhead(){
		$this->loadModel('Like');
		$user_id = $this->Auth->user('id');
		$like = $this->Like->find('all', 
		['fields' => ['id','head_id','created','modified']],
		['conditions' => ['Like.user_id' => $user_id], ['head_id !='=>'0']], 
		['order' =>['Like.created' => 'desc']]);   
		
		$this->set('user', $like); 
	}
	
	public function addedtogroupchat(){
		$this->loadModel('Groupchat');
		$user_id = $this->Auth->user('id');
		
		$groupchat = $this->Groupchat->find('all', 
		['fields' => ['id','created','modified']],
		['conditions' => ['Groupchat.user_id' => $user_id]], 
		['order' =>['Groupchat.created' => 'desc']]);   
		
		$this->set('user', $groupchat); 
		
	}
	
	public function attachment(){
		$this->loadModel('Upload');
		$user_id = $this->Auth->user('id');
		
		$groupchat = $this->Upload->find('all', 
		['fields' => ['id','comment_id','name','size','path','created','modified']],
		['conditions' => ['Upload.user_id' => $user_id]], 
		['order' =>['Upload.created' => 'desc']]);   
		
		$this->set('user', $groupchat); 
		
	}
	
	public function likedcomment(){
		$this->loadModel('Like');
		$user_id = $this->Auth->user('id');
		$like = $this->Like->find('all', 
		['fields' => ['id','comment_id','created','modified']],
		['conditions' => ['Like.user_id' => $user_id], ['comment_id !='=>'0']], 
		['order' =>['Like.created' => 'desc']]);   
		
		$this->set('user', $like); 
	}
	
	public function search($keyword = null){
		header('Content-Type: application/json;charset=utf-8');
		$this->loadModel('Head');
		$this->loadModel('User'); 
		 
		$keyword = str_replace("+", " ", $keyword);
		$keyword = explode(" ",trim($keyword));
		
		 $heads=[];
		foreach($keyword as $k){
			// $conditions=[];
			// 	$conditions['User.firstname LIKE']='%'.$k.'%';
			// $user = $this->User->find('all', 
			// ['conditions' => ['firstname' =>  $k ]]);  
			
			// $user = $this->User->find('all', array('conditions'=>array('User.firstname LIKE'=>'%'.$k.'%')));
 
			// $user = $this->User->find('all', array(
			// 	'conditions'=>array('User.firstname LIKE'=>'%'.$k.'%')
			// 	));
			
			$head = $this->Head->find('all', 
			['conditions' => ['Head.body LIKE' => '%'.$k.'%']], 
			['order' =>['Head.created' => 'desc']]);  
			 
		echo json_encode($head);
		
		}
			 //$heads = array_merge($head);
		$this->set('user', $keyword,$head); 
		
	}
	
	public function dd(){
		$this->User->Thread->find('all');
		exit;
	}
	
	 
}
