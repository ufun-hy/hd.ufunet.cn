/*
* @Author: 赞木
* @Date:   2022-09-27 15:46:34
* @Last Modified by:   赞木
* @Last Modified time: 2023-03-25 16:34:20
*/
define('appdzp', ['appsocket', 'wechatcore', 'luckycanvas', 'sweetalert'], function (appsocket, wechatcore, LuckyCanvas) {
	var appdzp = {
		oldluckers: [],
		oneluckerid: 0,
		rotateInfo: null,
		isstart: false,
		init: function () {
			var self = this;
			self.loadMsg();
		},
		loadMsg: function () {
			var self = this;
			wechatcore.ajaxSubmit("/wechat/dzp/initdata", { rotateid: rotateid || '0' }).then(function (json) {
				if (json.code == 0) {
					self.rotateInfo = json.msg.rotate;
					$(".rule-des").html(self.rotateInfo.ruledes);
					if (self.rotateInfo.showrollbox == '2') {
						$(".lucker-rollbox").addClass('hidden');
					}
					var ajaxluckers = json.msg.list.reverse(), msglen = ajaxluckers.length;
					if (msglen > 0) {
						for (var i = 0; i < msglen; i++) {
							$(".lucker-rolllist").append(wechatcore.tpl($("#rollone-tpl"), ajaxluckers[i]));
						}
						self.oldluckers = ajaxluckers;
					}
					self.bindEvent();
					setTimeout(function () {
						self.loopRun();
					}, 2e3);
				} else {
					wechatcore.msg(json.msg);
				}
			}, function () {
				wechatcore.msg('加载出错');
			});
		},
		initSocket: function () {
			var self = this;
			appsocket.init({
				onmessage: function (data) {
					if (data.type == 'connected') {
						appsocket.isclose = false;
						wechatcore.connectsocket({ clientid: data.clientid, rotateid: rotateid });
					} else if (data.type == 'goto') {
						wechatcore.goto(data);
					} else if (data.type == 'addblack') {
						data.userid == XCV3Config.userid && wechatcore.closewxwindow();
					} else if (data.type == 'luckeruserids') {
						wechatcore.layerAsklucker(data);
					}
				}
			});
		},
		bindEvent: function () {
			var self = this;
			self.initSocket();
			if (self.rotateInfo.cjstyle == '1') {
				$(".app-dzpbg").removeClass('app-jggbg');
			} else {
				$(".app-dzpbg").addClass('app-jggbg');
			}
			if (self.rotateInfo.cjmode == '3') {
				$(".mytimes").css('opacity', '0');
			}
			$(".app-dzpbg").removeClass('hidden');
			self.cjstyleInit();
			$(".dzp-popbox .close-pop").click(function () {
				$(".dzp-popbox").addClass('hidden');
			});
			$(".btn-rule").click(function () {
				$(".dzp-rulebox").removeClass('hidden');
			});
			$(".dzp-rulebox .close-pop").click(function () {
				$(".dzp-rulebox").addClass('hidden');
			});
			$(".lucky-btn").click(function () {
				var mytimes = $(".mytimes span").text();
				if (mytimes <= 0) {
					return wechatcore.msg('剩余抽奖次数为0');
				}
				if (self.rotateInfo.cjmode == '1' || self.isstart) return false;
				if (self.rotateInfo.cjmode == '2') {
					self.isstart = true;
					wechatcore.ajaxSubmit('/wechat/dzp/savelucker', { rotateid: rotateid, iscard: '2' }).then(function (data) {
						if (data.code == 0) {
							self.playrotateaudio();
							self.myLucky.defaultConfig.stopRange = wechatcore.randomInt(1, 9) / 10;
							self.myLucky.play();
							setTimeout(function () {
								self.myLucky.stop(data.msg.stopkey);
							}, 3e2);
							self.oneluckerid = data.msg.luckerid;
							var rmytimes = parseInt(mytimes) - 1;
							$(".mytimes span").text(rmytimes < 0 ? 0 : rmytimes);
						} else {
							if (data.code == -2) {
								$(".mytimes span").text(0);
							}
							self.isstart = false;
							wechatcore.msg(data.msg);
						}
					});
				} else {
					swal({
						title: "请输入抽奖券号",
						text: "",
						type: "input",
						showCancelButton: true,
						closeOnConfirm: false,
						confirmButtonColor: "#00aeff",
						inputPlaceholder: "请输入抽奖券号"
					}, function (inputValue) {
						if (inputValue === false) return false;
						if (inputValue === "") {
							swal.showInputError("请输入抽奖券号!");
							return false;
						}
						inputValue = inputValue.replace(/\s/g, "");
						if (inputValue === "") {
							swal.showInputError("请输入抽奖券号!");
							return false;
						}
						$(".sweet-alert input").val(inputValue);
						self.isstart = true;
						wechatcore.ajaxSubmit('/wechat/dzp/savelucker', { rotateid: rotateid, iscard: '1', cardno: inputValue }).then(function (data) {
							if (data.code == 0) {
								swal.close();
								self.myLucky.defaultConfig.stopRange = wechatcore.randomInt(1, 9) / 10;
								self.myLucky.play();
								setTimeout(function () {
									self.myLucky.stop(data.msg.stopkey);
								}, 3e2);
								self.oneluckerid = data.msg.luckerid;
								var rmytimes = parseInt(mytimes) - 1;
								$(".mytimes span").text(rmytimes < 0 ? 0 : rmytimes);
							} else {
								if (data.code == -2) {
									$(".mytimes span").text(0);
								}
								self.isstart = false;
								swal.showInputError(data.msg);
								return false
							}
						});
					});
				}
			});
		},
		cjstyleInit: function (cjstyle, prizes) {
			var self = this, cjstyle = cjstyle || self.rotateInfo.cjstyle, prizes = prizes || self.rotateInfo.prizes, cjprizes = [];
			if (cjstyle == '1' && prizes.length > 8) {
				bigwheelConfig.imgs.width = parseFloat(bigwheelConfig.imgs.width);
				var overlen = prizes.length - 8;
				bigwheelConfig.imgs.width -= overlen * 0.0375;
				bigwheelConfig.imgs.width = bigwheelConfig.imgs.width.toString() + 'rem';
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
				width: '5.1rem',
				height: '5.1rem',
				defaultConfig: {
					offsetDegree: 0,
					gutter: 1,
					accelerationTime: parseFloat(bigwheelConfig.accelerationTime) * 1e3,
					decelerationTime: parseFloat(bigwheelConfig.decelerationTime) * 1e3,
				},
				defaultStyle: {
					fontColor: '#bb3938',
					fontSize: '0.18rem',
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
				width: '5.1rem',
				height: '5.1rem',
				defaultStyle: {
					fontColor: '#708ABF',
					fontSize: '0.18rem',
					fontWeight: 600,
					lineClamp: 2,
					borderRadius: '0.16rem',
					shadow: '',
				},
				activeStyle: {
					background: self.rotateInfo.jggbgcolor || '#f9732e',
					fontColor: self.rotateInfo.jggfontcolor || '#fff',
				},
				defaultConfig: {
					gutter: 15,
					accelerationTime: parseFloat(jggConfig.accelerationTime) * 1e3,
					decelerationTime: parseFloat(jggConfig.decelerationTime) * 1e3,
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
					wechatcore.playAudio($("#dzpsumusic")[0]);
				}
			} else if (self.rotateInfo.cjstyle == '2') {
				if ($("#jggrotatemusic").length > 0 && !$("#jggrotatemusic")[0].paused) {
					$("#jggrotatemusic")[0].currentTime = 0;
					$("#jggrotatemusic")[0].pause();
				}
				if ($("#jggsumusic").length > 0) {
					wechatcore.playAudio($("#jggsumusic")[0]);
				}
			}
		},
		showpopbox: function (prize) {
			var self = this;
			self.playsuccessaudio();
			var popbox = $(".dzp-popbox");
			var tip = successtip;
			if (prize.prizetype == '3' && prize.saverecord == '2') {
				tip = failtip;
			}
			popbox.find('.tip').text(tip);
			popbox.find('.prizeimg').attr('src', prize.imgs[0].src);
			popbox.find('.awardname').text(prize.fonts[0].text);
			popbox.removeClass('hidden');
			setTimeout(function () {
				self.isstart = false;
			}, 1e3);
			if ((prize.prizetype == '3' && prize.saverecord == '1') || prize.prizetype != '3') {
				self.addnewMsg({
					id: self.oneluckerid,
					nickname: XCV3Config.nickname,
					prizename: prize.fonts[0].text,
				});
			}
		},
		addnewMsg: function (onelucker) {
			var self = this, contentsbox = $('.lucker-rollbox'), contentbox = $('.lucker-rolllist');
			self.oldluckers.push(onelucker);
			contentbox.append(wechatcore.tpl($("#rollone-tpl"), onelucker));
		},
		loopRun: function () {
			var self = this, contentsbox = $('.lucker-rollbox'), contentbox = $('.lucker-rolllist');
			if (contentbox.find('li').length > 1 && contentbox.height() >= contentsbox.height()) {
				var firstdom = contentbox.find('li').first(), scrollH = firstdom.outerHeight();
				firstdom.animate({
					"margin-top": -scrollH + 'px'
				}, 1.5e3, function () {
					var $li = $(this);
					//if(!$li.is(":animated")){
					$li.remove();
					var one = self.oldluckers.shift();
					self.oldluckers.push(one);
					contentbox.append(wechatcore.tpl($("#rollone-tpl"), one));
					setTimeout(function () {
						self.loopRun();
					}, 1e3);
					//}
				})
			} else {
				setTimeout(function () {
					self.loopRun();
				}, 1.5e3);
			}
		},
	};
	return appdzp;
})