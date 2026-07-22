/*
* @Author: 赞木
* @Date:   2023-02-23 19:47:16
* @Last Modified by:   赞木
* @Last Modified time: 2023-06-21 21:45:00
*/
define('mobilecore', ['jquery', 'ydui', 'layerBox', 'laytpl', 'bscroll', 'appsocket', 'emojicore', 'keyboard', 'layerBox', 'TcPlayer', 'TXLivePlayer', 'hls', 'template', 'danmuku', 'qnrtplayer', 'jquerytrans'], function ($, YDUI, layerBox, laytpl, BScroll, appsocket, emojicore, keyboardJS, layerBox, TcPlayer, TXLivePlayer, Hls, template, Danmuku, QNRTPlayer) {
	var fulldm = {
		container: null,
		timer: null,
		oldBullet: [],
		newBullet: [],
		haddelBullet: [],
		dmtpl: null,
		isLoop: false,
		loadhistory: '1',
		config: {},
		dmmanager: null,
		loopTimer: 0,
		init: function (container, config) {
			var self = this;
			self.container = container;
			if (!config || $.isEmptyObject(config)) return;
			self.config = config;
			self.dmtpl = template('fulldm-tpl');
			if (config.isloop == '1') {
				self.isLoop = true;
			}
			self.loadhistory = config.loadhistory;
			if (config.loadhistory == '1') {
				self.ajaxhistory(config.historynum, config.fromtype || '1');//加载历史消息
			}
			self.createManager();
		},
		/*定时从新弹幕或者历史弹幕内加载弹幕消息*/
		barrageTimer: function () {
			var self = this;
			self.timer = setInterval(function () {
				if (self.newBullet.length > 0) {
					var onebarrage = self.newBullet.shift();
					if (!self.dmmanager.send(onebarrage)) {
						self.addBullet(onebarrage, '2');
					}
				} else {
					if (self.loopTimer >= 2 && self.oldBullet.length > 0) {
						var onebarrage = self.oldBullet.shift();
						if (!self.dmmanager.send(onebarrage)) {
							self.addoldBullet(onebarrage, '2');
						}
					} else {
						self.loopTimer++;
					}
				}
			}, 2e3);
		},
		rebindBarragedom: function (barrage, node) {
			var self = this, data = barrage.data;
			if (data.content != '') {
				data.content = emojicore.emoToimg(data.content);
			}

			$(node).addClass('fulldmBox-item');
			$(node).html(self.dmtpl({ showavatar: self.config.needavatar, showname: self.config.neednickname, data: data }));
			if (self.config.needbg == '1' && self.config.bgcolortype == '2') {
				var randColor = self.randColor();
				$(node).find('.fulldmBox-one').css({ "background-color": randColor });
			}
			if (self.config.fontcolortype == '2') {
				$(node).find('.fulldmBox-son').css({ "color": self.randColor() });
			}
		},
		rollspeed: function () {
			var speed = this.config.dmspeed;
			return speed == '1' ? [20, 25] : speed == '2' ? [15, 20] : [4, 10];
		},
		createManager: function () {
			var self = this, dmkuConfig = {
				container: self.container[0],
				height: 40,
				rowGap: 80,
				direction: 'right',
				times: self.rollspeed(),
				limit: 100,
				interval: 2,
				capacity: 1000,
				hooks: {
					barrageCreate(barrage, node) {
						self.rebindBarragedom(barrage, node);
					},
					barrageDestroy(barrage, node) {
						if (self.isLoop) {
							self.addoldBullet(barrage.data);
						}
					}
				}
			};
			self.dmmanager = Danmuku.create(dmkuConfig);
			var openfulldm = window.localStorage.getItem("openfulldm" + XCV3Config.hdid);
			if ((!openfulldm && self.config.opendm == '1') || openfulldm == '1') {//并未有缓存则判断是否设置了开屏播放弹幕
				self.barrageTimer();
				self.start();
			}
			self.bindevent();
		},
		bindevent: function () {
			var self = this;
			$(".video_wrap").on('click', '.vcp-dm-toggle', function () {
				var isopen = $(".vcp-dm-toggle i").hasClass('mxc-subtitle_unblock_light');
				if (isopen) {
					self.stop();
				} else {
					self.start();
				}
			});
			if (self.isios() && "onorientationchange" in window) {
				window.addEventListener('orientationchange', function () {
					$('.fulldmBox').height($('video').height());
					self.dmmanager != null && self.dmmanager.resize();
				}, false);
			}
			$(window).resize(function () {
				self.dmmanager != null && self.dmmanager.resize();
			});
			setInterval(function () {
				self.capacityhistroy();
			}, 60e3);
		},
		isios: function () {
			var str = navigator.userAgent.toLowerCase();
			var version = str.match(/cpu iphone os (.*?) like mac os/);
			return version;
		},
		addoldBullet: function (data, flag) {
			var self = this, flag = flag || '1';
			if (self.isdelExists(data.id) == -1 && self.isoldExists(data.id) == -1) {
				flag == '1' ? self.oldBullet.push(data) : self.oldBullet.unshift(data);
			}
		},
		addBullet: function (data, flag) {
			var self = this, flag = flag || '1';
			if (data.type == 'screendm') {
				data.type = data.msgtype || '1';
			}
			if (data.type == '2') {
				return false;
			}
			if (!self.config || $.isEmptyObject(self.config)) return;
			if (self.isnewExists(data.id) == -1) {
				flag == '1' ? self.newBullet.push(data) : self.newBullet.unshift(data);
			}
		},
		delBullet: function (key) {
			var self = this;
			self.haddelBullet.push(key);
			self.dmmanager.each(barrage => {
				if (barrage.data.id == key) {
					barrage.destroy();
				}
			})
			var dmkey = self.isnewExists(key);
			if (dmkey != -1) {
				self.newBullet.splice(dmkey, 1);
			}
			var olddmkey = self.isoldExists(key);
			if (olddmkey != -1) {
				self.oldBullet.splice(olddmkey, 1);
			}
		},
		resetBullet: function () {
			var self = this, needrestart = false;
			if (self.dmmanager.runing) {
				needrestart = true;
			}
			self.dmmanager.clear();
			self.oldBullet = [];
			self.newBullet = [];
			self.haddelBullet = [];
			needrestart && self.start();
		},
		ajaxhistory: function (num, type) {
			var self = this, fromtype = type || '1';
			mobilecore.ajaxSubmit('/common/fulldm/ajaxdm', { fromtype: fromtype, dmnum: num, rhdid: XCV3Config.rhdid, msgtype: '1' }).then(function (data) {
				if (data.code == 0) self.oldBullet = data.msg;
			});
		},
		randColor: function () {
			var e = .78,
				t = ["rgba(141,50,160," + e + ")", "rgba(225,99,15," + e + ")", "rgba(242,73,73," + e + ")", "rgba(18,155,240," + e + ")", "rgba(90,162,12," + e + ")", "rgba(20,185,148," + e + ")"],
				n = Math.floor(6 * Math.random());
			return t[n]
		},
		stop: function (type) {
			var self = this, type = type || '2';
			if (!self.config || $.isEmptyObject(self.config)) return;
			self.timer != null && clearInterval(self.timer);
			self.timer = null;
			if (self.dmmanager) {
				self.dmmanager.hidden();
				self.dmmanager.clear();
			}
			if (type == '2') $(".vcp-dm-toggle i").removeClass('mxc-subtitle_unblock_light').addClass('mxc-subtitle_block_light');
		},
		start: function (type) {
			var self = this, type = type || '2';
			if (!self.config || $.isEmptyObject(self.config)) return;
			if (self.dmmanager) {
				self.dmmanager.show();
				self.dmmanager.start();
			}
			self.timer == null && self.barrageTimer();
			if (type == '2') $(".vcp-dm-toggle i").removeClass('mxc-subtitle_block_light').addClass('mxc-subtitle_unblock_light');
		},
		isoldExists: function (keyid) {
			var self = this, dmindex = -1;
			for (var i = 0, len = self.oldBullet.length; i < len; i++) {
				if (keyid == self.oldBullet[i].id) {
					dmindex = i;
					break;
				}
			}
			return dmindex;
		},
		isnewExists: function (keyid) {
			var self = this;
			var dmindex = -1;
			for (var i = 0, len = self.newBullet.length; i < len; i++) {
				if (keyid == self.newBullet[i].id) {
					dmindex = i;
					break;
				}
			}
			return dmindex;
		},
		isdelExists: function (keyid) {
			var self = this;
			var dmindex = -1;
			for (var i = 0, len = self.haddelBullet.length; i < len; i++) {
				if (keyid == self.haddelBullet[i]) {
					dmindex = i;
					break;
				}
			}
			return dmindex;
		},
		getParamValues: function (name, arr) {
			var ret = []
			for (var i = 0, len = arr.length; i < len; i++) {
				ret.push(arr[i][name])
			}
			return ret
		},
		capacityhistroy: function () {
			var self = this, deldms = [];
			if (self.oldBullet.length >= self.dmmanager.opts.capacity) {
				self.oldBullet = self.oldBullet.sort(mobilecore.sortBy('id'));
				deldms = self.oldBullet.splice(0, 100);
				var delids = self.getParamValues('id', deldms);
				delids.length > 0 && self.dmmanager.each(barrage => {
					if (delids.indexOf(barrage.data.id) != -1) {
						if (self.isLoop) {
							self.haddelBullet.push(barrage.data.id);
						}
						barrage.destroy();
					}
				})
			}
		},
	};
	var mobilecore = {
		device: function (type) {
			if (type == 1) {
				return YDUI.device.isIOS;
			} else if (type == 2) {
				return YDUI.device.isMobile;
			} else if (type == 3) {
				return YDUI.device.isWeixin;
			}
		},
		init: function () {
			var self = this;
			window.Hls = Hls;
			window.TXLivePlayer = TXLivePlayer;
			if (playerstatus == '2' || playerstatus == '4') {
				self.initlive();
			} else {
				self.initwaitbox();
			}
			if (showjoin) {
				setInterval(function () {
					self.ajaxSubmit('/wechat/mobilelive/ajaxjoined', {}).then(function (json) {
						if (json.code == 0) {
							$(".playjoined span").text(json.msg);
						}
					});
				}, 10e3);
			}
			self.initsocket();
			self.bindevent();
		},
		player: null,
		initlive: function () {
			var self = this;
			if (playerstatus == '2' || playerstatus == '4') {
				var TcPlayerparams = {
					"poster": { "style": "stretch", "src": poster },
					"live": (playerstatus == '2' ? true : false),
					"autoplay": false,
					listener: function (msg) {
						if (msg.type == 'load') {
							if ($('.marker').length == 0) $('.vcp-player').append(self.tpl($("#marker-tpl"), {}));
							if ($(".bigicon").length == 0) {
								var _div = document.createElement('div');
								_div.className = 'bigicon';
								document.querySelector('.vcp-bigplay').appendChild(_div);
							}
							if (dmconfig && dmconfig.opendm == '1' && $(".vcp-dm-toggle").length == 0) {
								$(".vcp-fullscreen-toggle").after('<div class="vcp-dm-toggle zam-app-flex-ajCenter2 hidden"><i class="mxc-subtitle_block_light"></i></div>');
								fulldm.init($(".fulldmBox"), dmconfig);
							}
							if (thirdtype == '2' && webrtcurl != '' && $(".qiniucover").length == 0) {
								$(".vcp-player video").remove();
								$(".vcp-bigplay,.vcp-playtoggle,.vcp-poster").addClass('hidden');
								$(".vcp-player").append('<div class="qiniucover zam-app-flex-ajCenter"><span class="startplay" ></span></div>');
								QNRTPlayer.QNRTPlayer.setLogLevel('disable');
								var qnplayer = new QNRTPlayer.QNRTPlayer();
								qnplayer.init({
									className: 'qn-rtplayer-media',
									width: '100%',
									height: '100%',
									objectFit: 'contain',
									volumn: 0.6,
									controls: false,
									playsinline: true,
								});
								$(".vcp-playtoggle").after('<div class="vcp-qn-playtoggle zam-app-flex-ajCenter2"></div>');
								$(".video_wrap").on('click', '.qiniucover span', function (e) {
									e.stopPropagation();
									if ($(this).parent().css('opacity') == 0) {
										$(this).parent().trigger('click');
										return false;
									}
									if ($(".qn-rtplayer-media").length == 0) {
										$(".vcp-loading").show();
										$(this).parent().css('opacity', '0');
										$(".vcp-player").addClass('vcp-playing');
										$(".vcp-controls-panel").removeClass('show').addClass('hide');
										qnplayer.play(
											webrtcurl,
											$(".vcp-player")[0]
										).then(function () {
											$(".vcp-loading").hide();
											if (dmconfig && dmconfig.opendm == '1') {
												$(".vcp-dm-toggle").removeClass('hidden');
												fulldm.start();
											}
											qnplayer.mediaElement.setAttribute("x5-video-player-type", "h5-page")
											qnplayer.mediaElement.setAttribute("x5-video-player-fullscreen", "true")
										}, function (err) {
											$(".video_wrap .qiniucover").css('opacity', '1');
											$(".vcp-loading").hide();
											$(".vcp-player").removeClass('vcp-playing');
											$(".vcp-controls-panel").removeClass('hide').addClass('show');
										});
									} else {
										$(".video_wrap .vcp-qn-playtoggle").trigger('click');
									}
								});
								$(".video_wrap").on('click', '.vcp-qn-playtoggle', function () {
									if (qnplayer.isPlaying()) {
										qnplayer.pause();
										$(".vcp-player").removeClass('vcp-playing');
										$(".video_wrap .qiniucover").css('opacity', '1');
										$(".vcp-controls-panel").removeClass('hide').addClass('show');
									} else {
										qnplayer.resume();
										$(".vcp-player").addClass('vcp-playing');
										$(".video_wrap .qiniucover").css('opacity', '0');
										$(".vcp-controls-panel").removeClass('show').addClass('hide');
									}
								});
								var clickid;
								$(".video_wrap").on('click', '.qiniucover', function (e) {
									var panel = $(".vcp-controls-panel");
									clearTimeout(clickid);
									if (panel.hasClass("show")) {
										panel.removeClass('show').addClass('hide');
									} else {
										panel.removeClass('hide').addClass('show');
										clickid = setTimeout(function () {
											panel.removeClass('show').addClass('hide');
										}, 3e3)
									}
								});

							}
						} else if (msg.type == 'error') {
							$(".vcp-bigplay").css("opacity", '0');
							$(".vcp-loading").show();
							window.setTimeout(function () {
								//player.load();
							}, 5000);
						} else if (msg.type == 'fullscreen') {
							if (dmconfig && dmconfig.opendm == '1' && mobilecore.device(1)) {
								if (msg.detail.isFullscreen) {
									$('.fulldmBox').height($(window).height());
									fulldm.dmmanager != null && fulldm.dmmanager.resize();
								} else {
									$('.fulldmBox').height($('video').height());
									fulldm.dmmanager != null && fulldm.dmmanager.resize();
								}
							}
						} else if (msg.type == 'playing') {
							$(".vcp-loading").hide();
							$(".vcp-bigplay").css("opacity", '0');
							if (dmconfig && dmconfig.opendm == '1') {
								$(".vcp-dm-toggle").removeClass('hidden');
								fulldm.start();
							}
						} else if (msg.type == 'pause') {
							$(".vcp-bigplay").css("opacity", '1');
							if (dmconfig && dmconfig.opendm == '1') {
								fulldm.stop();
							}
						}
					},
					x5_player: true,
					x5_type: 'h5-page',
					x5_fullscreen: true,
					x5_orientation: 'landscape',
					//controls:'system',
					systemFullscreen: 'true',
				};
				TcPlayerparams.m3u8 = liveurl;
				if (playerstatus == '2' && webrtcurl != '') {
					TcPlayerparams.webrtc = webrtcurl;
				}
				var player = new TcPlayer.TcPlayer('videoLive', TcPlayerparams);
			}
		},
		initwaitbox: function () {
			var self = this;
			if (remainSec > 0) {
				self.timerun(remainSec);
			}
		},
		remainSec: 0,
		timerun: function (remainSec) {
			var self = this, t = setInterval(function () {
				var day = 0, hour = 0, minute = 0, second = 0;
				if (remainSec > 0) {
					day = Math.floor(remainSec / (60 * 60 * 24));
					hour = Math.floor(remainSec / (60 * 60)) - (day * 24);
					minute = Math.floor(remainSec / 60) - (day * 24 * 60) - (hour * 60);
					second = Math.floor(remainSec) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
				}
				if (minute <= 9) minute = '0' + minute;
				if (second <= 9) second = '0' + second;
				$('#timeremain-day').html(day + "天");
				$('#timeremain-hour').html(hour + '时');
				$('#timeremain-min').html(minute + '分');
				$('#timeremain-sec').html(second + '秒');
				remainSec--;
				if (remainSec < 0) {
					clearInterval(t);
					self.reloadpage();
				}
			}, 1e3);
		},
		clientid: '',
		initsocket: function () {
			var self = this, wsConfig = {};
			wsConfig.onmessage = function (data) {
				if (data.type == 'connected') {
					appsocket.isclose = false;
					self.clientid = data.clientid;
					self.connectsocket({ clientid: self.clientid, fromtype: chatmodule });
				} else if (data.type == 'join') {
					if (appjointip == '1') self.newjoin(data.nickname);
				} else if (data.type == 'addblack' || data.type == 'addmanager') {
					data.userid == XCV3Config.userid && self.reloadpage();
				} else if (data.type == 'luckeruserids') {
					if (1 == 2) self.layerAsklucker(data);
				} else if (data.type == 'screendm') {
					if (dmconfig && dmconfig.opendm == '1') {
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
					}
				} else if (data.type == 'screendeldm') {
					if (dmconfig && dmconfig.opendm == '1') {
						if (!$.isArray(data.msgid)) {
							fulldm.delBullet(data.msgid);
						} else {
							$.each(data.msgid, function (index, val) {
								fulldm.delBullet(val);
							});
						}
					}
				} else if (data.type == 'screenresetdm') {
					if (dmconfig && dmconfig.opendm == '1') fulldm.resetBullet();
				} else {
					if ($(".zam-app-msg-box").length <= 0) {
						return false;
					}
					if (chatmodule == 'msg') {
						if (data.type == 'del') {
							if (!$.isArray(data.msgid)) {
								$(".appmsg-" + data.msgid).remove();
							} else {
								$.each(data.msgid, function (index, val) {
									$(".appmsg-" + val).remove();
								});
							}
						} else if (data.type == 'msgreset' || (data.type == 'screenresetdm' && data.fromtype == '1')) {
							$(".zam-app-msglist").empty();
							self.chatscroll.refresh();
							self.scrollhasmore = false;
							$(".zam-pulldown-box .pulldownOver").html('<i class="mxc-infofill"></i>已加载全部');
							$(".zam-pulldown-box .pulldownTxt").html('<i class="mxc-infofill"></i>已加载全部');
						} else if (data.type == 'msgshenhe') {
							var messages = data.messages;
							if ($.isArray(messages) && messages.length > 0) {
								$.each(messages, function (i, val) {
									if ($(".appmsg-" + val.id).length <= 0) {
										if (val.type == '1' || val.type == '2') {
											val.content = emojicore.emoToimg(val.content);
										}
										val.ismanager = XCV3Config.ismanager;
										var addMsg = self.tpl($("#msg-tpl"), val);
										$(".zam-app-msglist").append(addMsg);
									}
								});
								self.waitImgLoad(function () {
									self.chatscroll.refresh(), self.chatscroll.scrollTo(0, self.chatscroll.maxScrollY, 300);
								});
							}
						} else if (data.type == '1' || data.type == '2') {
							if ($(".appmsg-" + data.id).length > 0) return;
							if (data.type == '1' || data.type == '2') {
								data.content = emojicore.emoToimg(data.content);
							}
							data.ismanager = XCV3Config.ismanager;
							var addMsg = self.tpl($("#msg-tpl"), data);
							$(".zam-app-msglist").append(addMsg);
							self.waitImgLoad(function () {
								self.chatscroll.refresh(), self.chatscroll.scrollTo(0, self.chatscroll.maxScrollY, 300);
							});
						}
					} else {
						if (data.type == 'delbp') {
							if (!$.isArray(data.msgid)) {
								$(".appmsg-" + data.msgid).remove();
							} else {
								$.each(data.msgid, function (index, val) {
									$(".appmsg-" + val).remove();
								});
							}
						} else if (data.type == 'bpreset' || (data.type == 'screenresetdm' && data.fromtype == '2')) {
							$(".zam-app-msglist").empty();
							self.chatscroll.refresh();
							self.scrollhasmore = false;
							$(".zam-pulldown-box .pulldownOver").html('<i class="mxc-infofill"></i>已加载全部');
							$(".zam-pulldown-box .pulldownTxt").html('<i class="mxc-infofill"></i>已加载全部');
						} else if (data.type == 'bpshenhe') {
							var messages = data.messages;
							if ($.isArray(messages) && messages.length > 0) {
								$.each(messages, function (i, val) {
									if ($(".appmsg-" + val.id).length <= 0) {
										if (val.type == '1') {
											val.content = emojicore.emoToimg(val.content);
										}
										val.ismanager = XCV3Config.ismanager;
										$(".zam-app-msglist").append(self.tpl($("#msg-tpl"), val));
									}
								});
								self.waitImgLoad(function () {
									self.chatscroll.refresh(), self.chatscroll.scrollTo(0, self.chatscroll.maxScrollY, 300);
								});
							}
						} else if (data.type == '1' || data.type == '2' || data.type == '3' || data.type == '4' || data.type == '5' || data.type == '6') {
							if (data.isreshow == '1' || $(".appmsg-" + data.id).length > 0) return;
							if (data.type == '1') {
								data.content = emojicore.emoToimg(data.content);
							}
							data.ismanager = XCV3Config.ismanager;
							$(".zam-app-msglist").append(self.tpl($("#msg-tpl"), data));
							self.waitImgLoad(function () {
								self.chatscroll.refresh(), self.chatscroll.scrollTo(0, self.chatscroll.maxScrollY, 300);
							});
						}
					}
				}
			};
			appsocket.init(wsConfig);
		},
		maxid: 0,
		chatscroll: null,
		scrollhasmore: true,
		initscroll: function () {
			var self = this;
			var bsconfig = { click: true, pullDownRefresh: { threshold: 10, stop: 20 } };
			if (self.ios134over()) bsconfig.useTransition = false;
			self.chatscroll = new BScroll($('.zam-app-msg-scroll')[0], bsconfig);
			self.chatscroll.on('pullingDown', function () {
				if (!self.scrollhasmore) {
					return self.chatscroll.finishPullDown() && self.chatscroll.refresh();
				}
				$(".zam-pulldown-box .pulldownTxt").hide();
				$(".zam-pulldown-box .pulldownRefresh").fadeIn();
				self.ajaxhistorymsg();
			});
			self.chatscroll.on('scroll', function (pos) {
				$(".zam-pulldown-box").css("top", Math.min(pos.y, 10));
			});
		},
		ajaxhistorymsg: function (isfirst, func) {
			var self = this, isfirst = isfirst || '2';
			self.ajaxSubmit('/wechat/mobilelive/ajaxmsg', { maxid: self.maxid, fromtype: chatmodule }, false).then(function (data) {
				if (data.code == 0) {
					var insertHtml = '', pagedata = data.msg;
					if (pagedata.length > 0) {
						pagedata = pagedata.reverse();
						self.maxid = pagedata[0].id;
						$.each(pagedata, function (index, value) {
							if (value.type == '1') value.content = emojicore.emoToimg(value.content.toString());
							value.ismanager = XCV3Config.ismanager;
							insertHtml += self.tpl($("#msg-tpl"), value);
						});
					}
					if (isfirst == '1') {
						if (pagedata.length > 0) {
							$(".zam-app-msglist").html(insertHtml);
							self.waitImgLoad(function () {
								self.chatscroll.refresh(), self.chatscroll.scrollTo(0, self.chatscroll.maxScrollY, 300);
								func && func();
							});
						} else {
							$(".zam-app-msglist").html(insertHtml);
							self.scrollhasmore = false;
							$(".zam-pulldown-box .pulldownOver").html('<i class="mxc-infofill"></i>已加载全部');
							$(".zam-pulldown-box .pulldownTxt").html('<i class="mxc-infofill"></i>已加载全部');
							func && func();
						}
					} else {
						setTimeout(function () {
							if (pagedata.length > 0) {
								$(".zam-app-msglist").prepend(insertHtml);
							} else {
								self.scrollhasmore = false;
								$(".zam-pulldown-box .pulldownOver").html('<i class="mxc-infofill"></i>已加载全部');
								$(".zam-pulldown-box .pulldownTxt").html('<i class="mxc-infofill"></i>已加载全部');
							}
							$(".zam-pulldown-box .pulldownRefresh").hide();
							$(".zam-pulldown-box .pulldownOver").fadeIn();
							setTimeout(function () {
								$(".zam-pulldown-box .pulldownOver").fadeOut(function () {
									self.chatscroll.finishPullDown();
									self.chatscroll.refresh();
									setTimeout(function () {
										$(".zam-pulldown-box .pulldownTxt").show();
									}, 4e2);
									func && func();
								});
							}, 1e3);
						}, 1e3);
					}
				} else {
					self.msg(data.msg);
					func && func();
				}
			}, function () {
				self.msg('网络太差，请稍后重试');
				if (isfirst == '2') {
					$(".zam-pulldown-box .pulldownOver").fadeOut(function () {
						self.chatscroll.finishPullDown();
						self.chatscroll.refresh();
						setTimeout(function () {
							$(".zam-pulldown-box .pulldownTxt").show();
						}, 2e2);
						func && func();
					});
				}
			});
		},
		bindevent: function () {
			var self = this;
			if ($(".zam-app-msg-box").length > 0) {
				self.initscroll();
				setTimeout(function () {
					self.ajaxhistorymsg('1');
				}, 3e2);
			}
			if ($(".tab-menu .tab-menu-item").length > 0) {
				$(".tab-menu .tab-menu-item").click(function () {
					var $this = $(this), menutype = $this.attr('data-type'), phbnum = $this.attr('data-phbnum');
					if ($this.hasClass('active')) return false;
					$this.addClass('active').siblings().removeClass('active');
					$(".tab-content > div[data-type='" + menutype + "']").removeClass('hidden').siblings().addClass('hidden');
					if (menutype == '1') {
						self.chatscroll.refresh(), self.chatscroll.scrollTo(0, self.chatscroll.maxScrollY, 300);
					} else {
						self.ajaxqyb(phbnum);
					}
				});
				$(".tab-menu .tab-menu-item").eq(0).trigger('click');
			}
			emojicore.init();
			$(".zam-app-msg-footerbar .zam-app-msg-faceicon").click(function (e) {
				if (appsocket.isclose) return false;
				e.stopPropagation();
				setTimeout(function () {
					$(".zam-app-facebox").toggleClass('hidden');
				}, 1e2);
			});
			$(".zam-app-facebox").on('click', '.emo-list .normalemoji', function () {
				var $this = this;
				$(".zam-app-msg-footerbar input").val($(".zam-app-msg-footerbar input").val() + $this.id);
				if (XCV3Config.buttonLocked) return;
				$(".btn-send-data").removeClass('zam-btn-disabled');
			});
			$(".zam-app-facebox").on('click', '.delemoji', function () {
				var inputW = $(".zam-app-msg-footerbar input").val();
				var matchs = inputW.match(/\[[\u4e00-\u9fa5]+\]/g);
				if ($.isArray(matchs) && matchs.length > 0) {
					$(".zam-app-msg-footerbar input").val(inputW.replace(matchs[(matchs.length - 1)], ''));
				}
				var inputWords = $(".zam-app-msg-footerbar input").val();
				if (inputWords == '') {
					$(".btn-send-data").text("发送").removeClass("zam-btn-disabled");
				}
			});
			$(".app-msg-txtInput").on('input propertychange', function () {
				if ($(this).val() != '' && !XCV3Config.buttonLocked) {
					$(".btn-send-data").removeClass('zam-btn-disabled');
				}
			});
			$(".btn-send-data").on('click', function () {
				if (appsocket.isclose) return;
				var $this = $(this), inputobj = $this.parent().find('input');
				if ($this.hasClass('zam-btn-disabled')) {
					return false;
				}
				var txt = inputobj.val();
				if (txt != '') {
					$this.addClass('zam-btn-disabled');
					self.ajaxSubmit('/wechat/mobilelive/send', { type: 1, content: txt, fromtype: chatmodule }, false).then(function (data) {
						if (data.code == 0) {
							inputobj.val('');
							$('.zam-app-facebox').addClass('hidden');
							if (XCV3Config.sendJgtime > 0) {
								XCV3Config.buttonLocked = true;
								$this.text(XCV3Config.sendJgtime + " s").removeClass("btn-primary");
								self.coundown(XCV3Config.sendJgtime, function (t) {
									$this.text(t + " s");
								}, function () {
									$this.text("发送")
									XCV3Config.buttonLocked = false;
									var inputWords = inputobj.val();
									if (inputWords != '') {
										$this.removeClass("zam-btn-disabled")
									}
								})
							}
						} else {
							$this.removeClass('zam-btn-disabled');
							self.msg(data.msg);
						}
					}, function () {
						$this.removeClass('zam-btn-disabled');
						self.msg('网络异常发送失败，请稍后重试');
					});
				}
			});
			$(".zam-app-msglist").on('click', '.zam-app-msg-hb', function () {
				return self.msg('请通过微信端参与抢红包');
			});
		},
		ios134over: function () {
			var self = this;
			var ioscenter = '13.4';
			var ios = false;
			var str = navigator.userAgent.toLowerCase();
			var version = str.match(/cpu iphone os (.*?) like mac os/);
			if (version) {
				ios = version[1].replace(/_/g, ".");
				ios = self.compareVesion(ioscenter, ios);
			}
			return ios;
		},
		compareVesion: function (a, b) {
			var self = this;
			var a = self.toNum(a);
			var b = self.toNum(b);
			if (a == b) {
				return true;
			} else if (a > b) {
				return false;
			} else {
				return true;
			}
		},
		toNum: function (a) {
			var a = a.toString();
			var c = a.split('.');
			var num_place = ["", "0", "00", "000", "0000"], r = num_place.reverse();
			for (var i = 0; i < c.length; i++) {
				var len = c[i].length;
				c[i] = r[len] + c[i];
			}
			var res = c.join('');
			return res;
		},
		coundown: function (time, lg, draw, jgtime) {
			var b = setInterval(function () {
				time = time - 1;
				if (time > 0) {//>0
					if (lg) {
						lg(time);
					}
				} else {
					clearInterval(b);
					if (draw) {
						draw()
					}
				}
			}, jgtime || 1e3);
		},
		msg: function (txt, time) {
			layerBox.showMsg(txt, time || 2e3);
		},
		pop: function (txt, skin, shadeclose) {
			return layerBox.onlyHtml(txt, skin, shadeclose);
		},
		loading: function (txt) {
			return layerBox.showLoading(txt);
		},
		close: function (index) {
			layerBox.close(index)
		},
		closeall: function () {
			layerBox.closeLayer();
		},
		ajaxSubmit: function (url, params, tips) {
			var self = this;
			if (tips) {
				var layerindex = self.loading(tips);
			}
			params.hdid = XCV3Config.hdid;
			var ajaxObj = $.Deferred();
			$.ajax({
				url: self.makeurl(url),
				type: 'post',
				data: params,
				dataType: 'json'
			}).then(function (json) {
				if (tips) {
					self.close(layerindex);
				}
				if (json.code == -100) {
					self.msg('登录身份已经过期');
					setTimeout(function () {
						self.reloadpage();
					}, 1e3);
				} else {
					ajaxObj.resolve(json);
				}
			}, function (json) {
				if (tips) {
					self.close(layerindex);
				}
				ajaxObj.reject(json);
			});
			return ajaxObj.promise();
		},
		makeurl: function (r, hdid) {
			return r;
		},
		tpl: function (dom, data) {
			return laytpl(dom.html()).render(data);
		},
		waitImgLoad: function (callback) {
			var self = this;
			var t_img_load;
			var img_isLoad = true;
			if ($('.needwait').length > 0) {
				$('.needwait').each(function () {
					if (this.height === 0) {
						img_isLoad = false;
						return false;
					}
				});
				if (img_isLoad) {
					clearTimeout(t_img_load);
					callback && callback();
				} else {
					img_isLoad = true;
					t_img_load = setTimeout(function () {
						self.waitImgLoad(callback);
					}, 500);
				}
			} else {
				callback && callback();
			}
		},
		alert: function (obj) {
			if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
				obj = JSON.stringify(obj);
			}
			alert(obj);
		},
		newjointimer: null,
		newjoin: function (name) {
			var self = this;
			if (!name) return;
			var joinBox = $('.newjoin-enter');
			if (joinBox.length > 0 && joinBox.hasClass('movein')) {
				clearTimeout(self.newjointimer);
			}
			joinBox.removeClass('moveout');
			joinBox.addClass('movein').find('.name').text(name);
			self.newjointimer = setTimeout(function () {
				joinBox.removeClass('movein').addClass('moveout').find('.name').text('');
				setTimeout(function () {
					joinBox.removeClass('moveout');
				}, 4e2)
			}, 2.5e3)
		},
		connectsocket: function (data, func) {
			var self = this;
			self.ajaxSubmit("/wechat/pclive/binduid", data).then(function (data) {
				if (data.code != 0) {
					self.msg(data.msg);
				} else {
					func && func();
				}
			}, function () {
				console.log('网络太差链接socket服务失败，请稍后重试');
			});
		},
		reloadpage: function () {
			window.location.reload();
		},
		ajaxqyb: function (phbnum) {
			var self = this, yhbbox = $(".zam-app-invite-main");
			self.ajaxSubmit("/wechat/pclive/ajaxqyb", { phbnum: phbnum }).then(function (json) {
				if (json.code == 0) {
					var phb = json.msg;
					if (phb.length > 0) {
						yhbbox.html(self.tpl($("#yqb-tpl"), { list: phb }));
						$(".zam-app-nodata").addClass('hidden');
						$(".zam-app-invite-main").removeClass('hidden');
					} else {
						$(".zam-app-invite-main").addClass('hidden');
						$(".zam-app-nodata").removeClass('hidden');
					}
				} else {
					self.msg(json.msg);
				}
			}, function () {
				self.msg('网络太差，请稍后重试');
			});
		}
	};
	return mobilecore;
});
