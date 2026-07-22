Vue.component('freecontainer', {
    template: `<div>
    <div class="freecontainer-left">
        <div class="container-leftbar" :style="{top:leftbarInfo.top+'px'}" v-show="leftbarInfo.isshow">
            <div class="buttons">
                <i class="el-icon-document-copy" @click.stop="copySonWidget"></i>
                <div @click.stop="">
                    <el-popconfirm title="删除将无法恢复，您确定删除吗？" @confirm="removeSonWidget">
                    <template #reference>
                        <i class="el-icon-delete" style="background: rgb(255, 102, 102);"></i>
                    </template>
                    </el-popconfirm>
                </div>
            </div>
            <div class="divider"></div>
            <div class="infos">
                <div>W {{leftbarInfo.width}}</div>
                <div>H {{leftbarInfo.height}}</div>
                <div>T {{leftbarInfo.top}}</div>
                <div>L {{leftbarInfo.left}}</div>
                <div>R {{leftbarInfo.right}}</div>
                <div>Z {{leftbarInfo.zindex}}</div>
            </div>
        </div>
    </div>
    <div class="freecontainer-wrap" :style="parseCssValue(datas.content.styles)">
        <div class="freecontainer-area">
          <vdr
            class-name="freecontainer-resize mibovdr"
            class-name-handle="mibovdr-handle"
            :h="datas.content.styles.height"
            :x="0"
            :y="0"
            :min-height="0"
            :draggable="false"
            :handles="['bm']"
            :active="datas.actived"
            :prevent-deactivation="datas.preventdeactivation"
            :disable-user-select="true"
            :onResizeStart="onWrapResizeStart"
            @resizing="onWrapResize"
            @resizestop="onWrapResizeStop"
            style="width:100%"
          ></vdr>
          <div class="freecontainer-widgets">
            <div class="freecontainer-widgets-scroll">
                <vdr
                  class-name="freecontainer-resize-copy vdr"
                  :h="datas.content.styles.height"
                  :x="0"
                  :y="0"
                  :min-height="0"
                  :snap="true"
                  :draggable="false"
                  :resizeable="false"
                  :disable-user-select="true"
                  style="width:100%"
                ></vdr>
                <vdr
                  v-for="(witem, windex) in datas.content.widgets"
                  :key="witem.key"
                  class-name="mibovdr vdr-hover-top"
                  class-name-active="mibovdr-active"
                  :parent="true"
                  :grid="[1, 1]"
                  :w="witem.content.styles.width"
                  :h="witem.content.styles.height"
                  :x="witem.content.styles.left"
                  :y="witem.content.styles.top"
                  :lock-aspect-ratio="witem.content.lockaspectratio"
                  :min-width="0"
                  :min-height="0"
                  :is-conflict-check="false"
                  :snap="true"
                  :disable-user-select="true"
                  :active="witem.actived"
                  :prevent-deactivation="witem.preventdeactivation"
                  @activated="onActivated(windex)"
                  :onDragStart="onDragStart"
                  @dragstop="(left, top) => onDragStop(left, top, witem)"
                  @resizing="(left, top, width, height) => onResize(left, top, width, height, witem)"
                  :onResizeStart="onResizeStart"
                  @resizestop="onResizstop"
                  @reflineparams="getRefLineParams">
                  <component :is="witem.component" :ref="witem.key" :datas="witem" :class="['free-block-box',freeBlockClass(witem)]" @contextmenu.native.stop="onContextmenu(datas.content.widgets,windex,$event)"></component>
                </vdr>
                <span class="ref-line v-line" v-for="item in vLine" v-show="item.display" :style="{ left: item.position, top: item.origin, height: item.lineLength}"></span>
                <span class="ref-line h-line" v-for="item in hLine" v-show="item.display" :style="{ top: item.position, left: item.origin, width: item.lineLength}"></span>
            </div>
          </div>
        </div>
    </div>
    </div>`,
    props: {
        datas: Object,
    },
    data() {
        return {
            vLine: [],
            hLine: [],
        };
    },
    computed: {
        leftbarInfo() {
            let info = { isshow: false, width: 0, height: 0, top: 0, left: 0, right: 0, zindex: 0 }
            var activesIndex = this.datas.content.widgets.findIndex((s) => {
                return s.actived
            });
            if (activesIndex != -1) {
                let { width, height, top, left } = this.datas.content.widgets[activesIndex].content.styles;
                info = Object.assign(info, { isshow: true, width: this.calcleftBarProperty(width), height: this.calcleftBarProperty(height), top: this.calcleftBarProperty(top), left: this.calcleftBarProperty(left), zindex: activesIndex });
                if (info.left < 0) {
                    info.left = 0;
                }
                info.right = 375 - info.left - info.width - this.datas.content.styles.margin.left;
                if (info.right < 0) {
                    info.right = 0;
                }
            }
            return info;
        },
    },
    methods: {
        getRefLineParams(params) {
            const { vLine, hLine } = params
            this.vLine = vLine
            this.hLine = hLine
        },
        onWrapResizeStart() {
            this.datas.isresizing = true;
        },
        onWrapResize(x, y, width, height) {
            this.datas.content.styles.height = height;
        },
        onWrapResizeStop(x, y, width, height) {
            this.datas.content.styles.height = height;
            this.datas.isresizing = false;
            this.$nextTick(() => {
                window.dispatchEvent(new Event('resize'))
            });
        },
        onResize(x, y, width, height, widget) {
            widget.content.styles.left = x;
            widget.content.styles.top = y;
            widget.content.styles.width = width;
            widget.content.styles.height = height;
        },
        onResizeStart() {
            this.datas.isresizing = true;
        },
        onResizstop() {
            this.datas.isresizing = false;
        },
        onDragStart() {
            this.datas.isresizing = true;
        },
        onDragStop(x, y, widget) {
            widget.content.styles.left = x;
            widget.content.styles.top = y;
            this.datas.isresizing = false;
        },
        onContextmenu(widgets, index, event) {
            this.$emit('active-son-component', this.datas.key, index)
            this.$contextmenu({
                items: [
                    {
                        label: widgets[index].title,
                        disabled: true,
                    },
                    {
                        label: "上移一层",
                        icon: "el-icon-top",
                        onClick: () => {
                            this.datas.content.widgets = this.$utils.moveDown(index, widgets)
                        }
                    },
                    {
                        label: "下移一层",
                        icon: "el-icon-bottom",
                        onClick: () => {
                            this.datas.content.widgets = this.$utils.moveUp(index, widgets)
                        }
                    },
                    {
                        label: "置最顶层",
                        icon: "van-icon van-icon-ascending",
                        onClick: () => {
                            this.datas.content.widgets = this.$utils.moveToBottom(index, widgets)
                        }
                    },
                    {
                        label: "置最底层",
                        icon: "van-icon van-icon-descending",
                        onClick: () => {
                            this.datas.content.widgets = this.$utils.moveToTop(index, widgets)
                        }
                    },
                    {
                        label: "复制",
                        icon: "el-icon-document-copy",
                        onClick: () => {
                            this.$emit('copy-son-component', this.datas.key, index)
                        }
                    },
                    {
                        label: "删除",
                        icon: "el-icon-delete",
                        onClick: () => {
                            this.$confirm('删除将无法恢复, 您确定要删除么?', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                this.$emit('remove-son-component', this.datas.key, index)
                            }).catch(() => {

                            });

                        }
                    }
                ],
                event,
                zIndex: 3000,
                minWidth: 140
            });
            event.preventDefault();
        },
        onActivated(index) {
            this.$emit('active-son-component', this.datas.key, index);
        },
        copySonWidget() {
            var activesindex = this.datas.content.widgets.findIndex((s) => {
                return s.actived
            });
            if (activesindex != -1) {
                this.$emit('copy-son-component', this.datas.key, activesindex);
            }
        },
        removeSonWidget() {
            var activesindex = this.datas.content.widgets.findIndex((s) => {
                return s.actived
            });
            if (activesindex != -1) {
                this.$emit('remove-son-component', this.datas.key, activesindex)
            }
        },
        calcleftBarProperty(value) {
            if (value.toString().indexOf(".") === -1) {
                return value;
            }
            return parseFloat(value).toFixed(2);
        },
    },
});

