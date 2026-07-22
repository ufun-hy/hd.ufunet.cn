Vue.prototype.$utils = new utils();
Vue.prototype.$http = new HttpRequest();
Vue.prototype.$mobileapp = new mobileapp();
Vue.prototype.$amconfig = XCV3Config.amconfig;
Vue.prototype.$nopicSrc = '/static/images/diy/nopic.svg';
Vue.use(vant.Lazyload);
// const pageCom = {
//     template: `<div class="page-diy-container d-flex flex-d-c" :style="parseCssValue(pageset)">
//         <div class="page-diy-modules" :style="{fontSize:this.calcPx2Rem(15)}">
//             <div v-for="(item,index) in phoneComponents" :key="item.key" :class="item.component + '-wrap'">
//                 <div class="fix1px"></div>
//                 <component :is="item.component" :datas="item" :class="['module-box',item.component]"></component>
//                 <div class="fix1px"></div>
//             </div>
//         </div>
//     </div>`,
//     data() {
//         return {
//             pageset: {},
//             phoneComponents: [],
//         }
//     },
//     mounted() {
//         this.loadDiyData(this.$route.query.hdid)
//     },
//     methods: {
//         async loadDiyData(hdid) {
//             try {
//                 let { data, status } = await this.$http.getAppdiyconfig({ hdid: hdid });
//                 if (status != 200) {
//                     return vant.Toast(`请求出现异常，请稍后重试`);
//                 }
//                 if (data.code != 0) {
//                     return vant.Toast(data.msg || '请求出现异常，请稍后重试');
//                 }
//                 let { pageset, phoneComponents } = data.msg ? JSON.parse(data.msg) : {};
//                 if (pageset) {
//                     this.pageset = pageset;
//                 }
//                 document.title = this.pageset.title || '';
//                 if (phoneComponents) {
//                     this.phoneComponents = phoneComponents
//                 }
//                 this.$mobileapp.wxShare(this.pageset.shareDetail);

//             } catch (err) {
//                 console.log(err)
//                 vant.Toast(`请求出现异常，请稍后重试`);
//             }
//         },
//     },
// };

// const router = new VueRouter({
//     mode: 'history',
//     routes: [
//         {
//             path: '/wechat/microsite/index',
//             component: pageCom,
//         },
//     ],
//     scrollBehavior(to, from, savedPosition) {
//         return { x: 0, y: 0 }
//     }
// });
var vm = new Vue({
    el: "#app",
    provide() {
        return {
            rootRefs: this
        };
    },
    data() {
        return {
            pageset: {},
            phoneComponents: {},
            globalDatas: XCV3Config.globalDatas,
        }
    },
    mounted() {
        this.loadDiyData();
    },
    methods: {
        async loadDiyData() {
            try {
                let { data, status } = await this.$http.getAppdiyconfig({ hdid: XCV3Config.hdid, pageid: XCV3Config.pageid });
                if (status != 200) {
                    return vant.Toast(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    return vant.Toast(data.msg || '请求出现异常，请稍后重试');
                }
                let { pageset, phoneComponents } = data.msg || {};
                if (pageset) {
                    this.pageset = pageset;
                }
                document.title = this.pageset.title || '';
                if (phoneComponents) {
                    this.phoneComponents = phoneComponents
                }
                this.$mobileapp.wxShare(this.pageset.shareDetail);
                this.$refs.apploading.style.display = 'none';
                if (this.$refs.nopubtip) {
                    this.$refs.nopubtip.classList.add('animate__animated', 'animate__fadeInLeft');
                }
            } catch (err) {
                console.log(err)
                vant.Toast(`请求出现异常，请稍后重试`);
            }
        },
    },

});

