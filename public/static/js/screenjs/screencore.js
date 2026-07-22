define('screencore', ['jquery', 'layerBox'], function ($, layerBox) {
	var screencore = {
		emotions: {
			"1": ["[微笑]", XCV3Config.staticurl + "images/wechat/emoji/1.png"],
			"2": ["[撇嘴]", XCV3Config.staticurl + "images/wechat/emoji/2.png"],
			"3": ["[色]", XCV3Config.staticurl + "images/wechat/emoji/3.png"],
			"4": ["[发呆]", XCV3Config.staticurl + "images/wechat/emoji/4.png"],
			"5": ["[得意]", XCV3Config.staticurl + "images/wechat/emoji/5.png"],
			"6": ["[流泪]", XCV3Config.staticurl + "images/wechat/emoji/6.png"],
			"7": ["[害羞]", XCV3Config.staticurl + "images/wechat/emoji/7.png"],
			"8": ["[闭嘴]", XCV3Config.staticurl + "images/wechat/emoji/8.png"],
			"9": ["[睡]", XCV3Config.staticurl + "images/wechat/emoji/9.png"],
			"10": ["[大哭]", XCV3Config.staticurl + "images/wechat/emoji/10.png"],
			"11": ["[尴尬]", XCV3Config.staticurl + "images/wechat/emoji/11.png"],
			"12": ["[发怒]", XCV3Config.staticurl + "images/wechat/emoji/12.png"],
			"13": ["[调皮]", XCV3Config.staticurl + "images/wechat/emoji/13.png"],
			"14": ["[龇牙]", XCV3Config.staticurl + "images/wechat/emoji/14.png"],
			"15": ["[惊讶]", XCV3Config.staticurl + "images/wechat/emoji/15.png"],
			"16": ["[难过]", XCV3Config.staticurl + "images/wechat/emoji/16.png"],
			"17": ["[酷]", XCV3Config.staticurl + "images/wechat/emoji/17.png"],
			"18": ["[冷汗]", XCV3Config.staticurl + "images/wechat/emoji/18.png"],
			"19": ["[抓狂]", XCV3Config.staticurl + "images/wechat/emoji/19.png"],
			"20": ["[吐]", XCV3Config.staticurl + "images/wechat/emoji/20.png"],
			"21": ["[偷笑]", XCV3Config.staticurl + "images/wechat/emoji/21.png"],
			"22": ["[冷酷]", XCV3Config.staticurl + "images/wechat/emoji/22.png"],
			"23": ["[白眼]", XCV3Config.staticurl + "images/wechat/emoji/23.png"],
			"24": ["[傲慢]", XCV3Config.staticurl + "images/wechat/emoji/24.png"],
			"25": ["[饥饿]", XCV3Config.staticurl + "images/wechat/emoji/25.png"],
			"26": ["[困]", XCV3Config.staticurl + "images/wechat/emoji/26.png"],
			"27": ["[惊恐]", XCV3Config.staticurl + "images/wechat/emoji/27.png"],
			"28": ["[流汗]", XCV3Config.staticurl + "images/wechat/emoji/28.png"],
			"29": ["[憨笑]", XCV3Config.staticurl + "images/wechat/emoji/29.png"],
			"30": ["[大兵]", XCV3Config.staticurl + "images/wechat/emoji/30.png"],
			"31": ["[奋斗]", XCV3Config.staticurl + "images/wechat/emoji/31.png"],
			"32": ["[咒骂]", XCV3Config.staticurl + "images/wechat/emoji/32.png"],
			"33": ["[疑问]", XCV3Config.staticurl + "images/wechat/emoji/33.png"],
			"34": ["[嘘]", XCV3Config.staticurl + "images/wechat/emoji/34.png"],
			"35": ["[晕]", XCV3Config.staticurl + "images/wechat/emoji/35.png"],
			"36": ["[折磨]", XCV3Config.staticurl + "images/wechat/emoji/36.png"],
			"37": ["[哀]", XCV3Config.staticurl + "images/wechat/emoji/37.png"],
			"38": ["[骷髅]", XCV3Config.staticurl + "images/wechat/emoji/38.png"],
			"39": ["[敲打]", XCV3Config.staticurl + "images/wechat/emoji/39.png"],
			"40": ["[再见]", XCV3Config.staticurl + "images/wechat/emoji/40.png"],
			"41": ["[擦汗]", XCV3Config.staticurl + "images/wechat/emoji/41.png"],
			"42": ["[抠鼻]", XCV3Config.staticurl + "images/wechat/emoji/42.png"],
			"43": ["[鼓掌]", XCV3Config.staticurl + "images/wechat/emoji/43.png"],
			"44": ["[糗大了]", XCV3Config.staticurl + "images/wechat/emoji/44.png"],
			"45": ["[坏笑]", XCV3Config.staticurl + "images/wechat/emoji/45.png"],
			"46": ["[左哼哼]", XCV3Config.staticurl + "images/wechat/emoji/46.png"],
			"47": ["[右哼哼]", XCV3Config.staticurl + "images/wechat/emoji/47.png"],
			"48": ["[哈欠]", XCV3Config.staticurl + "images/wechat/emoji/48.png"],
			"49": ["[鄙视]", XCV3Config.staticurl + "images/wechat/emoji/49.png"],
			"50": ["[委屈]", XCV3Config.staticurl + "images/wechat/emoji/50.png"],
			"51": ["[快哭了]", XCV3Config.staticurl + "images/wechat/emoji/51.png"],
			"52": ["[阴险]", XCV3Config.staticurl + "images/wechat/emoji/52.png"],
			"53": ["[亲亲]", XCV3Config.staticurl + "images/wechat/emoji/53.png"],
			"54": ["[吓]", XCV3Config.staticurl + "images/wechat/emoji/54.png"],
			"55": ["[可怜]", XCV3Config.staticurl + "images/wechat/emoji/55.png"],
			"56": ["[菜刀]", XCV3Config.staticurl + "images/wechat/emoji/56.png"],
			"57": ["[西瓜]", XCV3Config.staticurl + "images/wechat/emoji/57.png"],
			"58": ["[啤酒]", XCV3Config.staticurl + "images/wechat/emoji/58.png"],
			"59": ["[篮球]", XCV3Config.staticurl + "images/wechat/emoji/59.png"],
			"60": ["[乒乓]", XCV3Config.staticurl + "images/wechat/emoji/60.png"],
			"61": ["[咖啡]", XCV3Config.staticurl + "images/wechat/emoji/61.png"],
			"62": ["[饭]", XCV3Config.staticurl + "images/wechat/emoji/62.png"],
			"63": ["[猪头]", XCV3Config.staticurl + "images/wechat/emoji/63.png"],
			"64": ["[玫瑰]", XCV3Config.staticurl + "images/wechat/emoji/64.png"],
			"65": ["[凋谢]", XCV3Config.staticurl + "images/wechat/emoji/65.png"],
			"66": ["[示爱]", XCV3Config.staticurl + "images/wechat/emoji/66.png"],
			"67": ["[爱心]", XCV3Config.staticurl + "images/wechat/emoji/67.png"],
			"68": ["[心碎]", XCV3Config.staticurl + "images/wechat/emoji/68.png"],
			"69": ["[蛋糕]", XCV3Config.staticurl + "images/wechat/emoji/69.png"],
			"70": ["[闪电]", XCV3Config.staticurl + "images/wechat/emoji/70.png"],
			"71": ["[炸弹]", XCV3Config.staticurl + "images/wechat/emoji/71.png"],
			"72": ["[刀]", XCV3Config.staticurl + "images/wechat/emoji/72.png"],
			"73": ["[足球]", XCV3Config.staticurl + "images/wechat/emoji/73.png"],
			"74": ["[瓢虫]", XCV3Config.staticurl + "images/wechat/emoji/74.png"],
			"75": ["[便便]", XCV3Config.staticurl + "images/wechat/emoji/75.png"],
			"76": ["[月亮]", XCV3Config.staticurl + "images/wechat/emoji/76.png"],
			"77": ["[太阳]", XCV3Config.staticurl + "images/wechat/emoji/77.png"],
			"78": ["[礼物]", XCV3Config.staticurl + "images/wechat/emoji/78.png"],
			"79": ["[拥抱]", XCV3Config.staticurl + "images/wechat/emoji/79.png"],
			"80": ["[强]", XCV3Config.staticurl + "images/wechat/emoji/80.png"],
			"81": ["[弱]", XCV3Config.staticurl + "images/wechat/emoji/81.png"],
			"82": ["[握手]", XCV3Config.staticurl + "images/wechat/emoji/82.png"],
			"83": ["[胜利]", XCV3Config.staticurl + "images/wechat/emoji/83.png"],
			"84": ["[抱拳]", XCV3Config.staticurl + "images/wechat/emoji/84.png"],
		},
		emotionDataIndexs: {
			"[微笑]": 1,
			"[撇嘴]": 2,
			"[色]": 3,
			"[发呆]": 4,
			"[得意]": 5,
			"[流泪]": 6,
			"[害羞]": 7,
			"[闭嘴]": 8,
			"[睡]": 9,
			"[大哭]": 10,
			"[尴尬]": 11,
			"[发怒]": 12,
			"[调皮]": 13,
			"[龇牙]": 14,
			"[惊讶]": 15,
			"[难过]": 16,
			"[酷]": 17,
			"[冷汗]": 18,
			"[抓狂]": 19,
			"[吐]": 20,
			"[偷笑]": 21,
			"[冷酷]": 22,
			"[白眼]": 23,
			"[傲慢]": 24,
			"[饥饿]": 25,
			"[困]": 26,
			"[惊恐]": 27,
			"[流汗]": 28,
			"[憨笑]": 29,
			"[大兵]": 30,
			"[奋斗]": 31,
			"[咒骂]": 32,
			"[疑问]": 33,
			"[嘘]": 34,
			"[晕]": 35,
			"[折磨]": 36,
			"[哀]": 37,
			"[骷髅]": 38,
			"[敲打]": 39,
			"[再见]": 40,
			"[擦汗]": 41,
			"[抠鼻]": 42,
			"[鼓掌]": 43,
			"[糗大了]": 44,
			"[坏笑]": 45,
			"[左哼哼]": 46,
			"[右哼哼]": 47,
			"[哈欠]": 48,
			"[鄙视]": 49,
			"[委屈]": 50,
			"[快哭了]": 51,
			"[阴险]": 52,
			"[亲亲]": 53,
			"[吓]": 54,
			"[可怜]": 55,
			"[菜刀]": 56,
			"[西瓜]": 57,
			"[啤酒]": 58,
			"[篮球]": 59,
			"[乒乓]": 60,
			"[咖啡]": 61,
			"[饭]": 62,
			"[猪头]": 63,
			"[玫瑰]": 64,
			"[凋谢]": 65,
			"[示爱]": 66,
			"[爱心]": 67,
			"[心碎]": 68,
			"[蛋糕]": 69,
			"[闪电]": 70,
			"[炸弹]": 71,
			"[刀]": 72,
			"[足球]": 73,
			"[瓢虫]": 74,
			"[便便]": 75,
			"[月亮]": 76,
			"[太阳]": 77,
			"[礼物]": 78,
			"[拥抱]": 79,
			"[强]": 80,
			"[弱]": 81,
			"[握手]": 82,
			"[胜利]": 83,
			"[抱拳]": 84
		},
		emoToimg: function (txt) {
			if (!txt) return '';
			var e = this;
			txt = txt.toString();
			var patternemoji = /\[[\u4e00-\u9fa5]+\]/g;
			return txt.replace(patternemoji, function (match) {
				if (e.emotionDataIndexs[match]) {
					return '<img src="' + e.emotions[e.emotionDataIndexs[match]][1] + '" class="faceImg" />'
				}
			})
		},
		getQueryString: function (key) {
			return this.getParas(key);
		},
		getParas: function (name) {
			var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
			if (result == null || result.length < 1) {
				return "";
			}
			return result[1];
		},
		ajaxSubmit: function (url, params, tips) {
			var self = this;
			if (typeof (tips) != "undefined") {
				var layindex = layerBox.showLoading(tips);
			}
			params.hdid = XCV3Config.hdid;
			//params.hdhash = XCV3Config.hdhash;
			var ajaxObj = $.Deferred();
			$.ajax({
				url: self.makeurl(url),
				type: 'post',
				data: params,
				dataType: 'json'
			}).then(function (json) {
				if (typeof (tips) != "undefined") {
					layerBox.close(layindex);
				}
				if (json.code == -100) {
					layerBox.showMsg('登录身份已经过期');
					window.location.reload();
				} else {
					ajaxObj.resolve(json);
				}
			}, function (json) {
				if (typeof (tips) != "undefined") {
					layerBox.close(layindex);
				}
				ajaxObj.reject(json);
			});
			return ajaxObj.promise();
		},
		makeurl: function (r, hdid) {
			return r;
		},
		anicssold: function (element, animationName, callback) {
			var e = this;
			var node = document.querySelector(element);
			animationName = animationName || e.anicssArr();
			node.classList.add('animated', animationName);
			function handleAnimationEnd() {
				node.classList.remove('animated', animationName)
				node.removeEventListener('animationend', handleAnimationEnd);
				if (typeof callback === 'function') callback();
			}
			node.addEventListener('webkitAnimationEnd animationend', handleAnimationEnd);
		},
		anicss: function (element, animationName, callback) {
			var e = this;
			if (!animationName) {
				animationName = e.anicssArr();
			}
			$(element).addClass('animated ' + animationName).one('animationend webkitAnimationEnd', function () {
				$(element).removeClass('animated ' + animationName);
				if (typeof callback === 'function') {
					callback();
				}
			});
			return $(element);
		},
		anicssArr: function () {
			var arr = ['bounceInDown', 'bounceInLeft', 'bounceInUp', 'bounceInRight'];
			var key = Math.floor(Math.random() * arr.length);
			return arr[key];
		},
		gameSendonline: function () {
			screencore.ajaxSubmit("/screen/common/getgameonline", { 'gametype': XCV3Config.gametype }).then(function (data) { });
		},
		gameTimererror: function () {
			layerBox.showConfirm('警告', '当前轮次计时器存在异常，需要重置才可以继续开始', ['重置本轮', '跳过本轮，进入下一轮'], function () {
				screencore.ajaxSubmit("/screen/common/gameerror", { 'gametype': XCV3Config.gametype }).then(function (data) { });
			}, function () {
				screencore.ajaxSubmit("/screen/common/gamedel", { 'gametype': XCV3Config.gametype }).then(function (data) { });
			});
		},
		gamerushwelcomeusers: function (obj) {
			var self = this, users = obj.users || false, isteam = obj.isteam, itemdoms = $(".welcome-users .welcome-user-item");
			$(".welcomeBox-nums span").text(obj.count || '0');
			if (users.length) {
				$.each(itemdoms, function (i, v) {
					var oneuser = users[i] || false;
					if (oneuser) {
						$(this).find(".welcome-user-img img").attr('src', oneuser.avatar || '');
						$(this).find(".welcome-user-name").html(oneuser.nickname || '');
						if (isteam == '1') {
							$(this).find(".welcome-user-count").removeClass('hidden').find('span').text(oneuser.count);
							$(this).removeClass('hidden');
						} else {
							$(this).find(".welcome-user-count").addClass('hidden');
						}
					} else {
						$(this).find("img").attr('src', defaultImg);
						$(this).find(".welcome-user-name").html(defaultName);
						if (isteam == '1') {
							$(this).find(".welcome-user-count").removeClass('hidden').find('span').text(oneuser.count);
							$(this).addClass('hidden');
						} else {
							$(this).find(".welcome-user-count").addClass('hidden');
						}
					}
				});
			} else {
				itemdoms.find(".welcome-user-img img").attr('src', defaultImg);
				itemdoms.find(".welcome-user-name").html(defaultName);
				if (isteam == '1') {
					$(this).find(".welcome-user-count").removeClass('hidden').find('span').text(0);
					itemdoms.addClass('hidden');
				} else {
					$(this).find(".welcome-user-count").addClass('hidden');
				}
			}
		},
		gameEndphb: function (list, num, groupconfig) {
			num = num || 10;
			var r = $(".rankBox"), o = $(".rank-others li"), oo = $(".rank-others2 li");
			for (var i = 0, j = list.length; i < j; i++) {
				if (i < 3) {
					if (i < num && list[i]) {
						var box = i == 0 ? r.find('.rank-item-first') : i == 1 ? r.find('.rank-item-second') : r.find('.rank-item-third');
						box.find('img').attr('src', list[i].avatar);
						box.find('p').text(list[i].nickname);
					}
				} else {
					if (i < num && list[i]) {
						if (i > 9) {
							oo.eq((i - 10)).find('img').attr('src', list[i].avatar);
							oo.eq((i - 10)).find('p span').text(list[i].nickname);
						} else {
							o.eq((i - 3)).find('img').attr('src', list[i].avatar);
							o.eq((i - 3)).find('p span').text(list[i].nickname);
						}
					}
				}
			}
			r.removeClass('display-none');
			if (num <= 3) {
				$(".rank-others").remove();
				num >= 1 && $(".rankfirst-second-third .rank-item-first").removeClass('opacity-hide').animateControl('bounceInDown');
				num >= 2 && $(".rankfirst-second-third .rank-item-second").removeClass('opacity-hide').animateControl('bounceInDown');
				num == 3 && $(".rankfirst-second-third .rank-item-third").removeClass('opacity-hide').animateControl('bounceInDown');
				setTimeout(function () {
					if (groupconfig) {
						//{open: '1', type: '2', sign: '2', pm: '1', analyse: '1'}
						if (groupconfig.hasOwnProperty('open')) {
							if (groupconfig.open == '1') {
								if (groupconfig.pm == '1') {
									$(".grouppm").removeClass('hidden');
								}
								if (groupconfig.analyse == '1') {
									$(".answerfx").removeClass('hidden');
								}
							}
						}
					}
					$('.rankBox-btns').removeClass('opacity-hide');
				}, 1e3);
			} else {
				if (num < 11) {
					$(".rank-others2").remove();
				}
				$(".rankfirst-second-third .rank-item").removeClass('opacity-hide');
				$('.rank-item-first').animateControl('bounceInDown');
				$('.rank-item-second').animateControl('bounceInDown');
				$('.rank-item-third').animateControl('bounceInDown');
				setTimeout(function () {
					if ($(".rank-others .rank-others-item:gt(" + (num - 4) + ")").length > 0) {
						$(".rank-others .rank-others-item:gt(" + (num - 4) + ")").remove();
					}
					$('.rank-others').removeClass('opacity-hide').animateControl('bounceInUp', function () {
						if (num > 10) {
							if ($(".rank-others2 .rank-others-item:gt(" + (num - 11) + ")").length > 0) {
								$(".rank-others2 .rank-others-item:gt(" + (num - 11) + ")").remove();
							}
							$('.rank-others2').removeClass('opacity-hide').animateControl('bounceInUp', function () {
								if (groupconfig) {
									//{open: '1', type: '2', sign: '2', pm: '1', analyse: '1'}
									if (groupconfig.hasOwnProperty('open')) {
										if (groupconfig.open == '1') {
											if (groupconfig.pm == '1') {
												$(".grouppm").removeClass('hidden');
											}
											if (groupconfig.analyse == '1') {
												$(".answerfx").removeClass('hidden');
											}
										}
									}
								}
								$('.rankBox-btns').removeClass('opacity-hide');
							});
						} else {
							if (groupconfig) {
								//{open: '1', type: '2', sign: '2', pm: '1', analyse: '1'}
								if (groupconfig.hasOwnProperty('open')) {
									if (groupconfig.open == '1') {
										if (groupconfig.pm == '1') {
											$(".grouppm").removeClass('hidden');
										}
										if (groupconfig.analyse == '1') {
											$(".answerfx").removeClass('hidden');
										}
									}
								}
							}
							$('.rankBox-btns').removeClass('opacity-hide');
						}
					});
				}, 6e2);
			}
		},
		timeTostring: function (time, type) {
			var type = type || '1';
			var now = new Date(time * 1000);
			var year = now.getFullYear();
			var month = now.getMonth() + 1;
			var date = now.getDate();
			var hour = now.getHours();
			var minute = now.getMinutes();
			var second = now.getSeconds();
			if (type == '1') {
				return (month < 10 ? '0' + month : month) + "-" + (date < 10 ? '0' + date : date) + "   " + (hour < 10 ? '0' + hour : hour) + ":" + (minute < 10 ? '0' + minute : minute) + ":" + (second < 10 ? '0' + second : second);
			} else {
				return year + '-' + (month < 10 ? '0' + month : month) + "-" + (date < 10 ? '0' + date : date) + "   " + (hour < 10 ? '0' + hour : hour) + ":" + (minute < 10 ? '0' + minute : minute) + ":" + (second < 10 ? '0' + second : second);
			}
		},
		videofullScreen: function (video, data, father) {
			if (data == null) return;
			father = father || window;
			var winW = $(father).width();
			var winH = $(father).height();
			var dir = winW / winH;
			if ((data.width / data.height) <= dir) {
				$(video).css({ width: winW, height: 'auto', left: 0, top: '50%', marginLeft: 0 });
				var h = winW / data.dir;
				$(video).css({ marginTop: h / -2 });
			} else {
				$(video).css({ height: winH, width: 'auto', top: 0, left: '50%', marginTop: 0 });
				var w = winH * data.dir;
				$(video).css({ marginLeft: w / -2 });
			}
		},
		getvideoData: function (video) {
			if ($(video).length > 0 && $(video).attr('dir')) {
				var dir = $(video).attr('dir');
				var videoW = $(video).attr('width');
				var videoH = $(video).attr('height');
				var time = $(video).attr('time');
			} else {
				video = video.length > 0 ? video[0] : video;
				var videoW = video.videoWidth;
				var videoH = video.videoHeight;
				var dir = videoW / videoH;
				var time = parseInt(video.duration);
			}
			return { dir: dir, width: videoW, height: videoH, time: time }
		},
		coundown: function (time, lg, draw, jgtime) {
			var jgtime = jgtime || false;
			var b = setInterval(function () {
				time = time - 1;
				if (time > 0) {//>0
					if (lg) {
						lg(time);
					}
				} else {
					clearInterval(b);
					if (draw) {
						draw()
					}
				}
			}, jgtime || 1e3);
		},
		fullScreen: function () {
			var el = document.documentElement;
			var rfs = el.requestFullScreen || el.webkitRequestFullScreen;
			if (typeof rfs != "undefined" && rfs) {
				rfs.call(el);
			} else if (typeof window.ActiveXObject != "undefined") {
				var wscript = new ActiveXObject("WScript.Shell");
				if (wscript != null) {
					wscript.SendKeys("{F11}");
				}
			} else if (el.msRequestFullscreen) {
				el.msRequestFullscreen();
			} else if (el.oRequestFullscreen) {
				el.oRequestFullscreen();
			} else {
				alert('浏览器不支持全屏,按F11键切换全屏');
			}
		},
		exitFullScreen: function () {
			var el = document;
			var cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.exitFullScreen;
			if (typeof cfs != "undefined" && cfs) {
				cfs.call(el);
			} else if (typeof window.ActiveXObject != "undefined") {
				var wscript = new ActiveXObject("WScript.Shell");
				if (wscript != null) {
					wscript.SendKeys("{F11}");
				}
			} else if (el.msExitFullscreen) {
				el.msExitFullscreen();
			} else if (el.oRequestFullscreen) {
				el.oCancelFullScreen();
			} else {
				alert('浏览器不支持全屏,按F12键切换全屏');
			}
		},
		randomInt: function (min, max) {
			min = Math.ceil(min);//函数返回大于或等于一个给定数字的最小整数。
			max = Math.floor(max);//返回小于或等于一个给定数字的最大整数。
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		setcookie: function (e, t, i) {
			expires = new Date,
				expires.setTime(expires.getTime() + 1e3 * i),
				document.cookie = XCV3Config.cookie.pre + e + "=" + escape(t) + "; expires=" + expires.toGMTString() + "; path=/"
		},
		objectToarray: function (o) {
			var arr = [];
			for (var i in o) {
				arr.push(o[i]);
			}
			return arr;
		},
		alert: function (obj) {
			if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
				obj = JSON.stringify(obj);
			}
			alert(obj);
		},
		sendLuckerTpl: function (objdata, func) {
			var self = this;
			objdata.gametype = XCV3Config.gametype;
			self.ajaxSubmit('/screen/common/sendluckeralert', objdata).then(function (data) {
				func && func(data);
			}, function () {
				console.log('发送通知出现异常');
			});
		},
		gameautocreate: function () {
			var self = this;
			self.ajaxSubmit('/screen/common/gameautocreate', { 'gametype': XCV3Config.gametype }).then(function (data) {
				if (data.code != 0) {
					layerBox.showMsg(data.msg);
				}
			}, function () {
				layerBox.showMsg('网络异常，操作失败');
			});
		},
		mediaUrl: function (url) {
			if (url == '') return url;
			var http = url.substr(0, 7).toLowerCase(), https = url.substr(0, 8).toLowerCase();
			if (http === "http://" || https === "https://") {
				return url;
			}
			return XCV3Config.attchurl + url;
		},
		getBase64img: function (src, fn) {
			var img = document.createElement('img');
			img.crossOrigin = '';
			img.src = src;
			img.onload = function () {
				var canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;
				var ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, img.width, img.height);
				fn(canvas.toDataURL());
			};
		},
		/*从数组中获取固定个数的随机值*/
		arrayrandom: function (arr, len) {
			var l = arr.length;
			if (l <= len) {
				len = l
			}
			var d = [];
			for (var e = 0; e < l; e++) {
				d[e] = e
			}
			d.sort(function () {
				return 0.5 - Math.random()
			});
			var c = [];
			for (e = 0; e < len; e++) {
				c.push(arr[d[e]])
			}
			return c;
		},
		/*从数组中删除某个元素 并返回该元素*/
		arrayremove: function (b, e, d) {
			var a = b.length;
			for (var c = 0; c < a; c++) {
				if (e == b[c][d]) {
					return b.splice(c, 1)[0]
				}
			}
			return null
		},
		/*移除全部*/
		arrayremoveall: function (a, d, c) {
			for (var b = 0; b < a.length; b++) {
				if (d == a[b][c]) {
					a.splice(b, 1);
					b--
				}
			}
		},
		/*从数组中查找某元素*/
		arraysearch: function (b, e, d) {
			var a = b.length;
			for (var c = 0; c < a; c++) {
				if (e == b[c][d]) {
					return b[c]
				}
			}
			return null;
		},
		/*获取数组元素对象中某值等于给定值的元素 数组集合*/
		arraybyvalue: function (c, g, f) {
			var d = []
				, b = c.length;
			for (var e = 0; e < b; e++) {
				if (c[e].hasOwnProperty(f) && g == c[e][f]) {
					d.push(c[e]);
				}
			}
			return d;
		},
		/*获取数组元素对象中不等于定值的元素 数组集合*/
		arraybynotvalue: function (c, g, f) {
			var d = []
				, b = c.length;
			for (var e = 0; e < b; e++) {
				if (c[e].hasOwnProperty(f) && g != c[e][f]) {
					d.push(c[e]);
				}
			}
			return d;
		},
		/*获取数组内最大值对应的键名*/
		arraygetMaxIndex: function (arr, key) {
			if (!$.isArray(arr)) {
				return -1;
			}
			if (arr.length == 0 || key == '') {
				return -1;
			}
			var max = arr[0][key];
			var index = 0;
			for (var i = 0; i < arr.length; i++) {
				if (max < arr[i][key]) {
					max = arr[i][key];
					index = i;
				}
			}
			return index;
		},
		/*
		* 获取最小值的下标
		*/
		arraygetMinIndex: function (arr, key) {
			if (!$.isArray(arr)) {
				return -1;
			}
			if (arr.length == 0 || key == '') {
				return -1;
			}
			var min = arr[0][key];
			var index = 0;
			for (var i = 0; i < arr.length; i++) {
				if (min > arr[i][key]) {
					min = arr[i][key];
					index = i;
				}
			}
			return index;
		},
		/*数组按某值排序 默认升序*/
		sortBy: function (attr, asc) {
			asc = asc || 1;
			return function (a, b) {
				a = a[attr];
				b = b[attr];
				if (a < b) {
					return asc * -1;
				}
				if (a > b) {
					return asc * 1;
				}
				return 0;
			}
		},
		hiddentxt: function (str, startLen, endLen, replaceword) {
			var len = str.length - startLen - endLen;
			var xing = '';
			replaceword = replaceword || '*';
			if (str.length <= 0 || len == 0) {
				return str;
			}
			if (len < 0) {
				startLen = 0;
				len = str.length - endLen;
			}
			for (var i = 0; i < len; i++) {
				xing += replaceword;
			}
			return str.substring(0, startLen) + xing + str.substring(str.length - endLen);
		},
		hideFootMenu: function () {
			var self = this, footercontrolbox = self.getdom('.footer-controlBox');
			if (!footercontrolbox.hasClass('down')) {
				footercontrolbox.trigger('mouseleave');
			}
		},
		/*开启游戏默认隐藏二维码但不写入到localstorage*/
		hideFootAndQr: function () {
			var self = this, hdQrbox = self.getdom('.hdQrbox');
			if (!hdQrbox.is(':hidden')) {
				if (XCV3Config.isiframe) {
					self.sendMsg2frame({ 'type': 'qrboxclose' });
				} else {
					$(".control-normal-list .openqr").trigger('click', ['1']);
				}
			}
			self.hideFootMenu();
		},
		sendMsg2frame: function (msg) {
			if (!XCV3Config.isiframe) return false;
			window.parent.postMessage({
				msg: msg
			}, '*');
		},
		getdom: function (nodeclass) {
			var obj = $(nodeclass);
			if (XCV3Config.isiframe) {
				obj = $(window.parent.document).find(nodeclass);
			}
			return obj;
		},
		bgmusicpause: function () {
			var self = this, bgmusicbtn = self.getdom('.openmusic'), bgmusic = $('#bgmusic');
			if (bgmusicbtn.length > 0 && bgmusic.length > 0 && bgmusicbtn.attr('data-open') == '1') {
				bgmusic.get(0).currentTime = 0;
				bgmusic.get(0).pause();
			}
		},
		bgmusicplay: function () {
			var self = this, bgmusicbtn = self.getdom('.openmusic'), bgmusic = $('#bgmusic');
			if (bgmusicbtn.length > 0 && bgmusic.length > 0 && bgmusicbtn.attr('data-open') == '1') {
				bgmusic.get(0).play();
			}
		},
		historyReplaceUrl: function (url) {
			//改变浏览内的地址但不刷新页面
			if (typeof (url) === 'undefined' || url == '') return false;
			if (XCV3Config.loadtype == '2') {
				history.replaceState('', '', url);
			}
		},
		connectsocket: function (data) {
			var self = this;
			data.module = XCV3Config.gametype;
			self.ajaxSubmit("/screen/common/binduid", data).then(function (data) {
				if (data.code != 0) {
					layerBox.showMsg(data.msg);
				}
			}, function () {
				layerBox.showMsg('网络太差链接socket服务失败，请稍后重试');
			});
		},
		is360: function () {
			var uas = navigator.userAgent.split(' '), result = false;
			// 排除ua自带标志的双核浏览器, 余下chrome,chromium及360浏览器
			if (uas[uas.length - 1].indexOf('Safari') == -1) {
				return result;
			}
			for (var key in navigator.plugins) {
				// np-mswmp.dll文件在chromium及chrome未查询到
				if (navigator.plugins[key].filename == 'np-mswmp.dll') {
					return !result;
				}
			}
			return result;
		},
		animatenum: function (targetnum, obj, totaltime) {
			var targetnum = targetnum || '100', targetobj = obj || $('.animateNum'), totaltime = totaltime || 1e3, i = targetnum.indexOf("."),
				e = 0;
			i >= 0 && (e = targetnum.length - i - 1);
			var n = targetnum.replace(".", ""),
				s = totaltime / 30 | 0,
				a = n / s | 0,
				r = 0,
				h = 0;
			timer = setInterval(function () {
				r++,
					h += a,
					targetobj.html(h / Math.pow(10, e)),
					r >= s && (clearInterval(timer), targetobj.html(targetnum));
			}, 30)
		},
		speakText: function (str) {
			// var url = "https://tts.baidu.com/text2audio?cuid=baike&lan=zh&ctp=1&pdt=301&vol=100&rate=32&tex=" + encodeURI(str);
			// var voiceContent = new Audio(url);
			// voiceContent.src = url;
			// voiceContent.play();
			if (!str) {
				return false;
			}
			var u = new SpeechSynthesisUtterance();
			u.text = str;
			u.lang = 'zh';
			//u.rate = 0.7;
			speechSynthesis.speak(u);
		},
	};
	return screencore;
});
