<?php

/**
 * @Author: 赞木
 * @Company: 株洲米波网络科技有限公司
 * @Project: 米波现场v3
 * @Date:   2023-06-18 21:48:39
 * @link: 公司官网地址:https://miboxianchang.cn
 * @copyright: 本软件归株洲米波网络科技有限公司所有，非法渠道获得本系统或者未经授权使用本系统将依法追究当事人或公司法律责任
 */
namespace app\api\controller;
use support\Request;
use EasyWeChat\OpenPlatform\Server\Guard;
use app\common\service\web\userwxaccountService;
use app\common\service\web\userService;
use app\common\service\web\huodongService;
use app\common\service\common\wxbasicService;
use app\common\service\common\hdsceneService;
use app\common\service\common\hdminisceneService;
use EasyWeChat\Kernel\Messages\News;
use EasyWeChat\Kernel\Messages\NewsItem;
class openwechat{
	public function ticket(Request $request){
		$openPlatform = wxbasicService::getopenplatform();
		$server = $openPlatform->server;
		//授权
	    $server->push(function ($message) {
			userwxaccountService::authorized($message['AuthorizerAppid'],'1');
	    }, Guard::EVENT_AUTHORIZED);
	    // 处理授权更新事件
		$server->push(function ($message) {
		    
		}, Guard::EVENT_UPDATE_AUTHORIZED);
		//取消授权
		$server->push(function ($message) {
		   userwxaccountService::authorized($message['AuthorizerAppid'],'2');
		}, Guard::EVENT_UNAUTHORIZED);
		try{
			$response = $server->serve();
        	return $response->getContent();
		} catch (\Throwable $e) {
	    	echo "开放平台授权接入出现异常：".$e->getMessage()."\n";
	    	return response('success');
        }
	}
	public function message(Request $request){
		$appid = $request->get('appid','');
		if(!empty($appid)){
			$appid = str_replace('/','',$appid);
	        if(in_array($appid, [ 'wx570bc396a51b8ff8', 'wx9252c5e0bb1836fc', 'wx8e1097c5bc82cde9', 'wx14550af28c71a144', 'wxa35b9c23cfe664eb' ])){
	            return self::releaseToNetWork($appid);
	        }
			$result = wxbasicService::getOpenofficialAccountByappid($appid);
			if(!is_error($result)){
				try{
					$server = $result['msg']->server;
					$server->push(function ($message) use($appid,$request){
						if($message['MsgType']=='text'){
							$wxaccount = userwxaccountService::getwxaccountbyAppid($appid);
							if(!empty($wxaccount)){
								$hdconfig = huodongService::gethdkeyword($wxaccount['id'],$message['Content']);
								if(!empty($hdconfig)){
									return self::initkeywordconfig([
										'keywordconfig'=>$hdconfig['keywordconfig']??'',
										'hdid'=>$hdconfig['id']??'',
										'codehdid'=>$hdconfig['hdid'],
										'qrtype'=>$hdconfig['qrtype']??'1',
										'qrtypereplytype'=>$hdconfig['qrtypereplytype']??'1'
									]);
								}
							}
						}elseif($message['MsgType']=='event'){
							//直接扫公众号二维码或扫带参二维码
							if(in_array($message['Event'], ['subscribe','SCAN'])){
								$wxaccount = userwxaccountService::getwxaccountbyAppid($appid);
								if(!empty($wxaccount)){
									if($wxaccount['status'] != '1'){
										return null;
									}
									if(!isset($message['EventKey']) || empty($message['EventKey'])){
										//扫公众号二维码关注公众号是否核实活动设置了关注回复？
										$hdconfig = huodongService::gethdkeywordbyopensubreturn($wxaccount['id']);
										if(!empty($hdconfig)){
											return self::initkeywordconfig([
												'keywordconfig'=>$hdconfig['keywordconfig']??'',
												'hdid'=>$hdconfig['id']??'',
												'codehdid'=>$hdconfig['hdid'],
												'qrtype'=>$hdconfig['qrtype']??'1',
												'qrtypereplytype'=>$hdconfig['qrtypereplytype']??'1'
											]);
										}
									}else{
										//扫带参二维码关注 1 活动设置了强制关注公众号跳转到生成的带参二维码 2 旧版的活动二维码与链接里那个带参二维码 (目前已弃用)
										if(strexists($message['EventKey'],'mibov3hdforecesceneid_')){
											//旧版 扫活动二维码与链接里的默认带参二维码
											if(strexists($message['EventKey'],'qrscene_mibov3hdforecesceneid_')){
												$sceneid = str_replace('qrscene_mibov3hdforecesceneid_', '', $message['EventKey']);
											}else{
												$sceneid = str_replace('mibov3hdforecesceneid_', '', $message['EventKey']);
											}
											if(!empty($sceneid)){
												$authkey = config('authkey.authkey','');
												$scenedata = explode('_', $sceneid);
												$sceneauthkey = $scenedata[0]??'';
												$hdid = $scenedata[1]??'';
												if(!empty($hdid) && !empty($sceneauthkey) && $sceneauthkey === $authkey){
													$hdconfig = huodongService::gethd(huodongService::gethdcodeid($hdid));
													if(!empty($hdconfig)){
														return self::initkeywordconfig([
															'keywordconfig'=>$hdconfig['keywordconfig']??'',
															'hdid'=>$hdid,
															'codehdid'=>$hdconfig['hdid'],
															'qrtype'=>$hdconfig['qrtype']??'1',
															'qrtypereplytype'=>$hdconfig['qrtypereplytype']??'1'
														]);
													}
												}
											}
										}elseif(strexists($message['EventKey'],'mibov3hdsceneid_')){
											//新版 扫活动单个功能的带参二维码则触发单个功能参与链接
											if(strexists($message['EventKey'],'qrscene_mibov3hdsceneid_')){
												$sceneid = str_replace('qrscene_mibov3hdsceneid_', '', $message['EventKey']);
											}else{
												$sceneid = str_replace('mibov3hdsceneid_', '', $message['EventKey']);
											}
											if(!empty($sceneid)){
												$authkey = config('authkey.authkey','');
												$scenedata = explode('_', $sceneid);
												$sceneauthkey = $scenedata[0]??'';
												$hdid = $scenedata[1]??'';
												$module = $scenedata[2]??'';
												if(!empty($hdid) && !empty($module) && !empty($sceneauthkey) && $sceneauthkey === $authkey){
													$codehdid = huodongService::gethdcodeid($hdid);
													$hdconfig = huodongService::gethd($codehdid);
													if(!empty($hdconfig)){
														$result = hdsceneService::getscene([
															'appid'=>$appid,
															'hdid'=>$hdid,
															'module'=>$module
														]);
														if(!empty($result)){
															$url = gowechat("index",['hdid'=>$codehdid],'1');
															if(!empty($module)){
																$url = gowechat("{$module}/index",['hdid'=>$codehdid],'1');
															}
															$message = self::returnMessage([
																'type'=>$result['type']??'',
																'title'=>$result['title']??'',
														        'description'=>$result['description']??'',
														        'url'=>$url,
														        'image'=>$result['image']??'',
														        'qrtype'=>$hdconfig['qrtype']??'1',
														        'qrtypereplytype'=>$hdconfig['qrtypereplytype']??'1',
														        'hdid'=>$hdid,
														        'module'=>$module,
															]);
															if($message) return $message;
														}
													}
												}
											}
										}elseif(strexists($message['EventKey'],'mibov3binduserwx_')){
											//绑定或者修改后台个人中心登录微信号
											if(strexists($message['EventKey'],'qrscene_mibov3binduserwx_')){
												$useridstr = str_replace('qrscene_mibov3binduserwx_', '', $message['EventKey']);
											}else{
												$useridstr = str_replace('mibov3binduserwx_', '', $message['EventKey']);
											}
											if(!empty($useridstr)){
												$authkey = config('authkey.authkey','');
												$useridarr = explode('_', $useridstr);
												if(!empty($useridarr) && count($useridarr)==2 && isset($useridarr[0]) && $useridarr[0]==$authkey){
													$result = userService::changeuseropenid($useridarr[1]??'','user_openid',$message['FromUserName']);
													if(is_error($result)){
														return $result['msg'];
													}else{
														return '绑定成功';
													}
												}
											}
										}elseif(strexists($message['EventKey'],'mibov3wxlogin_')){
											//后台注册或者微信登录
											/*
											1 如果扫码过来发现openid已经绑定了userid则直接登录
											2 如果openid未绑定userid
											则要其输入手机号和验证码
											A 如果手机号已经注册则检查该user是否绑定了openid 未绑定则登录成功 绑定了则提示已经绑定了别人
											B 如果手机号未在注册用户内使用则  重新注册一个账号 并且关联openid后 再自动登录
											*/
											if(strexists($message['EventKey'],'qrscene_mibov3wxlogin_')){
												$sidstr = str_replace('qrscene_mibov3wxlogin_', '', $message['EventKey']);
											}else{
												$sidstr = str_replace('mibov3wxlogin_', '', $message['EventKey']);
											}
											if(!empty($sidstr)){
												$authkey = config('authkey.authkey','');
												$sidarr = explode('_', $sidstr);
												if(!empty($sidarr) && count($sidarr)==2 && isset($sidarr[0]) && $sidarr[0]==$authkey){
													$result = userService::openidtouser($message['FromUserName'],$sidarr[1]??'');
													if(is_error($result)){
														if($result['code']==-1){
															return $result['msg'];
														}else{
															return '首次微信扫码登录需绑定您的手机号';
														}
													}
													return '登录成功';
												}
											}
										}
									}
								}
							}elseif(in_array($message['Event'], ['subscribe_msg_popup_event','subscribe_msg_change_event','subscribe_msg_sent_event'])){
								//订阅通知事件推送 20230216改成通过网页js处理 删除了本处处理
							}
						}
						return null;
					});
					$response = $server->serve();
			        return $response->getContent();
			    } catch (\Throwable $e) {
			    	echo "公众号消息响应出现异常：".$e->getMessage()."\n";
		        }
			}
		}
		return response('');	
	}
	public static function initkeywordconfig($params=[]){
		$keywordconfig = $params['keywordconfig']??'';
		if(empty($keywordconfig)){
			return null;
		}
		$url = $keywordconfig['url']??'';
		$module = '';
		if(empty($url)){
			$module = 'index';
			$url = gowechat('index',['hdid'=>$params['codehdid']??''],'1');
		}
		$type = $keywordconfig['type']??'1';
		if($type=='1'){
			$title = $keywordconfig['text']??'';
		}elseif($type=='2'){
			$title = $keywordconfig['title']??'';
		}
		$message = self::returnMessage([
			'type'=>$type,
			'title'=>$title,
	        'description'=>$keywordconfig['des']??'',
	        'url'=>$url,
	        'image'=>(isset($keywordconfig['icon']) && !empty($keywordconfig['icon'])) ? tomedia($keywordconfig['icon']) : '',
	        'qrtype'=>$params['qrtype']??'1',
	        'qrtypereplytype'=>$params['qrtypereplytype']??'1',
	        'hdid'=>$params['hdid']??'',
	        'module'=>$module,
		]);
		if($message) return $message;
	}
	public static function returnMessage($params=[]){
		$type = $params['type']??'1';
		if(!in_array($type, ['1','2'])){
			return false;
		}
		$title = $params['title']??'点击参与互动';
		if(empty($title)){
			$title = '点击参与互动';
		}
		$url = $params['url']??'';
		if($type=='1'){
			$miniappid = '';
			$path = '';
			$qrtype = $params['qrtype']??'1';
			$qrtypereplytype = $params['qrtypereplytype']??'1';
			if($qrtype == '2' && $qrtypereplytype == '2'){
				$wxmini = huodongService::getsyshdconfig('mini');
				if(!empty($wxmini) && isset($wxmini['open']) && $wxmini['open']=='1'){
					$miniappid = $wxmini['app_id']??'';
				}
				if(!empty($miniappid)){
					$module = $params['module']??'';
					if(empty($module)){
						if(!empty($url)){
							if(strexists($url,'hdid=') && strexists($url,'/wechat/')){
								$parsearr = parse_url($url);
								$module = $parsearr['path']??'';
								if(!empty($module)){
									$module = str_replace('/wechat/', '', $module);
									$module = str_replace('/index', '', $module);
								}
							}
						}else{
							$module = 'index';
						}
					}else{
						$module = $params['module'];
					}
					if(!empty($module)){
						$sysmodules = huodongService::sysmodules();
						$nomenumodules = huodongService::nomenumodules();
						if($module=='index' || ( in_array($module, $sysmodules) && !in_array($module, $nomenumodules) ) ){
							$miniscene = hdminisceneService::makescene([
								'hdid'=>$params['hdid']??'',
								'appid'=>$miniappid,
								'module'=>$module,
							]);
							if(!is_error($miniscene)){
								$path = $miniscene['msg']['path']??'';
							}

						}
					}
				}
			}
			if(!empty($miniappid) && !empty($path)){
				return "<a data-miniprogram-appid='{$miniappid}' data-miniprogram-path='{$path}' href='{$url}' data-miniprogram-type='text'>{$title}</a>";
			}else{
				return "<a href='{$url}'>{$title}</a>";
			}
		}else{
			return new News([
			    new NewsItem([
			        'title'=>$title,
			        'description'=>$params['description'],
			        'url'=>$url,
			        'image'=>$params['image'],
			    ]),
			]); 
		}
	}
	/*全网发布响应*/
	public static function releaseToNetWork($authorizer_appid=''){
		try{
			$openPlatform = wxbasicService::getopenplatform();
			$message = $openPlatform->server->getMessage();
	        //返回API文本消息
	        if ($message['MsgType'] == 'text' && strpos($message['Content'], "QUERY_AUTH_CODE:") !== false) {
	            $auth_code = str_replace("QUERY_AUTH_CODE:", "", $message['Content']);
	            $authorization = $openPlatform->handleAuthorize($auth_code);
	            $official_account_client = $openPlatform->officialAccount($authorizer_appid, $authorization['authorization_info']['authorizer_refresh_token']);
	            $content = $auth_code . '_from_api';
	            $official_account_client['customer_service']->send([
	                'touser' => $message['FromUserName'],
	                'msgtype' => 'text',
	                'text' => [
	                    'content' => $content
	                ]
	            ]);
	            //返回普通文本消息
	        } elseif ($message['MsgType'] == 'text' && $message['Content'] == 'TESTCOMPONENT_MSG_TYPE_TEXT') {
	            $official_account_client = $openPlatform->officialAccount($authorizer_appid);
	            $official_account_client->server->push(function ($message) {
	                return $message['Content'] . "_callback";
	            });
	            //发送事件消息
	        } elseif ($message['MsgType'] == 'event') {
	            $official_account_client = $openPlatform->officialAccount($authorizer_appid);
	            $official_account_client->server->push(function ($message) {
	                return $message['Event'] . 'from_callback';
	            });
	        }
	        $response = $official_account_client->server->serve();
	        return $response->getContent();
	    } catch (\Throwable $e) {
	    	echo "全网发布响应出现异常：".$e->getMessage()."\n";
	    	return response('');
        }
	}
}
