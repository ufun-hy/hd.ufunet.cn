define('appanswerbs', ['appsocket', 'wechatcore'], function (appsocket, wechatcore) {
	var appanswerbs = {
		rotateid: 0,
		myscore: 0,
		mytime: 0,
		gamestatus: 0,
		answertime: 10,
		saveSeconds: 0,
		startTime: 0,
		questiontpl: null,
		appshowphbbtn: '2',
		isteam: '2',
		myteam: '0',
		gameteams: [],
		autoquestion: 1,
		autoshowanswer: '1',
		isindefiniteterm: '2',
		isChinese: '1',
		statustip: ['答题还未开始', '正在倒计时，马上开始', '答题开始了', '答题已结束', '即将公布本题结果', '即将进入下一题'],
		init: function () {
			var self = this;
			self.roundBox = $(".roundInfo-box");
			self.optionBox = $(".options-box");
			var params = {};
			if (XCV3Config.rhdid == 'huoxingrendati') {
				self.isChinese = '2';
				self.statustip = ['GET READY!', 'Starts in:', 'Has already started', 'ROUND ENDED', 'REVEALING ANSWER...', "Next question in"]
			}
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					appsocket.isclose = false;
					wechatcore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					self.rotateid = data.rotateid;
					self.initAudio();
					self.bindEvent();
					$(".appstartdjs").addClass('hidden');
					self.isindefiniteterm = data.isindefiniteterm || '2';
					self.answertime = data.answertime;
					self.appshowphbbtn = data.appshowphbbtn;
					self.roundBox.find(".roundInfo-title").text(data.rotatetitle);
					self.roundBox.find(".roundInfo-quesnum span").text(data.question.totalnum);
					self.isteam = data.isteam;
					self.gameteams = data.teams;
					self.myteam = data.team;
					self.autoquestion = data.autoquestion;
					self.autoshowanswer = data.autoshowanswer;
					if (data.type == 'gameiswait') {
						self.gamestatus = 1;
						self.gameiswait();
						self.myscore = 0;
						self.mytime = 0;
						self.saveSeconds = 0;
						self.startTime = 0;
						$(".options-box").empty();
					} else {
						self.saveSeconds = 0;
						self.startTime = 0;
						data.question.djstime = 0;
						self.gameisrun(data.question, data.nowquestionscore || '', '1');
						self.myscore = data.myscore;
						self.mytime = data.mytime;
					}
					self.showteambox(data.teaminfo);
				} else if (data.type == 'gameisend') {
					self.gameisend(self.statustip[3]);
				} else if (data.type == 'gameiscountdown') {
					if (self.gamestatus == 3) {
						self.gameiswait(self.statustip[5] + (self.isChinese == '2' ? ` (${data.djs}s)` : "( " + data.djs + " )"));
					} else {
						self.gameiswait(self.statustip[1] + (self.isChinese == '2' ? ` ${data.djs}s` : "( " + data.djs + " )"));
					}
					self.saveSeconds = 0;
					self.startTime = 0;
					wechatcore.playAudio(self.djsaudio);
					self.hidemyteambox();
				} else if (data.type == 'gameisdjs') {
					self.hidemyteambox();
					if (data.djs > 0) {
						self.gamestatus = 2;
						self.saveseltime(data.djs);
						self.gameisrun(data.question, '');
					} else {
						self.saveSeconds = 0;
						self.startTime = 0;
						$(".options-box .tijiao a.btn").addClass('btn-disabled')
						self.gameisend();
					}
					$(".options-box .questiontime span").text(data.djs);
				} else if (data.type == 'gamehadquestion') {
					self.gameshowquestionresult(data.num);
				} else if (data.type == 'gameshowquestionanswer') {
					self.gameshowquestionanswer(data.questionid);
				} else if (data.type == 'showAnswerbsResult') {
					self.gameshowAnswerresult(data.rotateid, data.showphb);
				} else if (data.type == 'gamechangequestion') {
					self.gamechangequestion(data);
				} else if (data.type == 'gameanswerbsrefresh' || data.type == 'gameappanswerbsrefresh') {
					appsocket.closeClient();
				} else if (data.type == 'gameshowphbbtn') {
					if (self.gamestatus == 3) {
						self.showphbbtn(data.rotateid, data.gamephb, self.myteam);
						//self.gameisend((self.isChinese == '2' ? 'This Round is finished' : "本轮已结束，您答对了" + self.myscore + "题，总耗时:" + (self.mytime / 1000).toFixed(3) + "秒"));
						self.myteam = '0';
					}
				} else if (data.type == 'gamenoround' || data.type == 'gameislucker') {
					self.gameisnormal((data.type == 'gamenoround' ? '暂无正在进行的轮次' : XCV3Config.isluckertxt));
					self.myteam = '0';
					self.hideteamboxs();
				} else if (data.type == 'gamestartnojoin') {
					self.gameisnormal('本轮游戏已经开始，无法加入');
					self.myteam = '0';
					self.hideteamboxs();
				} else if (data.type == 'gameneedpay') {
					self.gameisnormal('请先购买参与游戏资格');
					self.myteam = '0';
					self.hideteamboxs();
					wechatcore.gamePayrotate(data.rotateid, data.fee, function () {
						appsocket.closeClient();
					});
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
				} else if (data.type == 'answerbslevelreselect') {
					var hdurl = data.url || '';
					if (hdurl != '') {
						localStorage.removeItem('answerbsleveldjs');
						window.location.href = hdurl;
					}
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
			self.djsaudio = $("#djsaudio")[0];
		},
		bindEvent: function () {
			var self = this;
			$(".options-box").off('click').on('click', 'ul li', function () {
				var $this = $(this), answerNum = $(".options-box ul").attr('data-yesanswer').split(","), tjbtn = $(".options-box .tijiao a.btn");
				if (self.gamestatus != '2' || (self.isteam == '1' && (self.myteam == '0' || self.myteam == '')) || $.inArray(tjbtn.text(), ['已提交', 'Submitted']) > -1) return;
				if (self.isindefiniteterm == '2') {
					if ($this.hasClass('is-active')) {
						$this.removeClass('is-active');
						var activelen = $(".options-box li.is-active").length;
						if (answerNum.length <= 1) {
							if (activelen == 0) {
								tjbtn.addClass('btn-disabled');
							} else {
								tjbtn.removeClass('btn-disabled');
							}
						} else {
							if (activelen < 2) {
								tjbtn.addClass('btn-disabled');
							} else {
								tjbtn.removeClass('btn-disabled');
							}
						}
					} else {
						if (answerNum.length <= 1) {
							$(".options-box li").removeClass('is-active');
							$this.addClass('is-active');
							tjbtn.removeClass('btn-disabled');
						} else {
							$this.addClass('is-active');
							var activelen = $(".options-box li.is-active").length;
							if (activelen >= 2) {
								tjbtn.removeClass('btn-disabled');
							}
						}
					}
				} else {
					if ($this.hasClass('is-active')) {
						$this.removeClass('is-active');
						var activelen = $(".options-box li.is-active").length;
						if (activelen == 0) {
							tjbtn.addClass('btn-disabled');
						} else {
							tjbtn.removeClass('btn-disabled');
						}
					} else {
						$this.addClass('is-active');
						tjbtn.removeClass('btn-disabled');
					}
				}
			});
			$(".zam-app-answer-main").off('click').on('click', '.tijiao a.btn', function () {
				var $this = $(this), answerNum = $(".options-box ul").attr('data-yesanswer').split(","), isactiveNum = $(".options-box ul").find("li.is-active").length;
				if (self.gamestatus != '2' || (self.isteam == '1' && (self.myteam == '0' || self.myteam == '')) || $this.hasClass('btn-disabled')) return false;
				if (isactiveNum >= 1) {
					if (self.isindefiniteterm == '2') {
						if (answerNum.length >= 2 && isactiveNum == 1) {
							wechatcore.msg('多选题至少需选择2个答案');
							return false;
						}
					}
					$this.text((self.isChinese == '2' ? 'Submitted' : '已提交')).addClass('btn-disabled');
					//记录提交的当前时间
					//答题时间 - 倒计时秒数 + 提交时间差 即为本题答题消耗时间
					if (self.saveSeconds == 0 || self.startTime == 0) {
						wechatcore.msg('计时异常请刷新重试');
						return false;
					}
					var myquestime = (self.answertime - self.saveSeconds + (new Date() - self.startTime) / 1000) * 1000;
					var senddata = { gametype: XCV3Config.gametype, ys: myquestime };
					var selLi = self.optionBox.find("li.is-active"), selanswer = [], yesanswer = self.optionBox.find("ul").attr("data-yesanswer") || '';
					if (selLi.length > 0) {
						selLi.each(function () {
							selanswer.push($(this).attr("data-key"));
						});
					}
					selanswer = selanswer.join(',');
					senddata.selanswer = selanswer;
					senddata.answeryes = (yesanswer != '' && selanswer == yesanswer ? '1' : '2');
					senddata.questionid = $(".options-box ul").attr('data-quesid');
					senddata.myteam = self.myteam;
					wechatcore.ajaxSubmit('/wechat/common/sendgamedata', senddata, (self.isChinese == '2' ? 'Be submitting' : '正在提交..')).then(function (json) {
						if (json.code == 0) {
							if (selanswer == yesanswer) {
								self.myscore++;
							}
							self.mytime += myquestime;
							self.saveSeconds = 0;
							self.startTime = 0;
							wechatcore.msg((self.isChinese == '2' ? '✓ SUBMITTED!' : '提交成功'));
						} else {
							if (json.code != -2) {
								self.saveSeconds = 0;
								self.startTime = 0;
							}
							wechatcore.msg(json.msg);
							$this.text((self.isChinese == '2' ? 'Submit' : '提交')).removeClass('btn-disabled');
						}
					});
				} else {
					wechatcore.msg('请先选择答案再提交');
				}
			});
		},
		chanstatus: function (txt) {
			var self = this, statusBox = self.roundBox.find(".roundInfo-status");
			statusBox.text(txt);
			statusBox.removeClass('hidden');
			$(".game-myteambox .game-myteam-status").text(txt);
		},
		gameiswait: function (txt) {
			var self = this;
			self.roundBox.find(".roundInfo-img").removeClass('hidden');
			self.roundBox.find(".roundInfo-title").removeClass('hidden');
			self.roundBox.find(".roundInfo-quesnum").removeClass('hidden');
			self.hideoptionBox();
			self.hidephbbtn();
			self.showroundBox();
			self.chanstatus(txt || self.statustip[0]);
		},
		gameisrun: function (question, nowquestionscore, needshowanswer) {
			var self = this, needshowanswer = needshowanswer || '2';
			self.roundBox.find(".roundInfo-img").addClass('hidden');
			self.roundBox.find(".roundInfo-title").addClass('hidden');
			self.roundBox.find(".roundInfo-quesnum").addClass('hidden');
			self.hidephbbtn();
			self.hideroundBox();
			if ($(".question-" + question.id).length <= 0) {
				var ispostanswer = '2';
				question.isindefiniteterm = self.isindefiniteterm;
				$(".options-box").html(wechatcore.tpl($("#question-tpl"), question));
				if (nowquestionscore != '' && nowquestionscore.questionid == question.id) {
					ispostanswer = '1';
					$(".tijiao a.btn").text((self.isChinese == '2' ? 'Submitted' : '已提交')).addClass('btn-disabled');
					var selanswer = nowquestionscore.selanswer.split(',');
					$.each(selanswer, function (i, v) {
						$(".question-" + question.id).find('li[data-key=' + v + ']').addClass('is-active');
					});
				}
				var hadshowanswer = question.hadshowanswer || '2', yesanswer = self.optionBox.find("ul").attr("data-yesanswer") || '';
				//手动切题可能答题切换间隔时间稍长 下次扫码进入仍然可以查看自己的上一题的答题结果
				if (needshowanswer == '1' && hadshowanswer == '1') {
					if (nowquestionscore != '' && nowquestionscore.ispass == '1') {
						self.optionBox.find(".questionresult").text((self.isChinese == '2' ? 'CORRECT!' : '恭喜，选择正确'));
					} else {
						self.optionBox.find(".questionresult").text((ispostanswer == '1' ? (self.isChinese == '2' ? 'WRONG CHOICE!' : '很遗憾，选择错误') : (self.isChinese == '2' ? "TIME'S UP!" : '超时未提交答案')) + (self.isChinese == '2' ? 'Correct answer: ' + yesanswer : '，正确答案是:' + yesanswer));
					}
				}
			}
			self.showoptionBox();
			self.chanstatus(self.statustip[2]);
		},
		gameisend: function (txt) {
			var self = this;
			self.roundBox.find(".roundInfo-img").addClass('hidden');
			self.roundBox.find(".roundInfo-title").addClass('hidden');
			self.roundBox.find(".roundInfo-quesnum").addClass('hidden');
			self.gamestatus = 3;
			if (self.autoshowanswer == '1') {
				self.hideoptionBox();
			}
			if (!txt && self.appshowphbbtn == '2') self.hidephbbtn();
			if (self.autoshowanswer == '1') {
				self.showroundBox();
			}
			self.chanstatus(txt || self.statustip[4]);
			self.hideteamboxs();
		},
		gameisnormal: function (txt) {
			var self = this;
			self.roundBox.find(".roundInfo-img").addClass('hidden');
			self.roundBox.find(".roundInfo-title").addClass('hidden');
			self.roundBox.find(".roundInfo-quesnum").addClass('hidden');
			self.hidephbbtn();
			self.gamestatus = 0;
			self.hideoptionBox();
			self.showroundBox();
			self.chanstatus(txt);
		},
		gameshowquestionresult: function (num) {
			var self = this;
			self.roundBox.find(".roundInfo-img").addClass('hidden');
			self.roundBox.find(".roundInfo-title").addClass('hidden');
			self.roundBox.find(".roundInfo-quesnum").addClass('hidden');
			self.hidephbbtn();
			self.hideroundBox();
			var selLi = self.optionBox.find("li.is-active"), selanswer = [], yesanswer = self.optionBox.find("ul").attr("data-yesanswer") || '';
			if (selLi.length > 0) {
				selLi.each(function () {
					selanswer.push($(this).attr("data-key"));
				});
			}
			var tjbtn = $(".options-box .tijiao a.btn"), ispostanswer = '2';
			if (tjbtn.length > 0 && $.inArray(tjbtn.text(), ['已提交', 'Submitted']) > -1) {
				ispostanswer = '1';
			}
			selanswer = selanswer.join(',');
			if (yesanswer != '' && selanswer == yesanswer && ispostanswer == '1') {
				self.optionBox.find(".questionresult").text((self.isChinese == '2' ? 'CORRECT!' : '恭喜，选择正确'));
			} else {
				self.optionBox.find(".questionresult").text((ispostanswer == '1' ? (self.isChinese == '2' ? 'WRONG CHOICE!' : '很遗憾，选择错误') : (self.isChinese == '2' ? "TIME'S UP!" : '超时未提交答案')) + (self.isChinese == '2' ? 'Correct answer: ' + yesanswer : '，正确答案是:' + yesanswer));
				tjbtn.addClass('btn-disabled')
			}
			self.showoptionBox();
		},
		/* 大屏点击公布答案 */
		gameshowquestionanswer: function (questionid) {
			var self = this, questionid = questionid || false;
			if (!questionid || $(".question-" + questionid).length <= 0 || self.optionBox.hasClass("hidden")) {
				return false;
			}
			self.roundBox.find(".roundInfo-img").addClass('hidden');
			self.roundBox.find(".roundInfo-title").addClass('hidden');
			self.roundBox.find(".roundInfo-quesnum").addClass('hidden');
			self.hidephbbtn();
			self.hideroundBox();
			var selLi = self.optionBox.find("li.is-active"), selanswer = [], yesanswer = self.optionBox.find("ul").attr("data-yesanswer") || '';
			if (selLi.length > 0) {
				selLi.each(function () {
					selanswer.push($(this).attr("data-key"));
				});
			}
			var tjbtn = $(".options-box .tijiao a.btn"), ispostanswer = '2';
			if (tjbtn.length > 0 && $.inArray(tjbtn.text(), ['已提交', 'Submitted']) > -1) {
				ispostanswer = '1';
			}
			selanswer = selanswer.join(',');
			if (yesanswer != '' && selanswer == yesanswer && ispostanswer == '1') {
				self.optionBox.find(".questionresult").text((self.isChinese == '2' ? 'CORRECT!' : '恭喜，选择正确'));
			} else {
				self.optionBox.find(".questionresult").text((ispostanswer == '1' ? (self.isChinese == '2' ? 'WRONG CHOICE!' : '很遗憾，选择错误') : (self.isChinese == '2' ? "TIME'S UP!" : '超时未提交答案')) + (self.isChinese == '2' ? 'Correct answer: ' + yesanswer : '，正确答案是:' + yesanswer));
				tjbtn.addClass('btn-disabled')
			}
			self.showoptionBox();
		},
		/*手动切题 手动公布答案模式下大屏点击查看排行榜 */
		gameshowAnswerresult: function (rotateid, showphb) {
			var self = this;
			if (rotateid != self.rotateid) {
				return false;
			}
			self.hideoptionBox();
			self.showroundBox();
			self.gameisend(self.statustip[3]);
			//self.gameisend((self.isChinese == '2' ? 'This Round is finished' : "本轮已结束，您答对了" + self.myscore + "题，总耗时:" + (self.mytime / 1000).toFixed(3) + "秒"));
			if (showphb == '1') {
				self.roundBox.find(".phb-btn").removeClass('hidden');
			} else {
				self.roundBox.find(".phb-btn").addClass('hidden');
			}
		},
		gamechangequestion: function (data) {
			var self = this, question = data.question, questionstatus = data.question.status || '1';
			self.roundBox.find(".roundInfo-img").addClass('hidden');
			self.roundBox.find(".roundInfo-title").addClass('hidden');
			self.roundBox.find(".roundInfo-quesnum").addClass('hidden');
			self.hidephbbtn();
			self.hideroundBox();
			if ($(".question-" + question.id).length <= 0) {
				question.isindefiniteterm = self.isindefiniteterm;
				$(".options-box").html(wechatcore.tpl($("#question-tpl"), question));
				if (questionstatus == '3') {
					wechatcore.ajaxSubmit('/wechat/answerbs/getquestionscore', { questionid: question.id }, '正在获取数据..').then(function (json) {
						if (json.code == 0) {
							var nowquestionscore = json.msg;
							if (nowquestionscore != '') {
								$(".tijiao a.btn").text((self.isChinese == '2' ? 'Submitted' : '已提交')).addClass('btn-disabled');
								var selanswer = nowquestionscore.selanswer.split(',');
								$.each(selanswer, function (i, v) {
									$(".question-" + question.id).find('li[data-key=' + v + ']').addClass('is-active');
								});
							}
						} else {
							wechatcore.msg(json.msg);
						}
						self.showoptionBox();
					});
				} else {
					self.showoptionBox();
				}
			}
		},
		showroundBox: function () {
			var self = this;
			self.roundBox.removeClass('hidden');
		},
		hideroundBox: function () {
			var self = this;
			self.roundBox.addClass('hidden');
		},
		showoptionBox: function () {
			var self = this;
			self.optionBox.removeClass('hidden');
		},
		hideoptionBox: function () {
			var self = this;
			self.optionBox.addClass('hidden');
		},
		showphbbtn: function (rotateid, gamephb, team) {
			var self = this, btn = self.roundBox.find(".phb-btn")
			btn.attr({ 'data-rotateid': rotateid, 'data-gamephb': gamephb, 'data-teamid': team }).removeClass('hidden');
		},
		hidephbbtn: function () {
			var self = this;
			self.roundBox.find(".phb-btn").addClass('hidden');
		},
		saveseltime: function (seconds) {
			var self = this;
			if (self.saveSeconds != 0) return;
			//记录当前倒计时秒数
			self.saveSeconds = seconds;
			//记录当前时间
			self.startTime = Date.now();
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
		showteambox: function (teaminfo) {
			var self = this, teaminfo = teaminfo || '';
			if (self.isteam == '2') {
				$(".game-selteambox,.game-myteambox").addClass('hidden');
				return;
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
	};
	return appanswerbs;
});
