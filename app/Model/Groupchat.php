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

		$ret = [];
		
		foreach($groupchat['User'] as $k => $t){
			
				$ret[] = $t['id'];
		}
		
		return $ret;
		
	}	
	public function notified($id=null,$uid){
	//	return;
		$this->Log->User->Behaviors->load('Containable');
		$r = $this->find('first',array(
			'conditions' => array('Groupchat.id' => $id),
			'contain' => array(
				'Log.id' ,'Log.user_id','Log.user_id != '.$uid
			)
		));
		$lids = array();
		//print_r($r);
		if($r){
			foreach($r['Log'] as $log){
			//	echo $log['id'].'<br />';
				if($this->Log->UsersLog->findByUserIdAndLogId($uid,$log['id'])){
					continue;
				}	
				$lids[] = array('log_id' => $log['id'],'user_id' =>$uid);
			}
			
			$r = $this->Log->UsersLog->saveAll($lids);
			
			
		}
		//print_r($r);exit;
	}
	  
}
