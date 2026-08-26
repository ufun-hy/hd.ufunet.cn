/*
* @Author: 赞木
* @Date:   2021-09-08 20:02:00
* @Last Modified by:   赞木
* @Last Modified time: 2023-05-13 11:04:13
*/
define('screenvote', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'keyboard', 'swiper'], function (screensocket, screencore, template, layerBox, fulldm, keyboardJS, Swiper) {
	var screenvote = {
		mySwiper: null,
		autoplay: '2',
		order: '2',
		ordernum: 0,
		ajaxtimer: null,
		rotate: null,
		pagedelay: 3000,
		groupswipers: {},
		init: function () {
			var self = this, rotateHtml = '';
			screencore.ajaxSubmit("/screen/vote/initvote", {}).then(function (json) {
				if (json.code == 0) {
					$.each(json.msg.rotates, function (i, v) {
						rotateHtml += template('round-tpl', v);
					});
					$(".vote-rounds").html(rotateHtml);
					if (json.msg.rotates.length <= 1) {
						$(".vote-rounds").addClass('display-none');
					} else {
						$(".vote-rounds").removeClass('display-none');
					}
					self.initpage(json.msg.rotate);//初始化
					self.initevent();
					$(".vote-wrapper").removeClass('display-none');
					//轮次默认排行模式
					var ranktype = json.msg.rotate.ranktype || '2';
					if (ranktype == '1') {
						$(".vote-info-right .rankbtn").trigger('click');
					}
				} else {
					$(".emptybox").removeClass('display-none');
				}
			}, function () {
				layerBox.showMsg('加载出错');
			});
			self.initsocket();
		},
		initpage: function (json) {
			var self = this, html = '', screentype = json.screentype || '1', pctype = json.pctype, autoplay = json.autoplay;
			self.rotate = json;
			var numpergroup = self.rotate.numpergroup || 10;
			var voteTpl = '';
			var totalslide = json.items.length;
			if (screentype < 3) {
				if (pctype == '1') {
					voteTpl = template('voteItem-tpl');
				} else if (pctype == '2') {
					voteTpl = template('voteItem2-tpl');
				} else {
					voteTpl = template('voteItem3-tpl');
				}
				if (pctype == '1') {
					for (i = 0; i < totalslide; i++) {
						json.items[i].shownum = json.shownum;
						json.items[i].showper = json.showper;
						json.items[i].cubetype = json.cubetype;
						json.items[i].votenumber = (json.items[i].votenumber < 10 ? '00' : ((json.items[i].votenumber >= 10 && json.items[i].votenumber < 100) ? '0' : '')) + json.items[i].votenumber;
						html += voteTpl(json.items[i]);
					}
					if (totalslide < numpergroup) {
						$(".vote-list").addClass('zam-app-flex-ajCenter2');
					} else {
						$(".vote-list").removeClass('zam-app-flex-ajCenter2');
					}
				} else if (pctype == '2') {
					$(".vote-list").removeClass('zam-app-flex-ajCenter2');
					for (i = 0; i < totalslide; i++) {
						if (i % numpergroup == 0) {
							html += '<li class="swiper-slide circle-itemslide">';
							json.items[i].shownum = json.shownum;
							json.items[i].showper = json.showper;
							html += voteTpl(json.items[i]);
							if ((i + 1) == totalslide) {
								html += '</li>';
							}
						} else {
							json.items[i].shownum = json.shownum;
							json.items[i].showper = json.showper;
							html += voteTpl(json.items[i]);
							if ((i + 1) % numpergroup == 0 || (i + 1) == totalslide) {
								html += '</li>';
							}
						}
					}
				} else if (pctype == '3') {
					$(".vote-list").removeClass('zam-app-flex-ajCenter2');
					for (i = 0; i < totalslide; i++) {
						if (i % 1 == 0) {
							html += '<li class="swiper-slide single-itemslide zam-app-flex-ajCenter2">';
							json.items[i].shownum = json.shownum;
							json.items[i].showper = json.showper;
							html += voteTpl(json.items[i]);
							if ((i + 1) == totalslide) {
								html += '</li>';
							}
						} else {
							json.items[i].shownum = json.shownum;
							json.items[i].showper = json.showper;
							html += voteTpl(json.items[i]);
							if ((i + 1) % 1 == 0 || (i + 1) == totalslide) {
								html += '</li>';
							}
						}
					}
				}
					$(".vote-list").html(html);
					if (window.voteMedia) {
						window.voteMedia.renderAll($('.vote-list'),{mode:'cover'});
					}
				var swiperConfig = {
					observer: true,
					watchOverflow: true,
					observeParents: true,
				};
				if (pctype == '1') {
					swiperConfig.slidesPerView = numpergroup;
					swiperConfig.slidesPerGroup = numpergroup;
				}
				if (autoplay == '1') {
					self.autoplay = '1';
					swiperConfig.autoplay = {
						delay: json.autoplaytime * 1e3,
						stopOnLastSlide: false,
						disableOnInteraction: false,
					};
				} else {
					self.autoplay = '2';
				}
				if ((pctype < 3 && totalslide > numpergroup) || (pctype == '3' && totalslide > 1)) {
					if ($(".swiper-change").hasClass('display-none')) $(".swiper-change").removeClass('display-none');
					swiperConfig.navigation = {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev',
					};
				} else {
					if (!$(".swiper-change").hasClass('display-none')) $(".swiper-change").addClass('display-none');
				}
			} else {
				voteTpl = template("group-tpl");
				$(".vote-list").removeClass('zam-app-flex-ajCenter2');
				for (i = 0; i < totalslide; i++) {
					if (i % 2 == 0) {
						html += '<li class="swiper-slide group-itemslide zam-app-flex-ajCenter2">';
						json.items[i].shownum = json.shownum;
						json.items[i].showper = json.showper;
						json.items[i].cubetype = json.cubetype;
						html += voteTpl(json.items[i]);
						if ((i + 1) == totalslide) {
							html += '</li>';
						}
					} else {
						json.items[i].shownum = json.shownum;
						json.items[i].showper = json.showper;
						json.items[i].cubetype = json.cubetype;
						html += voteTpl(json.items[i]);
						if ((i + 1) % 2 == 0 || (i + 1) == totalslide) {
							html += '</li>';
						}
					}
				}
					$(".vote-list").html(html);
					if (window.voteMedia) {
						window.voteMedia.renderAll($('.vote-list'),{mode:'cover'});
					}
				var swiperConfig = {
					observer: true,
					watchOverflow: true,
					observeParents: true,
				};
				if (autoplay == '1') {
					self.autoplay = '1';
					swiperConfig.autoplay = {
						delay: json.autoplaytime * 1e3,
						stopOnLastSlide: false,
						disableOnInteraction: false,
					};
				} else {
					self.autoplay = '2';
				}
				if (totalslide > 2) {
					if ($(".swiper-change").hasClass('display-none')) $(".swiper-change").removeClass('display-none');
					swiperConfig.navigation = {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev',
					};
				} else {
					if (!$(".swiper-change").hasClass('display-none')) $(".swiper-change").addClass('display-none');
				}
			}
			//不论普通还是排行模式均重置swiper
			if (self.mySwiper != null) self.mySwiper.destroy(true, true);
			self.mySwiper = new Swiper('.vote-list-wrapper', swiperConfig);
			if (screentype == '3') {
				for (var i in self.groupswipers) {
					self.groupswipers[i].destroy(true, true)
				}
				for (i = 0; i < totalslide; i++) {
					var gid = json.items[i].id;
					self.groupswipers[gid] = new Swiper('.group-lists-' + gid, {
						observer: true,
						watchOverflow: true,
						observeParents: true,
						slidesPerView: 5,
						slidesPerGroup: 5,
						autoplay: {
							delay: 6e3,
							stopOnLastSlide: false,
							disableOnInteraction: false,
						},
					});
				}
			}
			if (pctype == '1') {
				if (json.cubetype == '1') {
					$(".vote-item .vote-progressbar").css({ "background-color": json.typecolor });
				}
			} else if (pctype == '2') {
				$(".circle-item .circle-bar span").css({ "background-color": json.typecolor });
			}
			if (json.status == '1') {
				$(".votestatus div").attr('data-state', '1');
				$(".votestatus div").removeClass('endstatus').addClass('startstatus');
			} else {
				$(".votestatus div").attr('data-state', '2');
				$(".votestatus div").removeClass('startstatus').addClass('endstatus');
			}

			$(".vote-info-left").html(json.title);
			$(".vote-rounds a").removeClass('active');
			$("#round-" + json.id).addClass('active');
			$(".voterotateid").val(json.id);
			$("#joinPerson").text(json.voteperson);
			var showjoin = json.showjoin || '1';
			if (showjoin == '1') {
				$(".votejoinbox").removeClass('hidden');
			} else {
				$(".votejoinbox").addClass('hidden');
			}
		},
		updatepage: function (obj) {
			var self = this, rotateHtml = '', json = obj.rotate, items = json.items, itemlength = items.length;
			$.each(obj.rotates, function (i, v) {
				rotateHtml += template('round-tpl', v);
			});
			$(".vote-rounds").html(rotateHtml);
			if (obj.rotates.length <= 1) {
				$(".vote-rounds").addClass('display-none');
			} else {
				$(".vote-rounds").removeClass('display-none');
			}
			//显示方式和投票项目数量发生改变则重新初始化页面
			let notchanged = json.voteids.toString() === self.rotate.voteids.toString();
			if (notchanged && json.screentype == '3') {
				//核实分组内项目是否有变化
				notchanged = items.map(function (value, index) { return value.itemids; }).toString() === self.rotate.items.map(function (value, index) { return value.itemids; }).toString();
			}
			if (json.screentype != self.rotate.screentype || json.pctype != self.rotate.pctype || json.cubetype != self.rotate.cubetype || json.numpergroup != self.rotate.numpergroup || !notchanged) {
				self.initpage(obj.rotate);
			} else {
				self.updatevoteitem(obj.rotate);
			}
		},
		updatevoteitem: function (json) {
			var items = json.items, itemlength = items.length, screentype = json.screentype, pctype = json.pctype;
			$("#joinPerson").text(json.voteperson);
			var showjoin = json.showjoin || '1';
			if (showjoin == '1') {
				$(".votejoinbox").removeClass('hidden');
			} else {
				$(".votejoinbox").addClass('hidden');
			}
			if (itemlength > 0) {
				if (screentype != '3') {
					for (i = 0; i < itemlength; i++) {
						if (pctype == '1') {
							if ($("#vote-" + items[i].id).length > 0) {
								if ($(".votenumber").length > 0) {
									$("#vote-" + items[i].id).find(".vote-progressbar").css({ "height": (items[i].percent * 325) + 'px' });
								} else {
									var hobj = $("#vote-" + items[i].id).find(".cube-body .inner");
									if (hobj.length == 0) {
										hobj = $("#vote-" + items[i].id).find(".vote-progressbar");
									}
									hobj.css({ "height": items[i].voteper });
								}
								$("#vote-" + items[i].id).find(".votenum").text(json.shownum == '1' ? items[i].votenums + voteunit : '');
								$("#vote-" + items[i].id).find(".votepercent").text(json.showper == '1' ? items[i].itempercent : '');
							}
						} else if (pctype == '2') {
							if ($("#vote-" + items[i].id).length > 0) {
								$("#vote-" + items[i].id).find(".voternum").css({ "width": items[i].voteper });
								var spantext = '';
								if (json.shownum == '1') {
									spantext += items[i].votenums + voteunit;
								}
								if (json.showper == '1') {
									if (json.shownum == '1') {
										spantext += "(" + items[i].itempercent + ")";
									} else {
										spantext += items[i].itempercent;
									}
								}
								$("#vote-" + items[i].id).find(".circle-count").text(spantext);
							}
						} else {
							if ($("#vote-" + items[i].id).length > 0) {
								if (json.shownum == '1') {
									$("#vote-" + items[i].id).find(".vote-count").text(items[i].votenums);
									$("#vote-" + items[i].id).find(".single-count .ext").removeClass('display-none');
								} else {
									$("#vote-" + items[i].id).find(".vote-count").text('');
									$("#vote-" + items[i].id).find(".single-count .ext").addClass('display-none');
								}
								if (json.showper == '1') {
									$("#vote-" + items[i].id).find(".single-percent").text(items[i].itempercent);
								} else {
									$("#vote-" + items[i].id).find(".single-percent").text('');
								}
							}
						}
					}
				} else {
					if (pctype == '1') {
						$.each(items, function (j, k) {
							if ($("#group-" + k.id).length > 0) {
								$("#group-" + k.id).find('.gnum').text(k.votenums);
								$("#group-" + k.id).find('.groupname').text(k.votename);
								$("#group-" + k.id).find('.gname').text(k.votename);
							}
							var gitems = k.items || [];
							if (gitems.length > 0) {
								$.each(gitems, function (i, v) {
									if ($("#vote-" + v.id).length > 0) {
										if ($(".votenumber").length > 0) {
											$("#vote-" + v.id).find(".vote-progressbar").css({ "height": (v.percent * 325) + 'px' });
										} else {
											var hobj = $("#vote-" + v.id).find(".cube-body .inner");
											if (hobj.length == 0) {
												hobj = $("#vote-" + v.id).find(".vote-progressbar");
											}
											hobj.css({ "height": v.voteper });
										}
										$("#vote-" + v.id).find(".votenum").text(json.shownum == '1' ? v.votenums + voteunit : '');
										$("#vote-" + v.id).find(".votepercent").text(json.showper == '1' ? v.itempercent : '');
									}
								});
							}
						})
					}
				}
			}
		},
		initevent: function () {
			var self = this;
			//切换轮次
			$(".vote-rounds").on('click', 'a', function () {
				var $this = $(this), rotateid = $this.attr('data-rotateid');
				if ($this.hasClass('active')) return false;
				screencore.ajaxSubmit("/screen/vote/initvote", { rotateid: rotateid }, '正在加载' + votetxt + '项目..').then(function (json) {
					if (json.code == 0) {
						self.order = '2';
						self.ordernum = 0;
						$(".vote-info-right .rankbtn").attr('data-order', '2');
						$(".vote-info-right .rankbtn").find('span').text('普通模式');
						self.initpage(json.msg.rotate);
						self.updateTimer();
						var ranktype = json.msg.rotate.ranktype || '2';
						if (ranktype == '1') {
							$(".vote-info-right .rankbtn").trigger('click');
						}
					} else {
						layerBox.showMsg(json.msg);
					}
				}, function () {
					layerBox.showMsg('加载出错');
				});
			});
			$(".vote-info-right .rankbtn").on('click', function () {
				var $this = $(this), ordertype = (self.order == '2' ? '1' : '2');
				screencore.ajaxSubmit("/screen/vote/initvote", { order: ordertype, ordernum: self.ordernum }).then(function (json) {
					if (json.code == 0) {
						if (self.order == '2') {
							$this.attr('data-order', '1'), $this.find('span').text('排行模式');
							self.initpage(json.msg.rotate);//初始化
						} else {
							$this.attr('data-order', '2'), $this.find('span').text('普通模式');
							self.initpage(json.msg.rotate);//初始化
						}
						self.order = ordertype;
						self.updateTimer();
					} else {
						layerBox.showMsg(data.msg);
					}
				});
			});
			$(".votestatus div").on('click', function () {
				var state = $(this).attr('data-state');
				if (state == '1') {
					$(this).attr('data-state', '2');
					$(this).removeClass('startstatus').addClass('endstatus');
				} else {
					$(this).attr('data-state', '1');
					$(this).removeClass('endstatus').addClass('startstatus');
				}
				screencore.ajaxSubmit("/screen/vote/changestate", { rotateid: $(".voterotateid").val(), status: (state == '1' ? '2' : '1') }).then(function (data) {
					if (data.code == 0) {
						layerBox.showMsg(votetxt + (state == '1' ? '通道已关闭' : '通道已开启'));
					} else {
						layerBox.showMsg('网络异常，操作失败');
					}
				});
			});
			keyboardJS.bind('space', function (e) {
				$(".votestatus div").trigger('click');
			});
			var iscreating = false;
			keyboardJS.bind('right', function (e) {
				var nextDom = $('.vote-rounds .active').next();
				if (nextDom.length <= 0) {
					if (XCV3Config.rhdid == '-1') {
						if (iscreating) return false;
						iscreating = true;
						screencore.ajaxSubmit("/screen/vote/autocreaterotate", {}, '正在创建新的轮次...').then(function (json) {
							if (json.code == 0) {
								self.order = '2';
								self.ordernum = 0;
								$(".vote-info-right .rankbtn").attr('data-order', '2');
								$(".vote-info-right .rankbtn").find('span').text('普通模式');
								screencore.ajaxSubmit("/screen/vote/initvote", { rotateid: json.msg }).then(function (json) {
									if (json.code == 0) {
										self.updatepage(json.msg);
									} else {
										layerBox.showMsg(json.msg);
									}
								}, function () {
									layerBox.showMsg('加载出错');
								});
							} else {
								layerBox.showMsg(json.msg);
							}
							iscreating = false;
						});
					} else {
						$('.vote-rounds a:first').trigger('click');
					}
				} else {
					nextDom.trigger('click');
				}
			});
			keyboardJS.bind('left', function (e) {
				var prevDom = $('.vote-rounds .active').prev();
				if (prevDom.length <= 0) {
					$('.vote-rounds a:last').trigger('click');
				} else {
					prevDom.trigger('click');
				}
			});
			keyboardJS.bind('/', function (e) {
				if (self.autoplay == '1') {
					self.autoplay = '2';
				} else {
					self.autoplay = '1';
				}
				screencore.ajaxSubmit("/screen/vote/initvote", { order: self.order }).then(function (json) {
					if (json.code == 0) {
						json.msg.rotate.autoplay = self.autoplay;
						self.initpage(json.msg.rotate);
						self.updateTimer();
						layerBox.showMsg(self.autoplay == '1' ? '已开启自动换页' : '已关闭自动换页');
					} else {
						layerBox.showMsg(data.msg);
					}
				});
			});
			keyboardJS.bind('enter', function (e) {
				if (self.rotate.pctype == '3' || self.rotate.items.length <= 0 || XCV3Config.rhdid != '-1') return false;
				if (self.ordernum == 0) {
					if ($(".vote-rounds a").length == 1) {
						self.ordernum = 3;
					} else {
						self.ordernum = 1;
					}
					//非排行模式通过事件来触发加载
					if (self.order == '2') {
						$(".vote-info-right .rankbtn").trigger('click');
					} else {
						//排行模式立即执行加载
						self.ajaxvotedata();
					}
				} else {
					self.ordernum = 0;
					//排行模式转普通模式并加载
					if (self.order == '1') {
						$(".vote-info-right .rankbtn").trigger('click');
					} else {
						self.ajaxvotedata();
					}
				}
			});
			self.updateTimer();
		},
		updateTimer: function () {
			var self = this;
			if (self.ajaxtimer != null) clearInterval(self.ajaxtimer);
			self.ajaxtimer = setInterval(function () {
				self.ajaxvotedata();
			}, 4e3);
		},
		/*order 1 排名加载 2 默认加载*/
		ajaxvotedata: function () {
			var self = this;
			screencore.ajaxSubmit("/screen/vote/initvote", { order: self.order, ordernum: self.ordernum }).then(function (json) {
				if (json.code == 0) {
					self.updatepage(json.msg);
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		updateDjs: function (djs) {
			let minutes = Math.floor(djs / 60);
			let seconds = djs % 60;
			minutes = minutes < 10 ? '0' + minutes : minutes;
			seconds = seconds < 10 ? '0' + seconds : seconds;
			$(".djsbox").html(`${minutes}:${seconds}`);
			if (djs > 0) {
				$(".djsbox").removeClass('hidden');
			} else {
				$(".djsbox").addClass('hidden');
				$(".votestatus div").attr('data-state', '2').removeClass('startstatus').addClass('endstatus');
			}
		},
		initsocket: function () {
			var self = this, wsConfig = {};
			wsConfig.onmessage = function (data) {
				if (data.type == 'connected') {
					screensocket.isclose = false;
					screencore.connectsocket({ clientid: data.clientid });
				} else if (data.type == 'delshowvote' || data.type == 'resetallvote') {
					window.location.reload();
				} else if (data.type == 'voterounddjs') {
					var rotateid = $(".voterotateid").val() || '', roundid = data.roundid || '';
					if (roundid && rotateid == roundid) {
						self.updateDjs(data.djs);
					}
				} else if (data.type == 'screendm') {
					var messages = data.msgs;
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
			screensocket.init(wsConfig);
		},
	};
	return screenvote;
});
