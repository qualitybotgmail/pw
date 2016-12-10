<?php
App::uses('AppModel', 'Model');
/**
 * Notification Model
 *
 * @property User $User
 * @property Thread $Thread
 * @property Head $Head
 * @property Message $Message
 * @property Groupchat $Groupchat
 * @property Comment $Comment
 * @property Like $Like
 */
class Notification extends AppModel {

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
		'Thread' => array(
			'className' => 'Thread',
			'foreignKey' => 'thread_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		),
		'Head' => array(
			'className' => 'Head',
			'foreignKey' => 'head_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		),
		'Message' => array(
			'className' => 'Message',
			'foreignKey' => 'message_id',
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
		),
		'Comment' => array(
			'className' => 'Comment',
			'foreignKey' => 'comment_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		),
		'Like' => array(
			'className' => 'Like',
			'foreignKey' => 'like_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		)
	);
}
