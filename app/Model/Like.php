<?php
App::uses('AppModel', 'Model');
/**
 * Like Model
 *
 * @property User $User
 * @property Message $Message
 * @property Thread $Thread
 */
class Like extends AppModel {

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
		// 'message_id' => array(
		// 	'numeric' => array(
		// 		'rule' => array('numeric'),
		// 		//'message' => 'Your custom message here',
		// 		//'allowEmpty' => false,
		// 		//'required' => false,
		// 		//'last' => false, // Stop validation after this rule
		// 		//'on' => 'create', // Limit validation to 'create' or 'update' operations
		// 	),
		// ),
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
		'comment_id' => array(
			'numeric' => array(
				'rule' => array('numeric'),
				//'message' => 'Your custom message here',
				//'allowEmpty' => false,
				//'required' => false,
				//'last' => false, // Stop validation after this rule
				//'on' => 'create', // Limit validation to 'create' or 'update' operations
			),
		),
		'head_id' => array(
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
		'Message' => array(
			'className' => 'Message',
			'foreignKey' => 'message_id',
			'conditions' => '',
			'fields' => '',
			'order' => ''
		),
		// 'Thread' => array(
		// 	'className' => 'Thread',
		// 	'foreignKey' => 'thread_id',
		// 	'conditions' => '',
		// 	'fields' => '',
		// 	'order' => ''
		// ), 
		'Comment' => array(
			'className' => 'Comment',
			'foreignKey' => 'comment_id',
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
		)
	);
	public $hasMany = 'Log';
	// public function threadLike($thread_id,$user_id){
	// 	$ret = $this->find('first',array('conditions' => array(
	// 		'Like.thread_id' => $thread_id,
	// 		'Like.user_id'   => $user_id
	// 	)));
		
	// 	return $ret;
	// }
	// public function threadLikeExists($thread_id,$user_id){
	// 	$ret = $this->threadLike($thread_id,$user_id);
		
	// 	return count($ret) > 0;
	// }
	public function commentLike($comment_id,$user_id){
		$ret = $this->find('first',array('conditions' => array(
			'Like.comment_id' => $comment_id,
			'Like.user_id'   => $user_id
		)));
		
		return $ret;
	}
	public function commentLikeExists($comment_id,$user_id){
		$ret = $this->commentLike($comment_id,$user_id);
		
		return count($ret) > 0;
	}	
	public function messageLike($message_id,$user_id){
		$ret = $this->find('first',array('conditions' => array(
			'Like.message_id' => $message_id,
			'Like.user_id'   => $user_id
		)));
		
		return $ret;
	}
	public function messageLikeExists($message_id,$user_id){
		$ret = $this->messageLike($message_id,$user_id);
		
		return count($ret) > 0;
	}		
	public function beforeSave($options = array()) {
		
	    if (isset($this->data[$this->alias]['password'])) {
	        $passwordHasher = new BlowfishPasswordHasher();
	        $this->data[$this->alias]['password'] = $passwordHasher->hash(
	            $this->data[$this->alias]['password']
	        );
	    }
	    return true;
	}
	
	public function headLike($head_id,$user_id){
		$ret = $this->find('first',array('conditions' => array(
			'Like.head_id' => $head_id,
			'Like.user_id'   => $user_id
		)));
		
		return $ret;
	}
	public function headLikeExists($head_id,$user_id){
		$ret = $this->headLike($head_id,$user_id);
		
		return count($ret) > 0;
	}
	public function afterSave($created, $options = array()){
		if(!$created) return;
		
		$this->Behaviors->load('Containable');
		$like = $this->data['Like'];
		$hid = isset($like['head_id'])? $like['head_id']:0;
		$cid = isset($like['comment_id'])? $like['comment_id']:0;
		
		$type = $hid != 0 ? "Head.like" : ($cid != 0 ? 'Comment.like' : "Unknown.like");
		
		$like_d = $this->find('first',array(
			'conditions' => array(
				'Like.id' => $like['id']	
			),
			'contain' => array('Head.id'=>'Thread.id','Comment.id' => 'Head.id')
		));
		if(isset($like_d['Comment']['head_id']))
			$hid = $like_d['Comment']['head_id'];
		$id = AuthComponent::user('id');
		
		$r = $this->Log->save(array(
			'like_id' => $like['id'],
			'user_id' => 	$id,
			'thread_id' => $type == 'Comment.like' ? $like_d['Comment']['Head']['thread_id'] : $like_d['Head']['thread_id'],
			'head_id' => $hid,
			'comment_id' => $cid,
			'type' => $type
		));
	

	}			
}
