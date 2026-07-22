/*
* @Author: 赞木
* @Date:   2022-01-13 13:23:06
* @Last Modified by:   赞木
* @Last Modified time: 2023-04-26 13:36:25
*/
define('fulldm', ['template', 'wechatcore', 'emojicore', 'danmuku', 'jquerytrans'], function (template, wechatcore, emojicore, Danmuku) {
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
					barrageDestroy(barrage) {
						if (self.isLoop) {
							self.addoldBullet(barrage.data);
						}
					}
				}
			};
			self.dmmanager = Danmuku.create(dmkuConfig);
			var openfulldm = window.localStorage.getItem("openfulldm" + XCV3Config.hdid);
			if ((!openfulldm && self.config.opendm == '1') || openfulldm == '1') {
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
			if (wechatcore.device(1) && "onorientationchange" in window) {
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
			if (data.type >= 2) {
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
			wechatcore.ajaxSubmit('/common/fulldm/ajaxdm', { fromtype: fromtype, dmnum: num, rhdid: XCV3Config.rhdid, msgtype: '1' }).then(function (data) {
				if (data.code == 0) self.oldBullet = data.msg;
			});
		},
		randColor: function () {
			var e = .78,
				t = ["rgba(141,50,160," + e + ")", "rgba(225,99,15," + e + ")", "rgba(242,73,73," + e + ")", "rgba(18,155,240," + e + ")", "rgba(90,162,12," + e + ")", "rgba(20,185,148," + e + ")"],
				n = Math.floor(6 * Math.random());
			return t[n]
		},
		stop: function () {
			var self = this;
			if (!self.config || $.isEmptyObject(self.config)) return;
			self.timer != null && clearInterval(self.timer);
			self.timer = null;
			self.dmmanager.hidden();
			self.dmmanager.clear();
			$(".vcp-dm-toggle i").removeClass('mxc-subtitle_unblock_light').addClass('mxc-subtitle_block_light');
		},
		start: function () {
			var self = this;
			if (!self.config || $.isEmptyObject(self.config)) return;
			self.dmmanager.show();
			self.dmmanager.start();
			self.timer == null && self.barrageTimer();
			$(".vcp-dm-toggle i").removeClass('mxc-subtitle_block_light').addClass('mxc-subtitle_unblock_light');
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
				self.oldBullet = self.oldBullet.sort(wechatcore.sortBy('id'));
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
	return fulldm;
});