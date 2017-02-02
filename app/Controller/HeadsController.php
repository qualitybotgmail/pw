<?php
App::uses('AppController', 'Controller');
/**
 * Heads Controller
 *
 * @property Head $Head
 * @property PaginatorComponent $Paginator
 */
class HeadsController extends AppController {

/**
 * Components
 *
 * @var array
 */
	public $components = array('Paginator');

/**
 * index method
 *
 * @return void
 */

	public function index() {
		
		$this->Head->recursive = 2;
		
		// $id = $this->Auth->user('id');
		// $options = array('conditions' => array('user_id'=>$id));
		//$this->Paginator->settings = ['limit' =>3000];//high limit for now
		
		$heads = $this->Head->find('all',array('order' => array('Head.created DESC')));//$this->Paginator->paginate();
	//	echo ($heads['Owner']['password']);exit;
		
		foreach($heads as $k => $head){
			
			$tid = $head['Head']['id'];
			$uid = $this->Auth->user('id');
			$heads[$k]['Head']['isUserLiked'] = $this->Head->isLiked($tid,$uid);
			$heads[$k]['Head']['likes'] = count($head['Like']);
			unset($heads[$k]['Owner']['password']);
			unset($heads[$k]['Like']);
			
			foreach($head['Comment'] as $kk => $comment){
				$heads[$k]['Comment'][$kk]['likes'] = count($comment['Like']);
				$heads[$k]['Comment'][$kk]['isUserLiked'] = $this->Head->Comment->isLiked($comment['id'],$uid);
				unset($heads[$k]['Comment'][$kk]['Like']);
				unset($heads[$k]['Comment'][$kk]['Head']);
				
			}
			//total likes of comments
		}
		
		$this->set('heads', $heads);
		 

	}	

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */

	public function view($id = null) {
	
		if (!$this->Head->exists($id)) {
			throw new NotFoundException(__('Invalid head'));
		}
		$this->Head->Behaviors->load('Containable');
		//$this->Head->recursive = 3;
		$head = $this->Head->find('first',array(
			'conditions' => array('Head.id' => $id),
			'contain' => array('Thread','Like','Comment.created','Comment.body','Comment.id' => array('Like','User.id','User.username'),'Owner')
		));//ById($id);
		$tid = $id;
		$uid = $this->Auth->user('id');
		
		$head['Head']['isUserLiked'] = $this->Head->isLiked($tid,$uid);
		$head['Head']['likes'] = count($head['Like']);
		unset($head['Owner']['password']);
		unset($head['Like']);
			
		foreach($head['Comment'] as $kk => $comment){
			$head['Comment'][$kk]['likes'] = count($comment['Like']);
			$head['Comment'][$kk]['isUserLiked'] = $this->Head->Comment->isLiked($comment['id'],$uid);
			unset($head['Comment'][$kk]['Like']);
			unset($head['Comment'][$kk]['Head']); 
		} 
		$this->loadModel('Upload');
		
		$this->Upload->recursive=-1;//Behaviors->load('Containable');
		$cond = array(
			'conditions' => array('Upload.head_id' => $id),
		//	'contain' => 
		);
		$uploads = $this->Upload->find('all', $cond);
			// total likes of comments
		$head['Upload'] = array();
		
		foreach($uploads as $up){
			$head['Upload'][] = $up['Upload'];
		}	
		$this->Head->notified($id,$uid);
		$this->set('head',$head);
	}
/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			$this->Head->create();
			
			$this->request->data['user_id'] = $this->Auth->user('id');
			
