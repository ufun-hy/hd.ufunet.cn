define('screencutfruit', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS) {
	var screencutfruit = {
		gamestatus: 0,
		stopclick: false,
		maxscore: 120,
		autorun: 2,
		autonum: 20,
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
				} else if (data.type == 'gamenoround') {
					if (self.gamestatus == 0) {
						self.showLastRoundUser();
					}
				} else if (data.type == 'gameonline') {
					self.gamestatus == 1 && self.rushuser(data);
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					self.initAudio();
					self.bindEvent();
					if (!$(".rankBox").is(":hidden")) $(".rankBox").addClass('display-none');
					self.maxscore = data.maxscore;
					self.isteam = data.isteam;
					if (data.type == 'gameiswait') {
						if ($('.welcomeBox').hasClass("display-none")) {
							$('.welcomeBox').removeClass("display-none").animateControl(screencore.anicssArr());
						}
						if (!$('.cutfruit-wrapper').hasClass("display-none")) {
							$(".cutfruit-wrapper").addClass('display-none');
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
						if ($('.cutfruit-wrapper').hasClass("display-none")) {
							$(".cutfruit-wrapper").removeClass('display-none');
						}
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
					if (!$(".welcomeBox").is(":hidden")) $(".welcomeBox").addClass('display-none');
					var b = $(".webstartdjs"), e = b.find(".webstartdjsBox"), s = b.find(".startdjsani");
					s.text(data.djs > 0 ? data.djs : 'GO');
					b.removeClass('display-none');
					self.audio.countAudio.play();
				} else if (data.type == 'gameisdjs') {
					if ($('.cutfruit-wrapper').hasClass("display-none")) {
						$(".cutfruit-wrapper").removeClass('display-none');
					}
					$("#leafContainer").removeClass('display-none');
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
						$("#leafContainer").addClass('display-none');
						layerBox.showLoading('正在加载排名数据，请稍后...');
					}
					self.rushDom(data.list, data.teams);
				} else if (data.type == 'gameshowphbbtn') {
					layerBox.closeLayer();
					if (!$('.cutfruit-wrapper').hasClass("display-none")) {
						$(".cutfruit-wrapper").addClass('display-none');
					}
					var btn = $(".rankBox-btns .paiming");
					btn.attr({ 'data-rotateid': data.rotateid, 'data-gamephb': data.gamephb });
					self.showEndUser((data.isteam == '1' ? data.teams : data.list), data.endphb);
					screencore.sendLuckerTpl({ rotateid: data.rotateid });
				} else if (data.type == 'gamecutfruitrefresh' || data.type == 'gameerrorhaddone') {
					window.location.reload();
				} else if (data.type == 'gameiserror') {
					layerBox.showMsg('当前轮次出现异常');
					setTimeout(function () {
						window.location.reload();
					}, 2e3);
				} else if (data.type == 'cutfruitoffline') {
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
		initItems: function () {
			var itemfdom = $(".cutfruit-user-list");
			itemfdom.find('.fruitbag').attr('src', percentimg);
			itemfdom.find('.useravatar img').attr('src', defaultImg).css('visibility', 'hidden');
			itemfdom.find('.username').text(defaultName).css('visibility', 'hidden');
			itemfdom.find('.userscore').text(0).css('visibility', 'hidden');
		},
		initAudio: function () {
			var self = this;
			self.audio.joinAudio = document.getElementById("joinaudio");
			self.audio.countAudio = document.getElementById("countaudio");
			self.audio.overAudio = document.getElementById("overaudio");
		},
		bindEvent: function () {
			var self = this;
			self.initDrop();
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
			var f = $(".cutfruit-user-item");
			f.each(function (n) {
				var j = self.isteam == '1' ? teams[n] : lists[n],
					i = defaultName,
					l = 0,
					o = defaultImg;
				if (j) {
					i = j.nickname;
					l = j.score;
					o = j.avatar
				}
				var q = $(this);
				var pecentImg = percentimg;
				if (l > 0) {
					var percent = (l / self.maxscore).toFixed(2) * 100;
					if (percent <= 10 && percent > 0) {
						pecentImg = percentImgs[0];
					} else if (percent <= 20 && percent > 10) {
						pecentImg = percentImgs[1];
					} else if (percent <= 30 && percent > 20) {
						pecentImg = percentImgs[2];
					} else if (percent <= 40 && percent > 30) {
						pecentImg = percentImgs[3];
					} else if (percent <= 50 && percent > 40) {
						pecentImg = percentImgs[4];
					} else if (percent <= 60 && percent > 50) {
						pecentImg = percentImgs[5];
					} else if (percent <= 70 && percent > 60) {
						pecentImg = percentImgs[6];
					} else if (percent <= 80 && percent > 70) {
						pecentImg = percentImgs[7];
					} else if (percent <= 90 && percent > 80) {
						pecentImg = percentImgs[8];
					} else {
						pecentImg = percentImgs[9];
					}
				}
				q.find(".fruitbag").attr('src', pecentImg);
				q.find(".username").html(i).css('visibility', 'visible');
				q.find(".userscore").text(l).css('visibility', 'visible');
				q.find(".useravatar > img").attr("src", o).css('visibility', 'visible');
			});
		},
		showEndUser: function (enduser, endphbnums) {
			var self = this;
			var r = $(".rankBox"), o = r.find("li");
			o.each(function (k) {
				var one = enduser[k],
					s = 0,
					n = defaultName,
					a = defaultImg;
				if (one) {
					s = one.score;
					n = one.nickname;
					a = one.avatar;
				}
				var q = $(this);
				q.find('.pmavatar img').attr('src', a);
				q.find('.pmname').text(n);
				q.find('.pmscore').text(s);
			});
			if (endphbnums < 10) {
				r.find("li:gt(" + (endphbnums - 1) + ")").remove();
			}
			r.removeClass('display-none').animateControl('bounceInDown');

		},
		showLastRoundUser: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/common/getLastrotatephb', { 'gametype': XCV3Config.gametype }).then(function (data) {
				if (data.code == 0) {
					if (data.msg == '1') {
						$(".cutfruit-mainbox .emptybox").removeClass("display-none");
					} else {
						var tipindex = layerBox.showLoading('无正在进行的轮次，直接显示最后一轮结果');
						setTimeout(function () {
							layerBox.close(tipindex);
						}, 1e3);
						self.bindEvent();
						var btn = $(".rankBox-btns .paiming");
						btn.attr({ 'data-rotateid': data.msg.rotateid, 'data-gamephb': data.msg.gamephb });
						self.showEndUser(data.msg.lists, data.msg.endphb);
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
		},
		initDrop: function () {
			var self = this;
			var container = document.getElementById('leafContainer');
			for (var i = 0; i < 30; i++) {
				container.appendChild(self.createALeaf());
			}
		},
		randomInteger: function (low, high) {
			return low + Math.floor(Math.random() * (high - low));
		},
		randomFloat: function (low, high) {
			return low + Math.random() * (high - low);
		},
		pixelValue: function (value) {
			return value + 'px';
		},
		durationValue: function (value) {
			return value + 's';
		},
		dropimgs: function () {
			var index = Math.floor((Math.random() * dropImgs.length));
			return dropImgs[index];
		},
		createALeaf: function () {
			var leafDiv = document.createElement('div');
			var image = document.createElement('img');
			image.src = this.dropimgs();
			leafDiv.style.top = "-100px";
			leafDiv.style.left = this.pixelValue(this.randomInteger(0, window.screen.width));
			var spinAnimationName = (Math.random() < 0.5) ? 'clockwiseSpin' : 'counterclockwiseSpinAndFlip';
			leafDiv.style.webkitAnimationName = 'fade, drop';
			image.style.webkitAnimationName = spinAnimationName;
			var fadeAndDropDuration = this.durationValue(this.randomFloat(5, 11));
			var spinDuration = this.durationValue(this.randomFloat(4, 8));
			leafDiv.style.webkitAnimationDuration = fadeAndDropDuration + ', ' + fadeAndDropDuration;
			var leafDelay = this.durationValue(this.randomFloat(0, 5));
			leafDiv.style.webkitAnimationDelay = leafDelay + ', ' + leafDelay;
			image.style.webkitAnimationDuration = spinDuration;
			leafDiv.appendChild(image);
			return leafDiv;
		},
	};
	return screencutfruit;
});
