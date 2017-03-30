<?php
App::uses('AppModel', 'Model');

App::uses('BlowfishPasswordHasher', 'Controller/Component/Auth');
/**
 * User Model
 *
 * @property Comment $Comment
 * @property Groupchat $Groupchat
 * @property Head $Head
 * @property IgnoredThread $IgnoredThread
 * @property Like $Like
 * @property Log $Log
 * @property Message $Message
 * @property Profile $Profile
 * @property Setting $Setting
 * @property Thread $Thread
 * @property Upload $Upload
 * @property Groupchat $Groupchat
 * @property Log $Log
 * @property Thread $Thread
 */
class User extends AppModel {


	//The Associations below have been created with all possible keys, those that are not needed can be removed

/**
 * hasMany associations
 *
 * @var array
 */
	public $hasMany = array('Notification',
		'Comment' => array(
			'className' => 'Comment',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),
		'Groupchat' => array(
			'className' => 'Groupchat',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),
		'Head' => array(
			'className' => 'Head',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),
		'IgnoredThread' => array(
			'className' => 'IgnoredThread',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),
		'Like' => array(
			'className' => 'Like',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),
		'Log' => array(
			'className' => 'Log',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),
		'Message' => array(
			'className' => 'Message',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),
		'Profile' => array(
			'className' => 'Profile',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),
		'Setting' => array(
			'className' => 'Setting',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),
		'Thread' => array(
			'className' => 'Thread',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		),
		'Upload' => array(
			'className' => 'Upload',
			'foreignKey' => 'user_id',
			'dependent' => false,
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'exclusive' => '',
			'finderQuery' => '',
			'counterQuery' => ''
		)
	);


/**
 * hasAndBelongsToMany associations
 *
 * @var array
 */
	public $hasAndBelongsToMany = array(
		'Groupchat' => array(
			'className' => 'Groupchat',
			'joinTable' => 'users_groupchats',
			'foreignKey' => 'user_id',
			'associationForeignKey' => 'groupchat_id',
			'unique' => 'keepExisting',
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'finderQuery' => '',
		),
		'Log' => array(
			'className' => 'Log',
			'joinTable' => 'users_logs',
			'foreignKey' => 'user_id',
			'associationForeignKey' => 'log_id',
			'unique' => 'keepExisting',
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'finderQuery' => '',
		),
		'Thread' => array(
			'className' => 'Thread',
			'joinTable' => 'users_threads',
			'foreignKey' => 'user_id',
			'associationForeignKey' => 'thread_id',
			'unique' => 'keepExisting',
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'finderQuery' => '',
		)
	);
	function afterLogin($successfully){ 
			
	        if($successfully == true){ 

				$type = 'User.logged';
				$id = AuthComponent::user('id');
				$this->Log->save(array(
					'user_id' => 	$id,
					'type' => $type
				));
			
	        }else{ 
	        	
	            // do something if not 
	        } 
	     
	
	}
	public function beforeSave($options = array()) {
		$this->data[$this->alias]['hash']=$this->generate_hash($this->data[$this->alias]['loginid'],$this->data[$this->alias]['password']);
	    if (isset($this->data[$this->alias]['password'])) {
	        $passwordHasher = new BlowfishPasswordHasher();
	        $this->data[$this->alias]['password'] = $passwordHasher->hash(
	            $this->data[$this->alias]['password']
	        );
	    }
	   
	    return true;
	}
	
	public function afterSave($created, $options = array()){

		if($created){

			$this->addmember_all($this->data['User']['id']);
		}

	}
	
	function generate_hash($username,$pass){
		return hash("sha1",$username.':'.$pass);
	}
	
	function addmember_all($member_id){
			$all=$this->Thread->find('first',array('conditions'=>array('user_id'=>0)));
			$users = array();
			
			if(count($all) > 0){
				//$user_list=$this->Thread->User->find('list',array('fields'=>'User.id','conditions'=>array('thread_id'=>$all['Thread']['id'])));
				
					$query="Insert INTO users_threads(user_id,thread_id) VALUES('".$member_id."','".$all['Thread']['id']."')";			
					//$result = $this->Thread->User->save(array('thread_id' =>$all['Thread']['id'],'user_id' => $member_id));
					$this->Thread->query($query);
				
			}else{
				$data=array('user_id'=>0,'title'=>'All');
				$this->Thread->save($data);
				$thread_id=$this->Thread->getInsertID();
				
				$user_list=$this->User->find('list',array('fields'=>'id'));
				
				$result = $this->Thread->save(array(
					'Thread' => array('id' =>$thread_id),
					'User' => array('User' => $user_list)
				));
				
			}
			
	}
}
