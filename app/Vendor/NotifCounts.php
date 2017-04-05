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
		return json_decode($p['Profile']['notifications_count'],true);
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
		$typeName = ucwords($type)."s";
		$notif = $this->getNotif();
		if(isset($notif[$typeName][$id])){
			$notif[$typeName][$id]++;
		}else{
			$notif[$typeName][$id]=1;
		}

		$this->saveNotif($notif);
	}
	function dec($type,$id){
		$typeName = ucwords($type)."s";
		$notif = $this->getNotif();
		if(isset($notif[$typeName][$id])){
			$notif[$typeName][$id]--;
			if($notif[$typeName][$id] <= 0){
				unset($notif[$typeName][$id]);
			}
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
			$this->set($type,$id,0);
		}
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
	
}