			$data = $this->Head->save($this->request->data);
			if ($data) {
				
				
					header('Content-Type: application/json;charset=utf-8');
					echo json_encode($data);
					exit;
				
			} else {
				echo json_encode('{status: "FAILED"}');
				exit;
			}
		}
		$users = $this->Head->Owner->find('list');
		$threads = $this->Head->Thread->find('list');
		$this->set(compact('users', 'threads'));
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->Head->exists($id)) {
			throw new NotFoundException(__('Invalid head'));
		}
		
		if ($this->request->is(array('post', 'put'))) {
			
			// echo json_encode($this->request->data);
			// exit;
			
			$this->request->data['user_id'] = $this->Auth->user('id');
			$result = $this->Head->save($this->request->data);
			
			if ($result) {
				$this->Session->setFlash(__('The head has been saved.'), 'default', array('class' => 'alert alert-success'));
				echo json_encode($result);
				exit;
				// return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The head could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Head.' . $this->Head->primaryKey => $id));
			$this->request->data = $this->Head->find('first', $options);
		}
		$users = $this->Head->Owner->find('list');
		$threads = $this->Head->Thread->find('list');
		$this->set(compact('users', 'threads'));
	}
	public function setnotified($id = null){
		header('Content-Type: application/json;charset=utf-8');
		if($this->Head->exists($id)){
			$notified = $this->Head->notified($id,$this->Auth->user('id'));	
			
			if($notified>0) {
				//$this->Groupchat->Log->removeCache($this->Auth->user('id'));
				echo '{status: "OK"}';
			}else{
				echo '{status: "NO_UPDATE"}';
			}
		}else
			echo '{status: "ALREADY_NOTIFIED"}';
		exit;
	}
/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->Head->id = $id;
		if (!$this->Head->exists()) {
			throw new NotFoundException(__('Invalid head'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Head->delete()) {
			echo json_encode(array('status' => 'OK'));
			exit;
		} else {
			echo json_encode(array('status' => 'FAILED'));
			exit;
		}
		
		return $this->redirect(array('action' => 'index'));
	}
	
	
	
	public function like($id = null) {
		$this->Head->id = $id;
		if (!$this->Head->exists()) {
			throw new NotFoundException(__('Invalid thread'));
		}
		$user_id = $this->Auth->user('id');		
		$like = array(
			'Like' => array('user_id' => $user_id,'head_id' => $id)
		);
		
		if(!$this->Head->Like->headLikeExists($id,$user_id)){
			$ret = $this->Head->Like->save($like);
			if($ret)
				echo json_encode(array('status' => 'OK')); 
			else {
				echo json_encode(array('status' => 'FAILED'));
			}
			exit;
		}
		echo json_encode(array('status' => 'EXISTS'));
		exit;
		 

		return $this->redirect(array('action' => 'index'));
	}
	public function unlike($id = null) {
		$this->Head->id = $id;
		if (!$this->Head->exists()) {
			throw new NotFoundException(__('Invalid thread'));
		}
		$user_id = $this->Auth->user('id');		
		
		if($this->Head->Like->headLikeExists($id,$user_id)){
			$ret = $this->Head->Like->headLike($id,$user_id);
			$this->Head->Like->id  = $ret['Like']['id'];
			if($this->Head->Like->delete()){
				echo json_encode(array('status' => 'OK'));
			} else {
				echo json_encode(array('status' => 'FAILED'));
			}
			exit;
		}else{
			echo json_encode(array('status' => 'NOT_EXISTING'));
		}
		exit;
		 

		return $this->redirect(array('action' => 'index'));
	}	
	
	
	public function comment($id = null) {
		
		header('Content-Type: application/json;charset=utf-8');
		if (!$this->Head->exists($id)) {
			$this->notExisting();
		}
		
		$user_id = $this->Auth->user('id');
		if(isset($this->request->data['body'])){
			$this->request->data['Comment']['body'] = $this->request->data['body'];
		}
		if ($this->request->is(array('post', 'put'))) {
			$this->request->data['Comment']['head_id'] = $id;
			$this->request->data['Comment']['user_id']   = $user_id;
			$data = $this->Head->Comment->save($this->request->data);
			if ($data) {
				echo json_encode($data);
				exit;
			} else {
				$this->failed();
			}
		}
		$this->status("INVALID_REQUEST");
	}
}
