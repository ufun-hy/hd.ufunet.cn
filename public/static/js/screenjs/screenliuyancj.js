define('screenliuyancj', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard', 'anime', 'screenjs/screen-prize', 'snabbt'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS, anime, screenPrize) {
	var screenliuyancj = {
		txt: '虚位以待',
		fromtype: '1',
		msgtpl: null,
		oldmsg: [],
		onepage: 4,
		prizeInfo: [],
		prizeIndex: 0,
		drawCount: 1,
		currentWinnerCount: 0,
		unifiedPrize: null,
		winnerRequestId: 0,
		luckerids: [],
		init: function () {
			var self = this;
			self.shapeTime = rotatesecond * 1e3;
			self.loadMsg();
		},
		loadMsg: function () {
			var self = this;
			self.msgtpl = template('msg-tpl');
			screencore.ajaxSubmit("/screen/liuyancj/initdata", { gametype: XCV3Config.gametype }).then(function (json) {
				if (json.code == 0) {
					self.prizeInfo = json.msg.prizelist;
					self.fromtype = json.msg.fromtype;
					if (self.prizeInfo.length > 0) {
						var ajaxmsgs = json.msg.list.reverse(), msglen = ajaxmsgs.length;
						for (var i = 0; i < msglen; i++) {
							var one = ajaxmsgs[i % msglen];
							one.content = screencore.emoToimg(one.content);
							$(".liuyan-messagelist").append(self.msgtpl(one));
						}
						self.oldmsg = ajaxmsgs;
						$(".liuyan-joinnum span").text(json.msg.total);
						self.bindEvent();
					} else {
						$(".emptybox").removeClass('display-none');
					}
				}
				setTimeout(function () {
					self.loopRun();
				}, 1e3);
			}, function () {
				layerBox.showMsg('加载出错');
			});
		},
		loopRun: function () {
			var self = this;
			var contentsbox = $('.liuyan-messageBox');
			var contentbox = $('.liuyan-messagelist');
			if (contentbox.outerHeight() >= contentsbox.outerHeight()) {
				var firstdom = contentbox.find('li').first(), scrollH = firstdom.outerHeight(true);
				anime({
					targets: contentbox.get(0),
					translateY: [0, -scrollH],
					easing: 'linear',
					duration: 2e3,
					//delay: self.loopDelay,
					complete: function () {
						var one = self.oldmsg.shift();
						self.oldmsg.push(one);
						one.content = screencore.emoToimg(one.content);
						contentbox.append(self.msgtpl(one));
						firstdom.remove();
						self.loopRun();
					},
				});
			} else {
				setTimeout(function () {
					self.loopRun();
				}, 2e3);
			}
		},
		loadjoinnum: function () {
			screencore.ajaxSubmit('/screen/liuyancj/dmusercount', {}).then(function (e) {
				if (e.code == 0) {
					$(".liuyan-joinnum span").text(e.msg);
				}
			});
		},
		getCurrentPrize: function () {
			return this.prizeInfo[this.prizeIndex] || null;
		},
		getRemainingCount: function () {
			var prize = this.getCurrentPrize();
			if (!prize) return 0;
			var total = parseInt(prize.prizenum, 10);
			if (isNaN(total) || total < 0) return 0;
			return Math.max(0, total - this.currentWinnerCount);
		},
		normalizeDrawCount: function (value) {
			var count = parseInt(value, 10);
			if (isNaN(count) || count < 1) count = 1;
			var remaining = this.getRemainingCount();
			if (remaining > 0) count = Math.min(count, remaining);
			return count;
		},
		getPrizeOptions: function () {
			var self = this;
			return self.prizeInfo.map(function (prize, index) {
				var copy = $.extend({}, prize);
				if (index == self.prizeIndex) copy.remaining = self.getRemainingCount();
				return copy;
			});
		},
		mountPrizeComponent: function () {
			var self = this, root = document.querySelector('.liuyan-prize-host');
			if (!screenPrize || !root) return;
			if (self.unifiedPrize) self.unifiedPrize.destroy();
			self.unifiedPrize = screenPrize.create({
				root: root,
				callbacks: {
					onPrizePrev: function () { if (self.prizeIndex > 0) self.selectPrize(self.prizeIndex - 1); },
					onPrizeNext: function () { if (self.prizeIndex < self.prizeInfo.length - 1) self.selectPrize(self.prizeIndex + 1); },
					onPrizeSelect: function (prize, index) { self.selectPrize(index); },
					onDrawCountChange: function (value) { self.setDrawCount(value); }
				}
			});
			self.unifiedPrize.mount();
			self.syncPrizeComponent();
		},
		syncPrizeComponent: function () {
			var self = this, prize = self.getCurrentPrize();
			if (!self.unifiedPrize || !prize) return;
			var remaining = self.getRemainingCount();
			self.unifiedPrize.update({
				state: 'ready',
				prize: $.extend({}, prize, { remaining: remaining }),
				prizes: self.getPrizeOptions(),
				prizeIndex: self.prizeIndex,
				drawCount: self.drawCount,
				maxDrawCount: Math.max(1, remaining),
				prizeSettingsVisible: true
			});
		},
		setDrawCount: function (value) {
			this.drawCount = this.normalizeDrawCount(value);
			this.syncPrizeComponent();
			return this.drawCount;
		},
		selectPrize: function (index) {
			var self = this;
			index = parseInt(index, 10);
			if (isNaN(index) || index < 0 || index >= self.prizeInfo.length) return false;
			self.prizeIndex = index;
			self.currentWinnerCount = 0;
			self.drawCount = self.normalizeDrawCount(self.prizeInfo[index].onceout);
			self.syncPrizeComponent();
			self.loadPrizeLuckers(self.prizeInfo[index].id);
			return true;
		},
		renderPrizeLuckers: function (lucker) {
			var rightlucktpl = template('rightlucker-tpl'), html = '';
			$.each(lucker || [], function (i, v) {
				var nickname = '';
				if (v.showitems.length > 0) {
					var bdval = '';
					$.each(v.showitems, function (index, val) { bdval += '<span>' + val + '</span>'; });
					nickname += bdval;
				} else {
					nickname += '<span>' + v.nickname + '</span>';
				}
				v.nickname = nickname;
				v.content = screencore.emoToimg(v.msgcontent);
				html += rightlucktpl(v);
			});
			$(".liuyancj-right ul").html(html);
		},
		loadPrizeLuckers: function (prizeid) {
			var self = this, requestId = ++self.winnerRequestId;
			screencore.ajaxSubmit('/screen/liuyancj/ajaxlucker', { prizeid: prizeid, gametype: XCV3Config.gametype }, '').then(function (e) {
				if (requestId != self.winnerRequestId || String(prizeid) != String((self.getCurrentPrize() || {}).id)) return;
				if (e.code == 0) {
					var lucker = e.msg.list || [];
					self.currentWinnerCount = lucker.length;
					self.drawCount = self.normalizeDrawCount(self.drawCount);
					self.renderPrizeLuckers(lucker);
					self.syncPrizeComponent();
				}
			});
		},
		initprize: function () {
			var self = this, showprize = self.prizeInfo[0];
			if (!showprize) return;
			self.prizeIndex = 0;
			self.currentWinnerCount = 0;
			self.drawCount = self.normalizeDrawCount(showprize.onceout);
			self.mountPrizeComponent();
			$(".liuyan-welcomeBox").removeClass('display-none');
			self.loadPrizeLuckers(showprize.id);
		},
		bindEvent: function () {
			var self = this;
			self.initprize();
			self.initSocket();
			self.initRolldm();
			setInterval(function () {
				self.loadjoinnum();
			}, 4e3);
			var hadclicked = false, canshowlay = false;
			$(".liuyan-startbtn").click(function () {
				var $this = $(this), prize = self.getCurrentPrize(), prizeid = prize && prize.id, onceout = self.drawCount, remaining = self.getRemainingCount();
				if (prizeid == '' || prizeid == null) return layerBox.showMsg('请选择奖品');
				if (!onceout || parseInt(onceout, 10) <= 0) return layerBox.showMsg('请设置正确的奖品抽取人数');
				if (remaining <= 0) return layerBox.showMsg((prize.prizename || prize.awardname || '当前奖品') + '人数已抽满');
				onceout = self.normalizeDrawCount(onceout);
				self.drawCount = onceout;
				self.syncPrizeComponent();
				if (hadclicked) return;
				hadclicked = true;
				screencore.hideFootAndQr();
				$(".liuyan-welcomeBox").addClass('display-none');
				$(".liuyan-output").addClass('display-none');
				$(".liuyan-rolldmmain").removeClass('display-none');
				screencore.ajaxSubmit('/screen/liuyancj/savelucker', { prizeid: prizeid, selnum: onceout, gametype: XCV3Config.gametype }).then(function (e) {
					if (e.code == 0) {
						canshowlay = true;
						self.luckerids = e.msg.luckerids;
						var layusertpl = template('layuser-tpl');
						var rightlucktpl = template('rightlucker-tpl');
						var html = '';
						var luckhtml = '';
						$.each(e.msg.list, function (i, v) {
							var nickname = '';
							if (v.showitems.length > 0) {
								var bdval = '';
								$.each(v.showitems, function (index, val) {
									bdval += '<span>' + val + '</span>';
								});
								nickname += bdval;
							} else {
								nickname += '<span>' + v.nickname + '</span>';
							}
							v.nickname = nickname;
							v.content = screencore.emoToimg(v.content);
							html += layusertpl(v);
							luckhtml += rightlucktpl(v);
						});
						$(".liuyan-output-main ul").html(html);
						$(".liuyancj-right ul").prepend(luckhtml);
						self.currentWinnerCount += (e.msg.list || []).length;
						self.drawCount = self.normalizeDrawCount(self.drawCount);
						self.syncPrizeComponent();
						screencore.bgmusicpause();
						if ($("#cjingmusic").length) {
							$("#cjingmusic")[0].play();
						}
					} else {
						hadclicked = false;
						$(".liuyan-welcomeBox").removeClass('display-none');
						$(".liuyan-rolldmmain").addClass('display-none');
						layerBox.showMsg(e.msg);
					}

				}, function () {
					layerBox.showMsg('网络异常');
					hadclicked = false;
				});
			});
			$(".liuyan-stopbtn").click(function () {
				if (!canshowlay) return;
				hadclicked = false;
				canshowlay = false;
				$(".liuyan-rolldmmain").addClass('display-none');
				$(".liuyan-output").removeClass('display-none');
				$(".liuyan-output-main").animateControl("bounceInDown");
				$(".liuyan-welcomeBox").removeClass('display-none');
				if ($("#cjingmusic").length) {
					$("#cjingmusic")[0].currentTime = 0;
					$("#cjingmusic")[0].pause();
				}
				if ($("#cjendmusic").length) {
					$("#cjendmusic")[0].play();
				}
				screencore.sendLuckerTpl({ luckerids: self.luckerids }, function () {
					self.luckerids = [];
				});
			});
			$(".liuyan-output-close").on('click', function () {
				if ($("#cjendmusic").length) {
					$("#cjendmusic")[0].currentTime = 0;
					if (!$("#cjendmusic")[0].paused) {
						$("#cjendmusic")[0].pause();
					}
				}
				$(".liuyan-output-main").animateControl("bounceOutDown", function () {
					$(".liuyan-output").addClass('display-none');
					setTimeout(function () {
						screencore.bgmusicplay();
					}, 1e3);
				});
			});
			$(".liuyan-luckerlist").on('click', ".right-luckerdel", function () {
				var $this = $(this), prize = self.getCurrentPrize(), prizeid = prize && prize.id, recordid = $this.attr('data-id');
				layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/liuyancj/dellucker', { recordid: recordid, prizeid: prizeid }, '').then(function (e) {
						if (e.code == 0) {
							$this.parent().remove();
							self.currentWinnerCount = Math.max(0, self.currentWinnerCount - 1);
							self.drawCount = self.normalizeDrawCount(self.drawCount);
							self.syncPrizeComponent();
							layerBox.showMsg('删除成功');
						} else {
							layerBox.showMsg(e.msg);
						}
					});
				});
			});
			keyboardJS.bind('space', function (e) {
				if (hadclicked) {
					$(".liuyan-stopbtn").trigger('click');
				} else {
					if ($(".liuyan-output").is(':hidden')) {
						$(".liuyan-startbtn").trigger('click');
					} else {
						$(".liuyan-output-close").trigger('click');
					}
				}
			});
			keyboardJS.bind('/', function (e) {
				var prize = self.getCurrentPrize(), prizeid = prize && prize.id;
				if (prizeid == '' || prizeid == null) return;
				layerBox.showConfirm('警告', '清空将删除' + (prize.prizename || prize.awardname || '当前奖品') + '所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/liuyancj/delalllucker', { prizeid: prizeid, gametype: XCV3Config.gametype }, '').then(function (e) {
						if (e.code == 0) {
							$(".liuyancj-right ul").empty();
							self.currentWinnerCount = 0;
							self.drawCount = self.normalizeDrawCount(self.drawCount);
							self.syncPrizeComponent();
							layerBox.showMsg('清空成功');
						} else {
							layerBox.showMsg(e.msg);
						}
					});
				});
			});
			keyboardJS.bind('left', function () {
				if (self.prizeIndex > 0) self.selectPrize(self.prizeIndex - 1);
			});
			keyboardJS.bind('right', function () {
				if (self.prizeIndex < self.prizeInfo.length - 1) self.selectPrize(self.prizeIndex + 1);
			});
			keyboardJS.bind('up', function () { self.setDrawCount(self.drawCount + 1); });
			keyboardJS.bind('down', function () { self.setDrawCount(self.drawCount - 1); });
		},
		initSocket: function () {
			var self = this, params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					screensocket.isclose = false;
					screencore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'liuyancjmsg') {
					var messages = data.messages;
					if (messages) {
						if ($.isArray(messages) && messages.length) {
							$.each(messages, function (i, val) {
								if (val.type == '1') {
									self.addnewMsg(val);
								}
							});
						}
					} else {
						self.addnewMsg(data);
					}
				} else if (data.type == 'screendm') {
					var messages = data.messages;
					if (messages) {
						if ($.isArray(messages) && messages.length) {
							$.each(messages, function (i, val) {
								if (val.type == '1') {
									if (data.dmtype == self.fromtype) {
										self.addnewMsg(val);
									}
								}
								fulldm.addBullet(val);
							});
						}
					} else {
						if (data.dmtype == self.fromtype) {
							self.addnewMsg(data);
						}
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
		addnewMsg: function (msg) {
			var self = this;
			if (msg.type == 'screendm') {
				msg.type = msg.msgtype || '1';
			}
			if (msg.type == '2') {
				return false;
			}
			self.oldmsg.push(msg);
			var contentsbox = $('.liuyan-messageBox');
			var contentbox = $('.liuyan-messagelist');
			if (contentbox.outerHeight() < contentsbox.outerHeight()) {
				msg.content = screencore.emoToimg(msg.content);
				contentbox.append(self.msgtpl(msg));
			}
			var replaceAll = $(".liuyan-rolldmmain .card-needreplace");
			if (replaceAll.length <= 0) {
				var replaceone = $(".liuyan-rolldmmain li").eq(Math.floor((Math.random() * $(".liuyan-rolldmmain li").length)));
			} else {
				var replaceone = replaceAll.eq(0);
			}
			replaceone.find(".card-avatar img").attr("src", msg.avatar);
			replaceone.find(".card-content").html(screencore.emoToimg(msg.content));
			replaceone.removeClass('card-needreplace');
		},
		initRolldm: function () {
			var self = this;
			self.rolltpl = template('roll-tpl');
			self.Stage = self.makeStage();
			self.Utils = self.makeUtils();
			self.Card = self.makeCard();
			self.screw = self.makeScrew();
			self.changeShape(self.shape);
		},
		stageObj: $(".rolldmBox ul"),
		shape: 'screw',
		shapeTime: 20e3,
		Utils: {},
		Stage: {},
		Card: {},
		screw: {},
		deg: function (o) {
			return Math.PI / 180 * o
		},
		rolltpl: null,
		makeUtils: function () {
			var o = window.innerWidth,
				i = window.innerHeight;
			return {
				width: o,
				height: i,
			}
		},
		makeStage: function () {
			var self = this;
			var o = {
				fromRotation: [0, 0, 0],
				rotation: [0, 2 * Math.PI, 0],
				duration: 35e3,
				complete: function () {
					i()
				}
			},
				i = function () {
					self.Stage.stop(), self.Stage.snabbt(o)
				};
			return {//          stage 
				default: function (n) {
					n.transformOrigin || (n.transformOrigin = [0, 0, 0]);
					n.duration || (n.duration = 35e3);
					Object.keys(n).forEach(function (i) {
						o[i] = n[i]
					});
					self.Stage.snabbt({
						position: [0, 0, 0],
						duration: 100,
						complete: i
					})
				},
				snabbt: self.stageObj.snabbt.bind(self.stageObj),
				stop: function () {
					self.stageObj.snabbt("stop")
				},
				reset: function (o) {
					self.stageObj.css("transform", "")
				}
			}
		},
		makeCard: function () {
			var self = this;
			var o = -1,
				i = [],
				n = function (key) {
					var onedm = { avatar: defaultimg, content: self.txt, needreplace: false };
					if (self.oldmsg[key]) {
						onedm.avatar = self.oldmsg[key].avatar;
						onedm.content = screencore.emoToimg(self.oldmsg[key].content);
					} else {
						var msg = self.oldmsg[Math.floor((Math.random() * self.oldmsg.length))];
						if (msg) {
							onedm.avatar = msg.avatar;
							onedm.content = screencore.emoToimg(msg.content);
						}
						onedm.needreplace = true;
					}
					var o = $(self.rolltpl(onedm));
					i.push(o);
					self.stageObj.append(o);
				};
			return {
				count: function () {
					return i.length;
				},
				init: function (o) {
					var t = o - i.length;//160 - 0
					if (t > 0) {
						for (var e = i.length; e < o; e++) {
							n(e);
						}
					}
				},
				reset: function () {
					o = -1;
				},
				next: function () {
					if (++o, i[o]) return i[o]
				}
			}
		},
		makeScrew: function () {
			var self = this;
			var o = [], e = 500, s = 4, a = 40, l = self.Utils.width / s / a, r = 360 / a;
			var p = s / 2, d = a / 2;
			for (var c = 0; c < s; c++) {//4 * 40 160个card
				for (var u = 0; u < a; u++) {
					var f = self.deg(r * u),
						h = (c - p) * a * l + (u - d) * l,
						g = e * Math.sin(f),
						v = e * Math.cos(f),
						m = f,
						b = 0,
						w = 0;
					o.push({
						position: [h, g, v],
						rotation: [m, b, w],
						skew: [0, self.deg(6)]
					})
				}
			}
			return {
				card: {
					count: o.length,
					allCard: o,
					perspective: 3500
				},
				stage: function () {
					var n = function () {
						self.Stage.snabbt({
							fromRotation: [0, 0, 0],
							rotation: [2 * Math.PI, 0, 0],
							duration: self.shapeTime,
							complete: function () {
								n()
							}
						})
					};
					return n;
				}
			}
		},
		Build: function () {
			var self = this;
			var o = self[self.shape];
			if (o) {
				var i = o.stage,
					n = o.card,
					e = function () { };
				if (i && "function" == typeof i) {
					//self rotate
					e = i();
				} else {
					//stage rotate
					self.Stage.default(i);
				}
				self.Card.reset();
				for (var s = 0, a = 0; a < n.count; a++) {
					var l = self.Card.next();
					if (l) {
						var r = n.allCard[a];
						var c = {
							rotation: r.rotation,
							position: r.position,
							scale: r.scale || [1, 1],
							complete: function () {
								++s, s == n.count && e();
							}
						};
						c.duration = 0;
						c.delay = 0;
						r.skew || (r.skew = [0, 0]), c.skew = r.skew, l.snabbt(c)
					}
				}
			}
		},
		changeShape: function (shape) {
			var self = this;
			self.shape = shape;
			var i = self[shape];
			self.Card.init(i.card.count);
			self.Build();
		},
	};
	return screenliuyancj;
})