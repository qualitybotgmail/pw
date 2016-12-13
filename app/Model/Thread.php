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
			$id = AuthComponent::user('id');
			$this->Log->save(array(
				'user_id' => 	$id,
				'thread_id' => $this->data['Thread']['id'],
				'type' => 'Thread.edit'
			));
		}

	}
	
}
