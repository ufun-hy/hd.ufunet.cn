define('screenanswerbs', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS) {
	var screenanswerbs = {
		gamestatus: 0,
		stopclick: false,
		gameend: 0,
		questionstatus: '0',
		autoquestion: 1,
		autoshowanswer: '1',
		questionresult: null,
		autorun: 2,
		autonum: 20,
		gametimererror: true,
		joinInterval: null,
		questiontpl: null,
		questionranktpl: null,
		allranktpl: null,
		rankTen: [],
		isteam: '2',
		audio: {},
		init: function () {
			var self = this;
			self.questiontpl = template('question-tpl');
			self.questionranktpl = template('questionrank-tpl');
			self.allranktpl = template('allrank-tpl');
			self.pmitemRender = template('pmshakeItem-tpl');
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					screensocket.isclose = false;
					screencore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'gamenoround') {
					if (self.gamestatus == 0) {
						self.showLastRoundUser();
						self.gameend = 1;
					}
				} else if (data.type == 'gameonline') {
					self.gamestatus == 1 && self.rushuser(data);
				} else if (data.type == 'gameiswait' || data.type == 'gameisrun') {
					self.initAudio();
					self.bindEvent();
					if (!$(".rankBox").is(":hidden")) $(".rankBox").addClass('display-none');
					self.isteam = data.isteam;
					self.rushlrtitle(self.isteam);
					if (data.question.length <= 0) {
						return layerBox.showMsg('本轮未添加题目', '0');
					}
					self.questionstatus = data.question.status;
					self.autoquestion = data.autoquestion;
					self.autoshowanswer = data.autoshowanswer;
					if (data.type == 'gameiswait') {
						if ($('.welcomeBox').hasClass("display-none")) {
							$(".welcomeBox").removeClass("display-none");
							screencore.anicss(".welcomeBox");
						}
						if (!$(".answerbs-lists").hasClass("display-none")) {
							$(".answerbs-lists").addClass("display-none");
						}

						if (waitshowquestion == '1') {
							$(".answerbs-lists .answerbs-quescontent").html(self.questiontpl(data.question));
						} else {
							$(".answerbs-quescontent").empty();
						}
						self.gamestatus = 1;
						clearInterval(self.joinInterval);
						self.autorun = data.autorun;
						self.autonum = data.autonum;
						screencore.gameSendonline();
						self.joinInterval = setInterval(function () {
							screencore.gameSendonline();
						}, 2e3);
					} else {
						$(".answerbs-lists .answerbs-quescontent").html(self.questiontpl(data.question));
						self.nowquestionid = data.question.id || '0';
						if (self.autoquestion == 2) {
							if (self.questionstatus == '3') {
								self.rushDom({ isteam: data.isteam, alllist: data.alllist, nowlist: data.nowlist, nowerrorlist: data.nowerrorlist });
								//手动答题公布上一题结果
								self.showquestionresult(data.percents, data.question.hadshowanswer || '1', data.remainnum);
							} else {
								if (self.questionstatus == '1' && $(".dzcubepercent").length > 0) {
									$(".answerbs-lists .next-question-btn").removeClass('display-none');
								}
							}
						}
						$(".answerbs-lists").removeClass("display-none");
						self.gamestatus = 2;
						self.gametimererror = true;
						setTimeout(function () {
							if (self.gamestatus == 2 && self.questionstatus == '2' && self.gametimererror) {
								screencore.gameTimererror();
							}
						}, 2e3);
					}
				} else if (data.type == 'gameiscountdown') {
					self.gametimererror = false;
					if (!$(".welcomeBox").hasClass("display-none")) {
						$(".welcomeBox").addClass('display-none');
					}
					if ($(".answerbs-quescontent ul").length == 0) {
						var b = $(".webstartdjs"), e = b.find(".webstartdjsBox"), s = b.find(".startdjsani");
						s.text(data.djs > 0 ? data.djs : 'GO');
						b.removeClass('display-none');
					}
					self.audio.countAudio.play();
					if (data.djs > 0 && data.question.nownum != '1') {
						$(".nextquestionbox").text((isLangEn == '1' ? "Next question in" : "即将进入下一题") + '( ' + data.djs + 's )').fadeIn();
					} else {
						$(".nextquestionbox").fadeOut();
					}
				} else if (data.type == 'gameisdjs') {
					$(".nextquestionbox").fadeOut();
					self.gamestatus = 2;
					self.questionstatus = '2';
					self.gametimererror = false;
					$(".welcomeBox,.webstartdjs").addClass('display-none');
					if ($(".question-" + data.question.id).length <= 0) $(".answerbs-lists .answerbs-quescontent").html(self.questiontpl(data.question));
					$(".answerbs-lists").removeClass("display-none");
					var b = $(".webgamedjs"), s = b.find(".gamedjsani");
					s.text(data.djs);
					b.removeClass('display-none');
					if (data.djs == 0) {
						self.gamestatus = 3;
						self.questionstatus = '3';
						b.addClass('display-none');
						self.audio.overAudio.play();
						if (self.autoquestion == 2 && self.autoshowanswer == '2') {
							setTimeout(function () {
								self.showquestionresult(data.percents, '2');
							}, 1e3);
						} else {
							layerBox.showMsg('正在加载答题结果...', 1);
						}
						self.nowquestionid = data.question.id || '0';
					}
					self.rushDom(data);
				} else if (data.type == 'gamehadquestion') {
					//自动切题或者手动切题自动公布答案
					layerBox.closeLayer();
					self.showquestionresult(data.percents);
					if (data.num > 0) {
						if (data.autoquestion == 2) {
							$(".answerbs-lists .next-question-btn").removeClass('display-none');
						}
					} else {
						self.gameend = 1;
					}
				} else if (data.type == 'gamenoquestion') {
					if (self.autoquestion == 2 && self.autoshowanswer == '2') {
						$(".answerbs-lists .next-question-btn").addClass('display-none');
						$(".answerbs-lists .round-pm-btn").removeClass('display-none');
					}
				} else if (data.type == 'gameshowphbbtn') {
					if (self.autoquestion == 2 && self.autoshowanswer == '2') {
						$(".answerbs-lists .next-question-btn").addClass('display-none');
						$(".answerbs-lists .round-pm-btn").removeClass('display-none');
					} else {
						layerBox.closeLayer();
						$(".rankBox-btns .paiming").attr({ 'data-rotateid': data.rotateid, 'data-gamephb': data.gamephb });
						$(".grouppm,.answerfx,.groupsignuser").attr('data-rotateid', data.rotateid);
						screencore.gameEndphb((data.isteam == '1' ? data.teams : data.list), data.endphb, data.groupconfig);
						self.audio.overAudio.play();
						screencore.sendLuckerTpl({ rotateid: data.rotateid });
					}
				} else if (data.type == 'gameanswerbsrefresh' || data.type == 'gameerrorhaddone') {
					window.location.reload();
				} else if (data.type == 'gameiserror') {
					layerBox.showMsg('当前轮次异常');
					setTimeout(function () {
						window.location.reload();
					}, 1e3);
				} else if (data.type == 'answerbsoffline') {
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
		nowquestionid: '0',
		bindEvent: function () {
			var self = this;
			$(".start-btn").off('click').on('click', function () {
				if (screensocket.isclose) return;
				if (parseInt($(".welcomeBox-nums span").text()) == 0) {
					return layerBox.showMsg(isLangEn === '1' ? 'Waiting for Players...' : '当前无用户参与，无法开始游戏');
				}
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
				window.location.reload();
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
						var pmHtml = "", showphbaward = data.msg.showphbaward || '2', banglistboxs = $(".banglistBox .banglist-boxs");
						if (banglistboxs.length > 0) {
							var leftbangnum = 5, leftHtml = '', rightHtml = '';
							if (data.msg.list.length > 10) leftbangnum = 10;
							if (data.msg.list.length > 0) {
								$.each(data.msg.list, function (k, v) {
									v.leftbangnum = leftbangnum;
									v.showphbaward = showphbaward;
									v.key = k;
									v.score = "答对:" + v.ddnum + "题，耗时:" + (v.ys / 1000).toFixed(3) + "秒";
									if (isLangEn == '1') {
										v.score = `${v.ddnum} pts (${(v.ys / 1000).toFixed(3)}s)`;
									}
									if (k < leftbangnum) {
										leftHtml += self.pmitemRender(v);
									} else {
										rightHtml += self.pmitemRender(v);
									}
								})
							}
							banglistboxs.find(".banglist").eq(0).html(leftHtml);
							banglistboxs.find(".banglist").eq(1).html(rightHtml);
						} else {
							if (data.msg.list.length > 0) {
								$.each(data.msg.list, function (k, v) {
									v.showphbaward = showphbaward;
									v.key = k;
									v.score = "答对:" + v.ddnum + "题，耗时:" + (v.ys / 1000).toFixed(3) + "秒";
									if (isLangEn == '1') {
										v.score = `${v.ddnum} pts (${(v.ys / 1000).toFixed(3)}s)`;
									}
									pmHtml += self.pmitemRender(v);
								})
							}
							$(".banglistBox .banglist").html(pmHtml);
						}
						$(".banglist-title").html(template("pmshakeHeader-tpl", { isteam: data.msg.isteam, showphbaward: showphbaward }));
						$(".banglistBox").removeClass('display-none');
						screencore.anicss('.banglistBox', 'bounceInUp');
					} else {
						layerBox.showMsg(data.msg);
					}
				}, function () {
					clickpm = false;
					layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			$(".banglist-close i").off('click').on('click', function () {
				screencore.anicss('.banglistBox', 'bounceOutDown', function () {
					$(".banglistBox").addClass('display-none');
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
						var pmHtml = "", showphbaward = data.msg.showphbaward || '2', banglistboxs = $(".banglistBox .banglist-boxs");
						if (banglistboxs.length > 0) {
							var leftbangnum = 5, leftHtml = '', rightHtml = '';
							if (data.msg.list.length > 10) leftbangnum = 10;
							if (data.msg.list.length > 0) {
								$.each(data.msg.list, function (k, v) {
									v.leftbangnum = leftbangnum;
									v.showphbaward = showphbaward;
									v.key = k;
									v.score = "答对:" + v.ddnum + "题，耗时:" + (v.ys / 1000).toFixed(3) + "秒";
									if (isLangEn == '1') {
										v.score = `${v.ddnum} pts (${(v.ys / 1000).toFixed(3)}s)`;
									}
									if (k < leftbangnum) {
										leftHtml += self.pmitemRender(v);
									} else {
										rightHtml += self.pmitemRender(v);
									}
								})
							}
							banglistboxs.find(".banglist").eq(0).html(leftHtml);
							banglistboxs.find(".banglist").eq(1).html(rightHtml);
						} else {
							if (data.msg.list.length > 0) {
								$.each(data.msg.list, function (k, v) {
									v.showphbaward = showphbaward;
									v.key = k;
									v.score = "答对:" + v.ddnum + "题，耗时:" + (v.ys / 1000).toFixed(3) + "秒";
									if (isLangEn == '1') {
										v.score = `${v.ddnum} pts (${(v.ys / 1000).toFixed(3)}s)`;
									}
									pmHtml += self.pmitemRender(v);
								})
							}
							$(".banglistBox .banglist").html(pmHtml);
						}
						$(".banglist-title").html(template("pmshakeHeader-tpl", { isteam: data.msg.isteam, showphbaward: showphbaward }));
						$this.parent().attr('data-nowrotateid', data.msg.rotateid);
					} else {
						layerBox.showMsg(data.msg);
					}
				}, function () {
					clickpn = false;
					layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			var clickgpm = false;
			$(".rankBox .grouppm").off('click').on('click', function () {
				var $this = $(this);
				if ($this.hasClass('hidden') || !$this.attr('data-rotateid')) return false;
				if (clickgpm) return;
				clickgpm = true;
				screencore.ajaxSubmit('/screen/answerbs/groupphb', { rotateid: $this.attr('data-rotateid') }, '正在获取团队排行榜数据').then(function (data) {
					clickgpm = false;
					if (data.code == 0) {
						var pmHtml = '<div class="grouppmbox grouppmpop zam-app-flex-ajCenter"><div class="phbtitle">' + data.msg.title + '团队排行榜</div><table><thead><tr><th>排名</th><th style="width:40%;">团队名称</th><th>团队成绩</th><th>团队总用时</th></tr></thead><tbody>';
						if (data.msg.groups.length > 0) {
							$.each(data.msg.groups, function (k, v) {
								pmHtml += '<tr><td>' + (k + 1) + '</td><td style="width:40%;">' + v.groupname + '</td><td>' + v.totalnum + '题</td><td>' + (v.totalys / 1000).toFixed(3) + '秒</td></tr>';
							})
						}
						pmHtml += '</tbody></table><span class="close-grouppm mxc-roundclose" title="关闭团队排行榜" onclick="javascript:$(\'.grouppmbox\').remove();"></span></div>';
						$(".main-box").append(pmHtml);
						if (data.msg.groups.length > 12) {
							$(".grouppmbox table tbody").css('width', 'calc(100% + 8px)');
						}
					} else {
						layerBox.showMsg(data.msg);
					}
				}, function () {
					clickgpm = false;
					layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			var clickanswerfx = false;
			$(".rankBox .answerfx").off('click').on('click', function () {
				var $this = $(this);
				if ($this.hasClass('hidden') || !$this.attr('data-rotateid')) return false;
				if (clickanswerfx) return;
				clickanswerfx = true;
				screencore.ajaxSubmit('/screen/answerbs/rotatequestionfx', { rotateid: $this.attr('data-rotateid') }, '正在获取本轮答题数据').then(function (data) {
					clickanswerfx = false;
					if (data.code == 0) {
						var pmHtml = '<div class="grouppmbox gamequestionfxbox zam-app-flex-ajCenter"><div class="phbtitle">' + data.msg.title + '答题数据分析</div><table><thead><tr><th>题号</th><th style="width:55%;">题目</th><th>参与人数</th><th>答对人数</th><th>正确率</th></tr></thead><tbody>';
						if (data.msg.questions.length > 0) {
							$.each(data.msg.questions, function (k, v) {
								var datapercent = v.endresult.count > 0 ? ((v.endresult.yescount / v.endresult.count) * 1000).toFixed(3) : '0.000';
								pmHtml += '<tr><td>' + (k + 1) + '</td><td style="width:55%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">' + v.questitle + '</td><td>' + v.endresult.count + '人</td><td>' + v.endresult.yescount + '人</td><td>' + datapercent + '%</td></tr>';
							})
						}
						pmHtml += '</tbody></table><span class="close-grouppm mxc-roundclose" title="关闭答题分析" onclick="javascript:$(\'.grouppmbox\').remove();"></span></div>';
						$(".main-box").append(pmHtml);
						if (data.msg.questions.length > 12) {
							$(".grouppmbox table tbody").css('width', 'calc(100% + 8px)');
						}
					} else {
						layerBox.showMsg(data.msg);
					}
				}, function () {
					clickanswerfx = false;
					layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			var clicksignuser = false;
			$(".rankBox .groupsignuser").off('click').on('click', function () {
				var $this = $(this);
				if (clicksignuser) return;
				clicksignuser = true;
				screencore.ajaxSubmit('/screen/answerbs/answerbssignuser', { rotateid: $this.attr('data-rotateid') }, '正在获取团队签到数据').then(function (data) {
					clicksignuser = false;
					if (data.code == 0) {
						var pmHtml = '<div class="grouppmbox gamesignuserbox zam-app-flex-ajCenter"><div class="phbtitle">团队签到(共' + data.msg.totalsignusers + '人)</div><table><thead><tr><th>序号</th><th style="width:25%">团队名称</th><th>签到人数</th><th style="width:50%">签到成员(姓名)</th></tr></thead><tbody>';
						if (data.msg.groups.length > 0) {
							$.each(data.msg.groups, function (k, v) {
								pmHtml += '<tr><td>' + (k + 1) + '</td><td style="width:25%">' + v.groupname + '</td><td>' + v.signcount + '人</td><td style="width:50%;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">' + v.signnames + '</td></tr>';
							})
						}
						pmHtml += '</tbody></table><span class="close-grouppm mxc-roundclose" title="关闭答题分析" onclick="javascript:$(\'.grouppmbox\').remove();"></span></div>';
						$(".main-box").append(pmHtml);
						if (data.msg.length > 12) {
							$(".grouppmbox table tbody").css('width', 'calc(100% + 8px)');
						}
					} else if (data.code == 1) {
						console.log('success');
					} else {
						layerBox.showMsg(data.msg);
					}
				}, function () {
					clicksignuser = false;
					layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			var isclickednext = false;
			$(".answerbs-lists .next-question-btn").off('click').on('click', function () {
				var $this = $(this);
				if (self.autoquestion == 1 || $this.hasClass("display-none")) return;
				if (isclickednext) {
					return;
				}
				isclickednext = true;
				screencore.ajaxSubmit("/screen/common/nextquestion", { 'gametype': XCV3Config.gametype }, '正在初始化下一题..').then(function (data) {
					if (data.code == 0) {
						$this.addClass('display-none');
						$(".pubanswer-question-btn").addClass('display-none');
						layerBox.showMsg((isLangEn == '1' ? "Next question in" : "即将进入下一题"), 1);
					} else {
						layerBox.showMsg(data.msg);
					}
					isclickednext = false;
				}, function () {
					isclickednext = false;
					layerBox.showMsg('网络太差，请稍后重试');
				});

			});
			var isclickedpubanswer = false;
			$(".answerbs-lists .pubanswer-question-btn").off('click').on('click', function () {
				var $this = $(this);
				if (self.autoquestion == 1 || self.autoshowanswer != '2' || $this.hasClass("display-none")) return;
				if (isclickedpubanswer) {
					return;
				}
				isclickedpubanswer = true;
				screencore.ajaxSubmit("/screen/answerbs/showquestionanswer", { questionid: self.nowquestionid }).then(function (data) {
					if (data.code == 0) {
						$this.addClass('display-none');
						self.showquestionresult(data.msg.percents, '1', data.msg.num);
					} else {
						layerBox.showMsg(data.msg);
					}
					isclickedpubanswer = false;
				}, function () {
					isclickedpubanswer = false;
					layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			$(".answerbs-lists .round-pm-btn").off('click').on('click', function () {
				var self = this;
				screencore.ajaxSubmit('/screen/answerbs/showroundpm', { 'gametype': XCV3Config.gametype }).then(function (data) {
					if (data.code == 0) {
						if (data.msg == '1') {
							$(".answerbs-mainbox .emptybox").removeClass("display-none");
						} else {
							$(".rankBox-btns .paiming").attr({ 'data-rotateid': data.msg.rotateid, 'data-gamephb': data.msg.gamephb });
							$(".grouppm,.answerfx,.groupsignuser").attr('data-rotateid', data.msg.rotateid);
							screencore.gameEndphb(data.msg.lists, data.msg.endphb, data.msg.groupconfig);
						}
					} else {
						layerBox.showMsg(data.msg);
					}
				}, function () {
					layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			keyboardJS.off(['space', 'right', 'shift', '.', 'up', 'down', ',', 'alt']);
			keyboardJS.bind('space', function (e) {
				if (self.gamestatus == 1) {
					$(".start-btn").trigger('click');
				}
			});
			var isclickprev = false;
			keyboardJS.bind('left', function (e) {
				if ($(".dzcubepercent").length > 0 && self.autoquestion == '2' && self.questionstatus == '3') {
					if (isclickprev) {
						return false;
					}
					isclickprev = true;
					screencore.ajaxSubmit('/screen/answerbs/changequestion', { type: '1', questionid: self.nowquestionid }, '正在获取上一题结果').then(function (data) {
						if (data.code == 0) {
							var json = data.msg;
							self.nowquestionid = json.question.id || '0';
							$(".answerbs-lists .answerbs-quescontent").html(self.questiontpl(json.question));
							self.rushDom({ isteam: '2', alllist: json.alllist, nowlist: json.nowlist, nowerrorlist: json.nowerrorlist });
							self.showquestionresult(json.percents);
						} else {
							layerBox.showMsg(data.msg);
						}
						isclickprev = false;
					}, function () {
						isclickprev = false;
						layerBox.showMsg('网络太差，请稍后重试');
					});
				}
			});
			var isclicknext = false;
			keyboardJS.bind('right', function (e) {
				if ($(".dzcubepercent").length > 0 && self.autoquestion == '2' && self.questionstatus == '3') {
					if (isclicknext) {
						return false;
					}
					isclicknext = true;
					screencore.ajaxSubmit('/screen/answerbs/changequestion', { type: '2', questionid: self.nowquestionid }, '正在获取下一题结果').then(function (data) {
						if (data.code == 0) {
							var json = data.msg;
							self.nowquestionid = json.question.id || '0';
							$(".answerbs-lists .answerbs-quescontent").html(self.questiontpl(json.question));
							self.rushDom({ isteam: '2', alllist: json.alllist, nowlist: json.nowlist, nowerrorlist: json.nowerrorlist });
							self.showquestionresult(json.percents);
						} else {
							layerBox.showMsg(data.msg);
						}
						isclicknext = false;
					}, function () {
						isclicknext = false;
						layerBox.showMsg('网络太差，请稍后重试');
					});
				} else {
					if (self.gamestatus == 2 && self.questionstatus == '2') {
						layerBox.showConfirm('警告', '当前题目还未结束，确定要强制结束本题么?', ['确定', '取消'], function () {
							$(".welcomeBox").addClass('display-none');
							screencore.ajaxSubmit("/screen/common/gameend", { 'gametype': XCV3Config.gametype }).then(function (data) { });
						});
					} else {
						self.gameend == 1 && $(".rankBox .nextround").trigger('click');
					}
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
			keyboardJS.bind('.', function (e) {
				$(".answerbs-lists .next-question-btn").trigger('click');
			});
			keyboardJS.bind('alt', function (e) {
				$(".answerbs-lists .pubanswer-question-btn").trigger('click');
			});
			keyboardJS.bind(',', function (e) {
				if ($(".gamesignuserbox").length > 0) {
					return $(".gamesignuserbox .close-grouppm").trigger('click');
				}
				$(".rankBox .groupsignuser").trigger('click');
			});
			keyboardJS.bind('up', function (e) {
				if ($(".grouppmpop").length > 0) {
					return $(".grouppmpop .close-grouppm").trigger('click');
				}
				$(".rankBox .grouppm").trigger('click');
			});
			keyboardJS.bind('down', function (e) {
				if ($(".gamequestionfxbox").length > 0) {
					return $(".gamequestionfxbox .close-grouppm").trigger('click');
				}
				$(".rankBox .answerfx").trigger('click');
			});
			if (waitshowquestion == '1') {
				$(".answerbs-quescontent").on('click', 'video', function () {
					var $this = $(this), video = $this[0];
					if (video.requestFullscreen) {
						video.requestFullscreen();
					} else if (video.mozRequestFullScreen) {
						video.mozRequestFullScreen();
					} else if (video.webkitRequestFullscreen) {
						video.webkitRequestFullscreen();
					} else if (video.msRequestFullscreen) {
						video.msRequestFullscreen();
					}
				});
			}
		},
		rushlrtitle: function (isteam) {
			var self = this, isteam = isteam || self.isteam, lefttitle = isteam == '2' ? '本题排名' : '本题团队排名', righttitle = isteam == '2' ? '本轮排名' : '本轮团队排名';
			if (isLangEn === '1' && isteam == '2') {
				lefttitle = 'STANDINGS FOR THIS QUESTION';
				righttitle = 'ROUND LEADERBOARD'
			}
			if ($(".dzcubepercent").length > 0 && isteam == '2') {
				lefttitle = '本题答对排名';
				righttitle = '本题答错排名';
			}
			$(".answerbs-lists .answerbs-onerank-title").text(lefttitle);
			$(".answerbs-lists .answerbs-allrank-title").text(righttitle);
		},
		rushDom: function (json) {
			var self = this, $onehtml = '', $allhtml = '';
			self.rankTen = json.isteam == '2' ? json.alllist : json.teamalllist;
			var leftlists = json.isteam == '2' ? json.nowlist : json.teamnowlist;
			$.each(leftlists, function (i, v) {
				v.key = i + 1;
				v.ys = (v.ys / 1000).toFixed(3);
				$onehtml += self.questionranktpl(v);
			});
			$(".answerbs-lists .answerbs-onerank-lists").html($onehtml);
			var rightlists = json.isteam == '2' ? json.alllist : json.teamalllist;
			if ($(".dzcubepercent").length > 0 && json.isteam == '2') {
				rightlists = json.nowerrorlist;
			}
			$.each(rightlists, function (i, v) {
				v.key = i + 1;
				v.ys = (v.ys / 1000).toFixed(3);
				$allhtml += self.allranktpl(v);
			});
			$(".answerbs-lists .answerbs-allrank-lists").html($allhtml);
		},
		showLastRoundUser: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/common/getlastrotatephb', { 'gametype': XCV3Config.gametype }).then(function (data) {
				if (data.code == 0) {
					if (data.msg == '1') {
						$(".answerbs-mainbox .emptybox").removeClass("display-none");
					} else {
						var tipindex = layerBox.showLoading(isLangEn === '1' ? 'Final results based on the last round' : '无正在进行的轮次，直接显示最后一轮结果');
						setTimeout(function () {
							layerBox.close(tipindex);
						}, 1e3);
						self.bindEvent();
						$(".rankBox-btns .paiming").attr({ 'data-rotateid': data.msg.rotateid, 'data-gamephb': data.msg.gamephb });
						$(".grouppm,.answerfx,.groupsignuser").attr('data-rotateid', data.msg.rotateid);
						screencore.gameEndphb(data.msg.lists, data.msg.endphb, data.msg.groupconfig);
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
		showquestionresult: function (data, hadshowanswer, num) {
			var self = this, persum = self.sum(data), hadshowanswer = hadshowanswer || '1', num = num || false;
			if ($(".dzcubepercent").length) {
				var html = '<ul class="answer-items-list zam-app-flex">';
				var itemlen = data.length, lwidth = 100 / data.length;
				for (var i = 0; i < itemlen; i++) {
					var onenum = data[i] || 0;
					var percentone = persum > 0 ? ((onenum / persum) * 100).toFixed(2) : 0;
					if (percentone > 100) {
						percentone = 100;
					}
					var json = {
						lwidth: lwidth + '%',
						percent: percentone + '%',
						itemname: (i == 0 ? 'A' : (i == 1 ? 'B' : (i == 2 ? 'C' : (i == 3 ? 'D' : (i == 4 ? 'E' : 'F'))))),
					};
					html += template('questionvote-tpl', json);
				}
				html += '</ul>';
				$(".answerbs-questionitems").hide();
				$(".answerbs-quescontent").append(html);
				$(".answerbs-questitle .yesanswer").removeClass('display-none');
			} else {
				if (self.autoquestion == 2 && self.autoshowanswer == '2' && hadshowanswer == '2') {
					$(".answerbs-lists .pubanswer-question-btn,.answerbs-lists .next-question-btn").removeClass('display-none');
				} else {
					if (self.autoquestion == 2) {
						$(".answerbs-lists .pubanswer-question-btn").addClass('display-none');
						if (num && num > 0) {
							$(".answerbs-lists .next-question-btn").removeClass('display-none');
						} else {
							$(".answerbs-lists .next-question-btn").addClass('display-none');
						}
					}
					$(".answerbs-lists .answerbs-quesitem-right").show();
					$(".answerbs-questionitems li").each(function (i, v) {
						var onenum = data[i] || 0;
						var percentone = persum > 0 ? ((onenum / persum) * 100) : 0;
						$(this).find(".answerbs-quesitem-precent").css({ "width": percentone + "%" });
					});
				}
			}
		},
		sum: function (arr) {
			if ($.isArray(arr)) {
				var arrSum = 0;
				for (var i = 0; i < arr.length; i++) {
					arrSum += arr[i] || 0;
				}
				return arrSum
			}
			return 0;
		},
		autostart: function () {
			var self = this;
			clearInterval(self.joinInterval);
			setTimeout(function () {
				$(".start-btn").trigger('click');
			}, 1e3)
		}
	};
	return screenanswerbs;
});
