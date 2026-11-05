define('screenhorse', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS) {
	var screenhorse = {
		gamestatus: 0,
		gametime: 30,
		stopclick: false,
		maxscore: 120,
		autorun: 2,
		autonum: 20,
		gametimererror: true,
		joinInterval: null,
		lineitemRender: null,
		newjoinRender: null,
		pmitemRender: null,
		isteam: '2',
		audio: {},
		init: function () {
			var self = this;
			self.setProgressBarHeight();
			self.lineitemRender = template('shakeItem-tpl');
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
					self.gametime = data.gametimesec || 30;
					self.maxscore = data.maxscore;
					self.isteam = data.isteam;
					self.createLine(data.type);
					if (data.type == 'gameiswait') {
						if ($(".bgneedrun").hasClass('runbg')) {
							$(".bgneedrun").removeClass('runbg');
						}
						if ($('.welcomeBox').hasClass("display-none")) {
							$('.welcomeBox').removeClass("display-none").animateControl(screencore.anicssArr());
						}
						self.hideDzpercent();
						self.gamestatus = 1;
						clearInterval(self.joinInterval);
						self.autorun = data.autorun;
						self.autonum = data.autonum;
						screencore.gameSendonline();
						self.joinInterval = setInterval(function () {
							screencore.gameSendonline();
						}, 2e3);
					} else {
						self.gamestatus = 2;
						self.gametimererror = true;
						setTimeout(function () {
							if (self.gamestatus == 2 && self.gametimererror) {
								screencore.gameTimererror();
							}
						}, 2e3);
						$(".bgneedrun").addClass('runbg');
						self.showDzpercent();
					}
				} else if (data.type == 'gameiscountdown') {
					self.gametimererror = false;
					if (!$(".welcomeBox").hasClass("display-none")) {
						$(".welcomeBox").addClass('display-none');
					}
					var b = $(".webstartdjs"), e = b.find(".webstartdjsBox"), s = b.find(".startdjsani");
					s.text(data.djs > 0 ? data.djs : 'GO');
					b.removeClass('display-none');
					self.audio.countAudio.play();
					data.djs == 0 && $(".bgneedrun").addClass('runbg');
				} else if (data.type == 'gameisdjs') {
					self.gamestatus = 2;
					self.gametimererror = false;
					self.showDzpercent();
					$(".welcomeBox,.webstartdjs").addClass('display-none');
					var b = $(".webgamedjs"), s = b.find(".gamedjsani");
					s.text(data.djs);
					b.removeClass('display-none');
					if (data.djs > 0 && !$(".bgneedrun").hasClass('runbg')) {
						$(".bgneedrun").addClass('runbg');
					}
					self.changeDztime(data.djs);
					if (data.djs == 0) {
						self.gamestatus = 3;
						b.addClass('display-none');
						self.audio.overAudio.play();
						$(".bgneedrun").removeClass('runbg');
						layerBox.showLoading(XCV3Config.rhdid == 'chenjinboanswerbs' ? 'Loading ranking data, please wait' : '正在加载排名数据，请稍后...');
					}
					self.rushDom(data.list, data.teams);
				} else if (data.type == 'gameshowphbbtn') {
					layerBox.closeLayer();
					var btn = $(".rankBox-btns .paiming");
					btn.attr({ 'data-rotateid': data.rotateid, 'data-gamephb': data.gamephb });
					screencore.gameEndphb((data.isteam == '1' ? data.teams : data.list), data.endphb);
					screencore.sendLuckerTpl({ rotateid: data.rotateid });
					self.appendLeftPhb((data.isteam == '1' ? data.teams : data.list));
				} else if (data.type == 'gamehorserefresh' || data.type == 'gameerrorhaddone') {
					window.location.reload();
				} else if (data.type == 'gameiserror') {
					layerBox.showMsg('当前轮次出现异常');
					setTimeout(function () {
						window.location.reload();
					}, 1e3);
				} else if (data.type == 'horseoffline') {
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
		initAudio: function () {
			var self = this;
			self.audio.joinAudio = document.getElementById("joinaudio");
			self.audio.countAudio = document.getElementById("countaudio");
			self.audio.overAudio = document.getElementById("overaudio");
		},
		bindEvent: function () {
			var self = this;
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
			var l = $(".shakelineBox li");
			l.each(function (i, v) {
				var oneuser = self.isteam == '1' ? teams[i] : lists[i];
				if (oneuser) {
					var left = (oneuser.score / self.maxscore).toFixed(2);
					if (left >= 1) {
						left = "calc(100% - 300px)";
					} else {
						left = "calc(" + (left * 100) + "% - 300px)";
					}
					$(v).find(".player .nickname").text(oneuser.nickname);
					$(v).find(".player img").attr("src", oneuser.avatar);
					$(v).find(".player img").removeClass('display-none');
					$(v).find(".player").removeClass('display-none');
					$(v).css({ "left": left });
				} else {
					$(v).find(".player .nickname").text('');
					$(v).find(".player img").attr("src", "");
					$(v).css({ "left": "-300px" });
					$(v).find(".player img").removeClass('display-none');
					$(v).find(".player").addClass('display-none');
				}
			});
		},
		showLastRoundUser: function () {
			var self = this, tipindex = layerBox.showLoading('无正在进行的轮次，直接显示最后一轮结果');
			screencore.ajaxSubmit('/screen/common/getlastrotatephb', { 'gametype': XCV3Config.gametype }).then(function (data) {
				if (data.code == 0) {
					if (data.msg == '1') {
						layerBox.close(tipindex);
						$(".shake-mainbox .emptybox").removeClass("display-none");
					} else {
						setTimeout(function () {
							layerBox.close(tipindex);
						}, 3e2);
						self.bindEvent();
						var btn = $(".rankBox-btns .paiming");
						btn.attr({ 'data-rotateid': data.msg.rotateid, 'data-gamephb': data.msg.gamephb });
						screencore.gameEndphb(data.msg.lists, data.msg.endphb);
					}
				} else {
					layerBox.close(tipindex);
					layerBox.showMsg(data.msg);
				}
			}, function () {
				layerBox.close(tipindex);
				layerBox.showMsg('网络太差，请稍后重试');
			});

		},
		createLine: function (gameflag) {
			var self = this, gameflag = gameflag || 'gameiswait';
			var trackHtml = "";
			for (var i = 0; i < 10; i++) {
				trackHtml += self.lineitemRender({ i: i, carImg: carImgs[i] });
			}
			if (gameflag == 'gameiswait' || (gameflag != 'gameiswait' && $('.shakelineBox li').length == 0)) {
				$(".shakelineBox").html(trackHtml);
			}
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
		showDzpercent: function () {
			var dzpercent = $(".dzpercent");
			if (dzpercent.length) {
				dzpercent.find('.container').removeClass('hidden').addClass('ready');
			}
		},
		hideDzpercent: function () {
			var dzpercent = $(".dzpercent");
			if (dzpercent.length) {
				dzpercent.find('.container').removeClass('ready').addClass('hidden');
			}
		},
		changeDztime: function (countdown) {
			var self = this, dzpercent = $(".dzpercent");
			if (dzpercent.length) {
				var container = $('#container');
				var adBackground = $('#adBackground');
				var viewBtn = $('#viewBtn');
				dzpercent.find('.countdown').text(countdown);
				var progressOverlay = $("#progressOverlay"), progressHorse = $("#progressHorse");
				var progressContainer = $('.progress-bar-container');
				const progress = ((self.gametime - countdown) / self.gametime) * 100;
				if (progressOverlay.length) progressOverlay.css('width', `${progress}%`);
				// 更新 horse 位置，跟随进度条的右侧边缘（使用 transform 更平滑）
				if (progressHorse.length) {
					const containerWidth = progressContainer[0].offsetWidth;
					const horseLeft = (containerWidth * progress / 100);
					//progressHorse.css('transform', `translate(calc(${horseLeft}px - 50%), -50%)`)
					progressHorse.css('left', `${horseLeft}px`)
					// 当到达 100% 时，标记为停止状态
					if (progress >= 100) {
						progressHorse.addClass('stopped');
					}
				}

				// 根据进度更新箭头图片
				const arrows = $('.marker-arrow');
				const arrowPositions = [20, 40, 60, 80, 98];
				arrows.each((index, arrow) => {
					if (progress >= arrowPositions[index]) {
						arrow.classList.add('active');
					} else {
						arrow.classList.remove('active');
					}
				});

				if (countdown <= 0) {
					progressOverlay.css('width', `${progress}%`);
					dzpercent.find('.countdown').text(0);
					// 确保所有箭头都激活
					arrows.each((index, arrow) => arrow.classList.add('active'));
					// 马儿到达终点，保持显示
					if (progressHorse) {
						//const containerWidth = progressContainer[0].offsetWidth;
						//progressHorse.css('transform', `translate(calc(${containerWidth}px - 50%), -50%)`)
						//progressHorse.css('left', `${containerWidth}px`)
						//progressHorse.addClass('stopped');
					}
					//显示广告
					setTimeout(() => {
						container.addClass('hidden');
						$('.car-mainbox .shake-lists').css('z-index', 2);
						$(".shakelineBox li").addClass('display-none');
						if (adBackground) {
							adBackground.addClass('show');
						}
						setTimeout(() => {
							if (viewBtn) {
								viewBtn.addClass('show');
							}
						}, 800);
					}, 300);
				} else {
					$(".shakelineBox li").removeClass('display-none');
				}

			}
		},
		setProgressBarHeight: function () {
			var dzpercent = $(".dzpercent");
			if (dzpercent.length) {
				const viewBtn = document.getElementById('viewBtn');
				viewBtn.addEventListener('click', function () {
					if (adBackground) {
						adBackground.style.transition = 'none';
						adBackground.classList.remove('show');
						adBackground.classList.add('hide');
					}
					viewBtn.style.transition = 'none';
					viewBtn.classList.remove('show');
					viewBtn.classList.add('hide');
					// 同时隐藏 bg.jpg
					// document.body.classList.add('no-bg');
					$('.car-mainbox .shake-lists').css('z-index', 1)
				});
				var container = $('#container');
				const progressContainer = document.querySelector('.progress-bar-container');
				const baseImg = new Image();
				const overlayImg = new Image();

				baseImg.onload = function () {
					const containerWidth = progressContainer.offsetWidth;
					const calculatedHeight = containerWidth / (baseImg.width / baseImg.height);
					progressContainer.style.height = calculatedHeight + 'px';

					overlayImg.onload = function () {
						setTimeout(() => {
							const progressOverlayInner = document.querySelector('.progress-bar-overlay-inner');
							// 计算 loading2.png 的实际显示宽度（使用 auto 100%，高度是容器的 70%）
							const overlayHeight = progressContainer.offsetHeight * 0.7;
							const overlayWidth = overlayHeight * (overlayImg.width / overlayImg.height);

							// 内部元素宽度应该等于 loading1 的实际显示宽度（容器宽度）
							// 如果 loading2 的实际宽度小于容器宽度，需要拉伸或调整
							// 为了确保能完全覆盖，使用容器宽度
							if (progressOverlayInner) {
								progressOverlayInner.style.width = containerWidth + 'px';
								// 如果 loading2 的实际宽度小于容器宽度，调整 background-size
								if (overlayWidth < containerWidth) {
									progressOverlayInner.style.backgroundSize = containerWidth + 'px 100%';
								}
							}

							// 初始化 horse 位置
							if (progressHorse) {
								// progressHorse.style.transform = 'translate(calc(0px - 50%), -50%)';
								progressHorse.style.left = 0;
							}

							const markers = document.querySelectorAll('.marker-item');
							markers.forEach((marker, index) => {
								marker.style.left = (index === markers.length - 1 ? 98 : (index + 1) * 20) + '%';
							});

							// 所有计算完成后，显示容器
							if (container.length) {
								container.addClass('ready');
							}
						}, 10);
					};
					overlayImg.src = '/static/images/screen/horse/images/loading2.png';
				};
				baseImg.src = '/static/images/screen/horse/images/loading1.png';
			}
		},
		appendLeftPhb: function (teams) {
			var dzpercent = $(".dzpercent");
			$(".rankBox .ranking-list").remove();
			if (dzpercent.length) {
				var arrs = [
					{
						city: '海西',
						name: '',
					},
					{
						city: '厦门',
						name: '',
					},
					{
						city: '福州',
						name: '',
					},
					{
						city: '泉莆',
						name: '',
					},
					{
						city: '漳龙',
						name: '',
					},
					{
						city: '川渝',
						name: '',
					},
					{
						city: '长沙',
						name: '',
					},
					{
						city: '广州',
						name: '',
					},
					{
						city: '南宁',
						name: '',
					}
				];
				// 遍历arrs数组
				arrs.forEach(cityItem => {
					// 在teams中查找匹配的team
					const matchedTeam = teams.find(team => team.teamname === cityItem.city);
					// 如果找到匹配的team，并且有bestone且有nickname
					if (matchedTeam && matchedTeam.bestone && matchedTeam.bestone.nickname) {
						cityItem.name = matchedTeam.bestone.nickname;
					}
				});
				$(".rankBox").append(template('leftrank-tpl', { arrs: arrs }));
			}
		}
	};
	return screenhorse;
});
