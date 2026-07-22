<?php
/*
 $ @Author: 赞木
 $ @Company: 株洲米波网络科技有限公司
 $ @Project: 米波现场v3
 $ @Date: 2025-02-25 13:07:23
 $ @LastEditors: 赞木
 $ @LastEditTime: 2025-02-25 19:35:44
 $ @Link: 公司官网地址:https://miboxianchang.cn
 $ @Copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */

use app\common\service\common\redisqueueService;

return [
    'enable' => redisqueueService::QueueEnable(),
];
