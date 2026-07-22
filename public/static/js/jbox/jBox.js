(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], function (jQuery) {
            return (root.jBox = factory(jQuery))
        })
    } else {
        if (typeof module === "object" && module.exports) {
            module.exports = (root.jBox = factory(require("jquery")))
        } else {
            root.jBox = factory(root.jQuery)
        }
    }
}(this, function (jQuery) {
    var jBox = function jBox(type, options) {
        this.options = {
            id: null,
            icontype: false,
            iconclass: "success",
            width: "auto",
            height: "auto",
            minWidth: null,
            minHeight: null,
            maxWidth: null,
            maxHeight: null,
            responsiveWidth: true,
            responsiveHeight: true,
            responsiveMinWidth: 100,
            responsiveMinHeight: 100,
            attach: null,
            trigger: "click",
            preventDefault: false,
            content: null,
            getContent: null,
            title: null,
            getTitle: null,
            footer: null,
            isolateScroll: true,
            ajax: {
                url: null,
                data: "",
                reload: false,
                getURL: "data-url",
                getData: "data-ajax",
                setContent: true,
                spinner: true,
                spinnerDelay: 300,
                spinnerReposition: true
            },
            target: null,
            position: {
                x: "center",
                y: "center"
            },
            outside: null,
            offset: 0,
            attributes: {
                x: "left",
                y: "top"
            },
            fixed: false,
            adjustPosition: true,
            adjustTracker: false,
            adjustDistance: 5,
            reposition: true,
            repositionOnOpen: true,
            repositionOnContent: true,
            pointer: false,
            pointTo: "target",
            fade: 180,
            animation: null,
            theme: "Default",
            addClass: null,
            overlay: false,
            zIndex: 10000,
            delayOpen: 0,
            delayClose: 0,
            closeOnEsc: false,
            closeOnClick: false,
            closeOnMouseleave: false,
            closeButton: false,
            appendTo: jQuery("body"),
            createOnInit: false,
            blockScroll: false,
            draggable: false,
            dragOver: true,
            autoClose: false,
            delayOnHover: false,
            showCountdown: false,
            preloadAudio: true,
            audio: null,
            volume: 100,
            onInit: null,
            onAttach: null,
            onPosition: null,
            onCreated: null,
            onOpen: null,
            onClose: null,
            onCloseComplete: null
        };
        this._pluginOptions = {
            "Tooltip": {
                getContent: "title",
                trigger: "mouseenter",
                position: {
                    x: "center",
                    y: "top"
                },
                outside: "y",
                pointer: true
            },
            "Mouse": {
                responsiveWidth: false,
                responsiveHeight: false,
                adjustPosition: "flip",
                target: "mouse",
                trigger: "mouseenter",
                position: {
                    x: "right",
                    y: "bottom"
                },
                outside: "xy",
                offset: 5
            },
            "Modal": {
                target: jQuery(window),
                fixed: true,
                blockScroll: true,
                closeOnEsc: true,
                closeOnClick: "overlay",
                closeButton: true,
                overlay: true,
                animation: "zoomIn"
            },
        };
        this.options = jQuery.extend(true, this.options, this._pluginOptions[type] ? this._pluginOptions[type] : jBox._pluginOptions[type], options);
        jQuery.type(type) == "string" && (this.type = type);
        this._fireEvent = function (event, pass) {
            this.options["_" + event] && (this.options["_" + event].bind(this))(pass);
            this.options[event] && (this.options[event].bind(this))(pass)
        };
        this.options.id === null && (this.options.id = "jBox" + jBox._getUniqueID());
        this.id = this.options.id;
        ((this.options.position.x == "center" && this.options.outside == "x") || (this.options.position.y == "center" && this.options.outside == "y")) && (this.options.outside = null);
        this.options.pointTo == "target" && (!this.options.outside || this.options.outside == "xy") && (this.options.pointer = false);
        jQuery.type(this.options.offset) != "object" ? (this.options.offset = {
            x: this.options.offset,
            y: this.options.offset
        }) : (this.options.offset = jQuery.extend({
            x: 0,
            y: 0
        }, this.options.offset));
        jQuery.type(this.options.adjustDistance) != "object" ? (this.options.adjustDistance = {
            top: this.options.adjustDistance,
            right: this.options.adjustDistance,
            bottom: this.options.adjustDistance,
            left: this.options.adjustDistance
        }) : (this.options.adjustDistance = jQuery.extend({
            top: 5,
            left: 5,
            right: 5,
            bottom: 5
        }, this.options.adjustDistance));
        this.outside = this.options.outside && this.options.outside != "xy" ? this.options.position[this.options.outside] : false;
        this.align = this.outside ? this.outside : (this.options.position.y != "center" && jQuery.type(this.options.position.y) != "number" ? this.options.position.x : (this.options.position.x != "center" && jQuery.type(this.options.position.x) != "number" ? this.options.position.y : this.options.attributes.x));
        this._getOpp = function (opp) {
            return {
                left: "right",
                right: "left",
                top: "bottom",
                bottom: "top",
                x: "y",
                y: "x"
            }[opp]
        };
        this._getXY = function (xy) {
            return {
                left: "x",
                right: "x",
                top: "y",
                bottom: "y",
                center: "x"
            }[xy]
        };
        this._getTL = function (tl) {
            return {
                left: "left",
                right: "left",
                top: "top",
                bottom: "top",
                center: "left",
                x: "left",
                y: "top"
            }[tl]
        };
        this._getInt = function (value, dimension) {
            if (value == "auto") {
                return "auto"
            }
            if (value && jQuery.type(value) == "string" && value.slice(-1) == "%") {
                return jQuery(window)[dimension == "height" ? "innerHeight" : "innerWidth"]() * parseInt(value.replace("%", "")) / 100
            }
            return value
        };
        this._createSVG = function (type, options) {
            var svg = document.createElementNS("http://www.w3.org/2000/svg", type);
            jQuery.each(options, function (index, item) {
                svg.setAttribute(item[0], (item[1] || ""))
            });
            return svg
        };
        this._isolateScroll = function (el) {
            if (!el || !el.length) {
                return
            }
            el.on("DOMMouseScroll.jBoxIsolateScroll mousewheel.jBoxIsolateScroll", function (ev) {
                var delta = ev.wheelDelta || (ev.originalEvent && ev.originalEvent.wheelDelta) || -ev.detail;
                var overflowBottom = this.scrollTop + el.outerHeight() - this.scrollHeight >= 0;
                var overflowTop = this.scrollTop <= 0;
                ((delta < 0 && overflowBottom) || (delta > 0 && overflowTop)) && ev.preventDefault()
            })
        };
        this._setTitleWidth = function () {
            if (!this.titleContainer || (this.content[0].style.width == "auto" && !this.content[0].style.maxWidth)) {
                return null
            }
            if (this.wrapper.css("display") == "none") {
                this.wrapper.css("display", "block");
                var contentWidth = this.content.outerWidth();
                this.wrapper.css("display", "none")
            } else {
                var contentWidth = this.content.outerWidth()
            }
            this.titleContainer.css({
                maxWidth: (Math.max(contentWidth, parseInt(this.content[0].style.maxWidth)) || null)
            })
        };
        this._draggable = function () {
            if (!this.options.draggable) {
                return false
            }
            var handle = this.options.draggable == "title" ? this.titleContainer : (this.options.draggable instanceof jQuery ? this.options.draggable : (jQuery.type(this.options.draggable) == "string" ? jQuery(this.options.draggable) : this.wrapper));
            if (!handle || !(handle instanceof jQuery) || !handle.length || handle.data("jBox-draggable")) {
                return false
            }
            handle.addClass("jBox-draggable").data("jBox-draggable", true).on("mousedown", function (ev) {
                if (ev.button == 2 || jQuery(ev.target).hasClass("jBox-noDrag") || jQuery(ev.target).parents(".jBox-noDrag").length) {
                    return
                }
                if (this.options.dragOver && this.wrapper.css("zIndex") <= jBox.zIndexMax) {
                    jBox.zIndexMax += 1;
                    this.wrapper.css("zIndex", jBox.zIndexMax)
                }
                var drg_h = this.wrapper.outerHeight();
                var drg_w = this.wrapper.outerWidth();
                var pos_y = this.wrapper.offset().top + drg_h - ev.pageY;
                var pos_x = this.wrapper.offset().left + drg_w - ev.pageX;
                jQuery(document).on("mousemove.jBox-draggable-" + this.id, function (ev) {
                    this.wrapper.offset({
                        top: ev.pageY + pos_y - drg_h,
                        left: ev.pageX + pos_x - drg_w
                    })
                }.bind(this));
                ev.preventDefault()
            }.bind(this)).on("mouseup", function () {
                jQuery(document).off("mousemove.jBox-draggable-" + this.id)
            }.bind(this));
            jBox.zIndexMax = !jBox.zIndexMax ? this.options.zIndex : Math.max(jBox.zIndexMax, this.options.zIndex);
            return this
        };
        this._create = function () {
            if (this.wrapper) {
                return
            }
            this.wrapper = jQuery("<div/>", {
                id: this.id,
                "class": "jBox-wrapper" + (this.type ? " jBox-" + this.type : "") + (this.options.theme ? " jBox-" + this.options.theme : "") + (this.options.addClass ? " " + this.options.addClass : "")
            }).css({
                position: (this.options.fixed ? "fixed" : "absolute"),
                display: "none",
                opacity: 0,
                zIndex: this.options.zIndex
            }).data("jBox", this);
            this.options.closeOnMouseleave && this.wrapper.on("mouseleave", function (ev) {
                !this.source || !(ev.relatedTarget == this.source[0] || jQuery.inArray(this.source[0], jQuery(ev.relatedTarget).parents("*")) !== -1) && this.close()
            }.bind(this));
            (this.options.closeOnClick == "box") && this.wrapper.on("touchend click", function () {
                this.close({
                    ignoreDelay: true
                })
            }.bind(this));
            this.container = jQuery('<div class="jBox-container"/>').appendTo(this.wrapper);
            this.content = jQuery('<div class="jBox-content"/>').appendTo(this.container);
            this.options.footer && (this.footer = jQuery('<div class="jBox-footer"/>').append(this.options.footer).appendTo(this.container));
            this.options.isolateScroll && this._isolateScroll(this.content);
            if (this.options.closeButton) {
                var closeButtonSVG = this._createSVG("svg", [
                    ["viewBox", "0 0 24 24"]
                ]);
                closeButtonSVG.appendChild(this._createSVG("path", [
                    ["d", "M22.2,4c0,0,0.5,0.6,0,1.1l-6.8,6.8l6.9,6.9c0.5,0.5,0,1.1,0,1.1L20,22.3c0,0-0.6,0.5-1.1,0L12,15.4l-6.9,6.9c-0.5,0.5-1.1,0-1.1,0L1.7,20c0,0-0.5-0.6,0-1.1L8.6,12L1.7,5.1C1.2,4.6,1.7,4,1.7,4L4,1.7c0,0,0.6-0.5,1.1,0L12,8.5l6.8-6.8c0.5-0.5,1.1,0,1.1,0L22.2,4z"]
                ]));
                this.closeButton = jQuery('<div class="jBox-closeButton jBox-noDrag"/>').on("touchend click", function (ev) {
                    this.close({
                        ignoreDelay: true
                    })
                }.bind(this)).append(closeButtonSVG);
                if (this.options.closeButton == "box" || (this.options.closeButton === true && !this.options.overlay && !this.options.title && !this.options.getTitle)) {
                    this.wrapper.addClass("jBox-closeButton-box");
                    this.closeButton.appendTo(this.container)
                }
            }
            this.wrapper.appendTo(this.options.appendTo);
            this.wrapper.find(".jBox-closeButton").length && jQuery.each(["top", "right", "bottom", "left"], function (index, pos) {
                this.wrapper.find(".jBox-closeButton").css(pos) && this.wrapper.find(".jBox-closeButton").css(pos) != "auto" && (this.options.adjustDistance[pos] = Math.max(this.options.adjustDistance[pos], this.options.adjustDistance[pos] + (((parseInt(this.wrapper.find(".jBox-closeButton").css(pos)) || 0) + (parseInt(this.container.css("border-" + pos + "-width")) || 0)) * -1)))
            }.bind(this));
            if (this.options.pointer) {
                this.pointer = {
                    position: (this.options.pointTo != "target") ? this.options.pointTo : this._getOpp(this.outside),
                    xy: (this.options.pointTo != "target") ? this._getXY(this.options.pointTo) : this._getXY(this.outside),
                    align: "center",
                    offset: 0
                };
                this.pointer.element = jQuery('<div class="jBox-pointer jBox-pointer-' + this.pointer.position + '"/>').appendTo(this.wrapper);
                this.pointer.dimensions = {
                    x: this.pointer.element.outerWidth(),
                    y: this.pointer.element.outerHeight()
                };
                if (jQuery.type(this.options.pointer) == "string") {
                    var split = this.options.pointer.split(":");
                    split[0] && (this.pointer.align = split[0]);
                    split[1] && (this.pointer.offset = parseInt(split[1]))
                }
                this.pointer.alignAttribute = (this.pointer.xy == "x" ? (this.pointer.align == "bottom" ? "bottom" : "top") : (this.pointer.align == "right" ? "right" : "left"));
                this.wrapper.css("padding-" + this.pointer.position, this.pointer.dimensions[this.pointer.xy]);
                this.pointer.element.css(this.pointer.alignAttribute, (this.pointer.align == "center" ? "50%" : 0)).css("margin-" + this.pointer.alignAttribute, this.pointer.offset);
                this.pointer.margin = {};
                this.pointer.margin["margin-" + this.pointer.alignAttribute] = this.pointer.offset;
                (this.pointer.align == "center") && this.pointer.element.css("transform", "translate(" + (this.pointer.xy == "y" ? (this.pointer.dimensions.x * -0.5 + "px") : 0) + ", " + (this.pointer.xy == "x" ? (this.pointer.dimensions.y * -0.5 + "px") : 0) + ")");
                this.pointer.element.css((this.pointer.xy == "x" ? "width" : "height"), parseInt(this.pointer.dimensions[this.pointer.xy]) + parseInt(this.container.css("border-" + this.pointer.alignAttribute + "-width")));
                this.wrapper.addClass("jBox-pointerPosition-" + this.pointer.position)
            }
            this.setContent(this.options.content, true);
            this.setTitle(this.options.title, true);
            this.options.draggable && this._draggable();
            this._fireEvent("onCreated")
        };
        this.options.createOnInit && this._create();
        this.options.attach && this.attach();
        this._attachEvents = function () {
            this.options.closeOnEsc && jQuery(document).on("keyup.jBox-" + this.id, function (ev) {
                if (ev.keyCode == 27) {
                    this.close({
                        ignoreDelay: true
                    })
                }
            }.bind(this));
            if (this.options.closeOnClick === true || this.options.closeOnClick == "body") {
                jQuery(document).on("touchend.jBox-" + this.id + " click.jBox-" + this.id, function (ev) {
                    if (this.blockBodyClick || (this.options.closeOnClick == "body" && (ev.target == this.wrapper[0] || this.wrapper.has(ev.target).length))) {
                        return
                    }
                    this.close({
                        ignoreDelay: true
                    })
                }.bind(this))
            }
            this.options.delayOnHover && jQuery("#" + this.id).on("mouseenter", function (ev) {
                this.isHovered = true
            }.bind(this));
            this.options.delayOnHover && jQuery("#" + this.id).on("mouseleave", function (ev) {
                this.isHovered = false
            }.bind(this));
            if ((this.options.adjustPosition || this.options.reposition) && !this.fixed && this.outside) {
                this.options.adjustTracker && jQuery(window).on("scroll.jBox-" + this.id, function (ev) {
                    this.position()
                }.bind(this));
                (this.options.adjustPosition || this.options.reposition) && jQuery(window).on("resize.jBox-" + this.id, function (ev) {
                    this.position()
                }.bind(this))
            }
            this.options.target == "mouse" && jQuery("body").on("mousemove.jBox-" + this.id, function (ev) {
                this.position({
                    mouseTarget: {
                        top: ev.pageY,
                        left: ev.pageX
                    }
                })
            }.bind(this))
        };
        this._detachEvents = function () {
            this.options.closeOnEsc && jQuery(document).off("keyup.jBox-" + this.id);
            (this.options.closeOnClick === true || this.options.closeOnClick == "body") && jQuery(document).off("touchend.jBox-" + this.id + " click.jBox-" + this.id);
            this.options.adjustTracker && jQuery(window).off("scroll.jBox-" + this.id);
            (this.options.adjustPosition || this.options.reposition) && jQuery(window).off("resize.jBox-" + this.id);
            this.options.target == "mouse" && jQuery("body").off("mousemove.jBox-" + this.id)
        };
        this._showOverlay = function () {
            if (!this.overlay) {
                this.overlay = jQuery('<div id="' + this.id + '-overlay"/>').addClass("jBox-overlay" + (this.type ? " jBox-overlay-" + this.type : "")).css({
                    display: "none",
                    opacity: 0,
                    zIndex: this.options.zIndex - 1
                }).appendTo(this.options.appendTo);
                (this.options.closeButton == "overlay" || this.options.closeButton === true) && this.overlay.append(this.closeButton);
                this.options.closeOnClick == "overlay" && this.overlay.on("touchend click", function () {
                    this.close({
                        ignoreDelay: true
                    })
                }.bind(this));
                jQuery("#" + this.id + "-overlay .jBox-closeButton").length && (this.options.adjustDistance.top = Math.max(jQuery("#" + this.id + "-overlay .jBox-closeButton").outerHeight(), this.options.adjustDistance.top))
            }
            if (this.overlay.css("display") == "block") {
                return
            }
            this.options.fade ? (this.overlay.stop() && this.overlay.animate({
                opacity: 1
            }, {
                queue: false,
                duration: this.options.fade,
                start: function () {
                    this.overlay.css({
                        display: "block"
                    })
                }.bind(this)
            })) : this.overlay.css({
                display: "block",
                opacity: 1
            })
        };
        this._hideOverlay = function () {
            if (!this.overlay) {
                return
            }
            this.options.fade ? (this.overlay.stop() && this.overlay.animate({
                opacity: 0
            }, {
                queue: false,
                duration: this.options.fade,
                complete: function () {
                    this.overlay.css({
                        display: "none"
                    })
                }.bind(this)
            })) : this.overlay.css({
                display: "none",
                opacity: 0
            })
        };
        this._exposeDimensions = function () {
            this.wrapper.css({
                top: -10000,
                left: -10000,
                right: "auto",
                bottom: "auto"
            });
            var jBoxDimensions = {
                x: this.wrapper.outerWidth(),
                y: this.wrapper.outerHeight()
            };
            this.wrapper.css({
                top: "auto",
                left: "auto"
            });
            return jBoxDimensions
        };
        this._generateAnimationCSS = function () {
            (jQuery.type(this.options.animation) != "object") && (this.options.animation = {
                pulse: {
                    open: "pulse",
                    close: "zoomOut"
                },
                zoomIn: {
                    open: "zoomIn",
                    close: "zoomIn"
                },
                zoomOut: {
                    open: "zoomOut",
                    close: "zoomOut"
                },
                move: {
                    open: "move",
                    close: "move"
                },
                slide: {
                    open: "slide",
                    close: "slide"
                },
                flip: {
                    open: "flip",
                    close: "flip"
                },
                tada: {
                    open: "tada",
                    close: "zoomOut"
                }
            }[this.options.animation]);
            if (!this.options.animation) {
                return null
            }
            this.options.animation.open && (this.options.animation.open = this.options.animation.open.split(":"));
            this.options.animation.close && (this.options.animation.close = this.options.animation.close.split(":"));
            this.options.animation.openDirection = this.options.animation.open[1] ? this.options.animation.open[1] : null;
            this.options.animation.closeDirection = this.options.animation.close[1] ? this.options.animation.close[1] : null;
            this.options.animation.open && (this.options.animation.open = this.options.animation.open[0]);
            this.options.animation.close && (this.options.animation.close = this.options.animation.close[0]);
            this.options.animation.open && (this.options.animation.open += "Open");
            this.options.animation.close && (this.options.animation.close += "Close");
            var animations = {
                pulse: {
                    duration: 350,
                    css: [
                        ["0%", "scale(1)"],
                        ["50%", "scale(1.1)"],
                        ["100%", "scale(1)"]
                    ]
                },
                zoomInOpen: {
                    duration: (this.options.fade || 180),
                    css: [
                        ["0%", "scale(0.9)"],
                        ["100%", "scale(1)"]
                    ]
                },
                zoomInClose: {
                    duration: (this.options.fade || 180),
                    css: [
                        ["0%", "scale(1)"],
                        ["100%", "scale(0.9)"]
                    ]
                },
                zoomOutOpen: {
                    duration: (this.options.fade || 180),
                    css: [
                        ["0%", "scale(1.1)"],
                        ["100%", "scale(1)"]
                    ]
                },
                zoomOutClose: {
                    duration: (this.options.fade || 180),
                    css: [
                        ["0%", "scale(1)"],
                        ["100%", "scale(1.1)"]
                    ]
                },
                moveOpen: {
                    duration: (this.options.fade || 180),
                    positions: {
                        top: {
                            "0%": -12
                        },
                        right: {
                            "0%": 12
                        },
                        bottom: {
                            "0%": 12
                        },
                        left: {
                            "0%": -12
                        }
                    },
                    css: [
                        ["0%", "translate%XY(%Vpx)"],
                        ["100%", "translate%XY(0px)"]
                    ]
                },
                moveClose: {
                    duration: (this.options.fade || 180),
                    timing: "ease-in",
                    positions: {
                        top: {
                            "100%": -12
                        },
                        right: {
                            "100%": 12
                        },
                        bottom: {
                            "100%": 12
                        },
                        left: {
                            "100%": -12
                        }
                    },
                    css: [
                        ["0%", "translate%XY(0px)"],
                        ["100%", "translate%XY(%Vpx)"]
                    ]
                },
                slideOpen: {
                    duration: 400,
                    positions: {
                        top: {
                            "0%": -400
                        },
                        right: {
                            "0%": 400
                        },
                        bottom: {
                            "0%": 400
                        },
                        left: {
                            "0%": -400
                        }
                    },
                    css: [
                        ["0%", "translate%XY(%Vpx)"],
                        ["100%", "translate%XY(0px)"]
                    ]
                },
                slideClose: {
                    duration: 400,
                    timing: "ease-in",
                    positions: {
                        top: {
                            "100%": -400
                        },
                        right: {
                            "100%": 400
                        },
                        bottom: {
                            "100%": 400
                        },
                        left: {
                            "100%": -400
                        }
                    },
                    css: [
                        ["0%", "translate%XY(0px)"],
                        ["100%", "translate%XY(%Vpx)"]
                    ]
                },
                flipOpen: {
                    duration: 600,
                    css: [
                        ["0%", "perspective(400px) rotateX(90deg)"],
                        ["40%", "perspective(400px) rotateX(-15deg)"],
                        ["70%", "perspective(400px) rotateX(15deg)"],
                        ["100%", "perspective(400px) rotateX(0deg)"]
                    ]
                },
                flipClose: {
                    duration: (this.options.fade || 300),
                    css: [
                        ["0%", "perspective(400px) rotateX(0deg)"],
                        ["100%", "perspective(400px) rotateX(90deg)"]
                    ]
                },
                tada: {
                    duration: 800,
                    css: [
                        ["0%", "scale(1)"],
                        ["10%, 20%", "scale(0.9) rotate(-3deg)"],
                        ["30%, 50%, 70%, 90%", "scale(1.1) rotate(3deg)"],
                        ["40%, 60%, 80%", "scale(1.1) rotate(-3deg)"],
                        ["100%", "scale(1) rotate(0)"]
                    ]
                }
            };
            jQuery.each(["pulse", "tada"], function (index, item) {
                animations[item + "Open"] = animations[item + "Close"] = animations[item]
            });
            var generateKeyframeCSS = function (ev, position) {
                keyframe_css = "@keyframes jBox-" + this.id + "-animation-" + this.options.animation[ev] + "-" + ev + (position ? "-" + position : "") + " {";
                jQuery.each(animations[this.options.animation[ev]].css, function (index, item) {
                    var translate = position ? item[1].replace("%XY", this._getXY(position).toUpperCase()) : item[1];
                    animations[this.options.animation[ev]].positions && (translate = translate.replace("%V", animations[this.options.animation[ev]].positions[position][item[0]]));
                    keyframe_css += item[0] + " {transform:" + translate + ";}"
                }.bind(this));
                keyframe_css += "}";
                keyframe_css += ".jBox-" + this.id + "-animation-" + this.options.animation[ev] + "-" + ev + (position ? "-" + position : "") + " {";
                keyframe_css += "animation-duration: " + animations[this.options.animation[ev]].duration + "ms;";
                keyframe_css += "animation-name: jBox-" + this.id + "-animation-" + this.options.animation[ev] + "-" + ev + (position ? "-" + position : "") + ";";
                keyframe_css += animations[this.options.animation[ev]].timing ? ("animation-timing-function: " + animations[this.options.animation[ev]].timing + ";") : "";
                keyframe_css += "}";
                return keyframe_css
            }.bind(this);
            this._animationCSS = "";
            jQuery.each(["open", "close"], function (index, ev) {
                if (!this.options.animation[ev] || !animations[this.options.animation[ev]] || (ev == "close" && !this.options.fade)) {
                    return ""
                }
                animations[this.options.animation[ev]].positions ? jQuery.each(["top", "right", "bottom", "left"], function (index2, position) {
                    this._animationCSS += generateKeyframeCSS(ev, position)
                }.bind(this)) : this._animationCSS += generateKeyframeCSS(ev)
            }.bind(this))
        };
        this.options.animation && this._generateAnimationCSS();
        this._blockBodyClick = function () {
            this.blockBodyClick = true;
            setTimeout(function () {
                this.blockBodyClick = false
            }.bind(this), 10)
        };
        this._animate = function (ev) {
            !ev && (ev = this.isOpen ? "open" : "close");
            if (!this.options.fade && ev == "close") {
                return null
            }
            var animationDirection = (this.options.animation[ev + "Direction"] || ((this.align != "center") ? this.align : this.options.attributes.x));
            this.flipped && this._getXY(animationDirection) == (this._getXY(this.align)) && (animationDirection = this._getOpp(animationDirection));
            var classnames = "jBox-" + this.id + "-animation-" + this.options.animation[ev] + "-" + ev + " jBox-" + this.id + "-animation-" + this.options.animation[ev] + "-" + ev + "-" + animationDirection;
            this.wrapper.addClass(classnames);
            var animationDuration = parseFloat(this.wrapper.css("animation-duration")) * 1000;
            ev == "close" && (animationDuration = Math.min(animationDuration, this.options.fade));
            setTimeout(function () {
                this.wrapper.removeClass(classnames)
            }.bind(this), animationDuration)
        };
        this._abortAnimation = function () {
            var classes = this.wrapper.attr("class").split(" ").filter(function (c) {
                return c.lastIndexOf("jBox-" + this.id + "-animation", 0) !== 0
            }.bind(this));
            this.wrapper.attr("class", classes.join(" "))
        };
        if (this.options.responsiveWidth || this.options.responsiveHeight) {
            jQuery(window).on("resize.responsivejBox-" + this.id, function (ev) {
                if (this.isOpen) {
                    this.position()
                }
            }.bind(this))
        }
        jQuery.type(this.options.preloadAudio) === "string" && (this.options.preloadAudio = [this.options.preloadAudio]);
        jQuery.type(this.options.audio) === "string" && (this.options.audio = {
            open: this.options.audio
        });
        jQuery.type(this.options.volume) === "number" && (this.options.volume = {
            open: this.options.volume,
            close: this.options.volume
        });
        if (this.options.preloadAudio === true && this.options.audio) {
            this.options.preloadAudio = [];
            jQuery.each(this.options.audio, function (index, url) {
                this.options.preloadAudio.push(url + ".mp3");
                this.options.preloadAudio.push(url + ".ogg")
            }.bind(this))
        }
        this.options.preloadAudio.length && jQuery.each(this.options.preloadAudio, function (index, url) {
            var audio = new Audio();
            audio.src = url;
            audio.preload = "auto"
        });
        this._fireEvent("onInit");
        return this
    };
    jBox.prototype.attach = function (elements, trigger) {
        !elements && (elements = this.options.attach);
        jQuery.type(elements) == "string" && (elements = jQuery(elements));
        !trigger && (trigger = this.options.trigger);
        elements && elements.length && jQuery.each(elements, function (index, el) {
            el = jQuery(el);
            if (!el.data("jBox-attached-" + this.id)) {
                (this.options.getContent == "title" && el.attr("title") != undefined) && el.data("jBox-getContent", el.attr("title")).removeAttr("title");
                this.attachedElements || (this.attachedElements = []);
                this.attachedElements.push(el[0]);
                el.on(trigger + ".jBox-attach-" + this.id, function (ev) {
                    this.timer && clearTimeout(this.timer);
                    if (trigger == "mouseenter" && this.isOpen && this.source[0] == el[0]) {
                        return
                    }
                    if (this.isOpen && this.source && this.source[0] != el[0]) {
                        var forceOpen = true
                    }
                    this.source = el;
                    !this.options.target && (this.target = el);
                    trigger == "click" && this.options.preventDefault && ev.preventDefault();
                    this[trigger == "click" && !forceOpen ? "toggle" : "open"]()
                }.bind(this));
                (this.options.trigger == "mouseenter") && el.on("mouseleave", function (ev) {
                    if (!this.wrapper) {
                        return null
                    }
                    if (!this.options.closeOnMouseleave || !(ev.relatedTarget == this.wrapper[0] || jQuery(ev.relatedTarget).parents("#" + this.id).length)) {
                        this.close()
                    }
                }.bind(this));
                el.data("jBox-attached-" + this.id, trigger);
                this._fireEvent("onAttach", el)
            }
        }.bind(this));
        return this
    };
    jBox.prototype.detach = function (elements) {
        !elements && (elements = this.attachedElements || []);
        elements && elements.length && jQuery.each(elements, function (index, el) {
            el = jQuery(el);
            if (el.data("jBox-attached-" + this.id)) {
                el.off(el.data("jBox-attached-" + this.id) + ".jBox-attach-" + this.id);
                el.data("jBox-attached-" + this.id, null)
            }
            this.attachedElements = jQuery.grep(this.attachedElements, function (value) {
                return value != el[0]
            })
        }.bind(this));
        return this
    };
    jBox.prototype.setTitle = function (title, ignore_positioning) {
        if (title == null || title == undefined) {
            return this
        }!this.wrapper && this._create();
        var wrapperHeight = this.wrapper.outerHeight();
        var wrapperWidth = this.wrapper.outerWidth();
        if (!this.title) {
            this.titleContainer = jQuery('<div class="jBox-title"/>');
            this.title = jQuery("<div/>").appendTo(this.titleContainer);
            this.wrapper.addClass("jBox-hasTitle");
            if (this.options.closeButton == "title" || (this.options.closeButton === true && !this.options.overlay)) {
                this.wrapper.addClass("jBox-closeButton-title");
                this.closeButton.appendTo(this.titleContainer)
            }
            if (this.options.icontype) {
				var icontype = (this.options.icontype=='success'?'mdi mdi-check-circle':(this.options.icontype=='error'?'mdi mdi-close-circle':'mdi mdi-alert-circle'));
				jQuery('<i class="jbox-tipicon ' + icontype + ' text-'+this.options.iconclass+'"></i>').appendTo(this.titleContainer)
            }
            this.titleContainer.insertBefore(this.content);
            this._setTitleWidth()
        }
        this.title.html("<span class='jBox-title-txt'>" + title + "</span>");
        wrapperWidth != this.wrapper.outerWidth() && this._setTitleWidth();
        this.options.draggable && this._draggable();
        !ignore_positioning && this.options.repositionOnContent && (wrapperHeight != this.wrapper.outerHeight() || wrapperWidth != this.wrapper.outerWidth()) && this.position();
        return this
    };
    jBox.prototype.setContent = function (content, ignore_positioning) {
        if (content == null || content == undefined) {
            return this
        }!this.wrapper && this._create();
        var wrapperHeight = this.wrapper.outerHeight();
        var wrapperWidth = this.wrapper.outerWidth();
        this.content.children("[data-jbox-content-appended]").appendTo("body").css({
            display: "none"
        });
        switch (jQuery.type(content)) {
        case "string":
            this.content.html(content);
            break;
        case "object":
            this.content.html("");
            content.attr("data-jbox-content-appended", 1).appendTo(this.content).css({
                display: "block"
            });
            break
        }
        wrapperWidth != this.wrapper.outerWidth() && this._setTitleWidth();
        this.options.draggable && this._draggable();
        !ignore_positioning && this.options.repositionOnContent && (wrapperHeight != this.wrapper.outerHeight() || wrapperWidth != this.wrapper.outerWidth()) && this.position();
        return this
    };
    jBox.prototype.setDimensions = function (type, value, pos) {
        !this.wrapper && this._create();
        value == undefined && (value = "auto");
        this.content.css(type, this._getInt(value));
        type == "width" && this._setTitleWidth();
        (pos == undefined || pos) && this.position()
    };
    jBox.prototype.setWidth = function (value, pos) {
        this.setDimensions("width", value, pos)
    };
    jBox.prototype.setHeight = function (value, pos) {
        this.setDimensions("height", value, pos)
    };
    jBox.prototype.position = function (options) {
        !options && (options = {});
        options = jQuery.extend(true, this.options, options);
        this.target = options.target || this.target || jQuery(window);
        !(this.target instanceof jQuery || this.target == "mouse") && (this.target = jQuery(this.target));
        if (!this.target.length) {
            return this
        }
        this.content.css({
            width: this._getInt(options.width, "width"),
            height: this._getInt(options.height, "height"),
            minWidth: this._getInt(options.minWidth, "width"),
            minHeight: this._getInt(options.minHeight, "height"),
            maxWidth: this._getInt(options.maxWidth, "width"),
            maxHeight: this._getInt(options.maxHeight, "height"),
        });
        this._setTitleWidth();
        var jBoxDimensions = this._exposeDimensions();
        this.target != "mouse" && !this.target.data("jBox-" + this.id + "-fixed") && this.target.data("jBox-" + this.id + "-fixed", (this.target[0] != jQuery(window)[0] && (this.target.css("position") == "fixed" || this.target.parents().filter(function () {
            return jQuery(this).css("position") == "fixed"
        }).length > 0)) ? "fixed" : "static");
        var windowDimensions = {
            x: jQuery(window).outerWidth(),
            y: jQuery(window).outerHeight(),
            top: (options.fixed && this.target.data("jBox-" + this.id + "-fixed") ? 0 : jQuery(window).scrollTop()),
            left: (options.fixed && this.target.data("jBox-" + this.id + "-fixed") ? 0 : jQuery(window).scrollLeft())
        };
        windowDimensions.bottom = windowDimensions.top + windowDimensions.y;
        windowDimensions.right = windowDimensions.left + windowDimensions.x;
        try {
            var targetOffset = this.target.offset()
        } catch (e) {
            var targetOffset = {
                top: 0,
                left: 0
            }
        }
        if (this.target != "mouse" && this.target.data("jBox-" + this.id + "-fixed") == "fixed" && options.fixed) {
            targetOffset.top = targetOffset.top - jQuery(window).scrollTop();
            targetOffset.left = targetOffset.left - jQuery(window).scrollLeft()
        }
        var targetDimensions = {
            x: this.target == "mouse" ? 12 : this.target.outerWidth(),
            y: this.target == "mouse" ? 20 : this.target.outerHeight(),
            top: this.target == "mouse" && options.mouseTarget ? options.mouseTarget.top : (targetOffset ? targetOffset.top : 0),
            left: this.target == "mouse" && options.mouseTarget ? options.mouseTarget.left : (targetOffset ? targetOffset.left : 0)
        };
        var outside = options.outside && !(options.position.x == "center" && options.position.y == "center");
        var availableSpace = {
            x: windowDimensions.x - options.adjustDistance.left - options.adjustDistance.right,
            y: windowDimensions.y - options.adjustDistance.top - options.adjustDistance.bottom,
            left: !outside ? 0 : (targetDimensions.left - jQuery(window).scrollLeft() - options.adjustDistance.left),
            right: !outside ? 0 : (windowDimensions.x - targetDimensions.left + jQuery(window).scrollLeft() - targetDimensions.x - options.adjustDistance.right),
            top: !outside ? 0 : (targetDimensions.top - jQuery(window).scrollTop() - this.options.adjustDistance.top),
            bottom: !outside ? 0 : (windowDimensions.y - targetDimensions.top + jQuery(window).scrollTop() - targetDimensions.y - options.adjustDistance.bottom),
        };
        var jBoxOutsidePosition = {
            x: (options.outside == "x" || options.outside == "xy") && jQuery.type(options.position.x) != "number" ? options.position.x : null,
            y: (options.outside == "y" || options.outside == "xy") && jQuery.type(options.position.y) != "number" ? options.position.y : null
        };
        var flip = {
            x: false,
            y: false
        };
        (jBoxOutsidePosition.x && jBoxDimensions.x > availableSpace[jBoxOutsidePosition.x] && availableSpace[this._getOpp(jBoxOutsidePosition.x)] > availableSpace[jBoxOutsidePosition.x]) && (jBoxOutsidePosition.x = this._getOpp(jBoxOutsidePosition.x)) && (flip.x = true);
        (jBoxOutsidePosition.y && jBoxDimensions.y > availableSpace[jBoxOutsidePosition.y] && availableSpace[this._getOpp(jBoxOutsidePosition.y)] > availableSpace[jBoxOutsidePosition.y]) && (jBoxOutsidePosition.y = this._getOpp(jBoxOutsidePosition.y)) && (flip.y = true);
        if (options.responsiveWidth || options.responsiveHeight) {
            var adjustResponsiveWidth = function () {
                if (options.responsiveWidth && jBoxDimensions.x > availableSpace[jBoxOutsidePosition.x || "x"]) {
                    var contentWidth = availableSpace[jBoxOutsidePosition.x || "x"] - (this.pointer && outside && options.outside == "x" ? this.pointer.dimensions.x : 0) - parseInt(this.container.css("border-left-width")) - parseInt(this.container.css("border-right-width"));
                    this.content.css({
                        width: contentWidth > this.options.responsiveMinWidth ? contentWidth : null,
                        minWidth: contentWidth < parseInt(this.content.css("minWidth")) ? 0 : null
                    });
                    this._setTitleWidth()
                }
                jBoxDimensions = this._exposeDimensions()
            }.bind(this);
            options.responsiveWidth && adjustResponsiveWidth();
            options.responsiveWidth && !flip.y && (jBoxOutsidePosition.y && jBoxDimensions.y > availableSpace[jBoxOutsidePosition.y] && availableSpace[this._getOpp(jBoxOutsidePosition.y)] > availableSpace[jBoxOutsidePosition.y]) && (jBoxOutsidePosition.y = this._getOpp(jBoxOutsidePosition.y)) && (flip.y = true);
            var adjustResponsiveHeight = function () {
                if (options.responsiveHeight && jBoxDimensions.y > availableSpace[jBoxOutsidePosition.y || "y"]) {
                    var exposeTitleFooterHeight = function () {
                        if (!this.titleContainer && !this.footer) {
                            return 0
                        }
                        if (this.wrapper.css("display") == "none") {
                            this.wrapper.css("display", "block");
                            var height = (this.titleContainer ? this.titleContainer.outerHeight() : 0) + (this.footer ? this.footer.outerHeight() : 0);
                            this.wrapper.css("display", "none")
                        } else {
                            var height = (this.titleContainer ? this.titleContainer.outerHeight() : 0) + (this.footer ? this.footer.outerHeight() : 0)
                        }
                        return height || 0
                    }.bind(this);
                    var contentHeight = availableSpace[jBoxOutsidePosition.y || "y"] - (this.pointer && outside && options.outside == "y" ? this.pointer.dimensions.y : 0) - exposeTitleFooterHeight() - parseInt(this.container.css("border-top-width")) - parseInt(this.container.css("border-bottom-width"));
                    this.content.css({
                        height: contentHeight > this.options.responsiveMinHeight ? contentHeight : null
                    });
                    this._setTitleWidth()
                }
                jBoxDimensions = this._exposeDimensions()
            }.bind(this);
            options.responsiveHeight && adjustResponsiveHeight();
            options.responsiveHeight && !flip.x && (jBoxOutsidePosition.x && jBoxDimensions.x > availableSpace[jBoxOutsidePosition.x] && availableSpace[this._getOpp(jBoxOutsidePosition.x)] > availableSpace[jBoxOutsidePosition.x]) && (jBoxOutsidePosition.x = this._getOpp(jBoxOutsidePosition.x)) && (flip.x = true);
            if (options.adjustPosition && options.adjustPosition != "move") {
                flip.x && adjustResponsiveWidth();
                flip.y && adjustResponsiveHeight()
            }
        }
        var pos = {};
        var setPosition = function (p) {
            if (jQuery.type(options.position[p]) == "number") {
                pos[options.attributes[p]] = options.position[p];
                return
            }
            var a = options.attributes[p] = (p == "x" ? "left" : "top");
            pos[a] = targetDimensions[a];
            if (options.position[p] == "center") {
                pos[a] += Math.ceil((targetDimensions[p] - jBoxDimensions[p]) / 2);
                (this.target != "mouse" && this.target[0] && this.target[0] == jQuery(window)[0]) && (pos[a] += (options.adjustDistance[a] - options.adjustDistance[this._getOpp(a)]) * 0.5);
                return
            }(a != options.position[p]) && (pos[a] += targetDimensions[p] - jBoxDimensions[p]);
            (options.outside == p || options.outside == "xy") && (pos[a] += jBoxDimensions[p] * (a != options.position[p] ? 1 : -1))
        }.bind(this);
        setPosition("x");
        setPosition("y");
        if (this.pointer && options.pointTo == "target" && jQuery.type(options.position.x) != "number" && jQuery.type(options.position.y) != "number") {
            var adjustWrapper = 0;
            switch (this.pointer.align) {
            case "center":
                if (options.position[this._getOpp(options.outside)] != "center") {
                    adjustWrapper += (jBoxDimensions[this._getOpp(options.outside)] / 2)
                }
                break;
            default:
                switch (options.position[this._getOpp(options.outside)]) {
                case "center":
                    adjustWrapper += ((jBoxDimensions[this._getOpp(options.outside)] / 2) - (this.pointer.dimensions[this._getOpp(options.outside)] / 2)) * (this.pointer.align == this._getTL(this.pointer.align) ? 1 : -1);
                    break;
                default:
                    adjustWrapper += (this.pointer.align != options.position[this._getOpp(options.outside)]) ? (this.dimensions[this._getOpp(options.outside)] * (jQuery.inArray(this.pointer.align, ["top", "left"]) !== -1 ? 1 : -1)) + ((this.pointer.dimensions[this._getOpp(options.outside)] / 2) * (jQuery.inArray(this.pointer.align, ["top", "left"]) !== -1 ? -1 : 1)) : (this.pointer.dimensions[this._getOpp(options.outside)] / 2) * (jQuery.inArray(this.pointer.align, ["top", "left"]) !== -1 ? 1 : -1);
                    break
                }
                break
            }
            adjustWrapper *= (options.position[this._getOpp(options.outside)] == this.pointer.alignAttribute ? -1 : 1);
            adjustWrapper += this.pointer.offset * (this.pointer.align == this._getOpp(this._getTL(this.pointer.align)) ? 1 : -1);
            pos[this._getTL(this._getOpp(this.pointer.xy))] += adjustWrapper
        }
        pos[options.attributes.x] += options.offset.x;
        pos[options.attributes.y] += options.offset.y;
        this.wrapper.css(pos);
        if (options.adjustPosition) {
            if (this.positionAdjusted) {
                this.pointer && this.wrapper.css("padding", 0).css("padding-" + this._getOpp(this.outside), this.pointer.dimensions[this._getXY(this.outside)]).removeClass("jBox-pointerPosition-" + this._getOpp(this.pointer.position)).addClass("jBox-pointerPosition-" + this.pointer.position);
                this.pointer && this.pointer.element.attr("class", "jBox-pointer jBox-pointer-" + this._getOpp(this.outside)).css(this.pointer.margin);
                this.positionAdjusted = false;
                this.flipped = false
            }
            var outYT = (windowDimensions.top > pos.top - (options.adjustDistance.top || 0)),
                outXR = (windowDimensions.right < pos.left + jBoxDimensions.x + (options.adjustDistance.right || 0)),
                outYB = (windowDimensions.bottom < pos.top + jBoxDimensions.y + (options.adjustDistance.bottom || 0)),
                outXL = (windowDimensions.left > pos.left - (options.adjustDistance.left || 0)),
                outX = outXL ? "left" : (outXR ? "right" : null),
                outY = outYT ? "top" : (outYB ? "bottom" : null),
                out = outX || outY;
            if (out) {
                    var flipJBox = function (xy) {
                        this.wrapper.css(this._getTL(xy), pos[this._getTL(xy)] + ((jBoxDimensions[this._getXY(xy)] + (options.offset[this._getXY(xy)] * (xy == "top" || xy == "left" ? -2 : 2)) + targetDimensions[this._getXY(xy)]) * (xy == "top" || xy == "left" ? 1 : -1)));
                        this.pointer && this.wrapper.removeClass("jBox-pointerPosition-" + this.pointer.position).addClass("jBox-pointerPosition-" + this._getOpp(this.pointer.position)).css("padding", 0).css("padding-" + xy, this.pointer.dimensions[this._getXY(xy)]);
                        this.pointer && this.pointer.element.attr("class", "jBox-pointer jBox-pointer-" + xy);
                        this.positionAdjusted = true;
                        this.flipped = true
                    }.bind(this);
                    flip.x && flipJBox(this.options.position.x);
                    flip.y && flipJBox(this.options.position.y);
                    var outMove = (this._getXY(this.outside) == "x") ? outY : outX;
                    if (this.pointer && options.pointTo == "target" && options.adjustPosition != "flip" && this._getXY(outMove) == this._getOpp(this._getXY(this.outside))) {
                        if (this.pointer.align == "center") {
                            var spaceAvail = (jBoxDimensions[this._getXY(outMove)] / 2) - (this.pointer.dimensions[this._getOpp(this.pointer.xy)] / 2) - (parseInt(this.pointer.element.css("margin-" + this.pointer.alignAttribute)) * (outMove != this._getTL(outMove) ? -1 : 1))
                        } else {
                            var spaceAvail = (outMove == this.pointer.alignAttribute) ? parseInt(this.pointer.element.css("margin-" + this.pointer.alignAttribute)) : jBoxDimensions[this._getXY(outMove)] - parseInt(this.pointer.element.css("margin-" + this.pointer.alignAttribute)) - this.pointer.dimensions[this._getXY(outMove)]
                        }
                        spaceDiff = (outMove == this._getTL(outMove)) ? windowDimensions[this._getTL(outMove)] - pos[this._getTL(outMove)] + options.adjustDistance[outMove] : (windowDimensions[this._getOpp(this._getTL(outMove))] - pos[this._getTL(outMove)] - options.adjustDistance[outMove] - jBoxDimensions[this._getXY(outMove)]) * -1;
                        if (outMove == this._getOpp(this._getTL(outMove)) && pos[this._getTL(outMove)] - spaceDiff < windowDimensions[this._getTL(outMove)] + options.adjustDistance[this._getTL(outMove)]) {
                            spaceDiff -= windowDimensions[this._getTL(outMove)] + options.adjustDistance[this._getTL(outMove)] - (this.pos[this._getTL(outMove)] - spaceDiff)
                        }
                        spaceDiff = Math.min(spaceDiff, spaceAvail);
                        if (spaceDiff <= spaceAvail && spaceDiff > 0) {
                            this.pointer.element.css("margin-" + this.pointer.alignAttribute, parseInt(this.pointer.element.css("margin-" + this.pointer.alignAttribute)) - (spaceDiff * (outMove != this.pointer.alignAttribute ? -1 : 1)));
                            this.wrapper.css(this._getTL(outMove), pos[this._getTL(outMove)] + (spaceDiff * (outMove != this._getTL(outMove) ? -1 : 1)));
                            this.positionAdjusted = true
                        }
                    }
                }
        }
        this._fireEvent("onPosition");
        return this
    };
    jBox.prototype.open = function (options) {
        !options && (options = {});
        if (this.isDestroyed) {
            return false
        }!this.wrapper && this._create();
        !this._styles && (this._styles = jQuery("<style/>").append(this._animationCSS).appendTo(jQuery("head")));
        this.timer && clearTimeout(this.timer);
        this._blockBodyClick();
        if (this.isDisabled) {
            return this
        }
        var open = function () {
            this.source && this.options.getTitle && (this.source.attr(this.options.getTitle) && this.setTitle(this.source.attr(this.options.getTitle)), true);
            this.source && this.options.getContent && (this.source.data("jBox-getContent") ? this.setContent(this.source.data("jBox-getContent"), true) : (this.source.attr(this.options.getContent) ? this.setContent(this.source.attr(this.options.getContent), true) : (this.options.getContent == "html" ? this.setContent(this.source.html(), true) : null)));
            this._fireEvent("onOpen");
            if ((this.options.ajax && (this.options.ajax.url || (this.source && this.source.attr(this.options.ajax.getURL))) && (!this.ajaxLoaded || this.options.ajax.reload)) || (options.ajax && (options.ajax.url || options.ajax.data))) {
                (this.options.ajax.reload != "strict" && this.source && this.source.data("jBox-ajax-data") && !(options.ajax && (options.ajax.url || options.ajax.data))) ? this.setContent(this.source.data("jBox-ajax-data")) : this.ajax((options.ajax || null), true)
            }(!this.positionedOnOpen || this.options.repositionOnOpen) && this.position(options) && (this.positionedOnOpen = true);
            this.isClosing && this._abortAnimation();
            if (!this.isOpen) {
                this.isOpen = true;
                this.options.autoClose && (this.options.delayClose = this.options.autoClose) && this.close();
                this._attachEvents();
                this.options.blockScroll && jQuery("body").addClass("jBox-blockScroll-" + this.id);
                this.options.overlay && this._showOverlay();
                this.options.animation && !this.isClosing && this._animate("open");
                this.options.audio && this.options.audio.open && this.audio(this.options.audio.open, this.options.volume.open);
                if (this.options.fade) {
                    this.wrapper.stop().animate({
                        opacity: 1
                    }, {
                        queue: false,
                        duration: this.options.fade,
                        start: function () {
                            this.isOpening = true;
                            this.wrapper.css({
                                display: "block"
                            })
                        }.bind(this),
                        always: function () {
                            this.isOpening = false;
                            setTimeout(function () {
                                this.positionOnFadeComplete && this.position() && (this.positionOnFadeComplete = false)
                            }.bind(this), 10)
                        }.bind(this)
                    })
                } else {
                    this.wrapper.css({
                        display: "block",
                        opacity: 1
                    });
                    this.positionOnFadeComplete && this.position() && (this.positionOnFadeComplete = false)
                }
            }
        }.bind(this);
        this.options.delayOpen && !this.isOpen && !this.isClosing && !options.ignoreDelay ? (this.timer = setTimeout(open, this.options.delayOpen)) : open();
        return this
    };
    jBox.prototype.close = function (options) {
        options || (options = {});
        if (this.isDestroyed || this.isClosing) {
            return false
        }
        this.timer && clearTimeout(this.timer);
        this._blockBodyClick();
        if (this.isDisabled) {
            return this
        }
        var close = function () {
            this._fireEvent("onClose");
            if (this.isOpen) {
                this.isOpen = false;
                this._detachEvents();
                this.options.blockScroll && jQuery("body").removeClass("jBox-blockScroll-" + this.id);
                this.options.overlay && this._hideOverlay();
                this.options.animation && !this.isOpening && this._animate("close");
                this.options.audio && this.options.audio.close && this.audio(this.options.audio.close, this.options.volume.close);
                if (this.options.fade) {
                    this.wrapper.stop().animate({
                        opacity: 0
                    }, {
                        queue: false,
                        duration: this.options.fade,
                        start: function () {
                            this.isClosing = true
                        }.bind(this),
                        complete: function () {
                            this.wrapper.css({
                                display: "none"
                            });
                            this._fireEvent("onCloseComplete")
                        }.bind(this),
                        always: function () {
                            this.isClosing = false
                        }.bind(this)
                    })
                } else {
                    this.wrapper.css({
                        display: "none",
                        opacity: 0
                    });
                    this._fireEvent("onCloseComplete")
                }
            }
        }.bind(this);
        if (options.ignoreDelay) {
            close()
        } else {
            if ((this.options.delayOnHover || this.options.showCountdown) && this.options.delayClose > 10) {
                var self = this;
                var remaining = this.options.delayClose;
                var prevFrame = Date.now();
                if (this.options.showCountdown && !this.inner) {
                    var outer = jQuery('<div class="jBox-countdown"></div>');
                    this.inner = jQuery('<div class="jBox-countdown_inner"></div>');
                    outer.prepend(this.inner);
                    jQuery("#" + this.id).append(outer)
                }
                this.countdown = function () {
                    var dateNow = Date.now();
                    if (!self.isHovered) {
                        remaining -= dateNow - prevFrame
                    }
                    prevFrame = dateNow;
                    if (remaining > 0) {
                        if (self.options.showCountdown) {
                            self.inner.css("width", (remaining * 100 / self.options.delayClose) + "%")
                        }
                        window.requestAnimationFrame(self.countdown)
                    } else {
                        close()
                    }
                };
                window.requestAnimationFrame(this.countdown)
            } else {
                this.timer = setTimeout(close, Math.max(this.options.delayClose, 10))
            }
        }
        return this
    };
    jBox.prototype.toggle = function (options) {
        this[this.isOpen ? "close" : "open"](options);
        return this
    };
    jBox.prototype.disable = function () {
        this.isDisabled = true;
        return this
    };
    jBox.prototype.enable = function () {
        this.isDisabled = false;
        return this
    };
    jBox.prototype.hide = function () {
        this.disable();
        this.wrapper && this.wrapper.css({
            display: "none"
        });
        return this
    };
    jBox.prototype.show = function () {
        this.enable();
        this.wrapper && this.wrapper.css({
            display: "block"
        });
        return this
    };
    jBox.prototype.ajax = function (options, opening) {
        options || (options = {});
        jQuery.each([
            ["getData", "data"],
            ["getURL", "url"]
        ], function (index, item) {
            (this.options.ajax[item[0]] && !options[item[1]] && this.source && this.source.attr(this.options.ajax[item[0]]) != undefined) && (options[item[1]] = this.source.attr(this.options.ajax[item[0]]) || "")
        }.bind(this));
        var sysOptions = jQuery.extend(true, {}, this.options.ajax);
        this.ajaxRequest && this.ajaxRequest.abort();
        var beforeSend = options.beforeSend || sysOptions.beforeSend ||
        function () {};
        var complete = options.complete || sysOptions.complete ||
        function () {};
        var success = options.success || sysOptions.success ||
        function () {};
        var error = options.error || sysOptions.error ||
        function () {};
        var userOptions = jQuery.extend(true, sysOptions, options);
        userOptions.beforeSend = function () {
            this.wrapper.addClass("jBox-loading");
            userOptions.spinner && (this.spinnerDelay = setTimeout(function () {
                this.wrapper.addClass("jBox-loading-spinner");
                userOptions.spinnerReposition && (opening ? (this.positionOnFadeComplete = true) : this.position());
                this.spinner = jQuery(userOptions.spinner !== true ? userOptions.spinner : '<div class="jBox-spinner"></div>').appendTo(this.container);
                this.titleContainer && this.spinner.css("position") == "absolute" && this.spinner.css({
                    transform: "translateY(" + (this.titleContainer.outerHeight() * 0.5) + "px)"
                })
            }.bind(this), (this.content.html() == "" ? 0 : (userOptions.spinnerDelay || 0))));
            (beforeSend.bind(this))()
        }.bind(this);
        userOptions.complete = function (response) {
            this.spinnerDelay && clearTimeout(this.spinnerDelay);
            this.wrapper.removeClass("jBox-loading jBox-loading-spinner jBox-loading-spinner-delay");
            this.spinner && this.spinner.length && this.spinner.remove() && userOptions.spinnerReposition && (opening ? (this.positionOnFadeComplete = true) : this.position());
            this.ajaxLoaded = true;
            (complete.bind(this))(response)
        }.bind(this);
        userOptions.success = function (response) {
            userOptions.setContent && this.setContent(response, true) && (opening ? (this.positionOnFadeComplete = true) : this.position());
            userOptions.setContent && this.source && this.source.data("jBox-ajax-data", response);
            (success.bind(this))(response)
        }.bind(this);
        userOptions.error = function (response) {
            (error.bind(this))(response)
        }.bind(this);
        this.ajaxRequest = jQuery.ajax(userOptions);
        return this
    };
    jBox.prototype.audio = function (url, volume) {
        if (!url) {
            return this
        }!jBox._audio && (jBox._audio = {});
        if (!jBox._audio[url]) {
            var audio = jQuery("<audio/>");
            jQuery("<source/>", {
                src: url + ".mp3"
            }).appendTo(audio);
            jQuery("<source/>", {
                src: url + ".ogg"
            }).appendTo(audio);
            jBox._audio[url] = audio[0]
        }
        jBox._audio[url].volume = Math.min(((volume != undefined ? volume : 100) / 100), 1);
        try {
            jBox._audio[url].pause();
            jBox._audio[url].currentTime = 0
        } catch (e) {}
        jBox._audio[url].play();
        return this
    };
    jBox._animationSpeeds = {
        "tada": 1000,
        "tadaSmall": 1000,
        "flash": 500,
        "shake": 400,
        "pulseUp": 250,
        "pulseDown": 250,
        "popIn": 250,
        "popOut": 250,
        "fadeIn": 200,
        "fadeOut": 200,
        "slideUp": 400,
        "slideRight": 400,
        "slideLeft": 400,
        "slideDown": 400
    };
    jBox.prototype.animate = function (animation, options) {
        !options && (options = {});
        !this.animationTimeout && (this.animationTimeout = {});
        !options.element && (options.element = this.wrapper);
        !options.element.data("jBox-animating-id") && options.element.data("jBox-animating-id", jBox._getUniqueElementID());
        if (options.element.data("jBox-animating")) {
            options.element.removeClass(options.element.data("jBox-animating")).data("jBox-animating", null);
            this.animationTimeout[options.element.data("jBox-animating-id")] && clearTimeout(this.animationTimeout[options.element.data("jBox-animating-id")])
        }
        options.element.addClass("jBox-animated-" + animation).data("jBox-animating", "jBox-animated-" + animation);
        this.animationTimeout[options.element.data("jBox-animating-id")] = setTimeout((function () {
            options.element.removeClass(options.element.data("jBox-animating")).data("jBox-animating", null);
            options.complete && options.complete()
        }), jBox._animationSpeeds[animation])
    };
    jBox.prototype.destroy = function () {
        this.detach();
        this.isOpen && this.close({
            ignoreDelay: true
        });
        this.wrapper && this.wrapper.remove();
        this.overlay && this.overlay.remove();
        this._styles && this._styles.remove();
        this.isDestroyed = true;
        return this
    };
    jBox._getUniqueID = (function () {
        var i = 1;
        return function () {
            return i++
        }
    }());
    jBox._getUniqueElementID = (function () {
        var i = 1;
        return function () {
            return i++
        }
    }());
    jBox._pluginOptions = {};
    jBox.plugin = function (type, options) {
        jBox._pluginOptions[type] = options
    };
    jQuery.fn.jBox = function (type, options) {
        !type && (type = {});
        !options && (options = {});
        return new jBox(type, jQuery.extend(options, {
            attach: this
        }))
    };
    return jBox
}));