define('screenbigcj', ['screencore', 'layerBox', 'template', 'keyboard', 'anime'], function (screencore, layerBox, template, keyboardJS, anime) {
	var screenbigcj = {
		alluser: [],
		maxid: 0,
		prizeInfo: [],
		luckerids: [],
		prizeRender: null,
		init: function () {
			var self = this;
			self.prizeRender = template('roundprize-item');
			self.ajaxusers(function () {
				self.initprize();
				self.createwall();
				self.bindevent();
				setTimeout(function () {
					self.getnewUser();
				}, 10e3);
			});
		},
		ajaxusers: function (fn) {
			var self = this;
			screencore.ajaxSubmit('/screen/bigcj/initdata', { gametype: XCV3Config.gametype }).then(function (json) {
				if (json.code == 0) {
					self.alluser = json.msg.list;
					if (self.alluser.length > 0) self.maxid = self.alluser[0].userid;
					$(".bigcj-joinbox span").eq(1).text(json.msg.total);
					self.prizeInfo = json.msg.prizelist;
					if (self.prizeInfo.length > 0) {
						bigcj.prizenum = self.prizeInfo.length;
						fn && fn();
					} else {
						$(".bigcj-mainbox .emptybox").removeClass('display-none');
					}
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		initprize: function () {
			var self = this, firstprize = self.prizeInfo[0], awardbox = $(".bigcj-cubebox .bigcj-awardbox span"), bigsetbox = $(".bigcj-set"), setbox = $(".lottery-setroundbox"), html = '';;
			if (bigcj.isroundcj == '2') {
				awardbox.eq(0).text(firstprize.awardname);
				awardbox.eq(1).text(firstprize.prizename);
				$(".bigcj-numinput").val(firstprize.onceout);
				$(".bigcj-cube div").css({ "background-image": "url(" + firstprize.prizeimg + ")" });
				bigsetbox.find('.bigcj-prizename').attr('data-id', firstprize.id).text(firstprize.awardname);
				$.each(self.prizeInfo, function (i, v) {
					var issel = '';
					if (i == 0) {
						issel += 'class="issel"';
					}
					html += '<li ' + issel + ' data-id="' + v.id + '" data-prizename="' + v.prizename + '" data-prizeimg="' + v.prizeimg + '" data-onceout="' + v.onceout + '">' + v.awardname + '</li>';
				});
				bigsetbox.find('.bigcj-prizelist').html(html);
				$(".bigcj-prizebox .bigcj-setname").text(lotterytxts.setprizename);
				$(".bigcj-numbox .bigcj-setname").text(lotterytxts.setnumname);
				$(".bigcj-sex .bigcj-showlist").text(lotterytxts.recordname);
			} else {
				self.getroundprizes(firstprize.id);
				setbox.find('.lottery-roundname').attr('data-id', firstprize.id).text(firstprize.roundtitle);
				$.each(self.prizeInfo, function (i, v) {
					var issel = '';
					if (i == 0) {
						issel += 'class="issel"';
					}
					html += '<li ' + issel + ' data-id="' + v.id + '">' + v.roundtitle + '</li>';
				});
				setbox.find('.lottery-roundlist').html(html);
				$(".roundcj-footer .lottery-setroundname").text(lotterytxts.round.setroundname);
				$(".roundcj-footer .btn-allrecord").text(lotterytxts.round.recordname);
			}
			$(".bigcj-joinbox span").eq(0).text(lotterytxts.join);
			$(".start-btn").text(lotterytxts.start).removeClass('stopclick');
			$(".bigcj-poptitle").text(lotterytxts.poptitle);
			$(".bigcj-maskbox,.bigcj-cubebox").removeClass('display-none');
		},
		getnewUser: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/bigcj/getmoreuser', { maxid: self.maxid }).then(function (json) {
				if (json.code == 0) {
					$(".bigcj-joinbox span").eq(1).text(json.msg.total);
					var newuser = json.msg.list, noavatars = $(".bigcj-avatarBox .avatarbox").filter(function (o, i) {
						return "N" == $(i).attr("data-avatar")
					});
					if (noavatars.length <= 0) {
						noavatars = $(".bigcj-avatarBox .avatarbox").filter(function (o, i) {
							return "Y" == $(i).attr("data-avatar")
						});
					}
					if (newuser.length > 0) {
						$.each(newuser, function (i, v) {
							if (noavatars.eq(i).length > 0) {
								noavatars.eq(i).find('img').attr('src', v.avatar);
								noavatars.eq(i).attr('data-avatar', 'Y');
							}
						});
						self.maxid = newuser[0].userid;
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
		createwall: function () {
			var self = this;
			for (var i = 0; i < bigcj.cols; i++) {
				var colrow = '<div class="avatarcols">';
				for (var j = 0; j < bigcj.colrows; j++) {
					var key = (i * bigcj.colrows + j);
					var uavatar = self.alluser[key] ? self.alluser[key].avatar : (self.alluser.length > 0 ? self.alluser[Math.floor(Math.random() * self.alluser.length)].avatar : bigcj.defaultimg);
					colrow += template("oneavatar-tpl", { avatar: uavatar, isyes: (self.alluser[key] ? true : false) });
				}
				colrow += '</div>';
				$('.bigcj-avatarBox').append(colrow);
			}
			$('.bigcj-avatarBox .avatarbox').height($('.bigcj-avatarBox .avatarbox').eq(0).width());
			var q = Math.pow, screenW = $('body').width(), colnums = $('.avatarcols').length;
			for (var n = 0; n < colnums; n++) {
				var h = (colnums + 1) / 2, i = Math.abs(n + 1 - h), j = screenW / 2, k = Math.sqrt(q(j, 2) - q(i / h * j, 2));
				var l = bigcj.shape == '1' ? (1 - 0.3 * ((k - j / 3) / (j - j / 3))) : bigcj.shape == '2' ? (0.56 + 0.4 * ((k - j / 4) / (j - j / 4))) : 0.8;
				$('.avatarcols').eq(n).css({
					transform: 'scale(' + l + ')',
					margin: '0 ' + (l / 2 - 0.4) * 56 + 'px'
				})
			}
		},
		bindevent: function () {
			var self = this;
			$(window).on('resize', function () {
				$('.bigcj-avatarBox .avatarbox').height($('.bigcj-avatarBox .avatarbox').eq(0).width());
			});
			$('.start-btn').on('click', function () {
				var $this = $(this);
				if ($this.hasClass('isining')) return;
				if ($this.text() == lotterytxts.start) {
					if (bigcj.isroundcj == '1') {
						$('.bigcj-prizeusers').addClass('hidden');
						if (self.prizeInfo.length <= 0) {
							return layerBox.showMsg('请到后台添加轮次');
						}
						var selprizeid = parseInt($('.lottery-roundname').attr('data-id'));
						if (!selprizeid || selprizeid <= 0) return layerBox.showMsg('请选择轮次');
						var selnum = 0, roundIndex = $(".lottery-roundlist li.issel").index(), roundawards = self.prizeInfo[roundIndex].roundawards || [];
						$.each(roundawards, function (i, v) {
							selnum += parseInt(v.num);
						});
						if (selnum <= 0) {
							return layerBox.showMsg('轮次奖品抽取人数异常');
						}
					} else {
						$('.bigcj-prizeusers').hide();
						var selprizeid = parseInt($('.bigcj-prizename').attr('data-id'));
						if (!selprizeid || selprizeid <= 0) return layerBox.showMsg('请选择奖项');
						var selnum = parseInt($('.bigcj-numbox input').val());
						if (!selnum || selnum <= 0) return layerBox.showMsg('请设置抽取人数');
					}
					$this.text(lotterytxts.charge + '..').addClass('isining');
					screencore.ajaxSubmit('/screen/bigcj/savelucker', { gametype: XCV3Config.gametype, prizeid: selprizeid, selnum: selnum, isroundcj: bigcj.isroundcj }).then(function (e) {
						if (e.code == 0) {
							screencore.hideFootAndQr();
							$(".bigcj-cubebox .bigcj-awardbox,.bigcj-cubebox .bigcj-cube,.bigcj-cubebox .bigcj-sex,.bigcj-cubebox .roundcj-box .roundcj-body,.bigcj-cubebox .roundcj-box .roundcj-footer .bigcj-setround,.roundcj-box .bigcj-joinbox").css({ "opacity": "0" });
							$('.bigcj-avatarBox .avatarbox').removeClass('avatar_shadow');
							$('.bigcj-mask1, .bigcj-mask2').addClass('maskopen');
							setTimeout(function () {
								$('.bigcj-mask1, .bigcj-mask2').width(0), $('.bigcj-mask1, .bigcj-mask2').removeClass('maskopen')
							}, 1e3);
							for (var b = 0; b < $('.bigcj-avatarBox .avatarbox').length / 2; b++) {
								$('.bigcj-avatarBox .avatarbox').eq(b).addClass('avatar_rotate');
								$('.bigcj-avatarBox .avatarbox').eq(b).css('animation-delay', b / 40 + 's');
							}
							for (var c = $('.bigcj-avatarBox .avatarbox').length; c >= $('.bigcj-avatarBox .avatarbox').length / 2; c--) {
								$('.bigcj-avatarBox .avatarbox').eq(c).addClass('avatar_rotate');
								$('.bigcj-avatarBox .avatarbox').eq(c).css('animation-delay', ($('.bigcj-avatarBox .avatarbox').length - c) / 40 + 's')
							}
							screencore.bgmusicpause();
							if ($("#cjing").length) {
								$("#cjing").get(0).play();
							}
							self.luckerids = e.msg.luckerids;
							if (bigcj.isroundcj == '1') {
								var roundluckerRender = template('roundlucker-item'), luckhtml = '';
								$.each(e.msg.list, function (i, l) {
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
								$(".bigcj-popBox .lottery-roundluckerbox .roundlucker-lists").html(luckhtml);
								$(".bigcj-popBox .lottery-roundluckerbox .roundtitle").html(self.prizeInfo[roundIndex].roundtitle || '');
							} else {
								var outluckerRender = template('outlucker-tpl');
								var html = '';
								var popnum = 0;
								if (e.msg.list.length > 0 && e.msg.list.length < 3) {
									popnum = 1;
								} else if (e.msg.list.length > 2 && e.msg.list.length < 9) {
									popnum = 2;
								} else if (e.msg.list.length > 8 && e.msg.list.length < 13) {
									popnum = 3;
								}
								var isspe = '2';
								if (XCV3Config.rhdid == '-1') {
									isspe = '1';
								}
								var sehtml = '', thrhtml = '';
								$.each(e.msg.list, function (i, v) {
									var nickname = '';
									if (v.showitems.length > 0) {
										var bdval = '';
										$.each(v.showitems, function (index, val) {
											bdval += '<div>' + self.hideRealname(val) + '</div>';
										});
										nickname += bdval;
									} else {
										nickname += '<div>' + v.nickname + '</div>';
									}
									v.nickname = nickname;
									v.popnum = popnum;
									if (isspe == '1') {
										if (i == 0) {
											html += `<ul style="height:auto">${outluckerRender(v)}</ul>`;
										} else if (i < 4) {
											sehtml += outluckerRender(v);
										} else {
											thrhtml += outluckerRender(v);
										}
									} else {
										html += outluckerRender(v);
									}

								});
								if (sehtml) {
									html += `<ul style="height:auto">${sehtml}</ul>`;
								}
								if (thrhtml) {
									html += `<ul style="height:auto">${thrhtml}</ul>`;
								}
								$(".bigcj-popBox ul").html(html);
							}
							setTimeout(function () {
								$this.text(lotterytxts.stop).removeClass('isining');
							}, 3e3);
						} else {
							$this.text(lotterytxts.start).removeClass('isining');
							layerBox.showMsg(e.msg);
						}
					}, function () {
						$this.text(lotterytxts.start).removeClass('isining');
						layerBox.showMsg('网络异常，请重试');
					});
				} else if ($this.text() == lotterytxts.stop) {
					var popBoxprize = $(".bigcj-popBox-prize").find('span'), selprize = $(".bigcj-prizelist li.issel");
					popBoxprize.eq(0).text(selprize.text());
					popBoxprize.eq(1).text(selprize.attr("data-prizename"));
					bigcj.hideavatarwall == '1' && $(".bigcj-avatarBox").css({ 'opacity': '0' });
					if (bigcj.isroundcj == '1') {
						$(".bigcj-popBox").removeClass('hidden').addClass('bigcj-popBox-ani');
						var roundIndex = $(".lottery-roundlist li.issel").index(), style = self.prizeInfo[roundIndex].style || {};
						var width = $(".bigcj-popBox .lottery-roundluckerbox .roundlucker-lists").width() - 20, cols = style.rows || 8;
						$(".bigcj-popBox .prizelucklist ul li").css({
							width: (width / cols) + 'px',
						});
						$(".bigcj-popBox .prizelucklist ul li .avatar").css({
							width: ((width / cols) - 40) + 'px',
							height: ((width / cols) - 40) + 'px',
						});
						$(".bigcj-popBox .roundlucker-item .prizename").css({
							color: style.awardcolor || '#FF9800',
							"font-size": (style.awardsize || 18) + 'px'
						});
						$(".bigcj-popBox .prizelucklist ul li .nickname").css({
							color: style.namecolor || '#fff',
							"font-size": (style.namesize || 18) + 'px',
						});
						$(".bigcj-popBox .lottery-roundluckerbox .roundlucker-lists").scrollTop(0);
					} else {
						$(".bigcj-popBox").addClass('bigcj-popBox-ani');
					}
					$('.bigcj-avatarBox .avatarbox').removeClass('avatar_rotate');
					$('.bigcj-avatarBox .avatarbox').addClass('avatar_scale');
					for (var g = 0; g < $('.bigcj-avatarBox .avatarbox').length; g++) {
						(function (b) {
							setTimeout(function () {
								$('.bigcj-avatarBox .avatarbox').eq(b).removeClass('avatar_scale');
								$('.bigcj-avatarBox .avatarbox').eq(b).css('animation-delay', '0s');
								$('.bigcj-avatarBox .avatarbox').eq(b).addClass('avatar_shadow');
							}, 1e3 * parseFloat($('.bigcj-avatarBox .avatarbox').eq(b).css('animation-delay')) + 400)
						})(g);
					}
					$('.bigcj-mask1, .bigcj-mask2').addClass('maskclose');
					setTimeout(function () {
						$('.bigcj-mask1, .bigcj-mask2').width('50%'), $('.bigcj-mask1, .bigcj-mask2').removeClass('maskclose')
					}, 1e3);
					if ($("#cjing").length) {
						$("#cjing").get(0).pause();
					}
					if ($("#cjend").length) {
						$("#cjend").get(0).play();
					}
					$this.text(lotterytxts.start).hide();
					screencore.sendLuckerTpl({ luckerids: self.luckerids }, function () {
						self.luckerids = [];
					});
					if (isautoscroll == '1') {
						$(bigcj.isroundcj == '1' ? '.bigcj-popBox .roundlucker-lists' : '.bigcj-popBox .bigcj-popBox-ul').scrollTop(0);
						setTimeout(function () {
							self.initautoScroll(bigcj.isroundcj == '1' ? '.roundlucker-lists' : '.bigcj-popBox-ul');
						}, 2e3);
					}
				}
			});
			$(".bigcj-popBox .bigcj-popBox-close").on('click', function () {
				if (isautoscroll == '1') {
					if (bigcj.isroundcj == '2') {
						self.removeautoScroll('.bigcj-popBox .bigcj-popBox-ul');
						$('.bigcj-popBox .bigcj-popBox-ul').empty();
					} else {
						self.removeautoScroll('.bigcj-popBox .roundlucker-lists');
						$('.bigcj-popBox .roundlucker-lists').empty();
					}
				}
				if (bigcj.isroundcj == '1') {
					$(".bigcj-popBox").removeClass('bigcj-popBox-ani').addClass('hidden');
				} else {
					$(".bigcj-popBox").removeClass('bigcj-popBox-ani');
				}
				bigcj.hideavatarwall == '1' && $(".bigcj-avatarBox").css({ 'opacity': '1' });
				$('.start-btn').show();
				$(".bigcj-cubebox .bigcj-awardbox,.bigcj-cubebox .bigcj-cube,.bigcj-cubebox .bigcj-sex,.bigcj-cubebox .roundcj-box .roundcj-body,.bigcj-cubebox .roundcj-box .roundcj-footer .bigcj-setround,.roundcj-box .bigcj-joinbox").css({ "opacity": "1" });
				screencore.bgmusicplay();
			});
			$(".bigcj-prizeusers .bigcj-user-close").on('click', function () {
				if (isautoscroll == '1') {
					if (bigcj.isroundcj == '2') {
						self.removeautoScroll('.bigcj-user-list');
						$('.bigcj-user-list').empty();
					} else {
						self.removeautoScroll('.bigcj-prizeusers .roundlucker-lists');
						$('.bigcj-prizeusers .roundlucker-lists').empty();
					}
				}
				if (bigcj.isroundcj == '1') {
					$('.bigcj-prizeusers').addClass('hidden');
				} else {
					$('.bigcj-prizeusers').hide();
				}
			});
			$(".bigcj-set .bigcj-showlist").on('click', function () {
				if ($('.bigcj-popBox').is(':hidden')) {
					if ($('.bigcj-prizeusers').is(':hidden')) {
						var prizeid = $('.bigcj-prizename').attr('data-id');
						self.getprizelucker(prizeid, function () {
							$('.bigcj-prizeusers').show();
							anime({
								targets: '.bigcj-prizeusers',
								opacity: [0, 1],
								rotateX: [180, 0],
								easing: 'linear',
								duration: 1e3,
								complete: function (animation) {
									if (isautoscroll == '1') {
										setTimeout(function () {
											self.initautoScroll('.bigcj-user-list');
										}, 1e3);
									}
								}
							});

						});
					} else {
						$(".bigcj-prizeusers .bigcj-user-close").trigger('click')
					}
				}
			});
			$(".roundcj-footer .btn-allrecord").on('click', function () {
				if ($('.bigcj-popBox').is(':hidden')) {
					if ($('.bigcj-prizeusers').is(':hidden')) {
						var roundid = $('.lottery-roundname').attr('data-id');
						self.getroundprizelucker(roundid, function () {
							$('.bigcj-prizeusers').removeClass('hidden');
							anime({
								targets: '.bigcj-prizeusers',
								opacity: [0, 1],
								rotateX: [180, 0],
								easing: 'linear',
								duration: 1e3,
								complete: function () {
									if (isautoscroll == '1') {
										setTimeout(function () {
											self.initautoScroll('.bigcj-prizeusers .roundlucker-lists');
										}, 1e3);
									}
								}
							});

						});
					} else {
						$(".bigcj-prizeusers .bigcj-user-close").trigger('click')
					}
				}
			});
			//切换奖品
			$('.bigcj-prizename').on('click', function () {
				if ('show' == bigcj.arraowflag) {
					var b = 10 < bigcj.prizenum ? 10 : bigcj.prizenum;
					$(this).nextAll('.bigcj-prizelist').animate({
						height: 30 * b + 'px'
					}, 500), bigcj.arraowflag = 'hide', $('.bigcj-setarrow').css('transform', 'rotate(0deg)')
				} else {
					$(this).nextAll('.bigcj-prizelist').animate({
						height: 0
					}, 500);
					bigcj.arraowflag = 'show';
					$('.bigcj-setarrow').css('transform', 'rotate(180deg)');
				}
			});

			$(".bigcj-prizelist li").on('click', function () {
				$('.bigcj-prizename').text($(this).text());
				$('.bigcj-prizename').attr('data-id', $(this).attr('data-id'));
				$('.bigcj-cube div').css('background-image', 'url(' + $(this).attr('data-prizeimg') + ')');
				$('.bigcj-awardbox span').eq(0).text($(this).text());
				$('.bigcj-awardbox span').eq(1).text($(this).attr('data-prizename'));
				$('.bigcj-numbox input').val($(this).attr('data-onceout'));
				$(this).addClass('issel').siblings().removeClass('issel');
				$('.bigcj-prizelist').animate({ height: 0 }, 500);
				bigcj.arraowflag = 'show';
				$('.bigcj-setarrow').css('transform', 'rotate(180deg)');
			});
			$('.lottery-roundname').on('click', function () {
				if ('show' == bigcj.arraowflag) {
					var b = 10 < bigcj.prizenum ? 10 : bigcj.prizenum;
					$(this).nextAll('.lottery-roundlist').animate({
						height: 42 * b + 'px'
					}, 500), bigcj.arraowflag = 'hide', $('.lottery-setarrow').css('transform', 'rotate(0deg)')
				} else {
					$(this).nextAll('.lottery-roundlist').animate({
						height: 0
					}, 500);
					bigcj.arraowflag = 'show';
					$('.lottery-setarrow').css('transform', 'rotate(180deg)');
				}
			});
			$(".lottery-roundlist li").on('click', function () {
				var roundid = $(this).attr('data-id');
				$('.lottery-roundname').attr('data-id', roundid).text($(this).text());
				$(this).addClass('issel').siblings().removeClass('issel');
				$('.lottery-roundlist').animate({ height: 0 }, 500);
				bigcj.arrowflag = 'show';
				$('.lottery-setarrow').css('transform', 'rotate(180deg)');
				self.getroundprizes(roundid);
			});
			keyboardJS.bind('left', function (e) {
				if ($(".bigcj-cubebox .bigcj-sex").css("opacity") == '0') return;
				if (bigcj.isroundcj == '1') {
					var prevLi = $(".lottery-roundlist li.issel").prev();
					prevLi.length > 0 ? prevLi.trigger('click') : $(".lottery-roundlist li:last").trigger('click');
				} else {
					var prevLi = $(".bigcj-prizelist li.issel").prev();
					prevLi.length > 0 ? prevLi.trigger('click') : $(".bigcj-prizelist li:last").trigger('click');
					setTimeout(function () {
						if (!$('.bigcj-prizeusers').is(':hidden')) {
							self.getprizelucker($('.bigcj-prizename').attr('data-id'));
						}
					}, 5e2);
				}
			});
			keyboardJS.bind('right', function (e) {
				if ($(".bigcj-cubebox .bigcj-sex").css("opacity") == '0') return;
				if (bigcj.isroundcj == '1') {
					var nextLi = $(".lottery-roundlist li.issel").next();
					nextLi.length > 0 ? nextLi.trigger('click') : $(".lottery-roundlist li:first").trigger('click');
				} else {
					var nextLi = $(".bigcj-prizelist li.issel").next();
					nextLi.length > 0 ? nextLi.trigger('click') : $(".bigcj-prizelist li:first").trigger('click');
					setTimeout(function () {
						if (!$('.bigcj-prizeusers').is(':hidden')) {
							self.getprizelucker($('.bigcj-prizename').attr('data-id'));
						}
					}, 3e2);
				}
			});
			keyboardJS.bind('up', function (e) {
				if ($(".bigcj-cubebox .bigcj-sex").css("opacity") == '0') return;
				var nownum = parseInt($('.bigcj-numbox input').val());
				nownum = (nownum && nownum > 0) ? nownum + 1 : 1;
				$('.bigcj-numbox input').val(nownum);
			});
			keyboardJS.bind('down', function (e) {
				if ($(".bigcj-cubebox .bigcj-sex").css("opacity") == '0') return;
				var nownum = parseInt($('.bigcj-numbox input').val());
				nownum = (nownum && nownum > 2) ? nownum - 1 : 1;
				$('.bigcj-numbox input').val(nownum);
			});
			keyboardJS.bind('/', function (e) {
				layerBox.showConfirm('警告', '清空将删除当前' + (bigcj.isroundcj == '1' ? '轮次' : '奖品') + '的所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
					var url = bigcj.isroundcj == '1' ? '/screen/bigcj/delroundalllucker' : '/screen/bigcj/delalllucker';
					var ajaxdata = { gametype: XCV3Config.gametype };
					if (bigcj.isroundcj == '1') {
						ajaxdata.roundid = $('.lottery-roundname').attr('data-id');
					} else {
						ajaxdata.prizeid = $('.bigcj-prizename').attr('data-id');
					}
					screencore.ajaxSubmit(url, ajaxdata, '').then(function (e) {
						if (e.code == 0) {
							if (bigcj.isroundcj == '2') {
								self.getprizelucker(ajaxdata.prizeid);
							} else {
								$(".lottery-roundluckerbox .roundlucker-lists").empty();
							}
							layerBox.showMsg('清空成功');
						} else {
							layerBox.showMsg(e.msg);
						}
					});
				});
			});
			$(".bigcj-user-list").on('click', ".right-luckerdel", function () {
				var $this = $(this), recordid = $this.attr('data-id');
				layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/bigcj/dellucker', { recordid: recordid, gametype: XCV3Config.gametype }, '').then(function (e) {
						if (e.code == 0) {
							$this.parent().parent().remove();
							layerBox.showMsg('删除成功');
						} else {
							layerBox.showMsg(e.msg);
						}
					});
				});
			});
			keyboardJS.bind('space', function (e) {
				if ($('.bigcj-prizeusers').is(':hidden')) {
					if (!$('.start-btn').is(':hidden')) {
						$('.start-btn').trigger('click');
					} else {
						$(".bigcj-popBox .bigcj-popBox-close").trigger('click');
					}
				} else {
					$(".bigcj-prizeusers .bigcj-user-close").trigger('click')
				}
			});

			keyboardJS.bind('shift', function () {
				if (bigcj.isroundcj == '1') {
					$('.roundcj-footer .btn-allrecord').trigger('click');
				} else {
					$('.bigcj-set .bigcj-showlist').trigger('click');
				}
			});
		},
		getroundprizes: function (id) {
			var self = this;
			screencore.ajaxSubmit('/screen/bigcj/ajaxoneround', { roundid: id, gametype: XCV3Config.gametype }, '').then(function (e) {
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
		getroundprizelucker: function (roundid, func) {
			var self = this;
			screencore.ajaxSubmit('/screen/bigcj/ajaxroundlucker', { roundid: roundid, gametype: XCV3Config.gametype }, '').then(function (json) {
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
					var roundIndex = $(".lottery-roundlist li.issel").index(), style = self.prizeInfo[roundIndex].style || {};
					$(".bigcj-prizeusers .lottery-roundluckerbox .roundlucker-lists").html(luckhtml);
					var width = $(".bigcj-prizeusers .lottery-roundluckerbox .roundlucker-lists").width() - 20, cols = style.rows || 8;
					$(".bigcj-prizeusers .prizelucklist ul li").css({
						width: (width / cols) + 'px',
					});
					$(".bigcj-prizeusers .prizelucklist ul li .avatar").css({
						width: ((width / cols) - 40) + 'px',
						height: ((width / cols) - 40) + 'px',
					});
					$(".bigcj-prizeusers .roundlucker-item .prizename").css({
						color: (style.awardcolor || '#FF9800'),
						"font-size": (style.awardsize || 18) + 'px'
					});
					$(".bigcj-prizeusers .prizelucklist ul li .nickname").css({
						color: (style.namecolor || '#fff'),
						"font-size": (style.namesize || 18) + 'px',
					});
					$(".bigcj-prizeusers .lottery-roundluckerbox .roundtitle").html(self.prizeInfo[roundIndex].roundtitle || '');
					setTimeout(function () {
						$(".bigcj-prizeusers .lottery-roundluckerbox .roundlucker-lists").scrollTop(0)
					}, 1e2);

					func && func();
				}
			});
		},
		hideRealname: function (val) {
			var namelen = val.length || 1;
			if (XCV3Config.rhdid == '-0' && namelen < 11 && namelen > 1) {
				if (namelen == 2) {
					val = val.substring(0, 1) + '*';
				} else if (namelen == 3) {
					val = val.substring(0, 1) + '*' + val.substring(2);
				} else {
					val = val.substring(0, 2) + '*' + val.substring(3);
				}
			}
			return val;
		},
		getprizelucker: function (id, fn) {
			var self = this;
			screencore.ajaxSubmit('/screen/bigcj/ajaxlucker', { prizeid: id, gametype: XCV3Config.gametype }, '正在加载记录..').then(function (e) {
				if (e.code == 0) {
					var lucker = e.msg.list, luckerRender = template('lucker-tpl'), html = '';
					$.each(lucker, function (i, v) {
						var nickname = '';
						if (v.showitems.length > 0) {
							var bdval = '';
							$.each(v.showitems, function (index, val) {
								bdval += '<div>' + self.hideRealname(val) + '</div>';
							});
							nickname += bdval;
						} else {
							nickname += '<div>' + v.nickname + '</div>';
						}
						v.nickname = nickname;
						html += luckerRender(v);
					});
					$(".bigcj-prizeusers ul").html(html);
					$(".bigcj-prizeusers .bigcj-prize-name span").eq(0).text(e.msg.prizeinfo.awardname);
					$(".bigcj-prizeusers .bigcj-prize-name span").eq(1).text(Object.keys(lucker).length);
					$(".bigcj-prizeusers .bigcj-prize-awardname").text(e.msg.prizeinfo.prizename);
					fn && fn();
				} else {
					layerBox.showMsg(e.msg);
				}
			});
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
	};
	return screenbigcj;
});
