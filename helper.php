<?php
class messagesHelper extends Helper {

	public function buildRelation($relations){
    if(isset($relations['messages'])){
			foreach($relations['messages'] as $id => $message){
				$relations['messages'][$id]['meta'] = $this->URL->parse($message['meta']);
				$relations['messages'][$id]['body_original'] = str_replace(['\n','\r'],'<br>',$result['body_original']);
				$relations['messages'][$id]['body_unquoted'] = str_replace(['\n','\r'],'<br>',$result['body_unquoted']);
			}
    }
    return $relations;
  }

	public function convertToDOM($result){
		if((!empty($result))&&(is_array($result))){
			if(isset($result['meta'])){
				$result['meta'] = $this->URL->parse($result['meta']);
			}
			if(isset($result['body_original'])){
				$result['body_original'] = str_replace(['\n','\r'],'<br>',$result['body_original']);
			}
			if(isset($result['body_unquoted'])){
				$result['body_unquoted'] = str_replace(['\n','\r'],'<br>',$result['body_unquoted']);
			}
		}
    return $result;
  }
}
