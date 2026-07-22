define("zamnotice", ["jquery", "jboxnotice"], function ($) {
    var zamnotice = {
        tips: "操作成功",
        showTime: 2000,
        zIndex: 2000,
        type: "success",
        showTips: function (type, tips, showTime, fuc) {
            var fuc = fuc || false;
            var iconclass = type=='success'?"mdi-check":"mdi-window-close";
            var tipsTpl = $('<div  class="zamTipsMessage zam-flex zam-alignItems zamTipsMessage-' + (type ? type : zamnotice.type) + '"><p class="zamTipsMessage-content"><i class="zamTipsMessage-icon zamTipsMessage-icon-' + (type ? type : zamnotice.type) +' mdi '+iconclass +'"></i>' + (tips ? tips : zamnotice.tips) + '</p></div>');
            tipsTpl.css({
                "z-index": (zamnotice.zIndex)
            });
            zamnotice.zIndex++;
            tipsTpl.appendTo("body");
            tipsTpl.addClass("zamTipsMessageHide");
            setTimeout(function () {
                tipsTpl.removeClass("zamTipsMessageHide").addClass("zamTipsMessageShow");
                setTimeout(function () {
                    tipsTpl.removeClass("zamTipsMessageShow").addClass("zamTipsMessageHide");
                    setTimeout(function () {
                        tipsTpl.remove();
                        if (fuc) {
                            fuc()
                        }
                    }, 500)
                }, showTime ? showTime : zamnotice.showTime)
            }, 30)
        },
        showNotice: function (title, content, time, func, icon, iconclass) {
            new jBox("Notice", {
                color: "#fff",
                title: title || "提示",
                content: content || "操作成功",
                showCountdown: true,
                closeButton: true,
                autoClose: time || 3000,
                icontype: icon || "success",
                iconclass: iconclass || "success",
                attributes: {
                    x: "right",
                    y: "top"
                },
                minWidth: 200,
                maxWidth: 300,
                stack: true,
                stackSpacing: 25,
                animation: {
                    open: "slide:top",
                    close: "slide:right"
                },
                onCloseComplete: function () {
                    if (func) {
                        func()
                    }
                }
            })
        }
    };
    return zamnotice
});