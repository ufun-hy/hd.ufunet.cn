Vue.component('mibo-pre-viewer', {
    template: `<el-dialog :title="titlename" :visible.sync="show" custom-class="previewer-box" top="120px" @close="hideViewer">
    <div>
        <el-container class="previewer-box-wrap d-flex flex-j-c-c flex-a-i-c">
            <template v-if="type == '1'">
                <img :src="src" />
            </template>
            <template v-else-if="type == '2'">
                <audio :src="src" controls></audio>
            </template>
            <template v-else>
            <video :src="src" controls></video>
            </template>
        </el-container>
    </div>
    <template #footer>
        <span class="dialog-footer">
            <el-button class="copybtn" size="medium" v-clipboard:copy="src" v-clipboard:success="onCopySuccess" v-clipboard:error="onCopyError">复制文件链接</el-button>
        </span>
    </template>
  </el-dialog>`,
    data() {
        return {
            show: false,
            type: '1',
            src: '',
        }
    },
    computed: {
        titlename() {
            let typename = this.type === '1' ? '图片' : (this.type === '2' ? '音频' : '视频');
            return `${typename}文件预览`;
        }
    },
    methods: {
        showViewer(params) {
            this.show = true;
            this.type = params.type || '1';
            this.src = params.src || '';
        },
        hideViewer() {
            this.show = false;
            this.type = '1';
            this.src = '';
        },
        onCopySuccess(e) {
            this.$message.success(`复制成功`);
        },
        onCopyError() {
            this.$message.error(`复制出错了`);
        }
    },
});

Vue.component('mibo-preview-page', {
    template: `<el-dialog title="预览二维码与地址" :visible.sync="visible" width="360px" top="120px">
            <div class="d-flex flex-j-c-c flex-a-i-c flex-d-c">
                <vue-qr :text="url" :margin="20"></vue-qr>
                <div style="margin-top: 30px;">
                    <el-button class="copyurlbtn" type="primary" size="medium" v-clipboard:copy="url" v-clipboard:success="onCopySuccess" v-clipboard:error="onCopyError">复制链接</el-button>
                    <el-button v-if="browsertype === '2'" class="openweb" type="warning" size="medium" @click="openNewWindow">直接打开</el-button>
                </div>
            </div>
        </el-dialog>`,
    data() {
        return {
            visible: false,
            browsertype: '1',
            url: '',
        }
    },
    methods: {
        show(params) {
            this.url = params.url;
            this.browsertype = params.browsertype || '1';
            this.visible = true;
        },
        onCopySuccess(e) {
            this.$message.success(`复制成功`);
        },
        onCopyError() {
            this.$message.error(`复制出错了`);
        },
        openNewWindow() {
            window.open(this.url, '_blank');
        }
    }
});

