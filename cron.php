<?php

require_once dirname(__FILE__,3).'/plugins/messages/api.php';

$API = new messagesAPI();

$cron = $API->getMail("webman-02.albcie.com","993","SSL","customs@albcie.com","oBRYU!xchoh3A");

if((isset($this->Settings['debug']))&&($this->Settings['debug'])&&($cron!=null)){ echo json_encode($cron, JSON_PRETTY_PRINT); }
