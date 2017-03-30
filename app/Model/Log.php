<?php
App::import('Vendor','NotifCounts');
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
	public function pushMe($id){
		
		if($id){
			$fcm = $this->User->Profile->findByUserId($id,'fcm_id');
			if(count($fcm)>0){
				
				$f = $fcm['Profile']['fcm_id'];
				$f=json_decode($f);
				$data=array('title'=>'test','body'=>'body','data'=>array('id'=>1));
				$this->push($f,$data);
			}
		}
	}	
	public function push($fcmids = null,$notifdata=null){
	
		
		$title='PlayWork';
		$body='Notification';
		$data=array();
		if($fcmids != null){
			if(is_array($fcmids)){
				$fcmids = array_unique($fcmids);
			}
			if($notifdata!=null){
				$title=$notifdata['title'];
				$body=$notifdata['body'];
				$data=$notifdata['data'];
			}
			
			$ch = curl_init();
			
			curl_setopt($ch, CURLOPT_URL,"https://fcm.googleapis.com/fcm/send");
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array( 
				'Authorization: key=AIzaSyDlevTKpf3-ouSprb4a_fhTk43Iw0hvuyA',
				"Content-Type: application/json",
			));
			curl_setopt($ch, CURLOPT_POSTFIELDS,
			            json_encode(array(
			            		'notification' => array(
			            			'title' => $title,
			            			'body' => $body,
			            			 'sound'=>'default',
						             'icon'=>'fcm_push_icon'
			            		),
			            	  'data'=>$data,
			            	'registration_ids' => $fcmids,
			            	'priority'=>'high'
        					)
			            ));
			
	
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			//file_put_contents("/tmp/lastcurl",date("g:i")." [Exec]\n".print_r($fcmids,true),FILE_APPEND);
			$server_output = curl_exec ($ch);
			file_put_contents("/tmp/dadacurl",date("g:i:s")."\n".print_r(array('Output'=>$fcmids),true));
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
			$notifdata=array('data'=>array(),'title'=>'','body'=>'');
			$uid = AuthComponent::user('id');
			App::uses('IgnoredThread', 'Model');
			$this->IgnoredThread = new IgnoredThread;
			$profile = $this->User->Profile->findByUserId($uid);
			$uids = array();
			
			$myfcmid = @$profile['Profile']['fcm_id'];
			
			//added by dada
			$myfcmid=json_decode($myfcmid);
			
			$thread_id = null;
			$groupchat_id = null;
			if($log['type'] == 'User.logged' && $myfcmid != ''){
				//$this->push(array($myfcmid)); ---dada
				$this->push($myfcmid);
				return;
			}elseif(isset($log['thread_id']) && $log['thread_id'] != 0){
				$tid = $log['thread_id'];
				$thread_id = $tid;
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
				$notifdata['title']=$thread['Thread']['title'];
				
				if($log['head_id'] && $log['head_id']!=0){
					App::uses('Head', 'Model');
					$this->Head->recursive=-1;
					$head=$this->Head->find('first',array('conditions'=>array('id'=>$log['head_id'])));
				}
				
				if(isset($log['like_id']) && $log['like_id']!=0){
					if($log['type']=='Head.like')
						$notifdata['body']=$profile['User']['username'].' liked your post: '.$head['Head']['body'];
					else
		 				$notifdata['body']=$profile['User']['username'].' liked your comment in '.$head['Head']['body'];
					
				}else{
					if($log['type']=='Head.add')
						$notifdata['body']=$profile['User']['username'].' add '.$head['Head']['body'];
					
					if($log['type']=='Head.edit')
						$notifdata['body']=$profile['User']['username'].' edited '.$head['Head']['body'];
						
					if($log['type']=='Comment.add')
						$notifdata['body']=$profile['User']['username'].' commented in "'.$head['Head']['body'];
					
					if($log['type']=='Comment.edit')
						$notifdata['body']=$profile['User']['username'].' edited his comment in "'.$head['Head']['body'];
					
				}
				$notifdata['data']=array('id'=>$tid,'head_id'=>$log['head_id']);
				
				
				foreach($thread['User'] as $u){
					if(in_array($u['id'],$ignored_users)){
						continue;
					}
					if(count($u['Profile'])<1) continue;
					$f = $u['Profile'][0]['fcm_id'];
					$uids[] = $u['id'];
					if(trim($f) == '' ) continue;
					if($u['Profile'][0]['user_id'] == $log['user_id']) continue;
					 $fcmids=array_merge($fcmids,json_decode($f));
					//$fcmids[] = json_decode($f);
				}
			
				$oid = @$thread['Owner']['id'];
				//This could be buggy
				$uids[] = $thread['Owner']['id'];	
				if(!in_array($oid,$ignored_users)){
					$f = @$thread['Owner']['Profile'][0]['fcm_id'];
					
					if($f){
						if(@$thread['Owner']['Profile'][0]['user_id'] != $log['user_id']){
							//$fcmids[] = json_decode($f);
							$fcmids=array_merge($fcmids,json_decode($f));
							
						}
					}
				}
			}
		//Is there a groupchats_id? if so this is a chat
		//Get the fcm_ids involved
			else if(isset($log['groupchat_id']) && $log['groupchat_id'] != 0){
				
				$gid = $log['groupchat_id'];
				$groupchat_id = $gid;
				
				$this->Groupchat->Behaviors->load('Containable');
				$g = $this->Groupchat->find('first',array(
					'conditions' => array(
						'Groupchat.id' => $gid
					),
					'contain' => array('Owner.id' => 'Profile.fcm_id','User.username' => array('Profile.fcm_id','Profile.user_id'))
				));
				App::uses('Message', 'Model');
				$this->Message->recursive=-1;
				$message=$this->Message->find('first',array(
					'conditions'=>array('Message.id'=>$log['message_id'])
				));
				//file_put_contents("/tmp/dadacurl",date("g:i:s")."\n".print_r($message,true),FILE_APPEND);
				$notifdata['data']=array('id'=>$gid);
				$notifdata['title']=$profile['User']['username'];
				$notifdata['body']=$message['Message']['body'];
	
				foreach($g['User'] as $u){
					if(count($u['Profile'])<1) continue;
					$f = $u['Profile'][0]['fcm_id'];
					$uids[] = $u['id'];
					
					if(trim($f) == '' ) continue;
					if($u['Profile'][0]['user_id'] == $log['user_id']) continue;
					//$fcmids[] = json_decode($f);
					if(is_array(json_decode($f))){
						$fcmids=array_merge($fcmids,json_decode($f));
					}else{
						array_push($fcmids,$f);
					}
						
					}
				
				$f = @$g['Owner']['Profile'][0]['fcm_id'];
				$uids[] = $g['Owner']['id'];
				
				if(is_array(json_decode($f))){
					//$fcmids[] = json_decode($f);
					$fcmids=array_merge($fcmids,json_decode($f));
					
				}else{
						array_push($fcmids,$f);
					}	
			}	
			file_put_contents("/tmp/dadacurl",date("g:i:s")."\n".print_r($notifdata,true));
			$this->push($fcmids,$notifdata);
			
		
			//Update caches of the users
			$uids[] = $uid;
			
			foreach($uids as $uid){
				if($uid == AuthComponent::user('id')) continue;
				//delete the file so that the cache is updated
				$not = new NotifCounts($this->User->Profile,$uid);
				if($groupchat_id){
					$not->inc('groupchat',$groupchat_id);
				}else{
					//A thread
					$not->inc('thread',$thread_id);
				}
				
			}
			//exit;

	}

	public function removeCache($uid,$gid=null){
			$f1 = '/tmp/chat_notifications/'.$uid.'.json';
		//	if($gid!=null){
		//		$this->setGidCache($uid,$gid,1);
		//	}else{
				@unlink($f1);
		//	}
			@unlink('/tmp/chat_notifications/'.$uid.'_data.json');		
	}
	public function notifications_count($uid){
		$tmpdir = '/tmp/chat_notifications/';
		if(!file_exists($tmpdir)){
			mkdir($tmpdir);
		}
		

		if(file_exists($tmpdir.$uid.'.json')){

			$json = file_get_contents($tmpdir.$uid.'.json');
			$ret = @unserialize($json);
			if($ret){
				$ret['cached'] = true;
				return $ret;
			}
			
		}
			
		$ret = $this->notifications_count_main($uid);
	//	file_put_contents($tmpdir.$uid.".json",serialize($ret));
		return $ret;
		
	}
	public function notifications_count_main($uid) { 
		if($uid == null) return null;
		

		$t = $this->query(
			'SELECT Thread.id id,count(distinct Logs.id) count FROM `users_threads` UsersThread
			inner join logs Logs on Logs.thread_id = UsersThread.thread_id
			inner join threads Thread on Thread.id = UsersThread.thread_id
			
			where (UsersThread.user_id = '.$uid.' or Thread.user_id = '.$uid.') 
			and Logs.user_id != '.$uid.' 
			and Logs.id not in 
			(select log_id from users_logs where users_logs.user_id = '.$uid.')
			group by UsersThread.thread_id'
		);
		
		$ret = array('Threads'=>array(),'Groupchats'=>array());
		foreach($t as $v){
			$ret["Threads"][] = array('thread_id' => $v['Thread']['id'],'count' => $v['0']['count']);
		}

		$t2q ='SELECT Groupchat.id id,count(Groupchat.id) count FROM `logs` 
			inner join groupchats Groupchat on Groupchat.id = logs.groupchat_id
			inner join users_groupchats on Groupchat.id = users_groupchats.groupchat_id
			where (Groupchat.user_id = '.$uid.' or users_groupchats.user_id = '.$uid.') and logs.user_id != '.$uid.' and logs.id not in (select log_id from users_logs where user_id = '.$uid.')
			group by Groupchat.id';

		$t2 = $this->query($t2q);
		
		foreach($t2 as $v){
			$ret["Groupchats"][] = array('groupchat_id' => $v['Groupchat']['id'],'count' =>  $v['0']['count']);
		}
		
		return $ret;
		
	}		
	public function notifications($uid){
		
		$cache = "/tmp/chat_notifications/$uid"."_data.json";
		if(file_exists($cache)){
			$f = @unserialize(file_get_contents($cache));
			if($f) return $f;
		}
		
		$one  = time();
		$prof = $this->User->Profile->findByUserId($uid);
		$prof = @$prof['Profile'];
		if(isset($prof['notifications'])){
			
			if($prof['notifications'] == 0){
				echo json_encode(array('status' => 'OFF'));
				exit;
			}
		}		
		
		$notifiedIds = array_unique($this->UsersLog->find('list',array(
			'conditions' => array(
				'user_id' => $uid
			),
			'fields' => 'log_id'
		)));
		$this->User->recursive=-1;
		$this->User->Behaviors->load('Containable');

		$user = $this->User->find('first',array(
			'conditions' => array('id' => $uid),
			'contain' => array(
				
				'Thread' => array(
					'Log.thread_id',
					'Log.user_id',
					'Log.id',
					
					'Log.user_id != ' . $uid,
					'Log.type',
					'Log.member',
					'Log.created',
					'Log' => 
					array(
						'conditions' => array(
							'NOT' => array(
								'id' => $notifiedIds,'user_id' => $uid)	
						),
						
						'User.username',
						'Thread.id != 0',
						'Head.id != 0',
						'Comment.id != 0',
						'Like.id != 0'
						
						
					),
					
				),

			)
		));
		
		$messages = $this->User->find('first',array(
			'conditions' => array('id' => $uid),
			'contain' => array(
				'Groupchat.id' => array(
					'Message.id' => array(
						
						'Log' => array(
							'conditions' => array(
								'NOT' => array('id' => $notifiedIds,'user_id' => $uid)
							),
							'Message.user_id' ,'Message.body','Groupchat.id', 'User.username'
						)	
					)	
				)
			)
		));
	
		$notifications = array();
		$notifications_dates = array();
		foreach($user['Thread'] as $t){
			foreach($t['Log'] as $log){
				$un = array('username' => $log['User']['username']);
				$un['id'] = $log['User']['id'];
				$log['User'] = $un;
				$notifications[] = $log;
				$notifications_dates[] = $log['created'];
			}
		}

		foreach($messages['Groupchat'] as $g){
				
				foreach($g['Message'] as $msg){
					
					foreach($msg['Log'] as $l){
						$notifications[] = $l;
						$notifications_dates[] = $l['created'];
					}
				}
			
		}
		

		
		array_multisort($notifications_dates,SORT_DESC,SORT_STRING,$notifications);
		$lasted = time()-$one;
		
		//$notifications['querytime'] =$lasted;		
//		file_put_contents($cache,serialize($notifications));
		return $notifications;
		
	}
}
