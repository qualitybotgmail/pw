<?php
App::uses('AppModel', 'Model');
/**
 * Groupchat Model
 *
 * @property User $User
 * @property Message $Message
 * @property User $User
 */
class Groupchat extends AppModel {

/**
 * Display field
 *
 * @var string
 */
	public $displayField = 'user_id';


	//The Associations below have been created with all possible keys, those that are not needed can be removed

/**
 * hasMany associations
 *
 * @var array
 */
	public $hasMany = array(
		'Message' => array(
			'className' => 'Message',
			'foreignKey' => 'groupchat_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),'Log'
	);


/**
 * hasAndBelongsToMany associations
 *
 * @var array
 */
	public $hasAndBelongsToMany = array(
		'User' => array(
			'className' => 'User',
			'joinTable' => 'users_groupchats',
			'foreignKey' => 'groupchat_id',
			'associationForeignKey' => 'user_id',
			'unique' => 'keepExisting',
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'finderQuery' => '',
		)
	);

	public $belongsTo = array(
		'Owner' => array(
			'className' => 'User',
			'foreignKey' => 'user_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		)
	);

	public function members($gid){
		
		$groupchat = $this->findById($gid);

		$ret = array();
		
		foreach($groupchat['User'] as $k => $t){
			
				array_push($ret,$t['id']);
		}
		array_push($ret,CakeSession::read("Auth.User.id"));
		array_push($ret,$groupchat['Owner']['id']);
		
		return array_unique($ret);
		
	}
	
	public function member_names($gid){
		
		$groupchat = $this->findById($gid);

		$ret = array();
		
		foreach($groupchat['User'] as $k => $t){
				
				array_push($ret, $t['username']);
		}
		array_push($ret,CakeSession::read("Auth.User.username"));
		array_push($ret,$groupchat['Owner']['username']);
		
		return array_unique($ret);
		
	}
	
	public function notified($id=null,$uid){
		
		$this->User->Profile->clearGroupchatsCount($id,$uid);
		
		$this->Log->User->Behaviors->load('Containable');
		$r = $this->find('first',array(
			'conditions' => array('Groupchat.id' => $id),
			'contain' => array(
				'Log.id' ,'Log.user_id','Log.user_id != '.$uid
			)
		));
		
		$lids = array();
	
		if($r){
		
			foreach($r['Log'] as $log){
			//	echo $log['id'].'<br />';
				$ul = $this->Log->UsersLog->findByUserIdAndLogId($uid,$log['id']);
				
				if($ul){
					
					continue;
				}
				
		
				$lids[] = array('log_id' => $log['id'],'user_id' =>$uid);
			}
			
			if(count($lids) > 0)		
				$r = $this->Log->UsersLog->saveAll($lids);
			
			
		}
		
		return count($lids);
		//print_r($r);exit;
	}
	function getLastQuery() {
	  $dbo = $this->getDatasource();
	  $logs = $dbo->getLog();
	  $lastLog = end($logs['log']);
	  return $lastLog['query'];
	}
	  
}
