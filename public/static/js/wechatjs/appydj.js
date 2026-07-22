/*
* @Author: 赞木
* @Date:   2021-09-11 11:37:53
* @Last Modified by:   赞木
* @Last Modified time: 2022-09-21 08:38:30
*/
define('appydj', ['appsocket', 'wechatcore', 'jquery.shake'], function (appsocket, wechatcore, Shake) {
	var appydj = {
		rotateid: 0,
		gamestatus: 0,
		gametimererror: true,
		closerule: '2',
		isopening: false,
		statustip: ['摇奖还未开始', '摇奖开始了', '摇奖已结束', '暂无可用轮次'],
		init: function () {
			var self = this;
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					appsocket.isclose = false;
					wechatcore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					//$(".countNum b").text(data.gametime);
					self.closerule = window.localStorage.getItem("closeydjrule-" + XCV3Config.hdid);
					self.rotateid = data.rotateid;
					if (data.type == 'gameiswait') {
						self.gamestatus = 1;
						self.closerule != '1' && $(".game-rules").removeClass('hidden');
						self.changetip(self.statustip[0]);
						self.hidehandBox();
						self.isopening = false;
						//$('.prize_redenvelop').remove();
					} else {
						$(".game-rules").addClass('hidden');
						self.gamestatus = 2;
						self.gametimererror = true;
						setTimeout(function () {
							if (self.gamestatus == 2 && self.gametimererror) {
								self.changetip('当前轮次计时器存在异常，请到大屏重置');
							}
						}, 1.2e3);
						self.changetip(self.statustip[1]);
						self.showhandBox();
						if (!$('.prize_redenvelop').length) {
							self.isopening = false;
						}
					}
				} else if (data.type == 'needoauthopenid') {
					//抖音强制调到微信小程序参与红包雨
					wechatcore.ask('温馨提醒', '您需要同意微信授权才可以参与游戏', ['马上去授权', '拒绝授权'], function (index) {
						wechatcore.close(index);
						window.location.href = data.openlink;
					}, function (index) {
						wechatcore.close(index);
						wechatcore.msg('您已拒绝授权，无法参与游戏');
					});
				} else if (data.type == 'confirmoauthopenid') {
					if (data.userid == XCV3Config.userid) {
						wechatcore.msg('授权成功');
						setTimeout(function () {
							window.location.reload();
						}, 1e3);
					}
				} else if (data.type == 'gamenoround') {
					$(".game-rules").addClass('hidden');
					$('.prize_redenvelop').remove();
					$(".ydj-handbox").removeClass('hidden');
					self.changetip(self.statustip[3]);
					self.hidehandBox();
				} else if (data.type == 'gamestart') {
					self.gamestatus == 1 && self.changetip(self.statustip[1]);
				} else if (data.type == 'gameisdjs') {
					self.gamestatus = 2;
					if (!$(".ydj-handbox .hand").hasClass('handshake')) self.showhandBox();
					$(".game-rules").addClass('hidden');
					self.gametimererror = false;
					//$(".countNum b").text(data.djs);
					if (data.djs == 0) {
						self.gameend();
					}
				} else if (data.type == 'gameydjrefresh' || data.type == 'gameappydjrefresh') {
					appsocket.closeClient();
				} else if (data.type == 'gameshowphb') {

				} else if (data.type == 'gameiserror') {
					window.location.reload();
				} else if (data.type == 'addblack') {
					data.userid == XCV3Config.userid && WeixinJSBridge.call('closeWindow');
				} else if (data.type == 'goto') {
					wechatcore.goto(data);
				} else if (data.type == 'luckeruserids') {
					wechatcore.layerAsklucker(data);
				}
			};
			appsocket.init(params);
			self.bindEvent();
		},
		bindEvent: function () {
			var self = this;
			var myShakeEvent = new Shake({ threshold: 20 });
			myShakeEvent.start();
			$(window).on('shake', function () {
				if (self.gamestatus != '2') {
					return false;
				}
				if (self.isopening) {
					return false;
				}
				self.isopening = true;
				wechatcore.playAudio($('#shakeaudio')[0]);
				wechatcore.ajaxSubmit('/wechat/ydj/ydjopen', { rotateid: self.rotateid }, '正在努力加载..').then(function (data) {
					if (data.code == 0) {
						if (data.msg.prizetype == '1') {
							data.msg.txt = appgetaddress;
						} else {
							data.msg.prizename = "<b>" + data.msg.sendmoney + "</b>元";
							data.msg.txt = "已发放到您的微信钱包";
						}
						var packobj = $(wechatcore.tpl($("#prize-tpl"), data.msg));
						$("body").append(packobj);
						packobj.on('click', function (e) {
							var $target = $(e.target);
							if (!$target.closest('.luckerbox').length && !$target.is('.luckerbox')) {
								packobj.remove();
								self.isopening = false;
							}
						});
					} else if (data.code == 1) {
						self.isopening = false;
						wechatcore.msg(failtxt);
					} else {
						self.isopening = false;
						wechatcore.msg(data.msg);
					}
				}, function () {
					self.isopening = false;
					wechatcore.msg('姿势不对，啥也没摇到');
				});
			});
			$(".game-rules").on('click', function () {
				$('.game-rules').addClass('hidden');
				window.localStorage.setItem("closeydjrule-" + XCV3Config.hdid, '1');
			});
		},
		changetip: function (tips) {
			$(".ydj-tips").text(tips).removeClass('hidden');
		},
		gameend: function () {
			var self = this;
			self.gamestatus = 3;
			self.isopening = false;
			$('.prize_redenvelop').remove();
			$(".game-rules").addClass('hidden');
			self.changetip(self.statustip[2]);
			self.hidehandBox();
		},
		/*手型摇动*/
		showhandBox: function () {
			$(".ydj-handbox .hand").addClass('handshake');
		},
		/*关闭手型摇动*/
		hidehandBox: function () {
			$(".ydj-handbox .hand").removeClass('handshake');
		},
	};
	return appydj;
});