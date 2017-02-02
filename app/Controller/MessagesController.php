<?php
App::uses('AppController', 'Controller');
/**
 * Messages Controller
 *
 * @property Message $Message
 * @property PaginatorComponent $Paginator
 */
 

class MessagesController extends AppController {



// public $uses = array(
//         'Message'
//     );

    
/**
 * Components
 *
 * @var array
 */
 
	public $uses = array('Message');
	public $components = array('Paginator');

	public function beforeFilter(){
		parent::beforeFilter();
		$this->Auth->allow('add');
	}
/**
 * index method
 *
 * @return void
 */
	public function index() {
		$this->Message->recursive = 0;
		$this->set('messages', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->Message->exists($id)) {
			throw new NotFoundException(__('Invalid message'));
		}
		
		$options = array('conditions' => array('Message.' . $this->Message->primaryKey => $id));
		$this->set('message', $this->Message->find('first', $options));
	}

/**
 * add method
 *
 * @return void
 */
	// public function add() {
	// 	if ($this->request->is('post')) {
	// 		$this->Message->create();
	// 		if ($this->Message->save($this->request->data)) {
	// 			$this->Session->setFlash(__('The message has been saved.'), 'default', array('class' => 'alert alert-success'));
	// 			return $this->redirect(array('action' => 'index'));
	// 		} else {
	// 			$this->Session->setFlash(__('The message could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
	// 		}
	// 	}
	// 	$users = $this->Message->User->find('list');
	// 	$groupchats = $this->Message->Groupchat->find('list');
	// 	$this->set(compact('users', 'groupchats'));
	// }

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function edit($id = null) {
		if (!$this->Message->exists($id)) {
			throw new NotFoundException(__('Invalid message'));
		}
		if ($this->request->is(array('post', 'put'))) {
			if ($this->Message->save($this->request->data)) {
				$this->Session->setFlash(__('The message has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The message could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Message.' . $this->Message->primaryKey => $id));
			$this->request->data = $this->Message->find('first', $options);
		}
		$users = $this->Message->User->find('list');
		$groupchats = $this->Message->Groupchat->find('list');
		$this->set(compact('users', 'groupchats'));
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->Message->id = $id;
		if (!$this->Message->exists()) {
			throw new NotFoundException(__('Invalid message'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Message->delete()) {
			$this->Session->setFlash(__('The message has been deleted.'), 'default', array('class' => 'alert alert-success'));
		} else {
			$this->Session->setFlash(__('The message could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		}
		return $this->redirect(array('action' => 'index'));
	}
	
	public function add($id = null){ 
		 
		header('Content-Type: application/json;charset=utf-8'); 
	
		$groupchat_id = $id;  
		
		
		if ($this->request->is('post')) { 
			$body = $this->request->data['body'];
			// $body = 'asd';
			$user_id = $this->Auth->user('id'); 
	
			
			$data = array('user_id' => $user_id, 'groupchat_id' => $groupchat_id, 'body' => $body); 
			
			$saved = $this->Message->save($data);
			$s = explode(" ",$saved['Message']['created']);
			$saved['Message']['created_date'] = $s[0];
			echo json_encode($saved);
			exit;

		} else{
			$result = 'data unposted';
		} 
		
		echo json_encode($result); 
		 
        exit;
	}
	
	
	
/**
 * add method
 *
 * @return void
 */
	public function like($id = null) {
		$this->Message->id = $id;
		if (!$this->Message->exists()) {
			throw new NotFoundException(__('Invalid message'));
		}
		$user_id = $this->Auth->user('id');		
		$like = array(
			'Like' => array('user_id' => $user_id,'message_id' => $id)
		);
		
		if(!$this->Message->Like->messageLikeExists($id,$user_id)){
			$ret = $this->Message->Like->save($like);
			if($ret)
				echo json_encode(array('status' => 'OK')); 
			else {
				echo json_encode(array('status' => 'FAILED'));
			}
			exit;
		}
		echo json_encode(array('status' => 'EXISTS'));
		exit;
		
		
		
// Array
// (
//     [Like] => Array
//         (
//             [user_id] => 3
//             [message_id] => 1
//             [message_id] => 1
//         )

// )

		return $this->redirect(array('action' => 'index'));
	}
/**
 * add method
 *
 * @return void
 */
	public function unlike($id = null) {
		$this->Message->id = $id;
		if (!$this->Message->exists()) {
			throw new NotFoundException(__('Invalid message'));
		}
		$user_id = $this->Auth->user('id');		
		
		if($this->Message->Like->messageLikeExists($id,$user_id)){
			$ret = $this->Message->Like->messageLike($id,$user_id);
			$this->Message->Like->id  = $ret['Like']['id'];
			if($this->Message->Like->delete()){
				echo json_encode(array('status' => 'OK'));
			} else {
				echo json_encode(array('status' => 'FAILED'));
			}
			exit;
		}else{
			echo json_encode(array('status' => 'NOT_EXISTING'));
		}
		exit;


	}
	
}
 