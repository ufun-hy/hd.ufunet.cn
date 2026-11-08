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
use support\Redis;
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
                /*
                20260927修复：打地鼠大屏多开后手机端老鼠越冒越多
                每块屏各自跑mouseUp定时器并上报mouseup 本处原样全量转发给mouse{hdid}组(手机端)
                N块屏=N个生成源 手机端老鼠频率N倍叠加 大屏本身只渲染本地动画不受影响
                选主去重(方案A)：每个活动同一时刻只认一块"主屏"的mouseup转发 其余丢弃
                  无主/主过期→首个上报者当选并写5秒租约；主屏每次上报续期租约
                  主屏被关/断线后租约最长5秒过期 其他屏自动接管(期间手机端老鼠短暂停冒可接受)
                大屏允许多开的语义不变：各屏本地动画照跑 仅ws上报流去重
                直接裸Redis+Lua原子操作 不走cacheService(双层本地缓存跨进程读旧主会双主)
                */
                $masterkey = 'xcv3:mousemaster:' . $message['hdid'];
                $masterttl = 5;
                $isMaster = Redis::eval(
                    "local cur = redis.call('get', KEYS[1])
                    if not cur then
                        redis.call('set', KEYS[1], ARGV[1], 'EX', tonumber(ARGV[2]))
                        return 1
                    end
                    if cur == ARGV[1] then
                        redis.call('expire', KEYS[1], tonumber(ARGV[2]))
                        return 1
                    end
                    return 0",
                    1,
                    $masterkey,
                    $client_id,
                    $masterttl
                );
                if (!$isMaster) {
                    return false;
                }
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
