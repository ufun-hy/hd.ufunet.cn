/*
* @Author: 赞木
* @Date:   2021-12-19 09:58:49
* @Last Modified by:   赞木
* @Last Modified time: 2021-12-23 12:44:57
*/
define('screencjx', ['screencore', 'layerBox', 'template', 'keyboard'], function (screencore, layerBox, template, keyboardJS) {
	var screencjx = {
		alluser: [],
		maxid: 0,
		prizeIndex: 0,
		prizeInfo: [],
		luckerids: [],
		isruning: false,
		isover: false,
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
			screencore.ajaxSubmit('/screen/cjx/initdata', { gametype: XCV3Config.gametype }).then(function (json) {
				if (json.code == 0) {
					self.alluser = json.msg.list;
					if (self.alluser.length > 0) self.maxid = self.alluser[0].userid;
					$(".cjx-join").text(json.msg.total);
					self.prizeInfo = json.msg.prizelist;
					if (self.prizeInfo.length > 0) {
						fn && fn();
					} else {
						$(".cjx-container").addClass('hidden');
						$(".cjx-mainbox .emptybox").removeClass('hidden');
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
				$(".cjx-prizelist").html(html);
			}
			$(".cjx-selectbox input").val(prizeOne.onceout);
			$(".cjx-prizename").attr('data-id', prizeOne.id).text(prizeOne.awardname);
			$(".cjx-luckers .lucker-title .cjxawardname").text(prizeOne.awardname);
			$(".cjx-luckers .lucker-title .cjxprizename").text($.trim(prizeOne.prizename) ? `(${prizeOne.prizename})` : '');
			self.getprizelucker(prizeOne.id);
		},
		getnewUser: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/cjx/getmoreuser', { maxid: self.maxid }).then(function (json) {
				if (json.code == 0) {
					$(".cjx-join").text(json.msg.total);
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
			$('.cjx-run').on('click', function () {
				var $this = $(this);
				var selprizeid = parseInt($('.cjx-prizename').attr('data-id'));
				if (!selprizeid || selprizeid <= 0) return layerBox.showMsg('请选择奖项');
				var personnum = parseInt($('.cjx-selectbox input').val());
				if (!personnum || personnum <= 0) return layerBox.showMsg('请设置抽取人数');
				if (self.isruning) {
					return false;
				}
				self.isruning = true;
				$this.addClass('hidden');
				$(".cjx-boxlists").addClass('boxmoving');
				clearInterval(self.changetimer);
				self.changetimer = setInterval(function () {
					var userone = self.alluser[Math.floor(Math.random() * self.alluser.length)];
					$('.cjx-hands .userone').css('background-image', "url(" + userone.avatar + ")");
					var nickname = '';
					if (userone.showitems.length > 0) {
						var bdval = '';
						$.each(userone.showitems, function (index, val) {
							bdval += '<div>' + val + '</div>';
						});
						nickname += bdval;
					} else {
						nickname += '<div class="onlyname">' + userone.nickname + '</div>';
					}
					$(".cjx-hands .userinfo").html(nickname);
				}, 60);
				screencore.ajaxSubmit('/screen/cjx/savelucker', { prizeid: selprizeid, selnum: personnum, gametype: XCV3Config.gametype }).then(function (e) {
					if (e.code == 0) {
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
						setTimeout(function () {
							$('.cjx-stop').removeClass('hidden');
						}, 2e3);
					} else {
						$(".cjx-boxlists").removeClass('boxmoving');
						clearInterval(self.changetimer);
						layerBox.showMsg(e.msg);
						self.isruning = false;
						$this.removeClass('hidden');
						$('.cjx-stop').addClass('hidden');
					}
				});
			});
			$(".cjx-stop").on('click', function () {
				if (self.isover) {
					return;
				}
				clearInterval(self.changetimer);
				self.isover = true;
				if (self.luckerUsers.length <= 0) {
					layerBox.showMsg('出现异常，请刷新页面重试');
					return false;
				} else {
					clearInterval(self.showOneTimer);
					var showCount = 0, llen = self.luckerUsers.length;
					$('.cjx-hands .userone').css('background-image', "url(" + self.luckerUsers[showCount].avatar + ")");
					$(".cjx-hands .userinfo").html(self.luckerUsers[showCount].nickname);
					$(".cjx-boxlists").removeClass('boxmoving').addClass('handmoving');
					self.showOneTimer = setInterval(function () {
						self.showOne(self.luckerUsers[showCount], function () {
							setTimeout(function () {
								screencore.sendLuckerTpl({ luckerids: [self.luckerids[showCount]] }, function () { });
								$(".cjx-boxlists").removeClass('handmoving');
								showCount++;
								if (showCount >= llen) {
									clearInterval(self.showOneTimer);
									self.luckerids = [];
									self.isruning = false;
									self.isover = false;
									setTimeout(function () {
										$(".cjx-run").removeClass('hidden');
									}, 5e2);
								} else {
									setTimeout(function () {
										$('.cjx-hands .userone').css('background-image', "url(" + self.luckerUsers[showCount].avatar + ")");
										$(".cjx-hands .userinfo").html(self.luckerUsers[showCount].nickname);
										$(".cjx-boxlists").addClass('handmoving');
									}, 5e2);
								}
							}, 5e2);
						});
					}, 4e3);

				}
				$('.cjx-stop').addClass('hidden');
			});
			$("#prize_decrement").on('click', function () {
				if (self.isruning || self.isover) return false;
				var denum = parseInt($(".cjx-selectbox input").val());
				if (denum > 1) {
					denum--;
				} else {
					denum = 1;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".lucker-list .lucker-item").length;
				if (cannums == 0) {
					denum = cannums;
				}
				$(".cjx-selectbox input").val(denum);
			});
			$("#prize_increment").on('click', function () {
				if (self.isruning || self.isover) return false;
				var denum = parseInt($(".cjx-selectbox input").val());
				denum++;
				if (denum >= self.prizeInfo[self.prizeIndex].prizenum) {
					denum = self.prizeInfo[self.prizeIndex].prizenum;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".lucker-list .lucker-item").length;
				if (denum >= cannums) {
					denum = cannums;
				}
				$(".cjx-selectbox input").val(denum);
			});
			$(".cjx-selectbox input").on('blur', function () {
				if (self.isruning || self.isover) return false;
				var denum = parseInt($(".cjx-selectbox input").val());
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
				$(".cjx-selectbox input").val(denum);
			});
			$(".lucker-list").on('click', ".lucker-item-showmore", function () {
				var $this = $(this), recordid = $this.attr('data-id');
				layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/cjx/dellucker', { recordid: recordid, prizeid: self.prizeInfo[self.prizeIndex].id, gametype: XCV3Config.gametype }, '').then(function (json) {
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
				if (!$('.cjx-stop').is(":hidden")) {
					if (self.isover) {
						return;
					}
					$(".cjx-stop").trigger('click');
				} else {
					if (self.isruning) {
						return;
					}
					$(".cjx-run").trigger('click');
				}
			});

			keyboardJS.bind('/', function (e) {
				if (self.isruning || self.isover) return false;
				layerBox.showConfirm('警告', '清空将删除当前奖品的所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/cjx/delalllucker', { prizeid: self.prizeInfo[self.prizeIndex].id, gametype: XCV3Config.gametype }, '').then(function (e) {
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
			$('.cjx-prizename').on('click', function () {
				if (self.isruning || self.isover) return false;
				if ('show' == self.arrowflag) {
					var b = 10 < self.prizeInfo.length ? 10 : self.prizeInfo.length;
					$(this).nextAll('.cjx-prizelist').animate({
						height: 30 * b + 'px'
					}, 500), self.arrowflag = 'hide', $('.cjx-setarrow').css('transform', 'rotate(90deg)')
				} else {
					$(this).nextAll('.cjx-prizelist').animate({
						height: 0
					}, 500);
					self.arrowflag = 'show';
					$('.cjx-setarrow').css('transform', 'rotate(-90deg)');
				}
			});
			$(".cjx-prizelist li").on('click', function () {
				if (self.isruning || self.isover) return false;
				var $this = $(this), prizeid = $this.attr('data-id');
				if ($this.hasClass('issel')) {
					return;
				}
				$this.addClass('issel').siblings().removeClass('issel');
				$('.cjx-prizelist').animate({ height: 0 }, 500);
				self.arrowflag = 'show';
				$('.cjx-setarrow').css('transform', 'rotate(-90deg)');
				$.each(self.prizeInfo, function (i, v) {
					if (v.id == prizeid) {
						self.prizeIndex = i;
						self.initprize();
						return false;
					}
				});

			});
			keyboardJS.bind('left', function (e) {
				var prevLi = $(".cjx-prizelist li.issel").prev();
				prevLi.length > 0 ? prevLi.trigger('click') : $(".cjx-prizelist li:last").trigger('click');

			});
			keyboardJS.bind('right', function (e) {
				var nextLi = $(".cjx-prizelist li.issel").next();
				nextLi.length > 0 ? nextLi.trigger('click') : $(".cjx-prizelist li:first").trigger('click');
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
			var c = $(".cjx-hands .userone");
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
			screencore.ajaxSubmit('/screen/cjx/ajaxlucker', { prizeid: id, gametype: XCV3Config.gametype }, '正在加载中奖记录..').then(function (e) {
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
	return screencjx;
});
