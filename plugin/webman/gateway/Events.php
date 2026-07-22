<?php
/*
 $ @Author: 赞木
 $ @Company: 株洲米波网络科技有限公司
 $ @Project: 米波现场v3
 $ @Date: 2025-02-26 13:54:50
 $ @LastEditors: 赞木
 $ @LastEditTime: 2025-04-11 18:21:56
 $ @Link: 公司官网地址:https://miboxianchang.cn
 $ @Copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */

namespace plugin\webman\gateway;

use GatewayWorker\Lib\Gateway;
use app\common\service\common\gamerotateService;

class Events
{
    public static function onWorkerStart($worker)
    {
    }

    public static function onConnect($client_id)
    {
        Gateway::sendToClient($client_id, json_encode([
            'type' => 'connected',
            'clientid' => $client_id
        ]));
    }

    public static function onWebSocketConnect($client_id, $data)
    {
    }

    public static function onMessage($client_id, $message)
    {
        $message = @json_decode($message, true);
        if (empty($message)) {
            return false;
        }
        $gametype = $message['type'] ?? '';
        if (!empty($gametype) && $gametype != 'ping') {
            if ($gametype == 'dzqydraw') {
                $message['type'] = 'gamedata';
                $group = "dzqy:{$message['hdid']}:{$message['rotateid']}";
                Gateway::sendToUid($group, json_encode($message));
            } elseif ($gametype == 'mouseup') {
                $message['type'] = 'mouseupdata';
                $group = "mouse{$message['hdid']}";
                Gateway::sendToGroup($group, json_encode($message));
            } else {
                gamerotateService::updateMyGameScore($message);
            }
        }
    }

    public static function onClose($client_id)
    {
    }
}
