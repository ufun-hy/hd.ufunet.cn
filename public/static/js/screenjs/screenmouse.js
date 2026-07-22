/*
* @Author: 赞木
* @Date:   2021-10-11 10:07:29
* @Last Modified by:   赞木
* @Last Modified time: 2022-11-24 16:03:10
*/
define('screenmouse', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard', 'jquerytrans'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS) {
	var screenmouse = {
		gamestatus: 0,
		stopclick: false,
		maxscore: 120,
		autorun: 2,
		autonum: 20,
		mouseuptime: 8e2,
		mouseduration: 300,
		gametimererror: true,
		joinInterval: null,
		newjoinRender: null,
		pmitemRender: null,
		isteam: '2',
		audio: {},
		init: function () {
			var self = this;
			self.pmitemRender = template('pmshakeItem-tpl');
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					screensocket.isclose = false;
					screencore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gamenoround' || data.type == 'gameisend') {
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
					$(".mouseroles").removeClass('display-none');
					if (data.type == 'gameiswait') {
						if ($('.welcomeBox').hasClass("display-none")) {
							$('.welcomeBox').removeClass("display-none").animateControl(screencore.anicssArr());
						}
						self.initItems();
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
								self.mouseStop();
								screencore.gameTimererror();
							}
						}, 4e3);
						self.mouseUp();
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
					if (self.gamestatus == 1) {
						setTimeout(function () {
							self.mouseUp();
						}, 3e2);
					}
					if ($(".phb-lists").is(":hidden")) {
						$(".phb-lists").removeClass('display-none');
					}
					if (!$(".topbg").hasClass("runbg")) {
						$(".topbg,.bottombg").addClass('runbg');
					}
					self.gamestatus = 2;
					self.gametimererror = false;
					$(".welcomeBox,.webstartdjs").addClass('display-none');
					var b = $(".webgamedjs"), s = b.find(".gamedjsani");
					s.text(data.djs);
					self.changemouseupTimer(data.djs);
					b.removeClass('display-none');
					if (data.djs == 0) {
						self.mouseStop();
						self.gamestatus = 3;
						b.addClass('display-none');
						self.audio.overAudio.play();
						$(".phb-lists").addClass('display-none');
						$(".topbg,.bottombg").removeClass('runbg');
						layerBox.showLoading('正在加载排名数据，请稍后...');
					}
					self.rushDom(data.list, data.teams);
				} else if (data.type == 'gameshowphbbtn') {
					layerBox.closeLayer();
					var btn = $(".rankBox-btns .paiming");
					btn.attr({ 'data-rotateid': data.rotateid, 'data-gamephb': data.gamephb });
					screencore.gameEndphb((data.isteam == '1' ? data.teams : data.list), data.endphb);
					screencore.sendLuckerTpl({ rotateid: data.rotateid });
				} else if (data.type == 'gamemouserefresh' || data.type == 'gameerrorhaddone') {
					window.location.reload();
				} else if (data.type == 'gameiserror') {
					layerBox.showMsg('当前轮次出现异常');
					setTimeout(function () {
						window.location.reload();
					}, 2e3);
				} else if (data.type == 'mouseoffline') {
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
			self.holeimgs = $(".mouseroles img");
			self.holeindexs = [];
			for (var i = 0; i < 9; i++) {
				self.holeindexs.push(i);
			}
			self.holeindexs = screencore.arrayrandom(self.holeindexs, self.holeindexs.length);
			//self.mouseAni(self.holeimgs[4],true,300,0,true,false);
		},
		initItems: function () {
			var f = $(".phb-lists li");
			f.find('.score').text(0);
			f.find('.oneinfo span').html('xx');
			f.find('.oneinfo img').attr('src', defaultImg);
			f.css('visibility', 'hidden');
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
		changemouseupTimer: function (djs) {
			var self = this;
			if (djs <= 5 && djs > 0) {
				self.mouseuptime = 400;
				self.mouseduration = 250;
				if (djs == 5) self.mouseUp();
			} else if (djs <= 10 && djs > 0) {
				self.mouseuptime = 400;
				self.mouseduration = 200;
				if (djs == 10) self.mouseUp();
			} else if (djs <= 15 && djs > 10) {
				self.mouseuptime = 500;
				self.mouseduration = 250;
				if (djs == 15) self.mouseUp();
			} else if (djs <= 20 && djs > 15) {
				self.mouseuptime = 600;
				self.mouseduration = 300;
				if (djs == 20) self.mouseUp();
			}
		},
		mouseUp: function () {
			var self = this;
			clearInterval(self.mouseani);
			self.mouseani = setInterval(function () {
				if (self.holeindexs.length > 0) {
					var oneindex = self.holeindexs.shift(), n;
					n = screencore.randomInt(1, 100) <= 70;//true是老鼠 false是猪
					var mdelay = self.mouseuptime - self.mouseduration;
					if (self.gamestatus == 2) {
						self.senddata({
							istiger: n,
							hindex: oneindex,
							duration: self.mouseduration,
							delay: mdelay,
						});
					}
					self.mouseAni(self.holeimgs[oneindex], n, self.mouseduration, mdelay, false, function () {
						self.holeindexs.push(oneindex)
					});
				}
			}, self.mouseuptime);
		},
		mouseStop: function () {
			var self = this;
			clearInterval(self.mouseani);
		},
		mouseAni: function (obj, istiger, duration, delay, isstop, func) {
			obj = $(obj);
			obj.attr("src", istiger ? roleImgs.tiger : roleImgs.fox),
				obj.transition({
					top: 0,
					duration: duration,
					complete: function () {
						!isstop && obj.transition({
							top: 118,
							duration: duration,
							delay: delay,
							complete: function () {
								func && func()
							}
						})
					}
				})
		},
		senddata: function (obj) {
			var self = this, senddata = {
				type: 'mouseup',
				hdid: XCV3Config.rhdid,
			};
			$.extend(senddata, obj);
			screensocket.wssend(senddata);
		},
		rushDom: function (lists, teams) {
			var self = this;
			var f = $(".phb-lists li");
			f.each(function (n) {
				var j = self.isteam == '1' ? teams[n] : lists[n],
					i = " ",
					l = 0,
					o;
				if (j) {
					i = j.nickname;
					l = parseInt(j.score);
					o = j.avatar
				}
				var q = $(this);
				var m = q.find(".score");
				q.find(".oneinfo span").html(i);
				m.text(l);
				var r = q.find(".oneinfo img");
				if (o) {
					r.attr("src", o);
					q.css("visibility", "visible");
				} else {
					q.css("visibility", "hidden")
				}
			});
		},
		showLastRoundUser: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/common/getLastrotatephb', { 'gametype': XCV3Config.gametype }).then(function (data) {
				if (data.code == 0) {
					if (data.msg == '1') {
						$(".emptybox").removeClass("display-none");
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
	return screenmouse;
});
