define('screenliuyancj', ['screensocket', 'screencore', 'layerBox', 'fulldm', 'keyboard', 'screenjs/screen-prize', 'screenjs/screen-stage-ui', 'screenjs/screen-message-danmaku'], function (screensocket, screencore, layerBox, fulldm, keyboardJS, screenPrize, screenStageUi, messageDanmaku) {
	var screenliuyancj = {
		fromtype: '1',
		prizeInfo: [],
		prizeIndex: 0,
		drawCount: 1,
		currentWinnerCount: 0,
		winnerCountReady: false,
		unifiedPrize: null,
		stageUi: null,
		winnerRequestId: 0,
		recordsRequestId: 0,
		winnerDataVersions: {},
		winnerMutationPending: false,
		winnerMutationPrizeId: null,
		recordsReturnState: null,
		prizeSettingsVisible: false,
		visualState: 'ready',
		drawRequestPending: false,
		lastDrawWinners: [],
		danmaku: null,
		animationLockPending: false,
		startupPending: false,
		startupTimer: null,
		lastDrawMessages: [],
		bgTimer: null,
		destroyed: false,
		luckerids: [],
		init: function () {
            var self = this;
            self.destroyed = false;
            self.onPageHide = function () { self.destroySharedUi(); };
            window.addEventListener('pagehide', self.onPageHide);
            self.bindSpaceControl();
            screencore.ajaxSubmit('/screen/liuyancj/initdata', { gametype: XCV3Config.gametype }).then(function (json) {
                if (self.destroyed) return;
                if (json.code != 0) return layerBox.showMsg(json.msg || '加载出错');
                self.prizeInfo = json.msg.prizelist || [];
                self.fromtype = json.msg.fromtype;
                self.danmaku = messageDanmaku.create({
                    root: document.querySelector('.liuyan-danmaku-host'),
                    formatContent: function (content) { return screencore.emoToimg(content); }
                }).mount((json.msg.list || []).slice().reverse());
                // 本页由奖池消息驱动展示；普通弹幕的开关继续控制同一显示层。
                fulldm.setExternalDisplay(self.danmaku);
                if (!self.prizeInfo.length) $('.emptybox').removeClass('display-none');
                self.bindEvent();
            }, function () { if (!self.destroyed) layerBox.showMsg('加载出错'); });
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
		getPrizeDataKey: function (prizeId) {
			return prizeId === undefined || prizeId === null ? '' : String(prizeId);
		},
		getWinnerDataVersion: function (prizeId) {
			var key = this.getPrizeDataKey(prizeId);
			return key && this.winnerDataVersions[key] ? this.winnerDataVersions[key] : 0;
		},
		advanceWinnerDataVersion: function (prizeId) {
			var key = this.getPrizeDataKey(prizeId);
			if (!key) return 0;
			var next = this.getWinnerDataVersion(prizeId) + 1;
			this.winnerDataVersions[key] = next;
			return next;
		},
		isWinnerDataVersionCurrent: function (prizeId, version) {
			return version === this.getWinnerDataVersion(prizeId);
		},
		isCurrentPrizeId: function (prizeId) {
			var prize = this.getCurrentPrize();
			return !!prize && this.getPrizeDataKey(prize.id) === this.getPrizeDataKey(prizeId);
		},
		beginWinnerMutation: function (prizeId) {
			if (this.winnerMutationPending || !this.getPrizeDataKey(prizeId)) return false;
			this.winnerMutationPending = true;
			this.winnerMutationPrizeId = this.getPrizeDataKey(prizeId);
			this.prizeSettingsVisible = false;
			this.advanceWinnerDataVersion(prizeId);
			this.winnerRequestId++;
			this.recordsRequestId++;
			if (this.isCurrentPrizeId(prizeId)) {
				this.winnerCountReady = false;
				this.syncSharedUi();
			}
			return true;
		},
		endWinnerMutation: function (prizeId) {
			if (!this.winnerMutationPending) return false;
			if (this.winnerMutationPrizeId !== this.getPrizeDataKey(prizeId)) return false;
			this.winnerMutationPending = false;
			this.winnerMutationPrizeId = null;
			this.syncSharedUi();
			return true;
		},
		refreshCurrentPrizeWinnerState: function (prizeId) {
			if (!this.isCurrentPrizeId(prizeId)) return false;
			if (this.getVisualState() == 'records') return this.openRecords();
			this.loadPrizeLuckers(prizeId);
			return true;
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
            this.destroyed = true;
            this.winnerRequestId++;
            this.recordsRequestId++;
            window.removeEventListener('pagehide', this.onPageHide);
            this.animationLockPending = false;
            this.startupPending = false;
            clearTimeout(this.startupTimer);
            document.removeEventListener('keydown', this.onSpaceDown, true);
            document.removeEventListener('keyup', this.onSpaceUp, true);
            window.removeEventListener('blur', this.onSpaceBlur);
            clearTimeout(this.bgTimer);
            if (this.danmaku) this.danmaku.destroy();
            fulldm.setExternalDisplay(null);
            this.danmaku = null;
			if (this.unifiedPrize) this.unifiedPrize.destroy();
			if (this.stageUi) this.stageUi.destroy();
			this.unifiedPrize = null;
			this.stageUi = null;
		},
		getControlSnapshot: function () {
			var self = this, remaining = self.getRemainingCount(), state = self.getVisualState();
			var canStart = state == 'ready' && remaining !== null && remaining > 0 && self.drawCount > 0 && self.drawCount <= remaining && !self.drawRequestPending && !self.winnerMutationPending;
			return {
				state: self.animationLockPending ? 'requesting' : self.startupPending ? 'starting' : state,
				prize: $.extend({}, self.getCurrentPrize() || {}, { remaining: remaining }),
				prizes: self.getPrizeOptions(),
				prizeIndex: self.prizeIndex,
				drawCount: self.drawCount,
				onceout: self.drawCount,
				maxDrawCount: remaining === null ? 999 : Math.max(1, remaining),
				drawCountReadonly: false,
				drawCountLabel: '单次抽取',
				drawCountUnit: '人',
				prizeSettingsEnabled: !!self.unifiedPrize && state == 'ready' && !self.winnerMutationPending,
				prizeSettingsVisible: !!self.unifiedPrize && state == 'ready' && !self.winnerMutationPending && !!self.prizeSettingsVisible,
				primaryEnabled: canStart,
				primaryText: self.animationLockPending ? '正在锁定留言...' : self.startupPending ? '正在启动...' : state == 'drawing' ? '停止抽奖' : (state == 'result' ? '关闭结果' : (state == 'records' ? '记录查看中' : (state == 'requesting' ? '正在准备...' : '开始抽奖')))
			};
		},
		syncSharedUi: function () {
			var snapshot = this.getControlSnapshot();
			// 锁定期间控制台禁用操作，但礼品保持 drawing 隐藏态，避免遮住中奖留言。
			if (this.unifiedPrize) this.unifiedPrize.update($.extend({}, snapshot, {state: this.getVisualState()}));
			if (this.stageUi) this.stageUi.update(snapshot);
            if (this.danmaku && !this.animationLockPending) this.danmaku.setState(this.getVisualState());
		},
		setVisualState: function (state) {
			this.visualState = /^(ready|requesting|drawing|result|records)$/.test(state) ? state : 'ready';
			if (this.visualState != 'ready') this.prizeSettingsVisible = false;
			this.syncSharedUi();
		},
		togglePrizeSettings: function () {
			if (this.getVisualState() != 'ready' || !this.unifiedPrize || this.winnerMutationPending) return false;
			this.prizeSettingsVisible = !this.prizeSettingsVisible;
			this.syncSharedUi();
			return this.prizeSettingsVisible;
		},
		setDrawCount: function (value) {
			if (this.getVisualState() != 'ready' || this.winnerMutationPending) return false;
			this.drawCount = this.normalizeDrawCount(value);
			this.syncSharedUi();
			return this.drawCount;
		},
		selectPrize: function (index) {
			var self = this;
			if (self.getVisualState() != 'ready' || self.winnerMutationPending) return false;
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
			var self = this, requestId = ++self.winnerRequestId, dataVersion = self.advanceWinnerDataVersion(prizeid);
			if (self.isCurrentPrizeId(prizeid)) {
				self.winnerCountReady = false;
				self.syncSharedUi();
			}
			screencore.ajaxSubmit('/screen/liuyancj/ajaxlucker', { prizeid: prizeid, gametype: XCV3Config.gametype }, '').then(function (e) {
				if (requestId != self.winnerRequestId || !self.isCurrentPrizeId(prizeid) || !self.isWinnerDataVersionCurrent(prizeid, dataVersion)) return;
				if (e.code == 0) {
					self.currentWinnerCount = self.countWinners(e.msg.list);
					self.winnerCountReady = true;
					self.drawCount = self.normalizeDrawCount(self.drawCount);
					self.syncSharedUi();
				}
			}, function () {
				if (requestId != self.winnerRequestId || !self.isCurrentPrizeId(prizeid) || !self.isWinnerDataVersionCurrent(prizeid, dataVersion)) return;
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
			if (self.destroyed || self.getVisualState() != 'ready' || self.drawRequestPending || self.winnerMutationPending) return false;
			if (!prize || prize.id === undefined || prize.id === null || prize.id === '') return layerBox.showMsg('请选择奖品');
			if (remaining === null) return layerBox.showMsg('正在读取当前奖品名额，请稍候');
			if (remaining <= 0) return layerBox.showMsg((prize.prizename || prize.awardname || '当前奖品') + '人数已抽满');
			var onceout = self.normalizeDrawCount(self.drawCount);
			if (!onceout || onceout <= 0 || onceout > remaining) return layerBox.showMsg('请设置正确的奖品抽取人数');
			clearTimeout(self.bgTimer);
			self.drawCount = onceout;
			self.advanceWinnerDataVersion(prize.id);
			self.winnerRequestId++;
			self.recordsRequestId++;
			self.drawRequestPending = true;
			self.setVisualState('requesting');
			screencore.ajaxSubmit('/screen/liuyancj/savelucker', { prizeid: prize.id, selnum: onceout, gametype: XCV3Config.gametype }).then(function (e) {
				if (self.destroyed) return;
				self.drawRequestPending = false;
				if (e.code != 0) {
					self.setVisualState('ready');
					return layerBox.showMsg(e.msg);
				}
				self.luckerids = e.msg.luckerids || [];
				self.lastDrawWinners = self.toStageWinners(e.msg.list || []);
                self.lastDrawMessages = $.map(e.msg.list || [], function (winner) {
                    return {
                        nickname: winner.nickname || (winner.showitems || [])[0] || '中奖用户',
                        avatar: winner.avatar,
                        content: winner.content || winner.msgcontent || ''
                    };
                });
				self.currentWinnerCount += self.countWinners(e.msg.list);
				self.winnerCountReady = true;
				self.drawCount = self.normalizeDrawCount(self.drawCount);
				screencore.hideFootAndQr();
				self.startupPending = true;
                self.setVisualState('drawing');
                // 与导入抽奖一致，动画启动后 3 秒内不接受停止，防止连点开始立即开奖。
                self.startupTimer = setTimeout(function () {
                    if (self.destroyed) return;
                    self.startupPending = false;
                    self.syncSharedUi();
                }, 3000);
				screencore.bgmusicpause();
				if ($("#cjingmusic").length) $("#cjingmusic")[0].play();
			}, function () {
				if (self.destroyed) return;
				self.drawRequestPending = false;
				self.setVisualState('ready');
				layerBox.showMsg('网络异常');
			});
			return true;
		},
		stopLottery: function () {
            var self = this;
            if (self.getVisualState() != 'drawing' || self.animationLockPending || self.startupPending || self.destroyed) return false;
            self.animationLockPending = true;
            self.syncSharedUi();
            function reveal() {
                if (self.destroyed || !self.animationLockPending) return;
                self.animationLockPending = false;
                if ($('#cjingmusic').length) {
                    $('#cjingmusic')[0].currentTime = 0;
                    $('#cjingmusic')[0].pause();
                }
                if ($('#cjendmusic').length) $('#cjendmusic')[0].play();
                self.visualState = 'result';
                if (self.stageUi) self.stageUi.setResult(self.lastDrawWinners, $.extend({}, self.getCurrentPrize() || {}, { remaining: self.getRemainingCount() }));
                self.syncSharedUi();
                screencore.sendLuckerTpl({ luckerids: self.luckerids }, function () { self.luckerids = []; });
            }
            if (!self.danmaku || !self.danmaku.lock(self.lastDrawMessages, reveal)) reveal();
            return true;
        },
		closeResult: function () {
			if (this.getVisualState() != 'result') return false;
			if ($("#cjendmusic").length) {
				$("#cjendmusic")[0].currentTime = 0;
				if (!$("#cjendmusic")[0].paused) $("#cjendmusic")[0].pause();
			}
			this.lastDrawWinners = [];
            this.lastDrawMessages = [];
			this.setVisualState('ready');
			this.bgTimer = setTimeout(function () { screencore.bgmusicplay(); }, 1e3);
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
			if (!self.stageUi || !prize || self.winnerMutationPending || (self.getVisualState() != 'ready' && self.getVisualState() != 'result' && self.getVisualState() != 'records')) return false;
			if (self.getVisualState() != 'records') self.recordsReturnState = self.getVisualState() == 'result' ? 'result' : 'ready';
			var prizeId = prize.id, requestId = ++self.recordsRequestId, dataVersion = self.advanceWinnerDataVersion(prizeId);
			self.visualState = 'records';
			self.syncSharedUi();
			self.stageUi.setRecords(null, 'loading');
			screencore.ajaxSubmit('/screen/liuyancj/ajaxlucker', { prizeid: prizeId, gametype: XCV3Config.gametype }, '').then(function (e) {
				if (requestId != self.recordsRequestId || self.getVisualState() != 'records' || !self.isCurrentPrizeId(prizeId) || !self.isWinnerDataVersionCurrent(prizeId, dataVersion)) return;
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
				if (requestId != self.recordsRequestId || self.getVisualState() != 'records' || !self.isCurrentPrizeId(prizeId) || !self.isWinnerDataVersionCurrent(prizeId, dataVersion)) return;
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
			var prize = this.getCurrentPrize();
			if (!this.winnerCountReady && prize && !this.winnerMutationPending) this.loadPrizeLuckers(prize.id);
			return true;
		},
		deleteRecord: function (recordId) {
			var self = this, prize = self.getCurrentPrize();
			if (!recordId || !prize || self.winnerMutationPending || self.getVisualState() != 'records') return false;
			var prizeId = prize.id;
			layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
				if (!self.isCurrentPrizeId(prizeId) || self.getVisualState() != 'records') {
					layerBox.showMsg('当前奖品或页面状态已变化，请重新操作');
					return;
				}
				if (!self.beginWinnerMutation(prizeId)) return;
				screencore.ajaxSubmit('/screen/liuyancj/dellucker', { recordid: recordId, prizeid: prizeId }, '').then(function (e) {
					if (e.code == 0) {
						self.advanceWinnerDataVersion(prizeId);
						self.endWinnerMutation(prizeId);
						layerBox.showMsg('删除成功');
						self.refreshCurrentPrizeWinnerState(prizeId);
					} else {
						self.endWinnerMutation(prizeId);
						layerBox.showMsg(e.msg);
						self.refreshCurrentPrizeWinnerState(prizeId);
					}
				}, function () {
					self.endWinnerMutation(prizeId);
					layerBox.showMsg('网络异常');
					self.refreshCurrentPrizeWinnerState(prizeId);
				});
			});
			return true;
		},
		clearCurrentPrizeWinners: function () {
			var self = this, prize = self.getCurrentPrize();
			if (!prize || self.getVisualState() != 'ready' || self.winnerMutationPending) return false;
			var prizeId = prize.id;
			layerBox.showConfirm('警告', '清空将删除' + (prize.prizename || prize.awardname || '当前奖品') + '所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
				if (!self.isCurrentPrizeId(prizeId) || self.getVisualState() != 'ready') {
					layerBox.showMsg('当前奖品或页面状态已变化，请重新操作');
					return;
				}
				if (!self.beginWinnerMutation(prizeId)) return;
				screencore.ajaxSubmit('/screen/liuyancj/delalllucker', { prizeid: prizeId, gametype: XCV3Config.gametype }, '').then(function (e) {
					if (e.code == 0) {
						self.advanceWinnerDataVersion(prizeId);
						self.endWinnerMutation(prizeId);
						layerBox.showMsg('清空成功');
						self.refreshCurrentPrizeWinnerState(prizeId);
					} else {
						self.endWinnerMutation(prizeId);
						layerBox.showMsg(e.msg);
						self.refreshCurrentPrizeWinnerState(prizeId);
					}
				}, function () {
					self.endWinnerMutation(prizeId);
					layerBox.showMsg('网络异常');
					self.refreshCurrentPrizeWinnerState(prizeId);
				});
			});
			return true;
		},
        bindSpaceControl: function () {
            var self = this;
            self.spaceHeld = false;
            function isSpace(event) { return event.code === 'Space' || event.key === ' ' || event.keyCode === 32; }
            function isEditing(target) {
                return target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
            }
            self.onSpaceDown = function (event) {
                if (!isSpace(event) || isEditing(event.target) || self.destroyed) return;
                // 捕获阶段消费空格，避免聚焦的“中奖记录”按钮在 keyup 产生原生 click。
                event.preventDefault();
                event.stopImmediatePropagation();
                if (event.repeat || self.spaceHeld) return;
                self.spaceHeld = true;
                self.handlePrimaryAction();
            };
            self.onSpaceUp = function (event) {
                if (!isSpace(event)) return;
                if (self.spaceHeld || !isEditing(event.target)) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
                self.spaceHeld = false;
            };
            self.onSpaceBlur = function () { self.spaceHeld = false; };
            document.addEventListener('keydown', self.onSpaceDown, true);
            document.addEventListener('keyup', self.onSpaceUp, true);
            window.addEventListener('blur', self.onSpaceBlur);
        },
		bindEvent: function () {
			var self = this;
			self.initprize();
			self.mountStageUi();
			self.initSocket();
			keyboardJS.bind('/', function () { self.clearCurrentPrizeWinners(); });
			keyboardJS.bind('left', function () { if (self.getVisualState() == 'ready' && self.prizeIndex > 0) self.selectPrize(self.prizeIndex - 1); });
			keyboardJS.bind('right', function () { if (self.getVisualState() == 'ready' && self.prizeIndex < self.prizeInfo.length - 1) self.selectPrize(self.prizeIndex + 1); });
			keyboardJS.bind('up', function () { if (self.getVisualState() == 'ready') self.setDrawCount(self.drawCount + 1); });
			keyboardJS.bind('down', function () { if (self.getVisualState() == 'ready') self.setDrawCount(Math.max(1, self.drawCount - 1)); });
			keyboardJS.bind('shift', function () { self.openRecords(); });
		},
		initSocket: function () {
			var self = this, params = {};
			params.onmessage = function (data) {
                if (self.destroyed) return;
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
                    if (self.danmaku) self.danmaku.remove(data.msgid);
					if (!$.isArray(data.msgid)) {
						fulldm.delBullet(data.msgid);
					} else {
						$.each(data.msgid, function (index, val) {
							fulldm.delBullet(val);
						});
					}
				} else if (data.type == 'screenresetdm') {
                    if (self.danmaku) self.danmaku.reset();
					fulldm.resetBullet();
				}
			};
			screensocket.init(params);
		},
        addnewMsg: function (msg) {
            if (!this.danmaku || this.destroyed) return false;
            var message = $.extend({}, msg);
            if (message.type == 'screendm') message.type = message.msgtype || '1';
            this.danmaku.add(message);
        }
    };
    return screenliuyancj;
});
