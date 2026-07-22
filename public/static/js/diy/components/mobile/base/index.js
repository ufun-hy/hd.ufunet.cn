Vue.component('basetitle', {
    template: `<div :style="parseCssValue(datas.content.styles,'2')" @click="clickEvent(datas.content.click,$event)">
        <div class="basetitle-area" :style="areaheight">
            <div class="basetitle-box d-flex flex-j-c-c flex-a-i-c">
                <div class="flex1"><div>{{datas.content.text}}</div></div>
            </div>
        </div>
    </div>`,
    inject: ['rootRefs'],
    props: {
        datas: Object,
    },
    computed: {
        areaheight() {
            let calcH = this.calcPx2Rem(this.datas.content.styles.height - (!this.datas.pkey ? 0 : (this.datas.content.styles.padding.top + this.datas.content.styles.padding.bottom + this.datas.content.styles.border.top.width + this.datas.content.styles.border.bottom.width)));
            return { height: calcH, lineHeight: calcH };
        }
    },
});

Vue.component('baserichtext', {
    template: `<div :style="parseCssValue(datas.content.styles,'2')">
                <div class="fix1px"></div>
                <div v-if="datas.content.text" v-html="parseStylecss(datas.content.text)"></div>
                <div v-else style="padding:30px;text-align:center">请到右侧富文本编辑器添加内容</div>
                <div class="fix1px"></div>
            </div>`,
    props: {
        datas: Object,
    },
    data() {
        return {

        }
    }
});

Vue.component('baseswiper', {
    template: `<div :style="baseswiperStyle.outer">
        <div class="baseswiper-area" :style="baseswiperStyle.inner">
            <van-swipe
            class="my-swipe"
            :vertical="datas.content.swiper.vertical"
            :loop="datas.content.swiper.loop"
            :autoplay="datas.content.swiper.autoplay * 1000"
            :show-indicators="datas.content.swiper.showindicators"
            :indicator-color="datas.content.swiper.indicatorcolor"
            lazy-render
            >
                <van-swipe-item v-for="(item, index) in datas.content.list" :key="index"  @click="clickEvent(item.click,$event)">
                    <img v-lazy="parseAttachSrc(item.src)" />
                </van-swipe-item>
            </van-swipe>
        </div>
    </div>`,
    inject: ['rootRefs'],
    props: {
        datas: Object,
    },
    computed: {
        baseswiperStyle() {
            let outer = {};
            let inner = {};
            if (this.datas.pkey) {
                let { top, left, ...styles } = this.datas.content.styles;
                outer = {
                    top: this.calcPx2Rem(top),
                    left: this.calcPx2Rem(left),
                };
                inner = this.parseCssValue(styles, '2')
            } else {
                inner = this.parseCssValue(this.datas.content.styles, '2');
            }
            return {
                outer: outer,
                inner: inner,
            }
        },
        swipeCss() {
            let calcW = this.datas.content.styles.width - (!this.datas.pkey ? 0 : (this.datas.content.styles.padding.left + this.datas.content.styles.padding.right + this.datas.content.styles.border.left.width + this.datas.content.styles.border.right.width));
            let calcH = this.datas.content.styles.height - (!this.datas.pkey ? 0 : (this.datas.content.styles.padding.top + this.datas.content.styles.padding.bottom + this.datas.content.styles.border.top.width + this.datas.content.styles.border.bottom.width));
            return { width: this.calcPx2Rem(calcW), height: this.calcPx2Rem(calcH) }
        },
    }
});


