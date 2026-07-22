Vue.component('basetitlestyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
    <el-collapse value="1">
        <el-collapse-item title="属性" name="1" disabled>
            <el-form label-width="80px" size="mini">
                <el-form-item label="文字内容">
                    <el-input type="textarea" v-model="datas.content.text" :rows="5" placeholder="请输入文本内容"></el-input>
                </el-form-item>
                <el-form-item label="点击事件">
                    <mibo-input-clickevent v-model="datas.content.click"></mibo-input-clickevent>
                </el-form-item>
            </el-form>
        </el-collapse-item>
    </el-collapse>
    </el-tab-pane>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
    <component :is="pane.component" :styles="datas.content.styles" :pkey="datas.pkey||''"></component>
    </el-tab-pane>
    </el-tabs>`,
    props: {
        datas: Object
    },
    data() {
        return {
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
            ],
        }
    }
});

Vue.component('baserichtextstyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
    <el-collapse value="1">
        <el-collapse-item title="内容" name="1" disabled>
            <el-form label-width="80px" size="mini">
                <el-form-item label="内容超出" v-show="datas.pkey">
                    <el-radio-group v-removeAriaHidden v-model="overflowtype">
                        <el-radio-button label="截断隐藏"></el-radio-button>
                        <el-radio-button label="溢出显示"></el-radio-button>
                        <el-radio-button label="超出滚动"></el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label-width="0px">
                    <mibo-tinymce-editor v-model="datas.content.text"></mibo-tinymce-editor>
                </el-form-item>
            </el-form>
        </el-collapse-item>
    </el-collapse>
    </el-tab-pane>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
    <component :is="pane.component" :styles="datas.content.styles" :pkey="datas.pkey||''"></component>
    </el-tab-pane>
    </el-tabs>`,
    props: {
        datas: Object
    },
    data() {
        return {
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
            ],
        }
    },
    computed: {
        overflowtype: {
            get() {
                return this.datas.content.overflow == 'hidden' ? '截断隐藏' : (this.datas.content.overflow == 'visible' ? '溢出显示' : '超出滚动');
            },
            set(value) {
                this.datas.content.overflow = (value === '截断隐藏' ? 'hidden' : ((value == '溢出显示' ? 'visible' : 'scroll')));
            }
        },
    },
});

