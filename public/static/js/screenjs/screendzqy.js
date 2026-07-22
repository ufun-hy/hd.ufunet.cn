define('screendzqy', ['screensocket', 'screencore', 'template', 'layerBox', 'zamnotice', 'fulldm', 'keyboard', 'html2canvas', 'velocity'], function (screensocket, screencore, template, layerBox, zamnotice, fulldm, keyboardJS, html2canvas) {
	var Fireworks = function () {
		var self = this;
		var rand = function (rMi, rMa) {
			return ~~((Math.random() * (rMa - rMi + 1)) + rMi);
		}
		var hitTest = function (x1, y1, w1, h1, x2, y2, w2, h2) {
			return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
		};
		window.requestAnimFrame = function () {
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
				function (a) {
					window.setTimeout(a, 1E3 / 60)
				}
		}();
		self.init = function () {
			self.canvas = $("#firecanvas")[0];
			self.canvas.width = self.cw = $(window).innerWidth();
			self.canvas.height = self.ch = $(window).innerHeight();
			self.particles = [];
			self.partCount = 150;
			self.fireworks = [];
			self.mx = self.cw / 2;
			self.my = self.ch / 2;
			self.currentHue = 30;
			self.partSpeed = 5;
			self.partSpeedVariance = 10;
			self.partWind = 50;
			self.partFriction = 5;
			self.partGravity = 1;
			self.hueMin = 0;
			self.hueMax = 360;
			self.fworkSpeed = 4;
			self.fworkAccel = 10;
			self.hueVariance = 30;
			self.flickerDensity = 25;
			self.showShockwave = true;
			self.showTarget = false;
			self.clearAlpha = 25;
			self.ctx = self.canvas.getContext('2d');
			self.ctx.lineCap = 'round';
			self.ctx.lineJoin = 'round';
			self.lineWidth = 1;
			self.bindEvents();
			self.canvasLoop();
			self.canvas.onselectstart = function () {
				return false;
			};
			self.starttimer = null;
		};
		self.createParticles = function (x, y, hue) {
			var countdown = self.partCount;
			while (countdown--) {
				var newParticle = {
					x: x,
					y: y,
					coordLast: [
						{
							x: x,
							y: y
						},
						{
							x: x,
							y: y
						},
						{
							x: x,
							y: y
						}
					],
					angle: rand(0, 360),
					speed: rand(((self.partSpeed - self.partSpeedVariance) <= 0) ? 1 : self.partSpeed - self.partSpeedVariance, (self.partSpeed + self.partSpeedVariance)),
					friction: 1 - self.partFriction / 100,
					gravity: self.partGravity / 2,
					hue: rand(hue - self.hueVariance, hue + self.hueVariance),
					brightness: rand(50, 80),
					alpha: rand(40, 100) / 100,
					decay: rand(10, 50) / 1000,
					wind: (rand(0, self.partWind) - (self.partWind / 2)) / 25,
					lineWidth: self.lineWidth
				};
				self.particles.push(newParticle);
			}
		};
		self.updateParticles = function () {
			var i = self.particles.length;
			while (i--) {
				var p = self.particles[i];
				var radians = p.angle * Math.PI / 180;
				var vx = Math.cos(radians) * p.speed;
				var vy = Math.sin(radians) * p.speed;
				p.speed *= p.friction;
				p.coordLast[2].x = p.coordLast[1].x;
				p.coordLast[2].y = p.coordLast[1].y;
				p.coordLast[1].x = p.coordLast[0].x;
				p.coordLast[1].y = p.coordLast[0].y;
				p.coordLast[0].x = p.x;
				p.coordLast[0].y = p.y;
				p.x += vx;
				p.y += vy;
				p.y += p.gravity;
				p.angle += p.wind;
				p.alpha -= p.decay;
				if (!hitTest(0, 0, self.cw, self.ch, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2) || p.alpha < .05) {
					self.particles.splice(i, 1);
				}
			};
		};
		self.drawParticles = function () {
			var i = self.particles.length;
			while (i--) {
				var p = self.particles[i];
				var coordRand = (rand(1, 3) - 1);
				self.ctx.beginPath();
				self.ctx.moveTo(Math.round(p.coordLast[coordRand].x), Math.round(p.coordLast[coordRand].y));
				self.ctx.lineTo(Math.round(p.x), Math.round(p.y));
				self.ctx.closePath();
				self.ctx.strokeStyle = 'hsla(' + p.hue + ', 100%, ' + p.brightness + '%, ' + p.alpha + ')';
				self.ctx.stroke();
				if (self.flickerDensity > 0) {
					var inverseDensity = 50 - self.flickerDensity;
					if (rand(0, inverseDensity) === inverseDensity) {
						self.ctx.beginPath();
						self.ctx.arc(Math.round(p.x), Math.round(p.y), rand(p.lineWidth, p.lineWidth + 3) / 2, 0, Math.PI * 2, false)
						self.ctx.closePath();
						var randAlpha = rand(50, 100) / 100;
						self.ctx.fillStyle = 'hsla(' + p.hue + ', 100%, ' + p.brightness + '%, ' + randAlpha + ')';
						self.ctx.fill();
					}
				}
			};
		};
		self.createFireworks = function (startX, startY, targetX, targetY) {
			var newFirework = {
				x: startX,
				y: startY,
				startX: startX,
				startY: startY,
				hitX: false,
				hitY: false,
				coordLast: [
					{
						x: startX,
						y: startY
					},
					{
						x: startX,
						y: startY
					},
					{
						x: startX,
						y: startY
					}
				],
				targetX: targetX,
				targetY: targetY,
				speed: self.fworkSpeed,
				angle: Math.atan2(targetY - startY, targetX - startX),
				shockwaveAngle: Math.atan2(targetY - startY, targetX - startX) + (90 * (Math.PI / 180)),
				acceleration: self.fworkAccel / 100,
				hue: self.currentHue,
				brightness: rand(50, 80),
				alpha: rand(50, 100) / 100,
				lineWidth: self.lineWidth
			};
			self.fireworks.push(newFirework);
		};
		self.updateFireworks = function () {
			var i = self.fireworks.length;
			while (i--) {
				var f = self.fireworks[i];
				self.ctx.lineWidth = f.lineWidth;
				vx = Math.cos(f.angle) * f.speed,
					vy = Math.sin(f.angle) * f.speed;
				f.speed *= 1 + f.acceleration;
				f.coordLast[2].x = f.coordLast[1].x;
				f.coordLast[2].y = f.coordLast[1].y;
				f.coordLast[1].x = f.coordLast[0].x;
				f.coordLast[1].y = f.coordLast[0].y;
				f.coordLast[0].x = f.x;
				f.coordLast[0].y = f.y;
				if (f.startX >= f.targetX) {
					if (f.x + vx <= f.targetX) {
						f.x = f.targetX;
						f.hitX = true;
					} else {
						f.x += vx;
					}
				} else {
					if (f.x + vx >= f.targetX) {
						f.x = f.targetX;
						f.hitX = true;
					} else {
						f.x += vx;
					}
				}
				if (f.startY >= f.targetY) {
					if (f.y + vy <= f.targetY) {
						f.y = f.targetY;
						f.hitY = true;
					} else {
						f.y += vy;
					}
				} else {
					if (f.y + vy >= f.targetY) {
						f.y = f.targetY;
						f.hitY = true;
					} else {
						f.y += vy;
					}
				}
				if (f.hitX && f.hitY) {
					self.createParticles(f.targetX, f.targetY, f.hue);
					self.fireworks.splice(i, 1);
				}
			};

		};
		self.drawFireworks = function () {
			var i = self.fireworks.length;
			self.ctx.globalCompositeOperation = 'lighter';
			while (i--) {
				var f = self.fireworks[i];
				self.ctx.lineWidth = f.lineWidth;
				var coordRand = (rand(1, 3) - 1);
				self.ctx.beginPath();
				self.ctx.moveTo(Math.round(f.coordLast[coordRand].x), Math.round(f.coordLast[coordRand].y));
				self.ctx.lineTo(Math.round(f.x), Math.round(f.y));
				self.ctx.closePath();
				self.ctx.strokeStyle = 'hsla(' + f.hue + ', 100%, ' + f.brightness + '%, ' + f.alpha + ')';
				self.ctx.stroke();
				if (self.showTarget) {
					self.ctx.save();
					self.ctx.beginPath();
					self.ctx.arc(Math.round(f.targetX), Math.round(f.targetY), rand(1, 8), 0, Math.PI * 2, false)
					self.ctx.closePath();
					self.ctx.lineWidth = 1;
					self.ctx.stroke();
					self.ctx.restore();
				}
				if (self.showShockwave) {
					self.ctx.save();
					self.ctx.translate(Math.round(f.x), Math.round(f.y));
					self.ctx.rotate(f.shockwaveAngle);
					self.ctx.beginPath();
					self.ctx.arc(0, 0, 1 * (f.speed / 5), 0, Math.PI, true);
					self.ctx.strokeStyle = 'hsla(' + f.hue + ', 100%, ' + f.brightness + '%, ' + rand(25, 60) / 100 + ')';
					self.ctx.lineWidth = f.lineWidth;
					self.ctx.stroke();
					self.ctx.restore();
				}
			};
		};
		self.bindEvents = function () {
			$(window).on('resize', function () {
				clearTimeout(self.timeout);
				self.timeout = setTimeout(function () {
					self.canvas.width = self.cw = $(window).innerWidth();
					self.canvas.height = self.ch = $(window).innerHeight();
					self.ctx.lineCap = 'round';
					self.ctx.lineJoin = 'round';
				}, 100);
			});
		}
		self.startfirework = function () {
			clearInterval(self.starttimer);
			self.starttimer = setInterval(function () {
				self.mx = rand(50, $(window).width() - 50);
				self.my = rand(50, self.ch - 300);
				self.currentHue = rand(self.hueMin, self.hueMax);
				self.createFireworks(self.mx, self.ch, self.mx, self.my);
				//$(".boom")[0].play();
			}, 4e2);
		},
			self.stopfirework = function () {
				if (self.starttimer != null) {
					clearInterval(self.starttimer);
					self.starttimer = null;
				}
			},
			self.clear = function () {
				self.particles = [];
				self.fireworks = [];
				self.ctx.clearRect(0, 0, self.cw, self.ch);
			};
		self.canvasLoop = function () {
			requestAnimFrame(self.canvasLoop, self.canvas);
			self.ctx.globalCompositeOperation = 'destination-out';
			self.ctx.fillStyle = 'rgba(0,0,0,' + self.clearAlpha / 100 + ')';
			self.ctx.fillRect(0, 0, self.cw, self.ch);
			self.updateFireworks();
			self.updateParticles();
			self.drawFireworks();
			self.drawParticles();
		};
		self.init();
	};
	var screendzqy = {
		roundtype: '2',
		clienttpl: null,
		img: null,
		maoconfig: {
			l: 20,
			radius: 0,
			has: [],
			arr: [],
			linemin: 20,
			linemax: 40,
			linepressure: 1,
			smoothness: 90,
		},
		devices: [],
		savedImgs: false,
		init: function (rotate) {
			var self = this;
			self.clienttpl = template('qyclient-tpl');
			if (rotate != '') {
				self.roundtype = rotate.roundtype;
				self.inithyImg(rotate.hyimg);
				self.initdevices(rotate.clients);
			} else {
				$(".loading-box").remove();
				$(".dzqy-mainbox .emptybox").removeClass('display-none');
			}
			self.bindEvent();
			self.initsocket();
			self.fireworks = new Fireworks();
		},
		inithyImg: function (img) {
			/*screencore.getBase64img(img,function(url){
				$(".dzqy-bg").attr("src",url);
				$(".loading-box").remove();
			});
			*/
			$(".dzqy-bg").attr("src", img);
			$(".loading-box").remove();
		},
		initdevices: function (devices) {
			var self = this, deviceBox = $(".dzqy-mainbox");
			self.img = $(".maoimg")[0];
			deviceBox.find(".dzqy_device").remove();
			self.devices = [];
			var dr = window.devicePixelRatio ? window.devicePixelRatio : 4;
			$.each(devices, function (i, v) {
				deviceBox.append(self.clienttpl(v));
				var acanvas = deviceBox.find(".device-" + v.id + " canvas");
				acanvas[0].height = v.cheight * dr;
				acanvas[0].width = v.cwidth * dr;
				var ctx = acanvas[0].getContext("2d");
				ctx.scale(dr, dr);
				self.devices['device-' + v.id] = {
					id: v.id,
					drawtype: v.drawtype,
					linewidth: v.linewidth,
					linecolor: v.linecolor,
					startp: null,
					scale: parseFloat(v.scaleval),
					canvas: acanvas[0],
					ctx: ctx,
					width: v.cwidth,
					height: v.cheight,
				};
				self.devices['device-' + v.id].followdevice = v.isfollowdraw == '1' ? 'device-' + v.followdeviceid : '0';
				self.devices['device-' + v.id].maoconfig = $.extend(self.maoconfig, { l: v.linewidth * 2, linemin: v.linewidth, linemax: v.linewidth * 2 });
			});
		},
		initsocket: function () {
			var self = this;
			var params = {};
			params.onmessage = function (data) {
				if (data.type == 'connected') {
					screensocket.isclose = false;
					screencore.connectsocket({ clientid: data.clientid, rotateid: rotateInfo.id || '0' });
				} else if (data.type == "gamelinked") {
					self.initcanvas(data);
				} else if (data.type == 'gamedata') {
					self.drawcanvas(data);
				} else if (data.type == 'clientrefresh' || data.type == 'clientclear') {
					for (var i in self.devices) {
						var v = self.devices[i];
						if (v.id == data.device || v.followdevice == 'device-' + data.device) {
							self.clear(i);
						}
					}
				} else if (data.type == 'clientshowreadyimg') {
					self.showclientreadyImg(data);
				}
			};
			screensocket.init(params);
		},
		bindEvent: function () {
			var self = this;
			keyboardJS.bind('space', function (e) {
				self.flyto();
			});
			//下一轮
			keyboardJS.bind('right', function (e) {
				if (self.roundtype == '2') return;
				screencore.ajaxSubmit('/screen/dzqy/nextround', { type: '1', rotateid: rotateInfo.id }).then(function (json) {
					if (json.code == 0) {
						window.location.reload();
					} else {
						zamnotice.showNotice('提示', json.msg, 2e3, false, 'info', 'info');
					}
				});
			});
			//上一轮
			keyboardJS.bind('left', function (e) {
				if (self.roundtype == '2') return;
				screencore.ajaxSubmit('/screen/dzqy/nextround', { type: '2', rotateid: rotateInfo.id }).then(function (json) {
					if (json.code == 0) {
						window.location.reload();
					} else {
						zamnotice.showNotice('提示', json.msg, 2e3, false, 'info', 'info');
					}
				});
			});
			keyboardJS.bind('enter', function (e) {
				var deviceBox = $(".dzqy-mainbox");
				setTimeout(function () {
					deviceBox.find("canvas").each(function (i, v) {
						self.savedrawimg($(this), $(this).parent().attr("data-deviceid"));
					});
					self.saveto();
				}, 100);
			})
			keyboardJS.bind('.', function (e) {
				if (self.fireworks.starttimer != null) {
					self.fireworks.stopfirework();
				} else {
					self.fireworks.startfirework();
				}
			});
		},
		initcanvas: function (data) {
			var self = this, obj = $(".dzqy-mainbox ." + data.device);
		},
		drawcanvas: function (data) {
			var self = this, isstart = parseInt(data.isstart);
			switch (isstart) {
				case 1:
					self.drawstart(data);
					break;
				case 2:
					self.drawmoving(data);
					break;
				case 3:
					self.drawend(data);
					break;
				case 4:
					for (var i in self.devices) {
						var v = self.devices[i];
						if (i == data.device || v.followdevice == data.device) {
							self.clear(i);
						}
					}
					break;
			}
		},
		drawstart: function (data) {
			var self = this, alldevices = self.devices;
			for (var i in alldevices) {
				var v = alldevices[i];
				if (i === data.device || v.followdevice === data.device) {
					if (v.drawtype == '1') {
						v.startp = data.point;
					} else {
						v.startp = data.point;
						v.maoconfig.arr.unshift(data.point);
						v.maoconfig.has = [];
					}
				}
			}
		},
		drawmoving: function (data) {
			var self = this, alldevices = self.devices;
			for (var i in alldevices) {
				var onedevice = alldevices[i];
				if (i === data.device || onedevice.followdevice === data.device) {
					var ctx = onedevice.ctx;
					var startp = onedevice.startp;
					var maoconfig = onedevice.maoconfig;
					var scale = onedevice.scale;
					var point = data.point;
					var bj = maoconfig.radius;
					var dis = 0;
					var time = 0;
					if (onedevice.drawtype == '1') {
						ctx.beginPath();
						ctx.lineCap = "round";
						ctx.moveTo(startp.x * onedevice.scale, startp.y * onedevice.scale);
						ctx.lineTo(point.x * onedevice.scale, point.y * onedevice.scale);
						ctx.closePath();
						ctx.strokeStyle = onedevice.linecolor;
						ctx.lineWidth = onedevice.linewidth * onedevice.scale;
						ctx.stroke();
						onedevice.startp = point;
					} else {
						maoconfig.has.unshift({ time: data.nowtime, dis: self.distance(startp, point) });
						for (var n = 0; n < maoconfig.has.length - 1; n++) {
							dis += maoconfig.has[n].dis;
							time += maoconfig.has[n].time - maoconfig.has[n + 1].time;
							if (dis > maoconfig.smoothness) {
								break;
							}
						}
						var newbj = Math.min(time / dis * maoconfig.linepressure + maoconfig.linemin, maoconfig.linemax) / 2;
						var len = Math.round(maoconfig.has[0].dis / 2) + 1;
						for (var i = 0; i < len; i++) {
							var x = startp.x + (point.x - startp.x) / len * i;
							var y = startp.y + (point.y - startp.y) / len * i;
							var r = bj + (newbj - bj) / len * i;
							ctx.beginPath();
							ctx.lineCap = "round";
							x = x - maoconfig.l / 2;
							y = y - maoconfig.l / 2;
							maoconfig.arr.unshift({ x, y });
							ctx.drawImage(self.img, x * scale, y * scale, maoconfig.l * scale, maoconfig.l * scale);
							maoconfig.l = maoconfig.l - 0.2;
							if (maoconfig.l < maoconfig.linemin) maoconfig.l = maoconfig.linemin;
						}
						onedevice.maoconfig.radius = newbj;
						onedevice.startp = point;
					}
				}
			}
		},
		drawend: function (data) {
			var self = this, alldevices = self.devices;
			for (var i in alldevices) {
				var onedevice = alldevices[i];
				if (onedevice.drawtype == '2') {
					if (i === data.device || onedevice.followdevice === data.device) {
						var maoconfig = onedevice.maoconfig;
						maoconfig.l = maoconfig.linemax;
						if (maoconfig.arr.length > 100) {
							for (var j = 0; j < 60; j++) {
								maoconfig.arr[j].x = maoconfig.arr[j].x - maoconfig.l / 4;
								maoconfig.arr[j].y = maoconfig.arr[j].y - maoconfig.l / 4;
								//onedevice.ctx.drawImage(self.img,maoconfig.arr[j].x * onedevice.scale,maoconfig.arr[j].y * onedevice.scale,maoconfig.l * onedevice.scale,maoconfig.l * onedevice.scale);
								maoconfig.l = maoconfig.l - onedevice.scale;
								if (maoconfig.l < maoconfig.linemin / 2) maoconfig.l = onedevice.linemin / 2;
							}
							onedevice.maoconfig.l = maoconfig.linemax;
							onedevice.maoconfig.arr = [];
						}
						if (maoconfig.arr.length == 1) {
							onedevice.maoconfig.arr = [];
						}
					}
				}
			}
		},
		distance: function (a, b) {
			var x = b.x - a.x, y = b.y - a.y;
			return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		},
		clear: function (device) {
			var self = this, onedevice = self.devices[device];
			if (onedevice) {
				onedevice.startp = null;
				onedevice.maoconfig = $.extend(self.maoconfig, { l: onedevice.linewidth * 2, linemin: onedevice.linewidth, linemax: onedevice.linewidth * 2 });
				onedevice.ctx.clearRect(0, 0, onedevice.width, onedevice.height);
			}
		},
		flyto: function () {
			var self = this, deviceBox = $(".dzqy-mainbox");
			deviceBox.find(".needfly").length > 0 && deviceBox.find(".needfly").each(function (i, v) {
				var $this = $(this);
				$this.velocity({
					top: $this.attr("data-flytop") + "px",
					left: $this.attr("data-flyleft") + "px",
				}, {
					duration: 1e3,
					easing: "swing",
					begin: function () {
						$this.find('canvas').addClass('flown').css({ "zoom": $this.attr("data-flyzoom") });
					}
				});
			});
		},
		savedrawimg: function (obj, deviceid) {
			var self = this;
			if (rotateInfo == "") return;
			var imgData = obj[0].toDataURL();
			screencore.ajaxSubmit('/screen/dzqy/savedrawimg', { rotateid: rotateInfo.id, deviceid: deviceid, imgData: imgData }).then(function (json) { });
		},
		saveto: function () {
			var self = this, dzqyBox = $(".dzqy-mainbox");
			if (rotateInfo == "") return;
			html2canvas(dzqyBox.get(0)).then(function (canvas) {
				screencore.ajaxSubmit('/screen/dzqy/savedrawimg', { rotateid: rotateInfo.id, imgData: canvas.toDataURL("image/png") }).then(function (json) {
					zamnotice.showNotice('提示', '签约图保存成功', 1e3, false, 'success', 'success');
				});
			});
		},
		showclientreadyImg: function (data) {
			var self = this, deviceBox = $(".dzqy-mainbox").find(".device-" + data.device);
			self.clear('device-' + data.device);
			deviceBox.find("canvas").addClass("display-none");
			deviceBox.find("img").removeClass("display-none");
		},
	};
	return screendzqy;
});
