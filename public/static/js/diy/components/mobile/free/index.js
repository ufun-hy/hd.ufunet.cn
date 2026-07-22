Vue.component('freecontainer', {
    template: `<div :style="parseCssValue(datas.content.styles,'2')">
      <div class="freecontainer-area">
            <component :is="widget.component" :datas="widget" v-for="(widget,index) in datas.content.widgets" :key="widget.key" :class="['free-block',freeBlockClass(widget)]"></component>
      </div>
  </div>`,
    props: {
        datas: Object,
    },
    data() {
        return {

        }
    },
});

Vue.component('freetext', {
    template: `<div class="d-flex flex-a-i-c" :style="parseCssValue(datas.content.styles,'2')" @click="clickEvent(datas.content.click,$event)">
        <div class="freetext-content" v-html="parseTextVars(datas.content.type === 'richtext' ? datas.content.richtext : datas.content.text)"></div>
    </div>`,
    inject: ['rootRefs'],
    props: {
        datas: Object,
    },
    data() {
        return {

        }
    }
});


Vue.component('freeimage', {
    template: `<div :style="parseCssValue(datas.content.styles,'2')" @click="clickImage">
        <div class="freeimage-content">
            <div :class="datas.content.mode" :style="{backgroundImage:'url('+parseImgSrc+')'}"></div>
            <img :src="parseImgSrc" />
        </div>
     </div>`,
    inject: ['rootRefs'],
    props: {
        datas: Object,
    },
    data() {
        return {}
    },
    computed: {
        parseImgSrc() {
            return this.parseAttachSrc(this.datas.content.src);
        },
    },
    methods: {
        clickImage(event) {
            let clickpreview = this.datas.content.clickpreview || false;
            if (clickpreview) {
                vant.ImagePreview({
                    showIndex: false,
                    images: [this.parseImgSrc],
                    closeable: true,
                    overlayStyle: {
                        backgroundColor: 'rgba(0, 0, 0, .42)',
                    }
                });
            } else {
                this.clickEvent(this.datas.content.click, event)
            }

        }
    }
});

Vue.component('freehot', {
    template: `<div :style="parseCssValue(datas.content.styles,'2')" @click="clickEvent(datas.content.click,$event)"><div></div></div>`,
    inject: ['rootRefs'],
    props: {
        datas: Object,
    },
});

Vue.component('freeicon', {
    template: `<div class="d-flex" :style="parseCssValue(datas.content.styles,'2')" @click="clickEvent(datas.content.click,$event)">
        <div class="free-icon d-flex flex-j-c-c flex-a-i-c">
            <mibo-icon v-if="datas.content.icon.type === 1 " :iconname="datas.content.icon.name" :iconsize="datas.content.icon.size" :iconcolor="datas.content.icon.color"></mibo-icon>
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
            return this.calcPx2Rem(this.datas.content.icon.size);
        }
    }
});

Vue.component('freebtn', {
    template: `<div class="d-flex" :style="parseCssValue(datas.content.styles,'2')" @click="clickEvent(datas.content.click,$event)">
        <div class="free-btn d-flex flex-a-i-c">
            <div class="flex1">{{datas.content.text}}</div>
        </div>
    </div>`,
    props: {
        datas: Object,
    },
});