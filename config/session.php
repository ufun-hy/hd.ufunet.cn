<?php
/*
 $ @Author: 赞木
 $ @Company: 株洲米波网络科技有限公司
 $ @Project: 米波现场v3
 $ @Date: 2025-02-25 13:07:23
 $ @LastEditors: 赞木
 $ @LastEditTime: 2025-03-13 16:51:00
 $ @Link: 公司官网地址:https://miboxianchang.cn
 $ @Copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */


use Webman\Session\FileSessionHandler;
use Webman\Session\RedisSessionHandler;
use Webman\Session\RedisClusterSessionHandler;

return [

    'type' => 'redis',

    'handler' => RedisSessionHandler::class,

    'config' => [
        'file' => [
            'save_path' => runtime_path() . '/sessions',
        ],
        'redis' => [
            'host' => config('redis.default.host'),
            'port' => config('redis.default.port'),
            'auth' => config('redis.default.password'),
            'timeout' => 2,
            'database' => config('redis.default.database'),
            'prefix' => 'xcv3:session:',
        ],
        'redis_cluster' => [
            'host' => ['127.0.0.1:7000', '127.0.0.1:7001', '127.0.0.1:7001'],
            'timeout' => 2,
            'auth' => '',
            'prefix' => 'xcv3:session:',
        ]
    ],

    'session_name' => 'PHPSID',

    'auto_update_timestamp' => false,

    'lifetime' => 2 * 24 * 60 * 60,

    'cookie_lifetime' => 2 * 24 * 60 * 60,

    'cookie_path' => '/',

    'domain' => '',

    'http_only' => true,

    'secure' => false,

    'same_site' => '',

    'gc_probability' => [1, 1000],

];
