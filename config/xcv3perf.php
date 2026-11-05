<?php
    return [
        'enable' => true,   //总开关 必须为true下面各项才可能生效
        'memo'   => true,   //请求级去重 同一次请求内同key只读一次redis(最安全 建议先开)
        'local'  => true,   //进程级微缓存 白名单key在常驻进程内缓存localttl秒(收益最大 但其他进程
                            //  最长localttl秒才感知写操作 后台改配置前台延迟生效属预期)
        'warm'   => [       //mget预取 把注定要读的一批key合成1次往返(只减往返 不改变读取结果)
            'wechat' => true, //微信端三轮
            'screen' => true, //大屏端两轮
        ],                  //也可写成 'warm' => true 一次性开两端
        'localttl' => 3,    //微缓存秒数 仅local=true时有效 反馈"前台要等3秒"就调1
        'rebuild' => [      //remember回源期抑制回调内对同一个key的写(20260929新增)
            'skipwrite' => true, //消除"回调写一次+remember收尾再写一次"的多余UNLINK/SETEX
                                 //仅抑制与正在重建的key相同的key 回调内写其它key(如奖品队列)照常执行
                                 //关掉即退回改造前行为(每个脏回调各写各的) 可一键回退
        ],
        'gray'   => [       //灰度 空数组=全部生效 填了则仅命中的host/hdid生效 只做收窄不能反向开启
            'hosts' => [],  //域名 形如'zam.example.com'
            'hdids' => [],  //活动id 加密id(URL里的hdid参数)或数字id均可 取不到则视为未命中
                            //注意：一旦按hdids配置灰度 取不到活动id的请求(如纯后台/静态页)这三项优化都不生效
        ],
    ];