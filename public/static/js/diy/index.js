Vue.use(vant.Lazyload);
Vue.prototype.$utils = new utils();
Vue.prototype.$http = new HttpRequest();
Vue.prototype.$amconfig = XCV3Config.amconfig;
Vue.prototype.$configWidgets = configWidgets;
Vue.prototype.$nopicSrc = '/static/images/diy/nopic.svg';
Vue.prototype.$noaudioSrc = '/static/images/diy/audio.svg';
Vue.prototype.$novideoSrc = '/static/images/diy/video.svg';
Vue.prototype.$styleconfig = {
    familys: ['Arial', 'Tahoma', 'Open Sans', 'cursive', 'fantasy', 'monospace', 'serif', 'sans-serif', '宋体', '仿宋', '华文仿宋', '黑体', '微软雅黑', '华文细黑', '楷体'],
    background: {
        positions: [
            { icon: 'el-icon-top-left', val: 'left top' },
            { icon: 'el-icon-top', val: 'center top' },
            { icon: 'el-icon-top-right', val: 'right top' },
            { icon: 'el-icon-back', val: 'left center' },
            { icon: 'el-icon-circle-plus', val: 'center center' },
            { icon: 'el-icon-right', val: 'right center' },
            { icon: 'el-icon-bottom-left', val: 'left bottom' },
            { icon: 'el-icon-bottom', val: 'center bottom' },
            { icon: 'el-icon-bottom-right', val: 'right bottom' },
        ],
        modes: [
            { label: '适应填充', val: 'fill-y' },
            { label: '裁剪填充', val: 'fill-x' },
            { label: '平铺', val: 'repeat' },
            { label: '横向平铺', val: 'repeat-x' },
            { label: '纵向平铺', val: 'repeat-y' },
            { label: '完全拉伸', val: 'fill' },
            { label: '原图大小', val: 'imgsize' },
        ],
        attachments: [
            { label: '不固定', val: 'unset' },
            { label: '相对浏览器固定', val: 'fixed' },
            { label: '相对容器固定', val: 'scroll' },
            { label: '相对容器内容范围固定', val: 'local' },
        ],
    },
    bordertypes: [
        { label: '实线', val: 'solid' },
        { label: '虚线', val: 'dashed' },
        { label: '点线', val: 'dotted' },
    ],
    predefineColors: [
        'rgba(255,255,255,0)',
        '#ffffff',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        '#409EFF',
        '#909399',
        '#C0C4CC',
    ],
    animatelists: [
        {
            label: '入场',
            lists: [
                { value: 'backInDown', label: '下入' },
                { value: 'backInLeft', label: '左入' },
                { value: 'backInRight', label: '右入' },
                { value: 'backInUp', label: '上入' },
                { value: 'bounceIn', label: '弹入' },
                { value: 'bounceInDown', label: '下弹' },
                { value: 'fadeIn', label: '淡入' },
                { value: 'fadeInDown', label: '下淡入' },
                { value: 'fadeInDownBig', label: '下弹淡入' },
                { value: 'fadeInLeft', label: '左淡入' },
                { value: 'fadeInLeftBig', label: '左弹淡入' },
                { value: 'fadeInRight', label: '右淡入' },
                { value: 'fadeInRightBig', label: '右弹淡入' },
                { value: 'fadeInUp', label: '上淡入' },
                { value: 'fadeInUpBig', label: '上弹淡入' },
                { value: 'fadeInTopLeft', label: '上左淡入' },
                { value: 'fadeInTopRight', label: '上右淡入' },
                { value: 'fadeInBottomLeft', label: '下左淡入' },
                { value: 'fadeInBottomRight', label: '下右淡入' },
                { value: 'flip', label: '翻转' },
                { value: 'flipInX', label: '横向翻转' },
                { value: 'flipInY', label: '纵向翻转' },
                { value: 'lightSpeedInRight', label: '右侧摇摆' },
                { value: 'lightSpeedInLeft', label: '左侧摇摆' },

                { value: 'rotateIn', label: '旋转' },
                { value: 'rotateInDownLeft', label: '左下旋转' },
                { value: 'rotateInDownRight', label: '右下旋转' },
                { value: 'rotateInUpLeft', label: '左上旋转' },
                { value: 'rotateInUpRight', label: '右上旋转' },

                { value: 'jackInTheBox', label: '旋转弹入' },
                { value: 'rollIn', label: '滚入' },
                { value: 'zoomIn', label: '缩放' },
                { value: 'zoomInDown', label: '下缩放' },
                { value: 'zoomInLeft', label: '左缩放' },
                { value: 'zoomInRight', label: '右缩放' },
                { value: 'zoomInUp', label: '上缩放' },
                { value: 'slideInDown', label: '下滑入' },
                { value: 'slideInLeft', label: '左滑入' },
                { value: 'slideInRight', label: '右滑入' },
                { value: 'slideInUp', label: '上滑入' }
            ]
        },
        {
            label: '强调',
            lists: [
                { value: 'bounce', label: '反弹' },
                { value: 'flash', label: '闪动' },
                { value: 'pulse', label: '脉搏' },
                { value: 'rubberBand', label: '橡胶带' },
                { value: 'swing', label: '摆动' },
                { value: 'shakeX', label: '横摆动' },
                { value: 'shakeY', label: '纵摆动' },
                { value: 'headShake', label: '心跳抖动' },
                { value: 'tada', label: '收缩' },
                { value: 'wobble', label: '横摆动' },
                { value: 'jello', label: '收缩摆动' },
                { value: 'heartBeat', label: '心跳摆动' },
                { value: 'flip', label: '翻转' },
                { value: 'flipInX', label: '横向翻转' },
                { value: 'flipInY', label: '纵向翻转' },
                { value: 'lightSpeedInRight', label: '右侧摇摆' },
                { value: 'lightSpeedInLeft', label: '左侧摇摆' },
            ]
        },
    ],
    jctypes: [
        { label: '居中对齐', value: "center" },
        { label: '首尾贴边', value: "space-between" },
        { label: '整体均分间隔', value: "space-around" },
        { label: '左对齐', value: "flex-start" },
        { label: '右对齐', value: "flex-end" },
    ],
};
Vue.prototype.$pageset = {
    name: '页面名称',
    title: '页面标题',
    background: {
        image: "",
        mode: "fill-y",
        color: "#ffffff",
        attachment: "unset",
        position: "left top",
    },
    shareDetail: {
        open: '1',
        title: '大屏互动',
        desc: '快来参与互动',
        icon: '',
    },
    browsertype: '1',
    wxskiplogin: '2',
};
Vue.component('vdr', VueDraggableResizable);
Vue.component('vdp', VueDraggablePlus.VueDraggable);
Vue.component('editor', Editor);

