<?php
App::import('Vendor','NotifCounts');
App::uses('AppModel', 'Model');
/**
 * Profile Model
 *
 * @property User $User
 */
class Profile extends AppModel {

/**
 * Validation rules
 *
 * @var array
 */
	public $validate = array(
		'user_id' => array(
			'numeric' => array(
				'rule' => array('numeric'),
				//'message' => 'Your custom message here',
				//'allowEmpty' => false,
				//'required' => false,
				//'last' => false, // Stop validation after this rule
				//'on' => 'create', // Limit validation to 'create' or 'update' operations
			),
		),
		'firstname' => array(
			'notEmpty' => array(
				'rule' => array('notEmpty'),
				//'message' => 'Your custom message here',
				//'allowEmpty' => false,
				//'required' => false,
				//'last' => false, // Stop validation after this rule
				//'on' => 'create', // Limit validation to 'create' or 'update' operations
			),
		),
		'lastname' => array(
			'notEmpty' => array(
				'rule' => array('notEmpty'),
				//'message' => 'Your custom message here',
				//'allowEmpty' => false,
				//'required' => false,
				//'last' => false, // Stop validation after this rule
				//'on' => 'create', // Limit validation to 'create' or 'update' operations
			),
		),
	);

	//The Associations below have been created with all possible keys, those that are not needed can be removed

/**
 * belongsTo associations
 *
 * @var array
 */
	public $belongsTo = array(
		'User' => array(
			'className' => 'User',
			'foreignKey' => 'user_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		)
	);
	
	public function getMyThreadIds(){
		$id = AuthComponent::user('id');
		if($id == ''){
			return array();
		}
		$r = $this->query("SELECT thread_id FROM users_threads WHERE user_id = " .$id);
		$ret = array();
		foreach($r as $t){
			$ret[] = $t['users_threads']['thread_id'];
		}
		return $ret;
	}

	public function getMyLogIds(){
		$id = AuthComponent::user('id');
		if($id == ''){
			return array();
		}
		
		$r = $this->query("SELECT log_id FROM users_logs WHERE user_id = " .$id);

		$ret = array();
		foreach($r as $t){
			$ret[] = $t['users_logs']['log_id'];
		}
		return $ret;
	}
	
	public function getMyLogThreadIds(){

		$ids = $this->getMyThreadIds();
		
		$this->User->Log->recursive = 1;
		$lids = $this->getMyLogIds();
		
		$mlids = $this->User->Log->find('all', array(
			'conditions' => array(
				'Log.thread_id' => $ids
			),'contain' => array("Thread")
		));
		echo 'test';
		print_r($mlids);
		exit;
		return array_diff($mlids,$lids);
	}
	public function getMyLogThreads(){
		$ids = $this->getMyLogThreadIds();
		
	//	$this->User->Thread->recursive = -1;
		$threads = $this->User->Thread->findAllById($ids);
		return $threads;
	}
	public function incGroupchatsCount($gid,$uid){
		$this->incNotificationCount($gid,$uid,'Groupchats');
		return;
		
	}
	public function incThreadsCount($gid,$uid){
		$this->incNotificationCount($gid,$uid,'Threads');
		return;
		
	}	
	public function clearGroupchatsCount($gid,$uid){
		$this->clearNotificationCount($gid,$uid,'Groupchats');
	}
	public function clearThreadsCount($gid,$uid){
		$this->clearNotificationCount($gid,$uid,'Threads');
	}
	public function clearHeadsCount($hid,$uid){
		$this->clearNotificationCount($hid,$uid,'Heads');
	}
	
	public function incNotificationCount($gid,$hid,$uid,$type){
		$p = $this->findByUserId($uid);
		$nots = null;
	
		if($p['Profile']['notifications_count'] == null){
			$nots = array('Threads'=>array(),'Groupchats'=>array());
		}else{
			$nots = json_decode($p['Profile']['notifications_count'],true);
		}
		
		if(isset($nots[$type][$gid])){
			$nots[$type][$gid]++;
		}else{
			$nots[$type][$gid]=1;
		}
		
		if(isset($hid) && $hid != null){
			if(isset($nots[$type][$hid])){
				$nots[$type][$hid]++;
			}else{
				$nots[$type][$hid]=1;
			}			
		}
		
		$this->save(array(
			'id'=>$p['Profile']['id'],
			'notifications_count'=>json_encode($nots)
		));
		return;
		
	}
	public function minusNotificationCount($gid,$hid,$uid,$type,$count){
		$p = $this->findByUserId($uid);
		$nots = null;
	
		if($p['Profile']['notifications_count'] == null){
			$nots = array('Threads'=>array(),'Groupchats'=>array(),'Heads' => array());
		}else{
			$nots = json_decode($p['Profile']['notifications_count'],true);
		}
		
		if(isset($nots[$type][$gid])){
			if($nots[$type][$gid] - $count <= 0)
				unset($nots[$type][$gid]);
			else
				$nots[$type][$gid] = $nots[$type][$gid] - $count;
		}
		
		if(isset($hid) && $hid != null){
			if(isset($nots[$type][$hid])){
				$nots[$type][$hid]++;
			}else{
				$nots[$type][$hid]=1;
			}			
		}
				
		$this->save(array(
			'id'=>$p['Profile']['id'],
			'notifications_count'=>json_encode($nots)
		));
		return;
		
	}	
	public function clearNotificationCount($gid,$uid,$type){
		$p = $this->findByUserId($uid);
		$nots = null;
	
		if($p['Profile']['notifications_count'] == null){
			$nots = array('Threads'=>array(),'Groupchats'=>array(),'Heads' => array());
		}else{
			$nots = json_decode($p['Profile']['notifications_count'],true);
		}
		$lids = 0;
		if(isset($nots[$type][$gid])){
			$lids = count($nots[$type][$gid]);
			unset($nots[$type][$gid]);
		}
		if(isset($hid) && $hid != null){
			if(isset($nots[$type][$hid])){
				unset($nots[$type][$hid]);
			}		
		}		
		$this->save(array(
			'id'=>$p['Profile']['id'],
			'notifications_count'=>json_encode($nots)
		));
		return $lids;
		
	}	

}
