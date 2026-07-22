<?php
/*
 $ @Author: 赞木
 $ @Company: 株洲米波网络科技有限公司
 $ @Project: 米波现场v3
 $ @Date: 2025-02-25 13:07:23
 $ @LastEditors: 赞木
 $ @LastEditTime: 2025-05-06 17:21:53
 $ @Link: 公司官网地址:https://miboxianchang.cn
 $ @Copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */

use support\Request;
use Webman\Route;

Route::fallback(function (Request $request, $status) {
    $map = [
        400 => '400 Bad Request',
        404 => '404 not found',
        405 => '405 method not allowed',
    ];
    $uri = $request->uri();
    $routes = explode("/", $uri);
    $route1 = $routes[1] ?? [];
    $autogo = true;
    if (in_array($route1, ['wechat', 'screen'])) {
        $autogo = false;
    }
    $title = $map[$status] ?? '404 not found';
    if ($request->expectsJson()) {
        return showJsonData(-1, $title);
    }
    if ($route1 == 'wechat') {
        return redirect(gowechat('', ['hdid' => $request->input('hdid', '')]));
    }
    return view('404', ['title' => $title, 'autogo' => $autogo])->withStatus($status);
});
