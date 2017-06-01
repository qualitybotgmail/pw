<?php
App::uses('AppModel', 'Model');
/**
 * Head Model
 *
 * @property User $User
 * @property Thread $Thread
 */
class Head extends AppModel {

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
		'thread_id' => array(
			'numeric' => array(
				'rule' => array('numeric'),
				//'message' => 'Your custom message here',
				//'allowEmpty' => false,
				//'required' => false,
				//'last' => false, // Stop validation after this rule
				//'on' => 'create', // Limit validation to 'create' or 'update' operations
			),
		),
		'body' => array(
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
		'Owner' => array(
			'className' => 'User',
			'foreignKey' => 'user_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		),
		'Thread' => array(
			'className' => 'Thread',
			'foreignKey' => 'thread_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		)
	);
	
	public $hasMany = array('Comment','Like','Upload','Log');
	
	public function isLiked($cid,$uid){
		$ret = $this->Like->findByHeadIdAndUserId($cid,$uid);
		if($ret)
			return true;
			
		return false;
	}
	public function afterSave($created, $options = array()){
	
	
		$id = AuthComponent::user('id');
		
		$this->Log->save(array(
			'user_id' => 	$id,
			'thread_id' => $this->data['Head']['thread_id'],
			'head_id' => $this->data['Head']['id'],
			'type' => 'Head.'. ($created? 'add' : 'edit')
		));
	
	}

	public function notified($hid,$uid){

		$this->Log->User->Behaviors->load('Containable');
		$r = $this->Log->User->find('first',array(
			'fields' => 'id',
			'conditions' => array('id' => $uid),
			
			'contain' => array(
				'Thread.user_id',
				'Thread.id' => array(
					"Head.id" => array(
							'Log.head_id = "'.$hid.'"',
							'Log.id'
					)
				)
			)
			
		));

		$logs = array();
		$thread_id = null;

		foreach ($r['Thread'] as $t){

			foreach($t['Head'] as $h){
				if($h['id'] == $hid){
					$thread_id = $h['thread_id'];
				}
				foreach($h['Log'] as $l){
					
					$logs[] = $l['id'];
				}
			}
		}

		$lids = $this->Log->UsersLog->find('list',array(
			'conditions' => array(
				'AND' => array(
					'UsersLog.user_id' => $uid,
					'UsersLog.log_id' => $logs
				)
			),
			'fields' => 'UsersLog.log_id'
		));
		
		$to_be_marked_viewed = array();
		foreach(array_diff($logs,$lids) as $id){
			$to_be_marked_viewed[] = array('user_id' => $uid, 'log_id' => $id);
		}
		//$minus = count($to_be_marked_viewed);
		//$this->Log->User->Profile->minusNotificationCount($thread_id,$uid,'Threads',$minus);
		$r = $this->Log->UsersLog->saveAll($to_be_marked_viewed);
		
		//Update notification counts
		$notificationsCount = new NotifCounts($this->Thread->User->Profile,$uid);
		$cleared = $notificationsCount->clear('head',$hid);

		$notificationsCount->minus('thread',$thread_id,$cleared);
		

	}	
	public function beforeDelete($cascade = true)
	{
		$members = $this->members($this->thread_id);
		$members[] =  AuthComponent::user('id');
		//Clear the caches
		foreach($members as $uid){
			foreach(array("threads","heads","groupchats") as $n){
					$cache = new CacheObj($uid,$n);
					$cache->clear();
			}			
		}
		return true;
	}	
}
