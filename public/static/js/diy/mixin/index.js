const diyMixin = {
    methods: {
        parseAttachSrc(src, isweb = '1') {
            if (!src) {
                return src;
            }
            if (src && typeof src === "string") {
                src = this.parseTextVars(src);
                if (!src) {
                    return src;
                }
                if (src.indexOf('http') === 0 || src.indexOf('/static/') === 0 || src.indexOf('webrtc://') === 0) {
                    return src;
                }
                return this.$amconfig.host + src;
            }
            return src;
        },
        parseCss(obj, parentKey = '', result = [], isweb = '1') {
            for (let key in obj) {
                if (key.indexOf('lock') !== -1) {
                    continue;
                }
                if (typeof obj[key] === 'object') {
                    this.parseCss(obj[key], parentKey ? `${parentKey}-${key}` : key, result, isweb);
                } else {
                    var property = (parentKey ? `${parentKey}-${key}` : key).split(/(?=[A-Z])/).join('-').toLowerCase();
                    var nopxpropertys = ['opacity', 'animation-iteration-count'], secondspropertys = ['animation-delay', 'animation-duration'], degpropertys = ['transrotate'], haspx = false;
                    if (!isNaN(parseFloat(obj[key])) && isFinite(obj[key]) && [...nopxpropertys, ...secondspropertys, ...degpropertys].indexOf(property) === -1) {
                        haspx = true;
                    }
                    var propertyvalue = obj[key];
                    if (haspx) {
                        if (isweb == '1') {
                            propertyvalue = obj[key] + 'px';
                        } else {
                            propertyvalue = +propertyvalue > 1 ? this.calcPx2Rem(propertyvalue) : propertyvalue + 'px';
                        }

                    } else {
                        if (property === 'background-image') {
                            if (propertyvalue) {
                                if (propertyvalue.indexOf('linear-gradient') !== -1) {
                                    propertyvalue = `${propertyvalue}`;
                                } else {
                                    propertyvalue = `url(${this.parseAttachSrc(propertyvalue)})`;
                                }
                            }
                        } else {
                            if (secondspropertys.indexOf(property) != -1) {
                                propertyvalue += 's';
                            }
                            if (degpropertys.indexOf(property) != -1) {
                                property = "transform";
                                propertyvalue = `rotate(${propertyvalue}deg)`;
                            }
                        }
                    }
                    if ((propertyvalue && typeof propertyvalue === "string") || /^-?\d+(\.\d+)?$/.test(propertyvalue)) {
                        result.push(property + ':' + propertyvalue);
                    }
                }
            }
            return result;
        },
        parseCssValue(obj, isweb) {
            isweb = isweb || '1';
            let csspropertys = this.parseCss(obj, '', [], isweb);
            let cssobjs = [], boxshadows = [], backgroundmode = '';
            if (csspropertys.length) {
                csspropertys.forEach((item) => {
                    if (item.indexOf('box-shadow') != -1) {
                        var split = item.split(':');
                        boxshadows[split[0]] = split[1];
                    } else if (item.indexOf('background-mode') != -1) {
                        var split = item.split(':');
                        backgroundmode = split[1];
                    } else {
                        cssobjs.push(item);
                    }
                })
            }
            if (Object.keys(boxshadows).length > 0) {
                cssobjs.push(`box-shadow:${boxshadows['box-shadow-h-shadow']} ${boxshadows['box-shadow-v-shadow']} ${boxshadows['box-shadow-blur']} ${boxshadows['box-shadow-spread']} ${boxshadows['box-shadow-color']}`);
            }
            if (backgroundmode) {
                cssobjs = cssobjs.concat(this.parseBackgroundMode(backgroundmode));
            }
            return cssobjs.join(';');
        },
        parseTextVars(text) {
            if (!text) return "";
            let { rootRefs } = this;
            let globalDatas = rootRefs ? rootRefs.globalDatas : {};
            var str = "", reg = /({\$.*?})/, result = text.toString().split(reg);
            if (result.length) {
                result.forEach((item) => {
                    if (!item && item !== 0) {
                        return;
                    }
                    if (!reg.test(item)) {
                        str += item;
                        return;
                    }
                    var match = item.replace(/{\$(.*?)}/g, "$1") || "";
                    if (!match) {
                        return;
                    }
                    var one = globalDatas[match];
                    if (typeof one === "undefined" || one === null) {
                        return;
                    }
                    if (one && typeof one === "string") {
                        one = one.replaceAll("\n", "<br/>");
                    }
                    str += one;
                });
            }
            return str;
        },
        parseStylecss(str) {
            var self = this;
            const pxRegex = /style="[^"]*?\b(\d+(\.\d+)?px)\b/g;
            return str.replace(pxRegex, (match, px) => {
                return match.replace(px, self.calcPx2Rem(parseFloat(px)));
            });
        },
        parseBackgroundMode(mode) {
            mode = mode || 'fill-y';
            //自适应填充
            if (mode === 'fill-y') {
                return ['background-size: auto 100%', 'background-repeat: no-repeat'];
            } else if (mode === 'fill-x') {
                //裁剪填充
                return ['background-size: 100% auto', 'background-repeat: no-repeat'];
            } else if (mode === 'repeat') {
                //平铺
                return ['background-repeat: repeat'];
            } else if (mode === 'repeat-x') {
                //横向平铺
                return ['background-repeat: repeat-x'];
            } else if (mode === 'repeat-y') {
                //纵向平铺
                return ['background-repeat: repeat-y'];
            } else if (mode === 'fill') {
                //完全拉伸
                return ['background-size: 100% 100%'];
            } else if (mode === 'imgsize') {
                //原始尺寸
                return ['background-repeat: no-repeat'];
            } else {
                return ['background-size: auto 100%', 'background-repeat: no-repeat'];
            }
        },
        styleHasProperty(prop) {
            if (prop.indexOf('.') === -1) {
                return this.styles.hasOwnProperty(prop);
            } else {
                let props = prop.split('.');
                let hasprop1 = this.styles.hasOwnProperty(props[0]);
                if (!hasprop1) {
                    return false;
                }
                return this.styles[props[0]].hasOwnProperty(props[1]);
            }

        },
        initSonWidgetData(widget, position) {
            position = position || { top: 20, left: 20 };
            let styles = position;
            if (widget.component.indexOf('base') === 0) {
                const margins = { top: 0, left: 0, bottom: 0, right: 0 };
                if (widget.content.styles.margin) widget.content.styles.margin = Object.assign(widget.content.styles.margin, margins);
                widget.content.styles.padding = Object.assign(widget.content.styles.padding, margins);
                styles = Object.assign(styles, { width: widget.width, height: widget.height });
            }
            widget.content.styles = Object.assign(widget.content.styles, styles);
            if (widget.childtype) {
                if (widget.component === 'freeimage') {
                    if (widget.childtype === 'circle') {
                        let radius = 80;
                        widget.content.styles.border.top.leftRadius = radius;
                        widget.content.styles.border.top.rightRadius = radius;
                        widget.content.styles.border.bottom.leftRadius = radius;
                        widget.content.styles.border.bottom.rightRadius = radius;
                    }
                } else if (widget.component === 'freeicon') {
                    if (['square', 'circle'].indexOf(widget.childtype) !== -1) {
                        widget.content.icon = Object.assign(widget.content.icon, { color: '#fff' });
                        let radius = 12, width = 60;
                        if (widget.childtype === 'circle') {
                            radius = 26;
                            width = radius * 2;
                        }
                        widget.content.styles.border.top.leftRadius = radius;
                        widget.content.styles.border.top.rightRadius = radius;
                        widget.content.styles.border.bottom.leftRadius = radius;
                        widget.content.styles.border.bottom.rightRadius = radius;
                        widget.content.styles.background.color = '#409EFF';
                        widget.content.styles.width = width;
                        widget.content.styles.height = width;
                    }
                }
                //处理名称
                let widgetchilds = widget.children || [];
                let childone = widgetchilds.filter((child) => {
                    return child.type === widget.childtype;
                });
                if (childone.length) {
                    let childtitle = childone[0].label || '';
                    if (childtitle) {
                        widget.title += `-${childtitle}`;
                    }
                }
            }
            if (widget.hasOwnProperty('childtype')) {
                delete widget.childtype;
            }
            if (widget.hasOwnProperty('children')) {
                delete widget.children;
            }
            return widget;
        },
        calcPx2Rem(px) {
            return (px * 7.5 / 375) + 'rem';
        },
        freeBlockClass(datas) {
            return datas.component + (datas.content.overflow ? ' ' + this.freeblockOverflow(datas.content.overflow) : '');
        },
        freeblockOverflow(overflow) {
            return overflow ? `free-overflow-${overflow}` : '';
        },
        calcEventTitle(config) {
            let title = config.title;
            let eventcate = config.cate;
            let eventtype = config.type;
            if (eventcate === 'controlbtn') {
                if (eventtype === 'tiptext') {
                    title += ':' + (config.params.text.val || '空');
                } else if (eventtype === 'callphone') {
                    title += ':' + (config.params.phone.val || '空');
                } else if (eventtype === 'tipimg') {
                    title += ':' + (config.params.imglist.val.length + '张');
                }
            } else if (eventcate === 'outerlink') {
                title += ':' + (config.params.redirect.val || '空');
            } else if (eventcate === 'hdpage') {
                title = '跳转功能:' + title;
            } else if (eventcate === 'diypage') {
                title = '跳转页面:' + title;
            }
            return title;
        },
        clickEvent(clickconfig, event) {
            let config = clickconfig || '';
            if (!config) {
                return false;
            }
            let eventcate = config.cate || '';
            let eventtype = config.type || '';
            if (!eventcate) {
                return false;
            }
            if (eventcate === 'hdpage') {
                let url = '/wechat/';
                if (eventtype === 'myrecord') {
                    url += 'home/myrecord';
                } else {
                    url += `${eventtype}/index`;
                }
                url += `?hdid=${XCV3Config.hdid}`;
                window.location.href = url;
            } else if (eventcate === 'diypage') {
                let url = `/wechat/microsite/index?hdid=${XCV3Config.hdid}&pageid=${config.pageid}`;
                window.location.href = url;
            } else if (eventcate === 'controlbtn') {
                if (eventtype === 'tiptext') {
                    let message = config.params.text.val || '';
                    if (message) vant.Toast({
                        message: message,
                        duration: (config.params.duration.val || '3') * 1000,
                    });
                } else if (eventtype === 'callphone') {
                    let phonenumber = config.params.phone.val || '';
                    if (phonenumber) {
                        const link = document.createElement('a');
                        link.href = `tel:${phonenumber}`;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                } else if (eventtype === 'tipimg') {
                    let imglist = config.params.imglist.val || '';
                    if (imglist.length) {
                        imglist = imglist.map((item) => {
                            return this.parseAttachSrc(item.src) || ''
                        });
                        vant.ImagePreview({
                            images: imglist,
                            closeable: true,
                            overlayStyle: {
                                backgroundColor: (config.params.overlay.val ? 'rgba(0, 0, 0, .78)' : 'transparent'),
                            }
                        });
                    }
                }
            } else if (eventcate === 'outerlink') {
                let url = config.params.redirect.val || '';
                if (eventtype && url) {
                    if (eventtype === 'normal') {
                        window.location.href = url
                    } else {
                        this.rootRefs.$refs.tipbox.showbox({
                            type: 'iframe',
                            url: url
                        })
                    }
                }
            }
        },
    }
}
Vue.mixin(diyMixin);