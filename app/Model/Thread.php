<?php
App::uses('AppModel', 'Model');
/**
 * Thread Model
 *
 * @property User $User
 * @property User $User
 */
class Thread extends AppModel {


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
		'title' => array(
			'notEmpty' => array(
				'rule' => array('notEmpty'),
				//'message' => 'Your custom message here',
				//'allowEmpty' => false,
				//'required' => false,
				//'last' => false, // Stop validation after this rule
				//'on' => 'create', // Limit validation to 'create' or 'update' operations
			),
		),
		'head' => array(
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
		)
	);

/**
 * hasAndBelongsToMany associations
 *
 * @var array
 */
	public $hasAndBelongsToMany = array(
		'User' => array(
			'joinTable' => 'users_threads'
		)
	);
	public $hasMany = array('Head','Notification','Log');
	
	public function members($thread_id){
		
		$thread = $this->findById($thread_id);
		
		$ret = [];
		foreach($thread['User'] as $k => $t){
			if (is_numeric($k))
				$ret[] = $t['id'];
		}
		
		return $ret;
		
	}
	public function isLiked($tid,$uid){
		// $ret = $this->Like->findByThreadIdAndUserId($tid,$uid);
		// if($ret)
		// 	return true;
			
		return false;
	}

	public function afterSave($created, $options = array()){

		if(!$created){
			$type = 'Thread.edit';
			
			$id = AuthComponent::user('id');
			$this->Log->save(array(
				'user_id' => 	$id,
				'thread_id' => $this->data['Thread']['id'],
				'type' => $type
			));
		}

	}
	public function logsFor($tid){
		$id = AuthComponent::user('id');
		return $this->query('SELECT count(*) FROM logs where thread_id = ' . $tid . '	' );
	}
	
	public function notified($tid,$uid){
		$sql = "SELECT logs.id FROM logs where logs.thread_id = $tid and logs.type = 'Thread.edit' and logs.id not in (select users_logs.log_id from users_logs where users_logs.user_id = $uid)";
		
		$r = $this->query($sql);
		$lids = array();
		if($r){
			foreach($r as $log){
				$lids[] = array('log_id' => $log['logs']['id'],'user_id' =>$uid);
			}
			$r = $this->Log->UsersLog->saveAll($lids);
			
		}
	//	print_r($r);
	}
	
}
