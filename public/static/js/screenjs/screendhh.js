/*
* @Author: 赞木
* @Date:   2022-12-11 09:09:53
* @Last Modified by:   赞木
* @Last Modified time: 2023-07-31 19:05:15
*/
define('screendhh', ['screencore', 'keyboard', 'layerBox', 'template', 'swiper', 'jquerytrans'], function (screencore, keyboardJS, layerBox, template, Swiper) {
	var mySwiper;
	var screendhh = {
		config: null,
		slidenum: 10,
		slidedelay: 6,
		init: function (config) {
			var self = this;
			self.config = config;
			self.slidenum = config.slidenum;
			self.slidedelay = config.slidedelay;
			self.bindevent();
			self.ajaxdata('1');
			setInterval(function () {
				self.ajaxdata();
			}, 3e3);
			if (self.config.reachconfig != '') {
				if (self.config.reachconfig.open == '1') {
					setInterval(function () {
						self.popshow();
					}, 1e3);
				}
			}
			screencore.sendMsg2frame({ 'type': 'dhhchangeurl', 'rotateid': self.config.rotateid || '0' });
		},
		bindevent: function () {
			var self = this, startbtn = $(".startstopbtn div"), rankbtn = $(".dhh-center .rankbtn");
			startbtn.attr('data-state', self.config.status);
			if (self.config.status == '1') {
				$(".startstopbtn div").removeClass('endstatus').addClass('startstatus');
			} else {
				$(".startstopbtn div").removeClass('startstatus').addClass('endstatus');
			}
			rankbtn.click(function () {
				var phbmode = $(this).attr('data-order') || '1', changemode = (phbmode == '1' ? '2' : '1');
				screencore.ajaxSubmit("/screen/dhh/changephbmode", { rotateid: self.config.rotateid, phbmode: changemode }, '正在切换模式...').then(function (json) {
					if (json.code != 0) {
						layerBox.showMsg(json.msg);
					} else {
						rankbtn.attr('data-order', changemode).find('span').text(changemode == '1' ? '默认模式' : '排行模式');
						self.ajaxdata('2', '1');
					}
				});
			})
			startbtn.on('click', function () {
				var state = $(this).attr('data-state');
				screencore.ajaxSubmit("/screen/dhh/changestate", { rotateid: self.config.rotateid, status: (state == '1' ? '2' : '1') }).then(function (data) {
					if (data.code != 0) {
						layerBox.showMsg(data.msg);
					} else {
						if (state == '1') {
							startbtn.attr('data-state', '2').removeClass('startstatus').addClass('endstatus');
						} else {
							startbtn.attr('data-state', '1').removeClass('endstatus').addClass('startstatus');
						}
					}
				});
			});
			keyboardJS.bind('space', function (e) {
				startbtn.trigger('click');
			});
			keyboardJS.bind('left', function (e) {
				layerBox.showConfirm('温馨提示', '确定要切换到上一轮么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit("/screen/dhh/changerotate", { rotateid: self.config.rotateid, type: '2' }).then(function (data) {
						if (data.code == 0) {
							window.location.href = data.msg;
						} else {
							layerBox.showMsg(data.msg);
						}
					});
				});
			});
			keyboardJS.bind('right', function (e) {
				layerBox.showConfirm('温馨提示', '确定要切换到下一轮么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit("/screen/dhh/changerotate", { rotateid: self.config.rotateid, type: '1' }).then(function (data) {
						if (data.code == 0) {
							window.location.href = data.msg;
						} else {
							layerBox.showMsg(data.msg);
						}
					});
				});
			});
			keyboardJS.bind('enter', function (e) {
				$('.dhh-mainbox').toggleClass('fullorderinfo');
			});
		},
		orderid: '0',
		orders: [],
		waitshowlist: [],
		ajaxdata: function (type, slidefirst) {
			var self = this, type = type || '2', slidefirst = slidefirst || '2';
			screencore.ajaxSubmit("/screen/dhh/ajaxrotatedata", { 'rotateid': self.config.rotateid, orderid: self.orderid }).then(function (json) {
				if (json.code == 0) {
					var goods = json.msg.goods, ranks = json.msg.ranks, rankhtml = '', orders = json.msg.orders, orderhtml = '', reachlists = json.msg.reachlists;
					//左侧用户排行榜
					$.each(ranks, function (i, v) {
						v.xuhao = i + 1;
						if (isdz == '3') {
							rankhtml += template('rank2-tpl', v);
						} else {
							if (isdz == '1') {
								if (XCV3Config.rhdid == '9379') {
									v.totalmoney = parseFloat(v.totalmoney).toFixed(1);
								} else if (XCV3Config.rhdid == '28822') {
									v.totalmoney = parseFloat(v.totalmoney / 10000).toFixed(1);
									if (v.totalmoney < 0.1) {
										v.totalmoney = 0;
									}
								} else {
									v.totalmoney = parseInt(v.totalmoney);
								}
							}
							rankhtml += template('rank-tpl', v);
						}
					});
					$(".left-phb ul").html(rankhtml);

					//右侧订单记录
					if (isdz == '1') {
						$.each(orders, function (i, v) {
							v.xuhao = i + 1;
							if (!v.totalnum) v.totalnum = 0;
							if (XCV3Config.rhdid == '9379') {
								v.totalnum = parseFloat(v.totalnum).toFixed(1);
							} else if (XCV3Config.rhdid == '28822') {
								v.totalnum = parseFloat(v.totalnum / 10000).toFixed(1);
								if (v.totalnum < 0.1) {
									v.totalnum = 0;
								}
							} else {
								v.totalnum = parseInt(v.totalnum);
							}
							orderhtml += template('group-tpl', v);
						});
						$(".right-list ul").html(orderhtml);
					} else if (isdz == '2') {
						if (orders.length > 0) {
							self.orderid = orders[0].id;
							self.appendorder(orders);
						}
					} else {
						$.each(orders, function (i, v) {
							v.xuhao = i + 1;
							orderhtml += template('rank2-tpl', v);
						});
						$(".right-list ul").html(orderhtml);
					}
					var goodshtml = '', goodslen = goods.length, goodstotalcount = 0, goodsphbmode = json.msg.goodsshowmode;
					$(".dhh-center .rankbtn").attr('data-order', goodsphbmode).find('span').text(goodsphbmode == '1' ? '默认模式' : '排行模式')
					//商品订货明细列表
					if (goodslen > 0 && isdz != '1') {
						$.each(goods, function (i, v) {
							goodstotalcount += v.topcount;
							v.goodsmoney = v.topmoney + self.config.priceunit;
							v.goodscount = v.topcount + v.goodsunit;
							v.height = 0;
							v.key = i + 1;
							if (json.msg.max > 0) {
								var percent = json.msg.percenttype == '1' ? (v.totalcount / json.msg.max) : (v.totalmoney / json.msg.max);
								v.height = (percent * 100);
							}
							goodshtml += template('goods-tpl', v);
						});
					}
					if (goodslen > self.slidenum) {
						$(".dhh-swiper-button").removeClass('display-none')
					} else {
						$(".dhh-swiper-button").addClass('display-none')
					}
					$(".cube-boxs").html(goodshtml).css("justify-content", goodslen <= self.slidenum ? 'space-around' : 'flex-start');
					if (type == '1') {
						mySwiper = new Swiper('.dhh-list-wrapper', {
							observer: true,
							observeParents: true,
							slidesPerView: self.slidenum,
							slidesPerGroup: self.slidenum,
							autoplay: {
								delay: self.slidedelay * 1e3,
								stopOnLastSlide: false,
								disableOnInteraction: false,
							},
							navigation: {
								nextEl: '.swiper-button-next',
								prevEl: '.swiper-button-prev',
							}
						});
					} else {
						if (slidefirst == '1' && mySwiper.activeIndex > 0) {
							mySwiper.slideTo(0);
						}
					}
					if (reachlists.length > 0) {
						var waitshowids = self.waitshowlist.map(v => { return v.id });
						$.each(reachlists, function (i, v) {
							var hadshow = window.localStorage.getItem('dhhpopshow' + v.id);
							if (hadshow === null && waitshowids.indexOf(v.id) == -1) {
								self.waitshowlist.push(v);
							}
						})
					}
					if (isdz == '1') {
						var totalmoney = json.msg.totalmoney;
						if (['28822', '36437'].includes(XCV3Config.rhdid)) {
							totalmoney = parseFloat(totalmoney / 10000).toFixed(1);
							if (totalmoney < 0.1) {
								totalmoney = 0;
							}
							$(".right-footer .totalnum").text(totalmoney + '万元');
						} else {
							//第一框显示金额
							totalmoney = parseFloat(totalmoney).toFixed(2);
							$(".right-footer .totalnum").text(totalmoney + '元');
						}

						//第二个框显示总吨数
						var totalweight = json.msg.totalweight;
						if (XCV3Config.rhdid != '36437') {
							totalweight = parseFloat(totalweight).toFixed(1);
						} else {
							totalweight = parseInt(totalweight);
						}
						$(".right-footer .totalmoney").text(totalweight + self.config.priceunit);
					} else {
						$(".right-footer .totalnum").text(json.msg.totalcount + '单');
						var totalmoney = json.msg.totalmoney;
						totalmoney = parseFloat(totalmoney).toFixed(2);
						$(".right-footer .totalmoney").text(totalmoney + self.config.priceunit);
					}
					$(".right-footer .totalcount").text(goodstotalcount + '台');
				}
			}, function () {
				layerBox.showMsg('网络太差，请稍后重试');
			});
		},
		ispop: false,
		popshow: function () {
			var self = this;
			if (!self.ispop && self.waitshowlist.length > 0) {
				self.ispop = true;
				var reachone = self.waitshowlist.shift();
				var hadshow = window.localStorage.getItem('dhhpopshow' + reachone.id);
				if (hadshow === null) {
					window.localStorage.setItem("dhhpopshow" + reachone.id, '1');
					setTimeout(function () {
						$(".poptip").html(reachone.poptxt);
						$(".dhh-popBox").removeClass('maskclose').addClass('maskopen');
						$(".dhhyanhuabox").removeClass('hidden');
						setTimeout(function () {
							$(".dhh-popBox").removeClass('maskopen').addClass('maskclose');
							$(".dhhyanhuabox").addClass('hidden');
							self.ispop = false;
						}, (self.config.reachconfig.seconds || 6) * 1e3);
					}, 1e2);
				} else {
					self.ispop = false;
				}
			}
		},
		maxlen: 20,
		appendorder: function (o) {
			var self = this, html = '';
			if (o.length > 0) {
				$.each(o, function (i, v) {
					html += template('order-tpl', v);
				});
			}
			$(".right-list ul").prepend(html);
			setTimeout(function () {
				var length = $(".right-list ul li").length;
				if (length > self.maxlen) {
					$(".right-list ul li:gt(" + (self.maxlen - 1) + ")").remove();
				}
			}, 1e3);
		},
	}
	return screendhh;
})