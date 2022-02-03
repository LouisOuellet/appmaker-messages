<?php
class messagesAPI extends CRUDAPI {

	public function read($request = null, $data = null){
		if(isset($data)){
			if(!is_array($data)){ $data = json_decode($data, true); }
			$this->Auth->setLimit(0);
			// Load Messages
			$messages = parent::read('messages', $data);
			// Return
			return $messages;
		}
	}

  public function getMail($host,$port,$encryption = "SSL",$username,$password){
    // Init IMAP
    $IMAP = new PHPIMAP($host,$port,$encryption,$username,$password);
    // Check Connection Status
    if($IMAP->isConnected()){
      // Retrieve INBOX
      $inbox = $IMAP->get();
      // Output ids and subject of all messages retrieved
      foreach($inbox->messages as $msg){
        $message = [
          "account" => $username,
          "folder" => "INBOX",
          "mid" => str_replace(['>','<'],['',''],trim($msg->Header->message_id,' ')),
          "uid" => str_replace(['>','<'],['',''],$msg->UID),
          "reply_to_id" => "",
          "reference_id" => "",
          "sender" => $msg->Sender,
          "from" => $msg->From,
          "to" => "",
          "cc" => "",
          "bcc" => "",
					"contacts" => $msg->From.";",
          "meta" => json_encode($msg->Subject->Meta, JSON_PRETTY_PRINT),
          "subject_original" => $msg->Subject->Full,
          "subject_stripped" => $msg->Subject->PLAIN,
					"body_original" => preg_replace("/\n\s+/", "\n", rtrim(html_entity_decode(strip_tags($msg->Body->Content)))),
					"body_unquoted" => preg_replace("/\n\s+/", "\n", rtrim(html_entity_decode(strip_tags($msg->Body->Unquoted)))),
          // "body_original" => strip_tags($msg->Body->Content),
          // "body_unquoted" => strip_tags($msg->Body->Unquoted),
          "attachments" => "",
        ];
        if(isset($msg->Header->in_reply_to)){ $message["reply_to_id"] = str_replace(['>','<'],['',''],$msg->Header->in_reply_to); }
        if(isset($msg->Header->references)){
          foreach(explode(' ',$msg->Header->references) as $reference){
            $message["reference_id"] .= trim($reference,',').";";
          }
          $message["reference_id"] = str_replace(['>','<'],['',''],trim($message["reference_id"],';'));
        }
        foreach($msg->To as $to){
          $message["to"] .= $to.";";
					$message["contacts"] .= $to.";";
        }
        $message["to"] = trim($message["to"],';');
        foreach($msg->CC as $cc){
          $message["cc"] .= $cc.";";
					$message["cc"] .= $to.";";
        }
        $message["cc"] = trim($message["cc"],';');
        foreach($msg->BCC as $bcc){
          $message["bcc"] .= $bcc.";";
					$message["bcc"] .= $to.";";
        }
        $message["bcc"] = trim($message["bcc"],';');
        $message["contacts"] = trim($message["contacts"],';');
				$messages = $this->Auth->query('SELECT * FROM `messages` WHERE `mid` = ?',$message["mid"])->fetchAll()->all();
				if(empty($messages)){
					if(isset($this->Settings['plugins']['files']['status']) && $this->Settings['plugins']['files']['status']){
						$API = new filesAPI();
		        foreach($msg->Attachments->Files as $file){
		          $file["isAttachment"] = "true";
		          $file["file"] = $file["attachment"];
		          $file["size"] = $file["bytes"];
		          $file["encoding"] = $file["encoding"];
		          $file["dirname"] = "";
		          $file["meta"] = "";
		          $file["type"] = "unknown";
		          if(isset($file["name"])){
		            $filename = explode('.',$file["name"]);
		            $file["type"] = end($filename);
		          } else { $file["name"] = null; }
		          if(isset($file["filename"])){
		            $filename = explode('.',$file["filename"]);
		            $file["type"] = end($filename);
		          } else { $file["filename"] = null; }
		          $fileID = $API->save($file);
		          if($fileID != null || $fileID != ''){ $message["attachments"] .= $fileID.";"; }
		        }
					}
	        $message["attachments"] = trim($message["attachments"],';');
	        $message["created"] = date("Y-m-d H:i:s");
	        $message["modified"] = date("Y-m-d H:i:s");
	        $message["owner"] = $this->Auth->User['id'];
	        $message["updated_by"] = $this->Auth->User['id'];
	        $messageID = $this->save($message);
					foreach(explode(';',$message["attachments"]) as $fileID){
						$this->createRelationship([
							'relationship_1' => 'messages',
							'link_to_1' => $messageID,
							'relationship_2' => 'files',
							'link_to_2' => $fileID,
						]);
					}
					if(isset($this->Settings['debug']) && $this->Settings['debug']){ echo "Saving MessageID: ".$message['mid']."\n"; }
				}
        $IMAP->delete($message['uid']);
      }
    }
  }

