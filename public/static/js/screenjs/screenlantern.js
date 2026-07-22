define('screenlantern', ['screensocket', 'screencore', 'template', 'layerBox', 'fulldm', 'danmuku'], function (screensocket, screencore, template, layerBox, fulldm, Danmuku) {
    var screenlantern = {
        config: {
            loop: '2',
            loadhis: '1',
            hiscount: '0',
            miji: '2',
            speed: '2',
        },
        lanternManager: null,
        lanterntpl: null,
        oldLanterns: [],
        newLanterns: [],
        deletedLanternIds: [],
        intervalId: null,
        init: function (configall) {
            var self = this, configall = configall || {};
            let { top, center, bottom, lanterns, ...config } = configall;
            self.config = Object.assign(self.config, config);
            var params = {};
            params.onmessage = function (data) {
                if (data.type == 'connected') {
                    screensocket.isclose = false;
                    screencore.connectsocket({ clientid: data.clientid });
                } else if (data.type == 'newlantern') {
                    self.addLanterns(data.messages);
                } else if (data.type == 'dellantern') {
                    self.delLanterns(data.msgids);
                } else if (data.type == 'resetlantern') {
                    self.resetAllLantern();
                } else if (data.type == 'screendm') {
                    var messages = data.messages;
                    if (messages) {
                        if ($.isArray(messages) && messages.length) {
                            $.each(messages, function (i, val) {
                                if (val.type == '1') {
                                    fulldm.addBullet(val);
                                }
                            });
                        }
                    } else {
                        fulldm.addBullet(data);
                    }
                } else if (data.type == 'screendeldm') {
                    if (!$.isArray(data.msgid)) {
                        fulldm.delBullet(data.msgid);
                    } else {
                        $.each(data.msgid, function (index, val) {
                            fulldm.delBullet(val);
                        });
                    }
                } else if (data.type == 'screenresetdm') {
                    fulldm.resetBullet();
                }
            };
            screensocket.init(params);
            self.bindEvent();
            self.loadHistoryLanterns();
            if (showjoinnum === '1') {
                self.loadjoinnum();
            }
        },
        bindEvent: function () {
            var self = this;
            self.lanterntpl = template('lantern-tpl');
            self.lanternManager = Danmuku.create({
                container: $('.lantern-mainbox')[0],
                width: 150,
                confusion: self.config.confusion,
                rowGap: 1,
                direction: 'bottom',
                times: self.rollSpeed(),
                limit: 200,
                interval: (self.config.miji === '1' ? 2 : 0.8),
                capacity: 1000,
                hooks: {
                    barrageCreate(barrage, node) {
                        var data = barrage.data;
                        if (!data.hasOwnProperty('scale')) {
                            data.scale = (0.1 + Math.random() * 0.8).toFixed(2);
                        }
                        $(node).html(self.lanterntpl(data)).addClass('lantern-box');
                    },
                    barrageDestroy(barrage) {
                        if (self.config.loop === '1') {
                            self.appendOneLantern(barrage.data);
                        }
                    }
                }
            });
            self.lanternManager.start();
            $(window).resize(function () {
                self.lanternManager.resize();
            });
            self.loopSend();
            $(document).on('webkitvisibilitychange mozvisibilitychange visibilitychange', function () {
                if (document.hidden) {
                    clearInterval(self.intervalId);
                    self.intervalId = null;
                } else {
                    if (!self.intervalId) {
                        self.loopSend();
                    }
                }
            });
        },
        rollSpeed: function () {
            var speed = this.config.speed;
            return speed == '1' ? [20, 28] : (speed == '2' ? [12, 18] : [4, 6]);
        },
        loopSend: function () {
            var self = this;
            self.intervalId = setInterval(() => {
                var oneLantern = '', isnew = '2';
                if (self.newLanterns.length) {
                    isnew = '2';
                    oneLantern = self.newLanterns.shift();
                    if (oneLantern) {
                        oneLantern.scale = 1;
                    }
                }
                if (!oneLantern) {
                    if (self.oldLanterns.length) {
                        oneLantern = self.oldLanterns.shift();
                    }
                }

                if (oneLantern) {
                    if (!self.lanternManager.send(oneLantern)) {
                        self.prependOneLantern(oneLantern, isnew);
                    }
                }
            }, (self.config.miji === '2' ? 0.5 : 1.6) * 1e3);
        },
        prependOneLantern: function (data, isnew) {
            var self = this;
            let dataid = data.id || false;
            if (!dataid) {
                return false;
            }
            if (self.deletedLanternIds.includes(dataid)) {
                return false;
            }
            if (isnew === '1') {
                var index = self.newLanterns.findIndex((item) => {
                    return item.id === data.id
                });
                if (index === -1) {
                    self.newLanterns.unshift(data);
                }
            } else {
                var index = self.oldLanterns.findIndex((item) => {
                    return item.id === data.id
                });
                if (index === -1) {
                    self.oldLanterns.unshift(data);
                }
            }
        },
        appendOneLantern: function (data) {
            var self = this;
            let dataid = data.id || false;
            if (!dataid) {
                return false;
            }
            if (self.deletedLanternIds.includes(dataid)) {
                return false;
            }
            if (data.hasOwnProperty('scale')) {
                delete data.scale;
            }
            self.oldLanterns.push(data);
        },
        addLanterns: function (datas) {
            var self = this;
            if (!$.isArray(datas)) {
                return false;
            }
            if (datas.length) {
                var messages = datas.filter(item => !self.deletedLanternIds.includes(item.id));
                if (messages.length) {
                    self.newLanterns = self.newLanterns.concat(messages);
                }
            }
        },
        delLanterns: function (ids) {
            var self = this;
            if (!$.isArray(ids)) {
                return false;
            }
            if (ids.length) {
                self.deletedLanternIds = self.deletedLanternIds.concat(ids);
                self.oldLanterns = self.oldLanterns.filter(item => !ids.includes(item.id));
                self.newLanterns = self.newLanterns.filter(item => !ids.includes(item.id));
                self.lanternManager.each(one => {
                    if (ids.includes(one.data.id)) {
                        one.destroy();
                    }
                });

            }
        },
        resetAllLantern: function () {
            var self = this;
            self.oldLanterns = [];
            self.newLanterns = [];
            self.deletedLanternIds = [];
            self.lanternManager.clear();
            self.lanternManager.start();
        },
        loadHistoryLanterns: function () {
            var self = this;
            if (self.config.loadhis === '2') {
                return false;
            }
            screencore.ajaxSubmit('/screen/lantern/ajaxhis', {}).then(function (json) {
                if (json.code == 0) {
                    self.oldLanterns = json.msg;
                }
            });
        },
        loadjoinnum() {
            var self = this;
            screencore.ajaxSubmit('/screen/lantern/ajaxjoincount', {}).then(function (json) {
                if (json.code == 0) {
                    $(".joinPeople").html('<span>' + json.msg + '</span>人参与');
                }
                setTimeout(function () {
                    self.loadjoinnum();
                }, 5e3);
            }, function () {
                setTimeout(function () {
                    self.loadjoinnum();
                }, 5e3);
            });
        }
    };
    return screenlantern;
});
