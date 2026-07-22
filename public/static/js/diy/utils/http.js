class HttpRequest {
    constructor(baseUrl = '/') {
        this.baseUrl = baseUrl;
        this.queue = {};
    }

    getInsideConfig() {
        const config = {
            baseURL: this.baseUrl,
            headers: {},
        };
        return config;
    }

    destroy(url) {
        delete this.queue[url];
    }

    interceptors(instance, url) {
        // 请求拦截
        instance.interceptors.request.use(
            config => {
                this.queue[url] = true;
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );
        // 响应拦截
        instance.interceptors.response.use(
            response => {
                this.destroy(url);
                const { data, status } = response;
                return { data, status };
            },
            error => {
                this.destroy(url);
                let { message } = error;
                if (message == "Network Error") {
                    message = "后端接口连接异常";
                }
                // 处理response错误
                return Promise.reject({ message, status: 0 });
            }
        );
    }

    request(options) {
        const instance = axios.create();
        options = { ...this.getInsideConfig(), ...options };
        this.interceptors(instance, options.url);
        return instance(options);
    }

    getdiyconfig(data) {
        let fromtype = data.fromtype || 'hd';
        return this.request({
            url: (fromtype === 'hd' ? '/hdmanage/configmicrosite/loaddiydata' : '/web/hdconfig/loaddiydata'),
            method: 'post',
            data: data,
        });
    }
    savediyconfig(data) {
        let fromtype = data.fromtype || 'hd';
        return this.request({
            url: (fromtype === 'hd' ? '/hdmanage/configmicrosite/savediydata' : '/web/hdconfig/savediydata'),
            method: 'post',
            data: data,
        });
    }
    createnewpage(data) {
        return this.request({
            url: '/hdmanage/configmicrosite/createnewpage',
            method: 'post',
            data: data,
        });
    }
    getsystpls() {
        return this.request({
            url: '/common/basic/getsystpls',
            method: 'get',
        });
    }
    getonesystpl(data) {
        return this.request({
            url: '/common/basic/getonesystpl',
            method: 'post',
            data: data,
        });
    }
    saveonesystplimg(data) {
        let fromtype = data.fromtype || 'hd';
        return this.request({
            url: (fromtype === 'hd' ? '/hdmanage/configmicrosite/savepreviewimg' : '/common/attachment/saveonesystplimg'),
            method: 'post',
            data: data,
        });
    }
    gethdpages(data) {
        return this.request({
            url: '/hdmanage/configmicrosite/getdiypages',
            method: 'post',
            data: data,
        });
    }
    delhdpage(data) {
        return this.request({
            url: '/hdmanage/configmicrosite/del',
            method: 'post',
            data: data,
        });
    }
    gethdmodules(data) {
        let fromtype = data.fromtype || 'hd';
        return this.request({
            url: (fromtype === 'hd' ? '/hdmanage/common/gethdmodulesandpages' : '/common/basic/gethdmodules'),
            method: 'post',
            data: data,
        });
    }
    getVarsConfig(data) {
        let fromtype = data.fromtype || 'hd';
        return this.request({
            url: (fromtype === 'hd' ? '/hdmanage/common/gethdvars' : '/common/basic/gethdvars'),
            method: 'post',
            data: data,
        });
    }
    getattachmentcates(data) {
        return this.request({
            url: 'common/attachment/ajaxcate',
            method: 'post',
            data: data,
        });
    }

    getattachmentlist(data) {
        return this.request({
            url: 'common/attachment/ajaxuploadlist',
            method: 'post',
            data: data,
        });
    }

    delattachment(data) {
        return this.request({
            url: 'common/attachment/deluploadfile',
            method: 'post',
            data: data,
        });
    }

    getuploadtoken(data) {
        return this.request({
            url: 'common/sts/getsts',
            method: 'post',
            data: data,
        });
    }

    uploadfiletolocal(data) {
        return this.request({
            url: '/common/attachment/upload',
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: data.data,
            onUploadProgress: data.progress,
        });
    }

    directuploadsavefile(data) {
        return this.request({
            url: `/common/attachment/savestsfile`,
            method: 'post',
            data: data,
        });
    }

    directuploadsavesnapshotfile(data) {
        return this.request({
            url: `/common/attachment/snapshotstsfile`,
            method: 'post',
            data: data,
        });
    }

    getAppdiyconfig(data) {
        return this.request({
            url: '/wechat/microsite/getpagedata',
            method: 'post',
            data: data,
        });
    }
}