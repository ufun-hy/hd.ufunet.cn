<?php
/*
 $ @Author: 赞木
 $ @Company: 株洲米波网络科技有限公司
 $ @Project: 米波现场v3
 $ @Date: 2025-02-26 10:59:07
 $ @LastEditors: 赞木
 $ @LastEditTime: 2025-03-14 10:12:03
 $ @Link: 公司官网地址:https://miboxianchang.cn
 $ @Copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */

use Webman\GatewayWorker\Gateway;
use Webman\GatewayWorker\BusinessWorker;
use Webman\GatewayWorker\Register;
use app\common\service\common\gatewayService;

$config = [
    'gateway' => [
        'handler'     => Gateway::class,
        'listen'      => 'websocket://0.0.0.0:' . config('websocket.port', '8001'),
        'count'       => cpu_count(),
        'reloadable'  => false,
        'host' => config('websocket.host'),
        'transport'  => 'ssl',
        'context'    => [
            'ssl' => [
                'local_cert'  => config('websocket.certpath'),
                'local_pk'    => config('websocket.keypath'),
                'verify_peer' => false,
                'allow_self_signed' => true,
            ]
        ],
        'constructor' => [
            'config' => [
                'lanIp'           => gatewayService::serverInnerip(),
                'startPort'       => config('websocket.startPort', 4220),
                'pingInterval'    => 12,
                'pingNotResponseLimit' => 1,
                'pingData'        => '{"type":"ping"}',
                'registerAddress' => config('websocket.registeraddress'),
                'onConnect'       => function () {
                },
            ]
        ]
    ],
    'worker' => [
        'handler'     => BusinessWorker::class,
        'count'       => cpu_count() * 2,
        'constructor' => [
            'config' => [
                'eventHandler'    => plugin\webman\gateway\Events::class,
                'name'            => 'ChatBusinessWorker',
                'registerAddress' => config('websocket.registeraddress'),
            ]
        ]
    ],    
];
if(gatewayService::registerEnable()){
    $config['register'] = [
        'handler'     => Register::class,
        'listen'      => config('websocket.text_registeraddress'),
        'count'       => 1,
        'reloadable'  => false,
        'constructor' => []
    ];
}
return $config;
