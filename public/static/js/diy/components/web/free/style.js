Vue.component('freecontainerstyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
        <component :is="pane.component" :key="index" :styles="datas.content.styles"></component>
    </el-tab-pane>
</el-tabs>`,
    props: {
        datas: Object,
    },
    data() {
        return {
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
                { label: '动画设置', component: 'animationstyle' }
            ],
        }
    },
});

Vue.component('freetextstyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
        <el-collapse value="1">
            <el-collapse-item title="属性" name="1" disabled>
                <el-form label-width="80px" size="mini">
                    <el-form-item label="锁定缩放">
                        <el-switch v-model="datas.content.lockaspectratio"></el-switch>
                    </el-form-item>
                    <el-form-item label="点击事件">
                        <mibo-input-clickevent v-model="datas.content.click"></mibo-input-clickevent>
                    </el-form-item>
                    <el-form-item label="文字类型">
                        <el-radio-group v-removeAriaHidden v-model="fonttype">
                            <el-radio-button label="普通文本"></el-radio-button>
                            <el-radio-button label="富文本"></el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="文字超出">
                        <el-radio-group v-removeAriaHidden v-model="overflowtype">
                            <el-radio-button label="截断隐藏"></el-radio-button>
                            <el-radio-button label="溢出显示"></el-radio-button>
                            <el-radio-button label="超出滚动"></el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="使用变量">
                        <el-button @click="showVar">显示变量选择面板</el-button>
                        <mibo-varbox-dialog :visible="showvarbox" type="1" @hide-var="hideVar" @confirm-var="confirmVar"></mibo-varbox-dialog>
                    </el-form-item>
                    <el-form-item label-width="0px" v-if="datas.content.type === 'normal'">
                        <el-input type="textarea" v-model="datas.content.text" :rows="5" placeholder="请输入文本内容"></el-input>
                    </el-form-item>
                    <el-form-item label-width="0px" v-else>
                        <mibo-tinymce-editor v-model="datas.content.richtext"></mibo-tinymce-editor>
                    </el-form-item>
                </el-form>
            </el-collapse-item>
        </el-collapse>
    </el-tab-pane>
    <el-tab-pane v-for="(pane,index) in tabpanes" :key="pane.component" :label="pane.label">
        <component :is="pane.component" :styles="datas.content.styles" :texttype="datas.content.type||''"></component>
    </el-tab-pane>
</el-tabs>`,
    props: {
        datas: Object
    },
    data() {
        return {
            showvarbox: false,
            tabpanes: [
                { label: '样式设置', component: 'stylestyle' },
                { label: '动画设置', component: 'animationstyle' }
            ],
        }
    },
    computed: {
        fonttype: {
            get() {
                return this.datas.content.type == 'normal' ? '普通文本' : '富文本';
            },
            set(value) {
                this.datas.content.type = (value === '普通文本' ? 'normal' : 'richtext');
            }
        },
        overflowtype: {
            get() {
                return this.datas.content.overflow == 'hidden' ? '截断隐藏' : (this.datas.content.overflow == 'visible' ? '溢出显示' : '超出滚动');
            },
            set(value) {
                this.datas.content.overflow = (value === '截断隐藏' ? 'hidden' : ((value == '溢出显示' ? 'visible' : 'scroll')));
            }
        },
    },
    methods: {
        showVar() {
            this.showvarbox = true;
        },
        hideVar() {
            this.showvarbox = false;
        },
        confirmVar(name) {
            if (this.datas.content.type == 'normal') {
                this.datas.content.text += name;
            } else {
                this.datas.content.richtext += name;
            }
            this.hideVar();
        },
    }
});

