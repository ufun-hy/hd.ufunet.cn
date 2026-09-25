define('fulldm', ['template', 'screencore', 'danmuku', 'jquerytrans'], function (template, screencore, Danmuku) {
	var fulldm = {
        // 可选的页面显示层；页面自行提供消息，公共开关继续复用。
        externalDisplay: null,
        setExternalDisplay: function (display) {
            clearInterval(this.timer);
            this.timer = null;
            if (this.dmmanager) { this.dmmanager.clear(); this.dmmanager = null; }
            this.externalDisplay = display;
            if (display) {
                if (display.configure) display.configure(this);
                this.bindevent();
                var saved = window.localStorage.getItem('openfulldm' + XCV3Config.hdid);
                if (saved === '2' || (!saved && this.config.opendm === '2')) this.stop();
                else this.start();
            }
        },
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
		loopCount: 0,
		loopseconds: 2,
		addinterval: 2,
		height: 100,
		width: 270,
		init: function (container, config) {
			var self = this;
			self.container = container;
			if (!config || $.isEmptyObject(config)) return;
			self.config = config;
			self.dmtpl = template('fulldm-tpl');
            if (self.externalDisplay) { self.setExternalDisplay(self.externalDisplay); return; }
			if (config.isloop == '1') {
				self.isLoop = true;
			}
			self.loadhistory = config.loadhistory;
			if (config.loadhistory == '1') {
				self.ajaxhistory(config.historynum, config.fromtype || '1');
			}
			var ismiji = self.config.ismiji || '1';
			if (ismiji == '2') {
				self.loopseconds = 0.8;
				self.addinterval = 1;
			}
			self.createManager();
		},

		/*定时从新弹幕或者历史弹幕内加载弹幕消息*/
		barrageTimer: function () {
			var self = this, cansend = true;
			self.timer = setInterval(function () {
				if (!cansend) {
					return false;
				}
				if (self.newBullet.length > 0) {
					var onebarrage = self.newBullet.shift();
					if (onebarrage.type == '2') {
						cansend = false;
						var img = new Image();
						img.onload = function () {
							cansend = true;
							if (!self.dmmanager.send(onebarrage)) {
								self.addBullet(onebarrage, '2');
							}
						};
						img.onerror = function () {
							cansend = true;
						};
						img.src = onebarrage.content;
					} else {
						if (!self.dmmanager.send(onebarrage)) {
							self.addBullet(onebarrage, '2');
						}
					}
				} else {
					if (self.oldBullet.length > 0) {
						var onebarrage = self.oldBullet.shift();
						if (!self.dmmanager.send(onebarrage)) {
							self.addoldBullet(onebarrage, '2');
						}
					}
				}
			}, self.loopseconds * 1e3);
		},
		rebindBarragedom: function (barrage, node) {
			var self = this, data = barrage.data;
			if (data.content != '') {
				data.content = screencore.emoToimg(data.content);
			}
			$(node).addClass('fulldmBox-item');
			$(node).html(self.dmtpl({ showavatar: self.config.needavatar, showname: self.config.neednickname, data: data }));
			if (self.config.needbg == '1' && self.config.bgcolortype == '2') {
				var randColor = self.randColor();
				if (self.config.dmtype == '1') {
					$(node).find('.fulldmBox-avatar,.fulldmBox-info').css({ "background-color": randColor });
				} else {
					$(node).find('.fulldmBox-info').css({ "background-color": randColor });
					$(node).find('.fulldmBox-avatar img').css({ "border-color": randColor });
					if (self.config.dmrolltype != '2') {
						$(node).find('.fulldmBox-info .qipao').css({ 'border-right-color': randColor });

					} else {
						$(node).find('.fulldmBox-info .qipao').css({ 'border-left-color': randColor });
					}
				}
				$(node).find(".fulldmBox-imgbox").css({ "background-color": randColor });
			}
			if (self.config.fontcolortype == '2') {
				var fcolor = self.randColor(), scolor = '';
				const matches = fcolor.match(/(\d+)/g);
				const red = parseInt(matches[0], 10);
				const green = parseInt(matches[1], 10);
				const blue = parseInt(matches[2], 10);
				const newAlpha = 0.42;
				scolor = `rgba(${red},${green},${blue},${newAlpha})`;
				$(node).find('.fulldmBox-son').css({ "color": fcolor, 'text-shadow': scolor + ' 2px 2px 5px' });
			}
		},
		rollspeed: function () {
			var speed = this.config.dmspeed;
			return speed == '1' ? [20, 26] : (speed == '2' ? [15, 21] : [4, 10]);
		},
		// Both ordinary danmaku and the lottery adapter use these backend settings.
		getManagerOptions: function () {
			var self = this, direction = self.config.dmrolltype == '1' ? 'right' : (self.config.dmrolltype == '2' ? 'left' : (self.config.dmrolltype == '3' ? 'bottom' : 'top')), dmkuConfig = {
				container: self.container[0],
				height: self.config.height || self.height,
				width: self.config.vwidth || self.width,
				rowGap: self.config.dmrolltype < 3 ? 80 : 20,
				direction: direction,
				times: self.rollspeed(),
				limit: 100,
				interval: self.config.ismiji == '2' ? 1 : 2,
				capacity: 800,
				hooks: {
					barrageCreate(barrage, node) {
						self.rebindBarragedom(barrage, node);
					},
					barrageDestroy(barrage) {
						if (self.isLoop) {
							self.addoldBullet(barrage.data);
						}
					},
					barrageAppend(barrage, node) {
						if (self.config.hoverstop == '1') {
							node.onmouseenter = e => {
								barrage.pause()
								node.classList.add('active')
							}
							node.onmouseleave = e => {
								barrage.resume()
								node.classList.remove('active')
							}
						}
						if (self.config.clickdel == '1') {
							node.onclick = e => {
								screencore.ajaxSubmit('/common/fulldm/delmsg', { rhdid: XCV3Config.rhdid, msgid: barrage.data.id, fromtype: self.config.fromtype || '1' }).then(function (data) { });
							}
						}
					}
				}
			};
			return dmkuConfig;
		},
		createManager: function () {
			var self = this;
			self.dmmanager = Danmuku.create(self.getManagerOptions());
			var openfulldm = window.localStorage.getItem("openfulldm" + XCV3Config.hdid);
			if ((!openfulldm && self.config.opendm == '1') || openfulldm == '1') {
				self.barrageTimer();
				self.start();
			} else {
				self.stop();
			}
			self.bindevent();
		},
		bindevent: function () {
			var self = this;
            if (self.eventsBound) return;
            self.eventsBound = true;
			$(".control-normal-list .opendm").on('click', function (e, params) {
				if (self.externalDisplay ? !self.externalDisplay.isVisible() : !self.dmmanager.runing) {
					//开启弹幕
					self.start();
					!params && window.localStorage.setItem("openfulldm" + XCV3Config.hdid, '1');
				} else {
					//关闭弹幕
					self.stop();
					!params && window.localStorage.setItem("openfulldm" + XCV3Config.hdid, '2');
				}
			});
			$(window).resize(function () {
				if (self.externalDisplay) self.externalDisplay.resize();
                else if (self.dmmanager) self.dmmanager.resize();
			});
			setInterval(function () {
				self.capacityhistroy();
			}, 60e3);
		},
		addoldBullet: function (data, flag) {
			var self = this, flag = flag || '1';
            if (self.externalDisplay) return;
			if (self.isdelExists(data.id) == -1 && self.isoldExists(data.id) == -1) {
				flag == '1' ? self.oldBullet.push(data) : self.oldBullet.unshift(data);
			}
		},
		addBullet: function (data, flag) {
			var self = this, flag = flag || '1';
            if (self.externalDisplay) return;
			if (data.type == 'screendm') {
				data.type = data.msgtype || '1';
			}
			if (data.type > 2) {
				return false;
			}
			if (self.config.dmrolltype < 3 && data.type == '2') {
				return false;
			}
			if (!self.config || $.isEmptyObject(self.config)) return;
			if (self.isnewExists(data.id) == -1) {
				flag == '1' ? self.newBullet.push(data) : self.newBullet.unshift(data);
			}
		},
		delBullet: function (key) {
			var self = this;
			if (self.externalDisplay) return;
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
			if (self.externalDisplay) return;
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
			var self = this, fromtype = type || '1', msgtype = self.config.dmrolltype < 3 ? '1' : '2';
			screencore.ajaxSubmit('/common/fulldm/ajaxdm', { fromtype: fromtype, dmnum: num, rhdid: XCV3Config.rhdid, msgtype: msgtype }).then(function (data) {
				if (data.code == 0 && !self.externalDisplay) self.oldBullet = data.msg;
			});
		},
		randColor: function () {
			var e = 0.9,
				t = ["rgba(141,50,160," + e + ")", "rgba(225,99,15," + e + ")", "rgba(242,73,73," + e + ")", "rgba(18,155,240," + e + ")", "rgba(90,162,12," + e + ")", "rgba(20,185,148," + e + ")"],
				n = Math.floor(6 * Math.random());
			return t[n]
		},
		stop: function () {
			var self = this;
			if (!self.externalDisplay && (!self.config || $.isEmptyObject(self.config))) return;
			self.timer != null && clearInterval(self.timer);
			self.timer = null;
			if (self.externalDisplay) self.externalDisplay.setVisible(false);
            else { self.dmmanager.hidden(); self.dmmanager.clear(); }
			$(".control-normal-list .fulldm-icon-box .isstop").show();
			$(".inputfulldm").val('2');
			screencore.sendMsg2frame({ 'type': 'fulldmclose' });
		},
		start: function () {
			var self = this;
			if (!self.externalDisplay && (!self.config || $.isEmptyObject(self.config))) return;
			if (self.externalDisplay) self.externalDisplay.setVisible(true);
            else {
                self.dmmanager.show();
                self.dmmanager.start();
                self.timer == null && self.barrageTimer();
            }
			$(".control-normal-list .fulldm-icon-box .isstop").hide();
			$(".inputfulldm").val('1');
			screencore.sendMsg2frame({ 'type': 'fulldmopen' });
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
			if (self.externalDisplay || !self.dmmanager) return;
			if (self.oldBullet.length >= self.dmmanager.opts.capacity) {
				self.oldBullet = self.oldBullet.sort(screencore.sortBy('id'));
				deldms = self.oldBullet.splice(0, 50);
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
	return fulldm;
});