<?php
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

}
