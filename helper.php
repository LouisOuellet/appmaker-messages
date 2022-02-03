<?php
class messagesHelper extends Helper {

	public function buildRelation($relations){
    if(isset($relations['messages'])){
			foreach($relations['messages'] as $id => $message){
				$relations['messages'][$id]['meta'] = $this->URL->parse($message['meta']);
			}
    }
    return $relations;
  }

	public function convertToDOM($result){
		if((!empty($result))&&(is_array($result))){
			foreach($result as $key => $value){
				switch($key){
					case"meta":
						var_dump($result[$key]);
						var_dump($value);
						$result[$key] = $this->URL->parse($value);
						break;
					default:
						break;
				}
			}
		}
    return $result;
  }
}