Vue.component('freeimagestyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
        <el-collapse value="1">
            <el-collapse-item title="属性" name="1" disabled>
                <el-form label-width="80px" size="mini">
                    <el-form-item label="锁定缩放">
                        <el-switch v-model="datas.content.lockaspectratio"></el-switch>
                    </el-form-item>
                    <el-form-item label="点击放大">
                        <el-switch v-model="datas.content.clickpreview"></el-switch>
                    </el-form-item>
                    <el-form-item label="点击事件" v-show="!datas.content.clickpreview">
                        <mibo-input-clickevent v-model="datas.content.click"></mibo-input-clickevent>
                    </el-form-item>
                    <el-form-item label="图片">
                        <mibo-input-attachment v-model="datas.content.src" hasprepend vartype='2'  @select-attachment="selectImage"></mibo-input-attachment>
                    </el-form-item>
                    <el-form-item label="缩放模式">
                        <el-select v-model="datas.content.mode" placeholder="请选择缩放模式">
                            <el-option v-for="(mode,index) in modes" :key="index" :label="mode.label" :value="mode.val"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </el-collapse-item>
        </el-collapse>
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
                { label: '动画设置', component: 'animationstyle' }
            ],
            modes: [
                { label: '拉伸图片填满，图片可能发生变形', val: 'fill' },
                { label: '等比缩放，可以完整显示图片', val: 'contain' },
                { label: '等比缩放，图片有部分可能被裁剪了', val: 'cover' },
            ]
        }
    },
    methods: {
        selectImage(one) {
            let lockaspectratio = this.datas.content.lockaspectratio;
            let oneImage = new Image();
            oneImage.onload = () => {
                let aspect = oneImage.width / oneImage.height;
                if (lockaspectratio) {
                    this.datas.content.lockaspectratio = false;
                }
                this.datas.content.styles.height = (this.datas.content.styles.width / aspect);
                this.$nextTick(() => {
                    if (lockaspectratio) {
                        this.datas.content.lockaspectratio = true;
                    }
                })
            };
            oneImage.src = this.parseAttachSrc(one.filesrc);
        }
    }
});

Vue.component('freehotstyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
        <el-collapse value="1">
            <el-collapse-item title="属性" name="1" disabled>
                <el-form label-width="80px" size="mini">
                    <el-form-item label="锁定缩放">
                        <el-switch v-model="datas.content.lockaspectratio"></el-switch>
                    </el-form-item>
                    <el-form-item label="点击事件">
                        <mibo-input-clickevent v-model="datas.content.click"></mibo-input-clickevent>
                    </el-form-item>
                </el-form>
            </el-collapse-item>
        </el-collapse>
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
    }
});

Vue.component('freeiconstyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
        <el-collapse value="1">
            <el-collapse-item title="属性" name="1" disabled>
                <el-form label-width="80px" size="mini">
                    <el-form-item label="锁定缩放">
                        <el-switch v-model="datas.content.lockaspectratio"></el-switch>
                    </el-form-item>
                    <el-divider>图标设置</el-divider>
                    <el-row type="flex" justify="space-around">
                        <el-col :span="3">
                            <el-radio-group v-model="datas.content.icon.type" v-removeAriaHidden class="d-flex flex-d-c flex-j-c-s-a" style="height:100%">
                                <el-radio :label="1">图标</el-radio>
                                <el-radio :label="2">图片</el-radio>
                            </el-radio-group>
                        </el-col>
                        <el-col :span="5" class="d-flex flex-j-c-c flex-a-i-c">
                            <mibo-font-picker v-if="datas.content.icon.type == '1'" v-model="datas.content.icon.name" :config="{width:68,height:68,iconsize:32}"></mibo-font-picker>
                            <mibo-uploadbox v-else v-model="datas.content.icon.src" :config="{width:68,height:68,hastip:false}"></mibo-uploadbox>
                        </el-col>
                        <el-col :span="16" class="d-flex flex-d-c flex-j-c-s-a">
                            <div class="d-flex flex-a-i-c">
                                <el-color-picker v-if="datas.content.icon.type == '1'" v-model="datas.content.icon.color" show-alpha style="margin-right:10px" size="mini"></el-color-picker>
                                <el-slider v-model="datas.content.icon.size" :min="12" :max="200" show-input input-size="mini" class="flex1"></el-slider>
                            </div>
                            <mibo-input-clickevent v-model="datas.content.click" hasprepend size="mini"></mibo-input-clickevent>
                        </el-col>
                    </el-row>
                </el-form>
            </el-collapse-item>
        </el-collapse>
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
    }
});

Vue.component('freebtnstyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="基础设置">
        <el-collapse value="1">
            <el-collapse-item title="属性" name="1" disabled>
                <el-form label-width="80px" size="mini">
                    <el-form-item label="锁定缩放">
                        <el-switch v-model="datas.content.lockaspectratio"></el-switch>
                    </el-form-item>
                    <el-form-item label="点击事件">
                        <mibo-input-clickevent v-model="datas.content.click"></mibo-input-clickevent>
                    </el-form-item>
                    <el-divider>按钮文字</el-divider>
                    <el-form-item label="按钮文字">
                        <el-input v-model="datas.content.text" placeholder="请输入按钮文字"></el-input>
                    </el-form-item>
                </el-form>
            </el-collapse-item>
        </el-collapse>
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
                { label: '动画设置', component: 'animationstyle' }
            ],
        }
    }
});
