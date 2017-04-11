<?php 

class NotifCounts{
	var $Profile = null;
	var $uid = null;
	var $data = null;
	
	function __construct($Profile,$uid){
		
		$this->Profile = $Profile;
		$this->uid = $uid;
		$this->data = $Profile->findByUserId($uid);
		
	}
	function getNotif(){
		$p = $this->Profile->findByUserId($this->uid);
		$n = json_decode($p['Profile']['notifications_count'],true);
		return $n;
	}
	function hash(){
		return md5($this->data['Profile']['notifications_count']);
	}
	function modified(){
		$ifnonmatch = null;
		if(isset($_SERVER['HTTP_IF_NONE_MATCH'])){
			$ifnonmatch = $_SERVER['HTTP_IF_NONE_MATCH'];
		}
		
		
		
		return ($this->hash() == $ifnonmatch);
		
	}
	function saveNotif($notif){
		$this->Profile->id = $this->data['Profile']['id'];
		$this->Profile->saveField('notifications_count',json_encode($notif));		
	}
	function inc($type,$id){
		$this->add($type,$id,1);
	}
	function dec($type,$id){
		$this->minus($type,$id,1);
	}
		
	function minus($type,$id,$count){
		
		$typeName = ucwords($type)."s";

		$notif = $this->getNotif();

		if(isset($notif[$typeName][$id])){

			$notif[$typeName][$id] = $notif[$typeName][$id] - $count;
			
			if($notif[$typeName][$id] <= 0){
				unset($notif[$typeName][$id]);
			}
		}

		
		$this->saveNotif($notif);		
	}
	function add($type,$id,$count){
		$typeName = ucwords($type)."s";
		$notif = $this->getNotif();

		if(isset($notif[$typeName][$id])){
			$notif[$typeName][$id] = $notif[$typeName][$id] + $count;
		}else{
			$notif[$typeName][$id]=$count;
		}

		$this->saveNotif($notif);		
	}	
	function clear($type = null,$id = null){
		if($type == null){
			$this->saveNotif(array('Threads'=>array(),'Groupchats'=>array()));
			return true;
		}
		$typeName = ucwords($type)."s";
		$notif = $this->getNotif();
		if($id == null){
			$notif[$typeName] = array();
			$this->saveNotif($notif);
		}else{
		
			$oldCount = $this->get($type,$id);
			$this->set($type,$id,0);
			return $oldCount;
		}
		return null;
	}
	
	function set($type,$id,$count){
		$typeName = ucwords($type)."s";
		
		$notif = $this->getNotif();
		
		if(isset($notif[$typeName][$id]) ){
			if($count == 0){
				unset($notif[$typeName][$id]);
			}else{
				$notif[$typeName][$id] = $count;
			}
		}else{
			if($count > 0)
				$notif[$typeName][$id] = $count;
		}
		$this->data['Profile']['notifications_count'] = json_encode($notif);
		$this->Profile->id = $this->data['Profile']['id'];
		$this->Profile->saveField('notifications_count',json_encode($notif));
		
	//	print_r($notif);
	}
	function get($type,$id){
		$typeName = ucwords($type)."s";
		
		$notif = $this->getNotif();
		
		if(isset($notif[$typeName][$id]) ){
			return $notif[$typeName][$id];
		}else{
			return 0;
		}

	}	
	
}