Vue.component('baseswiperstyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
    <el-collapse value="1">
        <el-collapse-item title="属性" name="1" disabled>
            <el-form label-width="100px" size="mini">
                <el-form-item label="切换方向">
                    <el-radio-group v-removeAriaHidden v-model="isvertical">
                        <el-radio-button label="横向"></el-radio-button>
                        <el-radio-button label="纵向"></el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="切换间隔(秒)" class="el-form-item-slider">
                    <el-slider v-model="datas.content.swiper.autoplay" :step="0.1" :min="0" :max="10" show-input input-size="mini"></el-slider>
                    <el-popover
                        placement="top-start"
                        title="温馨提醒"
                        width="200"
                        trigger="hover"
                        content="设置切换间隔为0则轮播图不会自动切换">
                        <template #reference>
                            <el-button type="text" icon="el-icon-warning-outline" style="position: absolute;top: 4px;right: 135px;"></el-button>
                        </template>
                    </el-popover>
                </el-form-item>
                <el-form-item label="循环播放">
                    <el-switch v-model="datas.content.swiper.loop"></el-switch>
                </el-form-item>
                <el-form-item label="分页器">
                    <el-switch v-model="datas.content.swiper.showindicators"></el-switch>
                </el-form-item>
                <el-form-item label="分页器颜色" v-show="datas.content.swiper.showindicators">
                    <el-color-picker v-model="datas.content.swiper.indicatorcolor" show-alpha></el-color-picker>
                </el-form-item>
                <el-divider>轮播图列表</el-divider>
                <el-form-item label="" label-width="0">
                    <vdp tag="div" v-model="datas.content.list" animation="100" direction="vertical">
                        <div v-for="(l,index) in datas.content.list" :key="index" class="swiper-lists">
                            <el-row type="flex" justify="space-around">
                                <el-col :span="4" class="list-left d-flex flex-j-c-c flex-a-i-c">
                                    <el-image style="width: 56px; height: 56px" :src="parseAttachSrc(l.src)" fit="scale-down"></el-image>
                                </el-col>
                                <el-col :span="16" class="list-center">
                                    <mibo-input-attachment v-model="l.src" hasprepend :prepend="{type:'text',title:'选择图片'}" style="margin-bottom:5px"></mibo-input-attachment>
                                    <mibo-input-clickevent v-model="l.click" hasprepend></mibo-input-clickevent>
                                </el-col>
                                <el-col :span="4" class="list-right">
                                    <el-row type="flex" justify="space-around" align="middle">
                                        <el-button class="btn-move" icon="el-icon-sort" circle></el-button>
                                        <el-popconfirm title="删除将无法恢复，您确定删除吗？" @confirm="removeOne(index)">
                                            <template #reference>
                                                <el-button icon="el-icon-delete" circle></el-button>
                                            </template>
                                        </el-popconfirm>
                                    </el-row>
                                </el-col>
                            </el-row>
                        </div>
                    </vdp>
                    <div class="d-flex flex-j-c-c flex-a-i-c">
                        <el-button type="primary" icon="el-icon-plus" @click="addOne">新增</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </el-collapse-item>
    </el-collapse>
    </el-tab-pane>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
    <component :is="pane.component" :styles="datas.content.styles" :pkey="datas.pkey||''"></component>
    </el-tab-pane>
    </el-tabs>`,
    props: {
        datas: Object
    },
    data() {
        return {
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
            ],
        }
    },
    computed: {
        isvertical: {
            get() {
                return this.datas.content.swiper.vertical ? '纵向' : '横向';
            },
            set(value) {
                this.datas.content.swiper.vertical = (value === "纵向" ? true : false);
            }
        },
    },
    methods: {
        addOne() {
            let one = {
                src: '/static/images/diy/1.png',
                click: {
                    cate: '',
                    type: '',
                    title: '',
                    params: {},
                }
            };
            this.datas.content.list.push(one);
        },
        removeOne(index) {
            this.datas.content.list.splice(index, 1);
        }
    }
});

Vue.component('baseaudiostyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
    <el-collapse value="1">
        <el-collapse-item title="属性" name="1" disabled>
            <el-form label-width="80px" size="mini">
                <el-form-item label="音频地址">
                    <mibo-input-attachment v-model="datas.content.audio.src" type='2'></mibo-input-attachment>
                </el-form-item>
                <el-form-item label="循环播放">
                    <el-switch v-model="datas.content.audio.loop"></el-switch>
                </el-form-item>
                <el-form-item label="自动播放">
                    <el-switch v-model="datas.content.audio.autoplay"></el-switch>
                    <el-popover
                        placement="top-start"
                        title="温馨提醒"
                        width="200"
                        trigger="hover"
                        content="部分浏览器无法自动播放，需要手动点击播放图标进行播放">
                        <template #reference>
                            <el-button type="text" icon="el-icon-warning-outline"></el-button>
                        </template>
                    </el-popover>
                </el-form-item>
                <el-form-item label="图标">
                    <mibo-uploadbox v-model="datas.content.audio.icon" hastip hasdelete></mibo-uploadbox>
                </el-form-item>
                <el-form-item label="大小" class="el-form-item-slider">
                    <el-slider v-model="datas.content.audio.size" :min="10" :max="100" :step="1" show-input input-size="mini"></el-slider>
                </el-form-item>
                <el-form-item label="顶部" class="el-form-item-slider">
                    <el-slider v-model="datas.content.audio.top" :min="1" :max="500" :step="1" show-input input-size="mini"></el-slider>
                </el-form-item>
                <el-form-item label="右侧" class="el-form-item-slider">
                    <el-slider v-model="datas.content.audio.right" :min="1" :max="360" :step="1" show-input input-size="mini"></el-slider>
                </el-form-item>
            </el-form>
        </el-collapse-item>
    </el-collapse>
    </el-tab-pane>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
    <component :is="pane.component" :styles="datas.content.styles" :pkey="datas.pkey||''"></component>
    </el-tab-pane>
    </el-tabs>`,
    props: {
        datas: Object
    },
    data() {
        return {
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
            ],
        }
    },
});

