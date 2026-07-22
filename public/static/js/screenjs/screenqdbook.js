define('screenqdbook',['jquery','template','screencore','layerBox','anime'],function($,template,screencore,layerBox,anime){
    template.helper('messageinit', function (message) {
        var msg = '';
        if(message.length > 0){
            $.each([...message],function(i,v){
                msg += '<span>' + v + '</span>';
            });
        }
        return msg;
    }); 
	var screenqdbook = {
        signRender:null,
        hadexpand:false,
        bookwidth:1e3,
        onewidth:125,
        maxlength:8,
		loaded:false,
		maxid:0,
		signQueue:[],
        newsignQueue:[],
        popsignQueue:[],
		ispop:false,
        ulbox:null,
		init:function(){
			var self = this;
            
            self.ulbox = $('.qdbook-body ul');
			self.signRender = template('bookitem-tpl');
			self.initdata();
		},
		initdata:function(){
			var self = this;
			screencore.ajaxSubmit("/screen/qdbook/ajaxsign",{}).then(function(data){
				if(data.code!=0){
					return layerBox.showMsg(data.msg);
				}
				var ajaxsigns = data.msg.list;
				if(ajaxsigns.length > 0){
					self.maxid = ajaxsigns[0].id;
					self.signQueue = ajaxsigns.reverse();
				}
				$(".joinPeople").html('<span>' + data.msg.total + '</span>人签到');
				self.loaded = true;
                self.expandbody();
			},function(){
				layerBox.showMsg('加载出错');
			});
			setInterval(function() {
				self.loaded && self.ajaxNewsign();
			}, 5e3);
		},
        ajaxNewsign:function(){
			var self = this;
			screencore.ajaxSubmit("/screen/qdbook/ajaxsign",{maxid:self.maxid}).then(function(data){
                if(data.code != 0){
                    return layerBox.showMsg(data.msg);
                }
                var ajaxsigns = data.msg.list;
                if(ajaxsigns.length > 0){
                    self.maxid = ajaxsigns[0].id;
                    ajaxsigns = ajaxsigns.reverse();
                    $.each(ajaxsigns,function(i,v){
                        self.newsignQueue.push(v);
                        if(qdbookconfig.popstatus == '1') self.popsignQueue.push(v);
                        self.signQueue.push(v);
                    });
                }
                $(".joinPeople").html('<span>' + data.msg.total + '</span>人签到');
			},function(){
				layerBox.showMsg('加载出错');
			});
		},
        expandbody:function(func){
            var self = this;
            $.each(self.signQueue,function(i,v){
                v.left = self.onewidth * i;
                var obj = $(self.signRender(v));
                self.ulbox.append(obj);
                setTimeout(function(){
                    self.txtMove(obj);
                },50);
            });
            anime({
                targets: '.qdbook-body',
                width: self.bookwidth + 'px',
                easing: 'linear',
                duration: 3e3,
                complete:function(ani){
                    setTimeout(function(){
                        self.hadexpand = true;
                        self.repeatScroll();
                        self.appendOne();
                        self.popOne();
                    },1e3);
                },
            });
        },
        txtMove:function(obj){
            var messageobj = obj.find('.message'),divobj = messageobj.find('div'),spans = messageobj.find('span'),fheight = messageobj.height(),txtHeight = 0;
            for (var i = 0; i < spans.length; i++) {
                txtHeight += spans[i].clientHeight;
            }
            if(txtHeight > fheight){
                divobj.height(txtHeight + 8).addClass('txtscroll');
                messageobj.append(messageobj.html());
            }else{
                divobj.height(fheight);
            }
        },
        isscroll:false,
        scrollDirection:'1',
        repeatScroll:function(){
            var self = this;
            if(!self.isscroll && self.ulbox.find('li').length > self.maxlength){
                var rollwidthnum = self.ulbox.find('li').length - self.maxlength,translateX = self.scrollDirection == '1' ? -self.onewidth * rollwidthnum : 0;
                self.isscroll = true;
                anime({ 
                    targets: self.ulbox[0],
                    translateX: translateX,
                    easing: 'linear', 
                    duration: qdbookconfig.rolltime * rollwidthnum,
                    complete: function(ani){
                        self.isscroll = false;
                        self.scrollDirection = self.scrollDirection == '1' ? '2' : '1';
                        setTimeout(function(){
                            self.repeatScroll();
                        },2e3);
                    }
                });
            }else{
                setTimeout(function(){
                    self.repeatScroll();
                },2e3);
            }
        },
        isappend:false,
        appendOne:function(){
            var self = this;
            if(!self.isappend && self.newsignQueue.length > 0 ){
                self.isappend = true;
                var data = self.newsignQueue.shift();
                data.left = self.ulbox.find('li').length * self.onewidth;
                var obj = $(self.signRender(data));
                self.ulbox.append(obj);
                setTimeout(function(){
                    self.txtMove(obj);
                },50);
                if(self.ulbox.find('li').length <= self.maxlength){
                    anime({ 
                        targets: obj[0],
                        opacity:[0, 1],
                        easing: 'linear', 
                        duration: 3e2,
                        complete: function(ani){
                            self.isappend = false;
                            setTimeout(function(){
                                self.appendOne();
                            },1e3);
                        }
                    });
                }else{
                    self.isappend = false;
                    setTimeout(function(){
                        self.appendOne();
                    },1e3);
                }
            }else{
                setTimeout(function(){
                    self.appendOne();
                },1e3);
            }
        },
        popOne:function(){
            var self = this;
            if(qdbookconfig.popstatus == '2') return false;
            if(self.ispop) {
                setTimeout(function(){
                    self.popOne();
                },1e3);
                return false;
            }
            if(self.popsignQueue.length == 0 && self.signQueue.length == 0){
                setTimeout(function(){
                    self.popOne();
                },1e3);
                return false;
            }
            var popone = false;
            if(self.popsignQueue.length > 0){
                popone = self.popsignQueue.shift();
            }
            if(!popone && qdbookconfig.oldopenpop == '1' && self.signQueue.length > 0){
                popone = self.signQueue[Math.floor(Math.random() * self.signQueue.length)];
            }
            if(!popone || !popone.hasOwnProperty('id')){
                setTimeout(function(){
                    self.popOne();
                },1e3);
                return false;
            }
            self.ispop = true;
            $(".qdbook-popbox").removeClass('hidden');
            anime({
                targets: '.popcontainer',
                opacity:[0, 1],
                rotateY: [90,0],
                easing: 'linear',
                duration: 1e3,
                complete:function(ani){
                    self.fontAnimate({
                        class:'.popcontainer .popname',
                        txt:(popone.nickname || '' ) + '：',
                        ani:qdbookconfig.ani,
                        anitime:qdbookconfig.anitime,
                        speed:qdbookconfig.speed,
                    },function(){
                        self.fontAnimate({
                            class:'.popcontainer .popcontent',
                            txt:(popone.message || ''),
                            ani:qdbookconfig.ani,
                            anitime:qdbookconfig.anitime,
                            speed:qdbookconfig.speed,
                        },function(){
                            setTimeout(function(){
                                anime({
                                    targets: '.popcontainer',
                                    scale:[1, 0],
                                    opacity:[1, 0],
                                    easing: 'linear',
                                    duration: 3e2,
                                    complete:function(ani){
                                        $(".qdbook-popbox").addClass('hidden');
                                        $(".qdbook-popbox .popcontainer").removeAttr('style');
                                        $(".qdbook-popbox .popcontainer .popname,.qdbook-popbox .popcontainer .popcontent").empty();
                                        self.ispop = false;
                                        setTimeout(function(){
                                            self.popOne();
                                        },2e3);
                                    },
                                });
                            },qdbookconfig.poptime);
                        });
                    });
                },
            });
        },
        fontTimer1:null,
        fontTimer2:null,
        fontTimer3:null,
        fontAnimate: function(params,func) {
            var self = this, pclass = params.class || '', txt = params.txt || '',txtspeed = params.speed || 5e2,txtani = params.ani || '1',txtanitime = params.anitime || 5e2;
            var txthtml = '',parentNode = (pclass == '' ? '' : $(pclass)),txt = $.trim(txt);
            if(parentNode.length == 0 || txt === ''){
                if(func){
                    setTimeout(function(){
                        func();
                    },5e2);
                }
                return false;
            }
            clearTimeout(self.fontTimer1);
            clearTimeout(self.fontTimer2);
            clearTimeout(self.fontTimer3);
            $.each([...txt],function(i,v){
                txthtml += '<span class="oneWord">' + v + '</span>';
            });
            parentNode.html(txthtml);
            self.fontTimer1 = setTimeout(function() {
                var words = parentNode.find('.oneWord'),windex = 0;
                self.fontTimer2 = setTimeout(function() {
                    anime({
                        targets: $(words[windex])[0],
                        scale:[(txtani == '2' ? 2 : 1), 1],
                        translateY:[(txtani == '3' ? -20 : 0),0],
                        opacity:[0, 1],
                        easing: 'linear',
                        duration: txtanitime,
                    });
                    windex++;
                    self.fontTimer3 = setTimeout(arguments.callee, txtspeed);
                    if (windex >= words.length){
                        clearTimeout(self.fontTimer1);
                        clearTimeout(self.fontTimer2);
                        clearTimeout(self.fontTimer3);
                        if(func){
                            setTimeout(function(){
                                func();
                            },5e2);
                        }
                    }
                }, 100);
            }, 50);
        },
	};
	return screenqdbook;
});
