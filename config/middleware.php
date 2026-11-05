<?php
/*
 $ @Author: 赞木
 $ @Company: 株洲米波网络科技有限公司
 $ @Project: 米波现场v3
 $ @Date: 2025-02-26 13:54:50
 $ @LastEditors: 赞木
 $ @LastEditTime: 2025-03-07 22:13:39
 $ @Link: 公司官网地址:https://miboxianchang.cn
 $ @Copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */


return [
     '' => [
          app\middleware\RequestLog::class,
          app\middleware\RedisLog::class,
          app\middleware\GlobalCheck::class,
     ],
     'common' => [
          app\middleware\CommonCheck::class,
     ],
     'web' => [
          app\middleware\WebCheck::class,
          app\middleware\LivemarkJudgeScoreVisibilityMiddleware::class,
          app\middleware\LivemarkDeductionScoreVisibilityMiddleware::class,
     ],
     'myhd' => [
          app\middleware\MyhdCheck::class,
     ],
     'myhome' => [
          app\middleware\MyhomeCheck::class,
     ],
     'hdmanage' => [
          app\middleware\HdmanageCheck::class,
          app\middleware\HbwallPrizeImportQuantityMiddleware::class,
          app\middleware\LivemarkJudgeScoreVisibilityMiddleware::class,
          app\middleware\LivemarkDeductionScoreVisibilityMiddleware::class,
     ],
     'screen' => [
          app\middleware\ScreenCheck::class,
     ],
     'wechat' => [
          app\middleware\WechatCheck::class,
     ],
];
