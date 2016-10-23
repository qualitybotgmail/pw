<?php
App::uses('AppController', 'Controller');
/**
 * UsersGroupchats Controller
 *
 * @property UsersGroupchat $UsersGroupchat
 * @property PaginatorComponent $Paginator
 * @property SessionComponent $Session
 */
class UsersGroupchatsController extends AppController {

/**
 * Components
 *
 * @var array
 */
	public $components = array('Paginator', 'Session');


// 	public function add() {
		
// 	header('Content-Type: application/json;charset=utf-8');
		
// 		if ($this->request->is('post')) {
// 		    $user = $this->request->data;
		    
// 			$this->Groupchat->create(); 
// 			$data = $this->Groupchat->save($this->request->data);
// 			if ($data) {
// 				$result = 'saved groupchat';
// 			} else {
// 				$result = 'failed';
// 			}
// 		}
// 		// $this->set('add',$result); 
// 		echo json_encode($result);
// 	}
}
