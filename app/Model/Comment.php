<?php
App::uses('AppModel', 'Model');
/**
 * Comment Model
 *
 * @property User $User
 * @property Thread $Thread
 */
class Comment extends AppModel {

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
		// 'thread_id' => array(
		// 	'numeric' => array(
		// 		'rule' => array('numeric'),
		// 		//'message' => 'Your custom message here',
		// 		//'allowEmpty' => false,
		// 		//'required' => false,
		// 		//'last' => false, // Stop validation after this rule
		// 		//'on' => 'create', // Limit validation to 'create' or 'update' operations
		// 	),
		// ),
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
		'Head' => array(
			'className' => 'Head',
			'foreignKey' => 'head_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		),
	);
	
	public $hasMany = ['Like', 'Upload','Log'];

// 	public function afterFind($results, $primary = false) {
// 		$ret = [];
// 	    foreach ($results as $key => $val) {
// 	        $val['Comment']['likes'] = $this->Like->find('count',['conditions'=>['comment_id' => $val['Comment']['id']]]);
// 	        $list = $this->Like->find('list',[
// 	        		'fields' => ['user_id'],
// 	        		'conditions'=>['comment_id' => $val['Comment']['id']]]);
	        
// 	        $uid = CakeSession::read("Auth.User.id");
// 	        //print_r($list);
// 	        $val['Comment']['isUserLiked'] = in_array($uid,$list);
// 	        $ret[$key] = $val;
// 	    }
	    
//     return $ret;
// }
	public function isLiked($cid,$uid){
		$ret = $this->Like->findByCommentIdAndUserId($cid,$uid);
		if($ret)
			return true;
			
		return false;
	}
	
	public function afterSave($created, $options = array()){
		$this->Head->Behaviors->load('Containable');
		$head = $this->Head->find('first',array(
			'conditions' => array(
				'id' => $this->data['Comment']['head_id']	
			),'contain' => array(),'fields'=>'thread_id'
		));
		
		$id = AuthComponent::user('id');
		
		$this->Log->save(array(
			'user_id' => 	$id,
			'thread_id' => $head['Head']['thread_id'],
			'head_id' => $this->data['Comment']['head_id'],
			'comment_id' => $this->data['Comment']['id'],
			'type' => 'Comment.'. ($created? 'add' : 'edit')
		));
	

	}		
	
}