Vue.directive('debounce', {
    inserted: function (el, binding) {
        let [fn, event = "click", time = 300] = binding.value
        let timer
        el.addEventListener(event, () => {
            timer && clearTimeout(timer)
            timer = setTimeout(() => fn(), time)
        })
    }
});
Vue.directive('throttle', {
    inserted: function (el, binding) {
        let [fn, event = "click", time = 300] = binding.value
        let timer, timer_end;
        el.addEventListener(event, () => {
            if (timer) {
                clearTimeout(timer_end);
                return timer_end = setTimeout(() => fn(), time);
            }
            fn();
            timer = setTimeout(() => timer = null, time)
        })
    }
});
Vue.directive('removeAriaHidden', {
    bind(el, binding) {
        let ariaEls = el.querySelectorAll('.el-radio__original');
        ariaEls.forEach((item) => {
            item.removeAttribute('aria-hidden');
        });
    }
});

var vm = new Vue({
    el: "#app",
    provide() {
        return {
            rootRefs: this
        };
    },
    data() {
        return {
            activeLeftTab: 'widget',
            leftactiveWidgets: Object.keys(this.$configWidgets),
            phoneComponents: [],
            activeCom: '',
            pageset: '',
            issaving: false,
            tplid: XCV3Config.tplid || '',
            pageid: XCV3Config.pageid || '',
        }
    },
    beforeCreate() {
        Vue.prototype.$bus = this;
    },
    mounted() {
        this.loadDiyData();
    },
    computed: {
        activeWidget() {
            let activeWidget = this.phoneComponents.find((item) => {
                return item.actived;
            });
            return activeWidget || {};
        },
        activeSwidget() {
            let widget = {};
            if (this.activeWidget.key && this.activeWidget.content.widgets) {
                widget = this.activeWidget.content.widgets.find((item) => {
                    return item.actived;
                });
            }
            return widget || {};
        },
        activeWidgetIndex() {
            return this.phoneComponents.findIndex((item) => {
                return item.actived;
            });
        },
        activeSwidgetIndex() {
            let index = -1;
            if (this.activeWidget.key && this.activeWidget.content.widgets) {
                index = this.activeWidget.content.widgets.findIndex((item) => {
                    return item.actived;
                });
            }
            return index;
        },
        widgetDatas() {
            let data = {};
            if (this.activeWidget.key) {
                data = this.activeWidget;
                if (this.activeSwidget.key) {
                    data = this.activeSwidget;
                }
            }
            return data;
        },
    },
    methods: {
        openPage(type) {
            if (type === 'pageset') {
                this.resetComponentList();
            }
            this.activeCom = type || 'pageset';
        },
        openQr() {
            this.$refs.previewpage.show({ url: XCV3Config.previewUrl || '', browsertype: this.pageset.browsertype + '' });
        },
        handleLeftTabClick(tab) {
            if (tab.name === 'systpl') {
                this.$refs.systpl.init();
            } else if (tab.name === 'diypage') {
                this.$refs.diypage.init();
            }
        },
        changeSysTpl(diydata) {
            let { pageset, phoneComponents } = diydata || {};
            if (pageset) {
                if (!pageset.hasOwnProperty('name')) {
                    pageset.name = '页面名称';
                }
                this.pageset = this.$utils.deepClone(pageset);
            } else {
                this.pageset = this.$utils.deepClone(this.$pageset);
            }
            if (phoneComponents) {
                this.phoneComponents = this.$utils.deepClone(phoneComponents);
            } else {
                this.phoneComponents = [];
            }
            this.openPage('pageset');
        },
        changeDiyPage(pageid) {
            window.location.href = `/hdmanage/configmicrosite/diy?hdid=${XCV3Config.hdid}&pageid=${pageid}`;
        },
        async loadDiyData() {
            try {
                let config = { hdid: XCV3Config.hdid, pageid: XCV3Config.pageid };
                if (XCV3Config.hasOwnProperty('tplid')) {
                    config = { fromtype: 'sys', tplid: XCV3Config.tplid };
                }
                let { data, status } = await this.$http.getdiyconfig(config);
                if (status != 200) {
                    return this.$message.error(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    return this.$message.error(data.msg || '请求出现异常，请稍后重试');
                }
                let { pageset, phoneComponents } = data.msg || {};
                if (pageset) {
                    this.pageset = this.$utils.deepClone(pageset);
                    if (!this.pageset.hasOwnProperty('wxskiplogin')) {
                        this.$set(this.pageset, 'wxskiplogin', 2);
                    }
                    if (!this.pageset.hasOwnProperty('name')) {
                        this.$set(this.pageset, 'name', '页面名称');
                    }
                } else {
                    this.pageset = this.$utils.deepClone(this.$pageset);
                }
                this.pageset.browsertype = this.pageset.browsertype.toString();
                this.pageset.wxskiplogin = this.pageset.wxskiplogin.toString();
                if (phoneComponents) {
                    this.phoneComponents = this.$utils.deepClone(phoneComponents);
                }
                this.openPage('pageset');
                this.$refs.loadingbox.style.display = "none";
            } catch (error) {
                this.$message.error(`请求出现异常，请稍后重试`);
            }
        },
        async saveDiydata() {
            this.issaving = true;
            let components = this.$utils.deepClone(this.phoneComponents);
            this.resetComponentList(components);
            let diydata = {
                pageset: this.pageset,
                phoneComponents: components,
            };
            try {
                let config = { hdid: XCV3Config.hdid, pageid: XCV3Config.pageid };
                if (XCV3Config.hasOwnProperty('tplid')) {
                    config = { fromtype: 'sys', tplid: XCV3Config.tplid };
                }
                config.diydata = diydata;
                let { data, status } = await this.$http.savediyconfig(config);
                if (status != 200) {
                    this.issaving = false;
                    return this.$message.error(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    this.issaving = false;
                    return this.$message.error(data.msg || '请求出现异常，请稍后重试');
                }
                this.$message.success('保存成功');
                this.issaving = false;
            } catch (error) {
                this.issaving = false;
                this.$message.error(`请求出现异常，请稍后重试`);
            }
        },
        resetComponentList(components) {
            components = components || this.phoneComponents;
            components.forEach((res) => {
                if (res.selected) res.selected = false;
                if (res.preventdeactivation) res.preventdeactivation = false;
                if (res.actived) res.actived = false;
                if (res.content.widgets) {
                    res.content.widgets.forEach((w) => {
                        if (w.actived) w.actived = false;
                        if (w.selected) w.selected = false;
                        if (w.preventdeactivation) w.preventdeactivation = false;
                    })
                }
            });
        },
        addonlyOneComponent({ title, component }) {
            const onlyOnes = ['baseaudio', 'basebtn'];
            if (onlyOnes.includes(component)) {
                if (this.activeWidget.component === 'freecontainer') {
                    return this.$message({
                        message: `${title}暂无法添加到容器中，请点击页面空白部位，再添加${title}`,
                        type: 'warning'
                    });
                }
                let exists = this.phoneComponents.findIndex(res => res.component === component) !== -1;
                if (exists) {
                    return this.$message({
                        message: `${title}组件整个页面只能添加一个`,
                        type: 'warning'
                    });
                }
            }
            return false;
        },
        addComponent(cate, cname, childtype) {
            let widget = this.$configWidgets[cate].lists[cname] || '';
            if (!widget) {
                return;
            }
            let isonlyone = this.addonlyOneComponent(widget);
            if (isonlyone) {
                return isonlyone;
            }
            let data = this.$utils.deepClone(widget);
            data.key = 'widget_' + this.$utils.uuid(10);
            if (this.activeWidget.component === 'freecontainer' && cname != 'freecontainer') {
                let top = 20, left = 20;
                if (this.activeSwidget.key) {
                    top = this.activeSwidget.content.styles.top + 20;
                    left = this.activeSwidget.content.styles.left + 20;
                    this.activeWidget.content.widgets.forEach((w) => {
                        if (w.actived) w.actived = false;
                        if (w.preventdeactivation) w.preventdeactivation = false;
                    });
                } else {
                    if (this.activeWidget.content.widgets.length) {
                        let lastwidget = this.activeWidget.content.widgets.slice(-1);
                        top = lastwidget[0].content.styles.top + 20;
                        left = lastwidget[0].content.styles.left + 20;
                    }
                }
                data.pkey = this.activeWidget.key;
                data.childtype = childtype;
                this.activeWidget.content.widgets.push(this.initSonWidgetData(data, { top: top, left: left }));
                if (this.activeWidget.selected) this.activeWidget.selected = false;
            } else {
                this.resetComponentList();
                if (cate === 'free' && cname != 'freecontainer') {
                    let container = this.$configWidgets[cate].lists.freecontainer;
                    let containerdata = this.$utils.deepClone(container);
                    containerdata.key = 'widget_' + this.$utils.uuid(10);
                    data.pkey = containerdata.key;
                    data.actived = false;
                    data.preventdeactivation = false;
                    data.childtype = childtype;
                    containerdata.content.widgets.push(this.initSonWidgetData(data));
                    this.phoneComponents.push(containerdata);
                } else {
                    this.phoneComponents.push(data);
                }
            }
            this.changeActiveCom2widget();
        },
        clickComponent(item, isedit) {
            this.resetComponentList();
            item.actived = true;
            item.preventdeactivation = true;
            item.selected = true;
            this.changeActiveCom2widget(isedit);
        },
        removeComponent(index) {
            if (this.activeWidgetIndex === index) {
                let nextWidget = this.phoneComponents[this.activeWidgetIndex + 1] || '';
                if (nextWidget) {
                    nextWidget.selected = true;
                    nextWidget.actived = true;
                    nextWidget.preventdeactivation = true;
                }
            }
            this.phoneComponents.splice(index, 1);
            if (!this.activeWidget.key && this.activeCom !== 'layoutset') {
                this.activeCom = 'pageset';
            } else {
                this.changeActiveCom2widget();
            }
        },
        moveUpComponent(index) {
            if (index === 0) {
                return;
            }
            this.phoneComponents = this.$utils.moveUp(index, this.phoneComponents);
            this.sendResetNotice();
        },
        moveDownComponent(index) {
            if (index === this.phoneComponents.length - 1) {
                return;
            }
            this.phoneComponents = this.$utils.moveDown(index, this.phoneComponents);
            this.sendResetNotice();
        },
        copyComponent(index) {
            this.resetComponentList();
            let copyWidget = this.$utils.deepClone(this.phoneComponents[index]);
            copyWidget.key = 'widget_' + this.$utils.uuid(10);
            copyWidget.actived = true;
            copyWidget.selected = true;
            if (copyWidget.content.widgets && copyWidget.content.widgets.length) {
                copyWidget.content.widgets.forEach((res) => {
                    res.key = 'widget_' + this.$utils.uuid(10);
                    res.pkey = copyWidget.key;
                });
            }
            this.phoneComponents.splice(index + 1, 0, copyWidget);
            this.changeActiveCom2widget();
        },
        contextmenuComponent(item, index, event) {
            this.resetComponentList();
            item.selected = true;
            item.actived = true;
            item.preventdeactivation = true;
            this.$contextmenu({
                items: [{
                    label: item.title,
                    disabled: true,
                },
                {
                    label: "复制",
                    icon: "el-icon-document-copy",
                    onClick: () => {
                        this.copyComponent(index)
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
                            this.removeComponent(index)
                        }).catch(() => {

                        });
                    }
                }],
                event,
                zIndex: 3000,
                minWidth: 140
            });
            this.changeActiveCom2widget();
            event.preventDefault();
        },
        activeSonComponent(fkey, sindex, isedit) {
            let findex = this.phoneComponents.findIndex((item) => {
                return item.key === fkey;
            });
            if (findex != -1) {
                this.resetComponentList();
                let res = this.phoneComponents[findex] ?? '';
                if (res) {
                    res.preventdeactivation = true;
                    res.actived = true;
                    res.selected = false;
                    if (res.content.widgets.length) {
                        let activeson = res.content.widgets.find((item, key) => {
                            return key === sindex;
                        });
                        if (activeson) {
                            activeson.actived = true;
                            activeson.preventdeactivation = true;
                        } else {
                            res.selected = true;
                        }
                    } else {
                        res.selected = true;
                    }
                }
                this.changeActiveCom2widget(isedit);
            }
        },
        removeSonComponent(fkey, sindex) {
            let findex = this.phoneComponents.findIndex((item) => {
                return item.key === fkey;
            });
            if (findex != -1) {
                let fwidget = this.phoneComponents[findex];
                fwidget.content.widgets.splice(sindex, 1);
                fwidget.selected = true;
                this.$message({
                    message: '删除小组件成功',
                    type: 'success'
                });
            }
        },
        copySonComponent(fkey, sindex) {
            let findex = this.phoneComponents.findIndex((item) => {
                return item.key === fkey;
            });
            if (findex != -1) {
                let fwidget = this.phoneComponents[findex] || false;
                if (fwidget) {
                    let sonwidget = fwidget.content.widgets[sindex] || false;
                    if (sonwidget) {
                        let copyWidget = this.$utils.deepClone(sonwidget);
                        sonwidget.actived = false;
                        sonwidget.preventdeactivation = false;
                        copyWidget.key = 'widget_' + this.$utils.uuid(10);
                        copyWidget.content.styles.top = sonwidget.content.styles.top + 20;
                        copyWidget.content.styles.left = sonwidget.content.styles.left + 20;
                        fwidget.content.widgets.push(copyWidget);
                        this.$message({
                            message: '复制小组件成功',
                            type: 'success'
                        });
                    }
                }
            }
        },
        sendResetNotice() {
            this.$bus.$emit('ondragStopresetNotice');
        },
        changeActiveCom2widget(isforce) {
            if (this.activeCom !== 'layoutset') {
                this.activeCom = 'widget';
            }
            if (isforce) {
                this.activeCom = 'widget';
            }
        },
        scrollToActive: debounce(function (key) {
            let refdom = this.$refs[`phone-block-${key || ''}`];
            if (refdom) {
                VueScrollTo.scrollTo(refdom[0], 500, {
                    container: '.diy-phone',
                    easing: 'linear',
                    offset: -10,
                    force: false,
                });
            }
        }, 500),
        contextMenuCenter(event) {
            if (event.target.classList.contains('diy-phone')) {
                this.$contextmenu({
                    items: [{
                        label: '操作',
                        disabled: true,
                    },
                    {
                        label: "设置预览图",
                        icon: "el-icon-camera",
                        onClick: () => {
                            this.saveTplimg();
                        }
                    },
                    {
                        label: "刷新页面",
                        icon: "el-icon-refresh",
                        onClick: () => {
                            window.location.reload();
                        }
                    }],
                    event,
                    zIndex: 3000,
                    minWidth: 140
                });
            }
            event.preventDefault();
        },
        saveTplimg() {
            this.$nextTick(() => {
                let node = this.$refs.phonecontainer;
                node.classList.add('isshotsnap');
                domtoimage.toJpeg(node, { width: 375, height: 734 }).then(async (dataUrl) => {
                    try {
                        let config = { hdid: XCV3Config.hdid, pageid: XCV3Config.pageid, imgdata: dataUrl };
                        if (XCV3Config.hasOwnProperty('tplid')) {
                            config = { fromtype: 'sys', tplid: XCV3Config.tplid, imgdata: dataUrl };
                        }
                        let { data, status } = await this.$http.saveonesystplimg(config);
                        node.classList.remove('isshotsnap');
                        if (status != 200) {
                            return this.$message.error(`请求出现异常，请稍后重试`);
                        }
                        if (data.code != 0) {
                            return this.$message.error(data.msg || '请求出现异常，请稍后重试');
                        }
                        this.$message.success(`设置成功`);
                        if (this.activeLeftTab === 'systpl') {
                            this.$refs.systpl.loadlist();
                        }
                    } catch (error) {
                        node.classList.remove('isshotsnap');
                        this.$message.error(`请求出现异常，请稍后重试`);
                    }
                }).catch(function () {
                    node.classList.remove('isshotsnap');
                    return this.$message.error(`手机页面截屏出现异常`);
                });
            })
        },
    },
    watch: {
        activeWidget(newval, oldval) {
            if (!newval.key || newval.key === oldval.key || newval.component === 'baseaudio') return false;
            this.scrollToActive(newval.key || '');
        }
    }
});
