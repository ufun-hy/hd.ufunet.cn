<?php
/*
 $ @Author: 赞木
 $ @Company: 株洲米波网络科技有限公司
 $ @Project: 米波现场v3
 $ @Date: 2025-02-25 13:07:23
 $ @LastEditors: 赞木
 $ @LastEditTime: 2025-03-07 22:12:23
 $ @Link: 公司官网地址:https://miboxianchang.cn
 $ @Copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */

return [
    'default' => [
        'handlers' => [
            [
                'class' => Monolog\Handler\RotatingFileHandler::class,
                'constructor' => [
                    '/var/log/mibo/log.log',
                    7,
                    Monolog\Logger::DEBUG,
                ],
                'formatter' => [
                    'class' => Monolog\Formatter\LineFormatter::class,
                    'constructor' => [null, 'Y-m-d H:i:s', true],
                ],
            ]
        ],
    ],
    'request' => [
        'handlers' => [
            [
                'class' => Monolog\Handler\RotatingFileHandler::class,
                'constructor' => [
                    '/var/log/mibo/request.log',
                    7,
                    Monolog\Logger::DEBUG,
                ],
                'formatter' => [
                    'class' => Monolog\Formatter\LineFormatter::class,
                    'constructor' => [null, 'Y-m-d H:i:s', true],
                ],
            ]
        ],
    ],
    'redis' => [
        'handlers' => [
            [
                'class' => Monolog\Handler\RotatingFileHandler::class,
                'constructor' => [
                    '/var/log/mibo/redis.log',
                    7,
                    Monolog\Logger::DEBUG,
                ],
                'formatter' => [
                    'class' => Monolog\Formatter\LineFormatter::class,
                    'constructor' => [null, 'Y-m-d H:i:s', true],
                ],
            ]
        ],
    ],
    'sql' => [
        'handlers' => [
            [
                'class' => Monolog\Handler\RotatingFileHandler::class,
                'constructor' => [
                    '/var/log/mibo/sql.log',
                    7,
                    Monolog\Logger::DEBUG,
                ],
                'formatter' => [
                    'class' => Monolog\Formatter\LineFormatter::class,
                    'constructor' => [null, 'Y-m-d H:i:s', true],
                ],
            ]
        ],
    ],
];
