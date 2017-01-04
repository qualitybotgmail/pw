<?php
App::uses('AppModel', 'Model');
/**
 * Log Model
 *
 * @property User $User
 * @property Thread $Thread
 * @property Head $Head
 * @property Message $Message
 * @property Comment $Comment
 * @property Like $Like
 * @property User $User
 */
class Log extends AppModel {
public $actsAs = array('Containable');
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
		'message_id' => array(
			'numeric' => array(
				'rule' => array('numeric'),
				//'message' => 'Your custom message here',
				//'allowEmpty' => false,
				//'required' => false,
				//'last' => false, // Stop validation after this rule
				//'on' => 'create', // Limit validation to 'create' or 'update' operations
			),
		),
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
		'like_id' => array(
			'numeric' => array(
				'rule' => array('numeric'),
				//'message' => 'Your custom message here',
				//'allowEmpty' => false,
				//'required' => false,
				//'last' => false, // Stop validation after this rule
				//'on' => 'create', // Limit validation to 'create' or 'update' operations
			),
		),
		'type' => array(
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
		),'Groupchat'
	);

/**
 * hasAndBelongsToMany associations
 *
 * @var array
 */
	public $hasAndBelongsToMany = array(
		'User' => array(
			'className' => 'User',
			'joinTable' => 'users_logs',
			'foreignKey' => 'log_id',
			'associationForeignKey' => 'user_id',
			'unique' => 'keepExisting',
			'conditions' => '',
			'fields' => '',
			'order' => '',
			'limit' => '',
			'offset' => '',
			'finderQuery' => '',
		)
	);

	public function setNotified($lid){
		
		$log = $this->exists($lid);
		
		if($log){
			$id = AuthComponent::user('id');
			if($this->UsersLog->findByUserIdAndLogId($id,$lid)){
				return "ALREADY_NOTIFIED";
			}
			$s = $this->UsersLog->save(array('user_id' => $id,'log_id' => $lid));
			
			return "SUCCESS";
		}
		return "INVALID_LOG_ID";
		
		
		

	}
	public function push($fcmids = null){
		file_put_contents("/tmp/lastcurl",date("g:i")."\n".print_r($fcmids,true),FILE_APPEND);
		if($fcmids != null){
			
			//$fcmids = array_unique($fcmids);
			$ch = curl_init();
			
			curl_setopt($ch, CURLOPT_URL,"https://android.googleapis.com/gcm/send");
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array( 
				'Authorization: key=AIzaSyDf03OOwBarOokhqjqCPDyBirNvI4Mh2o8',
				"Content-Type: application/json",
			));
			curl_setopt($ch, CURLOPT_POSTFIELDS,
			            json_encode(array(
			            	
			            	'data' => array('notification' => array('message' => 'Backoffice','title' => 'Notification')),
			            	'registration_ids' => $fcmids)));
			
	
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		//	file_put_contents("/tmp/lastcurl",date("g:i")." [Exec]\n".print_r($fcmids,true),FILE_APPEND);
			$server_output = curl_exec ($ch);
			file_put_contents("/tmp/lastcurl",date("g:i")."\n".print_r(array('Output'=>$server_output),true),FILE_APPEND);
			curl_close ($ch);	
			
		}
	}
	public function afterSave($created, $options = array()){
		
		//$id = AuthComponent::user('id');
		//Is there a thread_id? if so, this is a thread action
			//get the users invovled in the thread
			//remove the Log.user_id cuz we do not want to inform the creator about his own action
			$log = $this->data['Log'];
			$fcmids = array();
			$uid = AuthComponent::user('id');
			App::uses('IgnoredThread', 'Model');
			$this->IgnoredThread = new IgnoredThread;
			$profile = $this->User->Profile->findByUserId($uid);
		
			$myfcmid = @$profile['Profile']['fcm_id'];

			if($log['type'] == 'User.logged' && $myfcmid != ''){
				$this->push(array($myfcmid));
				return;
			}elseif(isset($log['thread_id']) && $log['thread_id'] != 0){
				$tid = $log['thread_id'];
				
				$ignored_users = $this->IgnoredThread->find('list',array(
					'conditions' => array('thread_id' => $tid),
					'fields' => 'user_id'
				));
				
				$this->Thread->Behaviors->load('Containable');
				$thread = $this->Thread->find('first',array(
					'conditions' => array(
						'Thread.id' => $tid
					),
					'contain' => array(
						'Owner.id' => 'Profile.fcm_id',
						'User.username' => array('Profile.fcm_id','Profile.user_id')
					)
				));
				
				foreach($thread['User'] as $u){
					if(in_array($u['id'],$ignored_users)){
						continue;
					}
					if(count($u['Profile'])<1) continue;
					$f = $u['Profile'][0]['fcm_id'];
					if(trim($f) == '' ) continue;
						if($u['Profile'][0]['user_id'] == $log['user_id']) continue;
					$fcmids[] = $f;
				}
			
				$oid = @$thread['Owner']['id'];
	
				if(!in_array($oid,$ignored_users)){
					$f = @$thread['Owner']['Profile'][0]['fcm_id'];
					if($f){
						$fcmids[] = $f;
					}
				}
			}
		//Is there a groupchats_id? if so this is a chat
		//Get the fcm_ids involved
			else if(isset($log['groupchat_id']) && $log['groupchat_id'] != 0){
				
				$gid = $log['groupchat_id'];
				$this->Groupchat->Behaviors->load('Containable');
				$g = $this->Groupchat->find('first',array(
					'conditions' => array(
						'Groupchat.id' => $gid
					),
					'contain' => array('Owner.id' => 'Profile.fcm_id','User.username' => array('Profile.fcm_id','Profile.user_id'))
				));
				
	
				foreach($g['User'] as $u){
					if(count($u['Profile'])<1) continue;
					$f = $u['Profile'][0]['fcm_id'];
					if(trim($f) == '' ) continue;
					if($u['Profile'][0]['user_id'] == $log['user_id']) continue;
					$fcmids[] = $f;
				}
				
				$f = @$g['Owner']['Profile'][0]['fcm_id'];
				if($f){
					$fcmids[] = $f;
				}	
			}		
			foreach($fcmids as $f){
				$this->push(array($f));
			}

	}
}
