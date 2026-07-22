/*
* @Author: 赞木
* @Date:   2022-07-27 13:17:51
* @Last Modified by:   赞木
* @Last Modified time: 2022-12-05 11:27:40
*/
define('screenphotocj', ['screencore', 'layerBox', 'template', 'keyboard', 'anime', 'threejs', 'snabbt'], function (screencore, layerBox, template, keyboardJS, anime, THREE) {
	THREE.CSS3DObject = function (a) { THREE.Object3D.call(this); this.element = a; this.element.style.position = "absolute"; this.addEventListener("removed", function () { if (this.element.parentNode !== null) { this.element.parentNode.removeChild(this.element) } }) }; THREE.CSS3DObject.prototype = Object.create(THREE.Object3D.prototype); THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject; THREE.CSS3DSprite = function (a) { THREE.CSS3DObject.call(this, a) }; THREE.CSS3DSprite.prototype = Object.create(THREE.CSS3DObject.prototype); THREE.CSS3DSprite.prototype.constructor = THREE.CSS3DSprite; THREE.CSS3DRenderer = function () { console.log("THREE.CSS3DRenderer", THREE.REVISION); var d, g; var n, l; var m = new THREE.Matrix4(); var a = { camera: { fov: 0, style: "" }, objects: {} }; var i = document.createElement("div"); i.style.overflow = "hidden"; this.domElement = i; var j = document.createElement("div"); j.style.WebkitTransformStyle = "preserve-3d"; j.style.MozTransformStyle = "preserve-3d"; j.style.transformStyle = "preserve-3d"; i.appendChild(j); var c = /Trident/i.test(navigator.userAgent); this.setClearColor = function () { }; this.getSize = function () { return { width: d, height: g } }; this.setSize = function (q, p) { d = q; g = p; n = d / 2; l = g / 2; i.style.width = q + "px"; i.style.height = p + "px"; j.style.width = q + "px"; j.style.height = p + "px" }; function o(p) { return Math.abs(p) < 1e-10 ? 0 : p } function k(p) { var q = p.elements; return "matrix3d(" + o(q[0]) + "," + o(-q[1]) + "," + o(q[2]) + "," + o(q[3]) + "," + o(q[4]) + "," + o(-q[5]) + "," + o(q[6]) + "," + o(q[7]) + "," + o(q[8]) + "," + o(-q[9]) + "," + o(q[10]) + "," + o(q[11]) + "," + o(q[12]) + "," + o(-q[13]) + "," + o(q[14]) + "," + o(q[15]) + ")" } function f(p, s) { var q = p.elements; var r = "matrix3d(" + o(q[0]) + "," + o(q[1]) + "," + o(q[2]) + "," + o(q[3]) + "," + o(-q[4]) + "," + o(-q[5]) + "," + o(-q[6]) + "," + o(-q[7]) + "," + o(q[8]) + "," + o(q[9]) + "," + o(q[10]) + "," + o(q[11]) + "," + o(q[12]) + "," + o(q[13]) + "," + o(q[14]) + "," + o(q[15]) + ")"; if (c) { return "translate(-50%,-50%)translate(" + n + "px," + l + "px)" + s + r } return "translate(-50%,-50%)" + r } function b(q, v, w) { if (q instanceof THREE.CSS3DObject) { var u; if (q instanceof THREE.CSS3DSprite) { m.copy(v.matrixWorldInverse); m.transpose(); m.copyPosition(q.matrixWorld); m.scale(q.scale); m.elements[3] = 0; m.elements[7] = 0; m.elements[11] = 0; m.elements[15] = 1; u = f(m, w) } else { u = f(q.matrixWorld, w) } var s = q.element; var t = a.objects[q.id] && a.objects[q.id].style; if (t === undefined || t !== u) { s.style.WebkitTransform = u; s.style.MozTransform = u; s.style.transform = u; a.objects[q.id] = { style: u }; if (c) { a.objects[q.id].distanceToCameraSquared = e(v, q) } } if (s.parentNode !== j) { j.appendChild(s) } } for (var r = 0, p = q.children.length; r < p; r++) { b(q.children[r], v, w) } } var e = function () { var q = new THREE.Vector3(); var p = new THREE.Vector3(); return function (s, r) { q.setFromMatrixPosition(s.matrixWorld); p.setFromMatrixPosition(r.matrixWorld); return q.distanceToSquared(p) } }(); function h(r) { var p = Object.keys(a.objects).sort(function (t, s) { return a.objects[t].distanceToCameraSquared - a.objects[s].distanceToCameraSquared }); var q = p.length; r.traverse(function (t) { var s = p.indexOf(t.id + ""); if (s !== -1) { t.element.style.zIndex = q - s } }) } this.render = function (s, r) { var p = r.projectionMatrix.elements[5] * l; if (a.camera.fov !== p) { i.style.WebkitPerspective = p + "px"; i.style.MozPerspective = p + "px"; i.style.perspective = p + "px"; a.camera.fov = p } s.updateMatrixWorld(); if (r.parent === null) { r.updateMatrixWorld() } var t = "translateZ(" + p + "px)" + k(r.matrixWorldInverse); var q = t + "translate(" + n + "px," + l + "px)"; if (a.camera.style !== q && !c) { j.style.WebkitTransform = q; j.style.MozTransform = q; j.style.transform = q; a.camera.style = q } b(s, r, t); if (c) { h(s) } } };
	var screenphotocj = {
		photos: [],
		colnums: 6,
		linerows: 50,
		isstart: '1',
		rollduration: 60e3,
		fastrollduration: 10e3,
		imgmoveduration: 1e2,
		imgscalcduration: 4e2,
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
			self.initdata(function () {
				self.flytype = flytype || '1';
				self.initprize(true);
				self.bindevent();
				setTimeout(function () {
					self.getnewUser();
				}, 10e3);
			});
		},
		initdata: function (fn) {
			var self = this;
			screencore.ajaxSubmit('/screen/photocj/initdata', {}).then(function (json) {
				if (json.code == 0) {
					self.photos = json.msg.photos;
					if (self.photos.length > 0) {
						self.maxid = self.photos[0].photoid;
						self.photos = screencore.arrayrandom(self.photos, self.photos.length);
					}
					self.prizeInfo = json.msg.prizelist;
					if (self.prizeInfo.length > 0) {
						fn && fn();
					} else {
						$(".photocj-mainbox .emptybox").removeClass('hidden');
					}
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		initprize: function (isfirst) {
			isfirst = isfirst || false;
			var self = this, prizeOne = self.prizeInfo[self.prizeIndex];
			if (!prizeOne) return;
			//奖品信息
			$(".photocj-header .awardname").text(prizeOne.awardname);
			$(".photocj-header .prizename").text(prizeOne.prizename);
			$(".photocj-body img").attr('src', prizeOne.prizeimg);
			//底部参数
			$(".photocj-footer .active-prize").text(prizeOne.awardname).attr("data-prizeid", prizeOne.id);
			$(".select-box .onceout").val(prizeOne.onceout);
			self.initprizeandluckernum();
			$(".photocj-lists").removeClass('hidden');
			if (!isfirst) {
				self.initprizephotos(prizeOne.id);
			} else {
				if (self.flytype == '2') {
					$("body").append('<ul class="photocj-threebox hidden"></ul>');
					self.stageInit();
				} else {
					self.initphotos();
				}
			}
		},
		initprizeandluckernum: function (prizeid) {
			var self = this;
			prizeid = prizeid || self.prizeInfo[self.prizeIndex].id;
			screencore.ajaxSubmit('/screen/photocj/ajaxprizeluckernum', { prizeid: prizeid }).then(function (json) {
				if (json.code == 0) {
					$(".lucker-numbox .prize-num").text(json.msg.prizenum);
					$(".lucker-numbox .lucker-num").text(json.msg.luckernum);
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		initphotos: function () {
			var self = this;
			$(".photocj-wall ul").snabbt({ position: [0, 0, 0], rotation: [0, 0, 0], duration: 0 });
			for (var i = 0; i < self.colnums; i++) {
				self.makephotowall(i + 1);
			}
			$(".photocj-wall").removeClass('hidden');
		},
		initprizephotos: function (prizeid) {
			var self = this;
			screencore.ajaxSubmit('/screen/photocj/ajaxphotos', { prizeid: prizeid }).then(function (json) {
				if (json.code == 0) {
					self.photos = json.msg;
					if (self.photos.length > 0) {
						self.maxid = self.photos[0].photoid;
						self.photos = screencore.arrayrandom(self.photos, self.photos.length);
					} else {
						self.maxid = 0;
					}
					var index = 0;
					$(".photocj-wall .card").each(function (i, v) {
						var liobj = $(this), cardimg = self.photos[i] ? self.photos[i].filepath : '';
						if (cardimg == '') {
							liobj.find('.imgbox').addClass('waitbox');
							if (self.photos.length > 0) {
								liobj.find('.imgbox img').attr("src", self.photos[index].filepath).removeClass('hidden');
								index++;
								if (index >= self.photos.length) {
									index = 0;
								};
							} else {
								liobj.find('.imgbox img').attr("src", '').addClass('hidden');
							}
						} else {
							liobj.find('.imgbox').removeClass('waitbox');
							liobj.find('.imgbox img').attr("src", cardimg).removeClass('hidden');
						}
					});
				} else {
					layerBox.showMsg(json.msg);
				}
			});
		},
		makephotowall: function (col) {
			var self = this, index = 0;
			for (var j = 0; j < self.linerows; j++) {
				var photoindex = (col - 1) * self.linerows + j;
				var deg = 360 / self.linerows * j / 180 * Math.PI, radius = 1600, size = 200;
				var pos = {
					rotation: [0, 135 - deg, 0],
					position: [Math.sin(deg) * radius, (col - 3) * size, Math.cos(deg) * radius],
					duration: 0,
				};
				var photoimg = self.photos[photoindex] ? self.photos[photoindex].filepath : (self.photos[index] ? self.photos[index].filepath : false);
				var obj = self.makeonephoto(photoimg, self.photos[photoindex] ? false : true);
				obj.snabbt(pos);
				obj.appendTo($(".photocj-wall .avatarbox" + col));
				index++;
				if (index >= self.photos.length) {
					index = 0;
				};
			}
			self.photowallrotate(col);
			//self.photomove(col,(col%2==0?0:(self.linerows - 1)));
		},
		makeonephoto: function (avatar, iswaitbox) {
			iswaitbox = iswaitbox || false;
			var waitboxclass = '';
			if (iswaitbox) {
				waitboxclass = ' waitbox';
			}
			var img = '<img ' + (avatar ? '' : 'class="hidden"') + ' src =' + (avatar ? avatar : "") + '>';
			return $('<li class="card"><div class="imgbox zam-app-flex-ajCenter' + waitboxclass + '">' + img + '</div></li>');
		},
		photowallrotate: function (col, rollduration) {
			var self = this, deg = -Math.PI * 2, rollduration = rollduration || self.rollduration;
			if (col % 2 == 0) {
				deg = Math.PI * 2;
			}
			$(".photocj-wall .avatarbox" + col).snabbt({
				rotation: [0, 0, 0],
				duration: 0,
			}).snabbt({
				rotation: [0, deg, 0],
				duration: rollduration,
				complete: function () {
					self.photowallrotate(col, rollduration);
				}
			})
		},
		photomove: function (line, i) {
			var self = this, fromobj = $(".photocj-wall .avatarbox" + line + " li.card").eq(i), moveobj = $(".photocj-wall .avatarbox" + line + " .movecard" + line);
			if (moveobj.length == 0) {
				var moveobj = self.makeonephoto(fromobj.find('img').attr('src'));
				moveobj.removeClass('card').addClass('movecard' + line);
				moveobj.appendTo($(".photocj-wall .avatarbox" + line));
				var starttrans = $(".photocj-wall .avatarbox" + line + " li.card").eq(i).css('transform');
				moveobj.css("transform", starttrans);
			}
			if (line % 2 != 0) {
				if (i - 1 >= 0) {
					var toobj = $(".photocj-wall .avatarbox" + line + " li.card").eq(i - 1);
				} else {
					var toobj = $(".photocj-wall .avatarbox" + line + " li.card").eq(self.linerows - 1);
				}
			} else {
				if (i + 1 <= (self.linerows - 1)) {
					var toobj = $(".photocj-wall .avatarbox" + line + " li.card").eq(i + 1);
				} else {
					var toobj = $(".photocj-wall .avatarbox" + line + " li.card").eq(0);
				}
			}
			var toimg = toobj.find('img').attr('src');
			moveobj.css({
				"transform": toobj.css('transform'),
				"transition": "transform " + self.imgmoveduration + "ms",
			});
			setTimeout(function () {
				toobj.find('img').attr('src', moveobj.find('img').attr('src'));
				toobj.find('div').snabbt({ fromScale: [0.2, 0.2], fromOpacity: 0.2, scale: [1, 1], opacity: 1, duration: self.imgscalcduration });
				moveobj.find('img').attr('src', toimg);
				moveobj.find('div').snabbt({ fromScale: [0.8, 0.8], fromOpacity: 0.8, scale: [1, 1], opacity: 1, duration: self.imgscalcduration, });
				if (line % 2 != 0) {
					i--;
					if (i < 0) {
						i = self.linerows - 1;
					}
				} else {
					i++;
					if (i > (self.linerows - 1)) {
						i = 0;
					}
				}
				self.photomove(line, i);
			}, self.imgmoveduration);
		},
		boxfromtype: '2',
		total: 36,
		stageStop: true,
		speed: 100,
		cards: [],
		stageInit: function () {
			var self = this;
			self.speed = flyspeed;
			self.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
			self.camera.position.z = 2e3;
			self.scene = new THREE.Scene();
			var k = $(template('photo-item', { src: "" }));
			var r = Math.sqrt(self.total), n = Math.floor(r / 2)
			for (var i = 0; i < self.total; i++) {
				var a, l, s, o = Math.floor(i / r) % r, d = i % r;
				if (o == n && d == n) {
					continue;
				}
				s = k.clone();
				var photoone = self.photos[Math.floor((Math.random() * self.photos.length))] || false;
				if (photoone) {
					s.find('img').attr('src', photoone.filepath);
				}
				s.addClass('hidden');
				a = new THREE.CSS3DSprite(s[0]);
				if (self.boxfromtype == '1') {
					l = window.innerWidth / r;
					s = window.innerHeight / r;
					a.position.x = d * l - window.innerWidth / 2 + l / 2 + (d - 2) * (300 * (l / s));
					a.position.y = -1 * (o * s - window.innerHeight / 2 + s / 2) - 300 * (o - 2);
				} else {
					a.position.x = screencore.randomInt(-window.innerWidth / 2, window.innerWidth / 2);
					a.position.y = screencore.randomInt(-window.innerHeight / 2, window.innerHeight / 2);
				}
				a.position.z = -screencore.randomInt(7e3, 15e3);
				self.scene.add(a);
				self.cards.push(a);
			}
			self.renderer = new THREE.CSS3DRenderer();
			self.renderer.setSize(window.innerWidth, window.innerHeight);
			self.renderer.domElement.style.position = "absolute";
			$(".photocj-threebox")[0].appendChild(self.renderer.domElement);
			self.animate();
			$(window).resize(function () {
				self.camera.aspect = window.innerWidth / window.innerHeight;
				self.camera.updateProjectionMatrix();
				self.renderer.setSize(window.innerWidth, window.innerHeight);
			});
		},
		animate: function () {
			var self = this;
			requestAnimationFrame(function () {
				self.animate()
			});
			if (self.stageStop) return;

			var g = self.cards.length;
			for (var j = 0; j < g; j++) {
				var h = self.cards[j], s = $(h.element);
				h.position.z += self.speed;
				if (h.position.z > 2e3) {
					var photoone = self.photos[Math.floor((Math.random() * self.photos.length))] || false;
					if (photoone) {
						s.find('img').attr('src', photoone.filepath);
						h.position.z = -screencore.randomInt(7e3, 15e3);
						s.removeClass('hidden');
					} else {
						s.addClass('hidden');
					}
				}
			}
			self.renderer.render(self.scene, self.camera);
		},
		getnewUser: function () {
			var self = this;
			screencore.ajaxSubmit('/screen/photocj/getmoreuser', { prizeid: $(".active-prize").attr('data-prizeid'), maxid: self.maxid }).then(function (json) {
				if (json.code == 0) {
					var newphotos = json.msg;
					if (newphotos.length > 0) {
						$.each(newphotos, function (i, v) {
							self.photos.push(v);
							if ($(".photocj-wall .waitbox").length > 0) {
								$(".photocj-wall .waitbox").eq(0).removeClass('waitbox');
								$(".photocj-wall .waitbox").eq(0).find('img').attr("src", v.filepath).removeClass('hidden');
							} else {
								$(".photocj-wall li").eq(Math.floor(self.photos.length * Math.random())).find('img').attr("src", v.filepath).removeClass('hidden');
							}
						});
						self.maxid = newphotos[0].photoid;
						if (self.photos.length > 800) {
							self.photos.splice(0, (self.photos.length - 300));
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
			var self = this, clickstart = false;
			keyboardJS.bind('space', function (e) {
				$(".btn-start").trigger('click');
			});
			$(".btn-start").click(function () {
				var $this = $(this);
				if (self.isstart == '1') {
					if (clickstart) {
						return false;
					}
					clickstart = true;
					screencore.ajaxSubmit('/screen/photocj/savelucker', { prizeid: $(".active-prize").attr('data-prizeid'), onceout: $(".onceout").val() }).then(function (e) {
						if (e.code == 0) {
							var html = '';
							$.each(e.msg.list, function (i, v) {
								html += template("lucker-tpl", v);
							});
							$(".photocj-luckerbox-lists").html(html).removeClass('bigphoto1 bigphoto2');
							var num = e.msg.list.length;
							if (num > 0 && num < 3) {
								$(".photocj-luckerbox-lists").addClass('bigphoto1');
							} else if (num > 2 && num < 5) {
								$(".photocj-luckerbox-lists").addClass('bigphoto2');
							}
							screencore.hideFootAndQr();
							setTimeout(function () {
								if ($(".firevideo1").length) {
									$(".firevideo1").show();
									$(".firevideo1")[0].play();
									$(".firevideo1").unbind('ended').bind('ended', function () {
										$(this).hide();
									});
								}
							}, 50);
							$(".photocj-mainbox").removeClass('isdrawed').addClass('isdrawing');
							self.isstart = '2';
							if (self.flytype == '1') {
								for (var i = 0; i < self.colnums; i++) {
									self.photowallrotate(i + 1, self.fastrollduration);
								}
							} else {
								$(".photocj-threebox").removeClass('hidden');
								self.stageStop = false;
							}
							self.imgmoveduration = 5;
							self.imgscaleduration = 200;
							screencore.bgmusicpause();
							if ($("#cjingmusic").length > 0) {
								$("#cjingmusic")[0].play();
							}
							if (window.location.host == 'v3.h5cj.cn' && $.inArray(XCV3Config.rhdid, ['5579']) != -1) {
								setTimeout(function () {
									$this.text('停止');
									$(".lucker-numbox .prize-num").text(e.msg.lucker.prizenum);
									$(".lucker-numbox .lucker-num").text(e.msg.lucker.luckernum);
									$(".btn-start").trigger('click');
								}, 5e3);
							} else {
								setTimeout(function () {
									$this.text('停止');
									$(".lucker-numbox .prize-num").text(e.msg.lucker.prizenum);
									$(".lucker-numbox .lucker-num").text(e.msg.lucker.luckernum);
								}, 3e3);
							}
						} else {
							layerBox.showMsg(e.msg);
						}
						setTimeout(function () {
							clickstart = false;
						}, 1e3);

					}, function () {
						clickstart = false;
						layerBox.showMsg('出现异常，请稍后重试');
					})
				} else if (self.isstart == '2') {
					if ($this.text() == '开始') {
						return false;
					}
					if (self.flytype == '1') {
						for (var i = 0; i < self.colnums; i++) {
							self.photowallrotate(i + 1, self.rollduration);
						}
					} else {
						$(".photocj-threebox").addClass('hidden');
						self.stageStop = true;
					}
					self.imgmoveduration = 100;
					self.imgscaleduration = 400;
					$(".photocj-mainbox").removeClass('isdrawing').addClass('isdrawed');
					$this.text('关闭');
					if ($(".firevideo2").length) {
						$(".firevideo2").show();
						$(".firevideo2")[0].play();
						$(".firevideo2").unbind('ended').bind('ended', function () {
							$(this).hide();
						});
					}
					self.isstart = '3';
					if ($("#cjingmusic").length > 0) {
						$("#cjingmusic")[0].currentTime = 0;
						$("#cjingmusic")[0].pause();
					}
					if ($("#cjendmusic").length > 0) {
						$("#cjendmusic")[0].play();
					}
					if (isautoscroll == '1') {
						setTimeout(function () {
							self.initautoScroll('.photocj-luckerbox-content');
						}, 2e3);
					}
				} else if (self.isstart == '3') {
					if (isautoscroll == '1') {
						self.removeautoScroll('.photocj-luckerbox-content');
						setTimeout(function () {
							$(".photocj-mainbox").removeClass('isdrawed');
						}, 20);
					} else {
						$('.photocj-luckerbox-content').scrollTop(0);
						$(".photocj-mainbox").removeClass('isdrawed');
					}
					$this.text('开始');
					self.isstart = '1';
					if ($("#cjendmusic").length > 0) {
						$("#cjendmusic")[0].currentTime = 0;
						if (!$("#cjendmusic")[0].paused) {
							$("#cjendmusic")[0].pause();
						}
					}
					setTimeout(function () {
						screencore.bgmusicplay();
					}, 1e3);
				}
			});
			$(".photocj-luckerbox-lists").on('click', ".delphoto i", function () {
				var $this = $(this), recordid = $this.attr('data-id');
				layerBox.showConfirm('警告', '删除将无法恢复，确定要删除此中奖用户么?', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/photocj/dellucker', { recordid: recordid, prizeid: self.prizeInfo[self.prizeIndex].id }, '').then(function (json) {
						if (json.code == 0) {
							$this.parent().parent().parent().parent().remove();
							layerBox.showMsg('删除成功');
							self.initprizeandluckernum();
							var num = $(".photocj-luckerbox-lists li").length;
							$(".photocj-luckerbox-lists").removeClass('bigphoto1 bigphoto2');
							if (num > 0 && num < 3) {
								$(".photocj-luckerbox-lists").addClass('bigphoto1');
							} else if (num > 2 && num < 5) {
								$(".photocj-luckerbox-lists").addClass('bigphoto2');
							}
						} else {
							layerBox.showMsg(json.msg);
						}
					});
				});
			});
			var allluckerclicked = false;
			$(".btn-showalllucker").click(function () {
				var $this = $(this);
				if (self.isstart == '1') {
					if (allluckerclicked) return false;
					allluckerclicked = true;
					self.isstart = '4';
					self.getprizelucker(self.prizeInfo[self.prizeIndex].id, function (lucker) {
						var html = '';
						$.each(lucker, function (i, v) {
							html += template("lucker-tpl", v);
						});
						var bigclass = "bigphoto1", bigclass2 = "bigphoto2";;
						if (lucker.length < 3) {
							$(".photocj-luckerbox-lists").html(html).removeClass(bigclass2).addClass(bigclass);
						} else if (lucker.length > 2 && lucker.length < 5) {
							$(".photocj-luckerbox-lists").html(html).removeClass(bigclass).addClass(bigclass2);
						} else {
							$(".photocj-luckerbox-lists").html(html).removeClass(bigclass).removeClass(bigclass2);
						}
						$(".btn-start").addClass('hidden');
						$(".btn-close").removeClass('hidden');
						$(".photocj-mainbox").removeClass('isdrawing').addClass('isdrawed');
						allluckerclicked = false;
						if (isautoscroll == '1') {
							setTimeout(function () {
								self.initautoScroll('.photocj-luckerbox-content');
							}, 2e3);
						}
					}, function (errmsg) {
						self.isstart = '1';
						layerBox.showMsg(errmsg);
					});
				} else if (self.isstart == '4') {
					$(".btn-close").trigger('click');
				}
			});
			$(".btn-close").click(function () {
				self.isstart = '1';
				$(".btn-start").removeClass('hidden');
				if (isautoscroll == '1') {
					self.removeautoScroll('.photocj-luckerbox-content');
					setTimeout(function () {
						$(".photocj-mainbox").removeClass('isdrawed');
					}, 20);
				} else {
					$('.photocj-luckerbox-content').scrollTop(0);
					$(".photocj-mainbox").removeClass('isdrawed');
				}
				$(this).addClass('hidden');
			});
			keyboardJS.bind('/', function (e) {
				if (self.isstart == '2') return false;
				layerBox.showConfirm('警告', '清空将删除当前奖品的所有中奖用户，并且无法恢复，您确定要清空？', ['确定', '取消'], function () {
					screencore.ajaxSubmit('/screen/photocj/delalllucker', { prizeid: self.prizeInfo[self.prizeIndex].id }, '').then(function (e) {
						if (e.code == 0) {
							$(".photocj-luckerbox-lists li").remove();
							self.initprizeandluckernum();
							layerBox.showMsg('清空成功');
						} else {
							layerBox.showMsg(e.msg);
						}
					});
				});
			});
			//切换奖品
			$(".photocj-footer .prev-prize").click(function () {
				if (self.isstart != '1' || self.prizeInfo.length == 0) return false;
				self.prizeIndex--;
				if (self.prizeIndex < 0) {
					self.prizeIndex = self.prizeInfo.length - 1;
				}
				self.initprize();
			});
			$(".photocj-footer .next-prize").click(function () {
				if (self.isstart != '1' || self.prizeInfo.length == 0) return false;
				self.prizeIndex++;
				if (self.prizeIndex >= self.prizeInfo.length) {
					self.prizeIndex = 0;
				}
				self.initprize();
			});
			keyboardJS.bind('left', function (e) {
				$(".photocj-footer .prev-prize").trigger('click');
			});
			keyboardJS.bind('right', function (e) {
				$(".photocj-footer .next-prize").trigger('click');
			});
			keyboardJS.bind('up', function (e) {
				if (self.isstart != '1') return false;
				var denum = parseInt($(".onceout").val());
				denum++;
				if (denum >= self.prizeInfo[self.prizeIndex].prizenum) {
					denum = self.prizeInfo[self.prizeIndex].prizenum;
				}
				$(".onceout").val(denum);
			});
			keyboardJS.bind('down', function (e) {
				if (self.isstart != '1') return false;
				var denum = parseInt($(".onceout").val());
				if (denum > 1) {
					denum--;
				} else {
					denum = 1;
				}
				$(".onceout").val(denum);
			});
			keyboardJS.bind('shift', function (e) {
				$(".btn-showalllucker").trigger('click');
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
		getprizelucker: function (id, fn, fn2) {
			var self = this;
			screencore.ajaxSubmit('/screen/photocj/ajaxlucker', { prizeid: id }, '正在加载中奖记录..').then(function (e) {
				if (e.code == 0) {
					fn && fn(e.msg);
				} else {
					fn2 && fn2(e.msg);
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
				}
				self.animescrollobj = null;
			}
			self.startScrollY = 0;
			self.scrollReset = false;
			self.loopScrollcount = 1;
		},
	};
	return screenphotocj;
});
