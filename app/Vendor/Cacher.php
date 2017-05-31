<?php

class CacheObj{
	var $uid;
	var $cache;
	var $name;
	
	public function CacheObj($uid,$name){
		$this->uid = $uid;
		$this->name = $name;
		$this->cache = Cache::read($this->name."_".$this->uid,'long');
		if($this->cache==null){
			$this->cache = array();
			$this->save();
		}
		
	}
	public function clear(){
		$this->cache = array();
		$this->save();
	}
	public function save(){

		$saved = Cache::write($this->name."_".$this->uid,$this->cache,'long');

	}
	
	public function get($key = null){
	    
		if($key == null){
			$key = $_SERVER['REQUEST_URI'];
		}
		$ret = @$this->cache[$key];
		return $ret;
		
	}
	public function set($data,$key = null){
		if($key==null){
			$key = $_SERVER["REQUEST_URI"];
		}
		$this->cache[$key]= $data;
		$this->save();
	}

}