  protected function save($mail){
    $query = $this->Auth->query('INSERT INTO `messages` (
      `created`,
      `modified`,
      `owner`,
      `updated_by`,
      `account`,
      `folder`,
      `mid`,
      `uid`,
      `reply_to_id`,
      `reference_id`,
      `sender`,
      `from`,
      `to`,
      `cc`,
      `bcc`,
      `meta`,
      `subject_original`,
      `subject_stripped`,
      `body_original`,
      `body_unquoted`,
      `attachments`
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      $mail["created"],
      $mail["modified"],
      $mail["owner"],
      $mail["updated_by"],
      $mail["account"],
      $mail["folder"],
      $mail["mid"],
      $mail["uid"],
      $mail["reply_to_id"],
      $mail["reference_id"],
      strtolower($mail["sender"]),
      strtolower($mail["from"]),
      strtolower($mail["to"]),
      strtolower($mail["cc"]),
      strtolower($mail["bcc"]),
      $mail["meta"],
      $mail["subject_original"],
      $mail["subject_stripped"],
      $mail["body_original"],
      $mail["body_unquoted"],
      $mail["attachments"]
    );
    set_time_limit(20);
		$messageID = $query->dump()['insert_id'];
		if(isset($this->Settings['plugins']['contacts']['status']) && $this->Settings['plugins']['contacts']['status']){
			foreach(explode(';',$mail["contacts"]) as $email){
				$contact = $this->Auth->query('SELECT * FROM `contacts` WHERE `email` LIKE ?',$email)->fetchAll()->all();
				if(!empty($contact)){
					$this->createRelationship([
						'relationship_1' => 'messages',
						'link_to_1' => $messageID,
						'relationship_2' => 'contacts',
						'link_to_2' => $contact[0]['id'],
					]);
				} else {
					$contact['isActive'] = 'true';
					$contact['email'] = strtolower($email);
					$email = explode('@',$contact['email']);
					$contact['name'] = ucwords(str_replace('.',' ',str_replace('_',' ',$email[0])));
					$name = explode(' ',$contact["name"]);
					switch(count($name)){
						case 1:
							$contact['first_name'] = $name[0];
							break;
						case 2:
							$contact['first_name'] = $name[0];
							$contact['last_name'] = $name[1];
							break;
						default:
							$contact['first_name'] = $name[0];
							$contact['middle_name'] = $name[1];
							$contact['last_name'] = $name[2];
							break;
					}
					if(isset($this->Settings['plugins']['organizations']['status']) && $this->Settings['plugins']['organizations']['status']){
						$organization = $this->Auth->query('SELECT * FROM `organizations` WHERE `setDomain` LIKE ?',$email[1])->fetchAll()->all();
						if(!empty($organization)){
							$contact['organization'] = $organization[0]['id'];
							$this->createRelationship([
								'relationship_1' => 'messages',
								'link_to_1' => $messageID,
								'relationship_2' => 'organizations',
								'link_to_2' => $organization[0]['id'],
							]);
						}
					}
					$contactID = $this->Auth->create('contacts',$contact);
					if(isset($this->Settings['debug']) && $this->Settings['debug']){ echo "[".$contactID."]"."Contact Created: ".$contact['name']."\n"; }
					if(isset($this->Settings['plugins']['organizations']['status']) && $this->Settings['plugins']['organizations']['status']){
						if(isset($contact['organization'])){
							$this->createRelationship([
								'relationship_1' => 'organizations',
								'link_to_1' => $contact['organization'],
								'relationship_2' => 'contacts',
								'link_to_2' => $contactID,
							]);
						}
					}
					$this->createRelationship([
						'relationship_1' => 'messages',
						'link_to_1' => $messageID,
						'relationship_2' => 'contacts',
						'link_to_2' => $contactID,
					]);
				}
			}
		}
    return $messageID;
  }
}
