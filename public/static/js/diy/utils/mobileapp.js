class mobileapp {
    getLocalHost(withProtocol) {
        let host = '';
        if (withProtocol) {
            host += window.location.protocol + '//';
        }
        host += window.location.host;
        return host;
    }
    wxShare(params) {
        let self = this;
        if (XCV3Config.clienttype !== '1' || XCV3Config.isiframe) return;
        wx.ready(function () {
            if (params && params.open === '1') {
                if (params.icon) {
                    if (!params.icon.startsWith('http')) {
                        params.icon = XCV3Config.amconfig.host + params.icon;
                        if (!params.icon.startsWith('http')) {
                            params.icon = self.getLocalHost(true) + params.icon;
                        }
                    }
                }
                wx.hideMenuItems({
                    menuList: [
                        'menuItem:share:qq',
                        'menuItem:share:weiboApp',
                        'menuItem:share:QZone',
                        'menuItem:share:email',
                        'menuItem:readMode',
                        'menuItem:originPage'
                    ],
                });
                if (params.desc) {
                    params.desc = params.desc.replace(new RegExp("<br/>", "g"), "\r\n");
                }
                wx.updateAppMessageShareData({
                    title: params.title,
                    desc: params.desc || '',
                    link: window.location.href,
                    imgUrl: params.icon
                });
                wx.updateTimelineShareData({
                    title: params.title,
                    link: window.location.href,
                    imgUrl: params.icon
                });
            } else {
                wx.hideOptionMenu();
            }
        });
        wx.error(function (res) {
            console.log(res);
        });
    }
    autoPlay(func) {
        if (['1', '2'].indexOf(XCV3Config.clienttype) !== -1) {
            if (XCV3Config.clienttype == '1') {
                if (window.WeixinJSBridge) {
                    window.WeixinJSBridge.invoke(
                        'getNetworkType',
                        {},
                        (res) => {
                            func && func(true);
                        },
                        false,
                    );
                } else {
                    func && func(false);
                }
            } else {
                if (window.DouyinOpenJSBridge) {
                    DouyinOpenJSBridge.bridge.call('music', {}, function (res) {
                        func && func(true);
                    }, function () {
                        func && func(true);
                    });
                } else {
                    func && func(false);
                }
            }
        } else {
            func && func(false);
        }
    }
    douyinInit(func) {
        if (XCV3Config.clienttype !== '2') return false;
        dysdkobj = parent.DouyinOpenJSBridge || DouyinOpenJSBridge;
        dysdkobj.config({
            params: {
                client_key: XCV3Config.douyinjssdk.client_key,
                signature: XCV3Config.douyinjssdk.signature,
                timestamp: XCV3Config.douyinjssdk.timestamp,
                nonce_str: XCV3Config.douyinjssdk.nonce_str,
                url: XCV3Config.douyinjssdk.url,
            }
        });
        dysdkobj.ready(function () {
            func && func()
        });
        dysdkobj.error(function (res) {
            func && func()
        });
    }
}