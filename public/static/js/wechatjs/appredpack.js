/*
* @Author: 赞木
* @Date:   2021-07-31 11:02:56
* @Last Modified by:   赞木
* @Last Modified time: 2022-05-24 16:51:01
*/
define('appredpack', ['appsocket', 'wechatcore'], function (appsocket, wechatcore) {
	var appredpack = {
		rotateid: 0,
		gamestatus: 0,
		gametimererror: true,
		statustip: ['游戏还未开始', '游戏开始了', '游戏已结束', '暂无可用轮次'],
		droptimer: null,
		droptypes: [1, 2, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 7],
		dropanitimes: [2600, 2400, 2300, 2200, 2100, 2000, 1900],
		init: function () {
			var self = this;
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					appsocket.isclose = false;
					wechatcore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					$(".countNum b").text(data.gametime);
					$('.money_redenvelop,.prize_redenvelop').remove();
					self.rotateid = data.rotateid;
					if (data.type == 'gameiswait') {
						self.gamestatus = 1;
						$('.money_redenvelop,.prize_redenvelop').addClass('hidden');
						self.stopdrop();
						$(".game-wait").removeClass('hidden');
						self.changetip(self.statustip[0]);
					} else {
						$(".game-wait").addClass('hidden');
						self.gamestatus = 2;
						self.gametimererror = true;
						setTimeout(function () {
							if (self.gamestatus == 2 && self.gametimererror) {
								self.stopdrop();
								self.changetip('当前轮次计时器存在异常，请到大屏重置');
							} else {
								self.startdrop();
							}
						}, 1.2e3);
						self.changetip(self.statustip[1]);
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
					$(".game-wait").addClass('hidden');
					$('.money_redenvelop,.prize_redenvelop').remove();
					self.changetip(self.statustip[3]);
				} else if (data.type == 'gamestart') {
					self.gamestatus == 1 && self.startdrop();
				} else if (data.type == 'gameisdjs') {
					self.gamestatus = 2;
					$(".game-wait,.game-status").addClass('hidden');
					self.gametimererror = false;
					$(".countNum b").text(data.djs);
					data.djs == 0 && self.gameend();
				} else if (data.type == 'gameredpackrefresh' || data.type == 'gameappredpackrefresh') {
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
			var isopening = false;
			$(".redenvelop_list").on('click', 'li', function () {
				if (isopening) return;
				isopening = true;
				$("body").append(wechatcore.tpl($("#onehb-tpl"), {}));
			});
			$("body").on('click', '.one_redenvelop .btn_open', function () {
				var $this = $(this);
				$this.addClass('rotate3d');
				wechatcore.ajaxSubmit('/wechat/redpack/redpackopen', { rotateid: self.rotateid }, false).then(function (data) {
					$this.parent().parent().remove();
					if (data.code == 0) {
						var packobj = $(wechatcore.tpl($("#moneyhb-tpl"), data.msg));
						$("body").append(packobj);
						$('.money_redenvelop').on('click', function (e) {
							var $target = $(e.target);
							if (!$target.closest('.money_box').length && !$target.is('.money_box')) {
								packobj.remove();
							}
						});
					} else if (data.code == 1) {
						var emptyobj = $(wechatcore.tpl($("#emptyhb-tpl"), {}));
						$("body").append(emptyobj);
						$('.prize_redenvelop').on('click', function (e) {
							var $target = $(e.target);
							if (!$target.closest('.prize_box').length && !$target.is('.prize_box')) {
								emptyobj.remove();
							}
						});
					} else {
						wechatcore.msg(data.msg);
					}
					isopening = false;
				}, function () {
					isopening = false;
					wechatcore.msg('网络太差，请稍后重试');
				});
			});
			$("body").on('click', '.grab_one_redenvelop .close', function () {
				isopening = false;
				$(this).parent().remove();
			});
		},
		changetip: function (tips) {
			$('.game-status').text(tips);
			$(".game-status").removeClass('hidden');
		},
		gameend: function () {
			var self = this;
			$('.money_redenvelop,.prize_redenvelop').addClass('hidden');
			self.stopdrop();
			$(".game-wait").addClass('hidden');
			self.changetip(self.statustip[2]);
		},
		startdrop: function () {
			var self = this;
			clearInterval(self.droptimer);
			self.droptimer = setInterval(function () {
				self.redpackdrop();
			}, 2e2);
			$(".redenvelop_box").removeClass('hidden');
		},
		stopdrop: function () {
			var self = this;
			clearInterval(self.droptimer);
			$(".redenvelop_box").addClass('hidden');
		},
		redpackdrop: function () {
			var self = this, boxtype = self.droptypes[Math.floor((Math.random() * self.droptypes.length))], anitime = self.dropanitimes[(boxtype - 1)];
			var elem = $('<li class="redenvelop' + boxtype + '"></li>');
			$('.redenvelop_box .redenvelop_list').append(elem);
			$(elem).css({
				"left": (Math.random() * ($(window).width() - parseInt($(elem).width()))) + "px",
				"top": $(window).height() + 'px',
				"transition": 'top ' + (anitime * 0.7 + anitime * 0.3 * Math.random()) + 'ms linear',
			}).on("webkitTransitionEnd transitionend", function () {
				$(this).remove();
			});
		},
	};
	return appredpack;
});
