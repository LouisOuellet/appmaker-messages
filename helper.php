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
						$result[$key] = $this->URL->parse($result[$key]);
						break;
					default:
						break;
				}
			}
		}
    return $result;
  }

	// public function buildRelation($relations,$relation){
	// 	$relationships = $this->getRelationships($relation['relationship'],$relation['link_to']);
	// 	foreach($relationships as $id => $links){
	// 		foreach($links as $details){
	// 			if(in_array($details['relationship'],['files','contacts'])){
	// 				if(isset($this->Settings['plugins'][$details['relationship']]['status']) && $this->Settings['plugins'][$details['relationship']]['status']){
	// 					$recordDetail = $this->Auth->query('SELECT * FROM `'.$details['relationship'].'` WHERE `id` = ?',$details['link_to']);
	// 					if($recordDetail->numRows() > 0){
	// 						$recordDetail = $recordDetail->fetchAll()->All()[0];
	// 						if($details['relationship'] == 'files'){ unset($recordDetail['file']); }
	// 						$relations[$relation['relationship']][$relation['link_to']][$details['relationship']][$details['link_to']] = $recordDetail;
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}
  //   return $relations;
  // }
}
