<?php
App::uses('AppController', 'Controller');
App::import("Controller","Profiles");
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
	public $components = array('Paginator','Session');

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
	
		$this->Auth->allow('me','dd','notifications','mobilelogin','test');

		if(isset($_COOKIE['hash']) && $_COOKIE['hash']!='' && $_COOKIE['hash']){
			
			$h=str_replace('#','',$_COOKIE['hash']);
			$user=$this->User->find('first',array('conditions'=>array('hash'=>$h)));
			unset($user['User']['password_hash']);
			unset($user['User']['hash']);
			unset($user['User']['role']);
			unset($user['User']['created']);
			unset($user['User']['modified']);
			$this->Session->destroy();
			if($this->Auth->login($user['User'])){
				unset($_COOKIE['hash']);
    			setcookie("hash", "", time()-3600);
				$this->redirect('/');
			}
		}
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
				
				if($this->request->is('ajax')){
					echo json_encode(array('hash'=>$data['User']['hash']));
					exit;
				}else{
					$this->Session->setFlash(__('The user has been saved.'), 'default', array('class' => 'alert alert-success'));
					return $this->redirect(array('action' => 'index'));
				}
				
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
public function mobilelogin(){
		file_put_contents("/tmp/lastcurl",date("g:i:s")."\n".print_r($_SERVER,true),FILE_APPEND);
		$userdetails=[];
		$session_id=null;
	    if ($this->request->is('post')) {
	    	if($this->request->data){
	    	file_put_contents("/tmp/lastcurl",date("g:i:s")."\n".print_r($_POST,true),FILE_APPEND);
  
	        
		    if($this->Auth->login())
		    {
		        
		        $id = $_SESSION['Auth']['User']['id'];
				$this->User->recursive = 0;
		        $userdetails = $this->User->findById($id); 
		        
		    }
		    echo json_encode(array('user'=>$userdetails));
	    	}
	    }
	     
	    exit;
	   
	}
	
	public function test(){
		echo json_encode($this->Session->read('Auth.User'));
		exit;
	}
	public function login() {
	
		
		
	    if ($this->request->is('post')) {
	        if ($this->Auth->login()) {
	        	
	        	// if($this->Auth->user('username') =='admin') {
	        		
	        	// }
	        	// $type = 'User.logged';
				$id = $this->Auth->user('id');
				// $this->User->Log->save(array(
				// 	'user_id' => 	$id,
				// 	'type' => $type
				// ));
				
				//$this->User->id = $id;
				//$this->User->saveField('fcm_id','');
				
				//Mark all notfications 'notified' to prevent pushing of notifications even not logged in
				$notifs = $this->User->Log->notifications($id);
				foreach($notifs as $n){
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
				}
				
	        	//print_r($this->request->data);exit;
	            return $this->redirect('/');//array('controller'=>'profiles','action'=>'renewfcm'));
	        }
	        $this->Session->setFlash(__('Invalid username or password, try again'));
	    }
	    else if ($this->RequestHandler->isAjax())
		{
		    $tmpUser['User']['username'] = $this->request->params['name'];
		    $tmpUser['User']['password'] = $this->request->params['pw'];
		    if($this->Auth->login($tmpUser))
		    {
		        // $this->Session->setFlash('Login Passed');
		        $id = $this->Auth->user('id');
				$this->User->recursive = 0;
		        $user = $this->User->findById($id); 
		        
		        $this->set('user',$user);
		    }
		    else
		    {
		        // $this->Session->setFlash('Login Failed');
		    }
		}
		
	}
public function logout() {
		$uid = $this->Auth->user('id');
		$profile = $this->User->Profile->findByUserId($uid);
		$this->User->Profile->id = $profile['Profile']['id'];
		$this->User->Profile->saveField('fcm_id','');
		$this->Session->destroy();
			unset($_COOKIE['hash']);
    			setcookie("hash", "", time()-3600);
	    return $this->redirect($this->Auth->logout());
	}	
	
	public function me($uid = null){
		error_reporting(E_ALL);	
		echo $uid;exit;
		$this->view = 'view'; 
		$id = ($uid == null) ? $this->Auth->user('id') : $uid;
		
		
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
		 array('conditions' => array('Thread.user_id' => $user_id)), 
		array('order' =>array('Thread.created' => 'desc')) );   
		
		
		$head = $this->User->Thread->Head->find('all', 
		array('conditions' => array('Head.user_id' => $user_id)), 
		array('order' =>array('Head.created' => 'desc')));  
		
		// $like = $this->User->Like->find('all', 
		// ['conditions' => ['Like.user_id' => $user_id]], 
		// ['order' =>['Like.created' => 'desc']]);  
		
		$comment = $this->Comment->find('all',
		array('conditions'=>array('Comment.user_id'=>$user_id)),
		array('order'=>array('Comment.created'=>'desc'))
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
		array('conditions' => array('Message.user_id' => $user_id)), 
		array('order' =>array('Message.created' => 'desc')));  
		 
		$this->set('user', $message); 
	}
	
	public function likedhead(){
		
		$user_id = $this->Auth->user('id'); 
		$like = $this->User->Like->find('all', 
		// ['fields' => ['id','head_id','created','modified']],
		array('conditions' => array('Like.user_id' => $user_id), array('head_id !='=>'0')), 
		array('order' =>array('Like.created' => 'desc')));   
		
		$this->set('user', $like); 
	}
	
	public function addedtogroupchat(){
		$this->loadModel('Groupchat'); 
		$user_id = $this->Auth->user('id');
		
		$groupchat = $this->Groupchat->find('all', 
		// ['fields' => ['id','created','modified']],
		array('conditions' => array('Groupchat.user_id' => $user_id)), 
		array('order' =>array('Groupchat.created' => 'desc')));   
		
		$this->set('user', $groupchat); 
		
	}
	
	public function attachment(){
		$this->loadModel('Upload');
		$user_id = $this->Auth->user('id');
		
		$groupchat = $this->Upload->find('all', 
		// ['fields' => ['id','comment_id','name','size','path','created','modified']],
		array('conditions' => array('Upload.user_id' => $user_id)), 
		array('order' =>array('Upload.created' => 'desc')));   
		
		$this->set('user', $groupchat); 
		
	}
	
	public function likedcomment(){
		$this->User->Like->recursive = 0;
		// $this->loadModel('Like');
		$user_id = $this->Auth->user('id');
		$like = $this->User->Like->find('all', 
		// ['fields' => ['id','comment_id','created','modified']],
		array('conditions' => array('Like.user_id' => $user_id), array('comment_id >='=>'1')), 
		array('order' =>array('Like.created' => 'desc')));   
		
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
		
		 $data=array();
		foreach($keyword as $k){
			
			$prof = $this->Profile->find('all',
			array('conditions' =>
				array('OR'=>array(
					array('Profile.firstname LIKE' => '%'.$k.'%'),
					array('Profile.lastname LIKE' => '%'.$k.'%')
				)),
			),	array('order' =>array('User.created' => 'desc')));
			
			
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
				array('conditions' => array('Thread.title LIKE' => '%'.$k.'%') ));  
			
			
			$head = $this->Head->find('all', 
				array('conditions' =>  array('Head.body LIKE' => '%'.$k.'%') ));  
			
			
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
