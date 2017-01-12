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
		$this->Groupchat->Behaviors->load('Containable');
		$ids = $this->Groupchat->query('select groupchat_id from users_groupchats where user_id ='.$id);
		function m($m){
			return $m['users_groupchats']['groupchat_id'];
		}
		$ids = array_map('m',$ids);
		
		$options = array('conditions' => array('OR'=>array('Groupchat.id' => $ids,'Groupchat.user_id' => $id))); 
		$options['contain'] = array(
			'Message' , 'User.username','User.id', 'Owner.username','Owner.id'
		);
		$groupchats =['groupchats' => $this->Groupchat->find('all', $options)];
		function gm($m){
			$o = $m['Owner'];
			$m['User'][] = $o;
			return $m;
		}
		$groupchats['groupchats'] = array_map('gm',$groupchats['groupchats']);
		
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
	public function paged($id,$chunks,$page,$lastid=0){
		if($id == null || $chunks == null || $page == null){
			
			echo 'Invalid parameter';
			exit;
		}
		$this->view = 'view';
		$this->view($id,$chunks,$page,$lastid);
	}
	public function setnotified($id = null){
		header('Content-Type: application/json;charset=utf-8');
		if($this->Groupchat->exists($id)){
			$notified = $this->Groupchat->notified($id,$this->Auth->user('id'));	
			
			if($notified>0) $this->Groupchat->Log->removeCache($this->Auth->user('id'));
		}
		echo '{status: "OK"}';
		exit;
	}
	public function latest($id, $lastid = 0){
		$this->view($id,null,null,$lastid);
	}
	public function view($id = null,$chunks = null,$page = null,$lastid = 0) {
		
	//	print_r($this->Groupchat->findAllById($id));exit;
		
		if (!$this->Groupchat->exists($id)) {
			throw new NotFoundException(__('Invalid groupchat'));
		}
		$this->Groupchat->recursive = -1;
		// $this->Groupchat->recursive = 3;
		
		$options = array('conditions' => array('Groupchat.id' => $id), 
			'contain' => array(
				
				'Message'=>array(
					'conditions' => array('id >' => $lastid),
					'User.username','User.id','Upload.path','Upload.created'),'User.username','User.id','Owner.username','Owner.id'
			)		
		);
		
		$this->Groupchat->Behaviors->load('Containable');
		$groupchats = $this->Groupchat->find('first', $options);
		// $groupchats = $groupchats[0];
		
		$gdates = array();
		foreach($groupchats['Message'] as $m){
			$gdates[] = $m['created'];
		}
		array_multisort($gdates,SORT_DESC, SORT_STRING,$groupchats['Message']);
		if($chunks != null && $page != null){
			$messages = $groupchats['Message'];
			$total = count($messages);
			
			$chunked = array_chunk($messages,$chunks);
			$pages = count($chunked);
			$hasnext = $pages > $page;
			
			$groupchats['Message'] = @$chunked[$page-1];
			$groupchats['page_info'] = array('total_messages' => $total,'total_pages' => $pages,'has_next' => $hasnext,'index' =>$page);
		}
		
		if($lastid == 0){
			$this->Groupchat->notified($id,$this->Auth->user('id'));
		}
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
	private function array_equal($a, $b) {
	    return (
	         is_array($a) && is_array($b) && 
	         count($a) == count($b) &&
	         array_diff($a, $b) === array_diff($b, $a)
	    );
	}	
	public function add($user_id = null) { 
		header('Content-Type: application/json;charset=utf-8');
		$ids = explode(',',$user_id);
		$ids[] = $this->Auth->user('id');
		
		$this->Groupchat->User->Behaviors->load('Containable');
		$d = $this->Groupchat->User->find('all',
			array( 
				'contain' => array('Groupchat.id' => array('User.id')),
				'fields' => array('id'),
				'conditions' => array(
					'AND' => array(
						'User.id' =>
							$ids
		))));
		$existing = null;
		// /print_r($d);
		foreach($d as $data){
			$u = $data['User']['id'];
		
			foreach($data['Groupchat'] as $gc){
				if(isset($gc['User'])){
					$uids = array();
					$uids[] = $u;
					foreach($gc['User'] as $member){
						$uids[] = $member['id'];
					}
					 //print_r($uids);
					 //print_r($ids);
					 //echo $gc['id'].")===================\n";
					if($this->array_equal($uids,$ids)){
						$this->Groupchat->recursive=-1;
						$existing = $this->Groupchat->findById($gc['id']);//['id'];
						$existing['UsersGroupchat'] = array('groupchat_id' => $gc['id']);
						$existing['existed'] = true;
						
						break;
					}
				}
			}
		}
	//	exit;
		if($existing != null){
			echo json_encode($existing);
			exit;
		}
		
		// $this->loadModel('UsersGroupchat');
		// $uid = $this->Auth->user('id');
		// $ids = explode(",",$user_id); 

		// $this->Groupchat->Behaviors->load('Containable');
		// $g = $this->Groupchat->query('SELECT users_groupchats.user_id,users_groupchats.groupchat_id FROM `users_groupchats` inner join groupchats on groupchats.id = users_groupchats.groupchat_id where users_groupchats.user_id in ('.implode(',',$ids).') ORDER BY `users_groupchats`.`created` DESC');
		
		
		// $existingids = array();
		// foreach($g as $gg){
		// 	if(!isset($existingids[$gg['users_groupchats']['groupchat_id']])){
		// 		$existingids[$gg['users_groupchats']['groupchat_id']] = array();
		// 	}
		// 	$existingids[$gg['users_groupchats']['groupchat_id']][] = $gg['users_groupchats']['user_id'];
		// }
		// $existing_id = null;
		// foreach($existingids as $k=>$e){
		// 	if(count($e) == count($ids)){
		// 		$existing_id = $k;
		// 		break;
		// 	}
		// }
		// if($existing_id!=null){
		// 	$this->Groupchat->recursive = -1;
		// 	$data = $this->Groupchat->findById($existing_id);
		// 	$data['UsersGroupchat'] = array('groupchat_id'=>$data['Groupchat']['id']);
		// 	echo json_encode($data);
		// 	exit;
		// }		
		//Remove current user
		
		// $tmp = $this->Groupchat->find('all',array(
		// 	'conditions' =>  array(
		// 		'Groupchat.user_id' => $uid
		// 	),

		// 	'contain' => array('User' => array(
		// 		'conditions' =>array('User.id' => $ids)
		// 	))
		// ));
		
		// $existing = array();
		// foreach($tmp as $e){
		// 	if(count($e['User'])>0){
		// 		$existing[] = $e;
		// 	}
		// }
		// if(count($existing)>0){
		// 	unset($existing[0]['User']);
		// 	$existing[0]['UsersGroupchat'] = array('groupchat_id'=>$existing[0]['Groupchat']['id']);
		// 	echo json_encode($existing[0]);
		// 	exit;
		// }
		
	//	$ids[] = $user_id;
	//	print_r($tmp);
		$uid = $this->Auth->user('id');
		$this->Groupchat->create(); 
		
		$data = $this->Groupchat->save(array(
			'User' =>
				array('User' => explode(",",$user_id)),
			'Groupchat' =>
				array('user_id' => $uid)
		));

		if ($data) {
				// $groupchat_id = $data['Groupchat']['id'];
				
				// foreach($ids as $id){

				// 	//	 $this->Groupchat->UsersGroupchat->create();  
				// 	$d = $this->Groupchat->UsersGroupchat->save(array('user_id' => $id, 'groupchat_id' => $groupchat_id));
					
				// }
		} else {
				$result = 'failed save groupchat';
		}  
		
		$data['UsersGroupchat'] = array('groupchat_id'=>$data['Groupchat']['id']);
		$data['existed'] = false;
		echo json_encode($data);
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
		//$this->Groupchat->User->Behaviors->load("Containable");
		$this->loadModel("User");
		$this->User->recursive=-1;
		
		$users = $this->User->find("all",['fields' => ['id','username'],
			
			'conditions' => [
			'NOT' => [
				'User.id' => $members
			]
		]]);
		
		if(count($users) == 0){
			$users = $this->User->find("all",[
				
				'fields' => ['id','username']]);
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
