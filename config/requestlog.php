<?php
/*
 $ @Author: 赞木
 $ @Company: 株洲米波网络科技有限公司
 $ @Project: 米波现场v3
 $ @Date: 2025-03-07 21:26:16
 $ @LastEditors: 赞木
 $ @LastEditTime: 2025-03-09 10:12:07
 $ @Link: 公司官网地址:https://miboxianchang.cn
 $ @Copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */
return [
    'enable' => false,
    'dontReport' => [
        'app' => [
            'adminapi',
            'api',
            'common',
            'hdmanage',
            'myhd',
            'myhome',
            'screen',
            'web',
            'wechat',
            'wechatspecial'
        ],
        'controller' => [],
        'action' => [],
        'path' => []
    ],
    'channel' => 'request'
];
