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
			if(isset($result['meta'])){
				$result['meta'] = $this->URL->parse($result['meta']);
			}
		}
    return $result;
  }
}
