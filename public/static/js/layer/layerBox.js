define("layerBox", ["jquery", "layer"], function ($, layer) {
    var layerBox = {
        showMsg: function (txt, time) {
            var obj = {};
            if (time) {
                obj.time = time;
            }
            layer.msg(txt, obj);
        },
        showConfirm: function (title, content, btns, fuc, fuc2, closebtn) {
            var fuc = fuc || false;
            var fuc2 = fuc2 || false;
            var closebtn = closebtn || 0;
            return layer.confirm(content, {
                title: title,
                closeBtn: closebtn,
                shade: 0.6,
                anim: 0,
                move: false,
                resize: false,
                btn: btns,
                btnAlign: "c",
                success: function (layero, index) {
                    this.enterEsc = function (event) {
                        if (event.keyCode === 13) {
                            layer.close(index);
                            if (fuc) {
                                fuc()
                            }
                            return false
                        }
                        if (event.keyCode === 27) {
                            layer.close(index);
                            if (fuc2) {
                                fuc2()
                            }
                            return false
                        }
                    };
                    $(document).on("keydown", this.enterEsc)
                },
                end: function () {
                    $(document).off("keydown", this.enterEsc)
                }
            }, function (index) {
                layer.close(index);
                if (fuc) {
                    fuc()
                }
            }, function (index) {
                layer.close(index);
                if (fuc2) {
                    fuc2()
                }
            })
        },
        sendcodeLayer: function (title, content, btns, fuc) {
            var fuc = fuc || false;
            return layer.confirm(content, {
                title: title,
                closeBtn: 1,
                shade: 0.6,
                anim: 0,
                move: false,
                resize: false,
                btn: btns,
                btnAlign: "c",
                zIndex: 4,
                success: function (layero, index) {
                    layero.find('.imgverify img').unbind('click').bind('click', function () {
                        var src = $(this).attr("src"), key = 't=', reg = new RegExp(key + '\\d+'), timestamp = +new Date();
                        if (src.indexOf(key) > -1) {
                            $(this).attr("src", src.replace(reg, key + timestamp));
                        } else {
                            $(this).attr("src", $(this).attr("src") + "?t=" + timestamp);
                        }
                    });
                    layero.find('.imgverify img').trigger('click');
                },
                end: function () {

                }
            }, function (index, layero) {
                if (fuc) {
                    fuc(index, layero)
                }
            })
        },
        showLoading: function (txt) {
            if (txt != "") {
                var layindex = layer.msg(txt, {
                    icon: 16,
                    shade: 0.5,
                    time: 0,
                    resize: false,
                    skin: "zam-layer-loading"
                })
            } else {
                var layindex = layer.load(1);
            }
            return layindex;
        },
        showImgpreview: function (src, area, imgcss) {
            var imgcss = imgcss || false;
            var imgObj = {
                type: 1,
                shade: false,
                title: false,
                move: false,
                resize: false,
                area: area,
            };
            if (imgcss) {
                imgObj.content = "<img src='" + src + "' style=" + imgcss + " />"
            } else {
                imgObj.content = "<img src='" + src + "'  />"
            }
            layer.open(imgObj)
        },
        showTips: function (txt, dom, direction, func) {
            var func = func || false;
            var layindex = layer.tips(txt, dom, {
                tips: direction || 1,
                time: -1,
                success: function (e, a) {
                    func && func(e, a)
                }
            });
            $(dom).data("index", layindex)
        },
        showHtml: function (html, success, cancel) {
            return layer.open({
                type: 1,
                closeBtn: 2,
                shade: false,
                title: false,
                resize: false,
                content: html,
                success: function (e, index) {
                    success && success(e, index)
                },
                cancel: function (index, e) {
                    cancel && cancel(e, index);
                },
            });
        },
        onlyHtml: function (html, skin, shadeclose) {
            var shadeclose = shadeclose || false;
            return layer.open({
                type: 1,
                closeBtn: 0,
                shade: 0.4,
                shadeClose: shadeclose,
                title: false,
                skin: skin || 'layui-layer-rim', //加上边框
                content: html || 'html内容'
            });
        },
        closeLayer: function () {
            layer.closeAll()
        },
        close: function (index) {
            layer.close(index)
        },
    };
    return layerBox
});