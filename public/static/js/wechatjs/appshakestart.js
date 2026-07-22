/*
* @Author: 赞木
* @Date:   2022-04-04 21:24:32
* @Last Modified by:   赞木
* @Last Modified time: 2023-04-19 19:38:17
*/
define('appshakestart', ['appsocket', 'jquery.shake', 'wechatcore', 'bubbleHearts', 'sweetalert'], function (appsocket, Shake, wechatcore, BubbleHearts) {
	// 图片地址在此处更换 可换成你的图片
	var appshakestart = {
		gamestatus: 1,
		oldscore: 0,
		myscore: 0,
		shaketype: '1',
		starttype: '1',
		heartstage: null,
		myshakeEvent: null,
		init: function () {
			var self = this, params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					appsocket.isclose = false;
					wechatcore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					self.initAudio();
					self.bindEvent();
					self.starttype = data.starttype;
					if (data.type == 'gameiswait') {
						self.myscore = 0;
						self.oldscore = 0;
						self.gamestatus = 1;
						$(".tip").text(waittip);
						$(".myscore").hide();
					} else {
						self.myscore = data.myscore;
						self.oldscore = data.myscore;
						self.gamestatus = 2;
						$(".tip").text(starttip);
						if (self.starttype < 3) $(".myscore").text(scoretxt.replace('#', self.myscore)).show();
					}
					if (self.starttype == '3') {
						$('.clickstart').show();
					} else {
						$('.clickstart').hide();
					}
				} else if (data.type == 'gameisend') {
					$(".tip").text(endtip);
					self.endshake('1');
				} else if (data.type == 'gameconfirmend') {
					$(".tip").text(endtip);
					self.endshake();
				} else if (data.type == 'gameiscountdown') {
					$(".tip").text(djstip);
					self.myscore = self.oldscore;
					self.gamestatus = -1;
					$(".myscore").hide();
				} else if (data.type == 'gameconfirmstart') {
					$(".tip").text(starttip);
					self.gamestatus = 2;
				} else if (data.type == 'gameisdjs') {
					self.gamestatus = 2;
					data.djs == 0 && self.endshake();
				} else if (data.type == 'gameshakestartrefresh' || data.type == 'gameappshakestartrefresh') {
					appsocket.closeClient();
				} else if (data.type == 'addblack') {
					data.userid == XCV3Config.userid && WeixinJSBridge.call('closeWindow');
				} else if (data.type == 'goto') {
					wechatcore.goto(data);
				} else if (data.type == 'luckeruserids') {
					wechatcore.layerAsklucker(data);
				}
			};
			appsocket.init(params);
			self.initclickstart();
		},
		showheart: true,
		heartloaded: false,
		initclickstart: function () {
			var self = this;
			if (shakeandclick == '2' && self.showheart && $(".clickbox").length) {
				self.shaketype = '2';
				if ($('.clickbox .heartimg').length) {
					var img = new Image;
					img.onload = function () {
						self.heartimages = img;
						self.heartloaded = true;
						self.heartstage = new BubbleHearts();
						var canvas = self.heartstage.canvas, imgwith = $(".clickbox .clickbtnimg").width(), imgheight = $(".clickbox .clickbtnimg").height() * 2;
						canvas.width = imgwith;
						canvas.height = imgheight;
						canvas.style['width'] = imgwith + 'px';
						canvas.style['height'] = imgheight + 'px';
						$(".clickbox").append(canvas);
					};
					img.src = $('.clickbox .heartimg').attr('src') || '';
				}
			}
			if ($('.clickstart').length > 0) {
				self.shaketype = '3';
			}
		},
		initAudio: function () {
			var self = this;
			self.shakeaudio = $('#shakeaudio')[0];
		},
		initplaytype: function () {
			var self = this;
		},
		bindEvent: function () {
			var self = this;
			if (self.shaketype == '1') {
				if (self.myshakeEvent == null) {
					self.myshakeEvent = new Shake({ threshold: 10 });
					self.myshakeEvent.start();
					window.addEventListener('shake', function () {
						self.shakeEvent();
					}, false);
				} else {
					self.myshakeEvent.start();
				}
				if (shakeandclick === '1') {
					self.clickEvent();
				}
			} else if (self.shaketype == '2') {
				self.clickEvent();
			} else {
				self.dllogo();
			}
		},
		shakeEvent: function () {
			var self = this;
			if (self.gamestatus != 2) return;
			self.workerdata();
		},
		clickEvent: function () {
			var self = this, clicktimer;
			$('.clickbox img').off('click').on('click', function () {
				if (self.gamestatus != 2) return;
				var $this = $(this);
				if ($('.clicknewbox').length) {
					clearTimeout(clicktimer);
					$this.addClass('hidden');
					var anotherone = $this.next().length ? $this.next() : $this.prev();
					anotherone.removeClass('hidden');
					if ($this.hasClass('clickbtnimg')) {
						clicktimer = setTimeout(function () {
							$this.removeClass('hidden');
							$this.next().addClass('hidden')
						}, 3e2)
					}
				} else {
					if (self.showheart && self.heartloaded) {
						if ($.isArray(self.heartimages)) {
							var img = self.heartimages[0]
						} else {
							var img = self.heartimages;
						}
						self.heartstage.bubble(img);
					}
				}
				if (shakeandclick == '2') {
					self.workerdata();
				}
			});
		},
		dllogo: function () {
			var self = this;
			$(".clickstart .clickstartimg").off('click').on('click', function () {
				var $this = $(this);
				if (self.gamestatus != 2) return;
				swal({
					title: "请输入启动编号",
					text: "",
					type: "input",
					showCancelButton: true,
					closeOnConfirm: false,
					confirmButtonColor: "#00aeff",
					inputPlaceholder: "请输入启动编号"
				}, function (inputValue) {
					if (inputValue === false) return false;
					if (inputValue === "") {
						swal.showInputError("请输入启动编号");
						return false;
					}
					inputValue = inputValue.replace(/\s/g, "");
					if (inputValue === "") {
						swal.showInputError("请输入启动编号");
						return false;
					}
					$(".sweet-alert input").val(inputValue);
					wechatcore.ajaxSubmit('/wechat/shakestart/changestatus', { usernumber: inputValue }).then(function (data) {
						if (data.code == 0) {
							swal.close();
							$this.parent().hide();
							$('.tip').text($('.clickstart .successtip').text());
						} else {
							swal.showInputError(data.msg);
							return false;
						}
					});
				});
			})
		},
		endshake: function (type) {//结束
			var self = this, type = type || '2';
			self.gamestatus = 3;
			if (self.myshakeEvent != null) self.myshakeEvent.stop();
			if (type == '2') {
				if (self.starttype < 3) $(".myscore").text(scoretxt.replace('#', self.myscore)).show();
			}
			self.myscore = 0;
			self.oldscore = 0;
		},
		workerdata: function () {
			var self = this;
			if (self.gamestatus != 2) return;
			self.myscore++;
			if (self.shaketype == '1') {
				wechatcore.playAudio(self.shakeaudio);
			}
			appsocket.sendgamedata({
				myscore: self.myscore,
			});
			$(".myscore").text(scoretxt.replace('#', self.myscore)).show();
		},
	};
	return appshakestart;
});
