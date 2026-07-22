define('dragqr', ['jquery', 'screencore'], function ($, screencore) {
	var dragqr = {
		qrBoxname: '',
		dragBox: null,
		minWidth: 150,
		minHeight: 190,
		zoom: 0,
		init: function (qrBoxname, resize) {
			var self = this, resize = resize || false;
			self.qrBoxname = qrBoxname;
			self.zoom = window.innerHeight / $(".full-main").height();
			self.dragBox = $('.' + self.qrBoxname);
			if (!self.dragBox.length) return;
			self.dragBox.mousedown(function (event) {
				event.preventDefault();
				var distanceX = event.clientX / self.zoom - self.dragBox[0].offsetLeft, distanceY = event.clientY / self.zoom - self.dragBox[0].offsetTop;
				$(document).bind('mousemove', function (ev) {
					var left = ev.clientX / self.zoom - distanceX, top = ev.clientY / self.zoom - distanceY;
					if (left < 0) {
						left = 0;
					}
					if (left > $(".full-main").width() - self.dragBox.width()) {
						left = $(".full-main").width() - self.dragBox.width();
					}
					if (top < 0) {
						top = 0;
					}
					if (top > $(".full-main").height() - self.dragBox.height()) {
						top = $(".full-main").height() - self.dragBox.height()
					}
					self.dragBox.css({ left: left + 'px', top: top + 'px' });
					window.localStorage.setItem(self.qrBoxname + "qrleft" + XCV3Config.hdid, left);
					window.localStorage.setItem(self.qrBoxname + "qrtop" + XCV3Config.hdid, top);
					window.localStorage.setItem(self.qrBoxname + "qrleftp" + XCV3Config.hdid, self.wpxtoper(left));
					window.localStorage.setItem(self.qrBoxname + "qrtopp" + XCV3Config.hdid, self.hpxtoper(top));
					window.localStorage.setItem(self.qrBoxname + "qrtype" + XCV3Config.hdid, '1');
				});
				$(document).bind('mouseup', function (ev) {
					$(document).unbind('mousemove');
				});
			});
			if (resize) {
				self.dragBox.find('span').each(function (k, v) {
					self.dragresize($(v));
				});
			}
			self.bindevent();
		},
		bindevent: function () {
			var self = this;
			self.dragBox.find('img').dblclick(function () {
				if (XCV3Config.gametype != 'baping') {
					var qrw = $(".full-main").height() > 800 ? (self.minWidth + 100) : self.minWidth, qrh = $(".full-main").height() > 800 ? (self.minHeight + 100) : self.minHeight;
					var pleft = (window.innerWidth / self.zoom / 2 + qrw), ptop = $(".full-main").height() > 800 ? 240 : 240;
					if (self.qrBoxname == 'hdQrbox2') {
						pleft = 200;
					}
					self.dragBox.css({ width: qrw + 'px', height: qrh + 'px', left: pleft + 'px', top: ptop + 'px', });
					window.localStorage.setItem(self.qrBoxname + "qrw" + XCV3Config.hdid, qrw);
					window.localStorage.setItem(self.qrBoxname + "qrh" + XCV3Config.hdid, qrh);
					window.localStorage.setItem(self.qrBoxname + "qrleft" + XCV3Config.hdid, pleft);
					window.localStorage.setItem(self.qrBoxname + "qrtop" + XCV3Config.hdid, ptop);
					window.localStorage.setItem(self.qrBoxname + "qrleftp" + XCV3Config.hdid, self.wpxtoper(pleft));
					window.localStorage.setItem(self.qrBoxname + "qrtopp" + XCV3Config.hdid, self.hpxtoper(ptop));
					window.localStorage.setItem(self.qrBoxname + "qrshowtype" + XCV3Config.hdid, '1');
					window.localStorage.setItem(self.qrBoxname + "qrtype" + XCV3Config.hdid, '1');
				} else {
					var rightboxshow = localStorage.getItem(XCV3Config.hdid + '_rightboxshow');
					if (rightboxshow == '0') {
						var qrw = $(".full-main").height() > 800 ? (self.minWidth + 100) : self.minWidth, qrh = $(".full-main").height() > 800 ? (self.minHeight + 100) : self.minHeight;
						var pleft = (window.innerWidth / self.zoom / 2 + qrw), ptop = $(".full-main").height() > 800 ? 240 : 240;
						if (self.qrBoxname == 'hdQrbox2') {
							pleft = 200;
						}
						self.dragBox.css({ width: qrw + 'px', height: qrh + 'px', left: pleft + 'px', top: ptop + 'px', });
						window.localStorage.setItem(self.qrBoxname + "qrw" + XCV3Config.hdid, qrw);
						window.localStorage.setItem(self.qrBoxname + "qrh" + XCV3Config.hdid, qrh);
						window.localStorage.setItem(self.qrBoxname + "qrleft" + XCV3Config.hdid, pleft);
						window.localStorage.setItem(self.qrBoxname + "qrtop" + XCV3Config.hdid, ptop);
						window.localStorage.setItem(self.qrBoxname + "qrleftp" + XCV3Config.hdid, self.wpxtoper(pleft));
						window.localStorage.setItem(self.qrBoxname + "qrtopp" + XCV3Config.hdid, self.hpxtoper(ptop));
						window.localStorage.setItem(self.qrBoxname + "qrshowtype" + XCV3Config.hdid, '1');
						window.localStorage.setItem(self.qrBoxname + "qrtype" + XCV3Config.hdid, '1');

					} else {
						var qrw = $(".full-main").height() > 800 ? (self.minWidth + 100) : self.minWidth, qrh = $(".full-main").height() > 800 ? (self.minHeight + 100) : self.minHeight;
						var qrleftp = 83, qrtopp = 68;
						if (self.qrBoxname == 'hdQrbox2') {
							qrleftp = 12;
							qrtopp = 20;
						}
						self.dragBox.css({ width: qrw + 'px', height: qrh + 'px', top: qrtopp + '%', left: qrleftp + '%' });
						window.localStorage.setItem(self.qrBoxname + "qrw" + XCV3Config.hdid, qrw);
						window.localStorage.setItem(self.qrBoxname + "qrh" + XCV3Config.hdid, qrh);
						window.localStorage.setItem(self.qrBoxname + "qrleftp" + XCV3Config.hdid, qrleftp + '%');
						window.localStorage.setItem(self.qrBoxname + "qrtopp" + XCV3Config.hdid, qrtopp + '%');
						window.localStorage.setItem(self.qrBoxname + "qrtype" + XCV3Config.hdid, '2');
					}
				}
			});
			$(document).click(function (e) {
				if (!$(e.target).closest('.' + self.qrBoxname).length) {
					self.dragBox.removeClass('active');
				} else {
					self.dragBox.addClass('active');
				}
			});
			$(window).on('resize', function () {
				self.onresize();
			});
			self.initqr();
		},
		initqr: function () {
			var self = this, qrw = window.localStorage.getItem(self.qrBoxname + "qrw" + XCV3Config.hdid), qrh = window.localStorage.getItem(self.qrBoxname + "qrh" + XCV3Config.hdid), qrtype = window.localStorage.getItem(self.qrBoxname + "qrtype" + XCV3Config.hdid);
			if (qrw != null) {
				self.dragBox.css({ "width": qrw + 'px' });
			}
			if (qrh != null) {
				self.dragBox.css({ "height": qrh + 'px' });
			}
			if (qrtype == '1') {
				var qleft = window.localStorage.getItem(self.qrBoxname + "qrleft" + XCV3Config.hdid), qtop = window.localStorage.getItem(self.qrBoxname + "qrtop" + XCV3Config.hdid);
				if (qleft != null) {
					self.dragBox.css({ "left": qleft + 'px' });
				}
				if (qtop != null) {
					self.dragBox.css({ "top": qtop + 'px' });
				}
			} else if (qrtype == '2') {
				var qleft = window.localStorage.getItem(self.qrBoxname + "qrleftp" + XCV3Config.hdid), qtop = window.localStorage.getItem(self.qrBoxname + "qrtopp" + XCV3Config.hdid);
				if (qleft != null) {
					self.dragBox.css({ "left": qleft });
				}
				if (qtop != null) {
					self.dragBox.css({ "top": qtop });
				}
			} else {
				self.dragBox.find('img').trigger('dblclick');
			}
		},
		dragresize: function (obj) {
			var self = this;
			obj.mousedown(function (ev) {
				ev.stopPropagation();
				var className = obj.attr('class'), oldWidth = self.dragBox.outerWidth(), oldHeight = self.dragBox.outerHeight(), oldX = ev.clientX / self.zoom, oldY = ev.clientY / self.zoom, oldLeft = self.dragBox[0].offsetLeft, oldTop = self.dragBox[0].offsetTop;
				$(document).bind('mousemove', function (oEv) {
					if ($.inArray(className, ['tl', 'bl', 'tr', 'br', 'lc', 'rc', 'tc', 'bc']) === -1) {
						return false;
					}
					let disX = (oldLeft + (oEv.clientX / self.zoom - oldLeft)), disY = (oldTop + (oEv.clientY / self.zoom - oldY));
					if (className == 'tl') {
						var boxwidth = (oldWidth - (oEv.clientX / self.zoom - oldX));
						//往右拖动到底
						if (disX > oldX + oldWidth - self.minWidth) {
							disX = oldX + oldWidth - self.minWidth;
							boxwidth = self.minWidth;
						}
						//往左拖动到底
						if (disX <= 0) {
							disX = 0;
							boxwidth = oldX + oldWidth;
						}
						var boxheight = (oldHeight - (oEv.clientY / self.zoom - oldY));
						//往下拖动到底
						if (disY > oldY + oldHeight - self.minHeight) {
							disY = oldY + oldHeight - self.minHeight;
							boxheight = self.minHeight;
						}
						//往上拖动到底
						if (disY <= 0) {
							disY = 0;
							boxheight = oldHeight + oldTop;
						}
					} else if (className == 'bl') {
						disY = oldTop;
						var boxwidth = (oldWidth - (oEv.clientX / self.zoom - oldX));
						//往右拖动到底
						if (disX > oldX + oldWidth - self.minWidth) {
							disX = oldX + oldWidth - self.minWidth;
							boxwidth = self.minWidth;
						}
						//往左拖动到底
						if (disX <= 0) {
							disX = 0;
							boxwidth = oldWidth + oldLeft;
						}
						var boxheight = (oldHeight + (oEv.clientY / self.zoom - oldY));
						//往下拖动到底
						if (boxheight > $(".full-main").height() - oldTop) {
							boxheight = $(".full-main").height() - oldTop;
						}
						//往上拖动到底
						if (boxheight < self.minHeight) {
							boxheight = self.minHeight;
						}
					} else if (className == 'tr') {
						disX = oldLeft;
						var boxwidth = oldWidth + (oEv.clientX / self.zoom - oldX);
						//往右拖动到底
						if (boxwidth > $(".full-main").width() - oldLeft) {
							boxwidth = $(".full-main").width() - oldLeft;
						}
						//往左拖动到底
						if (boxwidth < self.minWidth) {
							boxwidth = self.minWidth;
						}
						var boxheight = (oldHeight - (oEv.clientY / self.zoom - oldY));
						//往下拖动到底
						if (disY > oldY + oldHeight - self.minHeight) {
							disY = oldY + oldHeight - self.minHeight;
							boxheight = self.minHeight;
						}
						//往上拖动到底
						if (disY <= 0) {
							disY = 0;
							boxheight = oldY + oldHeight;
						}
					} else if (className == 'br') {
						disX = oldLeft;
						disY = oldTop;
						var boxwidth = oldWidth + (oEv.clientX / self.zoom - oldX);
						//往右拖动到底
						if (boxwidth > $(".full-main").width() - oldLeft) {
							boxwidth = $(".full-main").width() - oldLeft;
						}
						//往左拖动到底
						if (boxwidth < self.minWidth) {
							boxwidth = self.minWidth;
						}
						var boxheight = oldHeight + (oEv.clientY / self.zoom - oldY);
						//往下拖动到底
						if (boxheight > $(".full-main").height() - oldTop) {
							boxheight = $(".full-main").height() - oldTop;
						}
						//往上拖动到底
						if (boxheight < self.minHeight) {
							boxheight = self.minHeight;
						}
					} else if (className == 'lc') {
						disY = oldTop;
						var boxheight = oldHeight;
						var boxwidth = (oldWidth - (oEv.clientX / self.zoom - oldX));
						//往右拖动到底
						if (disX > oldX + oldWidth - self.minWidth) {
							disX = oldX + oldWidth - self.minWidth;
							boxwidth = self.minWidth;
						}
						//往左拖动到底
						if (disX <= 0) {
							disX = 0;
							boxwidth = oldWidth + oldLeft;
						}
					} else if (className == 'rc') {
						disY = oldTop;
						disX = oldLeft;
						var boxheight = oldHeight;
						var boxwidth = oldWidth + (oEv.clientX / self.zoom - oldX);
						//往右拖动到底
						if (boxwidth > $(".full-main").width() - oldLeft) {
							boxwidth = $(".full-main").width() - oldLeft;
						}
						//往左拖动到底
						if (boxwidth < self.minWidth) {
							boxwidth = self.minWidth;
						}
					} else if (className == 'tc') {
						disX = oldLeft;
						var boxwidth = oldWidth;
						var boxheight = (oldHeight - (oEv.clientY / self.zoom - oldY));
						//往下拖动到底
						if (disY > oldY + oldHeight - self.minHeight) {
							disY = oldY + oldHeight - self.minHeight;
							boxheight = self.minHeight;
						}
						//往上拖动到底
						if (disY <= 0) {
							disY = 0;
							boxheight = oldY + oldHeight;
						}
					} else if (className == 'bc') {
						disX = oldLeft;
						disY = oldTop;
						var boxwidth = oldWidth;
						var boxheight = (oldHeight + (oEv.clientY / self.zoom - oldY));
						//往下拖动到底
						if (boxheight > $(".full-main").height() - oldTop) {
							boxheight = $(".full-main").height() - oldTop;
						}
						//往上拖动到底
						if (boxheight < self.minHeight) {
							boxheight = self.minHeight;
						}
					}
					self.dragBox.css({ width: boxwidth + 'px', height: boxheight + 'px', left: disX + 'px', top: disY + 'px' });
					window.localStorage.setItem(self.qrBoxname + "qrw" + XCV3Config.hdid, boxwidth);
					window.localStorage.setItem(self.qrBoxname + "qrh" + XCV3Config.hdid, boxheight);
					window.localStorage.setItem(self.qrBoxname + "qrleft" + XCV3Config.hdid, disX);
					window.localStorage.setItem(self.qrBoxname + "qrtop" + XCV3Config.hdid, disY);
					window.localStorage.setItem(self.qrBoxname + "qrleftp" + XCV3Config.hdid, self.wpxtoper(disX));
					window.localStorage.setItem(self.qrBoxname + "qrtopp" + XCV3Config.hdid, self.hpxtoper(disY));
					window.localStorage.setItem(self.qrBoxname + "qrtype" + XCV3Config.hdid, '1');
				});
				$(document).bind('mouseup', function (event) {
					$(document).unbind('mousemove');
				});
				return false;
			});
		},
		onresize: function () {
			var self = this;
			self.zoom = window.innerHeight / $(".full-main").height();
			var pleft = window.localStorage.getItem(self.qrBoxname + "qrleftp" + XCV3Config.hdid);
			var ptop = window.localStorage.getItem(self.qrBoxname + "qrtopp" + XCV3Config.hdid);
			self.dragBox.css({ left: pleft, top: ptop, });
			window.localStorage.setItem(self.qrBoxname + "qrtype" + XCV3Config.hdid, '2');
		},
		wpxtoper: function (v) {
			var self = this, per = v / (window.innerWidth / self.zoom);
			return Number(per * 100).toFixed(2) + '%';
		},
		hpxtoper: function (v) {
			var self = this, per = v / $(".full-main").height();
			return Number(per * 100).toFixed(2) + '%';
		},
	};
	return dragqr;
});