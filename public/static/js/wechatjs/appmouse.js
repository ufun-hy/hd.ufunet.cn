/*
* @Author: 赞木
* @Date:   2021-10-12 08:06:33
* @Last Modified by:   赞木
* @Last Modified time: 2022-09-05 08:16:05
*/
define('appmouse', ['appsocket', 'wechatcore', 'howler', 'jquerytrans'], function (appsocket, wechatcore) {
	var appmouse = {
		rotateid: 0,
		gamestatus: 0,
		shaketype: 1,
		statustip: ['游戏还未开始', '正在倒计时，马上开始', '游戏开始了', '游戏已结束'],
		gameInterval: null,
		myscore: 0,
		maxscore: 120,
		tigerinc: 0,
		foxdec: 0,
		onemoney: 100,
		myshakeEvent: null,
		hammertimer: null,
		closerule: '2',
		isteam: '2',
		myteam: '0',
		gameteams: [],
		kh: ['加油啊', '看什么看，速度了', '别停啊，伙计', '加油~加油'],
		init: function () {
			var self = this;
			self.holeimgs = $(".mouseholes img");
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					appsocket.isclose = false;
					wechatcore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					self.closerule = window.localStorage.getItem("closemouserule2-" + XCV3Config.hdid);
					self.rotateid = data.rotateid;
					self.shaketype = data.shaketype;
					$(".gametime span").text(data.gametime);
					self.maxscore = data.maxscore;
					self.tigerinc = data.tigerinc;
					self.foxdec = data.foxdec;
					self.isteam = data.isteam;
					self.gameteams = data.teams;
					self.myteam = data.team;
					self.initAudio();
					self.bindEvent();
					$(".appstartdjs").addClass('hidden');
					if (data.type == 'gameiswait') {
						self.gamestatus = 1;
						self.myscore = 0;
						var tips = self.statustip[0];
						self.changetip(tips);
						self.hidephbbtn();
						self.onlygametip();
					} else {
						self.gamestatus = 2;
						self.myscore = data.myscore;
						var tips = self.statustip[2];
						self.changetip(tips);
						self.onlygamestatus();
						self.hidetip();
					}
					self.setprogress(self.myscore);
					self.showteambox(data.teaminfo, data.jointype);
				} else if (data.type == 'gameiscountdown') {
					self.gamestatus = 1;
					self.myscore = 0;
					self.hidemyteambox();
					var b = $(".appstartdjs"), e = b.find(".appstartdjsBox"), s = b.find(".startdjsani");
					s.text(data.djs > 0 ? data.djs : 'GO');
					b.removeClass('hidden');
					self.changetip(self.statustip[1]);
					wechatcore.playAudio(self.djsaudio);
					self.hidetip();
					data.djs == 0 && self.changetip(self.statustip[2]);
				} else if (data.type == 'gameisdjs') {
					if (self.gamestatus == 1) {
						self.changetip(self.statustip[2]);
					}
					self.hidetip();
					self.gamestatus = 2;
					self.hidemyteambox();
					$(".appstartdjs").addClass('hidden');
					$(".gametime span").text(data.djs);
					data.djs == 0 && self.endshake();
				} else if (data.type == 'mouseupdata') {
					if (self.gamestatus == 2) {
						self.mouseAni(self.holeimgs[data.hindex], data.istiger, data.duration, data.delay);
					}
				} else if (data.type == 'gamemouserefresh' || data.type == 'gameappmouserefresh') {
					appsocket.closeClient();
				} else if (data.type == 'gameshowphbbtn') {
					if (self.gamestatus == 3) {
						self.showphbbtn(data.rotateid, data.gamephb, self.myteam);
						self.myteam = '0';
					}
				} else if (data.type == 'gamenoround' || data.type == 'gameislucker') {
					self.gamestatus = 0;
					self.changetip((data.type == 'gamenoround' ? '暂无正在进行的轮次' : XCV3Config.isluckertxt));
					self.onlygamestatus();
					$('.ri').hide();
					$(".gametime span").text(0);
					self.setprogress(0);
					self.myteam = '0';
					self.hideteamboxs();
				} else if (data.type == 'gamestartnojoin') {
					self.gamestatus = 0;
					self.changetip('本轮游戏已经开始，无法加入');
					self.onlygamestatus();
					self.setprogress(0);
					$(".gametime span").text(0);
					self.myteam = '0';
					self.hideteamboxs();
				} else if (data.type == 'gameneedpay') {
					self.changetip('请先购买参与游戏资格');
					self.onlygamestatus();
					$(".gametime span").text(0);
					self.setprogress(0);
					self.myteam = '0';
					self.hideteamboxs();
					wechatcore.gamePayrotate(data.rotateid, data.fee, function () {
						appsocket.closeClient();
					});
				} else if (data.type == "gamemouserotatehadpay") {
					if (data.userid == XCV3Config.userid) {
						window.location.reload();
					}
				} else if (data.type == 'gameiserror') {
					self.myteam = '0';
					self.hideteamboxs();
					appsocket.closeClient();
				} else if (data.type == 'addblack') {
					data.userid == XCV3Config.userid && WeixinJSBridge.call('closeWindow');
				} else if (data.type == 'goto') {
					wechatcore.goto(data);
				} else if (data.type == 'luckeruserids') {
					wechatcore.layerAsklucker(data);
				} else if (data.type == 'gamejointeam') {
					if (data.userid == XCV3Config.userid && data.gametype == XCV3Config.gametype) {
						self.jointeam(data.team);
					}
				} else if (data.type == 'gameoutteam') {
					if (data.userid == XCV3Config.userid && data.gametype == XCV3Config.gametype) {
						self.outteam();
					}
				} else if (data.type == 'gameteamcannotjoin') {
					self.gamestatus = 0;
					self.changetip(data.message);
					self.onlygamestatus();
					self.setprogress(0);
					$(".gametime span").text(0);
					self.myteam = '0';
					self.hideteamboxs();
				}
			};
			appsocket.init(params);
			wechatcore.gameInit(function () {
				if ($("#appbgmusic").length > 0) {
					wechatcore.playAudio($("#appbgmusic")[0]);
				}
			});
		},
		initAudio: function () {
			var self = this;
			self.succaudio = $('#successaudio').length ? $('#successaudio')[0] : '';
			self.failaudio = $('#failaudio').length ? $('#failaudio')[0] : '';
			self.djsaudio = $("#djsaudio")[0];
			if (XCV3Config.isiframe) {
				parent.wx.getNetworkType({
					success: function (res) {
						if (self.succaudio) {
							self.succaudio.load();
						}
						if (self.failaudio) {
							self.failaudio.load();
						}
						self.djsaudio.load();
					}
				});
			} else {
				wx.getNetworkType({
					success: function (res) {
						if (self.succaudio) {
							self.succaudio.load();
						}
						if (self.failaudio) {
							self.failaudio.load();
						}
						self.djsaudio.load();
					}
				});
			}
			if (!self._djsaudio) {
				self._djsaudio = new Howl({
					src: [$('#djsaudio').attr("src")],
					onplayerror: function () {
						self._djsaudio.once('unlock', function () {
							self._djsaudio.play();
						});
					}
				});
			}
			if (!self._succaudio && self.succaudio) {
				self._succaudio = new Howl({
					src: [$('#successaudio').attr("src")],
					onplayerror: function () {
						self._succaudio.once('unlock', function () {
							self._succaudio.play();
						});
					}
				});
			}
			if (!self._failaudio && self.failaudio) {
				self._failaudio = new Howl({
					src: [$('#failaudio').attr("src")],
					onplayerror: function () {
						self._failaudio.once('unlock', function () {
							self._failaudio.play();
						});
					}
				});
			}
		},
		bindEvent: function () {
			var self = this;
			self.holeimgs.off("touchstart").on("touchstart", function (e) {
				var istiger = $(this).attr('data-istiger') || '2';
				if (self.gamestatus != 2 || (self.isteam == '1' && (self.myteam == '0' || self.myteam == ''))) return;
				$(this).hide();
				if (istiger == '1') {
					self.myscore += self.tigerinc;
					self.showScore($(this), "+" + self.tigerinc);
					if (self._succaudio) {
						self._succaudio.play();
					}
				} else {
					self.myscore -= self.foxdec;
					if (self.myscore < 0) {
						self.myscore = 0;
					}
					if (self._failaudio) {
						self._failaudio.play();
					}
					self.showScore($(this), "-" + self.foxdec);
				}
				appsocket.sendgamedata({
					myscore: self.myscore,
					myteam: self.myteam,
					rotateid: self.rotateid,
				});
				self.setprogress(self.myscore);
			});
			$(".money-tips").off('click').on('click', function () {
				self.onlygamestatus();
			});
			$(".money-tips").off("touchstart").on("touchstart", function (e) {
				self.onlygamestatus();
			});
			/*
			$(".mousebox").off("click").on("click", function(e) {
				if(self.gamestatus!=2) return;
				var x = e.clientX?e.clientX:e.originalEvent.touches[0].clientX;
				var y = e.clientY?e.clientY:e.originalEvent.touches[0].clientY;
				/*$(".hammer").removeClass('hidden').css({
					"top":y - $(".hammer").height()/2,
					"left":x - $(".hammer").width()/2,
				});
				if(self.hammertimer!=null){
					clearTimeout(self.hammertimer);
				}
				self.hammertimer = setTimeout(function(){
					$(".hammer").addClass('hidden');
				},5e2);*/
			/*
			$(".hammer").removeClass('hidden').css({
				top: y,
				left:x,
				rotate:60,
			}).transition({
				duration: 250,
				rotate:0,
				//top: y - $(".hammer").height()/2,
				//left:x - $(".hammer").width()/2,
				complete: function() {
					$(".hammer").addClass('hidden')
				}
			});
		});
		*/
		},
		teamEvent: function () {
			var self = this;
			$(".game-selteambox").off('click').on('click', '.game-team', function () {
				var $this = $(this);
				if ($this.hasClass('issel')) {
					$this.removeClass('issel');
					$this.find('.checkbox').addClass('hidden');
				} else {
					$this.addClass('issel').siblings().removeClass('issel');
					$(".game-selteambox .checkbox").addClass('hidden')
					$this.find('.checkbox').removeClass('hidden');
				}
			});
			$(".game-team-join .btn").off('click').on('click', function () {
				var selteamobj = $(".game-selteambox .game-team.issel");
				if (selteamobj.length == 0) {
					return wechatcore.msg('请选择一个团队');
				}
				wechatcore.ajaxSubmit('/wechat/common/gamejointeam', { gametype: XCV3Config.gametype, team: selteamobj.attr('data-team') }, '正在加入..').then(function (json) {
					if (json.code != 0) {
						wechatcore.msg(json.msg);
					}
				});
			});
			$(".game-myteam-tuichu .btn").off('click').on('click', function () {
				wechatcore.ajaxSubmit('/wechat/common/gameoutteam', { gametype: XCV3Config.gametype }, '正在退出..').then(function (json) {
					if (json.code != 0) {
						wechatcore.msg(json.msg);
					}
				});
			});
		},
		initteams: function () {
			var self = this, teamhtml = '';
			if (self.gameteams.length > 0) {
				$.each(self.gameteams, function (i, v) {
					teamhtml += wechatcore.tpl($("#team-tpl"), v);
				});
			}
			$(".game-selteambox .game-teams").html(teamhtml == '' ? '<p>本轮暂无团队，请先添加团队</p>' : teamhtml);
			self.teamEvent();
		},
		showteambox: function (teaminfo, jointype) {
			var self = this, teaminfo = teaminfo || '';
			if (self.isteam == '2') {
				$(".game-selteambox,.game-myteambox").addClass('hidden');
				return;
			}
			if (jointype == '3') {
				$(".game-myteambox .game-myteam-tuichu").addClass('hidden');
			} else {
				$(".game-myteambox .game-myteam-tuichu").removeClass('hidden');
			}
			self.initteams();
			if (self.myteam != '' && self.myteam != '0' && teaminfo != '') {
				$(".game-selteambox").addClass('hidden');
				var myteambox = $('.game-myteambox');
				myteambox.find('.game-myteam-logo img').attr('src', teaminfo.teamlogo || '');
				myteambox.find('.game-myteam-name').text(teaminfo.teamname || '');
				if (self.gamestatus == 1) {
					myteambox.removeClass('hidden');
				} else {
					myteambox.addClass('hidden');
				}
			} else {
				$('.game-myteambox').addClass('hidden');
				$(".game-selteambox").removeClass('hidden');
			}
		},
		jointeam: function (jointeam) {
			var self = this, selteambox = $('.game-selteambox');
			selteambox.find('.game-team').removeClass('issel');
			selteambox.find('.checkbox').addClass('hidden');
			selteambox.addClass('hidden');
			var myteambox = $('.game-myteambox');
			myteambox.find('.game-myteam-logo img').attr('src', jointeam.teamlogo);
			myteambox.find('.game-myteam-name').text(jointeam.teamname);
			if (self.gamestatus == 1) {
				myteambox.removeClass('hidden');
			} else {
				myteambox.addClass('hidden');
			}
			self.myteam = jointeam.id;
		},
		outteam: function () {
			var self = this, myteambox = $('.game-myteambox');
			myteambox.find('.game-myteam-logo img').attr('src', '');
			myteambox.find('.game-myteam-name').text('');
			myteambox.addClass('hidden');
			var selteambox = $('.game-selteambox');
			selteambox.find('.game-team').removeClass('issel');
			selteambox.find('.checkbox').addClass('hidden');
			selteambox.removeClass('hidden');
			self.myteam = '0';
		},
		hideteamboxs: function () {
			$(".game-selteambox,.game-myteambox").addClass('hidden');
		},
		hidemyteambox: function () {
			$(".game-myteambox").addClass('hidden');
		},
		endshake: function () {
			var self = this;
			self.gamestatus = 3;
			self.changetip(self.statustip[3]);
			self.onlygamestatus();
			self.hideteamboxs();
		},
		setprogress: function (score) {
			var self = this, p = $(".time-score");
			p.find(".gamescore span").html(score);
		},
		onlygamestatus: function () {
			var self = this;
			self.hidegametip();
			window.localStorage.setItem("closemouserule2-" + XCV3Config.hdid, '1');
			self.showgamestatus();
			self.showtip();
			self.gamestatus != 3 && self.hidephbbtn();
		},
		onlygametip: function () {
			var self = this;
			self.hidegamestatus();
			if (self.closerule != '1') {
				self.showgametip();
			} else {
				self.showgamestatus();
			}
			self.showtip();
		},
		changetip: function (tips) {
			$('.money-tips .gamestatus').html(tips);
			$(".game-myteambox .game-myteam-status").text(tips);
		},
		showtip: function () {
			$('.money-tips').removeClass('hidden');
		},
		hidetip: function () {
			$('.money-tips').addClass('hidden');
		},
		showgamestatus: function () {
			$('.money-tips .gamestatus').removeClass('hidden');
		},
		hidegamestatus: function () {
			$('.money-tips .gamestatus').addClass('hidden');
		},
		showgametip: function () {
			$('.money-tips .gametip').removeClass('hidden');
		},
		hidegametip: function () {
			$('.money-tips .gametip').addClass('hidden');
		},
		showphbbtn: function (rotateid, gamephb, team) {
			var btn = $(".money-tips .phb-btn");
			btn.attr({ 'data-rotateid': rotateid, 'data-gamephb': gamephb, 'data-teamid': team }).removeClass('hidden');
		},
		hidephbbtn: function () {
			var btn = $(".money-tips .phb-btn");
			btn.addClass('hidden');
			$(".rankInfo").remove();
		},
		mouseAni: function (obj, istiger, duration, delay, isstop) {
			var obj = $(obj), isstop = isstop || false;
			if (obj.length <= 0) return false;
			obj.attr({
				"src": (istiger ? roleImgs.tiger : roleImgs.fox),
				"data-istiger": (istiger ? '1' : '2'),
			});
			obj.show().transition({
				bottom: -10,
				duration: duration,
				complete: function () {
					!isstop && obj.transition({
						bottom: -70,
						duration: duration,
						delay: delay,
					})
				}
			});
		},
		showScore: function (obj, txt) {
			var self = this, scoreobj = $(obj).parent().next(), dropobj = scoreobj.next();
			scoreobj.text(txt).show().transition({
				duration: 500,
				top: -40,
				complete: function () {
					scoreobj.text("");
					scoreobj.css({
						top: 0
					})
				}
			});
			dropobj.addClass("ani");
			setTimeout(function () {
				dropobj.removeClass("ani")
			}, 600);
		}
	};
	return appmouse;
});
