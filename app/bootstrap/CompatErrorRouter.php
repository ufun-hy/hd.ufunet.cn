<?php
/*
 $ @Author: 赞木
 $ @Company: 株洲米波网络科技有限公司
 $ @Project: 米波现场v3
 $ @Date: 2026-10-24 21:08:45
 $ @LastEditors: 赞木
 $ @LastEditTime: 2026-10-24 21:08:55
 $ @Link: 公司官网地址:https://miboxianchang.cn
 $ @Copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */

namespace app\bootstrap;

use Webman\Bootstrap;
use Workerman\Worker;

class CompatErrorRouter implements Bootstrap
{
    public static function start(?Worker $worker)
    {
        set_error_handler(function ($level, $message, $file = '', $line = 0) {
            if (!(error_reporting() & $level)) {
                return false;
            }
            if ($level & (E_DEPRECATED | E_USER_DEPRECATED)) {
                error_log(
                    "[E_DEPRECATED] $message ($file:$line)\n",
                    3,
                    base_path() . '/runtime/logs/deprecation.log'
                );
                return true;
            }
            throw new \ErrorException($message, 0, $level, $file, $line);
        });
    }
}