Vue.component('basevideostyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
    <el-collapse value="1">
        <el-collapse-item title="属性" name="1" disabled>
            <el-form label-width="80px" size="mini">
                <el-form-item label="视频类型">
                    <el-radio-group v-removeAriaHidden v-model="videotype">
                        <el-radio-button v-for="(v,index) of videotypes" :key="index" :label="v"></el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <div v-if="datas.content.video.type === 'normal'">
                    <el-form-item label="视频地址">
                        <mibo-input-attachment v-model="datas.content.video.src" type="3" @select-attachment="selectVideo"></mibo-input-attachment>
                    </el-form-item>
                    <el-alert title="支持普通直播以及腾讯云低延迟直播" type="info" show-icon style="margin-bottom:12px;padding:5px 10px;"></el-alert>
                    <el-form-item label="视频封面">
                        <mibo-input-attachment v-model="datas.content.video.poster"></mibo-input-attachment>
                    </el-form-item>
                    <el-form-item label="控制按钮">
                        <el-switch v-model="datas.content.video.controls"></el-switch>
                    </el-form-item>
                    <el-form-item label="循环播放">
                        <el-switch v-model="datas.content.video.loop"></el-switch>
                    </el-form-item>
                    <el-form-item label="自动播放">
                        <el-switch v-model="datas.content.video.autoplay"></el-switch>
                        <el-popover
                        placement="top-start"
                        title="温馨提醒"
                        width="200"
                        trigger="hover"
                        content="部分浏览器在非静音模式下无法自动播放，若自动播放受阻系统会自动转成静音模式来自动播放">
                        <template #reference>
                            <el-button type="text" icon="el-icon-warning-outline"></el-button>
                        </template>
                        </el-popover>
                    </el-form-item>
                    <el-form-item label="静音播放">
                        <el-switch v-model="datas.content.video.muted"></el-switch>
                    </el-form-item>
                </div>
                <el-form-item label="通用代码" v-else-if="datas.content.video.type === 'youku'">
                    <el-input placeholder="输入优酷视频通用代码" v-model="datas.content.video.youkusrc" clearable></el-input>
                </el-form-item>
                <el-form-item label="通用代码" v-else-if="datas.content.video.type === 'qq'">
                    <el-input placeholder="输入腾讯视频通用代码" v-model="datas.content.video.qqsrc" clearable></el-input>
                </el-form-item>
                <el-form-item label="通用代码" v-else-if="datas.content.video.type === 'bilibili'">
                    <el-input placeholder="输入哔哩哔哩视频通用代码" v-model="datas.content.video.bilibilisrc" clearable></el-input>
                </el-form-item>
            </el-form>
        </el-collapse-item>
    </el-collapse>
    </el-tab-pane>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
    <component :is="pane.component" :styles="datas.content.styles" :pkey="datas.pkey||''"></component>
    </el-tab-pane>
    </el-tabs>`,
    props: {
        datas: Object
    },
    data() {
        return {
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
            ],
            videotypes: {
                normal: '普通视频',
                youku: '优酷',
                qq: '腾讯',
                bilibili: '哔哩哔哩',
            },
        }
    },
    computed: {
        videotype: {
            get() {
                return this.videotypes[this.datas.content.video.type] || '普通视频';
            },
            set(value) {
                let videotypes = this.$utils.swapKeysAndValues(this.videotypes);
                return this.datas.content.video.type = videotypes[value] || 'normal';
            }
        },
    },
    methods: {
        selectVideo(data) {
            let videoicon = data.videoicon || '';
            if (videoicon) {
                this.datas.content.video.poster = data.filepath + '.jpg';
            }
        }
    }
});

Vue.component('basenoticestyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
    <el-collapse value="1">
        <el-collapse-item title="属性" name="1" disabled>
            <el-form label-width="70px" size="mini">
                <el-form-item label="滚动方向">
                    <el-radio-group v-removeAriaHidden v-model="scrolltype">
                        <el-radio-button label="单条横向"></el-radio-button>
                        <el-radio-button label="多条纵向"></el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-row type="flex" justify="space-between">
                    <el-form-item label="左侧图标">
                        <mibo-font-picker v-model="datas.content.scroll.iconname" :config="{width:28,height:28,iconsize:12}"></mibo-font-picker>
                    </el-form-item>
                    <el-form-item label="图标颜色">
                        <el-color-picker v-model="datas.content.scroll.iconcolor" show-alpha></el-color-picker>
                    </el-form-item>
                    <el-form-item label="图标大小">
                        <el-input-number v-model="datas.content.scroll.iconsize" controls-position="right" :min="12" :max="72" style="width:110px"></el-input-number>
                    </el-form-item>
                </el-row>
                <div v-if="datas.content.scroll.type === 'h'">
                    <el-form-item label="滚动类型">
                        <el-radio-group v-removeAriaHidden v-model="scrollabletype">
                            <el-radio-button label="滚动"></el-radio-button>
                            <el-radio-button label="不滚动"></el-radio-button>
                            <el-radio-button label="根据内容长度自动识别"></el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="滚动速度" v-show="datas.content.scroll.scrollable != '2'" class="el-form-item-slider">
                        <el-slider v-model="datas.content.scroll.speed" :step="5" :min="10" :max="120" show-input input-size="mini"></el-slider>
                    </el-form-item>
                    <el-form-item label="滚动内容">
                        <el-input type="textarea" v-model="datas.content.text" :rows="5" placeholder="请输入文本内容"></el-input>
                    </el-form-item>
                </div>
                <div v-else>
                    <el-form-item label="切换间隔" class="el-form-item-slider">
                        <el-slider v-model="datas.content.scroll.autoplay" :step="0.1" :min="0" :max="10" show-input input-size="mini"></el-slider>
                    </el-form-item>
                    <el-divider></el-divider>
                    <el-form-item label="滚动列表">
                        <vdp tag="div" class="vscroll-texts" v-model="datas.content.list" animation="100" direction="vertical">
                            <div v-for="(l,index) in datas.content.list" :key="index">
                                <el-row type="flex" justify="space-around">
                                    <el-col :span="19" class="list-center" style="margin-bottom:10px;margin-right:10px">
                                        <el-input placeholder="请输入文本内容" v-model="l.content" clearable></el-input>
                                    </el-col>
                                    <el-col :span="5" class="list-right">
                                        <el-button class="btn-move" icon="el-icon-sort" circle></el-button>
                                        <el-popconfirm title="删除将无法恢复，您确定删除吗？" @confirm="removeOne(index)">
                                            <template #reference>
                                                <el-button icon="el-icon-delete" circle></el-button>
                                            </template>
                                        </el-popconfirm>
                                    </el-col>
                                </el-row>
                            </div>
                        </vdp>
                        <div class="d-flex flex-j-c-c flex-a-i-c">
                            <el-button type="primary" icon="el-icon-plus" @click="addOne">新增</el-button>
                        </div>
                    </el-form-item>
                </div>
            </el-form>
        </el-collapse-item>
    </el-collapse>
    </el-tab-pane>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
    <component :is="pane.component" :styles="datas.content.styles" :pkey="datas.pkey||''"></component>
    </el-tab-pane>
    </el-tabs>`,
    props: {
        datas: Object
    },
    data() {
        return {
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
            ],
        }
    },
    mounted() {
        if (!this.datas.content.scroll.iconname) {
            this.$set(this.datas.content.scroll, 'iconname', 'volume-o');
            this.$set(this.datas.content.scroll, 'iconsize', this.datas.content.styles.font.size);
            this.$set(this.datas.content.scroll, 'iconcolor', '');
        }
    },
    computed: {
        scrolltype: {
            get() {
                return this.datas.content.scroll.type === 'h' ? '单条横向' : '多条纵向';
            },
            set(value) {
                this.datas.content.scroll.type = (value === "单条横向" ? 'h' : 'v');
            }
        },
        scrollabletype: {
            get() {
                return this.datas.content.scroll.scrollable === '1' ? '滚动' : (this.datas.content.scroll.scrollable === '2' ? '不滚动' : '根据内容长度自动识别');
            },
            set(value) {
                this.datas.content.scroll.scrollable = (value === "滚动" ? '1' : (value === "不滚动" ? '2' : '3'));
            }
        },
    },
    methods: {
        addOne() {
            let one = {
                content: '纵向滚动数据' + (this.datas.content.list.length + 1),
                link: '',
            };
            this.datas.content.list.push(one);
        },
        removeOne(index) {
            this.datas.content.list.splice(index, 1);
        },
    }
});