Vue.component('baseaudio', {
    template: `<div class="d-flex flex-j-c-c flex-a-i-c">
        <div :class="['music-icon','d-flex',{isplaying:isplaying}]" :style="iconPos" @click="playAudio"><mibo-icon :iconname="paserAudioIcon" :iconsize="calcPx2Rem(this.datas.content.audio.size)"></mibo-icon></div>
    </div>`,
    data() {
        return {
            audioobj: null,
            isplaying: false,
            isloaded: false,
        };
    },
    props: {
        datas: Object,
    },
    computed: {
        iconPos() {
            return {
                top: this.calcPx2Rem(this.datas.content.audio.top),
                right: this.calcPx2Rem(this.datas.content.audio.right),
            }
        },
        paserAudioIcon() {
            return this.parseAttachSrc(this.datas.content.audio.icon) || 'music';
        },
    },
    mounted() {
        this.audioobj = new Howl({
            src: this.parseAttachSrc(this.datas.content.audio.src || 'noAudio'),
            loop: this.datas.content.audio.loop,
            html5: /iPad|iPhone|iPod/.test(navigator.userAgent),
            preload: false,
            onloaderror: (id, err) => {
                vant.Toast('音频加载失败');
            },
            onload: () => {
                this.isloaded = true;
                this.audioobj.play();
            },
            onplay: (id) => {
                this.isplaying = true;
            },
            onplayerror: (id, err) => {
                vant.Toast('音频播放失败');
            },
            onend: (id) => {
                this.isplaying = this.datas.content.audio.loop;
            },
            onpause: (id) => {
                this.isplaying = false;
            },
            //not used
            onstop: (id) => {
                this.isplaying = false;
            },
        });
        if (this.datas.content.audio.autoplay) {
            this.$mobileapp.autoPlay(() => {
                this.audioobj.load();
            });
        }
    },
    beforeDestroy() {
        this.audioobj.unload();
    },
    methods: {
        playAudio() {

            if (this.audioobj.playing()) {
                this.audioobj.pause();
            } else {
                if (this.isloaded) {
                    this.audioobj.play();
                } else {
                    this.audioobj.load();
                }
            }
        }
    }
});

Vue.component('basevideo', {
    template: `<div :style="parseCssValue(datas.content.styles,'2')">
        <video
        v-if="datas.content.video.type == 'normal'"
        class="video"
        :id="datas.key + '-video'" 
        style="width: 100%;vertical-align: middle;"
        :style="videoheight"
        webkit-playsinline playsinline x5-video-player-type='h5'
        ></video>
        <template v-else>
            <iframe v-if="calcUrl" frameborder="0" :src="calcUrl" allowfullscreen="true" class="iframe" style="width: 100%;vertical-align: middle;" :style="videoheight"></iframe>
            <div v-else style="width: 100%;font-size: 14px;color: #999;text-align: center;" :style="tipcss">
                <i class="el-icon-warning-outline"></i>{{tiptext}}
            </div>
        </template>
    </div>`,
    props: {
        datas: Object,
    },
    data() {
        return {
            player: null,
        };
    },
    computed: {
        calcheight() {
            return this.calcPx2Rem(this.datas.content.styles.height - (!this.datas.pkey ? 0 : (this.datas.content.styles.padding.top + this.datas.content.styles.padding.bottom + this.datas.content.styles.border.top.width + this.datas.content.styles.border.bottom.width)));
        },
        videoheight() {
            return { height: this.calcheight };
        },
        tipcss() {
            return { height: this.calcheight, lineHeight: this.calcheight };
        },
        tiptext() {
            let typename = this.videotypes[this.datas.content.video.type] || '';
            return `请输入${typename}视频对应的通用代码`;
        },
        calcUrl() {
            let videotype = this.datas.content.video.type || '';
            let url = this.datas.content.video[videotype + 'src'] || '';
            if (url) {
                const srcRegex = /src=(?:"([^"]+)"|'([^']+)')/g;
                let match;
                const srcs = [];
                while ((match = srcRegex.exec(url))) {
                    srcs.push(match[1] || match[2]);
                }
                url = srcs ? srcs[0] : '';
                if (url) {
                    return url;
                }
            }
            return url;
        }
    },
    methods: {
        init() {
            if (this.datas.content.video.type == 'normal') {
                const Button = TCPlayer.getComponent('Button');
                const BigPlayButton = TCPlayer.getComponent('BigPlayButton');
                BigPlayButton.prototype.createEl = function () {
                    var el = Button.prototype.createEl.call(this);
                    el.appendChild(TCPlayer.dom.createEl('div', {
                        className: 'vjs-button-icon playpauseBtn',
                        innerHTML: '<i class="van-icon van-icon-play-circle"></i>',
                    }));
                    return el;
                };
                this.player = TCPlayer(`${this.datas.key}-video`, {
                    controls: this.datas.content.video.controls,
                    autoplay: this.datas.content.video.autoplay,
                    loop: this.datas.content.video.loop,
                    poster: this.parseAttachSrc(this.datas.content.video.poster || this.$nopicSrc),
                    muted: this.datas.content.video.muted,
                    controlBar: {
                        volumePanel: true,
                    },
                    plugins: {
                        ContinuePlay: {
                            auto: true
                        },
                    },
                    reportable: false,
                });
                this.player.src(this.parseAttachSrc(this.datas.content.video.src || this.$nopicSrc));
                this.player.one('blocked', () => {
                    this.$mobileapp.autoPlay((flag) => {
                        if (!flag) {
                            this.player.muted(true);
                        }
                        this.player.play();
                    });
                });
            }
        }
    },
    mounted() {
        this.init();
    },
    beforeDestroy() {
        if (this.player) this.player.dispose();
    }
});

