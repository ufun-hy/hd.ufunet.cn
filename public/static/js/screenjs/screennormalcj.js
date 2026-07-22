/*
* @Author: 赞木
* @Date:   2021-12-16 19:45:30
* @Last Modified by:   赞木
* @Last Modified time: 2022-12-05 11:26:01
*/
define('screennormalcj', ['screencore', 'layerBox', 'template', 'keyboard', 'threejs', 'tweenjs'], function (screencore, layerBox, template, keyboardJS, THREE, TWEEN) {
	THREE.CSS3DObject = function (element) { THREE.Object3D.call(this); this.element = element; this.element.style.position = "absolute"; this.addEventListener("removed", function (event) { if (this.element.parentNode !== null) { this.element.parentNode.removeChild(this.element) } }) }; THREE.CSS3DObject.prototype = Object.create(THREE.Object3D.prototype); THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject; THREE.CSS3DSprite = function (element) { THREE.CSS3DObject.call(this, element) }; THREE.CSS3DSprite.prototype = Object.create(THREE.CSS3DObject.prototype); THREE.CSS3DSprite.prototype.constructor = THREE.CSS3DSprite; THREE.CSS3DRenderer = function () { var _width, _height; var _widthHalf, _heightHalf; var matrix = new THREE.Matrix4(); var cache = { camera: { fov: 0, style: "" }, objects: {} }; var domElement = document.createElement("div"); domElement.style.overflow = "hidden"; domElement.style.WebkitTransformStyle = "preserve-3d"; domElement.style.MozTransformStyle = "preserve-3d"; domElement.style.oTransformStyle = "preserve-3d"; domElement.style.transformStyle = "preserve-3d"; this.domElement = domElement; var cameraElement = document.createElement("div"); cameraElement.style.WebkitTransformStyle = "preserve-3d"; cameraElement.style.MozTransformStyle = "preserve-3d"; cameraElement.style.oTransformStyle = "preserve-3d"; cameraElement.style.transformStyle = "preserve-3d"; domElement.appendChild(cameraElement); this.setClearColor = function () { }; this.getSize = function () { return { width: _width, height: _height } }; this.setSize = function (width, height) { _width = width; _height = height; _widthHalf = _width / 2; _heightHalf = _height / 2; domElement.style.width = width + "px"; domElement.style.height = height + "px"; cameraElement.style.width = width + "px"; cameraElement.style.height = height + "px" }; var epsilon = function (value) { return Math.abs(value) < Number.EPSILON ? 0 : value }; var getCameraCSSMatrix = function (matrix) { var elements = matrix.elements; return "matrix3d(" + epsilon(elements[0]) + "," + epsilon(-elements[1]) + "," + epsilon(elements[2]) + "," + epsilon(elements[3]) + "," + epsilon(elements[4]) + "," + epsilon(-elements[5]) + "," + epsilon(elements[6]) + "," + epsilon(elements[7]) + "," + epsilon(elements[8]) + "," + epsilon(-elements[9]) + "," + epsilon(elements[10]) + "," + epsilon(elements[11]) + "," + epsilon(elements[12]) + "," + epsilon(-elements[13]) + "," + epsilon(elements[14]) + "," + epsilon(elements[15]) + ")" }; var getObjectCSSMatrix = function (matrix) { var elements = matrix.elements; return "translate3d(-50%,-50%,0) matrix3d(" + epsilon(elements[0]) + "," + epsilon(elements[1]) + "," + epsilon(elements[2]) + "," + epsilon(elements[3]) + "," + epsilon(-elements[4]) + "," + epsilon(-elements[5]) + "," + epsilon(-elements[6]) + "," + epsilon(-elements[7]) + "," + epsilon(elements[8]) + "," + epsilon(elements[9]) + "," + epsilon(elements[10]) + "," + epsilon(elements[11]) + "," + epsilon(elements[12]) + "," + epsilon(elements[13]) + "," + epsilon(elements[14]) + "," + epsilon(elements[15]) + ")" }; var renderObject = function (object, camera) { if (object instanceof THREE.CSS3DObject) { var style; if (object instanceof THREE.CSS3DSprite) { matrix.copy(camera.matrixWorldInverse); matrix.transpose(); matrix.copyPosition(object.matrixWorld); matrix.scale(object.scale); matrix.elements[3] = 0; matrix.elements[7] = 0; matrix.elements[11] = 0; matrix.elements[15] = 1; style = getObjectCSSMatrix(matrix) } else { style = getObjectCSSMatrix(object.matrixWorld) } var element = object.element; var cachedStyle = cache.objects[object.id]; if (cachedStyle === undefined || cachedStyle !== style) { element.style.WebkitTransform = style; element.style.MozTransform = style; element.style.oTransform = style; element.style.transform = style; cache.objects[object.id] = style } if (element.parentNode !== cameraElement) { cameraElement.appendChild(element) } } for (var i = 0, l = object.children.length; i < l; i++) { renderObject(object.children[i], camera) } }; this.render = function (scene, camera) { var fov = 0.5 / Math.tan(THREE.Math.degToRad(camera.fov * 0.5)) * _height; if (cache.camera.fov !== fov) { domElement.style.WebkitPerspective = fov + "px"; domElement.style.MozPerspective = fov + "px"; domElement.style.oPerspective = fov + "px"; domElement.style.perspective = fov + "px"; cache.camera.fov = fov } scene.updateMatrixWorld(); if (camera.parent === null) { camera.updateMatrixWorld() } camera.matrixWorldInverse.getInverse(camera.matrixWorld); var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix(camera.matrixWorldInverse) + " translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)"; if (cache.camera.style !== style) { cameraElement.style.WebkitTransform = style; cameraElement.style.MozTransform = style; cameraElement.style.oTransform = style; cameraElement.style.transform = style; cache.camera.style = style } renderObject(scene, camera) } };
	var screennormalcj = {
		alluser: [],
		maxid: 0,
		prizeIndex: 0,
		prizeInfo: [],
		luckerids: [],
		isruning: false,
		isover: false,
		changetimer: null,
		showOneTimer: null,
		prizeRender: null,
		luckerUsers: [],
		init: function () {
			var self = this;
			self.prizeRender = template('roundprize-item');
			self.ajaxusers(function () {
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
					self.initroundinfo();
				} else {
					self.initprize();
				}

				self.createthreebox();
				self.bindevent();
				setTimeout(function () {
					self.getnewUser();
				}, 10e3);
			});
		},
		ajaxusers: function (fn) {
			var self = this;
			screencore.ajaxSubmit('/screen/normalcj/initdata', { gametype: XCV3Config.gametype }).then(function (json) {
				if (json.code == 0) {
					self.alluser = json.msg.list;
					if (self.alluser.length > 0) self.maxid = self.alluser[0].userid;
					$(".left-top-title span").text(json.msg.total);
					self.prizeInfo = json.msg.prizelist;
					if (self.prizeInfo.length > 0) {
						cjconfig.prizenum = self.prizeInfo.length;
						fn && fn();
					} else {
						$(".lottory-container").addClass('hidden');
						$(".lottery-mainbox .emptybox").removeClass('hidden');
					}
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		initprize: function () {
			var self = this, prizeOne = self.prizeInfo[self.prizeIndex];
			if (!prizeOne) return;
			$(".lottory-selectbox input").val(prizeOne.onceout);
			$(".lottory_award_box").attr('data-id', prizeOne.id)
			$(".lottory_award_box img").attr("src", prizeOne.prizeimg);
			$(".lottory_award_box div").text(prizeOne.prizename);
			$(".lottory-awardname").text(prizeOne.awardname);
			$("#container").hide();
			self.getprizelucker(prizeOne.id);
		},
		initroundinfo: function () {
			var self = this, isfirst = isfirst || false, roundOne = self.prizeInfo[self.prizeIndex];
			if (!roundOne) return;
			self.getroundprizes(roundOne.id);
		},
		getroundprizes: function (id) {
			var self = this;
			screencore.ajaxSubmit('/screen/normalcj/ajaxoneround', { roundid: id, gametype: XCV3Config.gametype }, '').then(function (e) {
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
		getnewUser: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/normalcj/getmoreuser', { maxid: self.maxid }).then(function (json) {
				if (json.code == 0) {
					$(".left-top-title span").text(json.msg.total);
					var newuser = json.msg.list, noavatars = $(".scene3d .defaultavatar");
					if (noavatars.length <= 0) {
						noavatars = $(".scene3d .element");
					}
					if (newuser.length > 0) {
						$.each(newuser, function (i, v) {
							if (noavatars.eq(i).length > 0) {
								noavatars.eq(i).find('img').attr('src', v.avatar);
								if (noavatars.eq(i).hasClass('defaultavatar')) noavatars.eq(i).attr('class', 'element');
							}
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
			$('.lottory-start-btn').on('click', function () {
				var $this = $(this);
				if (!$(".lottery-luckers").hasClass('hidden')) {
					return false;
				}
				if (cjconfig.isroundcj == '1') {
					if (self.prizeInfo.length <= 0) {
						return layerBox.showMsg('请到后台添加轮次');
					}
					var selprizeid = parseInt($('.lottery-roundlist li.issel').attr('data-id'));
					if (!selprizeid || selprizeid <= 0) return layerBox.showMsg('请选择轮次');
					var personnum = 0, roundawards = self.prizeInfo[self.prizeIndex].roundawards || [];
					$.each(roundawards, function (i, v) {
						personnum += parseInt(v.num);
					});
					if (personnum <= 0) {
						return layerBox.showMsg('轮次奖品抽取人数异常');
					}
				} else {
					var selprizeid = parseInt($('.lottory_award_box').attr('data-id'));
					if (!selprizeid || selprizeid <= 0) return layerBox.showMsg('请选择奖项');
					var personnum = parseInt($('.lottory-selectbox input').val());
					if (!personnum || personnum <= 0) return layerBox.showMsg('请设置抽取人数');
				}
				if (self.isruning) {
					return false;
				}
				self.isruning = true;
				$(".lottory-container").addClass('hidden');
				self.showscene();
				clearInterval(self.changetimer);
				self.changetimer = setInterval(function () {
					$('.element').eq(12).find('img').attr('src', self.alluser[Math.floor(Math.random() * self.alluser.length)].avatar);
					$('.element').eq(37).find('img').attr('src', self.alluser[Math.floor(Math.random() * self.alluser.length)].avatar);
					$('.element').eq(62).find('img').attr('src', self.alluser[Math.floor(Math.random() * self.alluser.length)].avatar);
					$('.element').eq(87).find('img').attr('src', self.alluser[Math.floor(Math.random() * self.alluser.length)].avatar);
					$('.element').eq(112).find('img').attr('src', self.alluser[Math.floor(Math.random() * self.alluser.length)].avatar);
				}, 100);
				screencore.bgmusicpause();
				if ($("#lotterymusic").length > 0) {
					$("#lotterymusic")[0].play();
				}
				screencore.ajaxSubmit('/screen/normalcj/savelucker', { gametype: XCV3Config.gametype, prizeid: selprizeid, selnum: personnum, isroundcj: cjconfig.isroundcj }).then(function (e) {
					if (e.code == 0) {
						screencore.hideFootAndQr();
						self.luckerids = e.msg.luckerids;
						if (cjconfig.isroundcj == '1') {
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
							$(".lottery-roundluckerbox .roundlucker-lists").html(luckhtml);
							var style = self.prizeInfo[self.prizeIndex].style || {};
							//$(".lottery-roundluckerbox .roundlucker-lists").html(luckhtml);
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
							$.each(e.msg.list, function (i, v) {
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
							});
						}
						self.luckerUsers = e.msg.list;
						setTimeout(function () {
							$('.lottory-stop-btn').removeClass('hidden');
						}, 2e3);
					} else {
						clearInterval(self.changetimer);
						layerBox.showMsg(e.msg);
						self.isruning = false;
						screencore.bgmusicplay();
						if ($("#lotterymusic").length > 0) {
							$("#lotterymusic")[0].pause();
						}
						self.hidescene();
						$(".lottory-container").removeClass('hidden');
					}
				});
			});
			$(".lottory-stop-btn").on('click', function () {
				if ($("#lotterymusic").length > 0) {
					$("#lotterymusic")[0].pause();
				}
				if (self.isover) {
					return;
				}
				clearInterval(self.changetimer);
				self.isover = true;
				if (cjconfig.isroundcj == '1') {
					$(".lottery-luckers").removeClass('hidden').addClass('lottery-popBox-ani');
					$(".lottery-roundluckerbox .roundlucker-lists").scrollTop(0);
					self.isruning = false;
					self.isover = false;
					if ($("#overmusic").length > 0) {
						$("#overmusic")[0].play();
					}
					screencore.sendLuckerTpl({ luckerids: self.luckerids }, function () {
						self.luckerids = [];
					});
					setTimeout(function () {
						screencore.bgmusicplay();
					}, 5e3);
				} else {
					if (self.luckerUsers.length <= 0) {
						layerBox.showMsg('出现异常，请刷新页面重试');
						return false;
					} else {
						clearInterval(self.showOneTimer);
						if (self.luckerUsers.length == 1) {
							self.showOne(self.luckerUsers[0]);
							self.isruning = false;
							self.isover = false;
							screencore.sendLuckerTpl({ luckerids: self.luckerids }, function () {
								self.luckerids = [];
							});
							setTimeout(function () {
								screencore.bgmusicplay();
							}, 5e3);
						} else {
							var llen = self.luckerUsers.length;
							if (oneshowtype == '1') {
								var showCount = 0, showseconds = oneanitime + 2e3;
								self.showOne(self.luckerUsers[showCount], self.luckerids[showCount]);
								self.showOneTimer = setInterval(function () {
									if ($("#overmusic").length > 0) {
										$("#overmusic")[0].currentTime = 0;
										$("#overmusic")[0].pause();
									}
									showCount++;
									if (showCount >= llen) {
										clearInterval(self.showOneTimer);
										self.luckerids = [];
										self.isruning = false;
										self.isover = false;
										return false;
									}
									self.showOne(self.luckerUsers[showCount], self.luckerids[showCount]);
									if (showCount >= (llen - 1)) {
										clearInterval(self.showOneTimer);
										self.luckerids = [];
										self.isruning = false;
										self.isover = false;
										setTimeout(function () {
											screencore.bgmusicplay();
										}, 5e3);

									}
								}, showseconds);
							} else {
								self.showTotal(self.luckerUsers);
								screencore.sendLuckerTpl({ luckerids: self.luckerids }, function () {
									self.luckerids = [];
								});
							}
						}
					}
				}
				$('.lottory-stop-btn').addClass('hidden');
				self.hidescene();
				if (cjconfig.isroundcj == '2') {
					$(".lottory-container").removeClass('hidden');
				}
			});
			$("body").on('click', '.lottory-close-btn', function () {
				self.hideTotal();
			});
			$("body").on('click', '.lottery-close-btn', function () {
				$(".lottery-luckers").removeClass('lottery-popBox-ani').addClass('hidden');
				$(".lottory-container").removeClass('hidden');
			});
			$(".prize_number .lottory-next-btn").on('click', function () {
				var leftBox = $(".lottery-left");
				self.prizeIndex++;
				if (self.prizeIndex >= self.prizeInfo.length) {
					self.prizeIndex = 0;
				}
				self.initprize();
			});
			$(".prize_number .lottory-prev-btn").on('click', function () {
				var leftBox = $(".lottery-left");
				self.prizeIndex--;
				if (self.prizeIndex < 0) {
					self.prizeIndex = self.prizeInfo.length - 1;
				}
				self.initprize();
			});
			$("#prize_decrement").on('click', function () {
				var denum = parseInt($(".lottory-selectbox input").val());
				if (denum > 1) {
					denum--;
				} else {
					denum = 1;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".lottory-reward-box .lottory-reward-people").length;
				if (cannums == 0) {
					denum = cannums;
				}
				$(".lottory-selectbox input").val(denum);
			});
			$("#prize_increment").on('click', function () {
				var denum = parseInt($(".lottory-selectbox input").val());
				denum++;
				if (denum >= self.prizeInfo[self.prizeIndex].prizenum) {
					denum = self.prizeInfo[self.prizeIndex].prizenum;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".lottory-reward-box .lottory-reward-people").length;
				if (denum >= cannums) {
					denum = cannums;
				}
				$(".lottory-selectbox input").val(denum);
			});
			$(".lottory-selectbox input").on('blur', function () {
				var denum = parseInt($(".lottory-selectbox input").val());
				if (!denum || denum == '') {
					denum = 1;
				}
				if (denum >= self.prizeInfo[self.prizeIndex].prizenum) {
					denum = self.prizeInfo[self.prizeIndex].prizenum;
				}
				var cannums = self.prizeInfo[self.prizeIndex].prizenum - $(".lottory-reward-box .lottory-reward-people").length;
				if (denum >= cannums) {
					denum = cannums;
				}
				$(".lottory-selectbox input").val(denum);
			});
			$(".lottory-reward-box").on('click', ".lottory-delbtn", function () {
				var $this = $(this), recordid = $this.parent().attr('data-id');
				layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/normalcj/dellucker', { recordid: recordid, prizeid: self.prizeInfo[self.prizeIndex].id, gametype: XCV3Config.gametype }, '').then(function (json) {
						if (json.code == 0) {
							$this.parent().remove();
							$(".lottory-right-box .lottory-title span").text(json.msg);
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
				if (cjconfig.isroundcj == '1') {
					if (!$(".lottery-luckers").hasClass('hidden')) {
						$(".lottery-close-btn").trigger('click');
					} else {
						if (!$('.lottory-stop-btn').is(":hidden")) {
							if (self.isover) {
								return;
							}
							$(".lottory-stop-btn").trigger('click');
						} else {
							if (self.isruning) {
								return;
							}
							$(".lottory-start-btn").trigger('click');
						}
					}
				} else {
					if (!$(".win-box").is(":hidden")) {
						self.hideTotal();
						return false;
					}
					if ($(".pop_3d").length > 0) {
						return;
					}
					if (!$('.lottory-stop-btn').is(":hidden")) {
						if (self.isover) {
							return;
						}
						$(".lottory-stop-btn").trigger('click');
					} else {
						if (self.isruning) {
							return;
						}
						$(".lottory-start-btn").trigger('click');
					}
				}
			});
			keyboardJS.bind('left', function (e) {
				if (self.isruning || self.isover) {
					return;
				}
				if (cjconfig.isroundcj == '1') {
					if ($(".lottery-wrapper").is(':hidden')) return;
					var prevLi = $(".lottery-roundlist li.issel").prev();
					prevLi.length > 0 ? prevLi.trigger('click') : $(".lottery-roundlist li:last").trigger('click');
				} else {
					$(".prize_number .lottory-prev-btn").trigger('click');
				}
			});
			keyboardJS.bind('/', function (e) {
				if ($(".pop_3d").length > 0) {
					return;
				}
				layerBox.showConfirm('警告', '清空将删除当前' + (cjconfig.isroundcj == '1' ? '轮次' : '奖品') + '的所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
					var url = cjconfig.isroundcj == '1' ? '/screen/normalcj/delroundalllucker' : '/screen/normalcj/delalllucker';
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
								if (!$(".lottery-luckers").is(':hidden')) {
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
			keyboardJS.bind('right', function (e) {
				if (self.isruning || self.isover) {
					return;
				}
				if (cjconfig.isroundcj == '1') {
					if ($(".lottery-wrapper").is(':hidden')) return;
					var nextLi = $(".lottery-roundlist li.issel").next();
					nextLi.length > 0 ? nextLi.trigger('click') : $(".lottery-roundlist li:first").trigger('click');
				} else {
					$(".prize_number .lottory-next-btn").trigger('click');
				}
			});
			keyboardJS.bind('up', function (e) {
				$("#prize_increment").trigger('click');
			});
			keyboardJS.bind('down', function (e) {
				$("#prize_decrement").trigger('click');
			});
			$(".roundcj-footer .btn-allrecord").on('click', function () {
				if ($('.lottery-luckers').is(':hidden')) {
					if ($("#container").is(":hidden") && $(".lottory-stop-btn").is(":hidden")) self.getroundprizelucker();
				} else {
					$(".lottery-close-btn").trigger('click');
				}
			});
			keyboardJS.bind('shift', function () {
				if ($('.roundcj-footer .btn-allrecord').length > 0) $('.roundcj-footer .btn-allrecord').trigger('click');
			});
		},
		getroundprizelucker: function (roundid) {
			var self = this, roundid = roundid || self.prizeInfo[self.prizeIndex].id;
			screencore.ajaxSubmit('/screen/normalcj/ajaxroundlucker', { roundid: roundid, gametype: XCV3Config.gametype }, '').then(function (json) {
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
					setTimeout(function () {
						$(".lottery-roundluckerbox .roundlucker-lists").scrollTop(0);
					}, 1e2);
				}
			});
		},
		showOne: function (oneUser, luckerid) {
			var self = this;
			$(".main-box").append(template('showone-tpl', oneUser));
			$(".pop_3d").removeClass('hidden').addClass('aniResult');
			if ($("#overmusic").length) {
				$("#overmusic")[0].play();
			}
			screencore.sendLuckerTpl({ luckerids: [luckerid] }, function () { });
			setTimeout(function () {
				$(".pop_3d .fireworks,.pop_3d .light,.pop_3d em,.pop_3d span,.lucker_nickname").css("display", "none");
				$(".pop_3d .pop_box,.pop_3d img").css({ width: 90, height: 90, "border-radius": "50%" });
				$(".pop_3d").css('background-color', 'transparent');
				$(".pop_3d").animate({
					left: $(".lottory-reward-box")[0].offsetLeft,
					top: $(".lottory-reward-box")[0].offsetTop + 10,
					width: 90,
					height: 90
				}, function () {
					$(".pop_3d").remove();
					self.prependUser(oneUser, '1');
				});
			}, oneanitime);
		},
		showTotal: function (lists) {
			var self = this, html = template('showtotal-tpl', { lists: lists.reverse() });
			$(".main-box").append(html);
			if ($("#overmusic").length) {
				$("#overmusic")[0].play();
			}
			$(".lottory_totalshow").removeClass('hidden');
			$(".lottory_totalshow ul").addClass('pop_zoomInDown');
			$(".win-box").removeClass('hidden').addClass('winMove');
			self.isruning = false;
			self.isover = false;
			setTimeout(function () {
				screencore.bgmusicplay();
			}, 5e3);
		},
		hideTotal: function () {
			var self = this;
			$(".lottory_totalshow .lottory-close-btn").css('display', 'none');
			$(".lottory_totalshow .lottory_selected ul").css('height', '100%')
			$(".lottory_totalshow").css('background-color', 'transparent');
			$(".lottory_totalshow").animate({
				left: $(".lottory-reward-box")[0].offsetLeft,
				top: $(".lottory-reward-box")[0].offsetTop,
				width: $(".lottory-reward-box").width(),
				height: $(".lottory-reward-box").height()
			}, function () {
				$(".lottory_totalshow").remove();
				$(".win-box").removeClass('winMove').addClass('hidden');
				self.prependUser(self.luckerUsers, '2');
				screencore.bgmusicplay();
			});
		},
		prependUser: function (userlist, status) {
			status = status || '1';
			var html = '';
			if (status == '1') {
				html += template('lucker-tpl', userlist);
			} else {
				$.each(userlist, function (i, v) {
					html += template('lucker-tpl', v);
				});
			}
			$(".lottory-reward-box").prepend(html);
			$(".lottory-right-box .lottory-title span").text($(".lottory-reward-box .lottory-reward-people").length);
		},
		getprizelucker: function (id, fn) {
			screencore.ajaxSubmit('/screen/normalcj/ajaxlucker', { prizeid: id, gametype: XCV3Config.gametype }, '正在加载中奖记录..').then(function (e) {
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
							nickname += '<div>' + v.nickname + '</div>';
						}
						v.nickname = nickname;
						html += luckerRender(v);
					});
					$(".lottory-reward-box").html(html);
					//$(".lottory-right-box .lottory-title span").eq(0).text(e.msg.prizeinfo.awardname);
					$(".lottory-right-box .lottory-title span").text(Object.keys(lucker).length);
					//$(".bigcj-prizeusers .bigcj-prize-awardname").text(e.msg.prizeinfo.prizename);
					fn && fn();
				} else {
					layerBox.showMsg(e.msg);
				}
			});
		},
		createthreebox: function () {
			var self = this;
			self.table = [];
			for (var i = 0; i < 120; i++) {
				self.table[i] = new Object();
				if (i < self.alluser.length) {
					self.table[i] = self.alluser[i];
				} else {
					self.table[i].avatar = self.alluser.length > 0 ? self.alluser[Math.floor(Math.random() * self.alluser.length)].avatar : defaultimg;
				}
				self.table[i].p_x = i % 20 + 1;
				self.table[i].p_y = Math.floor(i / 20) + 1;
			}
			//打乱数组顺序
			self.table = self.table.sort(function () {
				return Math.random()
			});
			$(function () {
				self.initscene();
				self.sceneanimate();
				$(".lottory-start-btn").removeClass('stopclick');
			});
		},
		showscene: function () {
			var self = this;
			self.scenetransform(self.targets.grid, 50, 'grid', 20000);
			$('#container').show();
		},
		hidescene: function () {
			TWEEN.removeAll();
			$('#container').hide();
		},
		initscene: function () {
			var self = this;
			self.oss = [];
			self.targets = { grid: [] };
			self.camera = new THREE.PerspectiveCamera(40, $(".full-main").width() / 800, 1, 100000);
			self.camera.position.z = 2800;
			self.scene = new THREE.Scene();
			for (var i = 0; i < self.table.length; i++) {
				var element = document.createElement('div');
				element.className = self.table[i].userid ? 'element' : 'element defaultavatar';
				var img = $('<img/>');
				img.attr({
					src: self.table[i].avatar,
					onerror: "onerrorimg(this)"
				});
				if (i == 12 || i == 37 || i == 62 || i == 87 || i == 112) {
					img.css({ "width": '300px', "height": '300px' });
				}
				element.appendChild(img[0]);
				var ott = new THREE.CSS3DObject(element);
				ott.position.x = ((i % 5) * 600) - 1200;
				ott.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800;
				ott.position.z = 200 - i * 60 * 1.5;
				self.scene.add(ott);
				self.oss.push(ott);
			}
			var vector = new THREE.Vector3();
			for (var i = 0, l = self.oss.length; i < l; i++) {
				var ott = new THREE.Object3D();
				ott.position.x = ((i % 5) * 600) - 1200;
				ott.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800;
				ott.position.z = 200 - i * 60 * 1.5;
				vector.x = ott.position.x;
				vector.y = ott.position.y;
				vector.z = ott.position.z;
				ott.lookAt(vector);
				self.targets.grid.push(ott);
			}
			self.renderer = new THREE.CSS3DRenderer();
			self.renderer.setSize($(".full-main").width(), 800);
			self.renderer.domElement.style.position = 'absolute';
			self.renderer.domElement.className = 'scene3d';
			document.getElementById('container').appendChild(self.renderer.domElement);
			window.addEventListener('resize', function () {
				self.camera.aspect = $(".full-main").width() / 800;
				self.camera.updateProjectionMatrix();
				self.renderer.setSize($(".full-main").width(), 800);
				self.scenerender();
			}, false);
		},
		scenetransform: function (shape, duration, style, time) {
			var self = this;
			TWEEN.removeAll();
			self.sceneinit();
			for (var i = 0; i < self.oss.length; i++) {
				var ott = self.oss[i];
				var target = shape[i];
				new TWEEN.Tween(ott.position)
					.to({ x: target.position.x, y: target.position.y, z: target.position.z }, duration)
					.easing(TWEEN.Easing.Exponential.InOut)
					.start();
				new TWEEN.Tween(ott.position)
					.to({ x: target.position.x, y: target.position.y, z: target.position.z }, 1000)
					.delay(195000)
					.start();
			}
			new TWEEN.Tween(this)
				.to({}, 1000000)
				.onUpdate(function () {
					self.scenerender(style);
				})
				.start();
		},
		sceneanimate: function () {
			var self = this;
			var draw = function () {
				window.requestAnimationFrame(draw);
				TWEEN.update();
			}
			draw();
		},
		sceneinit: function () {
			var self = this;
			self.scene.position.x = 0;
			self.scene.position.y = 0;
			self.scene.position.z = 0;
		},
		sceneupdate: function () {
			var self = this;
			for (var i = 0; i < self.oss.length; i++) {
				var ott = self.oss[i];
				ott.position.z += 180;
				if (ott.position.z > 800) {
					ott.position.z = 200 - (self.oss.length - 1) * 60 * 1.5;
				}
			}
		},
		scenerender: function (style) {
			var self = this;
			if (style == 'grid') {
				self.sceneupdate();
			}
			self.renderer.render(self.scene, self.camera);
		},
	};
	return screennormalcj;
});
