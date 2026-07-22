<?php
return [
	'lanip'=>'192.168.0.103',
	'registeraddress'=>'192.168.0.103:1238',
	'text_registeraddress'=>'text://192.168.0.103:1238',
	'host'=>'websocket.ufunet.cn',
	'port'=>'8001',
	'certpath'=>'/www/server/panel/vhost/cert/websocket.ufunet.cn/fullchain.pem',
	'keypath'=>'/www/server/panel/vhost/cert/websocket.ufunet.cn/privkey.pem',
	'workernum'=>((int)shell_exec('nproc') > 0 ? (int)shell_exec('nproc') : 4),
	'connecthosts'=>[],
];