Vue.component('basenotice', {
    template: `<div :style="parseCssValue(datas.content.styles,'2')">
        <div class="basenotice-area" :style="areaheight">
            <template v-if="datas.content.scroll.type === 'h'">
                <van-notice-bar v-if="datas.content.scroll.scrollable === '3'" :ref="'vannotice'+datas.key" :text="datas.content.text" :speed="datas.content.scroll.speed">
                    <template #left-icon>
                        <mibo-icon :iconname="datas.content.scroll.iconname || 'volume-o'" :iconcolor="datas.content.scroll.iconcolor" :iconsize="datas.content.scroll.iconsize"></mibo-icon>
                    </template>
                </van-notice-bar>
                <van-notice-bar v-else :ref="'vannotice'+datas.key" :text="datas.content.text" :scrollable="datas.content.scroll.scrollable === '1' ? true : false" :speed="datas.content.scroll.speed">
                    <template #left-icon>
                        <mibo-icon :iconname="datas.content.scroll.iconname || 'volume-o'" :iconcolor="datas.content.scroll.iconcolor" :iconsize="datas.content.scroll.iconsize"></mibo-icon>
                    </template>
                </van-notice-bar>
            </template>
            <van-notice-bar v-else :scrollable="false">
                <template #left-icon>
                    <mibo-icon :iconname="datas.content.scroll.iconname || 'volume-o'" :iconcolor="datas.content.scroll.iconcolor" :iconsize="datas.content.scroll.iconsize"></mibo-icon>
                </template>
                <van-swipe vertical :autoplay="datas.content.scroll.autoplay * 1000" :show-indicators="false" :style="areaheight">
                    <van-swipe-item v-for="(n,index) in datas.content.list" :key="index">{{n.content}}</van-swipe-item>
                </van-swipe>
            </van-notice-bar>
        </div>
    </div>`,
    props: {
        datas: Object,
    },
    computed: {
        areaheight() {
            let calcH = this.calcPx2Rem(this.datas.content.styles.height - (!this.datas.pkey ? 0 : (this.datas.content.styles.padding.top + this.datas.content.styles.padding.bottom + this.datas.content.styles.border.top.width + this.datas.content.styles.border.bottom.width)));
            return { height: calcH, lineHeight: calcH };
        }
    },
});


Vue.component('baseline', {
    template: `<div class="d-flex flex-j-c-c flex-a-i-c" :style="parseCssValue(datas.content.styles,'2')">
        <div :style="parseCssValue({ border: this.datas.content.styles.border },'2')"></div>
    </div>`,
    props: {
        datas: Object,
    }
});

