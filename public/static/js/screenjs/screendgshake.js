define('screendgshake', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS) {
	var screendgshake = {
		gamestatus: 0,
		stopclick: false,
		maxscore: 120,
		phbnums: 10,
		autorun: 2,
		autonum: 20,
		gametimererror: true,
		joinInterval: null,
		lineitemRender: null,
		newjoinRender: null,
		pmitemRender: null,
		isteam: '2',
		audio: {},
		init: function () {
			var self = this;
			self.lineitemRender = template($(".dgshake-vertical").length > 0 ? 'vshakeitem-tpl' : 'hshakeitem-tpl');
			self.pmitemRender = template('pmshakeItem-tpl');
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					screensocket.isclose = false;
					screencore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gamenoround') {
					if (self.gamestatus == 0) {
						self.showLastRoundUser();
					}
				} else if (data.type == 'gameonline') {
					self.gamestatus == 1 && self.rushuser(data);
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					self.initAudio();
					self.bindEvent();
					self.maxscore = data.maxscore;
					self.isteam = data.isteam;
					if (!$(".rankBox").is(":hidden")) $(".rankBox").addClass('display-none');
					self.createLine(data.type);
					if (data.type == 'gameiswait') {
						if ($('.welcomeBox').hasClass("display-none")) {
							$('.welcomeBox').removeClass("display-none").animateControl(screencore.anicssArr());
						}
						if (!$(".dgshake-list").hasClass('display-none')) {
							$(".dgshake-list").addClass('display-none');
						}
						self.gamestatus = 1;
						clearInterval(self.joinInterval);
						self.autorun = data.autorun;
						self.autonum = data.autonum;
						screencore.gameSendonline();
						self.joinInterval = setInterval(function () {
							screencore.gameSendonline();
						}, 2e3);
					} else {
						self.gamestatus = 2;
						self.gametimererror = true;
						setTimeout(function () {
							if (self.gamestatus == 2 && self.gametimererror) {
								screencore.gameTimererror();
							}
						}, 2e3);
						$(".dgshake-list").removeClass('display-none');
					}
					$(".welcomeBox-title").html(data.rtitle || '');
				} else if (data.type == 'gameiscountdown') {
					self.gametimererror = false;
					if (!$(".welcomeBox").hasClass("display-none")) {
						$(".welcomeBox").addClass('display-none');
					}
					var b = $(".webstartdjs"), e = b.find(".webstartdjsBox"), s = b.find(".startdjsani");
					s.text(data.djs > 0 ? data.djs : 'GO');
					b.removeClass('display-none');
					self.audio.countAudio.play();
					data.djs == 0 && $(".dgshake-list").removeClass('display-none');
				} else if (data.type == 'gameisdjs') {
					self.gamestatus = 2;
					self.gametimererror = false;
					$(".welcomeBox,.webstartdjs").addClass('display-none');
					var b = $(".webgamedjs"), s = b.find(".gamedjsani");
					if ($(".dgshake-list").is(':hidden')) $(".dgshake-list").removeClass('display-none');
					s.text(data.djs);
					b.removeClass('display-none');
					if (data.djs == 0) {
						self.gamestatus = 3;
						b.addClass('display-none');
						self.audio.overAudio.play();
						$(".bgneedrun").removeClass('runbg');
						if ($(".kissroles .role-item-image").hasClass('anirolechange')) $('.kissroles .role-item-image').removeClass('anirolechange');
						layerBox.showLoading(LoadingTxt);
					} else {
						if ($(".kissroles").length > 0 && !$(".kissroles").is(":hidden") && !$(".kissroles .role-item .role-item-image").hasClass('anirolechange')) {
							$(".kissroles .role-item .role-item-image").addClass('anirolechange');
							var rolew = $('.kissroles .role-item').width();
							$('.role-left').css({
								"left": `calc(50% - ${rolew}px)`,
								"transition-duration": `${data.djs}s`,
							}).on("webkitTransitionEnd transitionend", function () {
								$(this).find('.role-item-image').removeClass('anirolechange');
							});
							$('.role-right').css({
								"right": `calc(50% - ${rolew}px)`,
								"transition-duration": `${data.djs}s`,
							}).on("webkitTransitionEnd transitionend", function () {
								$(this).find('.role-item-image').removeClass('anirolechange');
							});
						}
					}
					self.rushDom(data.list, data.teams);
				} else if (data.type == 'gameshowphbbtn') {
					layerBox.closeLayer();
					var btn = $(".rankBox-btns .paiming");
					btn.attr({ 'data-rotateid': data.rotateid, 'data-gamephb': data.gamephb });
					screencore.gameEndphb((data.isteam == '1' ? data.teams : data.list), data.endphb);
					screencore.sendLuckerTpl({ rotateid: data.rotateid });
				} else if (data.type == 'gamedgshakerefresh' || data.type == 'gameerrorhaddone') {
					window.location.reload();
				} else if (data.type == 'gameiserror') {
					layerBox.showMsg('当前轮次出现异常');
					setTimeout(function () {
						window.location.reload();
					}, 1e3);
				} else if (data.type == 'dgshakeoffline') {
					screensocket.forceoff = true;
					layerBox.showMsg('当前游戏不支持多开，当前窗口已经被迫下线', '0');
				} else if (data.type == 'screendm') {
					var messages = data.messages;
					if (messages) {
						if ($.isArray(messages) && messages.length > 0) {
							$.each(messages, function (i, val) {
								fulldm.addBullet(val);
							});
						}
					} else {
						fulldm.addBullet(data);
					}
				} else if (data.type == 'screendeldm') {
					if (!$.isArray(data.msgid)) {
						fulldm.delBullet(data.msgid);
					} else {
						$.each(data.msgid, function (index, val) {
							fulldm.delBullet(val);
						});
					}
				} else if (data.type == 'screenresetdm') {
					fulldm.resetBullet();
				}
			};
			params.onclose = function () {
				screensocket.reconnect();
				clearInterval(self.joinInterval);
			};
			screensocket.init(params);
		},
		initAudio: function () {
			var self = this;
			self.audio.joinAudio = document.getElementById("joinaudio");
			self.audio.countAudio = document.getElementById("countaudio");
			self.audio.overAudio = document.getElementById("overaudio");
		},
		bindEvent: function () {
			var self = this;
			$(".start-btn").off('click').on('click', function () {
				if (screensocket.isclose) return;
				if (parseInt($(".welcomeBox-nums span").text()) == 0) return layerBox.showMsg('当前无用户参与，无法开始游戏');
				if (self.stopclick) return;
				self.stopclick = true;
				$(".welcomeBox").addClass('display-none');
				screencore.hideFootAndQr();
				clearInterval(self.joinInterval);
				screencore.ajaxSubmit("/screen/common/gamestart", { 'gametype': XCV3Config.gametype }).then(function (data) {
					if (data.code != 0) {
						layerBox.showMsg(data.msg);
					}
				}, function () {
					self.stopclick = false;
					layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			$(".rankBox .nextround").on('click', function () {
				screencore.gameautocreate();
			});
			var clickpm = false;
			$(".rankBox .paiming").off('click').on('click', function () {
				var $this = $(this);
				$(".banglistBox-btns").removeAttr("data-nowrotateid");
				if (clickpm) return;
				clickpm = true;
				screencore.ajaxSubmit('/screen/common/gamerotatephb', { 'gametype': XCV3Config.gametype, rotateid: $this.attr('data-rotateid'), gamephb: $this.attr('data-gamephb') }, '正在获取排行榜数据').then(function (data) {
					clickpm = false;
					if (data.code == 0) {
						var pmHtml = "", showphbaward = data.msg.showphbaward || '2';
						if (data.msg.list.length > 0) {
							$.each(data.msg.list, function (k, v) {
								v.showphbaward = showphbaward;
								v.key = k;
								pmHtml += self.pmitemRender(v);
							})
						}
						$(".banglist-title").html(template("pmshakeHeader-tpl", { isteam: data.msg.isteam, showphbaward: showphbaward }));
						$(".banglistBox .banglist").html(pmHtml);
						$('.banglistBox').removeClass("display-none").animateControl('bounceInUp');
					} else {
						layerBox.showMsg(data.msg);
					}
				}, function () {
					clickpm = false;
					layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			$(".banglist-close i").off('click').on('click', function () {
				$('.banglistBox').animateControl('bounceOutDown', function (e) {
					e.addClass('display-none');
				});
			});
			var clickpn = false;
			$(".banglistBox-btns a").off('click').off('click').on('click', function () {
				var $this = $(this);
				if (clickpn) return;
				clickpn = true;
				var isprev = $this.hasClass('banglistBox-btn-prev');
				var rotateid = $this.parent().attr('data-nowrotateid') ? $this.parent().attr('data-nowrotateid') : $(".rankBox-btns .paiming").attr('data-rotateid');
				screencore.ajaxSubmit('/screen/common/gamerotatepnphb', { 'gametype': XCV3Config.gametype, rotateid: rotateid, isprev: isprev ? '1' : '2' }, LoadingRankTxt).then(function (data) {
					clickpn = false;
					if (data.code == 0) {
						var pmHtml = "", showphbaward = data.msg.showphbaward || '2';
						if (data.msg.list.length > 0) {
							$.each(data.msg.list, function (k, v) {
								v.showphbaward = showphbaward;
								v.key = k;
								pmHtml += self.pmitemRender(v);
							})
						}
						$(".banglist-title").html(template("pmshakeHeader-tpl", { isteam: data.msg.isteam, showphbaward: showphbaward }));
						$this.parent().attr('data-nowrotateid', data.msg.rotateid);
						$(".banglistBox .banglist").html(pmHtml);
					} else {
						layerBox.showMsg(data.msg);
					}
				}, function () {
					clickpn = false;
					layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			keyboardJS.off(['space', 'right', 'shift']);
			keyboardJS.bind('space', function (e) {
				if (self.gamestatus == 1) {
					$(".start-btn").trigger('click');
				}
			});
			keyboardJS.bind('right', function (e) {
				if (self.gamestatus == 2) {
					layerBox.showConfirm('警告', '当前轮次还未结束，确定要强制结束么?', ['确定', '取消'], function () {
						$(".welcomeBox").addClass('display-none');
						screencore.ajaxSubmit("/screen/common/gameend", { 'gametype': XCV3Config.gametype }).then(function (data) { });
					});
				} else {
					self.gamestatus != 1 && $(".rankBox .nextround").trigger('click');
				}
			});
			keyboardJS.bind('shift', function (e) {
				if (self.gamestatus == 1 || self.gamestatus == 2) return;
				if (!$(".rankBox").is(":hidden")) {//已经出来了前10排名 
					if ($(".banglistBox").is(":hidden")) {
						$(".rankBox .paiming").trigger('click');
					} else {
						$(".banglist-close i").trigger('click');
					}
				}
			});
		},
		rushDom: function (lists, teams) {
			var self = this, lbox = $(".dgshake-list ul"), l = lbox.find('li'), isvertical = lbox.hasClass('dgshake-vertical'), vmax = 530;
			l.each(function (i, v) {
				var oneuser = self.isteam == '1' ? teams[i] : lists[i];
				if (oneuser) {
					var openid = oneuser.openid, notfly = $(v).attr('data-openid') == openid, isintop = l.filter(function (o, i) {
						return openid == $(i).attr("data-openid")
					});
					if (!notfly && isintop.length > 0) {
						var frompos = isintop[0].getBoundingClientRect(), topos = $(v)[0].getBoundingClientRect(), x = topos.left - frompos.left, y = topos.top - frompos.top;
						if (x || y) {
							isintop.css({
								"transform": "translate(" + x + "px," + y + "px)",
								"transition": "transform 0.2s",
							}).on("webkitTransitionEnd transitionend", function () {
								isintop.removeAttr('style');
							});
						}
					}
					var left = (oneuser.score / self.maxscore).toFixed(2);//百分比
					$(v).find(".nicknamebox").text(oneuser.nickname);
					$(v).find(".avatarbox img").attr("src", oneuser.avatar);
					$(v).find(".myscore").text(oneuser.score);
					if (isvertical) {
						left = left >= 1 ? vmax + 'px' : (left * vmax) + 'px';
					} else {
						left = left >= 1 ? '100%' : (left * 100) + '%';
					}
					var cssobj = isvertical ? { "height": left } : { "width": left };
					$(v).find(".barbox").css(cssobj);
					$(v).attr("data-openid", openid);
				} else {
					$(v).find(".nicknamebox").text(defaultName);
					$(v).find(".avatarbox img").attr("src", defaultImg);
					$(v).find(".myscore").text(0);
					$(v).removeAttr("data-openid");
					var cssobj = isvertical ? { "height": 0 } : { "width": 0 };
					$(v).find(".barbox").css(cssobj);
				}
			});
		},
		showLastRoundUser: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/common/getLastrotatephb', { 'gametype': XCV3Config.gametype }).then(function (data) {
				if (data.code == 0) {
					if (data.msg == '1') {
						$(".shake-mainbox .emptybox").removeClass("display-none");
					} else {
						var tipindex = layerBox.showLoading('无正在进行的轮次，直接显示最后一轮结果');
						setTimeout(function () {
							layerBox.close(tipindex);
						}, 1e3);
						self.bindEvent();
						var btn = $(".rankBox-btns .paiming");
						btn.attr({ 'data-rotateid': data.msg.rotateid, 'data-gamephb': data.msg.gamephb });
						screencore.gameEndphb(data.msg.lists, data.msg.endphb);
					}
				} else {
					layerBox.showMsg(data.msg);
				}
			}, function () {
				layerBox.showMsg('网络太差，请稍后重试');
			});

		},
		createLine: function (gameflag) {
			var self = this, gameflag = gameflag || 'gameiswait';
			var trackHtml = "";
			for (var i = 0; i < 10; i++) {
				trackHtml += self.lineitemRender();
			}
			if (gameflag == 'gameiswait' || (gameflag != 'gameiswait' && $('.dgshake-list li').length == 0)) {
				$(".dgshake-list ul").html(trackHtml);
			}
		},
		rushuser: function (data) {
			var self = this;
			screencore.gamerushwelcomeusers({
				users: data.user || [],
				isteam: self.isteam || '2',
				count: data.count || '0',
			});
			if (self.autorun == 1) {
				if (self.gamestatus == 1 && data.count >= self.autonum) {
					self.autostart();
				}
			}
		},
		autostart: function () {
			var self = this;
			clearInterval(self.joinInterval);
			setTimeout(function () {
				$(".start-btn").trigger('click');
			}, 1e3)
		}
	};
	return screendgshake;
});
