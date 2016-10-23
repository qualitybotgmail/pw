<?php
App::uses('AppModel', 'Model'); 
App::uses('ConnectionManager', 'Model'); 
/**
 * UsersGroupchat Model
 *
 * @property User $User
 * @property Groupchat $Groupchat
 */
class UsersGroupchat extends AppModel {

/**
 * Display field
 *
 * @var string
 */
	public $displayField = 'user_id';


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
}