Vue.component('basecountdown', {
    template: `<van-count-down class="d-flex" :time="countDownTime" millisecond :style="parseCssValue(datas.content.styles,'2')">
                <template #default="data">
                    <span v-if="prefixSuffix.start">{{prefixSuffix.start}}</span>
                    <div class="basecountdown-format d-flex flex-a-i-c">
                        <div class="item d-flex flex-j-c-c flex-a-i-c" :style="calcBoxStyle('1',data)" v-if="datas.content.config.format.day">
                            <div :style="boxStyle.boxfontStyle">{{ calcCoundownTime('1',data) }}</div>
                        </div>
                        <div class="colon d-flex flex-j-c-c" :style="boxStyle.colonStyle" v-if="datas.content.config.format.day"> {{ countDowmUnit.d }} </div>

                        <div class="item d-flex flex-j-c-c flex-a-i-c" :style="calcBoxStyle('2',data)" v-if="datas.content.config.format.hour">
                            <div :style="boxStyle.boxfontStyle">{{ calcCoundownTime('2',data) }}</div>
                        </div>
                        <div class="colon d-flex flex-j-c-c" :style="boxStyle.colonStyle" v-if="datas.content.config.format.hour"> {{ countDowmUnit.h }} </div>

                        <div class="item d-flex flex-j-c-c flex-a-i-c" :style="calcBoxStyle('3',data)" v-if="datas.content.config.format.minute">
                            <div :style="boxStyle.boxfontStyle">{{ calcCoundownTime('3',data) }}</div>
                        </div>
                        <div class="colon d-flex flex-j-c-c" :style="boxStyle.colonStyle" v-if="datas.content.config.format.minute"> {{ countDowmUnit.m }} </div>
                        
                        <div class="item d-flex flex-j-c-c flex-a-i-c" :style="calcBoxStyle('4',data)" v-if="datas.content.config.format.second">
                            <div :style="boxStyle.boxfontStyle">{{ calcCoundownTime('4',data) }}</div>
                        </div>
                        <div class="colon d-flex flex-j-c-c" :style="boxStyle.colonStyle" v-if="datas.content.config.format.second"> {{ countDowmUnit.s }} </div>

                        <div class="item d-flex flex-j-c-c flex-a-i-c" :style="boxStyle.msStyle" v-if="datas.content.config.format.ms">
                            <div>{{ data.milliseconds.toString().slice(0, datas.content.config.format.msconfig.type||1) }}</div>
                        </div>
                    </div>
                    <span v-if="prefixSuffix.end">{{prefixSuffix.end}}</span>
                </template>
            </van-count-down>`,
    props: {
        datas: Object,
        timeObj: null,
    },
    computed: {
        countDownTime() {
            return this.datas.content.config.endtime - new Date().getTime();
        },
        prefixSuffix() {
            return this.datas.content.config.presuffix;
        },
        countDowmUnit() {
            let units = { d: ':', h: ':', m: ':', s: ':' };
            let type = this.datas.content.config.format.type || 1;
            if (type === 1) {
                units = Object.assign(units, { d: '天', h: '时', m: '分', s: '秒' });
                let msunit = this.datas.content.config.format.secondsunit || 1;
                if (msunit === 2) {
                    units.s = 's';
                }
            } else {
                let ms = this.datas.content.config.format.ms;
                if (!ms) {
                    units.s = '';
                } else {
                    units.s = '.';
                }
            }
            return units;
        },
        boxbasicStyle() {
            let { height, bgcolor, border } = this.datas.content.config.box;
            return { height: `${this.calcPx2Rem(height)}`, backgroundColor: bgcolor, border: (border.color && border.size) ? `${this.calcPx2Rem(border.size)} solid ${border.color}` : 'none', };
        },
        boxStyle() {
            let { box, format } = this.datas.content.config;
            let { font } = box;
            let { msconfig, font: formatfont } = format;
            return {
                boxfontStyle: {
                    fontSize: this.calcPx2Rem(font.size),
                    lineHeight: this.calcPx2Rem(font.size),
                    color: font.color,
                },
                colonStyle: {
                    fontSize: this.calcPx2Rem(formatfont.size),
                    lineHeight: this.calcPx2Rem(formatfont.size),
                    color: formatfont.color,
                },
                msStyle: {
                    height: this.calcPx2Rem(box.height),
                    width: this.calcPx2Rem(msconfig.width),
                    fontSize: this.calcPx2Rem(msconfig.size),
                    color: msconfig.color,
                    border: this.boxbasicStyle.border,
                }
            };
        },
    },
    methods: {
        calcBoxStyle(type, timeData) {
            return { ...this.boxbasicStyle, ...{ width: this.calcPx2Rem(this.calcBoxWidth(type, timeData)) } }
        },
        calcBoxWidth(type, timeData) {
            let width = this.datas.content.config.box.width;
            let data = this.calcCoundownTime(type, timeData);
            if (data.length > 2) {
                let num = Math.floor((data.length - 2) / 2);
                if (num > 0) {
                    width += width * num;
                }
                if ((data.length % 2) > 0) {
                    width += width / 2;
                }
            }
            return width;
        },
        calcCoundownTime(type, timeData) {
            let time = 0;
            if (type === '1') {
                time = timeData.days;
            } else if (type === '2') {
                time = timeData.hours;
                if (!this.datas.content.config.format.day) {
                    time += timeData.days * 24;
                }
            } else if (type === '3') {
                time = timeData.minutes;
                if (!this.datas.content.config.format.day) {
                    if (!this.datas.content.config.format.hour) {
                        time += timeData.days * 24 * 60;
                        time += timeData.hours * 60;
                    }
                } else {
                    if (!this.datas.content.config.format.hour) {
                        time += timeData.hours * 60;
                    }
                }
            } else if (type === '4') {
                time = timeData.seconds;
                if (!this.datas.content.config.format.day) {
                    if (!this.datas.content.config.format.hour) {
                        if (!this.datas.content.config.format.minute) {
                            time += timeData.days * 24 * 60 * 60;
                            time += timeData.hours * 60 * 60;
                            time += timeData.minutes * 60;
                        }
                    } else {
                        if (!this.datas.content.config.format.minute) {
                            time += timeData.minutes * 60;
                        }
                    }
                } else {
                    if (!this.datas.content.config.format.hour) {
                        if (!this.datas.content.config.format.minute) {
                            time += timeData.hours * 60 * 60;
                            time += timeData.minutes * 60;
                        }
                    } else {
                        if (!this.datas.content.config.format.minute) {
                            time += timeData.minutes * 60;
                        }
                    }
                }
            }
            time = time.toString();
            return (type !== '1' && time.length < 2) ? `0${time}` : time;
        },
    }
});

