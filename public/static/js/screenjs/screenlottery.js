/*
* @Author: 赞木
* @Date:   2021-08-08 08:10:29
* @Last Modified by:   赞木
* @Last Modified time: 2023-05-18 17:11:08
*/
define('screenlottery', ['screencore', 'template', 'layerBox', 'fulldm', 'keyboard', 'anime', 'snabbt'], function (screencore, template, layerBox, lotteryani, keyboardJS, anime) {
	var autoscrollobj;
	var screenlottery = {
		prizeIndex: 0,
		prizeInfo: null,
		alluser: [],
		changeTimer: null,
		luckerRender: null,
		prizeRender: null,
		luckerids: [],
		init: function () {
			var self = this;
			self.luckerRender = template('lucker-tpl');
			self.prizeRender = template('roundprize-item');
			self.initdata();
		},
		initdata: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/lottery/initdata', { 'gametype': XCV3Config.gametype }).then(function (json) {
				if (json.code == 0) {
					self.alluser = json.msg.list;
					if (self.alluser.length > 0) self.maxid = self.alluser[0].userid;
					$(".left-joinnums span").text(json.msg.total);
					self.prizeInfo = json.msg.prizelist;
					if (self.prizeInfo.length > 0) {
						cjconfig.prizenum = self.prizeInfo.length;
						if (cjconfig.isroundcj == '1') {
							var setbox = $(".lottery-setroundbox"), html = '', roundOne = self.prizeInfo[self.prizeIndex];
							setbox.find('.lottery-roundname').attr('data-id', roundOne.id).text(roundOne.roundtitle);
							$.each(self.prizeInfo, function (i, v) {
								var issel = '';
								if (i == 0) {
									issel += 'class="issel"';
								}
								html += '<li ' + issel + ' data-id="' + v.id + '">' + v.roundtitle + '</li>';
							});
							setbox.find('.lottery-roundlist').html(html);
							self.initroundinfo(true);
						} else {
							self.initprizeinfo(true);
						}
						self.bindevent();
						$(".start-btn").removeClass('stopclick');
						$(".lottery-wrapper").removeClass('hidden').animateControl('bounceInDown');
					} else {
						$(".lottery-mainbox .emptybox").removeClass('display-none');
					}
				} else {
					layerBox.showMsg(json.msg);
				}
			}, function () {
				layerBox.showMsg('网络异常，数据加载出错');
			});
		},
		initprizeinfo: function (isfirst) {
			var self = this, isfirst = isfirst || false, leftBox = $(".lottery-left"), prizeOne = self.prizeInfo[self.prizeIndex];
			if (!prizeOne) return;
			leftBox.find('.left-award').text(prizeOne.awardname);
			leftBox.find('.left-prizename').text(prizeOne.prizename);
			leftBox.find('.left-prizeimg img').attr('src', prizeOne.prizeimg);
			leftBox.find('#prize_number').val(prizeOne.onceout);
			$(".lottery-right .title-left span").text(prizeOne.prizenum);
			self.getprizelucker(prizeOne.id);
			if (isfirst) {
				self.init3d({ shape: prizeOne.anishape, shapeTime: 10e3 });
			} else {
				self.changeShape(prizeOne.anishape);
			}
		},
		initroundinfo: function (isfirst) {
			var self = this, isfirst = isfirst || false, roundOne = self.prizeInfo[self.prizeIndex];
			if (!roundOne) return;
			self.getroundprizes(roundOne.id);
			if (isfirst) {
				self.init3d({ shape: roundOne.anishape, shapeTime: 10e3 });
			} else {
				self.changeShape(roundOne.anishape);
			}
			//$(".signthreed-wall-block .wall3d").removeClass('hidden');
		},
		bindevent: function () {
			var self = this;
			$(".start-btn").click(function () {
				var $this = $(this);
				if (cjconfig.isroundcj == '1') {
					if (self.prizeInfo.length <= 0) {
						return layerBox.showMsg('请到后台添加轮次');
					}
					var selnum = 0, roundawards = self.prizeInfo[self.prizeIndex].roundawards || [];
					$.each(roundawards, function (i, v) {
						selnum += parseInt(v.num);
					});
					if (selnum <= 0) {
						return layerBox.showMsg('轮次奖品抽取人数异常');
					}
				} else {
					if (self.prizeInfo.length <= 0) {
						return layerBox.showMsg('请到后台添加奖品');
					}
					var selnum = $("#prize_number").val();
					if (!selnum || selnum == '') {
						return layerBox.showMsg('请设置抽奖人数');
					}
					if ($(".right-reward-box .right-lucker").length >= self.prizeInfo[self.prizeIndex].prizenum) {
						return layerBox.showMsg('当前奖品已抽满');
					}
				}
				if (self.alluser.length <= 0) {
					return layerBox.showMsg('抽奖人数不足');
				}
				if ($this.hasClass('stopclick')) return false;
				$this.addClass('stopclick');
				self.changeawardinfo();
				self.changeuser(selnum);
				$(".lottery-userBox").removeClass('hidden');
				$(".signthreed-wall-block").animateControl('zoomIn');
				if (cjconfig.isroundcj == '2' && isautoscroll == '1') {
					self.removeautoScroll('.right-reward-box');
					setTimeout(function () {
						$(".lottery-wrapper").addClass('hidden');
					}, 10);
				} else {
					$(".lottery-wrapper").addClass('hidden');
				}
				$(".wall3d").removeClass('hidden');
				screencore.ajaxSubmit('/screen/lottery/savelucker', { gametype: XCV3Config.gametype, prizeid: self.prizeInfo[self.prizeIndex].id, selnum: selnum, isroundcj: cjconfig.isroundcj }, '抽奖进行中，请稍后...').then(function (json) {
					if (json.code == 0) {
						screencore.hideFootAndQr();
						screencore.bgmusicpause();
						if ($("#cjing").length) {
							$("#cjing").get(0).play();
						}
						$(".lottery-stop-btn").show();
						self.luckerids = json.msg.luckerids;
						if (cjconfig.isroundcj == '1') {
							var roundluckerRender = template('roundlucker-item'), luckhtml = '';
							$.each(json.msg.list, function (i, l) {
								l.luckers = l.luckers.map(function (v) {
									var nickname = '';
									if (v.showitems.length > 0) {
										var bdval = '';
										$.each(v.showitems, function (index, val) {
											bdval += '<div class="limitbox">' + val + '</div>';
										});
										nickname += bdval;
									} else {
										nickname += '<div class="limitbox">' + v.nickname + '</div>';
									}
									v.nickname = nickname;
									return v;
								});
								luckhtml += roundluckerRender(l);
							});
							$(".lottery-roundluckerbox .roundlucker-lists").html(luckhtml);
							var style = self.prizeInfo[self.prizeIndex].style || {};
							$(".lottery-roundluckerbox .roundlucker-lists").html(luckhtml);
							var width = $(".roundlucker-lists").width() - 20, cols = style.rows || 8;
							$(".prizelucklist ul li").css({
								width: (width / cols) + 'px',
							});
							$(".prizelucklist ul li .avatar").css({
								width: ((width / cols) - 40) + 'px',
								height: ((width / cols) - 40) + 'px',
							});
							$(".roundlucker-item .prizename").css({
								color: style.awardcolor || '#FF9800',
								"font-size": (style.awardsize || 18) + 'px'
							});
							$(".prizelucklist ul li .nickname").css({
								color: style.namecolor || '#fff',
								"font-size": (style.namesize || 18) + 'px',
							});
							$(".lottery-roundluckerbox .roundtitle").html(self.prizeInfo[self.prizeIndex].roundtitle || '');
						} else {
							if (XCV3Config.rhdid == '-1') {
								self.onceoutall = json.msg.list;
								self.oncepage = 1;
							}
							$(".title-right span").text(json.msg.total);
							var outluckerRender = template('outlucker-tpl');
							var luckerRender = template('lucker-tpl');
							var html = '';
							var luckhtml = '';
							$.each(json.msg.list, function (i, v) {
								var nickname = '';
								if (v.showitems.length > 0) {
									var bdval = '';
									$.each(v.showitems, function (index, val) {
										bdval += '<div>' + val + '</div>';
									});
									nickname += bdval;
								} else {
									nickname += '<div>' + v.nickname + '</div>';
								}
								v.nickname = nickname;
								if (XCV3Config.rhdid == '-1') {
									if (i < 80) html += outluckerRender(v);
								} else {
									html += outluckerRender(v);
								}
								luckhtml += luckerRender(v);
							});
							if (XCV3Config.rhdid == '-1') {
								html = '';
								if (json.msg.zarr.length > 0) {
									var zhtml = '<div class="grouptitle">总部</div>';
									$.each(json.msg.zarr, function (i, v) {
										var nickname = '';
										if (v.showitems.length > 0) {
											var bdval = '';
											$.each(v.showitems, function (index, val) {
												bdval += '<div>' + val + '</div>';
											});
											nickname += bdval;
										} else {
											nickname += '<div>' + v.nickname + '</div>';
										}
										v.nickname = nickname;
										zhtml += outluckerRender(v);
									});
									html += '<div class="left-wrapper zam-app-flex-ajCenter2">' + zhtml + '</div>';
								}
								if (json.msg.farr.length > 0) {
									var fhtml = '<div class="grouptitle">分部</div>';
									$.each(json.msg.farr, function (i, v) {
										var nickname = '';
										if (v.showitems.length > 0) {
											var bdval = '';
											$.each(v.showitems, function (index, val) {
												bdval += '<div>' + val + '</div>';
											});
											nickname += bdval;
										} else {
											nickname += '<div>' + v.nickname + '</div>';
										}
										v.nickname = nickname;
										fhtml += outluckerRender(v);
									});
									html += '<div class="right-wrapper zam-app-flex-ajCenter2">' + fhtml + '</div>';
								}
							}
							$(".lottery-popBox-prize span").eq(0).text(self.prizeInfo[self.prizeIndex].awardname);
							$(".lottery-popBox-prize span").eq(1).text(self.prizeInfo[self.prizeIndex].prizename);
							$(".lottery-luckers-wrapper").html(html);
							$(".right-reward-box").append(luckhtml);
						}
					} else {
						$(".wall3d").addClass('hidden');
						$(".lottery-userBox").addClass('hidden');
						$(".lottery-stop-btn").hide();
						$(".lottery-wrapper").removeClass('hidden').animateControl('bounceInDown');
						$(".lottery-luckers").addClass('hidden');
						layerBox.showMsg(json.msg);
						clearInterval(self.changeTimer);
					}
					setTimeout(function () {
						$this.removeClass('stopclick');
					}, 1e3);
				}, function () {
					$this.removeClass('stopclick');
					clearInterval(self.changeTimer);
					$(".lottery-luckers-wrapper").empty();
					$(".lottery-stop-btn").hide();
					layerBox.showMsg('网络异常，请刷新重试');
				});
			});
			$(".lottery-stop-btn").on('click', function () {
				if ($(this).is(":hidden")) return;
				if ($("#cjing").length) {
					$("#cjing").get(0).pause();
				}
				if ($("#cjend").length) {
					$("#cjend").get(0).play();
				}
				$(".wall3d").addClass('hidden');
				$(".lottery-userBox").addClass('hidden');
				$(".lottery-stop-btn").hide();
				$(".lottery-luckers").removeClass('hidden').addClass('lottery-popBox-ani');
				clearInterval(self.changeTimer);
				if (isautoscroll == '1') {
					$(cjconfig.isroundcj == '1' ? '.roundlucker-lists' : '.lottery-luckers-wrapper').scrollTop(0);
					setTimeout(function () {
						self.initautoScroll(cjconfig.isroundcj == '1' ? '.roundlucker-lists' : '.lottery-luckers-wrapper');
					}, 2e3);
				}
				screencore.sendLuckerTpl({ luckerids: self.luckerids }, function () {
					self.luckerids = [];
				});
			});
			$(".lottery-close-btn").on('click', function () {
				$(".lottery-luckers").removeClass('lottery-popBox-ani').addClass('hidden');
				$(".lottery-wrapper").removeClass('hidden').animateControl('bounceInDown');
				if (isautoscroll == '1') {
					if (cjconfig.isroundcj == '2') {
						self.removeautoScroll('.lottery-luckers-wrapper');
						setTimeout(function () {
							self.initautoScroll('.right-reward-box');
						}, 2e3);
					} else {
						self.removeautoScroll('.roundlucker-lists');
						$('.roundlucker-lists').empty();
					}
				}
				self.hideawardinfo();
				screencore.bgmusicplay();
			});
			$(".lottery-wrapper .next").on('click', function () {
				if ($(".lottery-wrapper").is(":hidden") || !$(".lottery-stop-btn").is(":hidden")) return false;
				var leftBox = $(".lottery-left");
				self.prizeIndex++;
				if (self.prizeIndex >= self.prizeInfo.length) {
					self.prizeIndex = 0;
				}
				self.initprizeinfo();
			});
			$(".lottery-wrapper .prev").on('click', function () {
				if ($(".lottery-wrapper").is(":hidden") || !$(".lottery-stop-btn").is(":hidden")) return false;
				var leftBox = $(".lottery-left");
				self.prizeIndex--;
				if (self.prizeIndex < 0) {
					self.prizeIndex = self.prizeInfo.length - 1;
				}
				self.initprizeinfo();
			});
			$("#prize_decrement").on('click', function () {
				var denum = parseInt($("#prize_number").val());
				if (denum > 1) {
					denum--;
				} else {
					denum = 1;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".right-reward-box .right-lucker").length;
				if (cannums == 0) {
					denum = cannums;
				}
				$("#prize_number").val(denum);
			});
			$("#prize_increment").on('click', function () {
				var denum = parseInt($("#prize_number").val());
				denum++;
				if (denum >= self.prizeInfo[self.prizeIndex].prizenum) {
					denum = self.prizeInfo[self.prizeIndex].prizenum;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".right-reward-box .right-lucker").length;
				if (denum >= cannums) {
					denum = cannums;
				}
				$("#prize_number").val(denum);
			});
			$("#prize_number").on('blur', function () {
				var denum = parseInt($("#prize_number").val());
				if (!denum || denum == '') {
					denum = 1;
				}
				if (denum >= self.prizeInfo[self.prizeIndex].prizenum) {
					denum = self.prizeInfo[self.prizeIndex].prizenum;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".right-reward-box .right-lucker").length;
				if (denum >= cannums) {
					denum = cannums;
				}
				$("#prize_number").val(denum);
			});
			$(".right-reward-box").on('click', ".right-luckerdel", function () {
				var $this = $(this), recordid = $this.attr('data-id');
				layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/lottery/dellucker', { recordid: recordid, prizeid: self.prizeInfo[self.prizeIndex].id, gametype: XCV3Config.gametype }, '').then(function (json) {
						if (json.code == 0) {
							$this.parent().parent().remove();
							$(".title-right span").text(json.msg);
							layerBox.showMsg('删除成功');
						} else {
							layerBox.showMsg(json.msg);
						}
					});
				});
			});
			$('.lottery-roundname').on('click', function () {
				if ('show' == cjconfig.arrowflag) {
					var b = 10 < cjconfig.prizenum ? 10 : cjconfig.prizenum;
					$(this).nextAll('.lottery-roundlist').animate({
						height: 42 * b + 'px'
					}, 500), cjconfig.arrowflag = 'hide', $('.lottery-setarrow').css('transform', 'rotate(0deg)')
				} else {
					$(this).nextAll('.lottery-roundlist').animate({
						height: 0
					}, 500);
					cjconfig.arrowflag = 'show';
					$('.lottery-setarrow').css('transform', 'rotate(180deg)');
				}
			});
			$(".lottery-roundlist li").on('click', function () {
				var roundid = $(this).attr('data-id');
				$('.lottery-roundname').attr('data-id', roundid).text($(this).text());
				$(this).addClass('issel').siblings().removeClass('issel');
				$('.lottery-roundlist').animate({ height: 0 }, 500);
				cjconfig.arrowflag = 'show';
				$('.lottery-setarrow').css('transform', 'rotate(180deg)');
				self.prizeIndex = $(this).index();
				self.initroundinfo();
			});
			keyboardJS.bind('space', function (e) {
				if ($(".lottery-luckers").hasClass("hidden")) {
					if ($(".wall3d").hasClass("hidden") && $(".lottery-stop-btn").is(":hidden")) {
						$(".start-btn").trigger('click');
					} else {
						if (!$(".lottery-stop-btn").is(":hidden")) {
							$(".lottery-stop-btn").trigger('click');
						}
					}
				} else {
					$(".lottery-close-btn").trigger('click');
				}
			});
			keyboardJS.bind('left', function (e) {
				if (cjconfig.isroundcj == '1') {
					if ($(".lottery-wrapper").is(':hidden')) return;
					var prevLi = $(".lottery-roundlist li.issel").prev();
					prevLi.length > 0 ? prevLi.trigger('click') : $(".lottery-roundlist li:last").trigger('click');
				} else {
					$(".lottery-wrapper .prev").trigger('click');
				}
			});
			keyboardJS.bind('right', function (e) {
				if (cjconfig.isroundcj == '1') {
					if ($(".lottery-wrapper").is(':hidden')) return;
					var nextLi = $(".lottery-roundlist li.issel").next();
					nextLi.length > 0 ? nextLi.trigger('click') : $(".lottery-roundlist li:first").trigger('click');
				} else {
					$(".lottery-wrapper .next").trigger('click');
				}
			});
			keyboardJS.bind('/', function (e) {
				layerBox.showConfirm('警告', '清空将删除当前' + (cjconfig.isroundcj == '1' ? '轮次' : '奖品') + '的所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
					var url = cjconfig.isroundcj == '1' ? '/screen/lottery/delroundalllucker' : '/screen/lottery/delalllucker';
					var ajaxdata = { gametype: XCV3Config.gametype };
					if (cjconfig.isroundcj == '1') {
						ajaxdata.roundid = self.prizeInfo[self.prizeIndex].id;
					} else {
						ajaxdata.prizeid = self.prizeInfo[self.prizeIndex].id;
					}
					screencore.ajaxSubmit(url, ajaxdata, '').then(function (e) {
						if (e.code == 0) {
							if (cjconfig.isroundcj == '2') {
								self.getprizelucker(self.prizeInfo[self.prizeIndex].id);
							} else {
								if (!$(".lottery-luckers").hasClass('hidden')) {
									$(".lottery-roundluckerbox .roundlucker-lists").empty();
								}
							}
							layerBox.showMsg('清空成功');
						} else {
							layerBox.showMsg(e.msg);
						}
					});
				});
			});

			keyboardJS.bind('up', function (e) {
				$("#prize_increment").trigger('click');
			});
			keyboardJS.bind('down', function (e) {
				$("#prize_decrement").trigger('click');
			});
			$(".roundcj-footer .btn-allrecord").on('click', function () {
				if ($('.lottery-luckers').is(':hidden')) {
					if ($(".wall3d").hasClass("hidden") && $(".lottery-stop-btn").is(":hidden")) {
						self.getroundprizelucker();
					}
				} else {
					$(".lottery-close-btn").trigger('click');
				}
			});
			keyboardJS.bind('shift', function () {
				if ($('.roundcj-footer .btn-allrecord').length) {
					$('.roundcj-footer .btn-allrecord').trigger('click');
				}
			});
			if (XCV3Config.rhdid == '-1') {
				keyboardJS.bind('.', function (e) {
					self.outnextpage();
				});
				keyboardJS.bind(',', function (e) {
					self.outprevpage();
				});
			}
		},

		scrollSpeed: 50,
		animescrollobj: null,
		startScrollY: 0,
		scrollReset: false,
		loopScrollcount: 1,
		initautoScroll: function (classname, resettype) {
			var self = this, resettype = resettype || false;
			if ($(classname).length <= 0) {
				return false;
			}
			var animes = anime.running;
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
		outnextpage: function () {
			var self = this;
			self.oncepage++;
			var arr = self.calcpageouter();

			if (arr.length == 0) {
				self.oncepage--;
				return layerBox.showMsg('已是最后一页');
			}
			self.showpageuser(arr);
		},
		outprevpage: function () {
			var self = this;
			self.oncepage--;
			var arr = self.calcpageouter();
			if (arr.length == 0) {
				self.oncepage++;
				return layerBox.showMsg('已是第一页');
			}
			self.showpageuser(arr);
		},
		calcpageouter: function () {
			var self = this;
			let start = (self.oncepage - 1) * 80;
			if (start >= self.onceoutall.length) {
				return [];
			}
			let end = self.oncepage * 80;
			if (end >= self.onceoutall.length) {
				end = self.onceoutall.length;
			}
			return self.onceoutall.slice(start, end);
		},
		showpageuser: function (arr) {
			var html = '', outluckerRender = template('outlucker-tpl');
			$.each(arr, function (i, v) {
				var nickname = '';
				if (v.showitems.length > 0) {
					var bdval = '';
					$.each(v.showitems, function (index, val) {
						bdval += '<div>' + val + '</div>';
					});
					nickname += bdval;
				} else {
					nickname += '<div>' + v.nickname + '</div>';
				}
				v.nickname = nickname;
				html += outluckerRender(v);
			});
			$(".lottery-luckers-wrapper").html(html);
		},
		getprizelucker: function (id) {
			var self = this;
			screencore.ajaxSubmit('/screen/lottery/ajaxlucker', { prizeid: id, gametype: XCV3Config.gametype }, '').then(function (e) {
				if (e.code == 0) {
					var lucker = e.msg.list, html = '';
					$.each(lucker, function (i, v) {
						var nickname = '';
						if (v.showitems.length > 0) {
							var bdval = '';
							$.each(v.showitems, function (index, val) {
								bdval += '<div>' + val + '</div>';
							});
							nickname += bdval;
						} else {
							nickname += '<div>' + v.nickname + '</div>';
						}
						v.nickname = nickname;
						html += self.luckerRender(v);
					});
					$(".right-reward-box").html(html);
					if (isautoscroll == '1') {
						setTimeout(function () {
							self.initautoScroll('.right-reward-box');
						}, 2e3);
					}
					$(".title-right span").text(Object.keys(lucker).length);
				}
			});
		},
		getroundprizelucker: function (roundid) {
			var self = this, roundid = roundid || self.prizeInfo[self.prizeIndex].id;
			screencore.ajaxSubmit('/screen/lottery/ajaxroundlucker', { roundid: roundid, gametype: XCV3Config.gametype }, '').then(function (json) {
				if (json.code == 0) {
					var roundluckerRender = template('roundlucker-item'), luckhtml = '';
					$.each(json.msg, function (i, l) {
						l.luckers = l.luckers.map(function (v) {
							var nickname = '';
							if (v.showitems.length > 0) {
								var bdval = '';
								$.each(v.showitems, function (index, val) {
									bdval += '<div class="limitbox">' + val + '</div>';
								});
								nickname += bdval;
							} else {
								nickname += '<div class="limitbox">' + v.nickname + '</div>';
							}
							v.nickname = nickname;
							return v;
						});
						luckhtml += roundluckerRender(l);
					});
					var style = self.prizeInfo[self.prizeIndex].style || {};
					$(".lottery-roundluckerbox .roundlucker-lists").html(luckhtml);
					var width = $(".roundlucker-lists").width() - 20, cols = style.rows || 8;
					$(".prizelucklist ul li").css({
						width: (width / cols) + 'px',
					});
					$(".prizelucklist ul li .avatar").css({
						width: ((width / cols) - 40) + 'px',
						height: ((width / cols) - 40) + 'px',
					});
					$(".roundlucker-item .prizename").css({
						color: (style.awardcolor || '#FF9800'),
						"font-size": (style.awardsize || 18) + 'px'
					});
					$(".prizelucklist ul li .nickname").css({
						color: (style.namecolor || '#fff'),
						"font-size": (style.namesize || 18) + 'px',
					});
					$(".lottery-roundluckerbox .roundtitle").html(self.prizeInfo[self.prizeIndex].roundtitle || '');
					$(".lottery-luckers").removeClass('hidden').addClass('lottery-popBox-ani');
					if (isautoscroll == '1') {
						$('.roundlucker-lists').scrollTop(0);
						setTimeout(function () {
							self.initautoScroll('.roundlucker-lists');
						}, 2e3);
					}
				}
			});
		},
		getroundprizes: function (id) {
			var self = this;
			screencore.ajaxSubmit('/screen/lottery/ajaxoneround', { roundid: id, gametype: XCV3Config.gametype }, '').then(function (e) {
				if (e.code == 0) {
					var prizelist = $(".roundcj-box .roundcj-body .roundcj-prizelist"), prizes = e.msg.roundawards || [], html = '', prizestyle = e.msg.style || { cols: 5, width: 300, gap: 20, prizecolor: '#FF9800', prizesize: 18, namecolor: '#fff', namesize: 18 };
					var liw = prizestyle.width || 300, gap = prizestyle.gap || 20;
					$.each(prizes, function (i, v) {
						html += self.prizeRender(v);
					});
					if (html == '') {
						html = '<div class="round-noprize">轮次未添加奖品</div>';
						prizelist.html(html).css({ "gap": "0" });
					} else {
						prizelist.html(html).css({ "gap": `${gap}px` });
						prizelist.find('li').css({
							width: `${liw}px`,
						});
						prizelist.find('li .prizeimgbox').css({
							width: `${liw}px`,
							height: `${liw}px`,
						});
						prizelist.find("li .prizename").css({
							color: (prizestyle.prizecolor || '#FF9800'),
							"font-size": (prizestyle.prizesize || 18) + 'px',
						});
						prizelist.find("li .prizenum").css({
							color: (prizestyle.numcolor || '#fff'),
							"font-size": (prizestyle.numsize || 18) + 'px',
						});
					}
				}
			});
		},
		changeuser: function (num) {
			var self = this, popone = template('popuser-item');
			$(".lottery-userBox-item").remove();
			var pophtml = '', displayNum = parseInt(num, 10) || 1;
			var isHaloTheme = $(".main-box").hasClass("lottery-halo-theme");
			// 星环主题的运行态固定为 1 个中央头像 + 60 个环绕头像，与演示页保持一致。
			// displayNum 仅控制抽奖动画占位；真实中奖人数仍使用原始 num 提交给 savelucker。
			if (isHaloTheme) {
				displayNum = 61;
			} else if (displayNum >= 12) {
				displayNum = 12;
			}
			for (var m = 0; m < displayNum; m++) {
				pophtml += popone();
			}
			$(".lottery-userBox-wrapper").append(pophtml);
			var userBox = $(".lottery-userBox-item");
			if (isHaloTheme) {
				var calcHaloScale = function () {
					var box = $(".lottery-userBox");
					var w = box.width();
					var h = box.height();
					var scale = 800 / 1080;
					if (w > 0 && h > 0) {
						scale = Math.min(w / 1920, h / 1080);
					}
					$(".lottery-userBox-wrapper").css('--halo-stage-scale', scale);
				};
				calcHaloScale();
				// 因为 changeuser 调用时容器仍可能 hidden，需在容器显示后的下一帧或短延迟重新计算
				setTimeout(calcHaloScale, 50);

				if (!self.haloResizeBound) {
					$(window).on('resize', calcHaloScale);
					self.haloResizeBound = true;
				}

				var haloColors = ['18,181,255', '169,60,255', '255,41,112', '255,170,0', '0,255,136', '0,170,255'];
				userBox.each(function (index) {
					if (index === 0) return;
					var haloColor = haloColors[Math.floor(Math.random() * haloColors.length)];
					this.style.setProperty('--size', (Math.floor(Math.random() * 51) + 40) + 'px');
					this.style.setProperty('--radius', (Math.floor(Math.random() * 751) + 200) + 'px');
					this.style.setProperty('--scale', (Math.random() * 1.5 + 0.3).toFixed(2));
					this.style.setProperty('--dur', (Math.floor(Math.random() * 31) + 20) + 's');
					this.style.setProperty('--delay', '-' + Math.floor(Math.random() * 51) + 's');
					this.style.setProperty('--opacity', (Math.random() * 0.5 + 0.15).toFixed(2));
					this.style.setProperty('--color', 'rgba(' + haloColor + ', 0.6)');
				});
			}
			var refreshUser = function (item) {
				var userInfo = self.alluser[Math.floor((Math.random() * self.alluser.length))] || {};
				var nickname = '';
				if (userInfo.userid) {
					if (userInfo.showitems.length > 0) {
						var bdval = '';
						$.each(userInfo.showitems, function (index, val) {
							bdval += '<div>' + val + '</div>';
						});
						nickname += bdval;
					} else {
						nickname += '<div>' + userInfo.nickname + '</div>';
					}
					$(item).find("img").attr('src', userInfo.avatar);
					$(item).find("p").html(nickname);
				}
			};
			if (isHaloTheme) {
				userBox.each(function () {
					refreshUser(this);
				});
			}
			var haloOuterUsers = isHaloTheme ? userBox.slice(1) : $();
			var haloLastOuterRefresh = Date.now();
			clearInterval(self.changeTimer);
			self.changeTimer = setInterval(function () {
				if (isHaloTheme) {
					refreshUser(userBox.get(0));
					// 每约 900ms 分批替换 3 个外围头像，让候选池持续流动，同时保持轨道节点稳定。
					var haloNow = Date.now();
					if (haloNow - haloLastOuterRefresh >= 900 && haloOuterUsers.length > 0) {
						haloLastOuterRefresh = haloNow;
						var haloRefreshCount = Math.min(3, haloOuterUsers.length);
						var haloUsedIndexes = {};
						for (var h = 0; h < haloRefreshCount; h++) {
							var haloIndex;
							do {
								haloIndex = Math.floor(Math.random() * haloOuterUsers.length);
							} while (haloUsedIndexes[haloIndex]);
							haloUsedIndexes[haloIndex] = true;
							(function (haloItem, stagger) {
								setTimeout(function () {
									var target = $(haloItem);
									target.addClass('halo-avatar-changing');
									setTimeout(function () {
										refreshUser(haloItem);
									}, 140);
									setTimeout(function () {
										target.removeClass('halo-avatar-changing');
									}, 320);
								}, stagger);
							})(haloOuterUsers.get(haloIndex), h * 80);
						}
					}
				} else {
					userBox.each(function () {
						refreshUser(this);
					});
				}
			}, isHaloTheme ? 60 : 100);
		},
		changeawardinfo: function () {
			var self = this, prize = self.prizeInfo[self.prizeIndex], awardobj = $('.dzawardinfo');
			if (awardobj.length > 0) {
				awardobj.find('img').attr('src', prize.prizeimg);
				awardobj.find('.awardname').text(prize.awardname);
				awardobj.find('.prizename').text(prize.prizename);
				awardobj.removeClass('hidden');
			}
		},
		hideawardinfo: function () {
			var self = this, awardobj = $('.dzawardinfo');
			if (awardobj.length > 0) {
				awardobj.addClass('hidden');
			}
		},
		stageObj: $(".wall3d ul"),
		shape: 'sphere',
		nullCount: 0,
		shapeTime: 10e3,
		isImg: !0,
		Utils: {},
		Stage: {},
		Card: {},
		wall: {},
		sphere: {},
		wall2: {},
		cylinder: {},
		cube: {},
		cube2: {},
		screw: {},
		deg: function (o) {
			return Math.PI / 180 * o
		},
		maxid: 0,
		Countobj: [],
		Logoobj: [],
		Textobj: [],
		posfrom: [
			[800, -800, 3e3],
			[800, 800, 3e3],
			[-800, 800, 3e3],
			[-800, -800, 3e3],
		],
		shapes: ['sphere', 'wall', 'cube', 'cube2', 'cylinder', 'screw', 'tours'],
		init3d: function (params) {
			if (!params) return;
			var e = this;
			e.shape = e.shapes[(params.shape - 1)] || 'sphere';
			e.shapeTime = params.shapeTime || 10e3;
			e.Stage = e.makeStage();
			e.Utils = e.makeUtils();
			e.Card = e.makeCard();
			e.wall = e.makeWall();
			e.wall2 = e.makeWall2();
			e.sphere = e.makeSphere();
			e.cylinder = e.makeCylinder();
			e.cube = e.makeCube();
			e.cube2 = e.makeCube2();
			e.screw = e.makeScrew();
			e.tours = e.makeTours();
			e.changeShape();
			setTimeout(function () {
				e.getnewUser();
			}, 10e3);
		},
		getnewUser: function () {
			var e = this;
			screencore.ajaxSubmit('/screen/lottery/getmoreuser', { maxid: e.maxid }).then(function (json) {
				if (json.code == 0) {
					$(".left-joinnums span").text(json.msg.total);
					var newuser = json.msg.list, noavatars = $(".signthreed-wall-block .wall3d li").filter(function (o, i) {
						return "N" == $(i).attr("data-avatar")
					});
					if (newuser.length > 0) {
						e.maxid = newuser[0].userid;
					}
					if (noavatars.length > 0 && newuser.length > 0) {
						$.each(newuser, function (i, v) {
							e.alluser.push(v);
							noavatars.eq(i).find('img').attr('src', v.avatar);
							noavatars.eq(i).attr('data-avatar', 'Y')
						});
					} else {
						var hadavatars = $(".signthreed-wall-block .wall3d li").filter(function (o, i) {
							return "Y" == $(i).attr("data-avatar")
						});
						if (hadavatars.length > 0 && newuser.length > 0) {
							$.each(newuser, function (i, v) {
								e.alluser.push(v);
								hadavatars.eq(i).find('img').attr('src', v.avatar);
							});
						}
					}
				}
				setTimeout(function () {
					e.getnewUser();
				}, 5e3);
			}, function () {
				setTimeout(function () {
					e.getnewUser();
				}, 5e3);
			});

		},
		makeUtils: function () {
			var self = this;
			var o = window.innerWidth,
				i = window.innerHeight,
				n = [],
				e = 0,
				s = function () {
					if (n.length) {
						var o = n.shift(),
							i = o.item,
							t = o.url,
							a = new Image;
						a.src = t;
						a.onerror = function () {
							if (defaultimg != '') a.src = defaultimg;
						}
						i.append(a);
						$(a).show();
					}
					/*
					if (n.length && !(e > 2)) {
						++e;
						var o = n.shift(),
							i = o.item,
							t = o.url,
							a = new Image;
						a.onload = function() {
							i.append(a),$(a).fadeIn(), --e, setTimeout(s, 100)
						}, a.onerror = function() {
							--e, setTimeout(s, 100)
						}, a.src = t, setTimeout(s, 150)
					}
					*/
				};
			return {
				width: o,
				height: i,
				in: function () {
					var o = $.Deferred(),
						i = self.stageObj.find("li");
					var inpos = {};
					inpos.position = [-3e3, 0, -700];
					inpos.duration = 0;
					inpos.allDone = o.resolve;

					return i.length ? (self.Stage.stop(), i.snabbt(inpos)) : o.resolve(), o.promise()
				},
				leave: function () {
					var o = $.Deferred(),
						i = self.stageObj.find("li");
					var leavepos = {};
					leavepos.position = [3e3, 0, -700];
					leavepos.duration = 500;
					leavepos.delay = function (o, i) {
						return 1e3 * Math.random()
					};
					leavepos.allDone = o.resolve;
					return i.length ? (self.Stage.stop(), i.snabbt(leavepos)) : o.resolve(), o.promise()
				},
				loadImg: function (o) {
					n.push(o), s()
				}
			}
		},
		makeStage: function () {
			var self = this;
			var o = {
				fromRotation: [0, 0, 0],
				rotation: [0, 2 * Math.PI, 0],
				duration: 35e3,
				complete: function () {
					i()
				}
			},
				i = function () {
					self.Stage.stop(), self.Stage.snabbt(o)
				};
			return {//          stage 
				default: function (n) {
					n.transformOrigin || (n.transformOrigin = [0, 0, 0]);
					n.duration || (n.duration = 35e3);
					Object.keys(n).forEach(function (i) {
						o[i] = n[i]
					});
					self.Stage.snabbt({
						position: [0, 0, 0],
						duration: 100,
						complete: i
					})
				},
				snabbt: self.stageObj.snabbt.bind(self.stageObj),
				stop: function () {
					self.stageObj.snabbt("stop")
				},
				reset: function (o) {
					self.stageObj.css("transform", "")
				}
			}
		},
		makeCard: function () {
			var self = this;
			var o = -1,
				i = [],
				n = function (key) {
					/*
						var o = $('<li class="card"></li>'),
							n = 335 * Math.random() | 0;
						if(self.isImg){
							self.Utils.loadImg({
								item: o,
								url:self.alluser[key]?self.alluser[key].avatar:(self.alluser.length>0?self.alluser[Math.floor(Math.random()*self.alluser.length)].avatar:defaultimg)
							})
						}
						i.push(o);
						self.stageObj.append(o);
						if(!self.alluser[key]){
							o.attr('data-avatar','N');
						}else{
							o.attr('data-avatar','Y');
						}
					*/
					/*2023 03 11改成不考虑加载问题直接插入*/
					var imgurl = self.alluser[key] ? self.alluser[key].avatar : (self.alluser.length > 0 ? self.alluser[Math.floor(Math.random() * self.alluser.length)].avatar : defaultimg);
					var strobj = '<li class="card"><img src="' + imgurl + '" onerror="errorImg(this)" /></li>';
					if (defaultimg == '') {
						strobj = '<li class="card"><img src="' + imgurl + '" /></li>';
					}
					var o = $(strobj), n = 335 * Math.random() | 0;
					i.push(o);
					self.stageObj.append(o);
					if (!self.alluser[key]) {
						o.attr('data-avatar', 'N');
					} else {
						o.attr('data-avatar', 'Y');
					}
				};
			return {
				count: function () {
					return i.length;
				},
				init: function (o) {
					var t = o - i.length;
					if (t > 0) {
						for (var e = i.length; e < o; e++) {
							n(e);
						}
					}
				},
				reset: function () {
					o = -1, $("li.card").removeClass("activate")
				},
				next: function () {
					if (++o, i[o]) return i[o]
				}
			}
		},
		makeWall: function () {
			var self = this;
			for (var o = [], i = h = 50 * Math.sqrt(2), n = self.Utils.height / h | 0, e = self.Utils.width / i | 0, s = 0; s < n; s++) for (var a = 0; a < e; a++) {
				var l = (e - 1) / 2 - a,
					r = (n - 1) / 2 - s;
				o.push({
					position: [l * i, r * h, 0],
					rotation: [0, 0, Math.PI / 4]
				})
			}
			return {
				card: {
					count: o.length,
					allCard: o,
					perspective: 3500
				},
				stage: {
					position: [0, 0, 0],
					duration: self.shapeTime
				}
			}
		},
		makeWall2: function () {
			var self = this;
			for (var o = [], i = h = 55 * Math.sqrt(2), n = 17, e = 20, s = 0; s < n; s++) for (var a = 0; a < e; a++) {
				var l = (e - 1) / 2 - a,
					r = (n - 1) / 2 - s,
					c = 0;
				s % 2 == 0 && (c = h / 2), o.push({
					position: [l * i + c, r * h / 2, 0],
					rotation: [0, 0, Math.PI / 4]
				})
			}
			return {
				card: {
					count: o.length,
					allCard: o,
					perspective: 3500
				},
				stage: {
					position: [0, 0, 0],
					duration: self.shapeTime
				}
			}
		},
		makeSphere: function () {
			var self = this;
			for (var o = [], t = 380, e = 16, s = 30, a = {}, l = e / 2 | 0, r = 0; r < e; r++) {
				var c = (Math.sin(Math.PI / (e - 1) * r) * s | 0) + 1;
				a[r] = c
			}
			return Object.keys(a).forEach(function (i) {
				for (var s = l - i, r = a[i], c = 0; c < r; c++) {
					var p = 180 / e * s,
						u = 360 / r * c;
					1 == r && (p = p > 0 ? 90 : -90);
					var d = i * self.deg(180 / (e - 1)),
						f = c * self.deg(360 / r),
						h = t * Math.sin(d) * Math.cos(f),
						g = t * Math.sin(d) * Math.sin(f),
						v = .9 * t * Math.cos(d);
					o.push({
						position: [g, -v, h],
						rotation: [-self.deg(p), -self.deg(u), 0],
					})
				}
			}), {
				card: {
					count: o.length,
					allCard: o,
					perspective: 3500
				},
				stage: {
					position: [0, 0, 0],
					duration: self.shapeTime
				}
			}
		},
		makeTours: function () {
			var self = this;
			var o = [];
			var deg = function (o) {
				return Math.PI / 180 * o
			};
			var e = 360;
			var s = 10;
			var a = 15;
			var l = self.Utils.width / (a * 6);
			var r = 360 / a;
			for (var c = 0; c < s; c++) {
				for (var u = 0; u < a; u++) {
					var p = s / 2 | 0,
						d = a / 2 | 0,
						f = deg(r * u),
						x = e * Math.cos(f),
						y = e * Math.sin(f),
						z = (c - p) * a * l + (u - d) * l;
					o.push({
						position: [x, y, z],
						rotation: [0, 0, 0],

					})
				}
			}
			return {
				card: {
					count: o.length,
					allCard: o,
					perspective: 3500
				},
				stage: function () {
					var i = function () {
						self.Stage.snabbt({
							fromRotation: [0, 0, 0],
							rotation: [0, 0, 2 * Math.PI],
							duration: self.shapeTime,
							complete: function () {
								i();
							}
						})
					};
					return i
				}

			}

		},
		makeCylinder: function () {
			var self = this;
			for (var o = [], i = 500, t = 500, e = 7, s = 45, a = t / e | 0, l = e / 2 | 0, r = 0; r < e; r++) for (var c = 360 / s, p = 0; p < s; p++) {
				var u = 0,
					d = 0,
					f = 0,
					h = 0;
				u = i * Math.sin(self.deg(p * c)), d = (r - l) * a, f = i * Math.cos(self.deg(p * c)), h = p * c, o.push({
					position: [u, d, f],
					rotation: [0, -self.deg(h), 0]
				})
			}
			return {
				card: {
					count: o.length,
					allCard: o,
					perspective: 3500
				},
				stage: {
					position: [0, 0, 0],
					duration: self.shapeTime * 2
				}
			}
		},
		makeCube: function () {
			var self = this;
			for (var o = [], i = h = d = 100, t = 5, n = 9, e = 8, s = 0; s < e; s++) for (var a = 0; a < t; a++) for (var l = 0; l < n; l++) {
				var r = (n - 1) / 2 - l,
					c = (t - 1) / 2 - a,
					p = (e - 1) / 2 - s;
				o.push({
					position: [r * i, c * h, p * d],
					rotation: [0, 0, 0]
				})
			}
			return {
				card: {
					count: o.length,
					allCard: o,
					perspective: 3500
				},
				stage: {
					position: [0, 0, 0],
					duration: self.shapeTime
				}
			}
		},
		makeCube2: function () {
			var self = this;
			for (var o = [], i = 9, n = 57, e = (length / 2, []), s = [], a = [], l = 0; l < i; l++) for (var r = 0; r < i; r++) {
				var c = (i - 1) / 2,
					p = (c - l) * n,
					u = (c - r) * n,
					d = c * n + n / 2;
				e.push({
					position: [p, u, d],
					rotation: [0, 0, 0]
				}), e.push({
					position: [p, u, -d],
					rotation: [Math.PI, 0, 0]
				}), s.push({
					position: [-d, p, u],
					rotation: [0, Math.PI / 2, 0]
				}), s.push({
					position: [d, p, u],
					rotation: [0, -Math.PI / 2 * 3, Math.PI]
				}), a.push({
					position: [u, -d, p],
					rotation: [Math.PI / 2 * 3, 0, 0]
				}), a.push({
					position: [u, d, p],
					rotation: [Math.PI / 2, 0, 0]
				})
			}
			return o = e.concat(s, a), {
				card: {
					count: o.length,
					allCard: o,
					perspective: 3500
				},
				stage: function () {
					var i = function () {
						self.Stage.snabbt({
							fromRotation: [0, 0, 0],
							rotation: [2 * Math.PI, 2 * Math.PI, 0],
							duration: self.shapeTime,
							complete: function () {
								i();
							}
						})
					};
					return i
				}
			}
		},
		makeScrew: function () {
			var self = this;
			for (var o = [], e = 300, s = 7, a = 25, l = self.Utils.width / s / a, r = 360 / a, c = 0; c < s; c++) for (var p = s / 2 | 0, u = 0; u < a; u++) {
				var d = a / 2 | 0,
					f = self.deg(r * u),
					h = (c - p) * a * l + (u - d) * l,
					g = e * Math.sin(f),
					v = e * Math.cos(f),
					m = f,
					b = 0,
					w = 0;
				o.push({
					position: [h, g, v],
					rotation: [m, b, w],
					skew: [0, self.deg(6)]
				})
			}
			return {
				card: {
					count: o.length,
					allCard: o,
					perspective: 3500
				},
				stage: function () {
					var n = function () {
						self.Stage.snabbt({
							fromRotation: [0, 0, 0],
							rotation: [2 * Math.PI, 0, 0],
							duration: self.shapeTime,
							complete: function () {
								n()
							}
						})
					};
					return n;
				}
			}
		},
		Build: function () {
			var self = this;
			var o = self[self.shape];
			if (o) {
				var i = o.stage,
					n = o.card,
					e = function () { };
				if (i && "function" == typeof i) {
					//self rotate
					e = i();
				} else {
					//stage rotate
					self.Stage.default(i);
				}
				self.Card.reset();
				for (var s = 0, a = 0; a < n.count; a++) {
					var l = self.Card.next();
					if (l) {
						l.addClass("activate");
						var r = n.allCard[a];
						var c = {
							rotation: r.rotation,
							position: r.position,
							scale: r.scale || [1, 1],
							complete: function () {
								++s, s == n.count && e();
							}
						};
						c.duration = 0;
						c.delay = 0;
						r.skew || (r.skew = [0, 0]), c.skew = r.skew, l.snabbt(c)
					}
				}
			}
		},
		changeShape: function (shape) {
			var self = this;
			if (shape) self.shape = self.shapes[(shape - 1)];
			var shapeobj = self[self.shape];
			self.Card.init(shapeobj.card.count);
			self.Build();
		},
	};
	return screenlottery;
});
