/*
* @Author: 赞木
* @Date:   2022-09-27 07:44:10
* @Last Modified by:   赞木
* @Last Modified time: 2023-03-25 16:34:55
*/
define('screendzp', ['screensocket', 'screencore', 'luckycanvas', 'template', 'layerBox', 'fulldm', 'keyboard', 'velocity', 'snabbt'], function (screensocket, screencore, LuckyCanvas, template, layerBox, fulldm, keyboardJS) {
	var screendzp = {
		rollonetpl: null,
		maxid: 0,
		oldluckers: [],
		oneluckerid: 0,
		rotateInfo: null,
		isstart: false,
		init: function () {
			var self = this;
			self.loadMsg();
			screencore.sendMsg2frame({ 'type': 'dzpchangeurl', 'rotateid': rotateid });
		},
		loadMsg: function () {
			var self = this;
			self.rollonetpl = template('rollone-tpl');
			screencore.ajaxSubmit("/screen/dzp/initdata", { rotateid: rotateid || '0' }).then(function (json) {
				if (json.code == 0) {
					self.rotateInfo = json.msg.rotate;
					$(".rulecont").html(self.rotateInfo.ruledes);
					if (json.msg.list.length > 0) {
						self.maxid = json.msg.list[0].id;
					}
					var ajaxluckers = json.msg.list.reverse(), msglen = ajaxluckers.length;
					if (msglen > 0) {
						for (var i = 0; i < msglen; i++) {
							var one = ajaxluckers[i];
							one.cjmode = self.rotateInfo.cjmode;
							$(".lucker-rolllist").append(self.rollonetpl(one));
						}
						self.oldluckers = ajaxluckers;
					}
					self.bindEvent();
					setTimeout(function () {
						self.loopRun();
					}, 2e3);
				} else {
					layerBox.showMsg(json.msg);
				}
			}, function () {
				layerBox.showMsg('加载出错');
			});
		},
		newQueue: [],
		loadMoreLucker: function () {
			var self = this;
			setInterval(function () {
				screencore.ajaxSubmit("/screen/dzp/ajaxluckerdata", { rotateid: rotateid || '0', maxid: self.maxid }).then(function (json) {
					if (json.code == 0) {
						var moredata = json.msg, morelen = moredata.length;
						if (morelen > 0) {
							self.newQueue = self.newQueue.concat(moredata);
							self.maxid = moredata[morelen - 1].id;
							$.each(moredata, function (i, v) {
								self.addnewMsg({
									id: v.id,
									prizename: v.prizename,
									nickname: v.nickname,
									avatar: v.avatar,
									cjmode: '2',
								});
							});
						}
					}
				});
			}, 5e3);
			//加载到了数据然后自动转动
			setInterval(function () {
				self.dzpRoll();
			}, 3e3);
		},
		dzpRoll: function () {
			var self = this;
			if (!self.isstart && self.newQueue.length > 0) {
				self.isstart = true;
				var one = self.newQueue.shift(), findkey = self.findluckerKey(one.prizeid);
				if (findkey != -1) {
					self.myLucky.defaultConfig.stopRange = screencore.randomInt(1, 9) / 10;
					self.myLucky.play();
					setTimeout(function () {
						self.myLucky.stop(findkey);
					}, 3e2);
				} else {
					setTimeout(function () {
						self.isstart = false;
					}, 1e2);
				}
			}
		},
		findluckerKey: function (pid) {
			var self = this, key = -1;
			$.each(self.rotateInfo.prizes, function (i, v) {
				if (v.prizeid == pid) {
					key = i;
					return false;
				}
			});
			return key;
		},
		initSocket: function () {
			var self = this, params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					screensocket.isclose = false;
					screencore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'luckmsg') {
					//self.addnewMsg(data);
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
			screensocket.init(params);
		},
		bindEvent: function () {
			var self = this;
			self.initSocket();
			self.cjstyleInit();
			keyboardJS.bind('space', function (e) {
				if (!$(".dzp-popbox").is(':hidden')) {
					$(".dzp-popbox .close-pop").trigger('click');
				} else {
					$(".lucky-btn").trigger('click');
				}
			});
			keyboardJS.bind('left', function (e) {
				layerBox.showConfirm('温馨提示', '确定要切换到上一轮么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit("/screen/dzp/changerotate", { rotateid: rotateid, type: '2' }).then(function (data) {
						if (data.code == 0) {
							window.location.href = data.msg;
						} else {
							layerBox.showMsg(data.msg);
						}
					});
				});
			});
			keyboardJS.bind('right', function (e) {
				layerBox.showConfirm('温馨提示', '确定要切换到下一轮么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit("/screen/dzp/changerotate", { rotateid: rotateid, type: '1' }).then(function (data) {
						if (data.code == 0) {
							window.location.href = data.msg;
						} else {
							layerBox.showMsg(data.msg);
						}
					});
				});
			});
			$(".dzp-popbox .close-pop").click(function () {
				$(".dzp-popbox").addClass('hidden');
			});
			$(".lucky-btn").click(function () {
				if (self.rotateInfo.cjmode != '1' || self.isstart) return false;
				self.isstart = true;
				screencore.ajaxSubmit('/screen/dzp/savelucker', { rotateid: rotateid }).then(function (data) {
					if (data.code == 0) {
						self.playrotateaudio();
						self.myLucky.defaultConfig.stopRange = screencore.randomInt(1, 9) / 10;
						self.myLucky.play();
						setTimeout(function () {
							self.myLucky.stop(data.msg.stopkey);
						}, 3e2);
						self.oneluckerid = data.msg.luckerid;
					} else {
						self.isstart = false;
						layerBox.showMsg(data.msg);
					}
				});
			});
		},
		cjstyleInit: function (cjstyle, prizes) {
			var self = this, cjstyle = cjstyle || self.rotateInfo.cjstyle, prizes = prizes || self.rotateInfo.prizes, cjprizes = [];
			$(".dzp-container").removeClass('display-none');
			if (cjstyle == '1') {
				$(".dzp-box").removeClass('dzp-jggbox');
				$(".dzptopimg").removeClass('hidden');
			} else {
				$(".dzp-box").addClass('dzp-jggbox');
				$(".jggtopimg").removeClass('hidden');
			}
			if (self.rotateInfo.cjmode != '1') {
				//微信扫码抽奖大屏幕不可以点击 并且还得加载历史中奖用户
				$(".lucky-btn").addClass('stopclick');
				//加载历史数据
				self.loadMoreLucker();
			}
			if (cjstyle == '1' && prizes.length > 8) {
				bigwheelConfig.imgs.width = '40px';
			}
			$.each(prizes, function (i, v) {
				if (cjstyle == '1') {
					cjprizes.push({
						background: v.bgcolor,
						fonts: [{ ...bigwheelConfig.fonts, text: v.prizename, fontColor: v.fontcolor }],
						imgs: [{ ...bigwheelConfig.imgs, src: v.prizeimg }],
						prizetype: v.prizetype,
						saverecord: v.saverecord,
					});
				} else {
					cjprizes.push({
						x: (i <= 2 ? i : ((i == 3 || i == 4) ? '2' : (i == 5 ? '1' : '0'))),
						y: (i <= 2 ? '0' : (i == 3 ? '1' : ((i >= 4 && i <= 6) ? '2' : '1'))),
						background: v.bgcolor,
						fonts: [{ ...jggConfig.fonts, text: v.prizename, fontColor: v.fontcolor }],
						imgs: [{ ...jggConfig.imgs, src: v.prizeimg }],
						prizetype: v.prizetype,
						saverecord: v.saverecord,
					});
				}
			});
			var plen = cjprizes.length;
			if (cjstyle == '2' && plen < 8) {
				var key = 0;
				for (var i = plen; i < 8; i++) {
					var prize = prizes[key];
					cjprizes.push({
						x: (i <= 2 ? i : ((i == 3 || i == 4) ? '2' : (i == 5 ? '1' : '0'))),
						y: (i <= 2 ? '0' : (i == 3 ? '1' : ((i >= 4 && i <= 6) ? '2' : '1'))),
						background: prize.bgcolor,
						fonts: [{ ...jggConfig.fonts, text: prize.prizename, fontColor: prize.fontcolor }],
						imgs: [{ ...jggConfig.imgs, src: prize.prizeimg }],
						prizetype: prize.prizetype,
						saverecord: prize.saverecord,
					});
					key++;
					if (key >= prizes.length) {
						key = 0;
					}
				}
			}
			var configData = cjstyle == '1' ? self.bigwheelInit(cjprizes) : self.jggInit(cjprizes);
			if (cjstyle == '1') {
				self.myLucky = new LuckyCanvas.LuckyWheel('#my-lucky', configData);
			} else {
				self.myLucky = new LuckyCanvas.LuckyGrid('#my-lucky', configData);
			}
			self.myLucky.init();
		},
		bigwheelInit: function (prizes) {
			var self = this; prizes = prizes || [];
			return {
				width: '448px',
				height: '448px',
				defaultConfig: {
					offsetDegree: 0,
					gutter: 1,
					accelerationTime: parseFloat(bigwheelConfig.accelerationTime) * 1e3,
					decelerationTime: parseFloat(bigwheelConfig.decelerationTime) * 1e3,
				},
				defaultStyle: {
					fontColor: '#bb3938',
					fontSize: '16px',
					fontWeight: 600,
					lineClamp: 2,
				},
				prizes: prizes,
				end: function (prize) {
					self.showpopbox(prize);
				},
			};
		},
		jggInit: function (prizes) {
			var self = this; prizes = prizes || [];
			return {
				width: '448px',
				height: '448px',
				defaultConfig: {
					gutter: 15,
					accelerationTime: parseFloat(jggConfig.accelerationTime) * 1e3,
					decelerationTime: parseFloat(jggConfig.decelerationTime) * 1e3,
				},
				defaultStyle: {
					fontColor: '#708ABF',
					fontSize: '15px',
					lineHeight: '18px',
					fontWeight: 600,
					lineClamp: 2,
					borderRadius: '16px',
					shadow: '',
				},
				activeStyle: {
					background: self.rotateInfo.jggbgcolor || '#f9732e',
					fontColor: self.rotateInfo.jggfontcolor || '#fff',
				},
				prizes: prizes,
				end: function (prize) {
					self.showpopbox(prize);
				},
			};
		},
		playrotateaudio: function () {
			var self = this;
			if (self.rotateInfo.cjstyle == '1') {
				if ($("#dzprotatemusic").length > 0) {
					$("#dzprotatemusic")[0].play();
				}
			} else if (self.rotateInfo.cjstyle == '2') {
				if ($("#jggrotatemusic").length > 0) {
					$("#jggrotatemusic")[0].play();
				}
			}
		},
		playsuccessaudio: function () {
			var self = this;
			if (self.rotateInfo.cjstyle == '1') {
				if ($("#dzprotatemusic").length > 0 && !$("#dzprotatemusic")[0].paused) {
					$("#dzprotatemusic")[0].currentTime = 0;
					$("#dzprotatemusic")[0].pause();
				}
				if ($("#dzpsumusic").length > 0) {
					$("#dzpsumusic")[0].play();
				}
			} else if (self.rotateInfo.cjstyle == '2') {
				if ($("#jggrotatemusic").length > 0 && !$("#jggrotatemusic")[0].paused) {
					$("#jggrotatemusic")[0].currentTime = 0;
					$("#jggrotatemusic")[0].pause();
				}
				if ($("#jggsumusic").length > 0) {
					$("#jggsumusic")[0].play();
				}
			}
		},
		showpopbox: function (prize) {
			var self = this;
			var popbox = $(".dzp-popbox");
			if (self.rotateInfo.cjmode == '1') {
				self.playsuccessaudio();
				popbox.find('.cjmode2').addClass('hidden');
				var tip = successtip;
				if (prize.prizetype == '3' && prize.saverecord == '2') {
					tip = failtip;
				}
				var cjmodebox = popbox.find('.cjmode1');
				cjmodebox.find('.tip').text(tip);
				cjmodebox.find('.prizeimg').attr('src', prize.imgs[0].src);
				cjmodebox.removeClass('hidden');
				popbox.find('.awardname').text(prize.fonts[0].text);
				popbox.removeClass('hidden');
				if ((prize.prizetype == '3' && prize.saverecord == '1') || prize.prizetype != '3') {
					self.addnewMsg({
						id: self.oneluckerid,
						prizename: prize.fonts[0].text,
						cjmode: '1',
					});
				}
				if (self.rotateInfo.speaktext == '1') {
					screencore.speakText(tip + prize.fonts[0].text);
				}
			}
			setTimeout(function () {
				self.isstart = false;
			}, 1e3);
		},
		addnewMsg: function (onelucker) {
			var self = this, contentsbox = $('.lucker-rollbox'), contentbox = $('.lucker-rolllist');
			self.oldluckers.push(onelucker);
			if (contentbox.outerHeight() < contentsbox.outerHeight()) {
				contentbox.append(self.rollonetpl(onelucker));
			}
		},
		maxrollcount: 200,
		loopRun: function () {
			var self = this;
			var contentsbox = $('.lucker-rollbox');
			var contentbox = $('.lucker-rolllist');
			if (contentbox.outerHeight() >= contentsbox.outerHeight()) {
				var firstdom = contentbox.find('li').first(), scrollH = firstdom.outerHeight();
				contentbox.css({
					"transform": "translate3d(0," + -scrollH + "px,0)",
					"transition": "transform .5s linear"
				})
				setTimeout(function () {
					firstdom.remove();
					contentbox.css({
						"transform": "translate3d(0,0,0)",
						"transition": "none"
					});
					var one = self.oldluckers.shift();
					contentbox.append(self.rollonetpl(one));
					self.oldluckers.push(one);
					if (self.oldluckers.length > self.maxrollcount) {
						var minId = Math.min.apply(Math, self.oldluckers.map(function (o) { return o.id }));
						var msgIndex = self.isExists(minId);
						if (msgIndex != -1) self.oldluckers.splice(msgIndex, 1);
					}
					setTimeout(function () {
						self.loopRun();
					}, 2e3);
				}, 550);
			} else {
				setTimeout(function () {
					self.loopRun();
				}, 2e3);
			}
		},
		isExists: function (msgid) {
			var self = this;
			var msgindex = -1;
			for (var i = 0, len = self.oldluckers.length; i < len; i++) {
				if (msgid == self.oldluckers[i].id) {
					msgindex = i;
					break;
				}
			}
			return msgindex;
		},
	};
	return screendzp;
})