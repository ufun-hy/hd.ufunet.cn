Vue.component('tipbox', {
    template: `<van-overlay :show="show" class-name="tipbox">
        <div v-if="config.type === 'iframe'" class="iframe" style="height: 88%; width: 90%;">
            <iframe :src="config.url" sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-modals allow-top-navigation" frameborder="0" style="width: 100%; height: 100%; background: white;"></iframe>
            <div class="iframeclose d-flex flex-j-c-c flex-a-i-c" @click="hidebox"><mibo-icon iconname="close"></mibo-icon></div>
        </div>
    </van-overlay>`,
    data() {
        return {
            show: false,
            config: {
                type: '',
                url: '',
            }
        }
    },
    computed: {

    },
    methods: {
        showbox(config) {
            this.config = config;
            this.show = true;
        },
        hidebox() {
            this.show = false;
            this.config = {
                type: '',
                url: '',
            };
        }
    }
});

Vue.component('miboIcon', {
    template: `<van-icon :class-prefix="classPrefix" :name="iconName" :color="iconcolor" :size="iconSize"></van-icon>`,
    props: {
        iconname: {
            type: String,
            default: '',
        },
        iconcolor: {
            type: String,
            default: 'inherit',
        },
        iconsize: {
            type: [Number, String],
            default: 'inherit',
        }
    },
    computed: {
        classPrefix() {
            return this.iconname.indexOf('el-icon') === 0 ? 'el-icon' : 'van-icon';
        },
        iconName() {
            return this.classPrefix === 'el-icon' ? this.iconname.replace('el-icon-', '') : this.iconname;
        },
        iconSize() {
            let iconsize = this.iconsize || 'inherit';
            if (typeof iconsize === 'number') {
                iconsize = this.calcPx2Rem(iconsize);
            }
            return iconsize;
        }
    }
});



