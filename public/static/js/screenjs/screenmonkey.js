define('screenmonkey', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS) {
	var screenmonkey = {
		gamestatus: 0,
		stopclick: false,
		maxscore: 120,
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
			self.lineitemRender = template('shakeItem-tpl');
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
					}
				} else if (data.type == 'gameiscountdown') {
					self.gametimererror = false;
					if (!$(".welcomeBox").hasClass("display-none")) {
						$(".welcomeBox").addClass('display-none');
					}
					var b = $(".webstartdjs"), e = b.find(".webstartdjsBox"), s = b.find(".startdjsani");
					s.text(data.djs > 0 ? data.djs : 'GO');
					b.removeClass('display-none');
					self.audio.countAudio.play();
				} else if (data.type == 'gameisdjs') {
					self.gamestatus = 2;
					self.gametimererror = false;
					$(".welcomeBox,.webstartdjs").addClass('display-none');
					var b = $(".webgamedjs"), s = b.find(".gamedjsani");
					s.text(data.djs);
					b.removeClass('display-none');
					if (data.djs == 0) {
						self.gamestatus = 3;
						b.addClass('display-none');
						self.audio.overAudio.play();
						layerBox.showLoading('正在加载排名数据，请稍后...');
					}
					self.rushDom(data.list, data.teams);
				} else if (data.type == 'gameshowphbbtn') {
					layerBox.closeLayer();
					var btn = $(".rankBox-btns .paiming");
					btn.attr({ 'data-rotateid': data.rotateid, 'data-gamephb': data.gamephb });
					screencore.gameEndphb((data.isteam == '1' ? data.teams : data.list), data.endphb);
					screencore.sendLuckerTpl({ rotateid: data.rotateid });
				} else if (data.type == 'gamemonkeyrefresh' || data.type == 'gameerrorhaddone') {
					window.location.reload();
				} else if (data.type == 'gameiserror') {
					layerBox.showMsg('当前轮次出现异常');
					setTimeout(function () {
						window.location.reload();
					}, 1e3);
				} else if (data.type == 'monkeyoffline') {
					screensocket.forceoff = true;
					layerBox.showMsg('当前游戏不支持多开，当前窗口已经被迫下线', '0');
				} else if (data.type == 'screendm') {
					var messages = data.messages;
					if (messages) {
						if ($.isArray(messages) && messages.length > 0) {
							$.each(messages, function (i, val) {
								if (val.type == '1') {
									fulldm.addBullet(val);
								}
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
			$(".rankBox .nextround").off('click').on('click', function () {
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
			$(".banglistBox-btns a").off('click').on('click', function () {
				var $this = $(this);
				if (clickpn) return;
				clickpn = true;
				var isprev = $this.hasClass('banglistBox-btn-prev');
				var rotateid = $this.parent().attr('data-nowrotateid') ? $this.parent().attr('data-nowrotateid') : $(".rankBox-btns .paiming").attr('data-rotateid');
				screencore.ajaxSubmit('/screen/common/gamerotatepnphb', { 'gametype': XCV3Config.gametype, rotateid: rotateid, isprev: isprev ? '1' : '2' }, '正在获取排行榜数据').then(function (data) {
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
			var self = this;
			var l = $(".shakelineBox li");
			l.each(function (i, v) {
				var oneuser = self.isteam == '1' ? teams[i] : lists[i];
				if (oneuser) {
					var bottom = 400 * (oneuser.score / self.maxscore).toFixed(2);
					if (bottom >= 400) {
						bottom = 400;
					}
					$(v).find(".player .nickname").text(oneuser.nickname);
					$(v).find(".player .avatar").css({ "background-image": "url(" + oneuser.avatar + ")" });
					$(v).find(".player").css({ "bottom": bottom + "px" });
					$(v).find(".player").removeClass('display-none');
				} else {
					$(v).find(".player .nickname").text('');
					$(v).find(".player .avatar").css({ "background-image": "url('')" });
					$(v).find(".player").addClass('display-none');
				}
			});
		},
		showLastRoundUser: function () {
			var self = this, tipindex = layerBox.showLoading('无正在进行的轮次，直接显示最后一轮结果');
			screencore.ajaxSubmit('/screen/common/getlastrotatephb', { 'gametype': XCV3Config.gametype }).then(function (data) {
				if (data.code == 0) {
					if (data.msg == '1') {
						layerBox.close(tipindex);
						$(".shake-mainbox .emptybox").removeClass("display-none");
					} else {
						setTimeout(function () {
							layerBox.close(tipindex);
						}, 3e2);
						self.bindEvent();
						var btn = $(".rankBox-btns .paiming");
						btn.attr({ 'data-rotateid': data.msg.rotateid, 'data-gamephb': data.msg.gamephb });
						screencore.gameEndphb(data.msg.lists, data.msg.endphb);
					}
				} else {
					layerBox.close(tipindex);
					layerBox.showMsg(data.msg);
				}
			}, function () {
				layerBox.close(tipindex);
				layerBox.showMsg('网络太差，请稍后重试');
			});
		},
		createLine: function (gameflag) {
			var self = this, gameflag = gameflag || 'gameiswait';
			var trackHtml = "";
			for (var i = 0; i < 10; i++) {
				trackHtml += self.lineitemRender({ i: i });
			}
			if (gameflag == 'gameiswait' || (gameflag != 'gameiswait' && $('.shakelineBox li').length == 0)) {
				$(".shakelineBox").html(trackHtml);
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
	return screenmonkey;
});
