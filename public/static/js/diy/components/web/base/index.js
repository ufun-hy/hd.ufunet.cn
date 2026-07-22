Vue.component('basetitle', {
    template: `<div :style="parseCssValue(datas.content.styles)">
        <div class="basetitle-area" :style="areaheight">
            <vdr v-if="!datas.pkey" class-name="phone-block-resize mibovdr" class-name-handle="mibovdr-handle" :h="datas.content.styles.height" :x="0" :y="0" :min-height="0" :draggable="false":handles="['bm']" :active="datas.actived" :prevent-deactivation="datas.preventdeactivation" :disable-user-select="true" @resizing="onWrapResize"
            @resizestop="onWrapResizeStop" style="width:100%"></vdr>
            <div class="basetitle-box d-flex flex-j-c-c flex-a-i-c">
                <div class="flex1"><div>{{datas.content.text}}</div></div>
            </div>
        </div>
    </div>`,
    props: {
        datas: Object,
    },
    computed: {
        areaheight() {
            let calcH = this.datas.content.styles.height - (!this.datas.pkey ? 0 : (this.datas.content.styles.padding.top + this.datas.content.styles.padding.bottom + this.datas.content.styles.border.top.width + this.datas.content.styles.border.bottom.width));
            return { height: `${calcH}px`, lineHeight: `${calcH}px` }
        },
    },
    methods: {
        onWrapResize(x, y, width, height) {
            this.datas.content.styles.height = height;
        },
        onWrapResizeStop(x, y, width, height) {
            this.datas.content.styles.height = height;
        },
    }
});

Vue.component('baserichtext', {
    template: `<div :style="parseCssValue(datas.content.styles)">
        <div v-if="datas.content.text" v-html="datas.content.text" class="richtext"></div>
        <div v-else style="padding:26px;text-align:center" class="richtext">请到右侧富文本编辑器添加内容</div>
</div>`,
    props: {
        datas: Object,
    }
});

Vue.component('baseswiper', {
    template: `<div>
        <vdr v-if="!datas.pkey"  class-name="phone-block-resize mibovdr" class-name-handle="mibovdr-handle" :h="datas.content.styles.height" :x="0" :y="0" :min-height="0" :draggable="false" :handles="['bm']" :active="datas.actived" :prevent-deactivation="datas.preventdeactivation" :disable-user-select="true" @resizing="onWrapResize"
            @resizestop="onWrapResizeStop" style="width:100%" :style="resizeMargin"></vdr>
        <div class="baseswiper-area" :style="parseCssValue(datas.content.styles)">
            <van-swipe
            class="my-swipe"
            :style="swipeCss"
            :vertical="datas.content.swiper.vertical"
            :loop="datas.content.swiper.loop"
            :autoplay="datas.content.swiper.autoplay * 1000"
            :show-indicators="datas.content.swiper.showindicators"
            :indicator-color="datas.content.swiper.indicatorcolor"
            lazy-render
            :ref="'swiper'+datas.key"
            >
                <van-swipe-item v-for="(item, index) in datas.content.list" :key="index">
                    <img v-lazy="parseAttachSrc(item.src)" />
                </van-swipe-item>
            </van-swipe>
        </div>
        
    </div>`,
    props: {
        datas: Object,
    },
    methods: {
        onWrapResize(x, y, width, height) {
            this.datas.content.styles.height = height;
        },
        onWrapResizeStop(x, y, width, height) {
            this.datas.content.styles.height = height;
        },

    },
    computed: {
        swipeCss() {
            let calcW = this.datas.content.styles.width - (!this.datas.pkey ? 0 : (this.datas.content.styles.padding.left + this.datas.content.styles.padding.right + this.datas.content.styles.border.left.width + this.datas.content.styles.border.right.width));
            let calcH = this.datas.content.styles.height - (!this.datas.pkey ? 0 : (this.datas.content.styles.padding.top + this.datas.content.styles.padding.bottom + this.datas.content.styles.border.top.width + this.datas.content.styles.border.bottom.width));
            return { width: `${calcW}px`, height: `${calcH}px` }
        },
        resizeMargin() {
            return {
                marginTop: (this.datas.content.styles.margin.top + this.datas.content.styles.padding.top + this.datas.content.styles.padding.bottom + this.datas.content.styles.border.top.width) + 'px'
            }
        },
    },
    watch: {
        'datas.content': {
            deep: true,
            handler() {
                this.$nextTick(() => {
                    this.$refs[`swiper${this.datas.key}`].resize();
                })
            }
        }
    }
});