Vue.component('freetext', {
    template: `<div class="d-flex" :style="parseCssValue(datas.content.styles)">
        <div v-if="datas.content.type === 'richtext'" class="free-text flex1" v-html="datas.content.richtext"></div>
        <div v-else class="free-text flex1">{{ datas.content.text }}</div>
    </div>`,
    props: {
        datas: Object,
    },
    computed: {

    },
    methods: {

    }
});

Vue.component('freeimage', {
    template: `<div class="d-flex" :style="parseCssValue(datas.content.styles)">
        <div class="free-image">
            <div v-if="datas.content.src" :class="datas.content.mode" :style="{backgroundImage:'url('+parseSrc+')'}">
                <div v-if="!parseSrc" class="d-flex flex-j-c-c flex-a-i-c" style="background-color:#f1f0f0">
                    <i class="el-icon-picture-outline" style="font-size:40px"></i>
                </div>
            </div>
        </div>
    </div>`,
    props: {
        datas: Object,
    },
    computed: {
        parseSrc() {
            return this.parseAttachSrc(this.datas.content.src);
        }
    }
});

Vue.component('freehot', {
    template: `<div class="d-flex" :style="parseCssValue(datas.content.styles)">
        <div class="free-hot"></div>
    </div>`,
    props: {
        datas: Object,
    },
});

Vue.component('freeicon', {
    template: `<div class="d-flex" :style="parseCssValue(datas.content.styles)">
        <div class="free-icon d-flex flex-j-c-c flex-a-i-c">
            <mibo-icon v-if="datas.content.icon.type === 1 " :iconname="datas.content.icon.name" :iconsize="calcSize" :iconcolor="datas.content.icon.color"></mibo-icon>
            <div v-else :style="{height: calcSize,lineHeight:calcSize}">
                <img v-if="datas.content.icon.src" :src="parseAttachSrc(datas.content.icon.src)" :style="{width: calcSize,height: calcSize}" />
            </div>
        </div>
    </div>`,
    props: {
        datas: Object,
    },
    computed: {
        iconname() {
            let { type, src, name } = this.datas.content.icon;
            return type === 1 ? name : this.parseAttachSrc(src);
        },
        calcSize() {
            return this.datas.content.icon.size + 'px';
        }
    }
});

Vue.component('freebtn', {
    template: `<div class="d-flex" :style="parseCssValue(datas.content.styles)">
        <div class="free-btn d-flex flex-a-i-c">
            <div class="flex1">{{datas.content.text}}</div>
        </div>
    </div>`,
    props: {
        datas: Object,
    },
});