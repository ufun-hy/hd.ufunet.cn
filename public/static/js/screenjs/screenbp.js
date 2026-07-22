define('screenbp',['jquery','screenbpdata','bgscreen','rightboxslider','slideranimate','videocontrol','template','screencore','screensocket','layerBox','fulldm','keyboard','swiper','jquerytrans'],function($,screenbpdata,bgscreen,rightboxslider,slideranimate,videocontrol,template,screencore,screensocket,layerBox,fulldm,keyboardJS,Swiper){
var screenbp = {
	holdid:'',
	soonid:'',
	loadhistory:'1',
	historynums:20,
	shownormal:'1',
	isloop:true,
	loopnum:20,
	loopdelay:3e3,
	looprunTimer:null,
	oldmsg:[],
	msgsList:[],
	msgreset:true,
	msgresetDelay:120e3,
	newmsgsList:[],
	bpMsgList:[],
	ishold:false,
	forceimgmaxheight:'2',
	imgmaxwidth:1080,
	init: function(params) {
			var self = this,forcehdid = ['1362','2227'];
			if(window.location.host=='v3.martian.net.cn' && $.inArray(XCV3Config.rhdid,forcehdid)!=-1){
				self.forceimgmaxheight = '1';
			}
			params.onmessage = function(data){
				if(data.type=='connected'){
					screensocket.isclose = false;
					screencore.connectsocket({clientid:data.clientid});
				}else if(data.type=='1'||data.type=='2'||data.type=='3'||data.type=='4'||data.type=='5'||data.type=='6'||data.type=='7'){
					self.addOneMsgs(data);
				}else if(data.type=='delbp'){
					if(!$.isArray(data.msgid)){
						self.delOneMsgs(data.msgid);
					}else{
						$.each(data.msgid,function(index,val){
							self.delOneMsgs(val);
						});
					}
				}else if(data.type=='bpreset'){
					self.resetMsg();
				}else if(data.type=='bpshenhe'){
					var messages = data.messages;
					if($.isArray(messages)&&messages.length>0){
						$.each(messages,function(i, val){
							self.addOneMsgs(val);
						});
					}
				}else if(data.type=='barnotice'){
					self.barnotices = data.barnotices;
				}else if(data.type=='screendm'){
					var messages = data.messages;
					if(messages){
						if($.isArray(messages)&&messages.length>0){
							$.each(messages,function(i, val){
								fulldm.addBullet(val);
							});
						}
					}else{
						fulldm.addBullet(data);
					}
				}else if(data.type=='screendeldm'){
					if(!$.isArray(data.msgid)){
						fulldm.delBullet(data.msgid);
					}else{
						$.each(data.msgid,function(index,val){
							fulldm.delBullet(val);
						});
					}
				}else if(data.type=='screenresetdm'){
					fulldm.resetBullet();
					if(data.fromtype=='2') self.resetMsg();
				}
			};
			self.msgRender = template('msg-tpl');
			self.soonholdRender = template('soonhold-tpl');
			self.holdscreenRender = template('holdscreen-tpl');
			self.dsRender = template('ds-tpl');
			self.hbRender = template('hb-tpl');
			self.songRender = template('song-tpl');
			screensocket.init(params);
			screenbpdata.init(function(){
				bgscreen.init(screenbpdata.getLoadImage('bgimgs'),screenbpdata.getLoadVideos('bgvideos'),screenbpdata.getLoadVideos('bgvideosdata'),function(){
					bgscreen.setbgtype(screenbpdata.getval('leftcontrol','showdata','bgtype'));
				});
				self.getMsgsList();
			});
			$(window).on('resize',function(){
				var bpshowimg = $('.holdscreen-mainBox #hehe img.isshowing');
				if(bpshowimg.length > 0){
					var dir = bpshowimg[0].naturalWidth/bpshowimg[0].naturalHeight;
					if(self.forceimgmaxheight=='2' && dir >= 1){
						bpshowimg.parent().css({width:self.imgmaxwidth});
						bpshowimg.css({width:'100%'});	
					}else{
						var w = $('body').height()*dir;
						bpshowimg.parent().css({width:w});
						bpshowimg.css({height:'100%',width:"auto"});
					}
				}
			});
	},
	getMsgsList: function() {
		var self = this;
		self.loopdelay = screenbpdata.getval('leftcontrol','msgdata','msglooptime')*1e3;
		self.loopnum = screenbpdata.getval('leftcontrol','msgdata','msgloopnum');
		self.loadhistory = screenbpdata.getval('leftcontrol','msgdata','loadhistory');
		self.shownormal = screenbpdata.getval('leftcontrol','msgdata','shownormal');
		self.testAutoPlay().then(autoplay => {
            self.autoplay = autoplay;
        });
		var showwallHtml = '';
		screencore.ajaxSubmit("/screen/baping/ajaxmsg",{nums:self.loopnum,loadhistory:self.loadhistory,shownormal:self.shownormal}).then(function(data){
				var ajaxmsgs = data.msg.msgs || [];
				var msgLength = ajaxmsgs.length;
				var imglist = [];
				if(msgLength > 0){
					ajaxmsgs = ajaxmsgs.reverse();
					self.oldmsg = ajaxmsgs;
					for (var m=0;m<msgLength;m++) {
							var oneMsg = ajaxmsgs[m];
							oneMsg = {
								id:oneMsg.id,
								type:oneMsg.type,
								content:oneMsg.content,
								themeid:oneMsg.themeid,
								nickname:oneMsg.nickname,
								avatar:oneMsg.avatar,
								fromhistory:'1',
								create_time:oneMsg.create_time
							};
							if(oneMsg.type=='1'){
								oneMsg.content = screencore.emoToimg(oneMsg.content);
							}
							if((barConfig.sliderbox.fromtype=='1' || barConfig.sliderbox.fromtype=='3') && oneMsg.type=='2'){
								var addImageObj = {id:oneMsg.id};
								addImageObj.src = oneMsg.content;
								imglist.push(addImageObj);
								
							}
							if(barConfig.sliderbox.fromtype < 3 && oneMsg.type=='3' && (oneMsg.content.bpimgs||oneMsg.content.bpvideo)){
								var addImageObj = {id:oneMsg.id};
								addImageObj.src = (oneMsg.content.bpimgs?oneMsg.content.bpimgs:oneMsg.content.bpvideo.video+'.jpg');
								imglist.push(addImageObj);
								
							}
							self.msgsList.push(oneMsg);
							showwallHtml +=  self.msgRender(oneMsg);
					};
					$(".baping-contents").html(showwallHtml).show();
				}else{
					$(".baping-contents").fadeIn();
				}
				self.bpMsgList = data.msg.bps || [];
				rightboxslider.init(imglist);
				self.bindevent();
		},function(){
			layerBox.showMsg('加载出错');
		});
	},
	bindevent:function(){
		var self = this;
		self.createHead();
		self.initmoduleBox();
		$(".bpfontStyleBox").remove();
		$(".loading-box").remove();
		self.pollholdscreen();
		self.msgResetOrderByTime();
		screenbpdata.getlocalval('showmsgbox')=='2'&&$(".baping-contents").addClass('hide');
		screenbpdata.getlocalval('msglooproll')!='2'&&self.startLoop();
		self.initkeyword();
		self.showsongBox();
		if(XCV3Config.openbgmusic=='1'&&$("#bgmusic").length>0) $(".control-normal-list .openmusic").trigger('click');
	},
	showsongBox:function(){
		var self = this,msgbox = $(".baping-mainbox .msg-itembox"),songbox = $(".baping-mainbox .song-itembox");
		if(songbox.length > 0 ){
			self.songboxTimer = setTimeout(function(){
				msgbox.addClass('onClose');
				setTimeout(function(){
					msgbox.removeClass('onClose').css({'-webkit-transform':'translate3d(100%,0,0)'}).removeClass('showpagebox');
				},700);
				$(".hdQrbox").addClass('dsshowing');
				songbox.addClass('onShow');
				setTimeout(function(){
					songbox.removeClass('onShow').css({'-webkit-transform':'translate3d(0,0,0)'}).addClass('showpagebox');
					self.songlist.init();
				},700);
				self.showwallBox();
			},barConfig.widgets.msg.widgettime * 1e3 ||100e3);
		}
	},
	showwallBox:function(){
		var self = this,msgbox = $(".baping-mainbox .msg-itembox"),songbox = $(".baping-mainbox .song-itembox");
		self.wallboxTimer = setTimeout(function(){
			songbox.addClass('onClose');
			setTimeout(function(){
				songbox.removeClass('onClose').css({'-webkit-transform':'translate3d(100%,0,0)'}).removeClass('showpagebox');
			},700);
			msgbox.addClass('onShow');
			setTimeout(function(){
				$(".hdQrbox").removeClass('dsshowing');
				msgbox.removeClass('onShow').css({'-webkit-transform':'translate3d(0,0,0)'}).addClass('showpagebox');
			},700);
			self.showsongBox();
		},barConfig.widgets.song.widgettime * 1e3 ||100e3);
	},
	songlist:{
        timeOut1:null,
        timeOut2:null,
		singerswiper:null,
        loopTime:1e3,
		init:function(){
			var self = this;
			if(self.singerswiper!=null){
				self.singerswiper.destroy(true,true);
			}  
			if($('.baping-songlist-items li').length>0){
				self.singerswiper = new Swiper ('.singer-swiper', {
					loop: true,
					autoplay:{
						autoplay:true,
						disableOnInteraction:false,
						delay:10e3,
					},
					effect : 'cube',
					watchOverflow: true,
					centeredSlides: true,
				});    
                $('.baping-songlist-items li').length>6&&self.move();
            }else{
                self.clearmove();
            }
		},
        move:function(){
            var t = this;
            var c_tag = $(".baping-songlist-items").find("ul");
            var top = c_tag.find("li").eq(0).outerHeight(true);
            t.timeOut1 = setTimeout(function(){
				$(".baping-songlist-items ul").children("li").first().animate({"margin-top":"-"+top+"px"},t.loopTime,function(){
					var $li = $(this);
					if(!$li.is(":animated")){//动画已经结束
						$li.remove();
						$li.css("margin-top","0px").appendTo($(".baping-songlist-items ul"));
						t.timeOut2 = setTimeout(function(){
							t.move();
						},t.loopTime);
					}
				});
			},t.loopTime);
        },
        clearmove:function(){
			if(self.singerswiper!=null){
				self.singerswiper.destroy(true,true);
			}
            clearTimeout(this.timeOut1);
            clearTimeout(this.timeOut2);
        },
	},
	initkeyword:function(){
		var self = this;
		var syskeyword = screenbpdata.getlocalval('syskeyword');
		if(syskeyword=='2'){
			self.pausekeyword();
		}
	},
	resumekeyword:function(){
		keyboardJS.resume();
	},
	pausekeyword:function(){
		keyboardJS.pause();
	},
	initmoduleBox:function(){
		var self = this;
		var moduleboxshow = screenbpdata.getlocalval('moduleboxshow');
		if(moduleboxshow=='2'){
			self.hidemodulebox();
		}
	},
	hidemodulebox:function(){
		$('.footer-controlBox').removeClass('up').addClass('down').hide();
	},
	showmodulebox:function(){
		$('.footer-controlBox').removeClass('up').addClass('down').show();
	},
	marqueenRun:true,
	marqueentimer:null,
	barnotices:[],
	createHead:function(){
		var self = this;
		var fdom = $(".main-box header");
		fdom.addClass('zam-app-justifyCenter');
		fdom.html('<div class="logoBox zam-app-flex"></div>');
		var barname = screenbpdata.getlocalval('barname');
		fdom.find('.logoBox').append('<div class="barlogo"><img src="'+barConfig.barinfo.logo+'" /></div><div class="barname"><div class="barnameBox noscroll"><li>'+(barname?barname:barConfig.barinfo.title)+'</li></div></div>');
		var liBox = $('.logoBox .barname .barnameBox');
		var maxW = $('.logoBox .barname').width();
		if(liBox.width()>maxW){
			liBox.append(liBox.html());
			liBox.removeClass('noscroll').addClass('namescroll');
		}
		self.barnotices = barConfig.barinfo.notices;
		var showmarqureen = screenbpdata.getlocalval('showmarqueen');
		if(showmarqureen=='2'){
			self.marqueenRun = false;
		}else{
			self.initmarqueenTxt();
		}
	},
	initmarqueenTxt:function(){
		var self = this;
		var fdom = $(".main-box header");
		fdom.append('<div class="marqueenBox"><ul class="scrollMarqueen hide"></ul>');
		clearTimeout(self.marqueentimer);
		var html = '';
		var marqueensize = screenbpdata.getlocalval('marqueensize');
		if(marqueensize==null){
			marqueensize = 40;
		}
		var marqueencolor = screenbpdata.getlocalval('marqueencolor');
		if(marqueencolor==null){
			marqueencolor = '#ffffff';
		}
		$.each(self.barnotices,function(i,v){
			html += '<li style="font-size:'+marqueensize+'px;color:'+marqueencolor+'">'+v+'</li>';
		});
		var scrolldom = $(".main-box header").find('.marqueenBox ul');
		scrolldom.html(html);
		scrolldom.transition({x:$('.marqueenBox').width()})
		setTimeout(function(){
			self.marqueenScroll(scrolldom);		
		},6e3);
	},
	marqueenScroll:function(scrolldom){
		var self = this;
		var html = '';
		var marqueensize = screenbpdata.getlocalval('marqueensize');
		if(marqueensize==null){
			marqueensize = 40;
		}
		var marqueencolor = screenbpdata.getlocalval('marqueencolor');
		if(marqueencolor==null){
			marqueencolor = '#ffffff';
		}
		$.each(self.barnotices,function(i,v){
			html += '<li style="font-size:'+marqueensize+'px;color:'+marqueencolor+'">'+v+'</li>';
		});
		scrolldom.html(html);
		//计算滚动距离和时间
		var speed = screenbpdata.getlocalval('marqueenspeed');
		if(speed==null){
			speed = 2;
		}
		if(speed <= 0){
			speed = 1;
		}
		speed = 45 + (speed - 1) * 5;
		var scrollW = $('.marqueenBox').width() > scrolldom.width() ? $('.marqueenBox').width() : scrolldom.width();
		var duration = (scrollW/speed).toFixed(2);
		var marqueenJg = screenbpdata.getlocalval('marqueenjg');
		if(marqueenJg==null){
			marqueenJg = 10;
		}
		//滚动
		scrolldom.removeClass('hide').transition({ 
		  x: -scrollW, 
		  duration:duration*1e3, 
		  easing: 'linear', 
		  complete: function(){
				scrolldom.addClass('hide').transition({x:$('.marqueenBox').width()});
				if(self.marqueenRun){
					self.marqueentimer = setTimeout(function(){
						self.marqueenScroll(scrolldom);
					},marqueenJg*1e3);
				}
		  } 
		});
	},
	hideMarqueen:function(){
		var self = this;
		self.marqueenRun = false;
		$(".marqueenBox").remove();
		clearTimeout(self.marqueentimer);
	},
	showMarqueen:function(){
		var self = this;
		self.marqueenRun = true;
		self.initmarqueenTxt();
	},
	startLoop:function(delay){
		var self = this;
		if(!self.isloop) return;
		setTimeout(function(){
			self.loopRun();
		}, delay||self.loopdelay);
	},
	stopLoop:function(){
		var self = this;
		self.isloop = false;
		if(self.looprunTimer!=null){
			clearTimeout(self.looprunTimer);
		}
	},
	reLoop:function(time){
		var self = this;
		self.isloop = true;
		self.startLoop(time);
	},
	loopRun:function(){
		var self = this;
		var contentsbox = $('.baping-contentsbox');
		var contentbox = $('.baping-contents');
		if(contentbox.outerHeight() >= contentsbox.outerHeight()){
			var firstdom = contentbox.find('li').first(),scrollH = firstdom.outerHeight(true);
			contentbox.css({
			 "transform": "translate3d(0," + -scrollH + "px,0)",
			 "transition": "transform .5s linear"
			})
			setTimeout(function() {
				if(self.newmsgsList.length>0){
					var firstMsg = self.newmsgsList.shift();
					var html =  self.msgRender(firstMsg);
					//self.addAnimation($(html))
					if(contentbox.find('li').length>3){
						//追加成第4条
						contentbox.find('li').eq(3).after($(html));
					}else{
						//直接追加
						contentbox.append($(html));
					}
					firstdom.remove();
					contentbox.css({
						"transform": "translate3d(0,0,0)",
						"transition": "none"
					})
				}else{
					if(self.msgsList.length>0){
						var firstMsg = self.msgsList.shift();
						self.msgsList.push(firstMsg);
						var html =  self.msgRender(firstMsg);
						if($('.msg-' + firstMsg.id).length<=1){
							contentbox.append($(html));
						}
					}
					firstdom.remove();
					contentbox.css({
						"transform": "translate3d(0,0,0)",
						"transition": "none"
					})
				}
			}, 550);
		}else{
		  if(self.newmsgsList.length>0){
			var firstMsg = self.newmsgsList.shift();
			var html =  self.msgRender(firstMsg);
			$('.msg-' + firstMsg.id).length<=0&&contentbox.append($(html));
		  }else{
			if(self.msgsList.length>0){
				var firstMsg = self.msgsList.shift();
				self.msgsList.push(firstMsg);
				var html =  self.msgRender(firstMsg);
				$('.msg-' + firstMsg.id).length<=0&&contentbox.append($(html));
			}
		  }
		}
		if(self.msgsList.length>self.loopnum){
			var minId = Math.min.apply(Math, self.msgsList.map(function(o) {return o.id}));
			var msgIndex = self.isExists(minId);
			if(msgIndex!=-1) self.msgsList.splice(msgIndex,1);
		}
		self.looprunTimer = setTimeout(function(){
			self.loopRun();
		},self.loopdelay);
	},
	addAnimation:function(obj){
		return obj.transition({scale: 0.3 },100).transition({scale:1},120);
	},
	addOneMsgs:function(data){
		var self = this,isreshow = (data.isreshow?data.isreshow:'2');
		if(self.shownormal!='1'&& data.type < 3) return;
		if(isreshow=='2'){
			var msgIndex = self.isExists(data.id);
			if(msgIndex!=-1){
				return false;
			}
		}
		var addMsg = {
			id:data.id,
			type:data.type,
			content:(data.type=='1'?screencore.emoToimg(data.content):data.content),
			themeid:data.themeid?data.themeid:'0',
			nickname:data.nickname,
			avatar:data.avatar,
			sex:data.sex||'1',
			isreshow:isreshow,
			create_time:data.create_time,
		};
		if(addMsg.type > 2){
			self.bpMsgList.push(addMsg);
		} 
		if(isreshow=='2'){
			self.msgsList.push(addMsg);//oldmsg
			self.newmsgsList.push(addMsg);//newmsg
			if((addMsg.type=='2' || addMsg.type == '3') && screenbpdata.getlocalval('rightboxshow') != '2'){
				if( addMsg.type=='2' && (barConfig.sliderbox.fromtype=='1' || barConfig.sliderbox.fromtype=='3')){
					rightboxslider.add(addMsg.content);
					rightboxslider.listadd({id:addMsg.id,src:addMsg.content});
				}else{
					if(addMsg.type=='3' && barConfig.sliderbox.fromtype < 3 && (addMsg.content.bpimgs || addMsg.content.bpvideo)){
						if(addMsg.content.bpimgs){
							$.each(addMsg.content.bpimgs,function(i,v){
								rightboxslider.add(v);
							});
							rightboxslider.listadd({id:addMsg.id,src:addMsg.content.bpimgs});
						}
						if(addMsg.content.bpvideo){
							rightboxslider.add(addMsg.content.bpvideo.video+'.jpg');
							rightboxslider.listadd({id:addMsg.id,src:addMsg.content.bpvideo.video+'.jpg'});
						}
					}
				}
			}
		}
	},
	//删除第一次加载的消息
	delOldMsg:function(){
		var self = this;
		self.stopLoop();
		$(".baping-contents").find('li.from-historymsg').remove();
		$.each(self.oldmsg,function(i,v){
			if(!v) return true;
			self.delOneMsgs(v.id);
		});
		self.reLoop(2e3);
	},
	//删除非付费消息
	delNormalMsg:function(){
		var self = this;
		self.stopLoop();
		var allmsg = [];
		$(".baping-contents").find('li.normal-msg').remove();
		$.each(self.msgsList,function(i,v){
			(v.type=='1'||v.type=='2')&&allmsg.push(v);
		});
		$.each(allmsg,function(i,v){
			self.delOneMsgs(v.id);
		});
		self.reLoop(2e3);
	},
	isExists:function(msgid){
		var self = this;
		var msgindex = -1;
		for (var i = 0, len = self.msgsList.length; i < len; i++) {
			if (msgid == self.msgsList[i].id) {
				 msgindex = i;
				 break;
			}
		}	
		return msgindex;
	},
	isnewExists:function(msgid){
		var self = this;
		var newindex = -1;
		for (var i = 0, len = self.newmsgsList.length; i < len; i++) {
			if (msgid == self.newmsgsList[i].id) {
				 newindex = i;
				 break;
			}
		}	
		return newindex;
	},
	isholdExists:function(msgid){
		var self = this;
		var holdindex = -1;
		for (var i = 0, len = self.bpMsgList.length; i < len; i++) {
			if (msgid == self.bpMsgList[i].id) {
				 holdindex = i;
				 break;
			}
		}	
		return holdindex;
	},
	delOneMsgs: function(msgid) {
		var self = this;
		if ($('.msg-' + msgid).length > 0) {
			$('.msg-' + msgid).remove();
		}
		var msgIndex = self.isExists(msgid);
		//删除消息
		if(msgIndex!=-1){
			 self.msgsList.splice(msgIndex,1);
		}
		if ($('.msg-' + msgid).length > 0) {
			$('.msg-' + msgid).remove();
		}
		var newIndex = self.isnewExists(msgid); 
		if(newIndex!=-1){
			 self.newmsgsList.splice(newIndex,1);
		}
		//删除旧霸屏图
		screenbpdata.getlocalval('rightboxshow')!='2'&&rightboxslider.del(msgid);
		var holdIndex = self.isholdExists(msgid);
		//删除霸屏
		if(holdIndex!=-1){
			 self.bpMsgList.splice(holdIndex,1);
		}else{
			 if ($('.holdScreenId-'+msgid).length > 0) {
				 var remainTime = $('.holdScreenId-'+msgid).find('.bpTime').text();
				 if(parseInt(remainTime)>1){
					 self.closeholdscreen(msgid);
				 }
			 }
		}
	},
	resetMsg:function(){
		var self = this;
		self.msgsList = [];
		self.newmsgsList = [];
		$(".baping-contents").empty();
		rightboxslider.reset([]);
	},
	pollholdscreen:function(){
		var self = this;
		if(!self.ishold && self.bpMsgList.length>0){
			var bpparams = self.bpMsgList.shift();
			self.ishold = true;
			if(bpparams.type=='3'){
				var bpshowingId = localStorage.getItem('bpshowingId');
				if(bpshowingId!=null&&bpparams.id==bpshowingId){
					var bpshowingTime = localStorage.getItem('bpshowingTime');
					if(bpshowingTime!=null){ 
						bpparams.content.realbptime = bpshowingTime;
					}
				}
				var holddom =  self.holdscreenRender(bpparams);
				self.createHoldScreen(bpparams,holddom,function(){
					self.createSoonBox({nickname:bpparams.nickname,avatar:bpparams.avatar},function(){
						self.beforeHoldScreen(bpparams.themeid,10,function(){
								self.createHoldScreenBg(bpparams.themeid,function(){
										self.showHoldScreen(bpparams);
								});
						});
					});
				});
			}else if(bpparams.type=='4'){//打赏
				self.createHoldDs(bpparams);
			}else if(bpparams.type=='5'){//打赏
				self.createHoldHb(bpparams);
			}else if(bpparams.type=='6'){//点歌
				var holddom =  self.songRender(bpparams);
				self.createHoldSong(bpparams,holddom,function(){
					self.createHoldSongBg(function(){
						self.showHoldSong(bpparams);
					});
				});
			}
		}else{
			setTimeout(function () {
				self.pollholdscreen();
			},2e3)
		}
	},
	soonrandomId:function(){
		return ('soonbox-'+Math.random()+new Date().getTime()).replace('.','');
	},
	createSoonBox:function(params,func){
		var self = this;
		self.soonid =  self.soonrandomId();
		//var obj = $.extend({}, params, soonholdconfig);
		params.soonid = self.soonid;
		$('.full-main').append(self.soonholdRender(params));
		$('.'+self.soonid).show();
		setTimeout(function(){
			$('.'+self.soonid).remove();
			func && func();
		},3e3);
	},
	createHoldScreenBg:function(themeid,func){
		var self = this;
		var videoEle = $("."+self.holdid).find('.bpCover video')[0];
		var videosrc = screenbpdata.allData.allVideos['bpbgvideos'][themeid];
		if(!screenbpdata.allData.allVideos['bpbgvideosdata']||!screenbpdata.allData.allVideos['bpbgvideosdata']['theme'+themeid]){
			$('#bpVideoBg').remove();
			func&&func();
			return;
		}
		var videodata = screenbpdata.allData.allVideos['bpbgvideosdata']['theme'+themeid];
		if(screenbpdata.getlocalval('bpbgvideo')=='2'||videoEle.length<=0){
			$('#bpVideoBg').remove();
			func&&func();
			return;
		}
		$(videoEle).attr({src: videosrc});
		videocontrol.fullScreen($('#bpVideoBg video')[0], videodata, $('#bpVideoBg')[0]);
		if ($('#bpVideoBg video').length > 0){
			screenbpdata.getlocalval('bpbgvideovoice')!='1'?$('#bpVideoBg video').prop('muted',true):$('#bpVideoBg video').prop('muted',(self.autoplay?false:true));//关闭音量
		}
		func&&func();
	},
	createHoldScreen:function(params,tpldom,func){
		var self = this;
		self.holdid = self.randomId();
		var holdBox = $(tpldom);
		//创建霸屏背景video
		screenbpdata.getlocalval('bpbgvideo')!='2'&&holdBox.find('.bpCover').html('<div id="bpVideoBg"><video  loop="loop"></video></div>');
		holdBox.addClass(self.holdid);
		holdBox.addClass('holdScreenId-'+params.id);
		if (params.content.bpimgs) {
			 var imgleftBox = $('<div class="newBp"></div>');
			 var imgBox = $('<div id="newBpImageBox"></div>');
			 var imgani = $('<div id="hehe"></div>');
			 imgleftBox.append(imgBox);
			 imgleftBox.find("#newBpImageBox").append(imgani);
			 var $imghtml = '';
			 $.each(params.content.bpimgs,function(i,v){
				 if(i==0){
					 $css = '';
					 if(params.content.bpimgs.length>1) $css = 'pos';
					 $imghtml += '<img class="newBpImage '+$css+'" src="' + v + '" onload="fullshowImg(this)" />';
				 }else{
					 $imghtml += '<img class="newBpImage hide" src="' + v + '" />';
				 }
			 });
			 imgleftBox.find("#hehe").append($imghtml);
			 holdBox.find(".newBpMain").prepend(imgleftBox);
		} 
		if (params.content.bpvideo) {
			 var imgleftBox = $('<div class="newBp"></div>');
			 var imgBox = $('<div id="newBpImageBox"></div>');
			 imgleftBox.append(imgBox);
			 var $imghtml = '<video id="newBpVideo"  loop="loop" poster="' + params.content.bpvideo.video + '.jpg"></video>';
			 imgleftBox.find("#newBpImageBox").append($imghtml);
			 holdBox.find(".newBpMain").prepend(imgleftBox);
		} 
		$('body').append(holdBox);
		if (params.content.bpvideo) {
			self.bpvideoisLoad = false;
			self.loadVideo($('#newBpVideo'),params.content.bpvideo.video);
		}
		if(params.content.realbptime) $("."+self.holdid).find(".bpTime").text(params.content.realbptime);
		func&&func();
	},
	beforeTimer:null,
	/*提前加载了直接播放*/
	beforeHoldScreen: function(themeid, time, callback) {
			var self = this;
			$('#beforeBpBox').remove();
			var bpbeforevideo = screenbpdata.getlocalval('bpbeforevideo');
			if (bpbeforevideo=='2') {
				callback();
				return;
			}
			var videosrc = screenbpdata.allData.allVideos['bpbeforevideos'][themeid];
			if(!screenbpdata.allData.allVideos['bpbeforevideosdata']||!screenbpdata.allData.allVideos['bpbeforevideosdata']['theme'+themeid]){
				callback();
				return;
			}
			var videodata = screenbpdata.allData.allVideos['bpbeforevideosdata']['theme'+themeid];
            var html = '<div id="beforeBpBox"><video  autoplay loop id="beforeBpVideo" src="' + videosrc + '"></video></div>';
            $(html).appendTo($('.pc-box .full-main'));
            videocontrol.fullScreen($('#beforeBpBox video')[0], videodata, $('#beforeBpBox')[0]);
            if ($('#beforeBpBox video').length > 0){
                screenbpdata.getlocalval('bpbeforevideovoice')!='1'?$('#beforeBpBox video').prop('muted',true):$('#beforeBpBox video').prop('muted',(self.autoplay?false:true));//关闭音量
			}
			self.beforeTimer = setTimeout(function() {
				callback();
				setTimeout(function() {
					var videoDom = $('#beforeBpBox video');
					if (videoDom.length > 0){
						!videoDom[0].paused&&videoDom.trigger('pause');
					}
					$('#beforeBpBox').remove();
				}, 500);
			},videodata.time*1e3);//time*1e3
	},
	showHoldScreen:function(params){
		var self = this;
		if($('#bpVideoBg video').length>0){
			$('#bpVideoBg video')[0].play();
		}
		//播放霸屏视频
		if (params.content.bpvideo) {
			if(!self.bpvideoisLoad){//视频暂未加载完成
				self.loadVideo($('#newBpVideo'),params.content.bpvideo.video, function() {
					$('#newBpVideo').prop('muted',true);//关闭音量
					screenbpdata.getlocalval('bpvideovoice')!='1'?$('#newBpVideo').prop('muted',true):$('#newBpVideo').prop('muted',(self.autoplay?false:true));//关闭音量
					$('#newBpVideo')[0].play();
					self.bVideo($('#newBpVideo')[0]);
				});
			}else{
				$('#newBpVideo').prop('muted',true);//关闭音量
				screenbpdata.getlocalval('bpvideovoice')!='1'?$('#newBpVideo').prop('muted',true):$('#newBpVideo').prop('muted',(self.autoplay?false:true));//关闭音量
				$('#newBpVideo')[0].play();
				self.bVideo($('#newBpVideo')[0]);
			}
		}
		//显示霸屏图层
		$('.'+self.holdid).removeClass('hide').addClass('show');
		//文字效果
		if (params.content.bptxt!='') {
			var textType = 'type1';
			if(params.content.bpimgs||params.content.bpvideo){
				textType = 'type3';
			}
			self.fontAnimate(textType);
		}
		//霸屏倒计时
		self.countBptime(params);
	},
	holdtimer1: null,
    holdtimer2: null,
    holdtimer3: null,
	countBptime:function(params){
		var self = this;
		clearTimeout(self.holdtimer1);
		clearTimeout(self.holdtimer2);
		clearTimeout(self.holdtimer3);
		var showTime = params.content.realbptime?parseInt(params.content.realbptime):parseInt(params.content.bptime);
		var timeBox = $("."+self.holdid).find(".bpTime");
		self.holdtimer1 = setTimeout(function() {
			self.holdtimer2 = setTimeout(function() {
					showTime--;
					if (showTime == -1) {
						localStorage.removeItem('bpshowingTime');
						localStorage.removeItem('bpshowingId');
						self.closeholdscreen(params.id);
						return;
					}
					localStorage.setItem('bpshowingTime',showTime);
					localStorage.setItem('bpshowingId', params.id);
					timeBox.text(showTime);
					self.holdtimer3 = setTimeout(arguments.callee, 1e3);
			}, 1e3);
		}, 1e3);
	},
	delbp:function(msgid){
		if(msgid==null) return;
			screencore.ajaxSubmit("/screen/baping/delbp",{msgid:msgid}).then(function(data){
		},function(){
			layerBox.showMsg('删除霸屏出错');
		});
	},
	closeholdscreen:function(msgid){
		var self = this;
		//清除霸屏计时器
		clearTimeout(self.holdtimer1);
		clearTimeout(self.holdtimer2);
		clearTimeout(self.holdtimer3);
		//清除文字定时器
		clearTimeout(self.fontTimer1);
		clearTimeout(self.fontTimer2);
		clearTimeout(self.fontTimer3);
		//暂停前置视频
		clearTimeout(self.beforeTimer);
		var videoDom = $('#beforeBpBox video');
		if (videoDom.length > 0){
			!videoDom[0].paused&&videoDom.trigger('pause');
			$('#beforeBpBox').remove();
		}
		//暂停背景视频
		var videoDom1 = $('#bpVideoBg video');
		if (videoDom1.length > 0){
			!videoDom1[0].paused&&videoDom1.trigger('pause');
		}
		//暂停上传视频
		var videoDom2 = $('#newBpVideo');
		if (videoDom2.length > 0){
			!videoDom2[0].paused&&videoDom2.trigger('pause');
		}
		self.sliderObj&&self.sliderObj.close();//关闭单张动画
		self.autoShowImgs&&clearTimeout(self.autoShowImgs);//关闭多张动画
		self.delbp(msgid);//从缓存中删除此霸屏
		$("."+self.holdid).remove();
		$('.'+self.soonid).remove();
		self.ishold = false;
		setTimeout(function () {
			self.pollholdscreen();
		},1e3);
	},
	fontTimer1:null,
	fontTimer2:null,
	fontTimer3:null,
	fontAnimate: function(type) {
			var self = this;
			clearTimeout(self.fontTimer1);
			clearTimeout(self.fontTimer2);
			clearTimeout(self.fontTimer3);
            var fontSize = screenbpdata.getlocalval('bpfontsize');
			if(fontSize==null) fontSize = '1';
            fontSize = 'size' + fontSize;
            var color = ['rgba(255,162,0,', 'rgba(255,255,255,'];
            var val = $.trim($('#newBpMsg').text());
            val = [...val];//Array.from(val);
            var len = val.length;
            if (val.length == 0){
				return;
			}
            var html = '';
            var cname = type + ' ' + fontSize + ' ';
            if (len <= 2){
                cname += 'less2';
            }else if (len <= 4){
                cname += 'less4';
            }else if (len <= 6){
                cname += 'less6';
			}else if (len <= 8){
				cname += 'less8';
			}else if (len <= 18){
				cname += 'less18';
			}else if (len <= 24){
				cname += 'less24';
			}else if (len <= 36){
				cname += 'less36';
			}else if (len <= 44){
				cname += 'less44';
			}else if (len <= 52){
				cname += 'less52';
			}else if (len <= 60){
				cname += 'less60';
			}else if (len <= 68){
				cname += 'less68';
			}else{
				cname += 'mini';
			}
			var bpfontstyle = screenbpdata.getlocalval('bpfontstyle');
			if (bpfontstyle!=null&&bpfontstyle!='normal') {
				 cname += ' ' + bpfontstyle;
			}
            $.each(val,function(i,v){
            	html += '<span class="oneFont ' + cname + '">' + v + '</span>';
            });
            $('#newBpMsg').html(html);
            self.fontTimer1 = setTimeout(function() {
                var word = $('#newBpMsg .oneFont'),x = 0;
                self.fontTimer2 = setTimeout(function() {
                    $(word[x]).css({'transition':'0.3s all','transform':'translate3d(0,0,0) scale(1)','opacity':1});
                    x++;
					self.fontTimer3 = setTimeout(arguments.callee, 50);
                    if (x >= word.length){
						clearTimeout(self.fontTimer1);
						clearTimeout(self.fontTimer2);
						clearTimeout(self.fontTimer3);
					}
                }, 100);
            }, 50);
    },
	randomId:function(){
		return ('pc-holdscreen-'+Math.random()+new Date().getTime()).replace('.','');
	},
	createHoldDs:function(params){
		var self = this;
		$(".main-box,.hdQrbox").addClass('dsshowing');
		self.holdid = self.randomId();
		params.giftpcwebp = dsgift[params.content.themeid];
		var holddom =  self.dsRender(params);
		var holdBox = $(holddom);
		holdBox.addClass(self.holdid);
		holdBox.addClass('holdScreenId-'+params.id);
		self.loadOneImage(params.giftpcwebp,function(){
			$('body').append(holdBox);
			var dsbptime = params.content.bptime||30;
			self.dstimer = setInterval(function() {
				dsbptime--;
				if(dsbptime < 0){
					clearInterval(self.dstimer);
					self.closeds(params.id);
				}
			}, 1e3);
		});
	},
	closeds:function(msgid){
		var self = this;
		clearInterval(self.dstimer);
		self.delbp(msgid);//从缓存中删除此霸屏
		$(".main-box,.hdQrbox").removeClass('dsshowing');
		$("."+self.holdid).remove();
		self.ishold = false;
		setTimeout(function () {
			self.pollholdscreen();
		},1e3);
	},
	createHoldHb:function(params){
		var self = this;
		$(".main-box,.hdQrbox").addClass('dsshowing');
		self.holdid = self.randomId();
		//params.giftpcwebp = dsgift[params.content.themeid];
		var holddom =  self.hbRender(params);
		var holdBox = $(holddom);
		holdBox.addClass(self.holdid);
		holdBox.addClass('holdScreenId-'+params.id);
		//self.loadOneImage(params.giftpcwebp,function(){
			$('body').append(holdBox);
			var hbbptime = 10;
			self.hbtimer = setInterval(function() {
				hbbptime--;
				if(hbbptime < 0){
					clearInterval(self.hbtimer);
					self.closehb(params.id);
				}
			}, 1e3);
		//});
	},
	closehb:function(msgid){
		var self = this;
		clearInterval(self.hbtimer);
		self.delbp(msgid);//从缓存中删除此霸屏
		$(".main-box,.hdQrbox").removeClass('dsshowing');
		$("."+self.holdid).remove();
		self.ishold = false;
		setTimeout(function () {
			self.pollholdscreen();
		},1e3);
	},
	createHoldSong:function(params,tpldom,func){
		var self = this;
		self.holdid = self.randomId();
		var holdBox = $(tpldom);
		holdBox.addClass(self.holdid);
		holdBox.addClass('holdScreenId-'+params.id);
		$('body').append(holdBox);
		func&&func();
	},
	createHoldSongBg:function(func){
		var self = this;
		var html = '<video muted="" src="" loop="loop" class="songbg display-none"></video>';
        $(html).appendTo($("."+self.holdid));
		var videoEle = $("."+self.holdid).find('.songbg');
		var videosrc = screenbpdata.allData.allVideos['songbgvideo'];
		if(!screenbpdata.allData.allVideos['songbgvideodata']||!screenbpdata.allData.allVideos['songbgvideodata'][0]){
			func&&func();
			return;
		}
		videoEle.attr({src: videosrc});
		videoEle.removeClass('display-none');
		var videodata = screenbpdata.allData.allVideos['songbgvideodata'][0];
		videocontrol.fullScreen(videoEle[0], videodata, $("."+self.holdid)[0]);
		func&&func();
	},
	showHoldSong:function(params){
		var self = this;
		if($("."+self.holdid).find('.songbg').length>0){
			$("."+self.holdid).find('.songbg')[0].play();
		}
		$(".pcbgBox").css('opacity','0');
		$(".main-box,.hdQrbox").addClass('dsshowing');
		$('.'+self.holdid).removeClass('hide').addClass('show');
		var songbptime = params.content.bptime||30;
		self.songtimer = setInterval(function() {
			songbptime--;
			if(songbptime < 0){
				$(".pcbgBox").css('opacity','1');
				clearInterval(self.songtimer);
				self.closesong(params.id);
			}
		}, 1e3);
	},
	closesong:function(msgid){
		var self = this;
		clearInterval(self.songtimer);
		$(".main-box,.hdQrbox").removeClass('dsshowing');
		self.delbp(msgid);//从缓存中删除此霸屏
		$("."+self.holdid).remove();
		self.ishold = false;
		setTimeout(function () {
			self.pollholdscreen();
		},1e3);
	},
	fullshowImg:function(e){
		var self = this;
		if($(e.parentNode).find('.newBpImage').length>1) return this.fullshowImgwithAnimation(e);
		if(self.forceimgmaxheight=='2' && e.naturalWidth/e.naturalHeight>=1){
			$(e.parentNode).css({width:self.imgmaxwidth});
			$(e.parentNode).addClass('zam-app-flex-ajCenter2');
			$(e).css({width:'100%'});				
		}else{
			var w = $('body').height()*(e.naturalWidth/e.naturalHeight);
			$(e.parentNode).css({width:w});
			$(e).css({height:'100%',width:"auto"});	
		}
		var closebpAnimate = screenbpdata.getlocalval('closebpAnimate');
        if (closebpAnimate=='2') return;
		$(e).css({'visibility':'hidden'});
		this.sliderObj = new slideranimate({
			hasOffset:false,
			isNew:true,
			img:$('.newBpImage')[0],
			box:$('#hehe')[0],
			offsetX:0,
			offsetY:0,
			firstDelay:500	
		});	
		this.sliderObj.auto();	
	},
	fullshowImgwithAnimation:function(e){
		$(e).addClass('show');
		this.showOne(e);	
		setTimeout(function(){
			$(e.parentNode).css({transition:'all 0.5s'});	
		},1000);
	},
	showOne:function(e){
		var self = this;
		$(e).addClass('isshowing');
		if(self.forceimgmaxheight=='2' && e.naturalWidth/e.naturalHeight>=1){
			$(e.parentNode).css({width:self.imgmaxwidth});
			$(e).css({width:'100%'});		
		}else{
			var w = $('body').height()*(e.naturalWidth/e.naturalHeight);
			$(e.parentNode).css({width:w});
			$(e).css({height:'100%'});
		}
		$(e).css({
			visibility: 'visible'
		});
		this.autoShowImgs = setTimeout(function(){
			$(e).removeClass('isshowing');
			$(e).removeClass('show').addClass('remove');
			var arr = $(e.parentNode).find('.newBpImage');
			var index = $(e).index()+1;
			index = index>=arr.length?0:index;
			var newImg = arr[index];
			$(newImg).addClass('show');
			self.showOne(newImg);
			setTimeout(function(){
				$(e).removeClass('remove show').css({visibility:'hidden'});	
			},1000)
		},6000);
	},
	loadVideo: function(videoEle,url,callback) {
		var self = this;
		self.bpvideoisLoad = false;
		videoEle = videoEle.length > 0 ? videoEle[0] : videoEle;
		$(videoEle).unbind('canplaythrough error stalled');
		$(videoEle).bind('canplaythrough', function() {
			$(videoEle).unbind('canplaythrough error stalled');
			self.bpvideoisLoad = true;
			callback && callback();
		}).bind('error stalled', function() {
			$(videoEle).unbind('canplaythrough error stalled');
			self.bpvideoisLoad = true;
			callback && callback();
		});
		$(videoEle).attr({src: url});
		videoEle.load();
    },
	bVideo: function(e, flag) {
		if ($(e).width() / $(e).height() >= 1) {
			if (flag != null || flag == true) {
				$(e).css({width: 700});
			} else {
				$(e).css({width: 900});
			}
		} else {
			$(e).css({height: '100%'});
		}
    },
	msgResetOrderByTime:function(){
		var self = this;
		if(!self.msgreset) return;
		var rollInit = function(isfirst){
			if(isfirst&&self.msgsList.length>0){
				self.msgsList.sort(self.sortBy('id'));
			}
			setTimeout(function(){
				rollInit(true);
			},self.msgresetDelay);
		};
		rollInit(false);
	},
	sortBy: function(attr,rev){
        //第二个参数没有传递 默认升序排列
        if(rev ==  undefined){
            rev = 1;
        }else{
            rev = (rev) ? 1 : -1;
        }
        return function(a,b){
            a = parseInt(a[attr]);
            b = parseInt(b[attr]);
            if(a < b){
                return rev * -1;
            }
            if(a > b){
                return rev * 1;
            }
            return 0;
        }
    },
	loadOneImage:function(src,fn){
		if(!src || src.length == 0){
			return fn()
		}
		var img = new Image();
		img.onload = img.onerror = function(){
			if(fn){
				fn();
			}
		}
		img.src = src;
	},
	autoplay:true,
	testAutoPlay:function () {
		return new Promise(resolve => {
			var audio = document.createElement('audio');
			audio.src = '/static/images/screen/common/empty.mp3';
			audio.load();
			document.body.appendChild(audio);
			var autoplay = false;
			audio.addEventListener('canplay',function(){ 
				// play返回的是一个promise
				audio.play().then(() => {
					autoplay = true;
				}).catch(err => {
					autoplay = false;
				}).finally(() => {
					audio.remove();
					resolve(autoplay);
				});
			});
		});
	},
};
return screenbp;
});
