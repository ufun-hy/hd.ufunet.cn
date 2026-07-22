define("zswitch", ["jquery"], function ($) {
    var zswitch = {};
    zswitch.themeColor = "rgb(100, 189, 99)";
    zswitch.init = function () {
        var s = "<span class='slider'></span>";
        $("[class^=zswitch]").append(s);
        $("[class^=zswitch]").click(function () {
            if ($(this).hasClass("zswitch-disabled")) {
                return
            }
            if ($(this).hasClass("zswitch-on")) {
                $(this).removeClass("zswitch-on").addClass("zswitch-off");
                $(".zswitch-off").css({
                    "border-color": "#dfdfdf",
                    "box-shadow": "rgb(223, 223, 223) 0px 0px 0px 0px inset",
                    "background-color": "rgb(255, 255, 255)"
                })
            } else {
                $(this).removeClass("zswitch-off").addClass("zswitch-on");
                if (zswitch.themeColor) {
                    var c = zswitch.themeColor;
                    $(this).css({
                        "border-color": c,
                        "box-shadow": c + " 0px 0px 0px 16px inset",
                        "background-color": c
                    })
                }
                if ($(this).attr("themeColor")) {
                    var c2 = $(this).attr("themeColor");
                    $(this).css({
                        "border-color": c2,
                        "box-shadow": c2 + " 0px 0px 0px 16px inset",
                        "background-color": c2
                    })
                }
            }
        });
        if (this.themeColor) {
            var c = this.themeColor;
            $(".zswitch-on").css({
                "border-color": c,
                "box-shadow": c + " 0px 0px 0px 16px inset",
                "background-color": c
            });
            $(".zswitch-off").css({
                "border-color": "#dfdfdf",
                "box-shadow": "rgb(223, 223, 223) 0px 0px 0px 0px inset",
                "background-color": "rgb(255, 255, 255)"
            })
        }
        if ($("[themeColor]").length > 0) {
            $("[themeColor]").each(function () {
                var c = $(this).attr("themeColor") || zswitch.themeColor;
                if ($(this).hasClass("zswitch-on")) {
                    $(this).css({
                        "border-color": c,
                        "box-shadow": c + " 0px 0px 0px 16px inset",
                        "background-color": c
                    })
                } else {
                    $(".zswitch-off").css({
                        "border-color": "#dfdfdf",
                        "box-shadow": "rgb(223, 223, 223) 0px 0px 0px 0px inset",
                        "background-color": "rgb(255, 255, 255)"
                    })
                }
            })
        }
    };
    zswitch.showOn = function (ele) {
        $(ele).removeClass("zswitch-off").addClass("zswitch-on");
        if (zswitch.themeColor) {
            var c = zswitch.themeColor;
            $(ele).css({
                "border-color": c,
                "box-shadow": c + " 0px 0px 0px 16px inset",
                "background-color": c
            })
        }
        if ($(ele).attr("themeColor")) {
            var c2 = $(ele).attr("themeColor");
            $(ele).css({
                "border-color": c2,
                "box-shadow": c2 + " 0px 0px 0px 16px inset",
                "background-color": c2
            })
        }
    };
    zswitch.showOff = function (ele) {
        $(ele).removeClass("zswitch-on").addClass("zswitch-off");
        $(".zswitch-off").css({
            "border-color": "#dfdfdf",
            "box-shadow": "rgb(223, 223, 223) 0px 0px 0px 0px inset",
            "background-color": "rgb(255, 255, 255)"
        })
    };
    zswitch.click = function (ele, on, off) {
        $(ele).click(function () {
            if ($(this).hasClass("zswitch-disabled")) {
                return
            }
            if ($(this).hasClass("zswitch-on")) {
                if (typeof on == "function") {
                    on(this)
                }
            } else {
                if (typeof off == "function") {
                    off(this)
                }
            }
        })
    };
    $(function () {
        zswitch.init()
    });
    return zswitch
});