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
			$data = $this->Profile->set(array('user_id'=>$user_id, 'firstname'=> $this->request->data['Profile']['firstname'], 'lastname'=>$this->request->data['Profile']['lastname']));  
			if ($this->Profile->save($data)) {
				$this->Session->setFlash(__('The profile has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
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
			if ($this->Profile->save($this->request->data)) {
				$this->Session->setFlash(__('The profile has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
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
	    	 ['fields' => ['Profile.id','Profile.user_id','User.username','Profile.firstname', 'Profile.lastname','Profile.created','Profile.modified', 'User.role','User.created','User.modified']],
	    	 ['conditions'=> ['Profile.user_id' => $id]]); 
		}else{
			$this->User->recursive = -1; 
			$user = $this->User->find('first', 
			['fields' => ['id','username','role','created','modified']],
			['conditions'=> ['User.id' => $id]]); 
		}
        
        $this->set('profiles',$user);
        
	}
	
	// public function timeline(){ 
	// ////this should have logs then query threads owner
	// 	$this->loadModel('Log'); 
	// 	$user_id = $this->Auth->user('id'); 
		
	// 	// $timeline = $this->Log->Thread
		
		
		
		
	// 	$thread = $this->User->Thread->find('all',  
	// 	 ['conditions' => ['Thread.user_id' => $user_id]], 
	// 	['order' =>['Thread.created' => 'desc']] );   
		
		
	// 	$head = $this->User->Thread->Head->Comment->find('all', 
	// 	['conditions' => ['Head.user_id' => $user_id]], 
	// 	['order' =>['Head.created' => 'desc']]);   
		
	// 	$comment = $this->Comment->find('all',
	// 	['conditions'=>['Comment.user_id'=>$user_id]],
	// 	['order'=>['Comment.created'=>'desc']]
	// 	); 
		 
		 
	// 	if(!empty($thread))$data['Threads'][] = $thread;
	// 	if(!empty($head))$data['Heads'][] = $head;
	// 	if(!empty($comment))$data['Comments'][] = $comment;
		 
	// 	$this->set('user', $data); 	
		
	// }
	
	
}