Vue.component('baseaudio', {
    template: `<div class="d-flex flex-j-c-c flex-a-i-c" :style="parseCssValue(datas.content.styles)">
    <div class="tip" :style="{padding:(datas.pkey ? '0px' : '5px')}">
        <i class="el-icon-warning"></i>
        <span>音频组件占位(页面不会显示此文字)</span>
    </div>
    <div class="music-icon d-flex" :style="iconPos"><mibo-icon :iconname="parseAttachSrc(datas.content.audio.icon) || 'music' " :iconsize="datas.content.audio.size"></mibo-icon></div>
    </div>`,
    props: {
        datas: Object,
    },
    computed: {
        iconPos() {
            return {
                // width: `${this.datas.content.audio.size}px`,
                // height: `${this.datas.content.audio.size}px`,
                // fontSize: `${this.datas.content.audio.size}px`,
                top: `${this.datas.content.audio.top}px`,
                right: `${this.datas.content.audio.right}px`,
            }
        }
    }
});


Vue.component('basevideo', {
    template: `<div :style="parseCssValue(datas.content.styles)">
    <video
    v-if="datas.content.video.type == 'normal'"
    :src="parseAttachSrc(datas.content.video.src || $nopicSrc)" 
    :poster="parseAttachSrc(datas.content.video.poster || $nopicSrc)" 
    :controls="datas.content.video.controls"
    :loop2="datas.content.video.loop"
    :autoplay2="datas.content.video.autoplay"
    :muted="datas.content.video.muted"
    class="video" 
    style="width: 100%;vertical-align: middle;pointer-events: none;"
    :style="videoheight"
    ></video>
    <template v-else>
        <iframe v-if="calcUrl" frameborder="0" :src="calcUrl" allowfullscreen="true" class="iframe" style="width: 100%;vertical-align: middle;pointer-events: none;" :style="videoheight"></iframe>
        <div v-else style="width: 100%;font-size: 14px;color: #999;text-align: center;" :style="tipcss">
            <i class="el-icon-warning-outline"></i>{{tiptext}}
        </div>
        </template>
    </div>`,
    data() {
        return {
            videotypes: {
                normal: '普通视频',
                youku: '优酷',
                qq: '腾讯',
                bilibili: '哔哩哔哩',
            },
        }
    },
    props: {
        datas: Object,
    },
    computed: {
        calcheight() {
            return this.datas.content.styles.height - (!this.datas.pkey ? 0 : (this.datas.content.styles.padding.top + this.datas.content.styles.padding.bottom + this.datas.content.styles.border.top.width + this.datas.content.styles.border.bottom.width));
        },
        videoheight() {
            return { height: `${this.calcheight}px` };
        },
        tipcss() {
            return { height: `${this.calcheight}px`, lineHeight: `${this.calcheight}px` };
        },
        tiptext() {
            let typename = this.videotypes[this.datas.content.video.type] || '';
            return ` 请输入${typename}视频对应的通用代码`;
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
    }
});



Vue.component('basenotice', {
    template: `<div :style="parseCssValue(datas.content.styles)">
        <div class="basenotice-area" :style="areaheight">
            <vdr v-if="!datas.pkey" class-name="phone-block-resize mibovdr" class-name-handle="mibovdr-handle" :h="datas.content.styles.height" :x="0" :y="0" :min-height="0" :draggable="false":handles="['bm']" :active="datas.actived" :prevent-deactivation="datas.preventdeactivation" :disable-user-select="true" @resizing="onWrapResize"
            @resizestop="onWrapResizeStop" style="width:100%"></vdr>
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
            <van-notice-bar v-else :ref="'vannotice'+datas.key" :scrollable="false">
                <template #left-icon>
                    <mibo-icon :iconname="datas.content.scroll.iconname || 'volume-o'" :iconcolor="datas.content.scroll.iconcolor" :iconsize="datas.content.scroll.iconsize"></mibo-icon>
                </template>
                <van-swipe vertical :autoplay="datas.content.scroll.autoplay * 1000" :show-indicators="false" :style="areaheight" :ref="'noticeswiper'+datas.key">
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
            let calcH = this.datas.content.styles.height - (!this.datas.pkey ? 0 : (this.datas.content.styles.padding.top + this.datas.content.styles.padding.bottom + this.datas.content.styles.border.top.width + this.datas.content.styles.border.bottom.width));
            return { height: `${calcH}px`, lineHeight: `${calcH}px` }
        },
    },
    mounted() {
        this.$bus.$on('ondragStopresetNotice', this.resetNotice);
    },
    beforeDestroy() {
        this.$bus.$off('ondragStopresetNotice', this.resetNotice);
    },
    watch: {
        'datas.content': {
            deep: true,
            handler() {
                this.resetNotice();
            }
        }
    },
    methods: {
        onWrapResize(x, y, width, height) {
            this.datas.content.styles.height = height;
        },
        onWrapResizeStop(x, y, width, height) {
            this.datas.content.styles.height = height;
        },
        resetNotice() {
            this.$nextTick(() => {
                this.$refs[`vannotice${this.datas.key}`].reset();
                if (this.datas.content.scroll.type === 'v') {
                    this.$refs[`noticeswiper${this.datas.key}`].resize();
                }
            })
        }
    },
});


Vue.component('baseline', {
    template: `<div class="d-flex flex-j-c-c flex-a-i-c" :style="parseCssValue(datas.content.styles)">
        <div :style="parseCssValue({ border: datas.content.styles.border })"></div>
    </div>`,
    props: {
        datas: Object,
    },
});

Vue.component('basecountdown', {
    template: `<van-count-down class="d-flex" :time="countDownTime" millisecond :style="parseCssValue(datas.content.styles)">
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
            return { height: `${height}px`, backgroundColor: bgcolor, border: (border.color && border.size) ? `${border.size}px solid ${border.color}` : 'none', };
        },
        boxStyle() {
            let { box, format } = this.datas.content.config;
            let { font } = box;
            let { msconfig, font: formatfont } = format;
            return {
                boxfontStyle: {
                    fontSize: `${font.size}px`,
                    lineHeight: `${font.size}px`,
                    color: font.color,
                },
                colonStyle: {
                    fontSize: `${formatfont.size}px`,
                    lineHeight: `${formatfont.size}px`,
                    color: formatfont.color,
                },
                msStyle: {
                    height: `${box.height}px`,
                    width: `${msconfig.width}px`,
                    fontSize: `${msconfig.size}px`,
                    color: msconfig.color,
                    border: this.boxbasicStyle.border,
                }
            };
        },
    },
    methods: {
        calcBoxStyle(type, timeData) {
            return { ...this.boxbasicStyle, ...{ width: this.calcBoxWidth(type, timeData) + 'px' } }
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
    template: `<div :style="parseCssValue(datas.content.styles)">
    <van-grid :column-num="datas.content.config.col" :gutter="datas.content.config.gutter" :border="false">
        <van-grid-item v-for="(item,index) in datas.content.config.list" :key="index">
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
            return this.datas.content.config.iconsize + 'px';
        },
        gridStyle() {
            let styles = this.parseCssValue({ padding: this.datas.content.config.box.padding });
            return styles;
        },
        parseTextStyle() {
            let { color, margintop, ...fonts } = this.datas.content.config.font;
            let styles = this.parseCssValue({ font: fonts });
            styles += `;margin-top:${margintop}px;line-height:1;color:${color}`;
            return styles;
        }
    }
});