Vue.component('baselinestyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
    <component :is="pane.component" :styles="datas.content.styles"></component>
    </el-tab-pane>
    </el-tabs>`,
    props: {
        datas: Object
    },
    data() {
        return {
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
            ],
        }
    },
});

Vue.component('basecountdownstyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
        <el-form label-width="70px" size="mini" style="margin-top:20px">
            <el-divider>内容设置</el-divider>
            <el-form-item label="结束时间">
                <el-date-picker
                    v-model="datas.content.config.endtime"
                    type="datetime"
                    value-format="timestamp"
                    @change="timeChange"
                    placeholder="选择倒计时结束时间">
                </el-date-picker>
            </el-form-item>
            <div v-if="datas.content.config.endtime">
                <el-form-item label="首尾文字">
                    <el-row type="flex" justify="space-between">
                        <el-input v-model="datas.content.config.presuffix.start" style="width:30%" placeholder="显示在倒计时前面的文字"></el-input>
                        <el-input value="倒计时内容" disabled class="d-flex flex-j-c-c flex1" style="margin:0 10px"></el-input>
                        <el-input v-model="datas.content.config.presuffix.end" style="width:30%" placeholder="显示在倒计时后面的文字"></el-input>
                        <el-popover
                        placement="top-start"
                        title="温馨提醒"
                        width="200"
                        trigger="hover"
                        content="首尾文字大小和颜色等请到样式设置内设置">
                        <template #reference>
                            <el-button type="text" icon="el-icon-warning-outline" style="margin-left:10px"></el-button>
                        </template>
                    </el-popover>
                    </el-row>
                </el-form-item>
                <el-form-item label="水平对齐">
                    <el-select v-model="datas.content.styles.justify.content" placeholder="请选择水平对齐方式">
                        <el-option
                        v-for="item in $styleconfig.jctypes"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-divider>倒计时样式设置</el-divider>
                <el-form-item label="格子宽高" style="margin-bottom:0">
                    <el-form label-width="40px" size="mini" inline>
                        <el-form-item label="宽度">
                            <el-input-number v-model="datas.content.config.box.width" :min="12" :max="375"></el-input-number>
                        </el-form-item>
                        <el-form-item label="高度">
                            <el-input-number v-model="datas.content.config.box.height" :min="12" :max="375"></el-input-number>
                        </el-form-item>
                    </el-form>
                </el-form-item>
                <el-form-item label="格子背景" style="margin-bottom:0">
                    <el-color-picker v-model="datas.content.config.box.bgcolor" show-alpha></el-color-picker>
                </el-form-item>
                <el-form-item label="格子边框" style="margin-bottom:-12px">
                    <el-form label-width="40px" size="mini" inline>
                        <el-form-item label="颜色">
                            <el-color-picker v-model="datas.content.config.box.border.color" show-alpha></el-color-picker>
                        </el-form-item>
                        <el-form-item label="大小">
                            <el-input-number v-model="datas.content.config.box.border.size" :min="0" :max="10"></el-input-number>
                        </el-form-item>
                    </el-form>
                </el-form-item>
                <el-form-item label="格子文字" style="margin-bottom:-12px">
                    <el-form label-width="40px" size="mini" inline>
                        <el-form-item label="颜色">
                            <el-color-picker v-model="datas.content.config.box.font.color" show-alpha></el-color-picker>
                        </el-form-item>
                        <el-form-item label="大小">
                            <el-input-number v-model="datas.content.config.box.font.size" :min="12" :max="72"></el-input-number>
                        </el-form-item>
                    </el-form>
                </el-form-item>
                <el-divider>倒计时格式设置</el-divider>
                <el-form-item label="单位信息" style="margin-bottom:0">
                    <el-form label-width="40px" size="mini" inline>
                        <el-form-item label-width="0px">
                            <el-radio-group v-removeAriaHidden v-model="formattype">
                                <el-radio-button label="文字"></el-radio-button>
                                <el-radio-button label="冒号"></el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="大小">
                            <el-input-number v-model="datas.content.config.format.font.size" :min="12" :max="72"></el-input-number>
                        </el-form-item>
                        <el-form-item label="颜色">
                            <el-color-picker v-model="datas.content.config.format.font.color" show-alpha></el-color-picker>
                        </el-form-item>
                    </el-form>
                </el-form-item>
                <el-form-item label="显示格式">
                    <el-checkbox v-model="datas.content.config.format.day" style="margin-right:2px">天数</el-checkbox>
                    <el-checkbox v-model="datas.content.config.format.hour" style="margin-right:2px">小时</el-checkbox>
                    <el-checkbox v-model="datas.content.config.format.minute" style="margin-right:2px">分钟</el-checkbox>
                    <el-checkbox v-model="datas.content.config.format.second" style="margin-right:2px">秒数</el-checkbox>
                    <el-checkbox v-model="datas.content.config.format.ms" style="margin-right:0">毫秒</el-checkbox>
                </el-form-item>
                <el-form-item label="秒数单位" v-show="datas.content.config.format.second && datas.content.config.format.type === 1">
                    <el-radio-group v-removeAriaHidden v-model="secondsunittype">
                        <el-radio-button label="秒"></el-radio-button>
                        <el-radio-button label="s"></el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <div v-show="datas.content.config.format.ms">
                    <el-form-item label="毫秒位数">
                        <el-radio-group v-removeAriaHidden v-model="datas.content.config.format.msconfig.type">
                            <el-radio-button :label="1"></el-radio-button>
                            <el-radio-button :label="2"></el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="毫秒样式">
                        <el-form label-width="40px" size="mini" inline>
                            <el-form-item label="宽" label-width="20px">
                                <el-input-number v-model="datas.content.config.format.msconfig.width" :min="12" :max="375"></el-input-number>
                            </el-form-item>
                            <el-form-item label="大小">
                                <el-input-number v-model="datas.content.config.format.msconfig.size" :min="12" :max="72"></el-input-number>
                            </el-form-item>
                            <el-form-item label-width="0">
                                <el-color-picker v-model="datas.content.config.format.msconfig.color" show-alpha></el-color-picker>
                            </el-form-item>
                        </el-form>
                    </el-form-item>
                </div>
            </div>
        </el-form>
    </el-tab-pane>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
    <component :is="pane.component" :styles="datas.content.styles"></component>
    </el-tab-pane>
    </el-tabs>`,
    props: {
        datas: Object
    },
    data() {
        return {
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
            ]
        }
    },
    computed: {
        formattype: {
            get() {
                return this.datas.content.config.format.type === 1 ? '文字' : '冒号';
            },
            set(type) {
                this.datas.content.config.format.type = (type === '文字' ? 1 : 2);
            }
        },
        secondsunittype: {
            get() {
                return this.datas.content.config.format.secondsunit === 1 ? '秒' : 's';
            },
            set(type) {
                this.datas.content.config.format.secondsunit = (type === '秒' ? 1 : 2);
            }
        },
    },
    methods: {
        timeChange(time) {
            if (time) {
                this.datas.content.config.remaintime = time - new Date().getTime();
            } else {
                this.datas.content.config.remaintime = 0;
            }
        }
    }
});

