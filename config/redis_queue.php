<?php
return [
    'default' => [
        'host' => 'redis://192.168.0.103:6379',
        'options' => [
            'auth' => 'ufun168',     // 密码，可选参数
            'db' => 0,      // 数据库
            'max_attempts'  => 5, // 消费失败后，重试次数
            'retry_seconds' => 5,
            'wait_timeout' => 7200, // 重试间隔，单位秒
         ]
    ],
];