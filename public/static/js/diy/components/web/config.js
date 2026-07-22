const configWidgets = {
    "free": {
        "title": '容器组件',
        "lists": {
            'freecontainer': {
                "type": "free",
                "title": "容器",
                "icon": "el-icon-tickets",
                "component": "freecontainer",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "isresizing": false,
                "content": {
                    "styles": {
                        "opacity": 1,
                        "height": 200,
                        "padding": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "margin": {
                            "top": 10,
                            "right": 10,
                            "bottom": 10,
                            "left": 10
                        },
                        "background": {
                            "image": "",
                            "mode": "fill-y",
                            "color": "#ffffff",
                            "attachment": "scroll",
                            "position": "left top"
                        },
                        "animation": {
                            "name": "",
                            "delay": 0.2,
                            "duration": 1,
                            "direction": "normal",
                            "fill": {
                                "mode": "both"
                            },
                            "iteration": {
                                "count": 1
                            },
                            "play": {
                                "state": "running"
                            },
                            "timing": {
                                "function": "ease"
                            }
                        },
                        "border": {
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            }
                        },
                        "box": {
                            "shadow": {
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "color": "rgba(237, 237, 237, 0.1)",
                                "inset": false
                            }
                        },
                        "borderlock": true,
                        "radiuslock": true,
                        "paddinglock": true,
                        "marginlock": true,
                    },
                    "widgets": [],
                }
            },
            "freetext": {
                "type": "free",
                "title": "文本",
                "icon": "el-icon-wenzi",
                "component": "freetext",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "content": {
                    "type": "normal",
                    "text": "输入文字内容",
                    "richtext": "<p style=\"text-align:center;\">输入文字内容</p>",
                    "overflow": "hidden",
                    "lockaspectratio": false,
                    "click": {
                        "cate": "",
                        "type": "",
                        "title": "",
                        "params": {},
                    },
                    "styles": {
                        "width": 140,
                        "height": 40,
                        "opacity": 1,
                        "transrotate": 0,
                        "color": "",
                        "line": {
                            "height": 25
                        },
                        "align": {
                            "items": "flex-start"
                        },
                        "text": {
                            "align": "justify",
                            "decoration": "none"
                        },
                        "font": {
                            "family": "Arail",
                            "size": 14,
                            "weight": "normal",
                            "style": "normal"
                        },
                        "border": {
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            }
                        },
                        "box": {
                            "shadow": {
                                "color": "",
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "inset": false
                            }
                        },
                        "background": {
                            "mode": "fill-x",
                            "color": "",
                            "image": "",
                            "position": "left top",
                            "attachment": "scroll",
                        },
                        "animation": {
                            "name": "",
                            "delay": 0.2,
                            "duration": 1,
                            "direction": "normal",
                            "fill": {
                                "mode": "both"
                            },
                            "iteration": {
                                "count": 1
                            },
                            "play": {
                                "state": "running"
                            },
                            "timing": {
                                "function": "ease"
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                        "paddinglock": true,
                        "marginlock": true,
                    },

                },
            },
            "freeimage": {
                "type": "free",
                "title": "图片",
                "icon": "el-icon-picture",
                "component": "freeimage",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "content": {
                    "src": "/static/images/diy/1.png",
                    "clickpreview": false,
                    "lockaspectratio": true,
                    "mode": 'fill',
                    "click": {
                        "cate": "",
                        "type": "",
                        "title": "",
                        "params": {},
                    },
                    "styles": {
                        "width": 100,
                        "height": 60,
                        "opacity": 1,
                        "transrotate": 0,
                        "border": {
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            }
                        },
                        "box": {
                            "shadow": {
                                "color": "",
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "inset": false
                            }
                        },
                        "background": {
                            "mode": "fill-x",
                            "color": "",
                            "image": "",
                            "position": "left top",
                            "attachment": "scroll",
                        },
                        "animation": {
                            "name": "",
                            "delay": 0.2,
                            "duration": 1,
                            "direction": "normal",
                            "fill": {
                                "mode": "both"
                            },
                            "iteration": {
                                "count": 1
                            },
                            "play": {
                                "state": "running"
                            },
                            "timing": {
                                "function": "ease"
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                    },

                },
            },
            "freeshape": {
                "type": "free",
                "title": "图形",
                "icon": "el-icon-zujian",
                "component": "freeimage",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "content": {
                    "src": "",
                    "clickpreview": false,
                    "lockaspectratio": true,

                    "click": {
                        "cate": "",
                        "type": "",
                        "title": "",
                        "params": {},
                    },
                    "styles": {
                        "width": 80,
                        "height": 80,
                        "opacity": 1,
                        "transrotate": 0,
                        "border": {
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            }
                        },
                        "box": {
                            "shadow": {
                                "color": "",
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "inset": false
                            }
                        },
                        "background": {
                            "mode": "fill-x",
                            "color": "#409EFF",
                            "image": "",
                            "position": "left top",
                            "attachment": "scroll",
                        },
                        "animation": {
                            "name": "",
                            "delay": 0.2,
                            "duration": 1,
                            "direction": "normal",
                            "fill": {
                                "mode": "both"
                            },
                            "iteration": {
                                "count": 1
                            },
                            "play": {
                                "state": "running"
                            },
                            "timing": {
                                "function": "ease"
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                    },

                },
                "children": [
                    { "label": '矩形', "type": 'square' },
                    { "label": '圆形', "type": 'circle' },
                ]
            },
            "freehot": {
                "type": "free",
                "title": "热区",
                "icon": "el-icon-requzujian",
                "component": "freehot",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "content": {
                    "lockaspectratio": false,

                    "click": {
                        "cate": "",
                        "type": "",
                        "title": "",
                        "params": {},
                    },
                    "styles": {
                        "width": 80,
                        "height": 80,
                        "border": {
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            }
                        },
                        "animation": {
                            "name": "",
                            "delay": 0.2,
                            "duration": 1,
                            "direction": "normal",
                            "fill": {
                                "mode": "both"
                            },
                            "iteration": {
                                "count": 1
                            },
                            "play": {
                                "state": "running"
                            },
                            "timing": {
                                "function": "ease"
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                    },

                },
            },
            "freeicon": {
                "type": "free",
                "title": "图标",
                "icon": "el-icon-icon_little_taget",
                "component": "freeicon",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "content": {
                    "lockaspectratio": false,

                    "click": {
                        "cate": "",
                        "type": "",
                        "title": "",
                        "params": {},
                    },
                    "icon": {
                        "type": 1,
                        "src": '',
                        "name": "el-icon-shouye1",
                        "size": 26,
                        "color": "#409EFF"
                    },
                    "styles": {
                        "width": 40,
                        "height": 40,
                        "opacity": 1,
                        "transrotate": 0,
                        "background": {
                            "mode": "fill-x",
                            "color": "",
                            "image": "",
                            "position": "left top",
                            "attachment": "scroll",
                        },
                        "border": {
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            }
                        },
                        "animation": {
                            "name": "",
                            "delay": 0.2,
                            "duration": 1,
                            "direction": "normal",
                            "fill": {
                                "mode": "both"
                            },
                            "iteration": {
                                "count": 1
                            },
                            "play": {
                                "state": "running"
                            },
                            "timing": {
                                "function": "ease"
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                    },

                },
                "children": [
                    { "label": '普通图标', "type": 'normal' },
                    { "label": '带底色正方形', "type": 'square' },
                    { "label": '带底色圆形', "type": 'circle' },
                ]
            },
            "freebtn": {
                "type": "free",
                "title": "按钮",
                "icon": "el-icon-biaodanzujian-anniu",
                "component": "freebtn",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "content": {
                    "lockaspectratio": false,
                    "click": {
                        "cate": "",
                        "type": "",
                        "title": "",
                        "params": {},
                    },
                    "text": '按钮文字',
                    "styles": {
                        "width": 140,
                        "height": 40,
                        "opacity": 1,
                        "transrotate": 0,
                        "color": "#fff",
                        "line": {
                            "height": 25
                        },
                        "align": {
                            "items": "center"
                        },
                        "text": {
                            "align": "center",
                            "decoration": "none"
                        },
                        "font": {
                            "family": "Arail",
                            "size": 16,
                            "weight": "normal",
                            "style": "normal"
                        },
                        "background": {
                            "mode": "fill-x",
                            "color": "rgba(25, 159, 255, 1)",
                            "image": "",
                            "position": "left top",
                            "attachment": "scroll",
                        },
                        "border": {
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 8,
                                "rightRadius": 8
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 8,
                                "rightRadius": 8
                            }
                        },
                        "animation": {
                            "name": "",
                            "delay": 0.2,
                            "duration": 1,
                            "direction": "normal",
                            "fill": {
                                "mode": "both"
                            },
                            "iteration": {
                                "count": 1
                            },
                            "play": {
                                "state": "running"
                            },
                            "timing": {
                                "function": "ease"
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                    },
                },
            },
        },
    },
    "base": {
        "title": '基本组件',
        "lists": {
            "basetitle": {
                "type": "base",
                "title": "标题",
                "icon": "el-icon-document-remove",
                "component": "basetitle",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "width": 260,
                "height": 40,
                "content": {
                    "text": "请在右侧修改标题文字",
                    "click": {
                        "cate": "",
                        "type": "",
                        "title": "",
                        "params": {},
                    },
                    "styles": {
                        "opacity": 1,
                        "color": "",
                        "height": 40,
                        "text": {
                            "align": "center",
                            "decoration": "none"
                        },
                        "font": {
                            "family": "Arail",
                            "size": 14,
                            "weight": "normal",
                            "style": "normal"
                        },
                        "padding": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "background": {
                            "image": "",
                            "mode": "fill-y",
                            "color": "#fff",
                            "attachment": "scroll",
                            "position": "left top"
                        },
                        "margin": {
                            "top": 10,
                            "right": 10,
                            "bottom": 10,
                            "left": 10
                        },
                        "border": {
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            }
                        },
                        "box": {
                            "shadow": {
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "color": "rgba(237, 237, 237, 0.1)",
                                "inset": false
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                        "paddinglock": true,
                        "marginlock": true,
                        "opacity": 1,
                    },
                },
            },
            "baserichtext": {
                "type": "base",
                "title": "富文本",
                "icon": "el-icon-28fuwenbenkuang",
                "component": "baserichtext",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "width": 310,
                "height": 78,
                "content": {
                    "overflow": "hidden",
                    "text": "",
                    "styles": {
                        "padding": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "background": {
                            "image": "",
                            "mode": "fill-y",
                            "color": "#fff",
                            "attachment": "scroll",
                            "position": "left top"
                        },
                        "margin": {
                            "top": 10,
                            "right": 10,
                            "bottom": 10,
                            "left": 10
                        },
                        "border": {
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            }
                        },
                        "box": {
                            "shadow": {
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "color": "rgba(237, 237, 237, 0.1)",
                                "inset": false
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                        "paddinglock": true,
                        "marginlock": true,
                        "opacity": 1,
                    },
                },
            },
            "baseswiper": {
                "type": "base",
                "title": "图片轮播",
                "icon": "el-icon-lunbotu",
                "component": "baseswiper",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "width": 200,
                "height": 120,
                "content": {
                    "styles": {
                        "height": 213,
                        "padding": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "background": {
                            "image": "",
                            "mode": "fill-y",
                            "color": "#fff",
                            "attachment": "scroll",
                            "position": "left top"
                        },
                        "margin": {
                            "top": 10,
                            "right": 10,
                            "bottom": 10,
                            "left": 10
                        },
                        "border": {
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            }
                        },
                        "box": {
                            "shadow": {
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "color": "rgba(237, 237, 237, 0.1)",
                                "inset": false
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                        "paddinglock": true,
                        "marginlock": true,
                        "opacity": 1,
                    },
                    "list": [
                        {
                            "src": "/static/images/diy/1.png",
                            "click": {
                                "cate": "",
                                "type": "",
                                "title": "",
                                "params": {},
                            },
                        },
                        {
                            "src": "/static/images/diy/2.png",
                            "click": {
                                "cate": "",
                                "type": "",
                                "title": "",
                                "params": {},
                            },
                        },
                        {
                            "src": "/static/images/diy/3.png",
                            "click": {
                                "cate": "",
                                "type": "",
                                "title": "",
                                "params": {},
                            },
                        }
                    ],
                    "swiper": {
                        "vertical": false,//方向
                        "autoplay": 3,//间隔时间秒单位 0则不自动切换
                        "duration": 500,//动画时长
                        "loop": true,//循环播放
                        "showindicators": true,//显示页码
                        "indicatorcolor": "#ffffff",//页码颜色
                    }
                },
            },
            "baseaudio": {
                "type": "base",
                "title": "音频",
                "icon": "el-icon-yinpin",
                "component": "baseaudio",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "width": 310,
                "height": 30,
                "content": {
                    "audio": {
                        "src": "",
                        "loop": false,
                        "autoplay": false,
                        "icon": "",
                        "top": 20,
                        "right": 20,
                        "size": 30,
                    },
                    "styles": {
                        "padding": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "background": {
                            "image": "",
                            "mode": "fill-y",
                            "color": "#fff",
                            "attachment": "scroll",
                            "position": "left top"
                        },
                        "margin": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "border": {
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            }
                        },
                        "box": {
                            "shadow": {
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "color": "rgba(237, 237, 237, 0.1)",
                                "inset": false
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                        "paddinglock": true,
                        "marginlock": true,
                        "opacity": 1,
                    },
                },
            },
            "basevideo": {
                "type": "base",
                "title": "视频",
                "icon": "el-icon-video-camera",
                "component": "basevideo",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "width": 300,
                "height": 167,
                "content": {
                    "video": {
                        "type": "normal",
                        "src": "",
                        "youkusrc": "",
                        "qqsrc": "",
                        "bilibilisrc": "",
                        "poster": "",
                        "controls": true,
                        "loop": false,
                        "autoplay": false,
                        "muted": false,
                        "showFullScreenBtn": true,
                        "showPlayBtn": true,
                        "showCenterPlayBtn": true,
                    },
                    "styles": {
                        "height": 200,
                        "padding": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "background": {
                            "image": "",
                            "mode": "fill-y",
                            "color": "#fff",
                            "attachment": "scroll",
                            "position": "left top"
                        },
                        "margin": {
                            "top": 10,
                            "right": 10,
                            "bottom": 10,
                            "left": 10
                        },
                        "border": {
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            }
                        },
                        "box": {
                            "shadow": {
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "color": "rgba(237, 237, 237, 0.1)",
                                "inset": false
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                        "paddinglock": true,
                        "marginlock": true,
                        "opacity": 1,
                    },
                },
            },
            "basenotice": {
                "type": "base",
                "title": "公告",
                "icon": "el-icon-gonggao",
                "component": "basenotice",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "width": 200,
                "height": 40,
                "content": {
                    "scroll": {
                        "type": 'h',
                        "scrollable": '1',
                        "speed": 60,
                        "autoplay": 3,
                        "iconname": 'volume-o',
                        "iconcolor": '',
                        "iconsize": 14,
                    },
                    "list": [
                        { content: '纵向滚动数据1', link: '' },
                        { content: '纵向滚动数据2', link: '' },
                    ],
                    "text": "我是单条横向滚动的数据",
                    "styles": {
                        "height": 40,
                        "color": "",
                        "line": {
                            "height": 16
                        },
                        "text": {
                            "decoration": "none"
                        },
                        "font": {
                            "family": "Arail",
                            "size": 14,
                            "weight": "normal",
                            "style": "normal"
                        },
                        "padding": {
                            "top": 0,
                            "right": 16,
                            "bottom": 0,
                            "left": 16
                        },
                        "background": {
                            "image": "",
                            "mode": "fill-y",
                            "color": "#fff",
                            "attachment": "scroll",
                            "position": "left top"
                        },
                        "margin": {
                            "top": 10,
                            "right": 10,
                            "bottom": 10,
                            "left": 10
                        },
                        "border": {
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            }
                        },
                        "box": {
                            "shadow": {
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "color": "rgba(237, 237, 237, 0.1)",
                                "inset": false
                            }
                        },
                        "radiuslock": true,
                        "borderlock": true,
                        "paddinglock": false,
                        "marginlock": true,
                        "opacity": 1,
                    },
                },
            },
            "baseline": {
                "type": "base",
                "title": "分割线",
                "icon": "el-icon-minus",
                "component": "baseline",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "width": 310,
                "height": 20,
                "content": {

                    "styles": {
                        "padding": {
                            "top": 10,
                            "right": 10,
                            "bottom": 10,
                            "left": 10
                        },
                        "background": {
                            "image": "",
                            "mode": "fill-y",
                            "color": "",
                            "attachment": "scroll",
                            "position": "left top"
                        },
                        "border": {
                            "top": {
                                "width": 1,
                                "style": "solid",
                                "color": "#ebedf0",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#ebedf0"
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#ebedf0",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#ebedf0"
                            }
                        },
                        "radiuslock": false,
                        "borderlock": false,
                        "paddinglock": true,
                    },
                },
            },
            "basecountdown": {
                "type": "base",
                "title": "倒计时",
                "icon": "el-icon-alarm-clock",
                "component": "basecountdown",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "width": 332,
                "height": 40,
                "content": {
                    "styles": {
                        "color": "",
                        "justify": {
                            "content": "space-around",
                        },
                        "align": {
                            "items": "center"
                        },
                        "font": {
                            "family": "Arail",
                            "size": 14,
                            "weight": "normal",
                            "style": "normal"
                        },
                        "padding": {
                            "top": 5,
                            "right": 0,
                            "bottom": 5,
                            "left": 0
                        },
                        "background": {
                            "image": "",
                            "mode": "fill-y",
                            "color": "#fff",
                            "attachment": "scroll",
                            "position": "left top"
                        },
                        "margin": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "border": {
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            }
                        },
                        "box": {
                            "shadow": {
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "color": "rgba(237, 237, 237, 0.1)",
                                "inset": false
                            }
                        },
                        "opacity": 1,
                        "radiuslock": true,
                        "borderlock": true,
                        "paddinglock": false,
                        "marginlock": true,
                    },
                    "config": {
                        "type": 1,//1自己选的时间 2调用活动结束时间
                        "endtime": "",
                        "remaintime": 0,
                        "presuffix": {
                            "start": "还剩",
                            "end": "结束",
                        },
                        "box": {
                            "width": 36,
                            "height": 36,
                            "bgcolor": "#409EFF",
                            "border": {
                                "color": "",
                                "size": 1,
                            },
                            //格子内文字
                            "font": {
                                "color": "#fff",
                                "size": 18,
                            },
                        },
                        "format": {
                            "day": true,
                            "hour": true,
                            "minute": true,
                            "second": true,
                            "secondsunit": 1,//秒的单位 1是秒 2是S
                            "ms": true,
                            "msconfig": {
                                "type": 1,
                                "color": "#fff",
                                "width": 36,
                                "size": 23,
                            },
                            "type": 1,//1是天时分秒 2是冒号
                            "font": {
                                "color": "#000",
                                "size": 12,
                            },
                        },
                    }
                },
            },
            "basemenu": {
                "type": "base",
                "title": "组合菜单",
                "icon": "el-icon-anniuzu",
                "component": "basemenu",
                "selected": true,
                "actived": true,
                "preventdeactivation": true,
                "width": 332,
                "height": 96,
                "content": {
                    "styles": {
                        "padding": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "background": {
                            "image": "",
                            "mode": "fill-y",
                            "color": "#fff",
                            "attachment": "scroll",
                            "position": "left top"
                        },
                        "margin": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "border": {
                            "top": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "right": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            },
                            "bottom": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333",
                                "leftRadius": 0,
                                "rightRadius": 0
                            },
                            "left": {
                                "width": 0,
                                "style": "solid",
                                "color": "#333"
                            }
                        },
                        "box": {
                            "shadow": {
                                "hShadow": 0,
                                "vShadow": 0,
                                "blur": 0,
                                "spread": 0,
                                "color": "rgba(237, 237, 237, 0.1)",
                                "inset": false
                            }
                        },
                        "opacity": 1,
                        "radiuslock": true,
                        "borderlock": true,
                        "paddinglock": true,
                        "marginlock": true,
                    },
                    "config": {
                        "col": 4,
                        "gutter": 0,
                        "iconsize": 42,
                        "box": {
                            "padding": {
                                "top": 16,
                                "bottom": 16,
                            },
                        },
                        "font": {
                            "color": "",
                            "margintop": 10,
                            "family": "Arail",
                            "size": 14,
                            "weight": "normal",
                            "style": "normal",

                        },
                        "list": [
                            {
                                "type": 2,
                                "src": "/static/images/diy/menu/1.png",
                                "iconname": "el-icon-icon_signin_line",
                                "iconcolor": "#409EFF",
                                "text": "菜单名称",
                                "click": {
                                    "cate": "",
                                    "type": "",
                                    "title": "",
                                    "params": {},
                                },
                            },
                            {
                                "type": 2,
                                "src": "/static/images/diy/menu/2.png",
                                "iconname": "el-icon-xiaoxitongzhi",
                                "iconcolor": "#409EFF",
                                "text": "菜单名称",
                                "click": {
                                    "cate": "",
                                    "type": "",
                                    "title": "",
                                    "params": {},
                                },
                            },
                            {
                                "type": 2,
                                "src": "/static/images/diy/menu/3.png",
                                "iconname": "el-icon-s-data",
                                "iconcolor": "#409EFF",
                                "text": "菜单名称",
                                "click": {
                                    "cate": "",
                                    "type": "",
                                    "title": "",
                                    "params": {},
                                },
                            },
                            {
                                "type": 2,
                                "src": "/static/images/diy/menu/4.png",
                                "iconname": "el-icon-wallet",
                                "iconcolor": "#409EFF",
                                "text": "菜单名称",
                                "click": {
                                    "cate": "",
                                    "type": "",
                                    "title": "",
                                    "params": {},
                                },
                            }
                        ],
                    }
                },
            },
        }
    }
}