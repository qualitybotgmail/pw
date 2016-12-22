<?php
App::uses('AppController', 'Controller');
/**
 * Groupchats Controller
 *
 * @property Groupchat $Groupchat
 * @property PaginatorComponent $Paginator
 * @property SessionComponent $Session
 */
class GroupchatsController extends AppController {

/**
 * Components
 *
 * @var array
 */
	public $components = array('Paginator', 'Session');

	public function beforeFilter(){
		parent::beforeFilter();
		$this->Auth->allow('add','view','notifications');
	}
/**
 * index method
 *
 * @return void
 */
	public function index() {
		$this->Groupchat->recursive = 1;
		
		$id = $this->Auth->user('id');
		
		$options = array('conditions' => array('user_id'=>$id)); 
		$groupchats =['groupchats' => $this->Groupchat->find('all', $options)];
		
		$this->set('groupchats', $groupchats);
		//	print_r($groupchats);
	//	exit;
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null,$page = null,$limit = null) {
		if (!$this->Groupchat->exists($id)) {
			throw new NotFoundException(__('Invalid groupchat'));
		}
		$this->Groupchat->recursive = 2;
		// $this->Groupchat->recursive = 3;
		
		$options = array('conditions' => array('Groupchat.' . $this->Groupchat->primaryKey => $id),
			'contain' => array(
				'Message'=>array('User.username','User.id','Upload.path','Upload.created'),'User.username','User.id','Owner.username','Owner.id'
			)		
		);
		$this->Groupchat->Behaviors->load('Containable');
		$groupchats = $this->Groupchat->find('first', $options);
		
		$this->Groupchat->notified($id,$this->Auth->user('id'));
		$this->set(array(
			'groupchats' => $groupchats, 
			'_serialize' => array('groupchats')
		));
	}

/**
 * add method
 *
 * @return void
 */
	public function add($user_id = null) { 
		header('Content-Type: application/json;charset=utf-8');
		$this->loadModel('UsersGroupchat');
		
		$ids = explode(",",$user_id); 
		
		$user_id = $this->Auth->user('id');
	//	$ids[] = $user_id;
		
		$this->Groupchat->create(); 
		$data = $this->Groupchat->save(array('user_id' => $user_id));
	 
		if ($data) {
				$groupchat_id = $this->Groupchat->getLastInsertId(); 
				foreach($ids as $id){
					///check if user_id and groupchat_id already exists
					$exists = $this->UsersGroupchat->find('count', array(
    			    'conditions' => array('user_id' => $id,'groupchat_id' => $groupchat_id )
    				));
					
					if($exists==0){
						 $this->UsersGroupchat->create();  
						 $data = $this->UsersGroupchat->save(array('user_id' => $id, 'groupchat_id' => $groupchat_id));
						 if($data){
						 	$result = $data;
						 }else{
						 	$result = 'failed add';
						 } 
					}else{
						$result = 'user already in group';
					} 
				}
			} else {
				$result = 'failed save groupchat';
			}  
		echo json_encode($result);
		exit; 
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->Groupchat->exists($id)) {
			throw new NotFoundException(__('Invalid groupchat'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->Groupchat->save($this->request->data)) {
				$this->Session->setFlash(__('The groupchat has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The groupchat could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Groupchat.' . $this->Groupchat->primaryKey => $id));
			$this->request->data = $this->Groupchat->find('first', $options);
		}
		$users = $this->Groupchat->User->find('list');
		$users = $this->Groupchat->User->find('list');
		$this->set(compact('users', 'users'));
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->Groupchat->id = $id;
		if (!$this->Groupchat->exists()) {
			throw new NotFoundException(__('Invalid groupchat'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Groupchat->delete()) {
			$this->Session->setFlash(__('The groupchat has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The groupchat could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
	
	
	public function userstogroupchat(){
		header('Content-Type: application/json;charset=utf-8'); 
		
		$this->loadModel('User');
		$this->User->Behaviors->load('Containable');
		$users = $this->User->find("all", array('fields'=>array('id','username'),
			'contain' => array(),
			'conditions' => array('User.id !=' => $this->Auth->user('id'))
		));
		 
		echo json_encode(['users'=> $users]);
		exit;
	}
	public function userstoadd($gid){
		header('Content-Type: application/json;charset=utf-8');
		$members = $this->Groupchat->members($gid);
		
		$users = $this->Groupchat->User->find("all",['fields' => ['id','username'],'conditions' => [
			'NOT' => [
				'User.id' => $members
			]
		]]);
		
		if(count($users) == 0){
			$users = $this->Groupchats->User->find("all",['fields' => ['id','username']]);
		}
		echo json_encode(['users'=> $users]);
		exit;
	}
/**
 * add method
 *
 * @return void
 */
	public function addmember($gid = null,$member_id = null) {
		header('Content-Type: application/json;charset=utf-8');
		$ids = explode(",",$member_id);
		try{
			$groupchat = $this->Groupchat->findById($gid);
			$users = [];
						
			foreach($groupchat['User'] as $i => $u){
				if(is_numeric($i)){
					$users[] = $u['id'];
				}
			}
			
			$oldcount = count($users);
			$users = array_merge($ids,$users);
			$users = array_unique($users);
			
			
			if(count($users)!=$oldcount){
				
				$result = $this->Groupchat->save(array(
					'Groupchat' => array('id' => $gid),
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
	public function notifications($gid) { 
		header('Content-Type: application/json;charset=utf8');
		$uid = $this->Auth->user('id');
		
		$this->loadModel('UsersLog');
		$notifiedIds = $this->UsersLog->find('list',array(
			'conditions' => array(
				'user_id' => $uid
			),
			'fields' => 'log_id'
		));
				
		$this->loadModel('User');
		$this->User->Behaviors->load('Containable');
		
		$u = $this->User->find('first',array(
			'conditions' => array('id' => $uid),
			'contain' => array('Groupchat.id' => array('Message.id' => array(
				'Log.id','Log' => array('conditions' => array('NOT' => array('id' => $notifiedIds)))
			)))
		));
	//	print_r($u);exit;
		$logs = array();
		foreach($u['Groupchat'] as $t){
			
			foreach($t['Message'] as $h){
				foreach($h['Log'] as $hl){
					$logs[] = $hl['id'];
					
				
				}
		
			}
		}
		
		echo json_encode(array('count'=>count(array_diff(array_unique($logs),$notifiedIds))));
		
		exit;
	}	
}
