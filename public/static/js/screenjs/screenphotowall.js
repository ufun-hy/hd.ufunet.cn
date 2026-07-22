/*fullback
* @Author: 赞木
* @Date:   2023-12-14 13:17:51
* @Last Modified by:   赞木
*/
define('screenphotowall', ['screencore', 'anime', 'layerBox', 'template', 'jquerytrans'], function (screencore, anime, layerBox, template) {
    var screenphotowall = {
        rowboxp: null,
        rowbox: null,
        rowmaxwidth: 1600,
        rowh: 100,
        rowendbox: null,
        rowendpos: 0,
        rindex: 0,
        fullback: false,
        waitback: false,
        isfullrow: '2',
        rowspeed: 20,
        israndom: '1',
        isrepeat: '2',
        photos: [],
        oldphotos: [],
        newphotos: [],
        init: function (photos, rowindex, fullback, waitback) {
            var self = this, rowindex = rowindex || 0;
            self.rowboxp = $(".imgboxs");
            self.rowmaxwidth = $(".full-main").width() + parseInt(pcstyle.rowoffset);
            self.rowh = $(".full-main").height() / pcstyle.rownum;
            self.rowspeed = parseInt(pcstyle.rowspeed);
            self.rowbox = $(template("box-tpl", { height: self.rowh, top: (rowindex * self.rowh) }));
            self.rowboxp.append(self.rowbox);
            self.photos = photos;
            self.fullback = fullback;
            self.waitback = waitback;
            if (photos.length) {
                self.oldphotos = self.photos.slice();
                if (self.israndom == '1') {
                    self.oldphotos = screencore.arrayrandom(self.oldphotos, self.oldphotos.length);
                }
            }
            setTimeout(function () {
                self.loadOldimgdata();
            }, 2e3);
            self.loadCreateOne();
        },
        loadOldimgdata: function () {
            var self = this, one = self.photos.find(item => !item.hasOwnProperty('rw'));
            if (!one) {
                setTimeout(function () {
                    self.loadOldimgdata();
                }, 2e3);
                return false;
            }
            self.loadOneimg(one, function (w, h, t) {
                if (t == '1') {
                    one.h = self.rowh;
                    one.w = Math.ceil((w / h) * one.h);
                    one.rw = w;
                    one.rh = h;
                }
                setTimeout(function () {
                    self.loadOldimgdata();
                }, 2e3);
            }, function () {
                var index = self.oldphotos.findIndex(item => item.id === one.id);
                if (index !== -1) self.oldphotos.splice(index, 1);
                var index = self.photos.findIndex(item => item.id === one.id);
                if (index !== -1) self.photos.splice(index, 1);
                setTimeout(function () {
                    self.loadOldimgdata();
                }, 2e3);
            });
        },
        loadCreateOne: function () {
            var self = this;
            if (self.isfullrow == '1') {
                return false;
            }
            var one = self.oldphotos[self.rindex];
            if (!one) {
                if (self.oldphotos.length > 0 && self.isrepeat == '1') one = self.oldphotos[Math.floor(Math.random() * self.oldphotos.length)];
            }
            if (one) {
                self.loadOneimg(one, function (w, h) {
                    self.rindex++;
                    one.h = self.rowh;
                    one.w = Math.ceil((w / h) * one.h);
                    one.rw = w;
                    one.rh = h;
                    var box = self.createOneimg(one);
                    self.rowendpos += one.w;
                    if (self.rowendpos <= self.rowmaxwidth) {
                        self.loadCreateOne();
                    } else {
                        self.rowendbox = box;
                        self.isfullrow = '1';
                        self.oldphotos = [];
                        self.startMove();
                        self.fullback && self.fullback(self);
                    }
                }, function () {
                    var index = self.oldphotos.findIndex(item => item.id === one.id);
                    if (index !== -1) self.oldphotos.splice(index, 1);
                    var index = self.photos.findIndex(item => item.id === one.id);
                    if (index !== -1) self.photos.splice(index, 1);
                    self.loadCreateOne();
                });
            } else {
                self.waitAppendOne();
                self.waitback && self.waitback(self);
            }
        },
        waitAppendOne: function () {
            var self = this, one = self.photos[self.rindex];
            if (self.isfullrow == '1') return false;
            if (!one) {
                setTimeout(function () {
                    self.waitAppendOne();
                }, 5e2);
                return false;
            }
            self.rindex++;
            if (self.israndom == '1') {
                one = self.photos[Math.floor(Math.random() * self.photos.length)];
            }
            var box = self.createOneimg(one);
            self.rowendpos += one.w;
            if (self.rowendpos <= self.rowmaxwidth) {
                setTimeout(function () {
                    self.waitAppendOne();
                }, 5e2);
            } else {
                self.rowendbox = box;
                self.isfullrow = '1';
                self.oldphotos = [];
                self.startMove();
                if (self.fullback) {
                    self.fullback(self);
                }
            }
        },
        createOneimg: function (one) {
            var self = this;
            one.x = self.rowendpos;
            var box = $(template("img-tpl", one));
            self.rowbox.append(box);
            box.transition({ opacity: 1, delay: 50 * self.rowbox.find('.img-one').length });
            return box;
        },
        pushOnedata: function (one, loadback, failback) {
            var self = this;
            self.loadOneimg(one, function (w, h, t) {
                if (t == '1') {
                    one.h = self.rowh;
                    one.w = Math.ceil((w / h) * one.h);
                    one.rw = w;
                    one.rh = h;
                    self.photos.push(one);
                    self.newphotos.push(one);
                }
                loadback && loadback();
            }, function () {
                failback && failback();
            });
        },
        loadOneimg: function (data, loadback, failback) {
            var self = this;
            if (data && data.hasOwnProperty('rw')) {
                loadback && loadback(data.rw, data.rh, '2');
            } else {
                var img = new Image;
                img.src = data.img;
                img.onload = function () {
                    loadback && loadback(this.naturalWidth, this.naturalHeight, '1');
                }
                img.onerror = function () {
                    console.log(data.img + '加载错误');
                    failback && failback();
                }
            }
        },
        startMove: function () {
            let self = this;
            self.rowbox.find('.img-one').each(function (i, v) {
                var $this = $(this), translateX = self.getTranslateX($this);
                anime({
                    targets: $this[0],
                    translateX: -$this.width(),
                    duration: translateX * self.rowspeed,
                    easing: 'linear',
                    complete: function (anim) {
                        self.createMoveOne($this, translateX);
                    },
                });
            });
            if (pcstyle.rowani == '1') {
                self.aniOneimg();
            }
        },
        createMoveOne: function (obj, startX) {
            var self = this, photos = self.photos.filter(item => item.hasOwnProperty('rw')), one = photos[Math.floor(Math.random() * photos.length)], translateX = self.getTranslateX();
            translateX -= (startX / (startX * self.rowspeed)) * 30;
            obj.css({ width: one.w, height: one.h, opacity: 0 }).transition({ opacity: 1, delay: 100 }).find('img').attr('src', one.img);
            anime({
                targets: obj[0],
                translateX: [translateX, -one.w],
                duration: (translateX + one.w) * self.rowspeed,
                easing: 'linear',
                complete: function (anim) {
                    self.createMoveOne(obj, translateX);
                },
            });
            self.rowendbox = obj;
        },
        getTranslateX: function (obj) {
            var self = this, obj = obj || self.rowendbox, style = window.getComputedStyle(obj[0]), matrix = new WebKitCSSMatrix(style.webkitTransform);
            return matrix.m41 + obj.width();
        },
        isanione: false,
        aniOneimg: function () {
            var self = this, imgobjs = self.rowbox.find('.img-one');
            if (self.isanione || !imgobjs.length) {
                setTimeout(function () {
                    self.aniOneimg();
                }, 1e3 * screencore.randomInt(3, 10));
                return false;
            }
            self.isanione = true;
            var oneimgbox = imgobjs.eq(Math.floor(Math.random() * imgobjs.length));
            oneimgbox.css({
                filter: "brightness(500%)",
            }).transition({
                filter: "brightness(100%)",
                duration: 1.5e3,
                complete: function () {
                    self.isanione = false;
                    setTimeout(function () {
                        self.aniOneimg();
                    }, 1e3 * screencore.randomInt(3, 10));
                }
            });
        },
    };
    return screenphotowall;
});