Vue.component('basemenu', {
    template: `<div :style="parseCssValue(datas.content.styles,'2')">
    <van-grid :column-num="datas.content.config.col" :gutter="datas.content.config.gutter" :border="false">
        <van-grid-item v-for="(item,index) in datas.content.config.list" :key="index" @click="clickEvent(item.click,$event)">
            <div class="menu-item d-flex flex-d-c flex-j-c-c flex-a-i-c" :style="gridStyle">
                <div v-if="item.type === 1 && item.iconname" :style="{height: calcSize,lineHeight:calcSize}">
                    <mibo-icon :iconname="item.iconname" :iconsize="calcSize" :iconcolor="item.iconcolor"></mibo-icon>
                </div>
                <div v-else-if="item.type === 2 && item.src" :style="{height: calcSize,lineHeight:calcSize}">
                    <img :src="parseAttachSrc(item.src)" :style="{width: calcSize,height: calcSize}" />
                </div>
                <span v-if="item.text" :style="parseTextStyle">{{item.text}}</span>
            </div>
        </van-grid-item>
    </van-grid>
  </div>`,
    props: {
        datas: Object,
    },
    computed: {
        calcSize() {
            return this.calcPx2Rem(this.datas.content.config.iconsize);
        },
        gridStyle() {
            let styles = this.parseCssValue({ padding: this.datas.content.config.box.padding }, '2');
            return styles;
        },
        parseTextStyle() {
            let { color, margintop, ...fonts } = this.datas.content.config.font;
            let styles = this.parseCssValue({ font: fonts }, '2');
            styles += `;margin-top:${this.calcPx2Rem(margintop)};line-height:1;color:${color}`;
            return styles;
        }
    }
});