Vue.component('mibi-attachment-dialog', {
    template: `<el-dialog :title="typeName + '管理'" v-if="visible" :visible="visible" width="1110px" top="120px" custom-class="attachment-box" @opened="showAttachment" @close="closeAttachment" append-to-body>
    <div>
        <el-container class="attachment-box-wrap">
            <el-aside width="200px">
                <div class="attachment-box-aside" v-loading="cateLoading">
                    <el-tree
                    ref="catetree"
                    check-strictly
                    default-expand-all
                    :data="attachmentCates"
                    :props="{children: 'children',label: 'catename'}"
                    node-key="id"
                    empty-text=" "
                    @node-click="treeNodeClick">
                    </el-tree>
                </div>
            </el-aside>
            <el-container>
                <el-header>
                    <div>
                        <el-row type="flex" align="middle">
                            <el-col :span="2"><el-button size="medium" icon="el-icon-refresh" @click="loadAttachmentList('reload')" :disabled="disabledClick"></el-button></el-col>
                            <el-col :span="22">
                                <div style="float:right" v-show="gid === 'self'">
                                    <el-upload 
                                    ref="uploadFile"
                                    class="upload-files"
                                    action="mibozam"
                                    :show-file-list="false"
                                    :accept="fileTypeName + '/*'"
                                    :on-change="handleFilechange"
                                    :before-upload="beforeUpload"
                                    :http-request="()=>{}"
                                    :disabled="disabledClick"
                                    multiple
                                    >
                                        <el-button type="primary" size="medium" icon="el-icon-upload">点击上传</el-button>
                                    </el-upload>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </el-header>
                <el-main>
                    <el-scrollbar class="attachment-box-main" v-loading="listLoading || cateLoading">
                        <el-row type="flex" class="flex-w-w">
                            <el-col :span="4" style="padding:5px" v-for="one in attachmentLists" :key="one.id">
                                <div>
                                    <el-card class="attachment-card" :class="{selected:isSelected(one.id)}" shadow="hover" @click.native="selectOne(one.id)">
                                        <div @click.stop=""><el-checkbox :value="isSelected(one.id)" @change="selectOne(one.id)"></el-checkbox></div>
                                        <div class="preview-icon d-flex flex-j-c-c flex-a-i-c" @click.stop="showAttachmentPreview(one)"><i class="el-icon-view"></i></div>
                                        <el-image :src="calcAttachmentOneImage(one)" class="attachment-one" fit="scale-down">
                                            <template #error>
                                                <div class="image-error d-flex flex-j-c-c flex-a-i-c">
                                                    <img :src="oneImgError" class="el-image__inner">
                                                </div>
                                            </template>
                                        </el-image>
                                        <div class="filename">{{one.filename}}</div>
                                    </el-card>
                                </div>
                            </el-col>
                            <el-empty v-if="!attachmentLists.length" :image-size="200" style="width:100%"></el-empty>
                        </el-row>
                    </el-scrollbar>
                </el-main>
                <el-footer>
                    <div class="attachment-box-foot d-flex flex-j-c-s-b">
                        <div>
                            <el-checkbox v-show="gid === 'self'" v-model="isAllSelected" :disabled="disabledClick">全选</el-checkbox>
                            <span v-if="gid === 'self' && selectedCount">
                                <el-divider direction="vertical"></el-divider>
                                <el-popconfirm title="删除将无法恢复，您确定删除吗？" @confirm="deleteAttachment">
                                    <template #reference>
                                        <el-button type="danger" size="mini" :disabled="disabledClick">删除</el-button>
                                    </template>
                                </el-popconfirm>
                                <template>
                                    <el-divider direction="vertical"></el-divider>
                                    <span class="chosecount">已选<span>{{selectedCount}}</span>个</span>
                                </template>
                            </span>
                        </div>
                        <div>
                            <el-pagination small :disabled="disabledClick" @size-change="pageSizeChange" @current-change="pageCurrentChange" :current-page="page" :page-sizes="[18, 50, 100, 200]" :page-size="pagesize" layout=" sizes, prev, pager, next, jumper" :total="total"></el-pagination>
                        </div>
                    </div>
                </el-footer>
            </el-container>
        </el-container>
    </div>
    <template #footer>
        <span class="dialog-footer">
            <el-button size="medium"  @click="closeAttachment" :disabled="disabledClick">取 消</el-button>
            <el-button v-if="selectedCount" size="medium" type="primary" @click="confirmAttachment" :disabled="disabledClick">确 定</el-button>
        </span>
    </template>
  </el-dialog>`,
    inject: ['rootRefs'],
    props: {
        type: {
            type: String,
            default: '1',
        },
        visible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            cateLoading: true,
            attachmentCates: [],
            listLoading: true,
            attachmentLists: [],
            selectedIds: [],
            gid: 'self',
            cateid: '-1',
            total: 0,
            page: 1,
            pagesize: 18,
            amtype: this.$amconfig.type,
            debounceTimer: null,
            disabledClick: false,
            uploadFileList: [],
            uploadLoader: null,
        };
    },
    computed: {
        typeName() {
            return this.type == '1' ? '图片' : (this.type == '2' ? '音频' : '视频');
        },
        fileTypeName() {
            return this.type == '1' ? 'image' : (this.type == '2' ? 'audio' : 'video');
        },
        oneImgError() {
            return this.type == '1' ? this.$nopicSrc : (this.type == '2' ? this.$noaudioSrc : this.$novideoSrc);
        },
        selectedCount() {
            return this.selectedIds.length;
        },
        isAllSelected: {
            get() {
                return this.selectedCount > 0 && this.selectedCount === this.attachmentLists.length;
            },
            set(value) {
                this.selectAll(value);
            }
        },
    },
    methods: {
        async showAttachment() {
            this.cateLoading = true;
            try {
                let cates = await this.$http.getattachmentcates({ type: this.type });
                this.cateLoading = false;
                let { data, status } = cates;
                if (status != 200) {
                    this.$message.error(`请求附件分类出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    this.$message.error(data.msg || '请求附件分类出现异常，请稍后重试');
                }
                this.attachmentCates = data.msg;
                this.$refs.catetree.setCheckedKeys([-1], true);
                this.loadAttachmentList();
            } catch (error) {
                this.cateLoading = false;
                this.$message.error(`请求附件分类出现异常，请稍后重试`);
            }
        },
        closeAttachment() {
            this.cateLoading = true;
            this.attachmentCates = [];
            this.listLoading = true;
            this.attachmentLists = [];
            this.selectedIds = [];
            this.page = 1;
            this.gid = 'self';
            this.disabledClick = false;
            this.uploadFileList = [];
            this.uploadLoader = null;
            this.$emit("close-attachment");
        },
        async loadAttachmentList(page) {
            this.listLoading = true;
            try {
                if (page !== 'reload') {
                    this.page = page || 1;
                }
                let { data, status } = await this.$http.getattachmentlist({ gid: this.gid, cateid: this.cateid, type: this.type, page: this.page, psize: this.pagesize });
                if (status != 200) {
                    return this.$message.error(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    return this.$message.error(data.msg);
                }
                this.attachmentLists = data.msg.list;
                this.total = data.msg.total;
                this.listLoading = false;
                this.selectedIds = [];
            } catch (error) {
                this.$message.error(`请求出现异常，请稍后重试`);
            }
        },
        treeNodeClick(data, node) {
            if ((node.level === 2 && (data.id === -1 || !data.children.length)) || node.level === 3) {
                this.$refs.catetree.setCheckedKeys([data.id], true);
                this.gid = data.id === -1 ? 'self' : 'sys';
                this.cateid = data.id;
                this.loadAttachmentList();
            }
        },
        calcAttachmentOneImage(one) {
            return this.type == '1' ? one.filesrc : (this.type == '3' ? one.videoicon : '');
        },
        showAttachmentPreview(one) {
            this.rootRefs.$refs.previewer.showViewer({ type: this.type, src: one.filesrc });
        },
        isSelected(id) {
            return this.selectedIds.includes(id);
        },
        selectOne(id) {
            if (!this.isSelected(id)) {
                this.selectedIds.push(id);
            } else {
                this.selectedIds = this.selectedIds.filter((item) => {
                    return item !== id;
                });
            }
        },
        selectAll(flag) {
            if (flag) {
                this.selectedIds = this.attachmentLists.map((item) => {
                    return item.id;
                });
            } else {
                this.selectedIds = [];
            }
        },

        confirmAttachment() {
            let selectAttachLists = this.attachmentLists.filter(item => this.selectedIds.includes(item.id));
            if (selectAttachLists.length) {
                selectAttachLists = selectAttachLists.sort((a, b) => this.selectedIds.indexOf(a.id) - this.selectedIds.indexOf(b.id));
            }
            let firstOne = selectAttachLists[0] || {};
            if (!firstOne.id) {
                return this.$message.warning(`请先选择${this.typename}`);
            }
            this.$emit('select-attachment', { type: this.type, one: firstOne });
        },
        pageSizeChange(val) {
            this.pagesize = val;
            this.loadAttachmentList();
        },
        pageCurrentChange(val) {
            this.loadAttachmentList(val);
        },
        async deleteAttachment() {
            let listids = this.selectedIds.filter(id => this.attachmentLists.some(obj => obj.id === id));
            if (listids.length) {
                this.disabledClick = true;
                this.listLoading = true;
                try {
                    let { data, status } = await this.$http.delattachment({ imgid: listids });
                    if (status != 200) {
                        return this.$message.error(`请求出现异常，请稍后重试`);
                    }
                    if (data.code != 0) {
                        return this.$message.error(data.msg);
                    }
                    this.disabledClick = false;
                    this.listLoading = false;
                    this.$message.success('删除成功');
                    let totalpage = Math.ceil((this.total - this.selectedIds.length) / this.pagesize);
                    let page = this.page > totalpage ? totalpage : this.page;
                    this.loadAttachmentList(page < 1 ? 1 : page);
                } catch (err) {
                    this.disabledClick = false;
                    this.listLoading = false;
                    this.$message.error(`操作出现异常，请稍后重试`);
                }
            } else {
                return this.$message.error(`请先选择需要删除的${this.typename}`);
            }
        },
        beforeUpload(file) {
            let typeconfig = this.$amconfig[this.fileTypeName] || {};
            let appexts = typeconfig.ext || 'jpg,jpeg,png,gif';
            let maxsize = typeconfig.size || 1024;
            const isallowext = appexts.split(',').includes(this.$utils.getFileExt(file.name, '1'));
            const islowermax = file.size / 1024 <= maxsize;
            if (!isallowext || !islowermax) {
                if (!isallowext) {
                    this.$message.error(`${file.name}格式错误，只能上传${appexts}格式的文件`);
                }
                if (!islowermax) {
                    this.$message.error(`${file.name}过大，文件大小必须小于${maxsize}M`);
                }
            }
            return isallowext && islowermax;
        },
        deBounce(func, delay) {
            return (() => {
                if (this.debounceTimer) {
                    clearTimeout(this.debounceTimer);
                }
                this.debounceTimer = setTimeout(func, delay);
            })();
        },
        handleFilechange(file, fileList) {
            this.disabledClick = true;
            this.deBounce(() => {
                this.uploadFileList = this.$utils.deepClone(fileList);
                this.debounceTimer = null;
                this.uploadLoader = this.$loading({
                    target: '.upload-files',
                    customClass: 'upload-loading',
                    text: '开始上传'
                });
                this.uploadFile();
            }, 1000);
        },
        async uploadFile() {
            if (this.uploadFileList.length > 0) {
                this.uploadLoader.text = `开始上传`;
                let listone = this.uploadFileList.shift();
                let file = listone.raw;
                try {
                    let requestMethod = 'getuploadtoken';
                    let params = { type: this.amtype };
                    if (this.amtype < 1) {
                        requestMethod = 'uploadfiletolocal';
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('amtype', this.type);
                        params = {
                            data: formData,
                            progress: (progressEvent) => {
                                const { loaded, total } = progressEvent;
                                const percent = Math.round(loaded / total * 100);
                                this.uploadLoader.text = `${percent}%`;
                            }
                        };
                    }
                    let { data, status } = await this.$http[requestMethod](params);
                    if (status != 200 || data.code != 0) {
                        if (status != 200) {
                            this.notifyTip({ type: '2', filename: file.name });
                        }
                        if (status === 200 && data.code != 0) {
                            this.notifyTip({ type: '2', filename: file.name, msg: data.msg || '' });
                        }
                    } else {
                        if (this.amtype > 0) {
                            let nowdate = new Date(), nowyear = nowdate.getFullYear(), nowmonth = nowdate.getMonth() + 1;
                            if (nowmonth.length == 1) {
                                nowmonth = '0' + nowmonth;
                            }
                            let filepath = "attachment/web/" + this.fileTypeName + "s/0/" + nowyear + '/' + nowmonth + '/' + this.$utils.uuid(32) + this.$utils.getFileExt(file.name);
                            let putObject = this.amtype == '1' ? 'putOssObject' : (this.amtype == '2' ? 'putCosObject' : 'putQiniuObject');
                            await this[putObject](data.msg, file, filepath);
                            let result = await this.$http[(this.type < 3 ? 'directuploadsavefile' : 'directuploadsavesnapshotfile')]({ isweb: '1', fromtype: 'web', filetype: this.type, filename: file.name, filepath: filepath });
                            if (result.status != 200 || result.data.code != 0) {
                                if (result.status != 200) {
                                    this.notifyTip({ type: '2', filename: file.name });
                                }
                                if (result.status === 200 && result.data.code != 0) {
                                    this.notifyTip({ type: '2', filename: file.name, msg: result.data.msg || '' });
                                }
                            } else {
                                this.notifyTip({ type: '1', filename: file.name });
                            }
                        } else {
                            this.notifyTip({ type: '1', filename: file.name });
                        }
                    }
                    this.uploadFile();
                } catch (err) {
                    this.notifyTip({ type: '2', filename: file.name });
                    this.uploadFile();
                }
            } else {
                setTimeout(() => {
                    this.uploadLoader.close();
                    this.$refs.uploadFile.clearFiles();
                    this.disabledClick = false;
                    this.loadAttachmentList();
                }, 2e2);
            }
        },
        putOssObject(token, file, filepath) {
            return new Promise((resolve, reject) => {
                try {
                    const client = new OSS(token);
                    let result = client.multipartUpload(
                        filepath,
                        file,
                        {
                            progress: (p, cpt, res) => {
                                const percent = Math.round(p * 100);
                                this.uploadLoader.text = `${percent}%`;
                            },
                        },
                    );
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
        },
        putCosObject(token, file, filepath) {
            return new Promise((resolve, reject) => {
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', 'https://' + token.bucket + '.cos.' + token.region + '.myqcloud.com/' + this.$utils.safeUrlEncode(filepath).replace(/%2F/g, '/'), true);
                    xhr.setRequestHeader('Authorization', CosAuth({
                        SecretId: token.key,
                        SecretKey: token.secret,
                        Method: 'PUT',
                        Pathname: '/' + filepath,
                    }));
                    xhr.setRequestHeader('x-cos-security-token', token.token);
                    xhr.upload.onprogress = (e) => {
                        const percent = (Math.round(e.loaded / e.total * 10000) / 100);
                        this.uploadLoader.text = `${percent}%`;
                    };
                    xhr.onload = () => {
                        if (/^2\d\d$/.test('' + xhr.status)) {
                            resolve('success');
                        } else {
                            reject('文件上传失败，状态码：' + xhr.status);
                        }
                    };
                    xhr.onerror = reject;
                    xhr.send(file);
                } catch (err) {
                    reject(err);
                }
            });
        },
        putQiniuObject(token, file, filepath) {
            return new Promise((resolve, reject) => {
                try {
                    const observable = qiniu.upload(file, filepath, token, {
                        customVars: { "x:name": filepath.split('.')[0] }
                    }, {
                        checkByServer: true,
                        checkByMD5: true,
                        forceDirect: false,
                        disableStatisticsReport: false,
                        retryCount: 6,
                        debugLogLevel: 'OFF'
                    });
                    const subscription = observable.subscribe({
                        next: (res) => {
                            const percent = Math.round(res.total.percent);
                            this.uploadLoader.text = `${percent}%`;
                        },
                        error: (err) => {
                            subscription.unsubscribe();
                            reject(err);
                        },
                        complete: (res) => {
                            resolve(res);
                        }
                    });
                } catch (err) {
                    reject(err);
                }
            });

        },
        notifyTip(params) {
            const title = (params.type === '1' ? '上传成功' : '上传失败');
            const filename = params.filename || '';
            const errmsg = params.type === '1' ? '' : '，' + (params.msg || '上传出现异常，请稍后重试');
            this.$notify({
                title: title,
                message: `${filename}${title}${errmsg}`,
                type: (params.type === '1' ? 'success' : 'error'),
            });
        },
    }
});

Vue.component('mibo-input-attachment', {
    template: `<div><el-input v-model="inputValue" :placeholder="placeHolderText" clearable>
            <template #prepend v-if="hasprepend">
                <el-button v-if="prepend.type === 'var'" @click="showVar">{{prepend.title}}</el-button>
                <template v-else>{{prepend.title}}</template>
            </template>
            <template #append>
                <el-button :icon="iconName" @click="showAttachment"></el-button>
            </template>
        </el-input>
        <mibi-attachment-dialog :visible="visible" :type="type" @close-attachment="closeAttachment" @select-attachment="selectAttachment"></mibi-attachment-dialog>
        <mibo-varbox-dialog :visible="varvisible" :type="vartype" @hide-var="hideVar" @confirm-var="confirmVar"></mibo-varbox-dialog>
    </div>`,
    data() {
        return {
            visible: false,
            varvisible: false,
        }
    },
    props: {
        value: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            default: '1',
        },
        vartype: {
            type: String,
            default: '1',
        },
        hasprepend: {
            type: Boolean,
            default: false,
        },
        prepend: {
            type: Object,
            default() {
                return { type: 'var', title: '使用变量' }
            }
        }
    },
    computed: {
        inputValue: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit('input', value);
            }
        },
        iconName() {
            let typeicon = this.type === '1' ? 'picture' : (this.type === '2' ? 'microphone' : 'video-camera');
            return `el-icon-${typeicon}`;
        },
        placeHolderText() {
            const typename = this.type === '1' ? '图片' : (this.type === '2' ? '音频' : '视频');
            return `点击右侧按钮选择或上传${typename}`;
        }
    },
    methods: {
        showAttachment() {
            this.visible = true;
        },
        closeAttachment() {
            this.visible = false;
        },
        selectAttachment(data) {
            this.inputValue = data.one.filepath;
            //通知父组件
            this.$emit('select-attachment', data.one);
            this.closeAttachment();
        },
        showVar() {
            this.varvisible = true;
        },
        hideVar() {
            this.varvisible = false;
        },
        confirmVar(name) {
            this.inputValue = name;
            this.hideVar();
        }
    }
});

Vue.component('mibo-uploadbox', {
    template: `<div class="uploadbox">
        <div class="uploadbox-main" :style="{width:config.width+'px',height:config.height+'px'}">
            <div v-if="inputValue" class="uploadbox-img" @click="showAttachment">
                <el-image style="width: 100%; height: 100%" :src="parseAttachSrc(inputValue)" fit="contain"></el-image>
                <div class="uploadbox-mask"><i class="el-icon-plus"></i></div>
            </div>
            <div v-else class="uploadbox-trigger" @click="showAttachment">
                <i class="el-icon-upload"></i>
                <div>点击上传</div>
            </div>
            <div v-if="hasdelete && inputValue" class="uploadbox-delete" @click.stop="inputValue = ''"><i class="el-icon-error"></i></div>
        </div>
        <div v-if="config.hastip" class="uploadbox-footer-tip">{{config.tip}}</div>
        <mibi-attachment-dialog :visible="visible" :type="type" @close-attachment="closeAttachment" @select-attachment="selectAttachment"></mibi-attachment-dialog>
    </div>`,
    props: {
        value: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            default: '1',
        },
        hasdelete: Boolean,
        hastip: Boolean,
        config: {
            type: Object,
            default() {
                return {
                    width: 80,
                    height: 80,
                    hastip: true,
                    tip: '建议尺寸：50*50px',
                }
            }
        }
    },
    data() {
        return {
            visible: false,
        }
    },
    computed: {
        inputValue: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit('input', value);
            }
        },
    },
    methods: {
        showAttachment() {
            this.visible = true;
        },
        closeAttachment() {
            this.visible = false;
        },
        selectAttachment(data) {
            this.inputValue = data.one.filepath;
            this.closeAttachment();
        },
    }
});

Vue.component('mibo-eventbox-dialog', {
    template: `<el-dialog title="触发事件" :visible="visible" width="1110px" top="120px" custom-class="clickevent-box" @opened="showEventBox" @close="hideEventBox">
    <div class="clickevent-box-wrap" v-loading="isloading">
            <el-tabs v-model="catetype" type="card" stretch>
                <el-tab-pane label="活动相关页面" name="hdpage">
                    <el-scrollbar class="scroll-box">
                        <el-row :gutter="10" class="controlbtn-row">
                            <el-col :span="6" v-for="(btn,index) in pagemodules" :key="btn.type">
                                <el-button :type="pagebtn.type === btn.type ? 'primary' : ''" size="medium" @click="changePageBtn(btn)">{{btn.title}}</el-button>
                            </el-col>
                        </el-row>
                    </el-scrollbar>
                </el-tab-pane>
                <el-tab-pane label="自定义页面" name="diypage" v-if="diypages.length">
                    <el-scrollbar class="scroll-box">
                        <el-row :gutter="10" class="controlbtn-row">
                            <el-col :span="6" v-for="page in diypages" :key="page.id">
                                <el-button style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;" :type="diypage.pageid === page.id ? 'primary' : ''" size="medium" @click="changediyPageBtn(page)">(id:{{page.id}}){{page.name || page.title}}</el-button>
                            </el-col>
                        </el-row>
                    </el-scrollbar>
                </el-tab-pane>
                <el-tab-pane label="功能按钮" name="controlbtn">
                    <el-scrollbar class="scroll-box">
                        <el-row :gutter="10" class="controlbtn-row">
                            <el-col :span="6" v-for="(btn,index) in controlbtns" :key="btn.type">
                                <el-button :type="onebtn.type === btn.type ? 'primary' : ''" size="medium" @click="changeControlBtn(btn)">{{btn.title}}</el-button>
                            </el-col>
                        </el-row>
                        <el-divider></el-divider>
                        <el-form v-if="onebtn.type" v-model="onebtn" size="medium" label-width="100px">
                            <div v-for="(item,index) of onebtn.params" :key="index">
                                <template v-if="$utils.isArray(item.val)">
                                    <el-divider></el-divider>
                                    <vdp tag="div" class="imglist" v-model="item.val" animation="100" direction="vertical" draggable=".el-row">
                                        <el-row type="flex" justify="space-around" v-for="(img,ssindex) in item.val" :key="ssindex">
                                            <el-col :span="20">
                                                <el-form-item :label="'图片'+ (ssindex + 1)"  size="mini" style="margin-bottom:8px">
                                                    <mibo-input-attachment v-model="img.src"></mibo-input-attachment>
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="4">
                                                <el-button size="mini" icon="el-icon-sort" style="margin-left:5px">排序</el-button>
                                                <el-popconfirm title="删除将无法恢复，您确定删除吗？" @confirm="removeOnetipimg(ssindex)">
                                                    <template #reference>
                                                        <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                                                    </template>
                                                </el-popconfirm>
                                            </el-col>
                                        </el-row>
                                    </vdp>
                                    <el-row type="flex" justify="center" style="margin-bottom:10px">
                                        <el-button type="primary" icon="el-icon-plus" size="medium" @click="addOnetipimg" style="width:auto">新增一张图片</el-button>
                                    </el-row>
                                </template>
                                <template v-else>
                                    <el-form-item v-if="item.label" :label="item.label" style="width:80%">
                                        <el-input-number v-if="item.type==='inputnumber'" v-model="item.val"  :step="item.step" :min="item.min" :max="item.max" :label="'请输入'+item.label"></el-input-number>
                                        <el-slider v-else-if="item.type==='slider'" v-model="item.val" :step="item.step" :min="item.min" :max="item.max" show-input input-size="mini"></el-slider>
                                        <el-switch v-else-if="item.type==='switch'" v-model="item.val"></el-switch>
                                        <el-input v-else v-model="item.val" :placeholder="'请输入'+item.label" clearable />
                                    </el-form-item>
                                </template>  
                            </div>
                        </el-form>
                    </el-scrollbar>
                </el-tab-pane>
                <el-tab-pane label="外链" name="outerlink">
                    <el-form size="medium" label-width="100px">
                        <el-form-item label="打开方式">
                            <el-radio-group v-removeAriaHidden v-model="outlinktypename">
                                <el-radio-button label="跳转新页面"></el-radio-button>
                                <el-radio-button label="iframe嵌入弹窗"></el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item :label="outerlink.params.redirect.label" style="width:80%">
                            <el-input v-model="outerlink.params.redirect.val" :placeholder="'请输入'+outerlink.params.redirect.label" clearable />
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                
            </el-tabs>
    </div>
    <template #footer>
        <span class="dialog-footer">
            <el-button size="medium"  @click="clearEventBox">清除事件</el-button></el-button>
            <el-button size="medium"  @click="hideEventBox">取 消</el-button>
            <el-button size="medium" type="primary" @click="confirmSelect">确 定</el-button>
        </span>
    </template>
  </el-dialog>`,
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        config: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            isloading: true,
            catetype: 'hdpage',
            pagemodules: [],
            pagebtn: {},
            diypages: [],
            diypage: {},
            controlbtns: [
                {
                    type: 'tiptext',
                    title: '弹出提示',
                    params: {
                        text: {
                            label: '文本内容',
                            type: "input",
                            val: "提示文本内容"
                        },
                        duration: {
                            label: '显示时长(秒)',
                            type: 'slider',
                            min: 0.5,
                            max: 30,
                            step: 0.1,
                            val: 3
                        },
                    }
                },
                {
                    type: 'tipimg',
                    title: '弹出图片',
                    params: {
                        overlay: {
                            label: '遮罩层',
                            type: 'switch',
                            val: true,
                        },
                        imglist: {
                            label: '图片列表',
                            type: 'array',
                            val: [],
                        },
                    }
                },
                {
                    type: 'callphone',
                    title: "拨打电话",
                    params: {
                        phone: {
                            label: '电话号码',
                            type: 'input',
                            val: '',
                        },
                    }
                }
            ],
            onebtn: {},
            outerlink: {
                title: "外链",
                type: 'normal',
                params: {
                    redirect: {
                        label: "链接地址",
                        type: 'input',
                        val: '',
                    }
                },
            }
        }
    },
    computed: {
        outlinktypename: {
            get() {
                return this.outerlink.type == 'normal' ? '跳转新页面' : 'iframe嵌入弹窗';
            },
            set(value) {
                this.outerlink.type = (value === '跳转新页面' ? 'normal' : 'iframe');
            }
        },
    },
    methods: {
        async showEventBox() {
            try {
                this.isloading = true;
                let config = { hdid: XCV3Config.hdid };
                if (XCV3Config.hasOwnProperty('tplid')) {
                    config = {
                        fromtype: 'sys',
                    };
                }
                let { data, status } = await this.$http.gethdmodules(config);
                if (status != 200) {
                    return this.$message.error(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    return this.$message.error(data.msg || '请求出现异常，请稍后重试');
                }
                this.isloading = false;
                let { hdmodules, hdpages } = data.msg;
                this.pagemodules = hdmodules;
                this.diypages = hdpages || [];
                this.onebtn = {};
                //深度克隆一次 防止乱点将事件改了 只有点击确定的时候才能改
                let clickdata = this.$utils.deepClone(this.config);
                this.catetype = clickdata.cate || 'hdpage';
                if (this.catetype == 'controlbtn') {
                    let controlbtn = this.controlbtns.find((item) => {
                        return clickdata.type === item.type;
                    });
                    // 默认数据
                    if (controlbtn) {
                        // 将用户提交的数据以及默认数据来个合并
                        let defaultbtn = this.$utils.deepClone(controlbtn);
                        this.onebtn = { ...defaultbtn, ...clickdata };
                    }
                    this.outerlink = this.$options.data().outerlink;
                } else if (this.catetype == 'outerlink') {
                    this.outerlink = { ...this.outerlink, ...clickdata };
                    this.controlbtns = this.$options.data().controlbtns;
                } else {
                    this.outerlink = this.$options.data().outerlink;
                    this.controlbtns = this.$options.data().controlbtns;
                    if (this.catetype == 'hdpage') {
                        this.diypage = {};
                        this.pagebtn = {
                            type: clickdata.type,
                            title: clickdata.title,
                        };
                    } else {
                        this.pagebtn = {};
                        this.diypage = {
                            pageid: clickdata.pageid,
                            title: clickdata.title,
                        };
                    }

                }
            } catch (err) {
                console.log(err)
            }
        },
        hideEventBox() {
            this.$emit('hide-eventbox');
        },
        clearEventBox() {
            this.outerlink = this.$options.data().outerlink;
            this.controlbtns = this.$options.data().controlbtns;
            this.pagebtn = {};
            this.diypage = {};
            this.$emit('confirm-eventbox');
        },
        changeControlBtn(config) {
            this.onebtn = config;
        },
        changePageBtn(config) {
            this.pagebtn = config;
        },
        changediyPageBtn(page) {
            this.diypage = {
                pageid: page.id,
                title: page.title,
            };
        },
        addOnetipimg() {
            this.onebtn.params.imglist.val.push({ src: '' })
        },
        removeOnetipimg(index) {
            this.onebtn.params.imglist.val.splice(index, 1)
        },
        confirmSelect() {
            let confirmdata = {};
            if (this.catetype === 'hdpage') {
                confirmdata = this.$utils.deepClone(this.pagebtn);
                confirmdata.params = {};
            } else if (this.catetype === 'diypage') {
                confirmdata = this.$utils.deepClone(this.diypage);
                confirmdata.params = {};
            } else if (this.catetype === 'controlbtn') {
                confirmdata = this.$utils.deepClone(this.onebtn);
                if (confirmdata.type === 'tipimg') {
                    confirmdata.params.imglist.val = confirmdata.params.imglist.val.filter((item) => {
                        return item.src;
                    });
                }
            } else {
                confirmdata = this.$utils.deepClone(this.outerlink);
            }
            confirmdata.cate = this.catetype;
            this.$emit('confirm-eventbox', confirmdata);
            //重置本次点击事件的设置数据防止干扰其他组件的点击事件
            this.outerlink = this.$options.data().outerlink;
            this.controlbtns = this.$options.data().controlbtns;
        }
    },
});

Vue.component('mibo-input-clickevent', {
    template: `<div><el-input v-model="inputValue" v-bind="$attrs" v-on="$listeners" placeholder="点击右侧按钮设置点击事件" disabled>
            <template #prepend v-if="hasprepend">
                {{prepend.title}}
            </template>
            <template #append>
                <el-button icon="el-icon-connection" @click="showEventbox"></el-button>
            </template>
        </el-input>
        <mibo-eventbox-dialog :visible="visible" :config="value" @hide-eventbox="hideEventBox" @confirm-eventbox="confirmEventbox"></mibo-eventbox-dialog>
    </div>`,
    data() {
        return {
            visible: false,
        }
    },
    props: {
        value: {
            type: Object,
            default() {
                return {};
            }
        },
        hasprepend: {
            type: Boolean,
            default: false,
        },
        prepend: {
            type: Object,
            default() {
                return { title: '选择事件' };
            }
        }
    },
    computed: {
        inputValue: {
            get() {
                return this.calcEventTitle(this.value);
            },
            set(value) {
                this.$emit('input', value);
            }
        },
    },
    methods: {
        showEventbox() {
            this.visible = true;
        },
        hideEventBox() {
            this.visible = false;
        },
        confirmEventbox(data) {
            if (!data) {
                data = {
                    "cate": "",
                    "type": "",
                    "title": "",
                    "params": {},
                };
            }
            this.inputValue = data;
            this.hideEventBox();
        },
    }
});

Vue.component('mibo-tinymce-editor', {
    template: `<div>
        <editor v-model="editorContent" :init="init"></editor>
        <mibi-attachment-dialog :visible="attachmentVisible" :type="attachmentType" @close-attachment="closeAttachment" @select-attachment="selectAttachment"></mibi-attachment-dialog>
    </div>`,
    model: {
        prop: 'value',
        event: 'update'
    },
    props: {
        value: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            editor: null,
            init: {
                deprecation_warnings: false,
                branding: false,
                content_css: '/static/js/tinymce/skins/ui/oxide/content.min.css',
                body_class: 'my-custom-font',
                language_url: '/static/js/tinymce/langs/zh_CN.js',
                language: "zh_CN",
                height: 630,
                plugins: ' anchor autolink autosave code codesample colorpicker contextmenu directionality emoticons fullscreen hr image imagetools media insertdatetime link charmap lists advlist noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textcolor textpattern visualblocks visualchars wordcount indent2em',
                toolbar: ["formatting forecolor fontsizeselect fontselect backcolor lineheight indent2em outdent indent", "alignment hr bullist numlist link insertimage insertvideo table removeformat code undo redo"],
                toolbar_groups: {
                    formatting: {
                        text: '格式',
                        tooltip: 'Formatting',
                        items: 'bold italic underline | superscript subscript strikethrough'
                    },
                    alignment: {
                        text: '对齐',
                        tooltip: 'Alignment',
                        items: 'alignleft aligncenter alignright alignjustify'
                    },
                    custom_button: {
                        icon: 'image',
                        tooltip: '自定义按钮',
                        items: ''
                    },
                },
                fontsize_formats: '12px 13px 14px 15px 16px 17px 18px 19px 20px 21px 22px 23px 24px 26px 28px 30px 32px',
                lineheight_formats: '1 1.1 1.2 1.3 1.4 1.5 1.6 1.7 1.8 1.9 2.0 2.5 3',
                font_formats: ['Arial', 'Tahoma', 'Open Sans', 'cursive', 'fantasy', 'monospace', 'serif', 'sans-serif', '宋体', '仿宋', '华文仿宋', '黑体', '微软雅黑', '华文细黑', '楷体'],
                font_formats: "Arial=arial;Tahoma=Tahoma;Open Sans=Open Sans;Cursive=cursive;Fantasy=fantasy;Monospace=monosapce;Serif=serif;Sans-Serif=sans-serif;宋体=宋体;仿宋=仿宋;华文仿宋=华文仿宋;黑体=黑体;微软雅黑=微软雅黑;华文细黑=华文细黑;楷体=楷体",
                //menubar: 'file edit insert view format table tools',
                menubar: 'file edit insert view format table',
                menu: {
                    //file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | print | deleteallconversations' },
                    file: { title: 'File', items: 'newdocument' },
                    edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
                    //insert: { title: 'Insert', items: 'image link media addcomment pageembed codesample inserttable | math | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime' },
                    insert: { title: 'Insert', items: 'link | hr' },
                    //view: { title: 'View', items: 'code revisionhistory | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments' },
                    view: { title: 'View', items: 'code visualaid' },
                    format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat' },
                    tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount' },
                    table: { title: 'Table', items: 'inserttable | cell row column | advtablesort | tableprops deletetable' },
                },
                resize: true,
                setup: (editor) => {
                    editor.ui.registry.addButton('insertimage', {
                        icon: 'image',
                        tooltip: '插入图片',
                        onAction: () => {
                            this.showAttachment();
                        }
                    });
                    editor.ui.registry.addButton('insertvideo', {
                        icon: 'embed',
                        tooltip: '插入视频',
                        onAction: () => {
                            this.showAttachment('3');
                        }
                    });
                    this.editor = editor;
                }
            },
            attachmentVisible: false,
            attachmentType: '1',
        };
    },
    computed: {
        editorContent: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('update', val);
            }
        }
    },
    mounted() {
        tinymce.init({});
    },
    beforeDestroy() {
        if (this.editor) {
            this.editor.destroy();
        }
    },
    methods: {
        showAttachment(type) {
            this.attachmentType = type || '1';
            this.attachmentVisible = true;
        },
        closeAttachment() {
            this.attachmentVisible = false;
            this.attachmentType = '1';
        },
        selectAttachment(data) {
            let insertHtml = '';
            if (this.attachmentType == '1') {
                insertHtml += `<img src="${data.one.filesrc}">`;
            } else {
                insertHtml += `<video controls poster="${data.one.videoicon}" src="${data.one.filesrc}"></video>`
            }
            this.editor.insertContent(insertHtml);
            this.closeAttachment();
        },
    },
});

Vue.component('mibo-varbox-dialog', {
    template: `<el-dialog :title="titlename" :visible="visible" custom-class="vars-box" @opened="showVarsbox" @close="hideVarsbox" width="800px" append-to-body>
    <div class="vars-box-wrap" v-loading="isloading">
        <el-tabs v-model="tabName">
            <el-tab-pane  v-for="item in typeVars" :key="item.type" :label="item.label" :name="item.type">
                <el-scrollbar>
                    <el-row style="padding:0 12px">
                        <el-col :span="24" v-for="one in item.lists" :key="one.name">
                            <el-row :gutter="10">
                                <el-col :span="20">
                                    <el-button size="medium" @click="copyVar(one.name)">
                                        <div class="d-flex flex-j-c-s-b">
                                            <span class="vardes">{{one.label}}</span>
                                            <span class="varname">{{one.name}}<i class="el-icon-document-copy"></i></span>
                                        </div>
                                    </el-button>
                                </el-col>
                                <el-col :span="4">
                                    <el-button size="medium" type="primary" @click="confirmVar(one.name)">使用</el-button>
                                </el-col>
                            </el-row>
                        </el-col>
                        <el-empty v-if="!item.lists.length" :image-size="200"></el-empty>
                    </el-row>
                </el-scrollbar>
            </el-tab-pane>
        </el-tabs>
    </div>
  </el-dialog>`,
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: '1',
        }
    },
    data() {
        return {
            isloading: false,
            tabName: 'user',
            textVars: [],
            imageVars: [],
        }
    },
    computed: {
        titlename() {
            let typename = this.type === '1' ? '文字' : '图片';
            return `${typename}变量选择器`;
        },
        typeVars() {
            return this.type === '1' ? this.textVars : this.imageVars;
        },
    },
    methods: {
        async showVarsbox() {
            try {
                this.isloading = true;
                let config = { hdid: XCV3Config.hdid };
                if (XCV3Config.hasOwnProperty('tplid')) {
                    config = {
                        fromtype: 'sys',
                    };
                }
                let { data, status } = await this.$http.getVarsConfig(config);
                if (status != 200) {
                    return this.$message.error(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    return this.$message.error(data.msg || '请求出现异常，请稍后重试');
                }
                this.textVars = data.msg.textvars || [];
                this.imageVars = data.msg.imagevars || [];
                this.isloading = false;
            } catch (error) {
                this.$message.error(`获取变量出错`);

            }
        },
        hideVarsbox() {
            this.tabName = 'user';
            this.$emit('hide-var');
        },

        copyVar(name) {
            this.$copyText(name).then((e) => {
                this.$message.success(`${e.text}已复制，请复制到输入框内`);
            }, (e) => {
                this.$message.error(`复制出错了`);
            });
        },
        confirmVar(name) {
            this.$emit('confirm-var', name);
        }
    }
});

Vue.component('mibo-fontpicker-dialog', {
    template: `<el-dialog title="图标选择器" v-if="visible" :visible="visible" custom-class="fontpickerdialog-box" width="800px" @close="hidePicker" append-to-body>
    <div class="fontpickerdialog-box-wrap">
        <el-tabs v-model="tabName">
            <el-tab-pane label="图标" name="font">
                <div class="searchbox">
                    <el-input placeholder="请输入搜索内容" prefix-icon="el-icon-search" v-model="keyword" size="medium"></el-input>
                </div>
                <el-scrollbar class="fontpickerdialog-box-scrollbar">
                    <el-row :gutter="10">
                        <el-col :span="4" v-for="item in fontlist" :key="item.fclass">
                            <div class="icon-box" @click="confirmFontOne(item.fclass)">
                                <i :class="prefix + item.fclass" style="font-size:24px"></i>
                            </div>
                            <div class="icon-name">{{item.fname}}</div>
                        </el-col>
                    </el-row>
                </el-scrollbar>
            </el-tab-pane>
        </el-tabs>
    </div>
  </el-dialog>`,
    data() {
        return {
            keyword: '',
            tabName: 'font',
            prefix: 'el-icon-',
            fonts: fontnames,
        }
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        }
    },
    computed: {
        fontlist() {
            return this.fonts.filter((item) => {
                return item.fname.indexOf(this.keyword) != -1;
            });
        }
    },
    methods: {
        hidePicker() {
            this.keyword = '';
            this.$emit("hide-picker");
        },
        confirmFontOne(fclass) {
            this.$emit('select-font', this.prefix + fclass);
        }
    },
});
//选择图标
Vue.component('mibo-font-picker', {
    template: `<div class="fontpicker">
        <div class="picker-icon" :style="{width:config.width+'px',height:config.height+'px'}" @click="showPicker">
            <div class="icon-box d-flex flex-j-c-c flex-a-i-c">
                <mibo-icon :iconname="iconname" :iconsize="config.iconsize||32"></mibo-icon>
            </div>
            <div class="picker-mask d-flex flex-j-c-c flex-a-i-c">
                <i class="el-icon-plus""></i>
            </div>
        </div>
        <mibo-fontpicker-dialog :visible="visible" @hide-picker="hidePicker" @select-font="selectFont"></mibo-fontpicker-dialog>  
    </div>`,
    data() {
        return {
            visible: false,
        }
    },
    model: {
        prop: 'iconname',
        event: 'update',
    },
    props: {
        iconname: {
            type: String,
            default: '',
        },
        config: {
            type: Object,
            default() {
                return {
                    width: 68,
                    height: 68,
                    iconsize: 32
                }
            }
        }
    },
    methods: {
        showPicker() {
            this.visible = true;
        },
        hidePicker() {
            this.visible = false;
        },
        selectFont(iconname) {
            this.$emit("update", iconname);
            this.hidePicker();
        }
    }
});
//自定义图标
Vue.component('mibo-icon', {
    template: `<van-icon :class-prefix="classPrefix" :name="iconName" :color="iconcolor" :size="iconsize"></van-icon>`,
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
        }
    }
});

Vue.component('mibo-createpage-dialog', {
    template: `<el-dialog title="创建页面" v-if="visible" :visible="visible" custom-class="createpage-box" width="700px" @close="hideCreatebox" append-to-body>
    <div class="createpage-box-wrap">
    <el-form :model="datas" :rules="rules" ref="createpageForm" label-width="80px" size="medium">
        <el-form-item label="页面名称" prop="name">
            <el-input v-model="datas.name" placeholder="请输入页面名称" maxlength="25" show-word-limit />
        </el-form-item>
        <el-form-item label="页面标题" prop="title">
            <el-input v-model="datas.title" placeholder="请输入页面标题" maxlength="25" show-word-limit />
        </el-form-item>
        <el-form-item label="背景信息">
            <div class="background-image-box" style="margin-bottom:15px">
                <el-row>
                    <el-col :span="3" class="background-position">
                        <div class="pos-grid d-flex flex-w-w">
                            <div class="d-flex flex-j-c-c flex-a-i-c" v-for="(item,index) in $styleconfig.background.positions" :key="index" :class="{actived:(item.val == datas.background.position)}" @click.stop="datas.background.position = item.val"><i :class="item.icon"></i></div>
                        </div>
                    </el-col>
                    <el-col :span="21">
                        <el-form label-width="50px" size="mini">
                            <el-form-item label="图片" style="margin-bottom:10px">
                                <mibo-input-attachment v-model="datas.background.image"></mibo-input-attachment>
                            </el-form-item>
                            <el-form-item label="填充" style="margin-bottom:0">
                                <div class="d-flex flex-a-i-c">
                                    <el-color-picker v-model="datas.background.color" show-alpha style="margin-right:5px"></el-color-picker>
                                    <el-select v-model="datas.background.mode" placeholder="请选择填充模式" style="width:120px;margin-right:5px">
                                        <el-option v-for="(bmode,index) in $styleconfig.background.modes" :key="index" :label="bmode.label" :value="bmode.val"></el-option>
                                    </el-select>
                                    <el-select v-model="datas.background.attachment" placeholder="请选择固定模式">
                                        <el-option v-for="(battach,index) in $styleconfig.background.attachments" :key="index" :label="battach.label" :value="battach.val"></el-option>
                                    </el-select>
                                </div>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </div>
        </el-form-item>
        <el-form-item label="微信分享">
            <el-switch v-model="datas.shareDetail.open" active-value="1" inactive-value="2"></el-switch>
        </el-form-item>
        <div v-show="datas.shareDetail.open == '1'">
            <el-form-item label="分享标题">
                <el-input v-model="datas.shareDetail.title" placeholder="请输入分享标题" maxlength="25" show-word-limit />
            </el-form-item>
            <el-form-item label="分享图标">
                <mibo-uploadbox v-model="datas.shareDetail.icon" hasdelete></mibo-uploadbox>
            </el-form-item>
            <el-form-item label="分享简介">
                <el-input type="textarea" v-model="datas.shareDetail.desc"></el-input>
            </el-form-item>
        </div>
        <el-form-item label="访问限制">
            <el-radio v-model="datas.browsertype" label="1">仅限微信</el-radio>
            <el-radio v-model="datas.browsertype" label="2">所有浏览器均可</el-radio>
            <el-popover
                placement="top-start"
                title="温馨提醒"
                width="200"
                trigger="hover"
                content="如果页面内使用了用户信息或签到信息相关的变量建议选择仅限微信">
                <template #reference>
                    <el-button type="text" icon="el-icon-warning-outline" style="position: absolute;top: 0px;"></el-button>
                </template>
            </el-popover>
        </el-form-item>
        <el-form-item label="微信跳过登录" label-width="100px" >
            <el-switch v-model="datas.wxskiplogin" active-value="1" inactive-value="2"></el-switch>
            <el-popover
                placement="top-start"
                title="温馨提醒"
                width="200"
                trigger="hover"
                content="开启则通过微信访问当前页面会自动跳过微信登录与签到功能直接进入页面，如果页面内使用了用户微信相关信息或签到相关信息建议关闭此开关">
                <template #reference>
                    <el-button type="text" icon="el-icon-warning-outline" style="margin-left:10px"></el-button>
                </template>
            </el-popover>
        </el-form-item>
    </el-form>
    </div>
    <template #footer>
        <span class="dialog-footer">
            <el-button size="medium"  @click="hideCreatebox">取 消</el-button>
            <el-button size="medium" type="primary" @click="confirmCreate">确 定</el-button>
        </span>
    </template>
  </el-dialog>`,
    data() {
        return {
            datas: {},
            rules: {
                title: [
                    { required: true, message: '请输入页面标题', trigger: 'blur' },
                ],
            }
        }
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    mounted() {
        this.initDatas();
    },
    methods: {
        initDatas() {
            this.datas = this.$utils.deepClone(this.$pageset);
        },
        hideCreatebox() {
            this.initDatas();
            this.$emit("hide-createbox");
        },
        confirmCreate() {
            this.$refs.createpageForm.validate((valid) => {
                if (valid) {
                    this.createnewPage();
                } else {
                    return false;
                }
            });
        },
        async createnewPage() {
            try {
                let { data, status } = await this.$http.createnewpage({
                    hdid: XCV3Config.hdid,
                    diydata: {
                        pageset: this.datas,
                        phoneComponents: [],
                    }
                });
                if (status != 200) {
                    return this.$message.error(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    return this.$message.error(data.msg || '请求出现异常，请稍后重试');
                }
                this.initDatas();
                this.$emit("success-created");
            } catch (error) {
                this.$message.error(`请求出现异常，请稍后重试`);
            }
        }
    },
});

Vue.component('stylestyle', {
    template: `<el-form size="mini"><el-collapse v-model="activecolls">
    <el-collapse-item title="背景属性" name="1" v-if="styleHasProperty('background')">
        <div class="background-image-box">
            <el-row>
                <el-col :span="4" class="background-position">
                    <div class="pos-grid d-flex flex-w-w">
                        <div class="d-flex flex-j-c-c flex-a-i-c" v-for="(item,index) in $styleconfig.background.positions" :key="index" :class="{actived:(item.val == styles.background.position)}" @click.stop="styles.background.position = item.val"><i :class="item.icon"></i></div>
                    </div>
                </el-col>
                <el-col :span="20">
                    <el-form label-width="50px" size="mini">
                        <el-form-item label="图片" style="margin-bottom:10px">
                            <mibo-input-attachment v-model="styles.background.image"></mibo-input-attachment>
                        </el-form-item>
                        <el-form-item label="填充" style="margin-bottom:0">
                            <div class="d-flex flex-a-i-c">
                                <el-color-picker v-model="styles.background.color" show-alpha style="margin-right:5px"></el-color-picker>
                                <el-select v-model="styles.background.mode" placeholder="请选择填充模式" style="width:120px;margin-right:5px">
                                    <el-option v-for="(bmode,index) in $styleconfig.background.modes" :key="index" :label="bmode.label" :value="bmode.val"></el-option>
                                </el-select>
                                <el-select v-model="styles.background.attachment" placeholder="请选择固定模式">
                                    <el-option v-for="(battach,index) in $styleconfig.background.attachments" :key="index" :label="battach.label" :value="battach.val"></el-option>
                                </el-select>
                            </div>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </el-collapse-item>
    <el-collapse-item title="文字属性" name="2" v-if="styleHasProperty('font')">
        <el-form label-width="70px" size="mini">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="颜色">
                        <el-color-picker v-model="styles.color" show-alpha></el-color-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item label="大小" label-width="40px">
                        <el-input-number v-model="styles.font.size" controls-position="right" :min="12" :max="72" style="width:110px"></el-input-number>
                    </el-form-item>
                </el-col>
                <el-col :span="9" v-if="styleHasProperty('line')">
                    <el-form-item label="行高" label-width="40px">
                        <el-input-number v-model="styles.line.height" controls-position="right" :min="12" :max="72" style="width:110px"></el-input-number>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="字体" v-show="!texttype || texttype === 'normal'">
                <el-select v-model="styles.font.family" placeholder="请选择字体">
                    <el-option v-for="(fm,index) in $styleconfig.familys" :key="index" :label="fm" :value="fm"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="样式">
                <el-checkbox v-model="styles.font.weight" true-label="bold" false-label="normal" border style="margin-right:10px">加粗</el-checkbox>
                <el-checkbox v-model="styles.font.style" true-label="italic" false-label="normal" border style="margin-right:10px">斜体</el-checkbox>
            </el-form-item>
            <el-form-item label="下划线" v-if="styleHasProperty('text.decoration')">
                <el-radio-group v-removeAriaHidden v-model="styles.text.decoration">
                    <el-radio label="none" border style="margin-right:10px">无</el-radio>
                    <el-radio label="underline" border style="margin-right:10px">下划线</el-radio>
                    <el-radio label="line-through" border style="margin-right:10px">删除线</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="水平对齐" v-if="styleHasProperty('text.align')">
                <el-radio-group v-removeAriaHidden v-model="styles.text.align">
                    <el-radio label="justify" border style="margin-right:10px">左对齐</el-radio>
                    <el-radio label="center" border style="margin-right:10px">居中对齐</el-radio>
                    <el-radio label="right" border style="margin-right:10px">右对齐</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="垂直对齐" v-if="styleHasProperty('align.items')">
                <el-radio-group v-removeAriaHidden v-model="styles.align.items">
                    <el-radio label="flex-start" border style="margin-right:10px">垂直置顶</el-radio>
                    <el-radio label="center" border style="margin-right:10px">垂直居中</el-radio>
                    <el-radio label="flex-end" border style="margin-right:10px">垂直置底</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </el-collapse-item>
    <el-collapse-item title="宽高与位置" name="3" v-if="styleHasProperty('height') || styleHasProperty('width') || styleHasProperty('top') || styleHasProperty('left')">
        <el-form label-width="40px" size="mini" inline>
            <el-form-item label="高度" v-if="styleHasProperty('height')">
                <el-input-number v-model="styles.height" :min="0" @change="wrapSizeChange"></el-input-number>
            </el-form-item>
            <el-form-item label="宽度" v-if="styleHasProperty('width')">
                <el-input-number v-model="styles.width" :min="0"></el-input-number>
            </el-form-item>
            <el-form-item label="上边" v-if="styleHasProperty('top')">
                <el-input-number v-model="styles.top" :min="0"></el-input-number>
            </el-form-item>
            <el-form-item label="左边" v-if="styleHasProperty('left')">
                <el-input-number v-model="styles.left" :min="0"></el-input-number>
            </el-form-item>
        </el-form>
    </el-collapse-item>
    <el-collapse-item title="内边距" name="4" v-if="styleHasProperty('padding')">
        <el-form-item style="margin-bottom:15px">
                <el-checkbox v-model="styles.paddinglock" @change="paddinglockChange">锁定</el-checkbox>
        </el-form-item>
        <el-form label-width="30px" size="mini" inline>
            <el-form-item label="上">
                <el-input-number v-model="styles.padding.top" controls-position="right" :min="0" @change="updatePadding"></el-input-number>
            </el-form-item>
            <el-form-item label="下">
                <el-input-number v-model="styles.padding.bottom" controls-position="right" :min="0" @change="wrapSizeChange" :disabled="styles.paddinglock"></el-input-number>
            </el-form-item>
            <el-form-item label="左">
                <el-input-number v-model="styles.padding.left" controls-position="right" :min="0" :max="375" @change="wrapSizeChange" :disabled="styles.paddinglock"></el-input-number>
            </el-form-item>
            <el-form-item label="右">
                <el-input-number v-model="styles.padding.right" controls-position="right" :min="0" :max="375" @change="wrapSizeChange" :disabled="styles.paddinglock"></el-input-number>
            </el-form-item>
        </el-form>
    </el-collapse-item>
    <el-collapse-item title="外边距" name="5" v-if="styleHasProperty('margin') && !pkey">
        <el-form-item style="margin-bottom:15px">
                <el-checkbox v-model="styles.marginlock" @change="marginlockChange">锁定</el-checkbox>
        </el-form-item>
        <el-form label-width="30px" size="mini" inline>
            <el-form-item label="上">
                <el-input-number v-model="styles.margin.top" controls-position="right" :min="0" @change="updateMargin"></el-input-number>
            </el-form-item>
            <el-form-item label="下">
                <el-input-number v-model="styles.margin.bottom" controls-position="right" :min="0" @change="wrapSizeChange" :disabled="styles.marginlock"></el-input-number>
            </el-form-item>
            <el-form-item label="左">
                <el-input-number v-model="styles.margin.left" controls-position="right" :min="0" :max="375" @change="wrapSizeChange" :disabled="styles.marginlock"></el-input-number>
            </el-form-item>
            <el-form-item label="右">
                <el-input-number v-model="styles.margin.right" controls-position="right" :min="0" :max="375" @change="wrapSizeChange" :disabled="styles.marginlock"></el-input-number>
            </el-form-item>
        </el-form>
    </el-collapse-item>
    <el-collapse-item title="边框与圆角" name="6" v-if="styleHasProperty('border')">
        <el-form label-width="60px" size="mini" inline>
            <el-form-item style="margin-bottom:15px">
                <el-checkbox v-model="styles.borderlock" @change="borderlockChange">锁定</el-checkbox>
            </el-form-item>
            <el-form-item label="上边框">
                <div class="borderstylebox d-flex flex-a-i-c">
                    <el-input-number style="margin-right:5px" v-model="styles.border.top.width" controls-position="right" :min="0" @change="(cur, old) => updateBorderProp('width',cur, old)"></el-input-number>
                    <el-color-picker style="margin-right:5px" v-model="styles.border.top.color" show-alpha  @change="(cur, old) => updateBorderProp('color', cur, old)"></el-color-picker>
                    <el-select v-model="styles.border.top.style" placeholder="请选择" @change="(cur, old) => updateBorderProp('style',cur, old)">
                        <el-option v-for="(btype,index) in $styleconfig.bordertypes" :key="index" :label="btype.label" :value="btype.val"></el-option>
                    </el-select>
                </div>
            </el-form-item>
            <el-form-item label="下边框">
                <div class="borderstylebox d-flex flex-a-i-c">
                    <el-input-number style="margin-right:5px" v-model="styles.border.bottom.width" controls-position="right" :min="0" :disabled="styles.borderlock"></el-input-number>
                    <el-color-picker style="margin-right:5px" v-model="styles.border.bottom.color" show-alpha :disabled="styles.borderlock"></el-color-picker>
                    <el-select v-model="styles.border.bottom.style" placeholder="请选择" :disabled="styles.borderlock">
                        <el-option v-for="(btype,index) in $styleconfig.bordertypes" :key="index" :label="btype.label" :value="btype.val"></el-option>
                    </el-select>
                </div>
            </el-form-item>
            <el-form-item label="左边框">
                <div class="borderstylebox d-flex flex-a-i-c">
                    <el-input-number style="margin-right:5px" v-model="styles.border.left.width" controls-position="right" :min="0" :disabled="styles.borderlock"></el-input-number>
                    <el-color-picker style="margin-right:5px" v-model="styles.border.left.color" show-alpha :disabled="styles.borderlock"></el-color-picker>
                    <el-select v-model="styles.border.left.style" placeholder="请选择" :disabled="styles.borderlock">
                        <el-option v-for="(btype,index) in $styleconfig.bordertypes" :key="index" :label="btype.label" :value="btype.val"></el-option>
                    </el-select>
                </div>
            </el-form-item>
            <el-form-item label="右边框">
                <div class="borderstylebox d-flex flex-a-i-c">
                    <el-input-number style="margin-right:5px" v-model="styles.border.right.width" controls-position="right" :min="0" :disabled="styles.borderlock"></el-input-number>
                    <el-color-picker style="margin-right:5px" v-model="styles.border.right.color" show-alpha :disabled="styles.borderlock"></el-color-picker>
                    <el-select v-model="styles.border.right.style" placeholder="请选择" :disabled="styles.borderlock">
                        <el-option v-for="(btype,index) in $styleconfig.bordertypes" :key="index" :label="btype.label" :value="btype.val"></el-option>
                    </el-select>
                </div>
            </el-form-item>
        </el-form>
    
        <el-form label-width="70px" size="mini" inline>
            <el-form-item style="margin-bottom:15px">
                <el-checkbox v-model="styles.radiuslock" @change="radiuslockChange">锁定</el-checkbox>
            </el-form-item>
            <div>
                <el-form-item label="上左圆角">
                    <el-input-number v-model="styles.border.top.leftRadius" controls-position="right" :min="0" @change="updateBorderRadius"></el-input-number>
                </el-form-item>
                <el-form-item label="上右圆角">
                    <el-input-number v-model="styles.border.top.rightRadius" controls-position="right" :min="0" :disabled="styles.radiuslock"></el-input-number>
                </el-form-item>
                <el-form-item label="下左圆角">
                    <el-input-number v-model="styles.border.bottom.leftRadius" controls-position="right" :min="0" :disabled="styles.radiuslock"></el-input-number>
                </el-form-item>
                <el-form-item label="下右圆角">
                    <el-input-number v-model="styles.border.bottom.rightRadius" controls-position="right" :min="0" :disabled="styles.radiuslock"></el-input-number>
                </el-form-item>
            </div>
        </el-form>
    </el-collapse-item>
    <el-collapse-item title="阴影" name="7" v-if="styleHasProperty('box')">
        <el-form label-width="50px" size="mini">
            <el-form-item label="颜色">
                <el-color-picker v-model="styles.box.shadow.color" show-alpha></el-color-picker>
            </el-form-item>
            <el-form-item label="水平" class="el-form-item-slider">
                <el-slider v-model="styles.box.shadow.hShadow" :min="-100" :max="100" show-input input-size="mini"></el-slider>
            </el-form-item>
            <el-form-item label="垂直" class="el-form-item-slider">
                <el-slider v-model="styles.box.shadow.vShadow" :min="-100" :max="100" show-input input-size="mini"></el-slider>
            </el-form-item>
            <el-form-item label="模糊" class="el-form-item-slider">
                <el-slider v-model="styles.box.shadow.blur" :min="0" :max="100" show-input input-size="mini"></el-slider>
            </el-form-item>
            <el-form-item label="大小" class="el-form-item-slider">
                <el-slider v-model="styles.box.shadow.spread" :min="0" :max="100" show-input input-size="mini"></el-slider>
            </el-form-item>
        </el-form>
    </el-collapse-item>
    <el-collapse-item title="其他" name="8" v-if="styleHasProperty('opacity')">
        <el-form label-width="70px" size="mini">
            <el-form-item label="透明度" v-if="styleHasProperty('opacity')" class="el-form-item-slider">
                <el-slider v-model="styles.opacity" :min="0.1" :max="1" :step="0.1" show-input input-size="mini"></el-slider>
            </el-form-item>
            <el-form-item label="旋转度" v-if="styleHasProperty('transrotate')" class="el-form-item-slider">
                <el-slider v-model="styles.transrotate" :min="0" :max="360":step="1" show-input input-size="mini"></el-slider>
            </el-form-item>
        </el-form>
    </el-collapse-item>
</el-collapse></el-form>`,
    props: {
        styles: Object,
        texttype: {
            type: String,
            default: '',
        },
        pkey: {
            type: String,
            default: '',
        }
    },
    data() {
        return {
            activecolls: ['1', '2', '3', '4', '5', '6', '7', '8'],
        }
    },
    methods: {
        wrapSizeChange(newval, oldval) {
            this.$nextTick(() => {
                window.dispatchEvent(new Event('resize'));
            })
        },
        borderlockChange(islock) {
            if (islock) {
                let { width, color, style } = this.styles.border.top;
                this.updateBorderProp('width', width);
                this.updateBorderProp('color', color);
                this.updateBorderProp('style', style);
            }
        },
        updateBorderProp(property, cur, old) {
            if (this.styles.borderlock) {
                this.styles.border.bottom[property] = this.styles.border.left[property] = this.styles.border.right[property] = cur;
            }
        },
        radiuslockChange(islock) {
            if (islock) {
                this.updateBorderRadius(this.styles.border.top.leftRadius);
            }
        },
        updateBorderRadius(cur, old) {
            if (this.styles.radiuslock) {
                this.styles.border.top.rightRadius = this.styles.border.bottom.leftRadius = this.styles.border.bottom.rightRadius = cur;
            }
        },
        paddinglockChange(islock) {
            if (islock) {
                this.updatePadding(this.styles.padding.top);
            }
        },
        updatePadding(cur, old) {
            if (this.styles.paddinglock) {
                this.styles.padding.bottom = this.styles.padding.left = this.styles.padding.right = cur;
            }
            this.wrapSizeChange();
        },
        marginlockChange(islock) {
            if (islock) {
                this.updateMargin(this.styles.margin.top);
            }
        },
        updateMargin(cur, old) {
            if (this.styles.marginlock) {
                this.styles.margin.bottom = this.styles.margin.left = this.styles.margin.right = cur;
            }
            this.wrapSizeChange();
        }
    },
});

Vue.component('animationstyle', {
    template: `<el-collapse v-model="activecolls">
    <el-collapse-item title="属性" name="1" disabled>
        <el-form label-width="70px" size="mini">
            <el-form-item label="动画效果">
                <el-select v-model="styles.animation.name" clearable placeholder="请选择动画效果" >
                    <el-option-group v-for="list in $styleconfig.animatelists" :key="list.label" :label="list.label">
                        <el-option v-for="item in list.lists" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-option-group>
                </el-select>
                <el-button type="primary" icon="el-icon-caret-right" :disabled="styles.animation.name == '' " @click="playAni">播放动画</el-button>
            </el-form-item>
            <el-form-item label="动画时间" class="el-form-item-slider">
                <el-slider v-model="styles.animation.duration" :min="0" :max="10":step="0.1" show-input input-size="mini"></el-slider>
            </el-form-item>
            <el-form-item label="动画延迟" class="el-form-item-slider">
                <el-slider v-model="styles.animation.delay" :min="0" :max="10":step="0.1" show-input input-size="mini"></el-slider>
            </el-form-item>
            <el-form-item label="循环播放" class="el-form-item-slider">
                <el-switch v-model="styles.animation.iteration.count" :inactive-value="1" active-value="infinite"></el-switch>
            </el-form-item>
        </el-form>
    </el-collapse-item>
</el-collapse>`,
    props: {
        styles: Object
    },
    data() {
        return {
            activecolls: ['1'],
        }
    },
    methods: {
        playAni() {
            let aniname = this.styles.animation.name || '';
            if (!aniname) return;
            this.styles.animation.name = '';
            setTimeout(() => {
                this.styles.animation.name = aniname;
            })
        }
    }
});

Vue.component('pagesetstyle', {
    template: `<el-tabs type="border-card" stretch>
    <el-tab-pane label="页面设置">
        <el-form label-width="70px" size="mini">
        <el-collapse v-model="activeItems">
            <el-collapse-item title="基础设置" name="1">
                <el-form-item label="页面名称" prop="name">
                    <el-input v-model="datas.name" placeholder="请输入页面名称" maxlength="100" show-word-limit />
                </el-form-item>
                <el-form-item label="页面标题">
                    <el-input v-model="datas.title" placeholder="请输入页面标题" maxlength="100" show-word-limit />
                </el-form-item>
                <div class="background-image-box" style="margin-bottom:15px">
                    <el-row>
                        <el-col :span="4" class="background-position">
                            <div class="pos-grid d-flex flex-w-w">
                                <div class="d-flex flex-j-c-c flex-a-i-c" v-for="(item,index) in $styleconfig.background.positions" :key="index" :class="{actived:(item.val == datas.background.position)}" @click.stop="datas.background.position = item.val"><i :class="item.icon"></i></div>
                            </div>
                        </el-col>
                        <el-col :span="20">
                            <el-form label-width="50px" size="mini">
                                <el-form-item label="图片" style="margin-bottom:10px">
                                    <mibo-input-attachment v-model="datas.background.image"></mibo-input-attachment>
                                </el-form-item>
                                <el-form-item label="填充" style="margin-bottom:0">
                                    <div class="d-flex flex-a-i-c">
                                        <el-color-picker v-model="datas.background.color" show-alpha style="margin-right:5px"></el-color-picker>
                                        <el-select v-model="datas.background.mode" placeholder="请选择填充模式" style="width:120px;margin-right:5px">
                                            <el-option v-for="(bmode,index) in $styleconfig.background.modes" :key="index" :label="bmode.label" :value="bmode.val"></el-option>
                                        </el-select>
                                        <el-select v-model="datas.background.attachment" placeholder="请选择固定模式">
                                            <el-option v-for="(battach,index) in $styleconfig.background.attachments" :key="index" :label="battach.label" :value="battach.val"></el-option>
                                        </el-select>
                                    </div>
                                </el-form-item>
                            </el-form>
                        </el-col>
                    </el-row>
                </div>
                <el-form-item label="微信分享">
                    <el-switch v-model="datas.shareDetail.open" active-value="1" inactive-value="2"></el-switch>
                </el-form-item>
                <div v-show="datas.shareDetail.open == '1'">
                    <el-form-item label="分享标题">
                        <el-input v-model="datas.shareDetail.title" placeholder="请输入分享标题" maxlength="25" show-word-limit />
                    </el-form-item>
                    <el-form-item label="分享图标">
                        <mibo-uploadbox v-model="datas.shareDetail.icon" hasdelete></mibo-uploadbox>
                    </el-form-item>
                    <el-form-item label="分享简介">
                        <el-input type="textarea" v-model="datas.shareDetail.desc"></el-input>
                    </el-form-item>
                </div>
                <el-form-item label="访问限制">
                    <el-radio v-model="datas.browsertype" label="1">仅限微信</el-radio>
                    <el-radio v-model="datas.browsertype" label="2">所有浏览器均可</el-radio>
                    <el-popover
                        placement="top-start"
                        title="温馨提醒"
                        width="200"
                        trigger="hover"
                        content="如果页面内使用了用户信息或签到信息相关的变量建议选择仅限微信">
                        <template #reference>
                            <el-button type="text" icon="el-icon-warning-outline" style="position: absolute;top: 0px;right: 100px;"></el-button>
                        </template>
                    </el-popover>
                </el-form-item>
                <el-form-item label="微信跳过登录" label-width="100px" >
                    <el-switch v-model="datas.wxskiplogin" active-value="1" inactive-value="2"></el-switch>
                    <el-popover
                        placement="top-start"
                        title="温馨提醒"
                        width="200"
                        trigger="hover"
                        content="开启则通过微信访问当前页面会自动跳过微信登录与签到功能直接进入页面，如果页面内使用了用户微信相关信息或签到相关信息建议关闭此开关">
                        <template #reference>
                            <el-button type="text" icon="el-icon-warning-outline" style="margin-left:10px"></el-button>
                        </template>
                    </el-popover>
                </el-form-item>
            </el-collapse-item>
        </el-collapse>
        </el-form>
    </el-tab-pane>
    </el-tabs>`,
    props: {
        datas: Object,
    },
    data() {
        return {
            activeItems: ['1'],
        }
    },
});

Vue.component('layoutsetstyle', {
    template: `<el-tabs type="border-card" stretch class="layoutset">
    <el-tab-pane label="组件管理器">
        <el-alert title="列表内的组件可通过鼠标拖动排序，容器内的子组件可拖至其他容器" type="warning" show-icon style="font-size:12px;line-height:1"></el-alert>
        <el-divider></el-divider>
        <vdp v-model="components" group="fitem" animation="100" direction="vertical" target=".layout-components" draggable=".layout-item" @update="onDragupdate">
            <div class="layout-components">
                <ul v-for="(item,index) in components" :key="item.key" :class="['layout-item',{active: (activeKey === item.key)}]">
                    <li class="layout-title" @click="onClickComponent(item)">
                        <div><i v-if="item.content.widgets" class="arrow-icon" :class="'el-icon-arrow-'+ (isOpened(item.key) ? 'down':'right')" @click.stop="toggleOpened(item)"></i>{{item.title}}</div>
                        <div class="layout-item-btns" @click.stop="">
                            <i class="el-icon-edit" @click="onClickComponent(item,'edit')"></i>
                            <i class="el-icon-sort"></i>
                            <el-popconfirm title="删除将无法恢复，您确定删除吗？" @confirm="onWidgetdelete(index)">
                                <template #reference>
                                    <i class="el-icon-delete"></i>
                                </template>
                            </el-popconfirm>
                        </div>
                    </li>
                    <vdp 
                    v-if="item.content.widgets && isOpened(item.key)" 
                    tag="ul"  
                    class="layout-sitem" 
                    v-model="item.content.widgets"
                    :group="{
                        name: 'sitem',
                        pull: true,
                        put: ['sitem'],
                    }"
                    :pkey="item.key"
                    animation="100" direction="vertical"  
                    draggable=".layout-sitem-li" 
                    @add="onWidgetadd"
                    >
                        <li v-for="(sitem,sindex) in item.content.widgets" :key="sitem.key" :class="['layout-sitem-li',{active: (activeKey === sitem.key)}]" @click.stop="onClickSonComponent(sitem,sindex)" @mouseenter="mouseInOut(sitem)" @mouseleave="mouseInOut(sitem,'remove')">
                            <div>{{sitem.title}}</div>
                            <div class="layout-item-btns" @click.stop="">
                                <i class="el-icon-edit" @click="onClickSonComponent(sitem,sindex,'edit')"></i>
                                <i class="el-icon-sort"></i>
                                <el-popconfirm title="删除将无法恢复，您确定删除吗？" @confirm="onSonWidgetdelete(sitem.pkey,sindex)">
                                    <template #reference>
                                        <i class="el-icon-delete"></i>
                                    </template>
                                </el-popconfirm>
                            </div>
                        </li>
                    </vdp>
                </ul>
            </div>
        </vdp>
        <el-empty v-if="!components.length":image-size="100" description="您未添加任何组件"></el-empty>
    </el-tab-pane>
    </el-tabs>`,
    inject: ['rootRefs'],
    props: {
        datas: Array,
    },
    data() {
        return {
            components: this.datas,
            localCollkey: 'collapseKeys',
            collapseKeys: [],
        }
    },
    computed: {
        activeKey() {
            let key = '';
            const activeWidget = this.datas.find((item) => {
                return item.actived;
            });
            if (activeWidget) {
                key = activeWidget.key;
                if (activeWidget.content.widgets) {
                    const sonWidget = activeWidget.content.widgets.find((item) => {
                        return item.actived;
                    });
                    if (sonWidget) {
                        key = sonWidget.key;
                    }
                }
            }
            return key;
        }
    },
    mounted() {
        let localCollapsekeys = this.$utils.GetLocalStorage(this.localCollkey) || '';
        if (localCollapsekeys) {
            localCollapsekeys = JSON.parse(localCollapsekeys);
            if (localCollapsekeys && localCollapsekeys.length) {
                let allkeys = this.datas.map((item) => {
                    return item.key;
                });
                localCollapsekeys = this.$utils.getArrsIntersec(localCollapsekeys, allkeys);
                this.$utils.SaveLocalStorage(this.localCollkey, JSON.stringify(localCollapsekeys));
            }
            this.collapseKeys = localCollapsekeys;
        }
    },
    methods: {
        isOpened(key) {
            return this.collapseKeys.indexOf(key) === -1;
        },
        toggleOpened(widget) {
            if (widget.content.widgets) {
                const index = this.collapseKeys.findIndex(item => {
                    return item === widget.key;
                })
                if (index === -1) {
                    this.collapseKeys.push(widget.key)
                } else {
                    this.collapseKeys.splice(index, 1);
                }
                this.$utils.SaveLocalStorage(this.localCollkey, JSON.stringify(this.collapseKeys));
            }
        },
        onClickComponent(item, isedit) {
            this.$emit('click-component', item, isedit);
        },
        onClickSonComponent(item, sindex, isedit) {
            this.mouseInOut(item, 'remove');
            this.$emit('active-son-component', item.pkey, sindex, isedit);
        },
        onWidgetdelete(findex) {
            this.$emit('remove-component', findex);
        },
        onSonWidgetdelete(pkey, sindex) {
            this.$emit('remove-son-component', pkey, sindex)
        },
        onDragupdate() {
            this.$emit("update:datas", this.components);
            this.$bus.$emit('ondragStopresetNotice');
        },
        onWidgetadd(event) {
            let { to, newIndex } = event;
            const tokey = to.__vue__.$attrs.pkey
            const fwidget = this.components.find((item) => {
                return item.key === tokey;
            });
            if (fwidget) {
                const swidget = fwidget.content.widgets[newIndex] || '';
                if (swidget) {
                    swidget.pkey = tokey;
                }
            }
        },
        mouseInOut({ pkey, key }, type) {
            const fwidget = this.rootRefs.$refs[pkey] || [];
            if (fwidget.length) {
                const swidget = fwidget[0].$refs[key] || [];
                if (swidget.length) {
                    swidget[0].$el.classList[(type || 'add')]('layout-li-mouse-enter');
                }
            }
        },
        handleDatasChanged(datas) {
            this.components = datas;
        },
    },
    watch: {
        datas: {
            deep: true,
            handler(newdatas) {
                this.handleDatasChanged(newdatas);
            }
        }
    }
});

Vue.component('systpl', {
    template: `<div class="diy-themes" v-loading="loading">
        <el-divider content-position="center">模板列表</el-divider>
        <el-scrollbar>
            <ul v-if="list.length" class="d-flex flex-w-w">
                <li v-for="item in list" :key="item.id" class="d-flex flex-j-c-c flex-a-i-c flex-d-c">
                    <el-popconfirm
                    placement="bottom"
                    width="250"
                    title="使用当前模板会覆盖当前编辑的数据，确定使用所选模板数据吗？"
                    @confirm="changeSysTpl(item.id)"
                    >
                        <template #reference>
                            <div class="theme-item d-flex flex-j-c-c flex-a-i-c flex-d-c">
                                <el-image
                                style="width: 120px;height:233px;border: 1px solid #fbefef;border-radius: 2px;"
                                :src="item.tplimg"
                                fit="scale-down"></el-image>
                                <div class="tplname">{{item.tplname}}</div>
                                <el-tag v-if="tplid == item.id" class="isedit" size="mini">编辑中</el-tag>
                            </div>
                        </template>
                    </el-popconfirm>
                </li>
            </ul>
            <el-empty v-else description="暂无模板"></el-empty>
        </el-scrollbar>
    </div>`,
    props: {
        tplid: {
            type: String,
            default: '',
        }
    },
    data() {
        return {
            loading: false,
            list: []
        };
    },
    methods: {
        init() {
            this.loadlist();
        },
        async loadlist() {
            this.loading = true;
            try {
                let { data, status } = await this.$http.getsystpls();
                if (status != 200) {
                    return this.$message.error(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    return this.$message.error(data.msg || '请求出现异常，请稍后重试');
                }
                this.list = data.msg;
                this.loading = false;
            } catch (error) {
                this.loading = false;
                this.$message.error(`请求出现异常，请稍后重试`);
            }
        },
        async changeSysTpl(tplid) {
            const loading = this.$loading({
                lock: true,
                text: '模板内容初始化中',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.5)'
            });
            try {
                let { data, status } = await this.$http.getonesystpl({ tplid: tplid });
                if (status != 200) {
                    return this.$message.error(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    return this.$message.error(data.msg || '请求出现异常，请稍后重试');
                }
                loading.close();
                this.$emit('change-sys-tpl', data.msg);
            } catch (error) {
                loading.close();
                this.$message.error(`请求出现异常，请稍后重试`);
            }

        }
    }
});

Vue.component('diypage', {
    template: `<div class="diy-hdpages" v-loading="loading">
        <div class="diy-hdpages-header d-flex flex-d-c flex-j-c-c flex-a-i-c">
            <el-button size="medium" type="primary" icon="el-icon-plus" @click="showCreatebox">创建新页面</el-button>
            <el-divider content-position="center">页面列表</el-divider>
        </div>
        <el-scrollbar class="diy-hdpages-wrapper">
            <el-row v-for="item in list" :key="item.id" class="page-one">
                <el-popconfirm
                placement="bottom"
                width="200"
                title="当前页面数据是否保存了？"
                confirm-button-text='确定切换'
                @confirm="changePageOne(item.id)"
                >
                    <template #reference>
                        <el-button size="small" :class="{selected: item.id == pageid}">
                            <span>{{item.title}}</span>
                            <i class="el-icon-queding_queren"></i>
                        </el-button>
                        <el-popconfirm
                        v-if="showdelBtn(item.id)"
                        icon="el-icon-info"
                        title="删除将无法恢复，确定要删除当前页面吗？"
                        @confirm="deletePage(item.id)"
                        >
                            <template #reference>
                                <i class="el-icon-close btn-delete"></i>
                            </template>
                        </el-popconfirm>
                        
                    </template>
                </el-popconfirm>
            </el-row>
        </el-scrollbar>
        <mibo-createpage-dialog :visible="visible" @success-created="successCreated" @hide-createbox="hideCreatebox"></mibo-createpage-dialog>
    </div>`,
    props: {
        pageid: {
            type: String,
            default: '',
        }
    },
    data() {
        return {
            loading: false,
            list: [],
            visible: false,
        };
    },
    methods: {
        init() {
            this.loadlist();
        },
        async loadlist() {
            this.loading = true;
            try {
                let { data, status } = await this.$http.gethdpages({ hdid: XCV3Config.hdid });
                if (status != 200) {
                    return this.$message.error(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    return this.$message.error(data.msg || '请求出现异常，请稍后重试');
                }
                this.list = data.msg;
                this.loading = false;
            } catch (error) {
                this.loading = false;
                this.$message.error(`请求出现异常，请稍后重试`);
            }
        },
        changePageOne(pageid) {
            this.$emit('change-diy-page', pageid);
        },
        showCreatebox() {
            this.visible = true;
        },
        hideCreatebox() {
            this.visible = false;
        },
        successCreated() {
            this.$message.success('创建新页面成功');
            this.loadlist();
            this.hideCreatebox();
        },
        showdelBtn(pageid) {
            return XCV3Config.pageid != pageid;
        },
        async deletePage(pageid) {
            try {
                let { data, status } = await this.$http.delhdpage({ hdid: XCV3Config.hdid, pageid: pageid });
                if (status != 200) {
                    return this.$message.error(`请求出现异常，请稍后重试`);
                }
                if (data.code != 0) {
                    return this.$message.error(data.msg || '请求出现异常，请稍后重试');
                }
                this.init();
                this.$message.success('删除成功');
            } catch (error) {
                this.$message.error(`请求出现异常，请稍后重试`);
            }
        }
    }
});
