<?php
App::uses('AppModel', 'Model');
/**
 * Message Model
 *
 * @property User $User
 * @property Groupchat $Groupchat
 * @property Like $Like
 */
class Message extends AppModel {

/**
 * Validation rules
 *
 * @var array
 */
	public $virtualFields = array(
	    'created_date' => 'SUBSTRING(Message.created,1,10)'
	); 
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
		'groupchat_id' => array(
			'numeric' => array(
		
				'rule' => array('numeric'),
				//'message' => 'Your custom message here',
				//'allowEmpty' => false,
				//'required' => false,
				//'last' => false, // Stop validation after this rule
				//'on' => 'create', // Limit validation to 'create' or 'update' operations
			),
		),
		
		// 'body' => array(
		// 	'notEmpty' => array(
		// 		'rule' => array('notEmpty'),
		// 		//'message' => 'Your custom message here',
		// 		//'allowEmpty' => false,
		// 		//'required' => false,
		// 		//'last' => false, // Stop validation after this rule
		// 		//'on' => 'create', // Limit validation to 'create' or 'update' operations
		// 	),
		// ),
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
		),
		'Groupchat' => array(
			'className' => 'Groupchat',
			'foreignKey' => 'groupchat_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		)
	);

/**
 * hasMany associations
 *
 * @var array
 */
 
	public $hasMany = array(
		'Upload','Log'
	);

	 

	public function afterSave($created, $options = array()){
		if(!$created) return;
			
		$id = AuthComponent::user('id');
		$msg = $this->data['Message'];

		$this->Log->save(array(
			'user_id' => 	$id,
			'message_id' => $msg['id'],
			'groupchat_id' => $msg['groupchat_id'],
			'type' => 'Message.add'
		));
	
	}	
}
