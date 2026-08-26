define('screenlivemark', ['screencore', 'screensocket', 'template', 'layerBox', 'fulldm', 'keyboard', 'anime', 'jquery.ui'], function (screencore, screensocket, template, layerBox, fulldm, keyboardJS, anime) {
	var screenlivemark = {
			ntimeout: null,//普通定时器
			stimeout: null,//成绩排名定时器
			ztimeout: null,//赞排名定时器
			otimeout: null,//单个用户定时器
			pfuserid: 0,
			openpubpw: 2,
					pubweight: 0,
					currentPwMap: {},
					currentPwList: [],
					currentPfItems: [],
					currentPfMax: 100,
					currentAvgPfItemHtml: '',
					detailViewMode: 'judge',
					activePwId: null,
					detailPftype: '2',
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
							screenlivemark.syncScoreConfig(json.msg);
							var pfuser = json.msg.pfusers;
							$(".livemark-title").text(json.msg.title);
							screenlivemark.renderNormalUsers(pfuser, json.msg.scoretype);
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
							self.syncScoreConfig(json.msg);
							var pfuser = json.msg.pfusers, visibleUsers = [], len = $(".livemark-users .livemark-user-item").length;
							if (pfuser.length > 0) {
								$.each(pfuser, function (k, v) {
									if (v.screenshow == '1') {
										visibleUsers.push(v);
									}
								})
							}
							json.msg.openzan == '2' ? $(".livemark-btns").addClass('display-none') : $(".livemark-btns").removeClass('display-none');
							$(".livemark-title").text(json.msg.title);
							self.renderNormalUsers(visibleUsers, json.msg.scoretype);
							if (visibleUsers.length != len) {
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
						var pfuser = (json.msg.pfusers || []),
							len = $(".livemark-phb-top .livemark-phb-itembox").length + $(".livemark-phb-other-item").length;
							self.updateScoreTopItem($(".livemark-phb-top .rank1"), pfuser[0] ? $.extend({}, pfuser[0], { keyindex: 1 }) : null, 1, json.msg.scoretype);
							self.updateScoreTopItem($(".livemark-phb-top .rank2"), pfuser[1] ? $.extend({}, pfuser[1], { keyindex: 2 }) : null, 2, json.msg.scoretype);
							self.updateScoreTopItem($(".livemark-phb-top .rank3"), pfuser[2] ? $.extend({}, pfuser[2], { keyindex: 3 }) : null, 3, json.msg.scoretype);
							if (pfuser.length > 3) {
								var otherUsers = [];
								$.each(pfuser, function (k, v) {
									if (k > 2) {
										otherUsers.push($.extend({}, v, { keyindex: k + 1 }));
									}
								});
								self.renderScoreOthers(otherUsers, json.msg.scoretype);
							} else {
								$(".livemark-phb-others").empty();
							}
							if (pfuser.length != len) {
								self.removeautoScroll('.livemark-phbs');
								$('.livemark-phbs').scrollTop(0);
								setTimeout(function () {
									if (!$('.livemark-phbs').hasClass('display-none')) {
										self.initautoScroll('.livemark-phbs', true);
									}
								}, 0);
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
			syncImage: function ($img, src) {
				if (!$img || !$img.length) return;
				src = src || '';
				if (($img.attr('src') || '') !== src) {
					$img.attr('src', src);
				}
			},
			updateNormalUserItem: function ($item, data) {
				if (!$item || !$item.length) return;
				data = data || {};
				$item.attr('data-pfuserid', data.id || 0);
				$item.toggleClass('hidden', data.userstatus == '2' && data.screenshow == '2');
				this.syncImage($item.find('.livemark-user-avatar img'), data.userimg);
				$item.find('.livemark-user-name span').text(data.username || '');
				$item.find('.livemark-user-score span:first-child').text((data.scoretype == '1' ? '总分' : '平均分') + '：');
				$item.find('.livemark-user-score span:last-child').text(data.score === false ? '无' : (data.score || ''));
				$item.find('.livemark-user-noscore').toggleClass('display-none', data.score !== false);
			},
			renderNormalUsers: function (pfuser, scoretype) {
				var self = this;
				var $container = $(".livemark-users");
				var existMap = {};
				$container.children('.livemark-user-item').each(function () {
					existMap[String($(this).attr('data-pfuserid'))] = $(this);
				});
				$.each(pfuser || [], function (k, v) {
					var itemData = $.extend({}, v, { scoretype: scoretype });
					var itemKey = String(v.id);
					var $item = existMap[itemKey];
					if (!$item || !$item.length) {
						$item = $(template('normaluserItem', itemData));
					} else {
						self.updateNormalUserItem($item, itemData);
						delete existMap[itemKey];
					}
					$container.append($item);
				});
				$.each(existMap, function (key, $item) {
					$item.remove();
				});
			},
			setPhbScoreContent: function ($scoreBox, data, scoretype) {
				if (!$scoreBox || !$scoreBox.length) return;
				if (data.score === false) {
					$scoreBox.html('<span class="livemark-phb-scoreValue is-empty">待评分</span>');
				} else {
					$scoreBox.html('<span class="livemark-phb-scoreLabel">' + (scoretype == '1' ? '总分' : '平均分') + '</span><span class="livemark-phb-scoreValue">' + data.score + '</span>');
				}
			},
			updateScoreTopItem: function ($slot, data, rank, scoretype) {
				if (!$slot || !$slot.length) return;
				if (!data) {
					$slot.empty().removeAttr('data-pfuserid');
					return;
				}
				var itemKey = String(data.id);
				if (($slot.attr('data-pfuserid') || '') !== itemKey || !$slot.children('.livemark-phb-itembox').length) {
					var itemData = $.extend({}, data, { keyindex: rank, scoretype: scoretype });
					$slot.html(template('scorephbtopItem', itemData)).attr('data-pfuserid', data.id);
					return;
				}
				var $box = $slot.children('.livemark-phb-itembox');
				$slot.attr('data-pfuserid', data.id);
				this.syncImage($box.find('.user-img'), data.userimg);
				$box.find('.livemark-phb-name').text(data.username || '');
				$box.find('.livemark-phb-statusText').text('RANK ' + rank);
				this.setPhbScoreContent($box.find('.livemark-phb-score'), data, scoretype);
			},
			updateScoreOtherItem: function ($item, data, scoretype) {
				if (!$item || !$item.length) return;
				$item.attr('data-pfuserid', data.id || 0);
				$item.find('.livemark-phb-other-itembox').attr('class', 'livemark-phb-other-itembox is-rank-' + data.keyindex);
				$item.find('.livemark-phb-badge-number').text(data.keyindex);
				this.syncImage($item.find('.user-img'), data.userimg);
				$item.find('.livemark-phb-other-name').text(data.username || '');
				$item.find('.livemark-phb-statusText').text('RANK ' + data.keyindex);
				this.setPhbScoreContent($item.find('.livemark-phb-other-score'), data, scoretype);
			},
			renderScoreOthers: function (pfuser, scoretype) {
				var self = this;
				var $container = $(".livemark-phb-others");
				var existMap = {};
				$container.children('.livemark-phb-other-item').each(function () {
					existMap[String($(this).attr('data-pfuserid'))] = $(this);
				});
				$.each(pfuser || [], function (k, v) {
					var itemKey = String(v.id);
					var $item = existMap[itemKey];
					if (!$item || !$item.length) {
						$item = $(template('scorephbotherItem', $.extend({}, v, { scoretype: scoretype })));
					} else {
						self.updateScoreOtherItem($item, v, scoretype);
						delete existMap[itemKey];
					}
					$container.append($item);
				});
				$.each(existMap, function (key, $item) {
					$item.remove();
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
							var finalScore = (typeof (json.msg.score2) == 'undefined') ? json.msg.score : json.msg.score2;
							var finalScoreText = finalScore === false ? '无' : finalScore;
							var basicscore = parseFloat(json.msg.basicscore || 0);
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
							$('.livemark-waitshow2 .livemark-companyscore .scoreitembox .scoreitem div').text(finalScoreText);
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
					$(".livemark-userone-info div").text(json.msg.username || '');
					$(".livemark-userone-des").text(json.msg.userdes || '');
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
							var configuredPws = $.isArray(json.msg.pws) ? json.msg.pws : [];
							// 详情页默认先展示本轮配置的全部专家评委，尚未提交的评委也保留在列表中。
							var visiblePws = configuredPws;
							if (visiblePws.length <= 0) {
								// 兼容旧接口：pfusers 只包含已提交记录，补齐状态后仍走统一展示模板。
								visiblePws = $.map(json.msg.pfusers || [], function (pw) {
									return $.extend({}, pw, { hadpf: '1' });
								});
							}
							var showpws = visiblePws.length > 0 ? '1' : '2';
							self.currentPwMap = {};
							self.currentPwList = visiblePws;
							self.syncScoreConfig(json.msg);
							$.each(self.currentPwList, function (i, v) {
								if (v && v.id !== undefined) {
									self.currentPwMap[String(v.id)] = v;
								}
						});
					if (json.msg.openpubpw == '1') {
						$(".livemark-user-totalscore").addClass('ispubpwscore');
						$('.livemark-user-score').addClass('hidden');
						$('.openpubpw').removeClass('hidden').css({ "color": json.msg.scoretxtcolor }).css({ "background": "", "background-color": "" });
						if ($(".dzhuoba").length > 0) {
							$('.openpubpw .score_pw').text(json.msg.score_pw === false ? '无' : json.msg.score_pw);
							$('.openpubpw .showpub2').text((json.msg.livemarkgroups[0].groupname ? json.msg.livemarkgroups[0].groupname : '媒体评委') + "得分");
							$('.openpubpw .showpub3').text((json.msg.livemarkgroups[1].groupname ? json.msg.livemarkgroups[1].groupname : '大众评委') + "得分");
							$('.openpubpw .score_pub').text(json.msg.livemarkgroups[0].score === false ? '无' : json.msg.livemarkgroups[0].score);
							$('.openpubpw .score_pub2').text(json.msg.livemarkgroups[1].score === false ? '无' : json.msg.livemarkgroups[1].score);
							$('.openpubpw .score_last').text(finalScoreText);
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
								$('.openpubpw .score_last').text(finalScoreText);
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
						$(".livemark-user-score .scoretype").text('得分：');
						// 右上角展示接口实时汇总分；评委是否提交只影响下方评委卡片状态。
						$(".livemark-user-score .scorenum").text(finalScoreText);
						$(".livemark-user-score .pwbox .hadpwnum span").text(json.msg.hadpwnum || 0);
						$(".livemark-user-score .pwbox .pwnums span").text(json.msg.totalpwnum || 0);
					}
						var tiphtml = '';
						if (json.msg.pfmode == '2') {
							if (json.msg.maxmintype != '2') {
								if (json.msg.maxscore != '') {
										tiphtml += '<span class="scoretip-item scoretip-max"><span class="scoretip-label">去最高</span><span class="scoretip-value maxscore">' + json.msg.maxscore + '分</span></span>';
							}
							if (json.msg.minscore != '') {
									tiphtml += '<span class="scoretip-item scoretip-min"><span class="scoretip-label">去最低</span><span class="scoretip-value minscore">' + json.msg.minscore + '分</span></span>';
								}
							}
						}
						if (!isNaN(basicscore) && basicscore != 0) {
							var adjustLabel = basicscore > 0 ? '加分' : '扣分';
							var adjustScore = Math.abs(basicscore).toFixed(2);
							tiphtml += '<span class="scoretip-item scoretip-adjust"><span class="scoretip-label">' + adjustLabel + '</span><span class="scoretip-value decscore">' + adjustScore + '分</span></span>';
						}
								$(".livemark-user-totalscore .scoretips").html(tiphtml);
							self.detailPftype = json.msg.pftype || '2';
							if (json.msg.pftype == '1') {
								if (self.detailViewMode == 'avg') {
									self.detailViewMode = 'judge';
									self.activePwId = null;
								}
								$(".livemark-user-pj").addClass('display-none');
							} else {
								$(".livemark-user-pj").removeClass('display-none');
						}
						self.nowpfusers = json.msg.pfusers;
							if ($(".decscorebox").length > 0) {
							if (basicscore > 0) {
								$(".decscorebox .decscorebox-icon").text('+');
								$(".decscorebox .decscorebox-info-title").text('加分');
								$(".decscorebox-info-score").text(basicscore.toFixed(2));
								$(".lastscorebox .lastscorebox-info-score").text(finalScoreText);
								$(".decscorebox").removeClass('hidden');
								$(".lastscorebox").removeClass('hidden');
							} else if (basicscore < 0) {
								$(".decscorebox .decscorebox-icon").text('-');
								$(".decscorebox .decscorebox-info-title").text('扣分');
								$(".decscorebox-info-score").text((basicscore * -1).toFixed(2));
								$(".lastscorebox .lastscorebox-info-score").text(finalScoreText);
								$(".decscorebox").removeClass('hidden');
								$(".lastscorebox").removeClass('hidden');
							} else {
								$(".decscorebox").addClass('hidden');
								$(".lastscorebox").addClass('hidden');
							}
						}
						if (showpws == '1') {
						var pwhtml = '';
						$.each(visiblePws, function (i, v) {
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
								if (basicscore > 0) {
									$(".decscorebox .decscorebox-icon").text('+');
									$(".decscorebox .decscorebox-info-title").text('加分');
									$(".decscorebox-info-score").text(basicscore.toFixed(2));
								} else if (basicscore < 0) {
									$(".decscorebox .decscorebox-icon").text('-');
									$(".decscorebox .decscorebox-info-title").text('扣分');
									$(".decscorebox-info-score").text((basicscore * -1).toFixed(2));
								} else {
									$(".decscorebox").addClass('hidden');
									$(".lastscorebox").addClass('hidden');
								}
								if (basicscore != 0) {
									$(".lastscorebox .lastscorebox-info-score").text(finalScoreText);
									$(".decscorebox").removeClass('hidden');
									$(".lastscorebox").removeClass('hidden');
								}
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
							var item = $.extend({}, v);
							var pwlen = (json.msg.pfusers || []).length || 1;
							item.score = parseFloat(item.score / pwlen).toFixed(2);
							item.dfmax = parseFloat(item.dfmax).toFixed(2);
							item.percent = (item.score / item.dfmax) * 100;
							pfitemhtml += template("pfitemone", item);
						});
						self.currentAvgPfItemHtml = pfitemhtml;
						if (self.detailViewMode == 'judgeDetail') {
							self.renderJudgeDetail(self.activePwId);
						} else {
							$(".livemark-user-single").html(self.currentAvgPfItemHtml);
						}
						self.applyDetailViewMode();
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
				var activeScrollClass = $(".livemark-scrollbox > div:not(.display-none)").hasClass('livemark-phbs') ? '.livemark-phbs' : '.livemark-users';
				self.removeautoScroll(activeScrollClass);
				$(".livemark-scrollbox>div").addClass('display-none');
				if ($this.hasClass('btn-mark')) {
					if ($(".livemark-topbtn").attr('data-view') == 'list') {
						self.clearAll();
						self.loadNormaldata();
						self.ntimeout = setInterval(function () {
							self.loadNormaldata();
						}, 3e3);
						$(".livemark-scrollbox .livemark-users").removeClass('display-none');
						setTimeout(function () {
							self.initautoScroll('.livemark-users', true);
						}, 0);
					} else {
						self.clearAll();
						self.loadScoredata();
						self.stimeout = setInterval(function () {
							self.loadScoredata();
						}, 3e3);
						$(".livemark-scrollbox .livemark-phbs").removeClass('display-none');
						setTimeout(function () {
							self.initautoScroll('.livemark-phbs', true);
						}, 0);
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
				if ($this.attr('data-view') == 'list') {
					$(".livemark-users").empty();
					self.removeautoScroll('.livemark-users');
					self.clearAll();
					self.loadScoredata();
					self.stimeout = setInterval(function () {
						self.loadScoredata();
					}, 3e3);
					$(".livemark-scrollbox .livemark-users").addClass('display-none');
					$(".livemark-scrollbox .livemark-phbs").removeClass('display-none').scrollTop(0);
					setTimeout(function () {
						self.initautoScroll('.livemark-phbs', true);
					}, 0);
					$this.attr('data-view', 'rank').text("返回列表");
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
					$this.attr('data-view', 'list').text("查看排名");
				}
			});
			$(".livemark-users").on('click', '.livemark-user-item', function () {
				var $this = $(this);
				self.pfuserid = $this.attr('data-pfuserid');
				self.resetDetailViewMode();
				self.removeautoScroll('.livemark-users');
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
				self.resetDetailViewMode();
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
				self.resetDetailViewMode();
				self.removeautoScroll('.livemark-phbs');
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
					self.resetDetailViewMode();
					var showboxClass = $(".livemark-scrollbox>div").not($(".display-none")).attr('class');
					self.clearAll();

				if (showboxClass == 'livemark-users') {
					self.loadNormaldata();
					self.ntimeout = setInterval(function () {
						self.loadNormaldata();
					}, 3e3);
					setTimeout(function () {
						self.initautoScroll('.livemark-users', true);
					}, 0);
				} else if (showboxClass == 'livemark-phbs') {
					self.loadScoredata();
					self.stimeout = setInterval(function () {
						self.loadScoredata();
					}, 3e3);
					setTimeout(function () {
						self.initautoScroll('.livemark-phbs', true);
					}, 0);
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
						self.setDetailViewMode(self.detailViewMode == 'judge' ? 'avg' : 'judge');
					});
					$(".livemark-user-pingwei").on('click', '.pingweione', function () {
						if ($(".livemark-mainbox").hasClass('livemark-hide-pw-score')) return false;
						self.setDetailViewMode('judgeDetail', $(this).attr('data-prid'));
					});
					$(".livemark-user-single").on('click', '.livemark-judge-detail-back', function () {
						self.setDetailViewMode('judge');
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
			escapeHtml: function (text) {
				if (text === undefined || text === null) return '';
				return String(text).replace(/[&<>"']/g, function (s) {
					return {
						'&': '&amp;',
						'<': '&lt;',
						'>': '&gt;',
						'"': '&quot;',
						"'": '&#39;'
					}[s];
				});
			},
			parseMaybeJson: function (value) {
				if ($.isArray(value)) return value;
				if (typeof value == 'string' && value !== '') {
					try {
						var parsed = JSON.parse(value);
						if ($.isArray(parsed)) return parsed;
					} catch (e) { }
				}
					return [];
				},
				syncScoreConfig: function (msg) {
					if (!msg) return;
					if (msg.pfmax !== undefined && msg.pfmax !== null && msg.pfmax !== '') {
						this.currentPfMax = msg.pfmax;
					}
					if (String(msg.pftype) == '1') {
						// 单项模式仍可能带有历史多项配置，不能让它污染单项满分。
						this.currentPfItems = [];
					} else if ($.isArray(msg.pfitem)) {
						this.currentPfItems = msg.pfitem;
					}
				},
				setDetailViewMode: function (mode, pwid) {
					if (mode == 'avg') {
						this.detailViewMode = 'avg';
						this.activePwId = null;
						$(".livemark-user-single").html(this.currentAvgPfItemHtml);
					} else if (mode == 'judgeDetail') {
						this.detailViewMode = 'judgeDetail';
						this.activePwId = pwid;
						this.renderJudgeDetail(pwid);
					} else {
						this.detailViewMode = 'judge';
						this.activePwId = null;
					}
					this.applyDetailViewMode();
				},
				resetDetailViewMode: function () {
					this.detailViewMode = 'judge';
					this.activePwId = null;
					this.applyDetailViewMode();
				},
				applyDetailViewMode: function () {
					var mode = (this.detailViewMode == 'avg' || this.detailViewMode == 'judgeDetail') ? this.detailViewMode : 'judge';
					if (this.detailPftype == '1' && mode == 'avg') {
						mode = 'judge';
						this.detailViewMode = 'judge';
						this.activePwId = null;
					}
					if (mode == 'avg' || mode == 'judgeDetail') {
						$(".livemark-user-pj").text(mode == 'judgeDetail' ? '返回评分列表' : '查看评委分');
						if (mode == 'judgeDetail') {
							$(".livemark-user-pj").removeClass('display-none');
							$(".livemark-user-single").addClass('is-judge-detail');
						} else {
							$(".livemark-user-single").removeClass('is-judge-detail');
						}
						$(".livemark-user-pingwei").addClass('display-none');
						$(".livemark-user-single").removeClass('display-none');
					} else {
						$(".livemark-user-pj").text('查看单项平均分');
						$(".livemark-user-single").removeClass('is-judge-detail');
						if (this.detailPftype == '1') {
							$(".livemark-user-pj").addClass('display-none');
						}
						$(".livemark-user-pingwei").removeClass('display-none');
						$(".livemark-user-single").addClass('display-none');
					}
			},
			pickFirst: function (obj, keys) {
				for (var i = 0; i < keys.length; i++) {
					if (obj && obj[keys[i]] !== undefined && obj[keys[i]] !== null && obj[keys[i]] !== '') {
						return obj[keys[i]];
					}
					}
					return '';
				},
				findPfItemMeta: function (field, index) {
					var meta = null;
					if (field !== undefined && field !== null && field !== '') {
						$.each(this.currentPfItems || [], function (i, item) {
							if (item && item.dffield == field) {
								meta = item;
								return false;
							}
						});
					}
					if (!meta && index !== undefined && this.currentPfItems && this.currentPfItems[index]) {
						meta = this.currentPfItems[index];
					}
					return meta || {};
				},
				getPwDetailItems: function (pw) {
					var self = this;
					var candidates = ['pfitem', 'scoredetail', 'pfitems', 'pfs', 'items', 'scoreitems', 'score_items', 'scorelist', 'scores', 'details', 'dfitems'];
					var source = [];
					for (var i = 0; i < candidates.length; i++) {
						source = self.parseMaybeJson(pw && pw[candidates[i]]);
						if (source.length > 0) break;
					}
					return $.map(source, function (item, index) {
						var field = self.pickFirst(item, ['field', 'dffield']);
						var meta = self.findPfItemMeta(field, index);
						var name = self.pickFirst(item, ['dfname', 'name', 'title', 'itemname', 'pfname', 'scoretitle']) || meta.dfname || (field == 'normal_01' ? '评分' : ('评分项' + (index + 1)));
						var score = self.pickFirst(item, ['score', 'totalscore', 'dfscore', 'value', 'num', 'point']);
						var max = self.pickFirst(item, ['dfmax', 'maxscore', 'fullscore', 'total', 'max']) || meta.dfmax || 0;
						if (!max && field == 'normal_01') {
							max = self.pickFirst(pw, ['dfmax', 'maxscore', 'pfmax']) || self.currentPfMax || 100;
						}
						var scoreNum = parseFloat(score);
						var maxNum = parseFloat(max);
						return {
							dfname: name,
							score: isNaN(scoreNum) ? (score === '' ? '--' : score) : scoreNum.toFixed(2),
							dfmax: isNaN(maxNum) ? max : maxNum.toFixed(2),
							percent: (!isNaN(scoreNum) && !isNaN(maxNum) && maxNum > 0) ? (scoreNum / maxNum) * 100 : 0
						};
					});
				},
				getPwName: function (pw) {
					return this.pickFirst(pw, ['pwname', 'name', 'username', 'nickname']) || '评委';
				},
				getPwComment: function (pw) {
					return this.pickFirst(pw, ['pfword', 'comment', 'remark', 'content', 'words']);
				},
				renderJudgeScoreItem: function (item) {
					var score = item.score === undefined || item.score === null || item.score === '' ? '--' : item.score;
					var max = item.dfmax === undefined || item.dfmax === null || item.dfmax === '' ? '--' : item.dfmax;
					var percent = parseFloat(item.percent);
					if (isNaN(percent)) percent = 0;
					percent = Math.max(0, Math.min(percent, 100));
					return '<div class="livemark-judge-score-item">'
						+ '<div class="livemark-judge-score-name">' + this.escapeHtml(item.dfname) + '</div>'
						+ '<div class="livemark-judge-score-bar">'
						+ '<div class="livemark-judge-score-bar-per" style="width:' + percent + '%;"></div>'
						+ '<div class="livemark-judge-score-value">' + this.escapeHtml(score) + ' / ' + this.escapeHtml(max) + '分</div>'
						+ '</div>'
						+ '</div>';
				},
				renderJudgeComment: function (pw) {
					var comment = this.getPwComment(pw) || '暂无意见';
					return '<div class="livemark-judge-comment-one">'
						+ '<div class="livemark-judge-comment-name">' + this.escapeHtml(this.getPwName(pw)) + '</div>'
						+ '<div class="livemark-judge-comment-text">' + this.escapeHtml(comment) + '</div>'
						+ '</div>';
				},
				renderJudgeDetail: function (prid) {
					var self = this;
					var pw = self.currentPwMap[String(prid)] || {};
					var name = self.getPwName(pw);
					var score = self.pickFirst(pw, ['totalscore', 'score', 'dfscore', 'tw']);
					var isTotalScoreMode = String(self.detailPftype) == '1';
					var itemhtml = '';
					if (!isTotalScoreMode) {
						$.each(self.getPwDetailItems(pw), function (i, item) {
							itemhtml += self.renderJudgeScoreItem(item);
						});
						if (itemhtml === '') {
							itemhtml = '<div class="livemark-judge-score-empty">暂无评分细项</div>';
						}
					}
					var scoreItemsHtml = isTotalScoreMode ? '' : '<div class="livemark-judge-detail-left">'
						+ '<div class="livemark-judge-detail-title">评分细项</div>'
						+ itemhtml
						+ '</div>';
					var html = '<div class="livemark-judge-detail">'
						+ '<div class="livemark-judge-detail-head">'
						+ '<div><span class="livemark-judge-detail-label">当前评委</span><span class="livemark-judge-detail-name">' + self.escapeHtml(name) + '</span></div>'
						+ '<div class="livemark-judge-detail-actions">'
						+ '<span class="livemark-judge-detail-score">得分：' + self.escapeHtml(score === '' ? '--' : score) + '</span>'
						+ '<button type="button" class="livemark-judge-detail-back">返回评分列表</button>'
						+ '</div>'
						+ '</div>'
						+ '<div class="livemark-judge-detail-body' + (isTotalScoreMode ? ' is-total-score' : '') + '">'
						+ scoreItemsHtml
						+ '<div class="livemark-judge-detail-right">'
						+ '<div class="livemark-judge-detail-title">当前评委评分意见</div>'
						+ '<div class="livemark-judge-comment-list">' + self.renderJudgeComment(pw) + '</div>'
						+ '</div>'
						+ '</div>'
						+ '</div>';
					$(".livemark-user-single").html(html);
				},
			pwuserTime1: null,
		loopTime: 1e3,
		pwusermove: function () {
			return false;
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
			self.resetDetailViewMode();
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
		scrollSpeed: 14,
		animescrollobj: null,
		startScrollY: 0,
		scrollReset: false,
		loopScrollcount: 1,
		initautoScroll: function (classname, resettype) {
			var self = this, resettype = resettype || false;
			if ($(classname).length <= 0) {
				return false;
			}
			if (self.animescrollobj) {
				self.animescrollobj.pause();
				self.animescrollobj = null;
			}
			anime.remove(classname);
			var scrollHeight = $(classname)[0].scrollHeight, height = $(classname).outerHeight(), maxscrollH = Math.ceil(scrollHeight - height);
			if (maxscrollH > 0) {
				var currentTop = resettype ? $(classname).scrollTop() : (self.startScrollY || $(classname).scrollTop());
				if (currentTop >= maxscrollH) {
					currentTop = 0;
					$(classname).scrollTop(0);
				}
				var duration = Math.max(((maxscrollH - currentTop) / self.scrollSpeed) * 1e3, 3000);
				self.animescrollobj = anime({
					targets: classname,
					scrollTop: [currentTop, maxscrollH],
					duration: duration,
					autoplay: !$(classname).is(':hover'),
					easing: 'linear',
					complete: function () {
						$(classname).scrollTop(0);
						self.startScrollY = 0;
						if (!$(classname).is(':hover')) {
							self.initautoScroll(classname, true);
						}
					},
				});
				$(classname).off('.livemarkAutoScroll').on('mouseenter.livemarkAutoScroll', function () {
					if (self.animescrollobj) {
						self.animescrollobj.pause();
						self.startScrollY = $(classname).scrollTop();
					}
				});
				$(classname).on('mouseleave.livemarkAutoScroll', function () {
					self.startScrollY = $(classname).scrollTop();
					self.initautoScroll(classname, true);
				});
			} else {
				$(classname).off('.livemarkAutoScroll');
			}
		},
		removeautoScroll: function (classname) {
			var self = this;
			if (self.animescrollobj) {
				self.animescrollobj.pause();
				self.animescrollobj = null;
			}
			if (classname) {
				anime.remove(classname);
				$(classname).scrollTop(0);
				$(classname).off('.livemarkAutoScroll');
			}
			self.startScrollY = 0;
			self.scrollReset = false;
		},
	};
	return screenlivemark;
});
