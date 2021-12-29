<?php

require_once dirname(__FILE__,3).'/plugins/messages/api.php';

$API = new messagesAPI();

if(isset($this->Settings['plugins']['messages']['settings']['accounts']) && is_array($this->Settings['plugins']['messages']['settings']['accounts']) && !empty($this->Settings['plugins']['messages']['settings']['accounts'])){
  foreach($this->Settings['plugins']['messages']['settings']['accounts'] as $account){
    if(isset($this->Settings['debug']) && $this->Settings['debug']){ echo "[".$fileID."]File saved\n"; }
    $cron = $API->getMail($account['host'],$account['port'],$account['encryption'],$account['username'],$account['password']);
  }
}
