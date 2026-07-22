; (function ($, h, c) { var a = $([]), e = $.resize = $.extend($.resize, {}), i, k = "setTimeout", j = "resize", d = j + "-special-event", b = "delay", f = "throttleWindow"; e[b] = 250; e[f] = true; $.event.special[j] = { setup: function () { if (!e[f] && this[k]) { return false } var l = $(this); a = a.add(l); $.data(this, d, { w: l.width(), h: l.height() }); if (a.length === 1) { g() } }, teardown: function () { if (!e[f] && this[k]) { return false } var l = $(this); a = a.not(l); l.removeData(d); if (!a.length) { clearTimeout(i) } }, add: function (l) { if (!e[f] && this[k]) { return false } var n; function m(s, o, p) { var q = $(this), r = $.data(this, d); r.w = o !== c ? o : q.width(); r.h = p !== c ? p : q.height(); n.apply(this, arguments) } if ($.isFunction(l)) { n = l; return m } else { n = l.handler; l.handler = m } } }; function g() { i = h[k](function () { a.each(function () { var n = $(this), m = n.width(), l = n.height(), o = $.data(this, d); if (m !== o.w || l !== o.h) { n.trigger(j, [o.w = m, o.h = l]) } }); g() }, e[b]) } })(jQuery, this);
; (function ($) {
    $.fn.extend({
        animateCss: function (a, callback) {
            this.addClass('animated ' + a).one('webkitAnimationEnd animationend', function () {
                $(this).removeClass('animated ' + a);
                if (typeof callback === 'function') {
                    callback($(this));
                }
            })
        }
    });
})(jQuery);
; (function ($) {
    $.fn.extend({
        animateControl: function (anicss, callback) {
            var self = this;
            self.addClass('animated ' + anicss).one('animationend webkitAnimationEnd', function () {
                self.removeClass('animated ' + anicss);
                if (typeof callback === 'function') {
                    callback($(self));
                }
            });
            //return self;
        }
    });
})(jQuery);
; (function () {
    $.fn.lyearloading = function (options) {
        // DOM容器对象
        var $this = $(this);
        var defaults = {
            opacity: 0.1,                // 遮罩层的透明度，==0时没有遮罩层
            backgroundColor: '#000000',          // 遮罩层的颜色
            imgUrl: '',                 // 加载动画使用图片
            textColorClass: '',                 // 定义文字的颜色，当不使用图片时
            spinnerColorClass: '',                 // 定义加载动画的颜色，当不使用图片时
            spinnerSize: 'normal',           // 定义加载动画的大小，当不使用图片时
            spinnerText: '',                 // 显示的文字
            zindex: 9999,               // 遮罩层的z-index值
        };

        // 融合配置项
        var opts = $.extend({}, defaults, options);

        // 默认样式
        var maskStyle = {
            'position': 'absolute',
            'width': '100%',
            'height': '100%',
            'top': 0,
            'left': 0,
            'background-color': opts.backgroundColor,
            'opacity': opts.opacity,
            'z-index': opts.zindex,

        }, textStyle = {
            'position': 'absolute',
            'line-height': '120%',
            'text-align': 'center',
            'vertical-align': 'middle',
            'z-index': opts.zindex + 1,
        }, spinnerStyle = {
            'position': 'absolute',
            'z-index': opts.zindex + 1,
        };
        var defaultClass = 'lyear-loading';
        // 初始化方法
        this.init = function () {
            if ($this.children('.' + defaultClass).size() > 0) {
                $this.children('.' + defaultClass).fadeIn(250)
            } else {
                var $maskHtml = $('<div />').addClass(defaultClass),
                    $textHtml = $('<span />').html($.trim(opts.spinnerText)).addClass(defaultClass).addClass(opts.textColorClass),
                    $spinnerHtml = opts.imgUrl ? $('<img />').attr('src', opts.imgUrl).addClass(defaultClass) : $('<div />').addClass('spinner-border').addClass(defaultClass).addClass(opts.spinnerColorClass).css(this.getSpinnerSize());

                var toolMethods = {
                    resizeStyle: function () {
                        var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
                            $parent = $this.find('.' + defaultClass).parent(),
                            parentPosition = ('fixed,relative').indexOf($parent.css('position')),
                            isFixed = parentPosition > -1 || $parent[0] === $('.' + defaultClass)[0].offsetParent,
                            safariBug = parentPosition < 0 && $parent[0].offsetParent !== $('body')[0] && isSafari,
                            offsetP = isFixed || safariBug ? { top: 0, left: 0 } : { top: $parent[0].offsetTop, left: $parent[0].offsetLeft },
                            parentW = $this.outerWidth(),
                            parentH = $this.outerHeight();

                        if ($this.selector == 'body') {
                            maskStyle.position = 'fixed';
                            spinnerStyle.position = 'fixed';
                            textStyle.position = 'fixed';

                            spinnerStyle.top = $(window).height() / 2 - $spinnerHtml.outerHeight() / 2 + (opts.spinnerText ? (- 4 - $textHtml.height() / 2) : 0);
                            spinnerStyle.left = $(window).width() / 2 - $spinnerHtml.outerWidth() / 2;

                            textStyle.top = $(window).height() / 2 + $spinnerHtml.outerHeight() / 2 - 4;
                            textStyle.left = $(window).width() / 2 - $textHtml.outerWidth() / 2;
                        } else {
                            maskStyle.width = parentW;
                            maskStyle.height = parentH;
                            maskStyle.top = offsetP.top;
                            maskStyle.left = offsetP.left;

                            spinnerStyle.top = parentH / 2 - $spinnerHtml.outerHeight() / 2 + (opts.spinnerText ? (- 4 - $textHtml.height() / 2) : 0) + offsetP.top;
                            spinnerStyle.left = parentW / 2 - $spinnerHtml.outerWidth() / 2 + offsetP.left;

                            textStyle.top = parentH / 2 + $spinnerHtml.outerHeight() / 2 - 4 + offsetP.top;
                            textStyle.left = parentW / 2 - $textHtml.width() / 2 + offsetP.left;
                        }

                        $maskHtml.css(maskStyle);
                        $spinnerHtml.css(spinnerStyle);
                        $textHtml.css(textStyle);
                    }
                };

                // 遮罩层继承父元素的边框效果
                maskStyle['border-top-left-radius'] = $this.css('border-top-left-radius');
                maskStyle['border-top-right-radius'] = $this.css('border-top-right-radius');
                maskStyle['border-bottom-left-radius'] = $this.css('border-bottom-left-radius');
                maskStyle['border-bottom-right-radius'] = $this.css('border-bottom-right-radius');

                opts.opacity && $maskHtml.css(maskStyle).appendTo($this);
                $.trim(opts.spinnerText) && $textHtml.css(textStyle).appendTo($this);
                $spinnerHtml.css(spinnerStyle).appendTo($this);

                this.loadImage(opts.imgUrl, function (imgObj) {
                    toolMethods.resizeStyle();
                }, function (e) {
                    throw new Error(e);
                });

                $(window).off('resize.' + defaultClass).on('resize.' + defaultClass, function () {
                    toolMethods.resizeStyle();
                });
            }
        }

        this.hide = function () {
            $this.children('.' + defaultClass).fadeOut(250);
        }

        this.show = function () {
            $this.children('.' + defaultClass).fadeIn(250);
        }

        this.destroy = function () {
            $this.children('.' + defaultClass).fadeOut(250, function () {
                $(window).off('resize.' + defaultClass);
                $(this).remove();
            });
        }

        this.loadImage = function (url, callback, error) {
            if (!url) {
                return callback();
            }

            var imgObj;

            imgObj = new Image();
            imgObj.src = url;

            if (imgObj.complete && callback) {
                return callback();
            }

            imgObj.onload = function () {
                imgObj.onload = null;
                callback && callback();
            };

            imgObj.onerror = function (e) {
                imgObj.onerror = null;
                error && error(e);
            };

            return imgObj;
        }

        // 对loading设置大小的处理返回
        this.getSpinnerSize = function () {
            var sizeCss;
            switch (options.spinnerSize) {
                case 'sm':
                    sizeCss = { 'width': '12px', 'height': '12px' };
                    break;
                case 'nm':
                    sizeCss = { 'width': '24px', 'height': '24px' };
                    break;
                case 'md':
                    sizeCss = { 'width': '36px', 'height': '36px' };
                    break;
                case 'lg':
                    sizeCss = { 'width': '48px', 'height': '48px' };
                    break;
                default:
                    sizeCss = { 'width': options.spinnerSize, 'height': options.spinnerSize };
            }

            return sizeCss;
        };

        // 自动执行初始化函数
        this.init();

        // 返回函数对象
        return this;
    }
})(jQuery);
/**
 * 联动下拉插件
 */
