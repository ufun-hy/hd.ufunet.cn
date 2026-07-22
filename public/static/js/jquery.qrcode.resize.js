(function ($) {
    var defaultOpts = {
        minWidth: 150,
        minHeight: 190,
        stage: document,
        itemClass: 'resize-item',
    };
    var QRcodeResize = function (options) {
        this.options = $.extend({}, defaultOpts, options);
        this.init();
    }

    QRcodeResize.prototype = {
        init: function () {
            var self = this;
            self.initResizeBox();
            $(window).on('resize', function () {
                self.onresize();
            });
        },
        initResizeBox: function () {
            var self = this;
            $('.' + self.options.itemClass).each(function () {
                var $this = $(this);
                self.bindResizeEvent($this);
                self.bindTrigger($this);
                self.initpos($this);
                var zoom = window.innerHeight / $(".full-main").height();
                var classNames = $this.attr('class').split(/\s+/);
                $this.find('img').dblclick(function () {
                    if (XCV3Config.gametype != 'baping') {
                        var qrw = $(".full-main").height() > 800 ? 1000 : self.options.minWidth, qrh = $(".full-main").height() > 800 ? 1200 : self.options.minHeight;
                        var pleft = (window.innerWidth / zoom / 2 + qrw), ptop = $(".full-main").height() > 800 ? 1200 : 240;
                        if (classNames[1] == 'hdQrbox2') {
                            pleft = 200;
                        }
                        $this.css({ width: qrw + 'px', height: qrh + 'px', left: pleft + 'px', top: ptop + 'px', });
                        window.localStorage.setItem(`${classNames[1]}qrw${XCV3Config.hdid}`, qrw);
                        window.localStorage.setItem(`${classNames[1]}qrh${XCV3Config.hdid}`, qrh);
                        window.localStorage.setItem(`${classNames[1]}qrleft${XCV3Config.hdid}`, pleft);
                        window.localStorage.setItem(`${classNames[1]}qrtop${XCV3Config.hdid}`, ptop);
                        window.localStorage.setItem(`${classNames[1]}qrleftp${XCV3Config.hdid}`, self.wpxtoper(pleft));
                        window.localStorage.setItem(`${classNames[1]}qrtopp${XCV3Config.hdid}`, self.hpxtoper(ptop));
                        window.localStorage.setItem(`${classNames[1]}qrshowtype${XCV3Config.hdid}`, '1');
                        window.localStorage.setItem(`${classNames[1]}qrtype${XCV3Config.hdid}`, '1');
                    } else {
                        var rightboxshow = localStorage.getItem(XCV3Config.hdid + '_rightboxshow');
                        if (rightboxshow == '0') {
                            var qrw = $(".full-main").height() > 800 ? 1000 : self.options.minWidth, qrh = $(".full-main").height() > 800 ? 1200 : self.options.minHeight;
                            var pleft = (window.innerWidth / zoom / 2 + qrw), ptop = $(".full-main").height() > 800 ? 1200 : 240;
                            if (classNames[1] == 'hdQrbox2') {
                                pleft = 200;
                            }
                            $this.css({ width: qrw + 'px', height: qrh + 'px', left: pleft + 'px', top: ptop + 'px', });
                            window.localStorage.setItem(`${classNames[1]}qrw${XCV3Config.hdid}`, qrw);
                            window.localStorage.setItem(`${classNames[1]}qrh${XCV3Config.hdid}`, qrh);
                            window.localStorage.setItem(`${classNames[1]}qrleft${XCV3Config.hdid}`, pleft);
                            window.localStorage.setItem(`${classNames[1]}qrtop${XCV3Config.hdid}`, ptop);
                            window.localStorage.setItem(`${classNames[1]}qrleftp${XCV3Config.hdid}`, self.wpxtoper(pleft));
                            window.localStorage.setItem(`${classNames[1]}qrtopp${XCV3Config.hdid}`, self.hpxtoper(ptop));
                            window.localStorage.setItem(`${classNames[1]}qrshowtype${XCV3Config.hdid}`, '1');
                            window.localStorage.setItem(`${classNames[1]}qrtype${XCV3Config.hdid}`, '1');
                        } else {
                            var qrw = $(".full-main").height() > 800 ? 1000 : self.options.minWidth, qrh = $(".full-main").height() > 800 ? 1200 : self.options.minHeight;
                            var qrleftp = 83, qrtopp = 68;
                            if (classNames[1] == 'hdQrbox2') {
                                qrleftp = 12;
                                qrtopp = 20;
                            }
                            $this.css({ width: qrw + 'px', height: qrh + 'px', top: qrtopp + '%', left: qrleftp + '%' });
                            window.localStorage.setItem(`${classNames[1]}qrw${XCV3Config.hdid}`, qrw);
                            window.localStorage.setItem(`${classNames[1]}qrh${XCV3Config.hdid}`, qrh);
                            window.localStorage.setItem(`${classNames[1]}qrleftp${XCV3Config.hdid}`, qrleftp + '%');
                            window.localStorage.setItem(`${classNames[1]}qrtopp${XCV3Config.hdid}`, qrtopp + '%');
                            window.localStorage.setItem(`${classNames[1]}qrtype${XCV3Config.hdid}`, '2');
                        }
                    }
                });
            });
            self.bindHidePanel();
        },
        initpos: function (el) {
            var classNames = el.attr('class').split(/\s+/);
            var qrw = window.localStorage.getItem(`${classNames[1]}qrw${XCV3Config.hdid}`), qrh = window.localStorage.getItem(`${classNames[1]}qrh${XCV3Config.hdid}`), qrtype = window.localStorage.getItem(`${classNames[1]}qrtype${XCV3Config.hdid}`);
            if (qrw != null) {
                el.css({ "width": qrw + 'px' });
            }
            if (qrh != null) {
                el.css({ "height": qrh + 'px' });
            }
            if (qrtype == '1') {
                var qleft = window.localStorage.getItem(`${classNames[1]}qrleft${XCV3Config.hdid}`), qtop = window.localStorage.getItem(`${classNames[1]}qrtop${XCV3Config.hdid}`);
                if (qleft != null) {
                    el.css({ "left": qleft + 'px' });
                }
                if (qtop != null) {
                    el.css({ "top": qtop + 'px' });
                }
            } else if (qrtype == '2') {
                var qleft = window.localStorage.getItem(`${classNames[1]}qrleftp${XCV3Config.hdid}`), qtop = window.localStorage.getItem(`${classNames[1]}qrtopp${XCV3Config.hdid}`);
                if (qleft != null) {
                    el.css({ "left": qleft });
                }
                if (qtop != null) {
                    el.css({ "top": qtop });
                }
            } else {
                el.find('img').trigger('dblclick');
            }
        },

        triggerResize: function (el) {
            el.addClass('active').siblings('.' + this.options.itemClass).removeClass('active');
        },
        bindResizeEvent: function (el) {
            var self = this;
            var ox = 0;
            var oy = 0;
            var ow = 0;
            var oh = 0;
            var oleft = 0;
            var otop = 0;
            var zoom = window.innerHeight / $(".full-main").height();
            var emove = false;
            el.on('mousedown', '.e', function (e) {
                e.stopPropagation();
                ox = e.pageX;
                ow = el.width();
                emove = true;
            });
            var smove = false;
            el.on('mousedown', '.s', function (e) {
                e.stopPropagation();
                oy = e.pageY;
                oh = el.height();
                smove = true;
            });
            var wmove = false;
            el.on('mousedown', '.w', function (e) {
                e.stopPropagation();
                ox = e.pageX;
                ow = el.width();
                wmove = true;
                oleft = el[0].offsetLeft;
            });
            var nmove = false;
            el.on('mousedown', '.n', function (e) {
                e.stopPropagation();
                oy = e.pageY;
                oh = el.height();
                nmove = true;
                otop = el[0].offsetTop;
            });
            var nemove = false;
            el.on('mousedown', '.ne', function (e) {
                e.stopPropagation();
                ox = e.pageX;
                oy = e.pageY;
                ow = el.width();
                oh = el.height();
                nemove = true;
                otop = el[0].offsetTop;
            });
            var nwmove = false;
            el.on('mousedown', '.nw', function (e) {
                e.stopPropagation();
                ox = e.pageX;
                oy = e.pageY;
                ow = el.width();
                oh = el.height();
                otop = el[0].offsetTop;
                oleft = el[0].offsetLeft;
                nwmove = true;
            });
            var semove = false;
            el.on('mousedown', '.se', function (e) {
                e.stopPropagation();
                ox = e.pageX;
                oy = e.pageY;
                ow = el.width();
                oh = el.height();
                semove = true;
            });
            var swmove = false;
            el.on('mousedown', '.sw', function (e) {
                e.stopPropagation();
                ox = e.pageX;
                oy = e.pageY;
                ow = el.width();
                oh = el.height();
                swmove = true;
                oleft = el[0].offsetLeft;
            });
            var drag = false;
            el.on('mousedown', function (e) {
                e.preventDefault();
                var tagName = e.target.tagName.toString().toLowerCase();
                if (tagName === 'span') {
                    return false;
                }
                ox = e.pageX;
                oy = e.pageY;
                otop = el[0].offsetTop;
                oleft = el[0].offsetLeft;
                ow = el.width();
                oh = el.height();
                drag = true;
            });
            $(self.options.stage).on('mousemove', function (e) {
                if (emove) {
                    var x = (e.pageX - ox) / zoom;
                    var width = ow + x;
                    if (width < self.options.minWidth) {
                        width = self.options.minWidth;
                    }
                    el.css({
                        width: width
                    });
                } else if (smove) {
                    var y = (e.pageY - oy) / zoom;
                    var height = oh + y;
                    if (height < self.options.minHeight) {
                        height = self.options.minHeight;
                    }
                    el.css({
                        height: height
                    });
                } else if (wmove) {
                    var x = (e.pageX - ox) / zoom;
                    var width = ow - x;
                    if (width < self.options.minWidth) {
                        width = self.options.minWidth;
                    }
                    var left = oleft + x;
                    var maxleft = oleft + ow - self.options.minWidth;
                    if (left > maxleft) {
                        left = maxleft;
                    }
                    el.css({
                        width: width,
                        left: left
                    });
                } else if (nmove) {
                    var y = (e.pageY - oy) / zoom;
                    var height = oh - y;
                    if (height < self.options.minHeight) {
                        height = self.options.minHeight;
                    }
                    var top = otop + y;
                    var maxtop = otop + oh - self.options.minHeight;
                    if (top > maxtop) {
                        top = maxtop;
                    }
                    el.css({
                        height: height,
                        top: top
                    });
                } else if (nemove) {
                    var x = (e.pageX - ox) / zoom;
                    var y = (e.pageY - oy) / zoom;
                    var width = ow + x;
                    var height = oh - y;
                    if (width < self.options.minWidth) {
                        width = self.options.minWidth;
                    }
                    if (height < self.options.minHeight) {
                        height = self.options.minHeight;
                    }
                    var top = otop + y;
                    var maxtop = otop + oh - self.options.minHeight;
                    if (top > maxtop) {
                        top = maxtop;
                    }
                    el.css({
                        width: width,
                        height: height,
                        top: top
                    });
                } else if (nwmove) {
                    var x = (e.pageX - ox) / zoom;
                    var y = (e.pageY - oy) / zoom;
                    var width = ow - x;
                    var height = oh - y;
                    if (width < self.options.minWidth) {
                        width = self.options.minWidth;
                    }
                    if (height < self.options.minHeight) {
                        height = self.options.minHeight;
                    }
                    var top = otop + y;
                    var maxtop = otop + oh - self.options.minHeight;
                    if (top > maxtop) {
                        top = maxtop;
                    }
                    var left = oleft + x;
                    var maxleft = oleft + ow - self.options.minWidth;
                    if (left > maxleft) {
                        left = maxleft;
                    }
                    el.css({
                        width: width,
                        height: height,
                        top: top,
                        left: left
                    });
                } else if (semove) {
                    var x = (e.pageX - ox) / zoom;
                    var y = (e.pageY - oy) / zoom;
                    var width = ow + x;
                    var height = oh + y;
                    if (width < self.options.minWidth) {
                        width = self.options.minWidth;
                    }
                    if (height < self.options.minHeight) {
                        height = self.options.minHeight;
                    }
                    el.css({
                        width: width,
                        height: height
                    });
                } else if (swmove) {
                    var x = (e.pageX - ox) / zoom;
                    var y = (e.pageY - oy) / zoom;
                    var width = ow - x;
                    var height = oh + y;
                    if (width < self.options.minWidth) {
                        width = self.options.minWidth;
                    }
                    if (height < self.options.minHeight) {
                        height = self.options.minHeight;
                    }
                    var left = oleft + x;
                    var maxleft = oleft + ow - self.options.minWidth;
                    if (left > maxleft) {
                        left = maxleft;
                    }
                    el.css({
                        width: width,
                        height: height,
                        left: left,
                    });
                } else if (drag) {
                    var top = otop + (e.pageY - oy) / zoom;
                    var left = oleft + (e.pageX - ox) / zoom;
                    console.log(top, left)
                    if (top < 0) {
                        top = 0;
                    }
                    if (top > $(".full-main").height() - oh) {
                        top = $(".full-main").height() - oh
                    }
                    if (left < 0) {
                        left = 0;
                    }
                    if (left > $(".full-main").width() - ow) {
                        left = $(".full-main").width() - ow;
                    }
                    el.css({ top: top, left: left });
                }
                if (emove || smove || wmove || nmove || nemove || nwmove || swmove || semove || drag) {
                    var classNames = el.attr('class').split(/\s+/);
                    window.localStorage.setItem(`${classNames[1]}qrtype${XCV3Config.hdid}`, '1');
                    if (typeof width !== 'undefined') window.localStorage.setItem(`${classNames[1]}qrw${XCV3Config.hdid}`, width);
                    if (typeof height !== 'undefined') window.localStorage.setItem(`${classNames[1]}qrh${XCV3Config.hdid}`, height);
                    if (typeof left !== 'undefined') {
                        window.localStorage.setItem(`${classNames[1]}qrleft${XCV3Config.hdid}`, left);
                        window.localStorage.setItem(`${classNames[1]}qrleftp${XCV3Config.hdid}`, self.wpxtoper(left));
                    }
                    if (typeof top !== 'undefined') {
                        window.localStorage.setItem(`${classNames[1]}qrtop${XCV3Config.hdid}`, top);
                        window.localStorage.setItem(`${classNames[1]}qrtopp${XCV3Config.hdid}`, self.hpxtoper(top));
                    }
                }
            });
            $(self.options.stage).on('mouseup', function (e) {
                emove = false;
                smove = false;
                wmove = false;
                nmove = false;
                nemove = false;
                nwmove = false;
                swmove = false;
                semove = false;
                drag = false;
            });
        },
        wpxtoper: function (v) {
            var zoom = window.innerHeight / $(".full-main").height(), per = v / (window.innerWidth / zoom);
            return Number(per * 100).toFixed(2) + '%';
        },
        hpxtoper: function (v) {
            var per = v / $(".full-main").height();
            return Number(per * 100).toFixed(2) + '%';
        },
        onresize: function () {
            var self = this;
            $('.' + self.options.itemClass).each(function () {
                var classNames = $(this).attr('class').split(/\s+/);
                var pleft = window.localStorage.getItem(`${classNames[1]}qrleftp${XCV3Config.hdid}`);
                var ptop = window.localStorage.getItem(`${classNames[1]}qrtopp${XCV3Config.hdid}`);
                $(this).css({ left: pleft, top: ptop, });
                window.localStorage.setItem(`${classNames[1]}qrtype${XCV3Config.hdid}`, '2');
            });
        },
        bindTrigger: function (el) {
            var self = this;
            el.on('click', function (e) {
                e.stopPropagation();
                self.triggerResize(el);
            });
        },
        bindHidePanel: function (el) {
            var stage = this.options.stage;
            var itemClass = this.options.itemClass;
            $(stage).bind('click', function (e) {
                $('.' + itemClass).removeClass('active');
            })
        }
    }
    window.QRcodeResize = QRcodeResize;
})(jQuery);
