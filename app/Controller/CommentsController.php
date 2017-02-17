<?php
App::uses('AppController', 'Controller'); 
App::import('Vendor','uploadHandler');
/**
 * Comments Controller
 *
 * @property Comment $Comment
 * @property PaginatorComponent $Paginator
 */
class CommentsController extends AppController {

/**
 * Components
 *
 * @var array
 */
	public $components = array('Paginator','RequestHandler');

	public function beforeFilter(){
		parent::beforeFilter();
		$this->loadModel('User'); 
		$this->Auth->allow('upload','like','unlike','edit','add','delete');
	}
/**
 * index method
 *
 * @return void
 */
	public function index() {
		$this->Comment->recursive = 0;
		$this->set('comments', $this->Paginator->paginate());
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
		if (!$this->Comment->exists($id)) {
			throw new NotFoundException(__('Invalid comment'));
		}
		$options = array('conditions' => array('Comment.' . $this->Comment->primaryKey => $id));
		$this->set('comment', $this->Comment->find('first', $options));
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
			$this->Comment->create();
			if ($this->Comment->save($this->request->data)) {
				$this->Session->setFlash(__('The comment has been saved.'), 'default', array('class' => 'alert alert-success'));
				return $this->redirect(array('action' => 'index'));
			} else {
				$this->Session->setFlash(__('The comment could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		}
		$users = $this->Comment->User->find('list');
		$threads = $this->Comment->Thread->find('list');
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
		if (!$this->Comment->exists($id)) {
			throw new NotFoundException(__('Invalid comment'));
		}
		if ($this->request->is(array('post', 'put'))) {
			
			$data=$this->Comment->save($this->request->data);
			if ($data) {
			$this->loadModel('Upload');
			$this->Upload->recursive=-1;
			$uploaded=$this->Upload->find('list',array('fields'=>'id','conditions'=>array('comment_id'=>$this->request->data['id'])));
			$res=$this->Upload->delete($uploaded);
			$data['Comment']['Uploads']=[];
			if($res){
				if(count($this->request->data['Uploads']) > 0)
				foreach ($this->request->data['Uploads'] as $value) {
					if(isset($value['Upload']['name'])){
					$data2=array('name'=>$value['Upload']['name'],'path'=>$value['Upload']['path'],'comment_id'=>$this->request->data['id']);
					$this->Upload->save($data2);
					array_push($data['Comment']['Uploads'],array('Upload'=>$data2));
					}
				}
					
			}
				$this->Session->setFlash(__('The comment has been saved.'), 'default', array('class' => 'alert alert-success'));
			
				//return $this->redirect(array('action' => 'index'));
					echo json_encode($data);
				exit;
			} else {
				$this->Session->setFlash(__('The comment could not be saved. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
			}
		} else {
			$options = array('conditions' => array('Comment.' . $this->Comment->primaryKey => $id));
			$this->request->data = $this->Comment->find('first', $options);
		}
		$users = $this->Comment->User->find('list');
		$threads = $this->Comment->Thread->find('list');
		$this->set(compact('users', 'threads'));
	}

/**
 * delete method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function delete($id = null) {
		$this->Comment->id = $id;
		if (!$this->Comment->exists()) {
			throw new NotFoundException(__('Invalid comment'));
		}
		$this->request->onlyAllow('post', 'delete');
		if ($this->Comment->delete()) {
			$this->Session->setFlash(__('The comment has been deleted.'), 'default', array('class' => 'alert alert-success'));
		
			echo json_encode(array('status' => 'OK'));
			exit;
		} else {
			$this->Session->setFlash(__('The comment could not be deleted. Please, try again.'), 'default', array('class' => 'alert alert-danger'));
		
			echo json_encode(array('status' => 'FAILED'));
			exit;			
		}
		return $this->redirect(array('action' => 'index'));
	}
	
	
/**
 * add method
 *
 * @return void
 */
	public function like($id = null) {
		$this->Comment->id = $id;
		if (!$this->Comment->exists()) {
			throw new NotFoundException(__('Invalid comment'));
		}
		$user_id = $this->Auth->user('id');		
		$like = array(
			'Like' => array('user_id' => $user_id,'comment_id' => $id)
		);
		
		if(!$this->Comment->Like->commentLikeExists($id,$user_id)){
			$ret = $this->Comment->Like->save($like);
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
//             [comment_id] => 1
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
		$this->Comment->id = $id;
		if (!$this->Comment->exists()) {
			throw new NotFoundException(__('Invalid comment'));
		}
		$user_id = $this->Auth->user('id');		
		
		if($this->Comment->Like->commentLikeExists($id,$user_id)){
			$ret = $this->Comment->Like->commentLike($id,$user_id);
			$this->Comment->Like->id  = $ret['Like']['id'];
			if($this->Comment->Like->delete()){
				echo json_encode(array('status' => 'OK'));
			} else {
				echo json_encode(array('status' => 'FAILED'));
			}
			exit;
		}else{
			echo json_encode(array('status' => 'NOT_EXISTING'));
		}
		exit;
		
		
		
// Array
// (
//     [Like] => Array
//         (
//             [user_id] => 3
//             [message_id] => 1
//             [comment_id] => 1
//         )

// )

		return $this->redirect(array('action' => 'index'));
	}		
}