Vue.component('basemenustyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
        <el-form class="basemenu-form" label-width="70px" size="mini" style="margin:40px 0">
            <el-divider>列数与尺寸</el-divider>
            <el-form-item label="一行列数" class="el-form-item-slider">
                <el-slider v-model="datas.content.config.col" :min="1" :max="5" show-input input-size="mini"></el-slider>
            </el-form-item>
            <el-form-item label="图标尺寸" class="el-form-item-slider">
                <el-slider v-model="datas.content.config.iconsize" :min="20" :max="120" show-input input-size="mini"></el-slider>
            </el-form-item>
            <el-divider>菜单名称样式</el-divider>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="颜色">
                        <el-color-picker v-model="datas.content.config.font.color" show-alpha></el-color-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item label="大小" label-width="40px">
                        <el-input-number v-model="datas.content.config.font.size" controls-position="right" :min="12" :max="72" style="width:100px"></el-input-number>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item label="字体" label-width="40px">
                        <el-select v-model="datas.content.config.font.family" placeholder="请选择字体">
                            <el-option v-for="(fm,index) in $styleconfig.familys" :key="index" :label="fm" :value="fm"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="样式">
                <el-checkbox v-model="datas.content.config.font.weight" true-label="bold" false-label="normal" border style="margin-right:10px">加粗</el-checkbox>
                <el-checkbox v-model="datas.content.config.font.style" true-label="italic" false-label="normal" border style="margin-right:10px">斜体</el-checkbox>
            </el-form-item>
            <el-form-item label="距顶距离" class="el-form-item-slider">
                <el-row type="flex" align="middle">
                <el-col :span="22">
                <el-slider v-model="datas.content.config.font.margintop" :min="0" :max="50" show-input input-size="mini"></el-slider>
                </el-col>
                <el-col :span="2" class="d-flex flex-j-c-c flex-a-i-c">
                <el-popover
                    placement="top-start"
                    title="温馨提醒"
                    width="200"
                    trigger="hover"
                    content="距顶距离即为菜单名称距离菜单图标的距离">
                    <template #reference>
                        <el-button type="text" icon="el-icon-warning-outline" style="margin-left:2px"></el-button>
                    </template>
                </el-popover>
                </el-col>
                </el-row>
            </el-form-item>
            <el-divider>菜单上下内边距</el-divider>
            <el-form-item label="上边距" class="el-form-item-slider">
                <el-slider v-model="datas.content.config.box.padding.top" :min="0" :max="50" show-input input-size="mini"></el-slider>
            </el-form-item>
            <el-form-item label="下边距" class="el-form-item-slider">
                <el-slider v-model="datas.content.config.box.padding.bottom" :min="0" :max="50" show-input input-size="mini"></el-slider>
            </el-form-item>
            <el-divider>菜单列表</el-divider>
            <vdp tag="div" v-model="datas.content.config.list" animation="100" direction="vertical">
                <div v-for="(item,index) in datas.content.config.list" :key="index" style="position: relative;padding: 10px 5px;background: #fefefe;margin-bottom: 10px;border: 1px solid #f5f5f5;">
                    <el-row type="flex" justify="space-around">
                        <el-col :span="3">
                            <el-radio-group v-model="item.type" v-removeAriaHidden class="d-flex flex-d-c flex-j-c-s-a" style="height:100%">
                                <el-radio :label="1">图标</el-radio>
                                <el-radio :label="2">图片</el-radio>
                            </el-radio-group>
                        </el-col>
                        <el-col :span="4" class="d-flex flex-j-c-c flex-a-i-c">
                            <mibo-font-picker v-if="item.type == '1'" v-model="item.iconname" :config="{width:60,height:60,iconsize:32}"></mibo-font-picker>
                            <mibo-uploadbox v-else v-model="item.src" :config="{width:60,height:60,hastip:false}" hasdelete></mibo-uploadbox>
                        </el-col>
                        <el-col :span="15" class="d-flex flex-d-c flex-j-c-s-a">
                            <div class="d-flex flex-a-i-c">
                                <el-color-picker v-if="item.type == '1'" v-model="item.iconcolor" show-alpha style="margin-right:10px" size="mini"></el-color-picker>
                                <el-input placeholder="请输入菜单名称" v-model="item.text" class="flex1" size="mini">
                                    <template #prepend>菜单名称</template>
                                </el-input>
                            </div>
                            <mibo-input-clickevent v-model="item.click" hasprepend size="mini"></mibo-input-clickevent>
                        </el-col>
                        <el-col :span="2" class="d-flex flex-d-c flex-j-c-c flex-a-i-c">
                            <el-button class="btn-move" icon="el-icon-sort" circle size="mini" style="margin-bottom:5px"></el-button>
                            <el-popconfirm title="删除将无法恢复，您确定删除吗？" @confirm="removeOne(index)">
                                <template #reference>
                                    <el-button icon="el-icon-delete" circle size="mini"></el-button>
                                </template>
                            </el-popconfirm>
                        </el-col>
                    </el-row>
                </div>
            </vdp>
            <div class="d-flex flex-j-c-c flex-a-i-c">
                <el-button type="primary" icon="el-icon-plus" size="mini" @click="addOne">新增</el-button>
            </div>
        </el-form>
    </el-tab-pane>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
    <component :is="pane.component" :styles="datas.content.styles"></component>
    </el-tab-pane>
    </el-tabs>`,
    props: {
        datas: Object
    },
    data() {
        return {
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
            ],
        }
    },
    computed: {

    },
    methods: {
        changePadding(padding, type) {
            type = type || '1';
            if (type === '1') {
                this.datas.content.config.box.padding.bottom = padding;
            } else {
                this.datas.content.config.box.padding.right = padding;
            }
        },
        addOne() {
            this.datas.content.config.list.push({
                "type": 2,
                "src": "/static/images/diy/menu/1.png",
                "iconname": "el-icon-icon_signin_line",
                "iconcolor": "#409EFF",
                "text": "菜单名称",
                "click": {
                    "cate": "",
                    "type": "",
                    "title": "",
                    "params": {},
                },
            });
        },
        removeOne(index) {
            this.datas.content.config.list.splice(index, 1);
        }
    }
});