; (function ($, window, document, undefined) {

    var bootstrapSelectN = function (ele, opt, callback) {
        this.$element = ele;
        this.callback = callback;
        // 是否引入lyearSelect插件
        this.sSelect = typeof (jQuery.fn.lyearSelect) == 'function';
        // 当前选中数据值名数据
        this.selected = [];
        // 当前选中的值
        this.values = [];
        // 当前选中的名
        this.names = [];
        // 当前选中最后一个值
        this.lastValue = '';
        // 当前选中最后一个名
        this.lastName = '';
        // 是否已选
        this.isSelected = false;
        this.defaults = {
            // 数据
            data: [],
            // 默认选中值
            selected: [],
            // 空值项提示，可设置为数组['请选择省', '请选择市', '请选择县']
            placeholder: '请选择',
            // 是否允许搜索，可设置为数组[true, true, true],
            search: false,
            // 宽度，可设置为数组['80px','90px','100px'],['15%%','20%','25%'],['col-md-4','col-md-3','col-ms-2']
            width: '',
            // 为真只取最后一个值
            last: false,
            // select的name值，不设置则没有，数组格式
            name: [],
            // 数据分隔符
            delimiter: ',',
            // 数据的键名 status=0为禁用状态
            field: { idName: 'id', titleName: 'name', statusName: 'status', childName: 'children' },
        };
        this.configs = $.extend({}, this.defaults, opt);

        // '请选择'文字
        this.setTips = function () {
            if (Object.prototype.toString.call(this.configs.placeholder) != '[object Array]') {
                return this.configs.placeholder;
            } else {
                var i = this.$element.find('select').length;
                return this.configs.placeholder.hasOwnProperty(i) ? this.configs.placeholder[i] : '请选择';
            }
        };

        // 是否允许搜索
        this.setSearch = function () {
            if (Object.prototype.toString.call(this.configs.search) != '[object Array]') {
                return this.configs.search == true ? 'data-search="true" ' : ' ';
            } else {
                var i = this.$element.find('select').length;
                if (this.configs.search.hasOwnProperty(i)) {
                    return this.configs.search[i] == true ? 'data-search="true" ' : ' ';
                }
            }
            return '';
        };

        // 设置选择项的宽度
        this.setWidth = function () {
            if (this.configs.width == '') {
                return ' m-r-5"';
            } if (Object.prototype.toString.call(this.configs.width) != '[object Array]') {
                return /^col-*/.test(this.configs.width) ? ' ' + this.configs.width + '"' : 'm-r-5" style="width:' + this.configs.width + ';" ';
            } else {
                var i = this.$element.find('select').length;
                if (this.configs.width.hasOwnProperty(i)) {
                    return /^col-*/.test(this.configs.width[i]) ? ' ' + this.configs.width[i] + '"' : 'm-r-5" style="width:' + this.configs.width[i] + ';" ';
                }
            }
            return ' m-r-5"';
        };

        // 设置select的name值
        this.setName = function () {
            if (Object.prototype.toString.call(this.configs.name) != '[object Array]') {
                return ' name="' + this.configs.name + '"';
            } else {
                var i = this.$element.find('select').length;
                if (this.configs.name.hasOwnProperty(i)) {
                    return this.configs.name[i] ? ' name="' + this.configs.name[i] + '"' : '';
                }
            }
            return '';
        };

        // 创建一个select
        this.createSelect = function (optionData) {
            var f = this.configs.field;
            var html = '';
            html += '<div class="d-inline-block ' + this.setWidth() + '>';
            html += '  <select class="selectN form-control" ' + this.setSearch() + ' ' + this.setName() + '>';
            html += '    <option value="">' + this.setTips() + '</option>';
            for (var i = 0; i < optionData.length; i++) {
                var disabled = optionData[i][f.statusName] == 0 ? 'disabled="" ' : '';
                html += '  <option ' + disabled + 'value="' + optionData[i][f.idName] + '">' + optionData[i][f.titleName] + '</option>';
            }
            html += '  </select>';
            html += '</div>';

            return html;
        };

        // 获取当前option的数据
        this.getOptionData = function (catData, optionIndex) {
            var f = this.configs.field;
            var item = catData;

            for (var i = 0; i < optionIndex.length; i++) {
                if ('undefined' == typeof item[optionIndex[i]]) {
                    item = null;
                    break;
                } else if ('undefined' == typeof item[optionIndex[i]][f.childName]) {
                    item = null;
                    break;
                } else {
                    item = item[optionIndex[i]][f.childName];
                }
            }
            return item;
        };

        // 初始化
        this.init = function (selected) {
            var html = this.createSelect(this.configs.data);
            this.$element.append(html);
            selected = typeof selected == 'undefined' ? this.configs.selected : selected;
            var index = [];
            for (var i = 0; i < selected.length; i++) {
                // 设置最后一个selecte的选中值
                this.$element.find('select:last').val(selected[i]);
                // 获取该选中值的索引
                var lastIndex = this.$element.find('select:last').get(0).selectedIndex - 1;
                index.push(lastIndex);
                // 取出下级的选项值
                var childItem = this.getOptionData(this.configs.data, index);
                // 下级选项值存在则创建select
                if (childItem) {
                    var html = this.createSelect(childItem);
                    this.$element.append(html);
                }
            }

            if (this.sSelect) {
                var $thisSelect = $('.selectN');
                $thisSelect.lyearSelect({ search: $thisSelect.data('search') });
            }
            this.getSelected();
        };

        // 下拉事件
        this.change = function (elem) {
            var $thisItem = elem.parent();
            // 移除后面的select
            $thisItem.nextAll('div.d-inline-block').remove();
            var index = [];
            // 获取所有select，取出选中项的值和索引
            $thisItem.parent().find('select').each(function () {
                index.push($(this).get(0).selectedIndex - 1);
            });

            var childItem = this.getOptionData(this.configs.data, index);
            if (childItem) {
                var html = this.createSelect(childItem);
                $thisItem.after(html);

                if (this.sSelect) {
                    var $thisSelect = $('.selectN:visible');
                    $thisSelect.lyearSelect({ search: $thisSelect.data('search') });
                } else {
                    var $thisSelect = $('select:last');
                }
                if (typeof this.callback === 'function') {
                    this.callback($thisSelect);
                }
            }
            this.getSelected();
        };

        // 获取所有值 - 数组 每次选择后执行
        this.getSelected = function () {
            var values = [];
            var names = [];
            var selected = [];

            this.$element.find('select').each(function () {
                var item = {};
                var v = $(this).val();
                var n = $(this).find('option:selected').text();
                item.value = v;
                item.name = n;
                values.push(v);
                names.push(n);
                selected.push(item);
            });
            this.selected = selected;
            this.values = values;
            this.names = names;
            this.lastValue = this.$element.find('select:last').val();
            this.lastName = this.$element.find('option:selected:last').text();

            this.isSelected = this.lastValue == '' ? false : true;
            var inputVal = this.configs.last == true ? this.lastValue : this.values.join(this.configs.delimiter);
        };

        // ajax方式获取候选数据
        this.getData = function (url) {
            var d;
            $.ajax({
                url: url,
                dataType: 'json',
                async: false,
                success: function (json) {
                    d = json;
                },
                error: function () {
                    console.error('候选数据ajax请求错误');
                    d = false;
                }
            });
            return d;
        };
    };

    bootstrapSelectN.prototype = {
        render: function () {
            var $this = this;
            if (this.$element.length == 0) {
                console.error('找不到容器');
                return false;
            }
            if (Object.prototype.toString.call(this.configs.data) != '[object Array]') {
                var data = this.getData(this.configs.data);
                if (data === false) {
                    console.log('缺少分类数据');
                    return false;
                }
                this.configs.data = data;
            }

            // 初始化
            this.init();

            // 监听下拉事件
            this.$element.on('change', '.selectN', function (e) {
                $this.change($(this));
            });
        }
    }

    $.fn.bootstrapSelectN = function (options, callback) {
        var _this = new bootstrapSelectN(this, options, callback);
        _this.render();

        return _this;
    }
})(jQuery, window, document);