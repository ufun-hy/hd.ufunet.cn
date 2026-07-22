/*轮播图左侧*/
define('rightboxslider', ['jquery', 'screencore', 'template', 'jquery.ui'], function ($, screencore, template) {
    var rightboxslider = {
        running: false,
        loaded: 0,
        timeout: null,
        lastIndex: null,
        imgList: [],
        delay: 6e3,
        init: function (imglist) {
            var e = this;
            e.create(imglist);
            $(".imageSliderBox").draggable({
                scroll: false,
                drag: function (evt, ui) {
                    var zoomScale = (window.innerHeight / 800).toFixed(2);
                    var changeL = ui.position.left - ui.originalPosition.left;
                    var changeT = ui.position.top - ui.originalPosition.top;
                    var newL = (ui.originalPosition.left + changeL) / zoomScale;
                    var newT = (ui.originalPosition.top + changeT) / zoomScale;
                    ui.position.left = newL;
                    ui.position.top = newT;
                },
                stop: function (event, ui) {
                    localStorage.setItem('rightimgslidertop', ui.position.top);
                    localStorage.setItem('rightimgsliderleft', ui.position.left);
                }
            });
            var sliderTop = localStorage.getItem('rightimgslidertop'), sliderLeft = localStorage.getItem('rightimgsliderleft');
            if (sliderTop) {
                $(".imageSliderBox").css({ top: sliderTop + 'px' });
            }
            if (sliderLeft) {
                $(".imageSliderBox").css({ left: sliderLeft + 'px' });
            }
        },
        create: function (imglist) {
            var self = this, rightboxshow = self.getlocalval('rightboxshow') || '1';
            if (rightboxshow != '0') $(".baping-contentsbox").removeClass('full');
            $('.baping-mainbox .msg-itembox').append('<div class="baping-rightbox ' + (rightboxshow != '0' ? 'show' : '') + '"><div class="imageSliderBox"></div></div>');
            this.imgList = (imglist == null || imglist.length == 0) ? [] : imglist;
            if (rightboxshow == '1') {
                $(this.createImage()).appendTo($('.imageSliderBox'));
            } else if (rightboxshow == '2') {
                rightboxslider.tuhaolist.init();
            }
        },
        setList: function (list, num) {
            num = num == null ? 20 : num;
            var arr = [];
            for (var x = 0; x < list.length; x++) {
                var e = list[x].src;
                if (typeof e == 'undefined' || e == '' || e == null) {
                    continue;
                }
                if ($.isArray(e)) {
                    for (var j = 0; j < e.length; j++) {
                        arr.push(e[j]);
                    }
                } else {
                    arr.push(e);
                }
            }
            arr = arr.slice(0, 20);
            return arr;
        },
        createImage: function () {
            var list = this.imgList;
            if (list.length == 0) {
                return '<div class="defaultImage loopDiv"><img onload="hadLoadRightImg(this)" src="' + barConfig.sliderbox.defaultimg + '" /></div>';
            }
            var html = '';
            list = this.setList(list);
            for (var x = 0; x < list.length; x++) {
                var e = list[x] + '';
                if (e.substring(0, 4) != 'http' || e.substring(0, 1) != '/') {
                    html += '<div class="loopDiv" data-index="' + x + '" type="0"><img onload="hadLoadRightImg(this)" onerror="failLoadRightImg(this)" src="' + e + '" /></div>';
                }
            }
            html = html.length == 0 ? '<div class="defaultImage loopDiv"><img onload="hadLoadRightImg(this)" src="' + barConfig.sliderbox.defaultimg + '" /></div>' : html;
            return html;
        },
        load: function (e) {
            var t = this;
            t.centerImg(e);
            this.loaded++;
            if (this.loaded >= this.imgList.length) {
                this.loadOver();
            }
        },
        centerImg: function (e, fn) {
            $(e).css({ visibility: 'visible' });
            //$(e).css({position:'absolute',top:0,left:0,width:'100%',height:"100%"});
            if (fn) { fn(); }
        },
        error: function (e) {
            $(e).attr({ src: barConfig.sliderbox.defaultimg });
        },
        getOne: function () {
            var self = this;
            var arr = $('.imageSliderBox').find('.loopDiv[type="0"]');
            var index = self.randomInt(0, arr.length - 1);
            var obj = arr[index];
            return obj;
        },
        loadOver: function () {
            $('.imageSliderBox').addClass('show');
            this.loop();
            this.resize();
        },
        loop: function () {
            if ($('.imageSliderBox').find('.loopDiv').length <= 1) {
                return $('.imageSliderBox').find('.loopDiv').addClass('show');
            }
            if (this.running) {
                return;
            }
            this.running = true;
            var t = this;
            var type = 0;
            this.timeout = setTimeout(function () {
                $('.imageSliderBox').find('.showBig').removeClass('showBig');
                var one = t.getOne();
                if (type == 1) {
                    $(one).addClass('showBig');
                }
                $('.imageSliderBox').find('.animateImage').removeClass('animateImage animateBig animateSmall').attr({ type: 0 });
                $(one).addClass('animateImage').attr({ type: 1 });
                $(one).addClass(type == 0 ? 'animateBig' : 'animateSmall');
                type = type == 0 ? 1 : 0;
                if ($('.imageSliderBox').find('.loopDiv').length >= 2) {
                    t.timeout = setTimeout(arguments.callee, rightboxslider.delay);
                } else {
                    t.running = false;
                }
            }, 0);
        },
        resetAll: function () {
            var t = this;
            var arr = $('.imageSliderBox').find('.loopDiv img');
            for (var x = 0; x < arr.length; x++) {
                t.centerImg(arr[x]);
            }
        },
        resize: function () {
            var t = this;
            $(window).unbind('resize.loopImage').bind('resize.loopImage', function () {
                t.resetAll();
            });
        },
        add: function (src) {
            if ($('.imageSliderBox').find('.loopDiv').length > 20) {
                this.replace(src);
            } else {
                if ($('.costListWrap').length > 0 && !$('.costListWrap').hasClass('costListWrap_hide')) {
                    return;
                }
                var index = this.getMaxIndex() + 1;
                var html = '<div class="loopDiv" data-index="' + index + '" type="0"><img onload="hadLoadRightImg(this)" onerror="failLoadRightImg(this)" src="' + src + '" /></div>';
                $(html).appendTo($('.imageSliderBox'));
                if ($('.imageSliderBox').find('.loopDiv').length > 0) {
                    $('.imageSliderBox').find('.defaultImage').remove();
                }
            }
        },
        replace: function (src) {
            var obj = this.getLast();
            if (obj == null) {
                return;
            }
            var index = this.getMaxIndex() + 1;
            $(obj).html('<img onload="hadLoadRightImg(this)" onerror="failLoadRightImg(this)" src="' + src + '" />').attr({ 'data-index': index });
        },
        getLast: function () {
            var arr = $('.imageSliderBox').find('.loopDiv');
            if (arr.length == 0)
                return null;
            var last = parseInt($(arr[0]).attr('data-index'));
            var lastObj = arr[0];
            for (var i = 1; i < arr.length; i++) {
                if (last > parseInt($(arr[i]).attr('data-index'))) {
                    last = parseInt($(arr[i]).attr('data-index'));
                    lastObj = arr[i];
                }
            }
            return lastObj;
        },
        getMaxIndex: function () {
            var arr = $('.imageSliderBox').find('.loopDiv');
            if (arr.length == 0) {
                return 0;
            }
            var last = $(arr[0]).attr('data-index') ? parseInt($(arr[0]).attr('data-index')) : 0;
            for (var i = 1; i < arr.length; i++) {
                var iindex = $(arr[i]).attr('data-index') ? parseInt($(arr[i]).attr('data-index')) : 0;
                if (last < iindex) {
                    last = iindex;
                }
            }
            return last;
        },
        hide: function () {
            $('.imageSliderBox').hide();
            $(window).unbind('resize.loopImage');
        },
        show: function () {
            $('.imageSliderBox').show();
            this.resize();
        },
        close: function (fuc) {
            this.loaded = 0;
            this.running = false;
            this.lastIndex = null;
            clearTimeout(this.timeout);
            $(window).unbind('resize.loopImage');
            fuc && fuc();
        },
        open: function () {
            this.create();
        },
        open2: function () {
            this.tuhaolist.close();
            $(this.createImage()).appendTo($('.imageSliderBox'));
            $(".imageSliderBox").draggable({
                scroll: false,
                drag: function (evt, ui) {
                    var zoomScale = (window.innerHeight / 800).toFixed(2);
                    var changeL = ui.position.left - ui.originalPosition.left;
                    var changeT = ui.position.top - ui.originalPosition.top;
                    var newL = (ui.originalPosition.left + changeL) / zoomScale;
                    var newT = (ui.originalPosition.top + changeT) / zoomScale;
                    ui.position.left = newL;
                    ui.position.top = newT;
                },
                stop: function (event, ui) {
                    localStorage.setItem('rightimgslidertop', ui.position.top);
                    localStorage.setItem('rightimgsliderleft', ui.position.left);
                }
            });
        },
        reset: function (imageList) {
            if (imageList == null) {
                return;
            }
            this.imgList = imageList;
            this.running = false;
            clearTimeout(this.timeout);
            $(window).unbind('resize.loopImage');
            this.loaded = 0;
            $('.imageSliderBox').html(this.createImage());
        },
        listadd: function (obj) {
            var e = this;
            e.imgList.push(obj);
        },
        del: function (msgid) {
            var e = this;
            var msgindex = -1;
            for (var i = 0, len = e.imgList.length; i < len; i++) {
                if (msgid == e.imgList[i].id) {
                    msgindex = i;
                    break;
                }
            }
            if (msgindex != -1) {
                e.imgList.splice(msgindex, 1);
                e.reset(e.imgList);
            }
        },
        getlocalval: function (key) {
            return localStorage.getItem(XCV3Config.hdid + '_' + key);
        },
        randomInt: function (n, m) {
            var random = Math.floor(Math.random() * (m - n + 1) + n);
            return random;
        },
        tuhaolist: {
            list: [],
            timeOut2: null,
            init: function () {
                var e = this;
                rightboxslider.close();
                $('.imageSliderBox').html(template('tuhaolist-tpl', {})).addClass('show');
                $(".imageSliderBox").draggable({
                    scroll: false,
                    drag: function (evt, ui) {
                        var zoomScale = (window.innerHeight / 800).toFixed(2);
                        var changeL = ui.position.left - ui.originalPosition.left;
                        var changeT = ui.position.top - ui.originalPosition.top;
                        var newL = (ui.originalPosition.left + changeL) / zoomScale;
                        var newT = (ui.originalPosition.top + changeT) / zoomScale;
                        ui.position.left = newL;
                        ui.position.top = newT;
                    },
                    stop: function (event, ui) {
                        localStorage.setItem('rightimgslidertop', ui.position.top);
                        localStorage.setItem('rightimgsliderleft', ui.position.left);
                    }
                });
                e.ajaxtuhao();
            },
            ajaxtuhao: function () {
                var e = this;
                screencore.ajaxSubmit("/screen/baping/ajaxtuhaolist", {}).then(function (json) {
                    if (json.code == 0) {
                        var top3 = json.msg, top3Box = $(".tuhao-list .tuhao-oneitem");
                        if (top3.length > 0 && top3Box.length > 0) {
                            top3Box.each(function (i) {
                                var onetopData = top3[i], onetopBox = $(this), onetopAvatar = onetopBox.find('.tuhao-avatar img'), onetopNickname = onetopBox.find('p');
                                if (onetopData) {
                                    if (onetopAvatar.length > 0) {
                                        onetopAvatar.attr('src', onetopData.avatar);
                                    } else {
                                        onetopBox.find('.tuhao-avatar').append("<img src=" + onetopData.avatar + " /> ");
                                    }
                                    onetopNickname.text(onetopData.nickname);
                                } else {
                                    if (onetopAvatar.length > 0) {
                                        onetopAvatar.remove();
                                    }
                                    onetopNickname.text('虚位以待');
                                }
                            });
                        }
                        e.timeOut2 = setTimeout(function () {
                            e.ajaxtuhao();
                        }, 8e3);
                    }
                }, function () {
                    e.timeOut2 = setTimeout(function () {
                        e.ajaxtuhao();
                    }, 8e3);
                });
            },
            close: function () {
                var e = this;
                if (e.timeOut2 != null) clearTimeout(e.timeOut2);
            }
        },
    };
    return rightboxslider;
});
