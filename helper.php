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
		var_dump("convertToDOM from messages");
		if((!empty($result))&&(is_array($result))){
			var_dump("not empty");
			if(isset($result['meta'])){
				var_dump($result['meta']);
				$result['meta'] = $this->URL->parse($result['meta']);
				var_dump($result['meta']);
			}
		}
    return $result;
  }
}
