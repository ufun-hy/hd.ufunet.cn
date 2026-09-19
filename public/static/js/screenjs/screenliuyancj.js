define('screenliuyancj', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard', 'anime', 'screenjs/screen-prize', 'screenjs/screen-stage-ui', 'snabbt'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS, anime, screenPrize, screenStageUi) {
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
		winnerCountReady: false,
		unifiedPrize: null,
		stageUi: null,
		winnerRequestId: 0,
		recordsRequestId: 0,
		recordsReturnState: null,
		prizeSettingsVisible: false,
		visualState: 'ready',
		drawRequestPending: false,
		lastDrawWinners: [],
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
		getVisualState: function () {
			return this.visualState || 'ready';
		},
		getRemainingCount: function () {
			var prize = this.getCurrentPrize();
			if (!prize || !this.winnerCountReady) return null;
			var total = parseInt(prize.prizenum, 10);
			if (isNaN(total) || total < 0) return null;
			return Math.max(0, total - this.currentWinnerCount);
		},
		countWinners: function (list) {
			if (!list) return 0;
			if ($.isArray(list)) return list.length;
			if (typeof list == 'object') return Object.keys(list).length;
			return 0;
		},
		normalizeDrawCount: function (value) {
			var count = parseInt(value, 10);
			if (isNaN(count) || count < 1) count = 1;
			var remaining = this.getRemainingCount();
			if (remaining !== null && remaining > 0) count = Math.min(count, remaining);
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
		toStageWinners: function (list) {
			return $.map(list || [], function (winner) {
				winner = winner || {};
				var showitems = $.isArray(winner.showitems) ? winner.showitems : [];
				return {
					name: (showitems.length ? showitems[0] : winner.nickname) || '中奖用户',
					extras: showitems.length > 1 ? showitems.slice(1, 3) : [],
					recordId: winner.recordid || winner.luckerid || null
				};
			});
		},
		mountPrizeComponent: function () {
			var self = this, root = document.querySelector('.liuyan-prize-host');
			if (!screenPrize || !root) return;
			if (self.unifiedPrize) self.unifiedPrize.destroy();
			self.unifiedPrize = screenPrize.create({
				root: root,
				callbacks: {
					onPrizePrev: function () { if (self.getVisualState() == 'ready' && self.prizeIndex > 0) self.selectPrize(self.prizeIndex - 1); },
					onPrizeNext: function () { if (self.getVisualState() == 'ready' && self.prizeIndex < self.prizeInfo.length - 1) self.selectPrize(self.prizeIndex + 1); },
					onPrizeSelect: function (prize, index) { if (self.getVisualState() == 'ready') self.selectPrize(index); },
					onDrawCountChange: function (value) { self.setDrawCount(value); }
				}
			});
			self.unifiedPrize.mount();
			self.syncSharedUi();
		},
		mountStageUi: function () {
			var self = this, root = document.querySelector('.liuyancj-mainbox');
			if (!screenStageUi || !root) return;
			if (self.stageUi) self.stageUi.destroy();
			self.stageUi = screenStageUi.create({
				root: root,
				speedEnabled: false,
				callbacks: {
					onPrimaryAction: function () { return self.handlePrimaryAction(); },
					onPrizeSettingsToggle: function () { return self.togglePrizeSettings(); },
					onRecords: function () { return self.openRecords(); },
					onRecordsClose: function () { return self.closeRecords(); },
					onRecordsRetry: function () { return self.openRecords(true); },
					onRecordDelete: function (recordId) { return self.deleteRecord(recordId); }
				}
			});
			self.stageUi.mount();
			self.syncSharedUi();
		},
		destroySharedUi: function () {
			if (this.unifiedPrize) this.unifiedPrize.destroy();
			if (this.stageUi) this.stageUi.destroy();
			this.unifiedPrize = null;
			this.stageUi = null;
		},
		getControlSnapshot: function () {
			var self = this, remaining = self.getRemainingCount(), state = self.getVisualState();
			var canStart = state == 'ready' && remaining !== null && remaining > 0 && self.drawCount > 0 && self.drawCount <= remaining && !self.drawRequestPending;
			return {
				state: state,
				prize: $.extend({}, self.getCurrentPrize() || {}, { remaining: remaining }),
				prizes: self.getPrizeOptions(),
				prizeIndex: self.prizeIndex,
				drawCount: self.drawCount,
				onceout: self.drawCount,
				maxDrawCount: remaining === null ? 999 : Math.max(1, remaining),
				drawCountReadonly: false,
				drawCountLabel: '单次抽取',
				drawCountUnit: '人',
				prizeSettingsEnabled: !!self.unifiedPrize && state == 'ready',
				prizeSettingsVisible: !!self.unifiedPrize && state == 'ready' && !!self.prizeSettingsVisible,
				primaryEnabled: canStart,
				primaryText: state == 'drawing' ? '停止抽奖' : (state == 'result' ? '关闭结果' : (state == 'records' ? '记录查看中' : (state == 'requesting' ? '正在准备...' : '开始抽奖')))
			};
		},
		syncSharedUi: function () {
			var snapshot = this.getControlSnapshot();
			if (this.unifiedPrize) this.unifiedPrize.update(snapshot);
			if (this.stageUi) this.stageUi.update(snapshot);
		},
		setVisualState: function (state) {
			this.visualState = /^(ready|requesting|drawing|result|records)$/.test(state) ? state : 'ready';
			if (this.visualState != 'ready') this.prizeSettingsVisible = false;
			this.syncSharedUi();
		},
		togglePrizeSettings: function () {
			if (this.getVisualState() != 'ready' || !this.unifiedPrize) return false;
			this.prizeSettingsVisible = !this.prizeSettingsVisible;
			this.syncSharedUi();
			return this.prizeSettingsVisible;
		},
		setDrawCount: function (value) {
			if (this.getVisualState() != 'ready') return false;
			this.drawCount = this.normalizeDrawCount(value);
			this.syncSharedUi();
			return this.drawCount;
		},
		selectPrize: function (index) {
			var self = this;
			if (self.getVisualState() != 'ready') return false;
			index = parseInt(index, 10);
			if (isNaN(index) || index < 0 || index >= self.prizeInfo.length) return false;
			self.prizeIndex = index;
			self.currentWinnerCount = 0;
			self.winnerCountReady = false;
			self.drawCount = self.normalizeDrawCount(self.prizeInfo[index].onceout);
			self.syncSharedUi();
			self.loadPrizeLuckers(self.prizeInfo[index].id);
			return true;
		},
		loadPrizeLuckers: function (prizeid) {
			var self = this, requestId = ++self.winnerRequestId;
			screencore.ajaxSubmit('/screen/liuyancj/ajaxlucker', { prizeid: prizeid, gametype: XCV3Config.gametype }, '').then(function (e) {
				if (requestId != self.winnerRequestId || String(prizeid) != String((self.getCurrentPrize() || {}).id)) return;
				if (e.code == 0) {
					self.currentWinnerCount = self.countWinners(e.msg.list);
					self.winnerCountReady = true;
					self.drawCount = self.normalizeDrawCount(self.drawCount);
					self.syncSharedUi();
				}
			}, function () {
				if (requestId != self.winnerRequestId) return;
				self.winnerCountReady = false;
				self.syncSharedUi();
			});
		},
		initprize: function () {
			var self = this, showprize = self.prizeInfo[0];
			if (!showprize) return;
			self.prizeIndex = 0;
			self.currentWinnerCount = 0;
			self.winnerCountReady = false;
			self.drawCount = self.normalizeDrawCount(showprize.onceout);
			self.mountPrizeComponent();
			self.loadPrizeLuckers(showprize.id);
		},
		startLottery: function () {
			var self = this, prize = self.getCurrentPrize(), remaining = self.getRemainingCount();
			if (self.getVisualState() != 'ready' || self.drawRequestPending) return false;
			if (!prize || prize.id === undefined || prize.id === null || prize.id === '') return layerBox.showMsg('请选择奖品');
			if (remaining === null) return layerBox.showMsg('正在读取当前奖品名额，请稍候');
			if (remaining <= 0) return layerBox.showMsg((prize.prizename || prize.awardname || '当前奖品') + '人数已抽满');
			var onceout = self.normalizeDrawCount(self.drawCount);
			if (!onceout || onceout <= 0 || onceout > remaining) return layerBox.showMsg('请设置正确的奖品抽取人数');
			self.drawCount = onceout;
			self.drawRequestPending = true;
			self.setVisualState('requesting');
			screencore.ajaxSubmit('/screen/liuyancj/savelucker', { prizeid: prize.id, selnum: onceout, gametype: XCV3Config.gametype }).then(function (e) {
				self.drawRequestPending = false;
				if (e.code != 0) {
					self.setVisualState('ready');
					return layerBox.showMsg(e.msg);
				}
				self.luckerids = e.msg.luckerids || [];
				self.lastDrawWinners = self.toStageWinners(e.msg.list || []);
				self.currentWinnerCount += self.countWinners(e.msg.list);
				self.winnerCountReady = true;
				self.drawCount = self.normalizeDrawCount(self.drawCount);
				screencore.hideFootAndQr();
				$(".liuyan-rolldmmain").removeClass('display-none');
				self.setVisualState('drawing');
				screencore.bgmusicpause();
				if ($("#cjingmusic").length) $("#cjingmusic")[0].play();
			}, function () {
				self.drawRequestPending = false;
				self.setVisualState('ready');
				layerBox.showMsg('网络异常');
			});
			return true;
		},
		stopLottery: function () {
			var self = this;
			if (self.getVisualState() != 'drawing') return false;
			$(".liuyan-rolldmmain").addClass('display-none');
			if ($("#cjingmusic").length) {
				$("#cjingmusic")[0].currentTime = 0;
				$("#cjingmusic")[0].pause();
			}
			if ($("#cjendmusic").length) $("#cjendmusic")[0].play();
			self.visualState = 'result';
			if (self.stageUi) self.stageUi.setResult(self.lastDrawWinners, $.extend({}, self.getCurrentPrize() || {}, { remaining: self.getRemainingCount() }));
			self.syncSharedUi();
			screencore.sendLuckerTpl({ luckerids: self.luckerids }, function () { self.luckerids = []; });
			return true;
		},
		closeResult: function () {
			if (this.getVisualState() != 'result') return false;
			if ($("#cjendmusic").length) {
				$("#cjendmusic")[0].currentTime = 0;
				if (!$("#cjendmusic")[0].paused) $("#cjendmusic")[0].pause();
			}
			this.lastDrawWinners = [];
			this.setVisualState('ready');
			setTimeout(function () { screencore.bgmusicplay(); }, 1e3);
			return true;
		},
		handlePrimaryAction: function () {
			var state = this.getVisualState();
			if (state == 'ready') return this.startLottery();
			if (state == 'drawing') return this.stopLottery();
			if (state == 'result') return this.closeResult();
			return false;
		},
		openRecords: function () {
			var self = this, prize = self.getCurrentPrize();
			if (!self.stageUi || !prize || (self.getVisualState() != 'ready' && self.getVisualState() != 'result' && self.getVisualState() != 'records')) return false;
			if (self.getVisualState() != 'records') self.recordsReturnState = self.getVisualState() == 'result' ? 'result' : 'ready';
			var requestId = ++self.recordsRequestId;
			self.visualState = 'records';
			self.syncSharedUi();
			self.stageUi.setRecords(null, 'loading');
			screencore.ajaxSubmit('/screen/liuyancj/ajaxlucker', { prizeid: prize.id, gametype: XCV3Config.gametype }, '').then(function (e) {
				if (requestId != self.recordsRequestId || self.getVisualState() != 'records') return;
				if (e.code == 0) {
					var list = e.msg.list || [];
					self.currentWinnerCount = self.countWinners(list);
					self.winnerCountReady = true;
					self.drawCount = self.normalizeDrawCount(self.drawCount);
					self.stageUi.setRecords(self.toStageWinners(list), 'ready');
					self.syncSharedUi();
				} else {
					self.stageUi.setRecords(e.msg || '中奖记录加载失败', 'error');
				}
			}, function () {
				if (requestId != self.recordsRequestId || self.getVisualState() != 'records') return;
				self.stageUi.setRecords('网络异常，请重试', 'error');
			});
			return true;
		},
		closeRecords: function () {
			if (this.getVisualState() != 'records') return false;
			this.recordsRequestId++;
			if (this.stageUi) this.stageUi.closeRecords();
			this.visualState = this.recordsReturnState || 'ready';
			this.recordsReturnState = null;
			this.syncSharedUi();
			return true;
		},
		deleteRecord: function (recordId) {
			var self = this, prize = self.getCurrentPrize();
			if (!recordId || !prize) return false;
			layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
				screencore.ajaxSubmit('/screen/liuyancj/dellucker', { recordid: recordId, prizeid: prize.id }, '').then(function (e) {
					if (e.code == 0) {
						self.currentWinnerCount = Math.max(0, self.currentWinnerCount - 1);
						self.winnerCountReady = true;
						self.drawCount = self.normalizeDrawCount(self.drawCount);
						self.syncSharedUi();
						layerBox.showMsg('删除成功');
						if (self.getVisualState() == 'records') self.openRecords();
					} else {
						layerBox.showMsg(e.msg);
					}
				});
			});
			return true;
		},
		clearCurrentPrizeWinners: function () {
			var self = this, prize = self.getCurrentPrize();
			if (!prize || self.getVisualState() == 'drawing' || self.getVisualState() == 'requesting') return false;
			layerBox.showConfirm('警告', '清空将删除' + (prize.prizename || prize.awardname || '当前奖品') + '所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
				screencore.ajaxSubmit('/screen/liuyancj/delalllucker', { prizeid: prize.id, gametype: XCV3Config.gametype }, '').then(function (e) {
					if (e.code == 0) {
						self.currentWinnerCount = 0;
						self.winnerCountReady = true;
						self.drawCount = self.normalizeDrawCount(self.drawCount);
						self.syncSharedUi();
						layerBox.showMsg('清空成功');
						if (self.getVisualState() == 'records') self.openRecords();
					} else {
						layerBox.showMsg(e.msg);
					}
				});
			});
			return true;
		},
		bindEvent: function () {
			var self = this;
			self.initprize();
			self.mountStageUi();
			self.initSocket();
			self.initRolldm();
			setInterval(function () { self.loadjoinnum(); }, 4e3);
			keyboardJS.bind('space', function () { self.handlePrimaryAction(); });
			keyboardJS.bind('/', function () { self.clearCurrentPrizeWinners(); });
			keyboardJS.bind('left', function () { if (self.getVisualState() == 'ready' && self.prizeIndex > 0) self.selectPrize(self.prizeIndex - 1); });
			keyboardJS.bind('right', function () { if (self.getVisualState() == 'ready' && self.prizeIndex < self.prizeInfo.length - 1) self.selectPrize(self.prizeIndex + 1); });
			keyboardJS.bind('up', function () { if (self.getVisualState() == 'ready') self.setDrawCount(self.drawCount + 1); });
			keyboardJS.bind('down', function () { if (self.getVisualState() == 'ready') self.setDrawCount(Math.max(1, self.drawCount - 1)); });
			keyboardJS.bind('shift', function () { self.openRecords(); });
			if (typeof window != 'undefined' && window.addEventListener) window.addEventListener('pagehide', function () { self.destroySharedUi(); });
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