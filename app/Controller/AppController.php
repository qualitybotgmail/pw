<?php
/**
 * Application level Controller
 *
 * This file is application-wide controller file. You can put all
 * application-wide controller-related methods here.
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       app.Controller
 * @since         CakePHP(tm) v 0.2.9
 * @license       http://www.opensource.org/licenses/mit-license.php MIT License
 */

App::uses('Controller', 'Controller');

/**
 * Application Controller
 *
 * Add your application-wide methods in the class below, your controllers
 * will inherit them.
 *
 * @package		app.Controller
 * @link		http://book.cakephp.org/2.0/en/controllers.html#the-app-controller
 */
class AppController extends Controller {
    public $components = array(
	'RequestHandler',
        'Session',
        'Auth' => array(
            'loginRedirect' => array(
                'controller' => 'posts',
                'action' => 'index'
            ),
            'logoutRedirect' => array(
                'controller' => 'pages',
                'action' => 'display',
                'home'
            ),
            'authenticate' => array(
                'Form' => array(
                    'passwordHasher' => 'Blowfish'
                )
            )
        )
    );
    public function status($s){
        echo json_encode(['status' => $s]);
        exit;
    }
	public function ok(){
	    $this->status("OK");
	}
    public function failed(){
	    $this->status("FAILED");
	}	
	public function existing(){
	    $this->status("EXISTING");
	}	
	public function notExisting(){
	    $this->notExisting('NOT_EXISTING');
	}	
	
	public function beforeFilter(){
		parent::beforeFilter();
		$this->layout = 'bootstrap';

		$this->Auth->allow('add','view','logout','login','findallby','findby','contains');
	}
	public function _plural(){
		$spl =	explode("Controller",get_class($this));
		return $spl[0];
	}
	public function _pluralSmall(){
		$s = $this->_plural();
		return strtolower($s[0]) . substr($s,1);
	}
	public function _modelSmall(){
		$s = $this->modelClass;
		return strtolower($s[0]) . substr($s,1);
	}
	public function findby($name = null,$arg = null) {	
		$this->view = 'view';
		$findBy = "findBy".ucfirst($name);
		$model = $this->modelClass;
		$this->set($this->_modelSmall(), $this->$model->$findBy($arg));

	}
	public function findallby($name = null,$arg = null,$recurse = 0) {
		$recurse = $recurse * 1;
		$this->view = 'index';
		$model = $this->modelClass;		
		$this->$model->recursive = $recurse;
		$conditions = array('conditions' => array(
			$model.".".$name => $arg
		));
		$this->set($this->_pluralSmall(), $this->$model->find('all',$conditions));

	}
	public function contains($name = null,$arg = null,$recurse = 0) {

		$this->view = 'index';
		$model = $this->modelClass;		

		$recurse = $recurse * 1;
//		$this->$model->recursive = $recurse;
		$conditions = array('recursive'=> $recurse ,'conditions' => array(
			 $model.".".$name ." LIKE" => "%" . $arg . "%"
		));
		$d = $this->$model->find('all',$conditions);
		$d['count'] = count($d);
		$this->set($this->_pluralSmall(), $d);

	}
	public function set($one, $two = null){

		parent::set($one,$two);
		if($one == $this->_pluralSmall()){
			parent::set("_serialize",$one);
		}else if($one == $this->_modelSmall()){
			parent::set("_serialize",$one);
		}
	}
		
}