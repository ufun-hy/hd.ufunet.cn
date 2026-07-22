<?php
/*
 $ @Author: 赞木
 $ @Company: 株洲米波网络科技有限公司
 $ @Project: 米波现场v3
 $ @Date: 2025-02-26 10:59:07
 $ @LastEditors: 赞木
 $ @LastEditTime: 2025-03-13 16:50:01
 $ @Link: 公司官网地址:https://miboxianchang.cn
 $ @Copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */
return [
    'default' => [
        'host' => config('redis_queue.default.host', 'redis://127.0.0.1:6379'),
        'options' => [
            'auth' => config('redis_queue.default.options.auth', ''),
            'db' => config('redis_queue.default.options.db', 0),
            'prefix' => config('redis_queue.default.options.prefix', ''),
            'max_attempts'  => config('redis_queue.default.options.max_attempts', 5),
            'retry_seconds' => config('redis_queue.default.options.retry_seconds', 5),
            'wait_timeout' => config('redis_queue.default.options.wait_timeout', 7200),
        ]
    ],
];
