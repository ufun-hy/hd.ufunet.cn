define('screenlivemark', ['screencore', 'screensocket', 'template', 'layerBox', 'fulldm', 'keyboard', 'anime', 'jquery.ui'], function (screencore, screensocket, template, layerBox, fulldm, keyboardJS, anime) {
	var screenlivemark = {
		ntimeout: null,//普通定时器
		stimeout: null,//成绩排名定时器
		ztimeout: null,//赞排名定时器
		otimeout: null,//单个用户定时器
		pfuserid: 0,
		openpubpw: 2,
		pubweight: 0,
		init: function () {
			var self = this;
			var wsConfig = {};
			wsConfig.onmessage = function (data) {
				if (data.type == 'connected') {
					screensocket.isclose = false;
					screencore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'rolllivemark' || data.type == 'resetalllivemark') {
					window.location.reload();
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
				}
			};
			screensocket.init(wsConfig);
			self.ajaxdata(function () {
				self.bindEvent();
				self.ntimeout = setInterval(function () {
					self.loadNormaldata();
				}, 3e3);
			});

			$('.openpubpw').draggable({
				scroll: false,
				drag: function (evt, ui) {
					var pagezoom = (window.innerHeight / 800).toFixed(4);
					var maxH = $('.full-main').height();
					var maxW = $('.full-main').width();
					var boxW = $(this).width();
					var boxH = $(this).height();
					var changeLeft = ui.position.left - ui.originalPosition.left;
					var changeTop = ui.position.top - ui.originalPosition.top;
					ui.position.left = ui.originalPosition.left / pagezoom + (changeLeft / pagezoom);
					ui.position.top = ui.originalPosition.top / pagezoom + (changeTop / pagezoom);
					if (ui.position.left < 0) ui.position.left = 0;
					if (ui.position.left + boxW > maxW) ui.position.left = maxW - boxW;
					if (ui.position.top < 0) ui.position.top = 0;
					if (ui.position.top + boxH > maxH) ui.position.top = maxH - boxH;
				}
			});
			setTimeout(function () {
				self.initautoScroll('.livemark-users');
			}, 2e3);
		},
		ajaxdata: function (fn) {
			screencore.ajaxSubmit('/screen/livemark/getnormaldata', {}, '正在获取轮次数据').then(function (json) {
				if (json.code == 0) {
					if (json.msg != false) {
						var pfuser = json.msg.pfusers;
						var normalhtml = "";
						if (pfuser.length > 0) {
							$.each(pfuser, function (k, v) {
								v.scoretype = json.msg.scoretype;
								normalhtml += template('normaluserItem', v);
							})
						}
						$(".livemark-title").text(json.msg.title);
						$(".livemark-users").html(normalhtml);
						$(".emptybox").addClass('display-none');
						json.msg.openzan == '2' ? $(".livemark-btns").addClass('display-none') : $(".livemark-btns").removeClass('display-none');
						if (json.msg.pfstatus && json.msg.pfstatus == '2') {
							$(".startstopbtn div").attr({ 'class': 'endstatus', 'data-state': '2' });
						}
						$(".livemark-list").removeClass('display-none');
					} else {
						$(".livemark-list").addClass('display-none');
						$(".emptybox").removeClass('display-none');
					}
				} else {
					layerBox.showMsg(json.msg);
				}
				fn && fn();
			}, function () {
				layerBox.showMsg('网络太差，请稍后重试');
			});
		},
		loadNormaldata: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/livemark/getnormaldata', {}).then(function (json) {
				if (json.code == 0) {
					if (json.msg != false) {
						var pfuser = json.msg.pfusers, normalhtml = "", len = $(".livemark-users .livemark-user-item").length;
						if (pfuser.length > 0) {
							$.each(pfuser, function (k, v) {
								if (v.screenshow == '1') {
									v.scoretype = json.msg.scoretype;
									normalhtml += template('normaluserItem', v);
								}
							})
						}
						json.msg.openzan == '2' ? $(".livemark-btns").addClass('display-none') : $(".livemark-btns").removeClass('display-none');
						$(".livemark-title").text(json.msg.title);
						$(".livemark-users").html(normalhtml);
						if (pfuser.length != len) {
							self.startScrollY = $('.livemark-users').scrollTop();
							self.scrollReset = true;
							self.initautoScroll('.livemark-users');
						}
					}
				} else {
					layerBox.showMsg(json.msg);
				}
			}, function () {
				layerBox.showMsg('网络太差，请稍后重试');
			});
		},
		loadScoredata: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/livemark/getscoredata', {}).then(function (json) {
				if (json.code == 0) {
					if (json.msg != false) {
						$(".livemark-title").text(json.msg.title);
						var pfuser = json.msg.pfusers, len = $(".livemark-phb-itembox").length + $(".livemark-phb-other-item").length;
						if (pfuser.length > 0) {
							if (pfuser[0]) {
								pfuser[0].keyindex = 1;
								pfuser[0].scoretype = json.msg.scoretype;
								$(".livemark-phb-top .rank1").html(template('scorephbtopItem', pfuser[0])).attr('data-pfuserid', pfuser[0].id);
							}
							if (pfuser[1]) {
								pfuser[1].keyindex = 2;
								pfuser[1].scoretype = json.msg.scoretype;
								$(".livemark-phb-top .rank2").html(template('scorephbtopItem', pfuser[1])).attr('data-pfuserid', pfuser[1].id);
							}
							if (pfuser[2]) {
								pfuser[2].keyindex = 3;
								pfuser[2].scoretype = json.msg.scoretype;
								$(".livemark-phb-top .rank3").html(template('scorephbtopItem', pfuser[2])).attr('data-pfuserid', pfuser[2].id);
							}
							var otherhtml = "";
							if (pfuser.length > 3) {
								$.each(pfuser, function (k, v) {
									if (k > 2) {
										v.keyindex = k + 1;
										v.scoretype = json.msg.scoretype;
										otherhtml += template('scorephbotherItem', v);
									}
								})
							}
							$(".livemark-phb-others").html(otherhtml);
						} else {
							$(".livemark-phb-top .rank2,.livemark-phb-top .rank1,.livemark-phb-top .rank3,.livemark-phb-others").empty();
						}
						if (pfuser.length != len) {
							self.startScrollY = $('.livemark-phbs').scrollTop();
							self.scrollReset = true;
							self.initautoScroll('.livemark-phbs');
						}
						json.msg.openzan == '2' ? $(".livemark-btns").addClass('display-none') : $(".livemark-btns").removeClass('display-none');
					}
				} else {
					layerBox.showMsg(json.msg);
				}
			}, function () {
				layerBox.showMsg('网络太差，请稍后重试');
			});
		},
		loadZandata: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/livemark/getzandata', {}).then(function (json) {
				if (json.code == 0) {
					if (json.msg != false) {
						$(".livemark-title").text(json.msg.title);
						var pfuser = json.msg.pfusers;
						var zanhtml = "";
						if (pfuser.length > 0) {
							$.each(pfuser, function (k, v) {
								v.keyindex = k + 1;
								v.zanpercent = json.msg.totalzan > 0 ? ((v.zan / json.msg.totalzan) * 100) : 0;
								zanhtml += template('zanphbItem', v);
							})
						}
						$(".livemark-dianzans").html(zanhtml);
						if (json.msg.openzan == '2') {
							$(".livemark-scrollbox .livemark-dianzans").addClass('display-none');
							$(".livemark-btns").addClass('display-none');
							self.clearAll();
							self.loadNormaldata();
							self.ntimeout = setInterval(function () {
								self.loadNormaldata();
							}, 3e3);
							$(".livemark-btns .btn-mark").addClass('active').siblings().removeClass('active');
							$(".livemark-scrollbox .livemark-users").removeClass('display-none');
							$(".livemark-topbtn").removeClass('display-none');
						} else {
							$(".livemark-btns .btn-mark").removeClass('active').siblings().addClass('active');
							$(".livemark-btns").removeClass('display-none');
						}
					}
				} else {
					layerBox.showMsg(json.msg);
				}
			}, function () {
				layerBox.showMsg('网络太差，请稍后重试');
			});
		},
		nowpfusers: [],
		loadUserdata: function () {
			var self = this, loadtype = '1';
			if ($(".dzhuoba").length > 0) {
				loadtype = '2';
			} else if ($(".dzshule").length > 0) {
				loadtype = '3';
			}
			screencore.ajaxSubmit('/screen/livemark/getuserdata', { loadtype: loadtype, pfuserid: self.pfuserid }).then(function (json) {
				if (json.code == 0) {
					if ($(".dzhuoba").length > 0) {
						if ($(".livemark-waitshow .publish-btn").attr('data-pfuserid') != json.msg.id) {
							$(".livemark-waitshow .publish-btn").attr('data-hadclick', '2');
							$(".livemark-waitshow .publish-btn").attr('data-pfuserid', json.msg.id);
						}
						if (json.msg.userstatus == '1' && $(".livemark-waitshow .publish-btn").attr('data-hadclick') == '2' && $(".livemark-waitshow .publish-btn").attr('data-pfuserid') == json.msg.id) {
							$(".livemark-userone").css('opacity', '0');
							$(".zy-pw span").text(json.msg.zypfnum || '0');
							$(".pub1-pw .num").text(json.msg.livemarkgroups[0].dfcount || '0');
							$(".pub2-pw .num").text(json.msg.livemarkgroups[1].dfcount || '0');
							$(".pub1-pw .name").text(json.msg.livemarkgroups[0].groupname || '媒体评委');
							$(".pub2-pw .name").text(json.msg.livemarkgroups[1].groupname || '大众评委');
							if (json.msg.tfend == '1') {
								$(".livemark-waitshow .publish-btn").removeClass('hidden');
							} else {
								$(".livemark-waitshow .publish-btn").addClass('hidden');
							}
							$(".livemark-waitshow").removeClass('hidden');
						} else {
							$(".livemark-userone").css('opacity', '1');
							$(".livemark-waitshow").addClass('hidden');
						}
					} else if ($(".dzshule").length > 0) {
						if ($(".livemark-waitshow2 .publish-btn").attr('data-pfuserid') != json.msg.id) {
							$(".livemark-waitshow2 .publish-btn").attr('data-hadclick', '2');
							$(".livemark-waitshow2 .publish-btn").attr('data-pfuserid', json.msg.id);
						}
						$(".livemark-userone").css('opacity', '0');
						$(".livemark-waitshow2 .livemark-markname span").html(json.msg.username);
						$(".livemark-waitshow2 .openmarkbox .livemark-markcompany span").html(json.msg.username);
						//更新所有评委分数和最终得分
						var pwlists = json.msg.pwlists, pwhtml = '';
						if (pwlists.length > 0) {
							$.each(pwlists, function (i, v) {
								pwhtml += '<div class="pw-one zam-app-flex-ajCenter"><div class="pw-scorebox zam-app-flex-ajCenter' + (v.totalscore ? ' hadscore' : '') + '"><div class="pw-score">' + (v.totalscore ? v.totalscore : '') + '</div></div><div class="pw-num">评委<span>' + (i + 1) + '</span></div></div>';
							});
						}
						$('.livemark-waitshow2 .pw-lists').html(pwhtml);
						$('.livemark-waitshow2 .livemark-companyscore .scoreitembox .scoreitem div').text(json.msg.score === false ? '无' : json.msg.score);
						//json.msg.scoretype == '1' ? '总分' : '平均分'
						$('.livemark-waitshow2 .livemark-companyscore .scoreitembox .scorename').text('得分');
						if ($(".livemark-waitshow2 .publish-btn").attr('data-hadclick') == '2' && $(".livemark-waitshow2 .publish-btn").attr('data-pfuserid') == json.msg.id) {
							$(".livemark-waitshow2 .waitmarkbox").removeClass('hidden');
							$(".livemark-waitshow2 .openmarkbox").addClass('hidden');
						} else {
							$(".livemark-waitshow2 .waitmarkbox").addClass('hidden');
							$(".livemark-waitshow2 .openmarkbox").removeClass('hidden');
						}
						$(".livemark-waitshow2").removeClass('hidden');
					} else if ($('.pubscore-btn').length > 0) {
						if ($(".livemark-userone .pubscore-btn").attr('data-pfuserid') != json.msg.id) {
							$(".livemark-userone .pubscore-btn").attr('data-hadclick', '2');
							$(".livemark-userone .pubscore-btn").attr('data-pfuserid', json.msg.id);
							$(".livemark-userone .pubscore-btn").text('得分统计中');
						}
						if ($(".livemark-userone .pubscore-btn").attr('data-hadclick') == '2' && $(".livemark-userone .pubscore-btn").attr('data-pfuserid') == json.msg.id) {
							if (json.msg.openpubpw != '1') {
								$(".livemark-user-score .scoretype,.livemark-user-score .scorenum").addClass('hidden');
							}
						} else {
							if (json.msg.openpubpw != '1') {
								$(".livemark-user-score .scoretype,.livemark-user-score .scorenum").removeClass('hidden');
							}
						}
					}
					$(".livemark-title").text(json.msg.title);
					$(".livemark-userone-info img").attr('src', json.msg.userimg);
					$(".livemark-userone-info div").text(json.msg.username);
					$(".livemark-userone-des").text(json.msg.userdes);
					if (json.msg.openzan == '1') {
						if (json.msg.zanpm === false) {
							$(".livemark-user-rank").addClass('display-none');
						} else {
							$(".livemark-user-rank span").text(json.msg.zanpm);
							$(".livemark-user-rank").removeClass('display-none');
						}
						$(".livemark-user-zanbox span span").text(json.msg.totalzan);
						var zanhtml = '';
						$.each(json.msg.zanusers, function (i, v) {
							zanhtml += template("pfzanItem", v);
						});
						$(".livemark-zanbox").html(zanhtml);
						$(".livemark-zanmain").removeClass('display-none');
					} else {
						if (!$(".livemark-scrollbox .livemark-dianzans").hasClass('display-none')) {
							$(".livemark-scrollbox .livemark-dianzans").addClass('display-none');
							$(".livemark-scrollbox .livemark-users").removeClass('display-none');
							$(".livemark-topbtn").removeClass('display-none');
							$(".livemark-btns .btn-mark").addClass('active').siblings().removeClass('active');
						}
						$(".livemark-zanmain").addClass('display-none');
					}
					var showpws = json.msg.showpws || '2';
					if (json.msg.openpubpw == '1') {
						$(".livemark-user-totalscore").addClass('ispubpwscore');
						$('.livemark-user-score').addClass('hidden');
						$('.openpubpw').removeClass('hidden').css({ "background-color": json.msg.scorebgcolor, "color": json.msg.scoretxtcolor });
						if ($(".dzhuoba").length > 0) {
							$('.openpubpw .score_pw').text(json.msg.score_pw === false ? '无' : json.msg.score_pw);
							$('.openpubpw .showpub2').text((json.msg.livemarkgroups[0].groupname ? json.msg.livemarkgroups[0].groupname : '媒体评委') + "得分");
							$('.openpubpw .showpub3').text((json.msg.livemarkgroups[1].groupname ? json.msg.livemarkgroups[1].groupname : '大众评委') + "得分");
							$('.openpubpw .score_pub').text(json.msg.livemarkgroups[0].score === false ? '无' : json.msg.livemarkgroups[0].score);
							$('.openpubpw .score_pub2').text(json.msg.livemarkgroups[1].score === false ? '无' : json.msg.livemarkgroups[1].score);
							$('.openpubpw .score_last').text(json.msg.score === false ? '无' : json.msg.score);
							$('.openpubpw .pw_weight').text(100 - json.msg.pubweight);
							$('.openpubpw .pub_weight').text(json.msg.livemarkgroups[0].pubweight || '2');
							$('.openpubpw .pub_weight2').text(json.msg.livemarkgroups[1].pubweight || '3');
						} else {
							var pubscorebtn = $(".pubscore-btn");
							if (pubscorebtn.length > 0 && pubscorebtn.attr('data-hadclick') == '2') {
								$('.openpubpw .score_pw .pw_score').text('---');
								$('.openpubpw .score_pub .pw_score').text('---');
								$('.openpubpw .score_last').text('---');
							} else {
								$('.openpubpw .score_pw .pw_score').text(json.msg.score_pw === false ? '无' : json.msg.score_pw);
								$('.openpubpw .score_pub .pw_score').text(json.msg.score_pub === false ? '无' : json.msg.score_pub);
								$('.openpubpw .score_last').text(json.msg.score === false ? '无' : json.msg.score);
							}
							$('.openpubpw .score_pw .pw_num span').text(json.msg.hadpwnum || 0);
							$('.openpubpw .score_pub .pw_num span').text(json.msg.pubhadpwnum || 0);

							$('.openpubpw .pw_weight').text(100 - json.msg.pubweight);
							$('.openpubpw .pub_weight').text(json.msg.pubweight);
							if (json.msg.pubweight == '100') {
								$(".openpubpw div").addClass('display-none');
								$(".openpubpw .showpub2,.openpubpw .score_pub,.openpubpw .pw_score,.openpubpw .pw_num").removeClass('display-none');
							} else {
								$(".openpubpw div").removeClass('display-none');
							}
						}
					} else {
						$(".livemark-user-totalscore").removeClass('ispubpwscore');
						$('.livemark-user-score').removeClass('hidden');
						$('.openpubpw').addClass('hidden');
						$(".livemark-user-score .scoretype").text(json.msg.scoretype == '1' ? '总分：' : '平均分：');
						var scorenumtxt = json.msg.score === false ? '无' : json.msg.score;
						if (showpws == '1' && json.msg.hadpwnum < json.msg.totalpwnum) {
							scorenumtxt = '评分中';
						}
						$(".livemark-user-score .scorenum").text(scorenumtxt);
						$(".livemark-user-score .pwbox .hadpwnum span").text(json.msg.hadpwnum || 0);
						$(".livemark-user-score .pwbox .pwnums span").text(json.msg.totalpwnum || 0);
					}
					var tiphtml = '';
					if (json.msg.pfmode == '2') {
						if (json.msg.maxmintype != '2') {
							tiphtml += '去掉一个最高分';
							if (json.msg.maxscore != '') {
								tiphtml += '<span class="maxscore">' + json.msg.maxscore + '分</span>';
							}
							tiphtml += '，去掉一个最低分';
							if (json.msg.minscore != '') {
								tiphtml += '<span class="minscore">' + json.msg.minscore + '分</span>';
							}
						}
					}
					$(".livemark-user-totalscore .scoretips").html(tiphtml);
					json.msg.pftype == '1' ? $(".livemark-user-pj").addClass('display-none') : $(".livemark-user-pj").removeClass('display-none');
					self.nowpfusers = json.msg.pfusers;
					if (showpws == '1') {
						var pwhtml = '';
						$.each(json.msg.pws, function (i, v) {
							v.showpws = '1';
							pwhtml += template("pwpfItem", v);
						});
						$(".livemark-user-pingwei").html(pwhtml);
					} else {
						if (json.msg.pfusers.length <= 0) {
							self.clearpwtimer();
						} else {
							$.each(json.msg.pfusers, function (i, v) {
								if (v.pwtype == '1') {
									var onepwitem = $(".livemark-user-pingwei").find(".pwone-" + v.id);
									if (onepwitem.length <= 0) {
										v.showpws = '2';
										$(".livemark-user-pingwei").append(template("pwpfItem", v));
									}
								}
							});
							$(".livemark-user-pingwei .pingweione").removeClass('ispwmax ispwmin');
							var pwminitem = $(".livemark-user-pingwei .pwone-" + json.msg.minpwid);
							var pwmaxitem = $(".livemark-user-pingwei .pwone-" + json.msg.maxpwid);
							if (pwminitem.length > 0 || pwmaxitem.length > 0) {
								if (pwminitem.length > 0) pwminitem.addClass('ispwmin');
								if (pwmaxitem.length > 0) pwmaxitem.addClass('ispwmax');
							}
						}
						//加减基础分
						if ($(".decscorebox").length <= 0) {
							self.pwusermove();
						} else {
							var prids = [];
							if (self.nowpfusers.length > 0) {
								var prids = $.map(self.nowpfusers, function (item) {
									return item.id;
								});
							}
							var pingweones = $(".livemark-user-pingwei .pingweione");
							if (pingweones.length > 0 && prids.length > 0) {
								pingweones.each(function () {
									var oneprid = $(this).attr('data-prid') || -1;
									if ($.inArray(parseInt(oneprid), prids) == -1) {
										$(this).remove();
									}
								});
							}
							var basicscore = parseFloat(json.msg.basicscore);
							if (basicscore > 0) {
								$(".decscorebox .decscorebox-icon").text('+');
								$(".decscorebox .decscorebox-info-title").text('加分');
								$(".decscorebox-info-score").text(basicscore.toFixed(2));
							} else {
								$(".decscorebox .decscorebox-icon").text('-');
								$(".decscorebox .decscorebox-info-title").text('扣分');
								$(".decscorebox-info-score").text((basicscore * -1).toFixed(2));
							}
							$(".lastscorebox .lastscorebox-info-score").text(json.msg.score2 === false ? '无' : json.msg.score2);
							$(".decscorebox").removeClass('hidden');
							$(".lastscorebox").removeClass('hidden');
							$(".livemark-user-pingwei .pingweione").removeClass('ispwmax ispwmin');
							var pwminitem = $(".livemark-user-pingwei .pwone-" + json.msg.minpwid);
							var pwmaxitem = $(".livemark-user-pingwei .pwone-" + json.msg.maxpwid);
							if (pwminitem.length > 0 || pwmaxitem.length > 0) {
								if (pwminitem.length > 0) pwminitem.addClass('ispwmin');
								if (pwmaxitem.length > 0) pwmaxitem.addClass('ispwmax');
							}
						}
					}
					var pfitemhtml = '';
					$.each(json.msg.pfitem, function (i, v) {
						v.score = parseFloat(v.score / json.msg.pfusers.length).toFixed(2);
						v.dfmax = parseFloat(v.dfmax).toFixed(2);
						v.percent = (v.score / v.dfmax) * 100;
						pfitemhtml += template("pfitemone", v);
					});
					$(".livemark-user-single").html(pfitemhtml);
				} else {
					layerBox.showMsg(json.msg);
				}
			}, function () {
				layerBox.showMsg('网络太差，请稍后重试');
			});
		},
		bindEvent: function () {
			var self = this;
			$(".livemark-btns div").on('click', function () {
				var $this = $(this);
				$(".livemark-scrollbox>div").addClass('display-none');
				if ($this.hasClass('btn-mark')) {
					if ($(".livemark-topbtn").text() == '查看排名') {
						self.clearAll();
						self.loadNormaldata();
						self.ntimeout = setInterval(function () {
							self.loadNormaldata();
						}, 3e3);
						$(".livemark-scrollbox .livemark-users").removeClass('display-none');
					} else {
						self.clearAll();
						self.loadScoredata();
						self.stimeout = setInterval(function () {
							self.loadScoredata();
						}, 3e3);
						$(".livemark-scrollbox .livemark-phbs").removeClass('display-none');
					}
					$(".livemark-topbtn").removeClass('display-none');
				} else {//点击了人气
					self.clearAll();
					self.loadZandata();
					self.ztimeout = setInterval(function () {
						self.loadZandata();
					}, 3e3);
					$(".livemark-scrollbox .livemark-dianzans").removeClass('display-none');
					$(".livemark-topbtn").addClass('display-none');
				}
				$this.addClass('active').siblings().removeClass('active');
			});
			$(".livemark-topbtn").on('click', function () {
				var $this = $(this);
				$(".livemark-scrollbox>div").addClass('display-none');
				if ($this.text() == '查看排名') {
					$(".livemark-users").empty();
					self.removeautoScroll('.livemark-users');
					self.clearAll();
					self.loadScoredata();
					self.stimeout = setInterval(function () {
						self.loadScoredata();
					}, 3e3);
					$(".livemark-scrollbox .livemark-users").addClass('display-none');
					$(".livemark-scrollbox .livemark-phbs").removeClass('display-none').scrollTop(0);
					$this.text("<<返回列表");
				} else {//点击返回列表
					$(".livemark-phb-top .rank2,.livemark-phb-top .rank1,.livemark-phb-top .rank3,.livemark-phb-others").empty();
					self.removeautoScroll('.livemark-phbs');
					self.clearAll();
					self.loadNormaldata();
					self.ntimeout = setInterval(function () {
						self.loadNormaldata();
					}, 3e3);
					$(".livemark-scrollbox .livemark-users").removeClass('display-none').scrollTop(0);
					$(".livemark-scrollbox .livemark-phbs").addClass('display-none');
					$this.text("查看排名");
				}
			});
			$(".livemark-users").on('click', '.livemark-user-item', function () {
				var $this = $(this);
				self.pfuserid = $this.attr('data-pfuserid');
				self.clearAll();
				self.loadUserdata();
				self.otimeout = setInterval(function () {
					self.loadUserdata();
				}, 3e3);
				$(".livemark-list").addClass('display-none');
				$(".livemark-userone").removeClass('display-none');
			});
			//
			$(".livemark-dianzans").on('click', '.livemark-dz-item', function () {
				var $this = $(this);
				self.pfuserid = $this.attr('data-pfuserid');
				self.clearAll();
				self.loadUserdata();
				self.otimeout = setInterval(function () {
					self.loadUserdata();
				}, 3e3);
				$(".livemark-list").addClass('display-none');
				$(".livemark-userone").removeClass('display-none');
			});
			$(".livemark-phbs").on('click', '.livemark-phb-item,.livemark-phb-other-item', function () {
				var $this = $(this);
				self.pfuserid = $this.attr('data-pfuserid');
				self.clearAll();
				self.loadUserdata();
				self.otimeout = setInterval(function () {
					self.loadUserdata();
				}, 3e3);
				$(".livemark-list").addClass('display-none');
				$(".livemark-userone").removeClass('display-none');
			});
			$(".livemark-userone").on('click', '.returnall', function () {
				self.pfuserid = 0;
				var showboxClass = $(".livemark-scrollbox>div").not($(".display-none")).attr('class');
				self.clearAll();

				if (showboxClass == 'livemark-users') {
					self.loadNormaldata();
					self.ntimeout = setInterval(function () {
						self.loadNormaldata();
					}, 3e3);
				} else if (showboxClass == 'livemark-phbs') {
					self.loadScoredata();
					self.stimeout = setInterval(function () {
						self.loadScoredata();
					}, 3e3);
				} else {
					self.loadZandata();
					self.ztimeout = setInterval(function () {
						self.loadZandata();
					}, 3e3);
				}
				$(".livemark-list").removeClass('display-none');
				$(".livemark-userone").addClass('display-none');
			});
			//切换评委评分与单项分
			$(".livemark-user-pj").on('click', function () {
				var $this = $(this), btntext = $this.text();
				if (btntext == '查看评委分') {
					$this.text('查看单项平均分');
					$(".livemark-user-pingwei").removeClass('display-none');
					$(".livemark-user-single").addClass('display-none');
				} else {
					$this.text('查看评委分');
					$(".livemark-user-pingwei").addClass('display-none');
					$(".livemark-user-single").removeClass('display-none');
				}
			});
			//切换单个用户
			$(".livemark-userone .livemark-prevone").on('click', function () {
				if (self.pfuserid == 0) return false;
				self.showprevnext('1');
			});
			$(".livemark-userone .livemark-nextone").on('click', function () {
				if (self.pfuserid == 0) return false;
				self.showprevnext('2');
			});
			$(".livemark-waitshow .publish-btn").click(function () {
				$(this).attr('data-hadclick', '1');
				$(".livemark-waitshow .publish-btn").attr('data-pfuserid', self.pfuserid);
				$(".livemark-userone").css('opacity', '1');
				$(".livemark-waitshow").addClass('hidden');
			});
			keyboardJS.bind('shift', function (e) {
				if ($(".dzhuoba").length > 0) $(".livemark-waitshow .publish-btn").trigger('click');

			});
			$(".livemark-waitshow2 .publish-btn").click(function () {
				$(this).attr('data-hadclick', '1');
				$(".livemark-waitshow2 .publish-btn").attr('data-pfuserid', self.pfuserid);
				$(".livemark-waitshow2 .waitmarkbox").addClass('hidden');
				$(".livemark-waitshow2 .openmarkbox").removeClass('hidden');
			});
			//20230824 定制隐藏分数
			$(".livemark-userone .pubscore-btn").click(function () {
				var btnhadclick = $(this).attr('data-hadclick') || '2';
				if (btnhadclick == '2') {
					$(this).attr('data-hadclick', '1');
					$(this).attr('data-pfuserid', self.pfuserid);
					$(this).text('亮分中');
					self.loadUserdata();
				}
			});
			keyboardJS.bind('enter', function (e) {
				if ($(".dzshule").length > 0) $(".livemark-waitshow2 .publish-btn").trigger('click');
				if ($(".pubscore-btn").length > 0) $(".livemark-userone .pubscore-btn").trigger('click');
			});
			$(".startstopbtn div").on('click', function () {
				var state = $(this).attr('data-state');
				if (state == '1') {
					$(".startstopbtn div").attr('data-state', '2');
					$(".startstopbtn div").removeClass('startstatus').addClass('endstatus');
				} else {
					$(".startstopbtn div").attr('data-state', '1');
					$(".startstopbtn div").removeClass('endstatus').addClass('startstatus');
				}
				screencore.ajaxSubmit("/screen/livemark/changestate", { status: (state == '1' ? '2' : '1') }).then(function (data) {
					if (data.code == 0) {
						layerBox.showMsg(state == '1' ? '评分通道已关闭' : '评分通道已开启');
					} else {
						layerBox.showMsg('网络异常，操作失败');
					}
				});
			});
			keyboardJS.bind('space', function (e) {
				var state = $(".startstopbtn div").attr('data-state');
				if (state == '1') {
					$(".startstopbtn div").attr('data-state', '2');
					$(".startstopbtn div").removeClass('startstatus').addClass('endstatus');
				} else {
					$(".startstopbtn div").attr('data-state', '1');
					$(".startstopbtn div").removeClass('endstatus').addClass('startstatus');
				}
				screencore.ajaxSubmit("/screen/livemark/changestate", { status: (state == '1' ? '2' : '1') }).then(function (data) {
					if (data.code == 0) {
						layerBox.showMsg(state == '1' ? '评分通道已关闭' : '评分通道已开启');
					} else {
						layerBox.showMsg('网络异常，操作失败');
					}
				});
			});
			keyboardJS.bind('left', function (e) {
				self.showprevnextRound('2');
			});
			keyboardJS.bind('right', function (e) {
				self.showprevnextRound('1');
			});
			keyboardJS.bind('up', function (e) {
				$(".livemark-userone .livemark-prevone").trigger('click');
			});
			keyboardJS.bind('down', function (e) {
				$(".livemark-userone .livemark-nextone").trigger('click');
			});

		},
		pwuserTime1: null,
		loopTime: 1e3,
		pwusermove: function () {
			var t = this;
			if (t.pwuserTime1 != null) {
				return false;
			}
			var c_tag = $(".livemark-user-pingwei");
			t.pwuserTime1 = setInterval(function () {
				if ($(".livemark-user-scroll-list").outerHeight(true) > $(".livemark-user-scroll-list .livemark-user-pingwei").outerHeight(true)) {
					return false;
				}
				var top = c_tag.find(".pingweione").eq(0).outerHeight(true);
				c_tag.find(".pingweione").eq(0).animate({ "margin-top": "-" + top + "px" }, t.loopTime, function () {
					var $li = $(this), onepwid = $li.attr('data-prid');
					$li.remove();
					var isin = false;
					if (t.nowpfusers.length > 0) {
						$.each(t.nowpfusers, function (i, v) {
							if (v.id == onepwid) {
								isin = true;
								return false;
							}
						});
					}
					if (isin) {
						$li.css("margin-top", "0px").appendTo(c_tag);
					} else {
						$li.css("margin-top", "0px");
					}
				});
			}, t.loopTime + 500);
		},
		showprevnextRound: function (ctype) {
			ctype = ctype || "1";
			screencore.ajaxSubmit('/screen/livemark/prevnextround', { ctype: ctype }).then(function (json) {
			}, function () {
				layerBox.showMsg('网络太差，请稍后重试');
			});
		},
		showprevnext: function (type) {
			var self = this;
			type = type || '1';
			self.clearAll();
			screencore.ajaxSubmit('/screen/livemark/prevnext', { pfuserid: self.pfuserid, ctype: type }).then(function (json) {
				if (json.code == 0) {
					self.pfuserid = json.msg;
					self.clearAll();
					self.loadUserdata();
					self.otimeout = setInterval(function () {
						self.loadUserdata();
					}, 3e3);
				} else {
					self.pfuserid = self.pfuserid;
					self.clearAll();
					self.loadUserdata();
					self.otimeout = setInterval(function () {
						self.loadUserdata();
					}, 3e3);
				}
			}, function () {
				layerBox.showMsg('网络太差，请稍后重试');
			});
		},
		clearAll: function () {
			var self = this;
			$(".openpubpw").addClass('hidden');
			self.ntimeout != null && clearInterval(self.ntimeout);
			self.stimeout != null && clearInterval(self.stimeout);
			self.ztimeout != null && clearInterval(self.ztimeout);
			self.otimeout != null && clearInterval(self.otimeout);
			self.clearpwtimer();
		},
		clearpwtimer: function () {
			var self = this;
			clearInterval(self.pwuserTime1);
			self.pwuserTime1 = null;
			$(".livemark-user-pingwei").empty();
		},
		scrollSpeed: 40,
		animescrollobj: null,
		startScrollY: 0,
		scrollReset: false,
		loopScrollcount: 1,
		initautoScroll: function (classname, resettype) {
			var self = this, resettype = resettype || false;
			if ($(classname).length <= 0) {
				return false;
			}
			anime.remove(classname);
			var self = this, scrollHeight = $(classname)[0].scrollHeight, height = $(classname).outerHeight(), maxscrollH = Math.ceil(scrollHeight - height);
			if (maxscrollH > 0) {
				if (self.loopScrollcount % 2 === 0) {
					var duration = (self.startScrollY / self.scrollSpeed) * 1e3;
					var scrollTop = [self.startScrollY, 0];
					if (resettype) {
						duration = (maxscrollH / self.scrollSpeed) * 1e3;
						scrollTop = [maxscrollH, 0];
					}
				} else {
					var duration = ((maxscrollH - self.startScrollY) / self.scrollSpeed) * 1e3;
					var scrollTop = [self.startScrollY, maxscrollH];
				}
				self.animescrollobj = anime({
					targets: classname,
					scrollTop: scrollTop,
					duration: duration,
					direction: 'alternate',
					loop: true,
					autoplay: true,
					easing: 'linear',
					loopComplete: function (anim) {
						self.startScrollY = 0;
						self.loopScrollcount++;
						if (self.scrollReset) {
							self.initautoScroll(classname, self.loopScrollcount % 2 === 0);
							self.scrollReset = false;
						}
					},
				});
				$(classname).unbind("mouseenter").bind("mouseenter", function () {
					if (self.animescrollobj) {
						self.animescrollobj.pause();
						self.startScrollY = $(classname).scrollTop();
					}
				});
				$(classname).unbind("mouseleave").bind("mouseleave", function () {
					self.startScrollY = $(classname).scrollTop();
					self.scrollReset = true;
					self.initautoScroll(classname);
				});
			}
		},
		removeautoScroll: function (classname) {
			var self = this;
			if (self.animescrollobj) {
				self.animescrollobj.pause();
				if (classname) {
					self.animescrollobj.remove(classname);
					$(classname).scrollTop(0);
					$(classname).unbind("mouseenter");
					$(classname).unbind("mouseleave");
				}
				self.animescrollobj = null;
			}
			self.startScrollY = 0;
			self.scrollReset = false;
			self.loopScrollcount = 1;
		},
	};
	return screenlivemark;
});