/*
* @Author: 赞木
* @Date:   2022-10-16 19:24:45
* @Last Modified by:   赞木
* @Last Modified time: 2023-06-28 17:41:48
*/
define('screenyuyuedj', ['jquery', 'template', 'screencore', 'layerBox', 'keyboard'], function ($, template, screencore, layerBox, keyboardJS) {
	var screenyuyuedj = {
		animateIndex: 0,
		loaded: false,
		maxid: 0,
		totalnums: 0,
		signRender: null,
		oldSign: [],
		signQueue: [],
		init: function () {
			var e = this;
			e.signRender = template('sign-tpl');
			e.getSignList();
			keyboardJS.bind('space', function (e) {
				$(".sign-mainbox .rightbox").toggle();
			});
		},
		isscroll: false,
		scrolltimer: null,
		flvplayertimer: 0,
		getSignList: function () {
			var e = this;
			screencore.ajaxSubmit("/screen/yuyuedj/index", {}).then(function (data) {
				if (data.code != 0) {
					return layerBox.showMsg(data.msg);
				}
				if (isdz == '2') {
					var ajaxscreenyuyuedj = data.msg.list;
					var signLength = ajaxscreenyuyuedj.length;
					var html = '';
					if (signLength > 0) {
						e.maxid = ajaxscreenyuyuedj[0].id;
						e.oldSign = ajaxscreenyuyuedj;
						for (var m = 0; m < signLength; m++) {
							html += e.signRender(ajaxscreenyuyuedj[m].bddata);
						};
					}
					$(".todaybox .bangperson span").html(data.msg.today.total);
					$(".todaybox .bangmoney span").html(data.msg.today.money);
					$(".totalbox .bangperson span").html(data.msg.total);
					$(".totalbox .bangmoney span").html(data.msg.money);
					$(".yuyue-body").html(html);
					$('.yuyue-body,.yuyue-body2').css({ transform: "translateY(0px)" });
					if (canroll == '1' && signLength >= 10) {
						e.isscroll = true;
						e.flvplayertimer = 0;
						$(".yuyue-body2").html(html);
						setTimeout(function () {
							e.loaded = true;
							e.scrolltimer = setInterval(function () {
								e.flvplayertimer -= 1;
								if (e.flvplayertimer == -($('.yuyue-body').height())) {
									e.flvplayertimer = 0;
								}
								$('.yuyue-body,.yuyue-body2').css({ transform: "translateY(" + e.flvplayertimer + "px)" });
							}, 50);
						}, 5e2);
					}
				} else {
					$(".bangperson span").html(data.msg.total || 0);
					$(".bangmoney span").html(data.msg.money || 0);
					var leftbang = $(".bang-left .yuyue-body"), rightbang = $(".bang-right .yuyue-body");
					var lefthtml = '', righthtml = '';
					$.each(data.msg.leftlist, function (i, v) {
						v.bddata.xuhao = i + 1;
						lefthtml += e.signRender(v.bddata);
					})
					leftbang.html(lefthtml);
					$.each(data.msg.rightlist, function (j, k) {
						k.bddata.xuhao = (isdz == '1' ? 50 : 10) + j + 1;
						righthtml += e.signRender(k.bddata);
					})
					rightbang.html(righthtml);
				}
				setInterval(function () {
					e.ajaxNewsign();
				}, 3e3);
			}, function () {
				layerBox.showMsg('加载出错');
			});
		},

		ajaxNewsign: function () {
			var e = this;
			screencore.ajaxSubmit("/screen/yuyuedj/newsign", { maxid: e.maxid }).then(function (data) {
				if (data.code != 0) {
					return layerBox.showMsg(data.msg);
				}
				if (isdz == '2') {
					var ajaxscreenyuyuedj = data.msg.list;
					var signLength = ajaxscreenyuyuedj.length;
					var html = '';
					if (signLength > 0) {
						e.maxid = ajaxscreenyuyuedj[0].id;
						for (var m = 0; m < signLength; m++) {
							html += e.signRender(ajaxscreenyuyuedj[m].bddata);
						};
					}
					$(".yuyue-body").html(html);
					if (canroll == '1') {
						if (!e.isscroll) {
							if (signLength >= 10) {
								$(".yuyue-body2").html(html);
								clearInterval(e.scrolltimer);
								e.isscroll = true;
								e.flvplayertimer = 0;
								e.scrolltimer = setInterval(function () {
									e.flvplayertimer -= 1;
									if (e.flvplayertimer == -($('.yuyue-body').height())) {
										e.flvplayertimer = 0;
									}
									$('.yuyue-body,.yuyue-body2').css({ transform: "translateY(" + e.flvplayertimer + "px)" });
								}, 50);
							} else {
								clearInterval(e.scrolltimer);
								e.isscroll = false;
								e.flvplayertimer = 0;
								$('.yuyue-body,.yuyue-body2').css({ transform: "translateY(0px)" });
								$('.yuyue-body2').empty();
							}
						} else {
							if (signLength >= 10) {
								$(".yuyue-body2").html(html);
							} else {
								clearInterval(e.scrolltimer);
								e.isscroll = false;
								e.flvplayertimer = 0;
								$('.yuyue-body,.yuyue-body2').css({ transform: "translateY(0px)" });
								$('.yuyue-body2').empty();
							}
						}
					}
					$(".todaybox .bangperson span").html(data.msg.today.total);
					$(".todaybox .bangmoney span").html(data.msg.today.money);
					$(".totalbox .bangperson span").html(data.msg.total);
					$(".totalbox .bangmoney span").html(data.msg.money);
				} else {
					$(".bangperson span").html(data.msg.total || 0);
					$(".bangmoney span").html(data.msg.money || 0);
					var leftbang = $(".bang-left .yuyue-body"), rightbang = $(".bang-right .yuyue-body");
					var lefthtml = '', righthtml = '';
					$.each(data.msg.leftlist, function (i, v) {
						v.bddata.xuhao = i + 1;
						lefthtml += e.signRender(v.bddata);
					})
					leftbang.html(lefthtml);
					$.each(data.msg.rightlist, function (j, k) {
						k.bddata.xuhao = (isdz == '1' ? 50 : 10) + j + 1;
						righthtml += e.signRender(k.bddata);
					})
					rightbang.html(righthtml);
				}
			}, function () {
				layerBox.showMsg('加载出错');
			});
		},
	};
	return screenyuyuedj;
});
