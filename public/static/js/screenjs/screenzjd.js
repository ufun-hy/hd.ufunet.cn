/*
* @Author: 赞木
* @Date:   2021-12-19 09:58:51
* @Last Modified by:   赞木
* @Last Modified time: 2022-05-06 09:46:54
*/
define('screenzjd', ['screencore', 'layerBox', 'template', 'keyboard'], function (screencore, layerBox, template, keyboardJS) {
	var screenzjd = {
		alluser: [],
		maxid: 0,
		prizeIndex: 0,
		prizeInfo: [],
		luckerids: [],
		isruning: false,
		changetimer: null,
		showOneTimer: null,
		arrowflag: 'show',
		luckerUsers: [],
		init: function () {
			var self = this;
			self.ajaxusers(function () {
				self.initprize(true);
				self.bindevent();
				setTimeout(function () {
					self.getnewUser();
				}, 10e3);
			});
		},
		ajaxusers: function (fn) {
			var self = this;
			screencore.ajaxSubmit('/screen/zjd/initdata', { gametype: XCV3Config.gametype }).then(function (json) {
				if (json.code == 0) {
					self.alluser = json.msg.list;
					if (self.alluser.length > 0) self.maxid = self.alluser[0].userid;
					$(".zjd-join").text(json.msg.total);
					self.prizeInfo = json.msg.prizelist;
					if (self.prizeInfo.length > 0) {
						fn && fn();
					} else {
						$(".zjd-container").addClass('hidden');
						$(".zjd-mainbox .emptybox").removeClass('hidden');
					}
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		initprize: function (flag) {
			flag = flag || false;
			var self = this, prizeOne = self.prizeInfo[self.prizeIndex];
			if (!prizeOne) return;
			if (flag) {
				var html = '';
				$.each(self.prizeInfo, function (i, v) {
					if (v.id == prizeOne.id) {
						v.issel = true;
					}
					html += template("prize-tpl", v);
				});
				$(".zjd-prizelist").html(html);
			}
			$(".zjd-selectbox input").val(prizeOne.onceout);
			$(".zjd-prizename").attr('data-id', prizeOne.id).text(prizeOne.awardname);
			$(".zjd-luckers .lucker-title .zjdawardname").text(prizeOne.awardname);
			$(".zjd-luckers .lucker-title .zjdprizename").text($.trim(prizeOne.prizename) ? `(${prizeOne.prizename})` : '');
			self.getprizelucker(prizeOne.id);
		},
		getnewUser: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/zjd/getmoreuser', { maxid: self.maxid }).then(function (json) {
				if (json.code == 0) {
					$(".zjd-join").text(json.msg.total);
					var newuser = json.msg.list;
					if (newuser.length > 0) {
						$.each(newuser, function (i, v) {
							self.alluser.push(v);
						});
						self.maxid = newuser[0].userid;
						if (self.alluser.length > 800) {
							self.alluser.splice(0, (self.alluser.length - 600));
						}
					}
				}
				setTimeout(function () {
					self.getnewUser();
				}, 5e3);
			}, function () {
				setTimeout(function () {
					self.getnewUser();
				}, 5e3);
			});
		},
		bindevent: function () {
			var self = this;
			$('.zjd-run').on('click', function () {
				var $this = $(this);
				var selprizeid = parseInt($('.zjd-prizename').attr('data-id'));
				if (!selprizeid || selprizeid <= 0) return layerBox.showMsg('请选择奖项');
				var personnum = parseInt($('.zjd-selectbox input').val());
				if (!personnum || personnum <= 0) return layerBox.showMsg('请设置抽取人数');
				if (self.isruning) {
					return false;
				}
				self.isruning = true;
				$this.addClass('hidden');
				$(".zjd-boxlists").addClass('boxmoving');
				screencore.ajaxSubmit('/screen/zjd/savelucker', { prizeid: selprizeid, selnum: personnum, gametype: XCV3Config.gametype }).then(function (e) {
					if (e.code == 0) {
						if ($(".openmusic").attr('data-open') == '1') $("#bgmusic").get(0).pause();
						if ($("#lotterymusic").length > 0) {
							setTimeout(function () {
								$("#lotterymusic")[0].play();
							}, 3e2);
						}
						screencore.hideFootAndQr();
						self.luckerids = e.msg.luckerids;
						$.each(e.msg.list, function (i, v) {
							var nickname = '';
							if (v.showitems.length > 0) {
								var bdval = '';
								$.each(v.showitems, function (index, val) {
									bdval += '<div>' + val + '</div>';
								});
								nickname += bdval;
							} else {
								nickname += '<div class="onlyname">' + v.nickname + '</div>';
							}
							v.nickname = nickname;
						});
						self.luckerUsers = e.msg.list;
						clearInterval(self.showOneTimer);
						var showCount = 0, llen = self.luckerUsers.length;
						$('.zjd-hands .userone').css('background-image', "url(" + self.luckerUsers[showCount].avatar + ")");
						$(".zjd-hands .userinfo").html(self.luckerUsers[showCount].nickname);
						self.showOneTimer = setInterval(function () {
							self.showOne(self.luckerUsers[showCount], function () {
								setTimeout(function () {
									screencore.sendLuckerTpl({ luckerids: [self.luckerids[showCount]] }, function () { });
									$(".zjd-boxlists").removeClass('boxmoving');
									showCount++;
									if (showCount >= llen) {
										self.luckerids = [];
										clearInterval(self.showOneTimer);
										self.isruning = false;
										setTimeout(function () {
											$(".zjd-run").removeClass('hidden');
											if ($(".openmusic").attr('data-open') == '1') $("#bgmusic").get(0).play();
										}, 5e2);
									} else {
										setTimeout(function () {
											$('.zjd-hands .userone').css('background-image', "url(" + self.luckerUsers[showCount].avatar + ")");
											$(".zjd-hands .userinfo").html(self.luckerUsers[showCount].nickname);
											$(".zjd-boxlists").addClass('boxmoving');
											if ($("#lotterymusic").length > 0) {
												setTimeout(function () {
													$("#lotterymusic")[0].play();
												}, 3e2);
											}
										}, 5e2);
									}
								}, 5e2);
							});
						}, 3e3);
					} else {
						$(".zjd-boxlists").removeClass('boxmoving');
						clearInterval(self.changetimer);
						layerBox.showMsg(e.msg);
						self.isruning = false;
						$this.removeClass('hidden');
						$('.zjd-stop').addClass('hidden');
					}
				});
			});
			$("#prize_decrement").on('click', function () {
				if (self.isruning) return false;
				var denum = parseInt($(".zjd-selectbox input").val());
				if (denum > 1) {
					denum--;
				} else {
					denum = 1;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".lucker-list .lucker-item").length;
				if (cannums == 0) {
					denum = cannums;
				}
				$(".zjd-selectbox input").val(denum);
			});
			$("#prize_increment").on('click', function () {
				if (self.isruning) return false;
				var denum = parseInt($(".zjd-selectbox input").val());
				denum++;
				if (denum >= self.prizeInfo[self.prizeIndex].prizenum) {
					denum = self.prizeInfo[self.prizeIndex].prizenum;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".lucker-list .lucker-item").length;
				if (denum >= cannums) {
					denum = cannums;
				}
				$(".zjd-selectbox input").val(denum);
			});
			$(".zjd-selectbox input").on('blur', function () {
				var denum = parseInt($(".zjd-selectbox input").val());
				if (!denum || denum == '') {
					denum = 1;
				}
				if (denum >= self.prizeInfo[self.prizeIndex].prizenum) {
					denum = self.prizeInfo[self.prizeIndex].prizenum;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".lucker-list .lucker-item").length;
				if (denum >= cannums) {
					denum = cannums;
				}
				$(".zjd-selectbox input").val(denum);
			});
			$(".lucker-list").on('click', ".lucker-item-showmore", function () {
				var $this = $(this), recordid = $this.attr('data-id');
				layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/zjd/dellucker', { recordid: recordid, prizeid: self.prizeInfo[self.prizeIndex].id, gametype: XCV3Config.gametype }, '').then(function (json) {
						if (json.code == 0) {
							$this.parent().parent().parent().remove();
							layerBox.showMsg('删除成功');
						} else {
							layerBox.showMsg(json.msg);
						}
					});
				});
			});
			keyboardJS.bind('space', function (e) {
				if (self.isruning) {
					return;
				}
				$(".zjd-run").trigger('click');
			});

			keyboardJS.bind('/', function (e) {
				if (self.isruning) return false;
				layerBox.showConfirm('警告', '清空将删除当前奖品的所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/zjd/delalllucker', { prizeid: self.prizeInfo[self.prizeIndex].id, gametype: XCV3Config.gametype }, '').then(function (e) {
						if (e.code == 0) {
							self.getprizelucker(self.prizeInfo[self.prizeIndex].id);
							layerBox.showMsg('清空成功');
						} else {
							layerBox.showMsg(e.msg);
						}
					});
				});
			});
			//切换奖品
			$('.zjd-prizename').on('click', function () {
				if (self.isruning) return false;
				if ('show' == self.arrowflag) {
					var b = 10 < self.prizeInfo.length ? 10 : self.prizeInfo.length;
					$(this).nextAll('.zjd-prizelist').animate({
						height: 30 * b + 'px'
					}, 500), self.arrowflag = 'hide', $('.zjd-setarrow').css('transform', 'rotate(90deg)')
				} else {
					$(this).nextAll('.zjd-prizelist').animate({
						height: 0
					}, 500);
					self.arrowflag = 'show';
					$('.zjd-setarrow').css('transform', 'rotate(-90deg)');
				}
			});
			$(".zjd-prizelist li").on('click', function () {
				if (self.isruning) return false;
				var $this = $(this), prizeid = $this.attr('data-id');
				if ($this.hasClass('issel')) {
					return;
				}
				$this.addClass('issel').siblings().removeClass('issel');
				$('.zjd-prizelist').animate({ height: 0 }, 500);
				self.arrowflag = 'show';
				$('.zjd-setarrow').css('transform', 'rotate(-90deg)');
				$.each(self.prizeInfo, function (i, v) {
					if (v.id == prizeid) {
						self.prizeIndex = i;
						self.initprize();
						return false;
					}
				});
			});
			keyboardJS.bind('left', function (e) {
				var prevLi = $(".zjd-prizelist li.issel").prev();
				prevLi.length > 0 ? prevLi.trigger('click') : $(".zjd-prizelist li:last").trigger('click');
			});
			keyboardJS.bind('right', function (e) {
				var nextLi = $(".zjd-prizelist li.issel").next();
				nextLi.length > 0 ? nextLi.trigger('click') : $(".zjd-prizelist li:first").trigger('click');
			});
			keyboardJS.bind('up', function (e) {
				$("#prize_increment").trigger('click');
			});
			keyboardJS.bind('down', function (e) {
				$("#prize_decrement").trigger('click');
			});
		},
		showOne: function (oneUser, func) {
			var self = this;
			var c = $(".zjd-hands .userone");
			var d = c.clone().appendTo("body").css({
				position: "absolute",
				top: c.offset().top,
				left: c.offset().left,
				width: c.width(),
				height: c.height()
			}).animate({
				width: 60,
				height: 60,
				top: $(".lucker-list").offset().top,
				left: $(".lucker-list").offset().left - 200
			}, 500, function () {
				d.remove();
				$(".lucker-list").prepend(template('lucker-tpl', oneUser));
				func && func();
			})
		},
		getprizelucker: function (id, fn) {
			screencore.ajaxSubmit('/screen/zjd/ajaxlucker', { prizeid: id, gametype: XCV3Config.gametype }, '正在加载中奖记录..').then(function (e) {
				if (e.code == 0) {
					var lucker = e.msg.list, luckerRender = template('lucker-tpl'), html = '';
					lucker = lucker.reverse();
					$.each(lucker, function (i, v) {
						var nickname = '';
						if (v.showitems.length > 0) {
							var bdval = '';
							$.each(v.showitems, function (index, val) {
								bdval += '<div>' + val + '</div>';
							});
							nickname += bdval;
						} else {
							nickname += '<div class="onlyname">' + v.nickname + '</div>';
						}
						v.nickname = nickname;
						html += luckerRender(v);
					});
					$(".lucker-list").html(html);
					fn && fn();
				} else {
					layerBox.showMsg(e.msg);
				}
			});
		},
	};
	return screenzjd;
});