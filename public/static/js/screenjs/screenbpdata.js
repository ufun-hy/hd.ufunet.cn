define('screenbpdata',['require','jquery','template','ionrangeslider','onoffswitchauto','colorPicker'],function(require,$,template){
var screenbpdata = {
	leftcontrolTpl:null,
	//初始化基础数据
	//switch 与 btn default必须是字符串
	allData:{
		allImages:{
			bgimgs:[],
			bpzhutiimgs:[],
			bpconfigimgs:[],
		},
		allVideos:{
			bgvideos:[],
			bpbgvideos:[],
			bpbeforevideos:[],
		},
		leftcontrol:{
			bardata:{	
				title:'标题设置',
				modulekey:'bardata',
				data:{
					barname:{	
						title:'标题内容',
						name:'barname',
						moduletype:'input',
						default:barConfig.barinfo.title,
						val:'',
						inputtype:'text',
					},
				},
			},
			showdata:{	
				title:'显示效果',
				modulekey:'showdata',
				data:{
					bgtype:{	
						title:'背景类型',
						name:'bgtype',
						moduletype:'btn',
						default:barConfig.bgtype||'1',
						val:'',
						inputtype:'hidden',
						values:[{title:'图片',val:'1'},{title:'视频',val:'2'},{title:'黑色',val:'3'},{title:'无',val:'0'}]
					},
					screenlight:{	
						title:'大屏亮度',
						name:'screenlight',
						moduletype:'range',
						default:10,
						val:'',
						inputtype:'range',
						attr:{min:1,max:10},
					},
					msglight:{	
						title:'消息背景亮度',
						name:'msglight',
						moduletype:'range',
						default:8,
						val:'',
						inputtype:'range',
						attr:{min:1,max:10},
					},
					/*bgcanvas:{	
						title:'粒子效果',
						name:'bgcanvas',
						moduletype:'btn',
						default:1,
						val:'',
						inputtype:'hidden',
						values:[{title:'雪花',val:'1'},{title:'五星',val:'2'},{title:'圆点',val:'3'},{title:'无',val:'0'}]
					},*/
					bpbeforevideo:{	
						title:'霸屏前置视频',
						name:'bpbeforevideo',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
					bpbeforevideovoice:{	
						title:'霸屏前置视频声音',
						name:'bpbeforevideovoice',
						moduletype:'switch',
						default:'2',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
					bpbgvideo:{	
						title:'霸屏背景视频',
						name:'bpbgvideo',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
					bpbgvideovoice:{	
						title:'霸屏背景视频声音',
						name:'bpbgvideovoice',
						moduletype:'switch',
						default:'2',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
					bpcoverlight:{	
						title:'(关闭背景视频后)霸屏背景亮度',
						name:'bpcoverlight',
						moduletype:'range',
						default:0,
						val:'',
						inputtype:'range',
						attr:{min:0,max:10},
					},
					closebpAnimate:{	
						title:'霸屏图片特效',
						name:'closebpAnimate',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
					bpvideovoice:{	
						title:'霸屏视频声音',
						name:'bpvideovoice',
						moduletype:'switch',
						default:'2',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
					bpfontstyle:{	
						title:'霸屏文字字体',
						name:'bpfontstyle',
						moduletype:'btn',
						default:'normal',
						val:'',
						inputtype:'hidden',
						values:barConfig.bpfontstyle
					},
					bpfontsize:{	
						title:'霸屏文字大小',
						name:'bpfontsize',
						moduletype:'btn',
						default:'1',
						val:'',
						inputtype:'hidden',
						values:[{title:'大号',val:'0'},{title:'中号',val:'1'},{title:'小号',val:'2'}]
					},
					holdfontcolor:{//弹窗是霸屏文字颜色
						title:'霸屏效果文字颜色',
						name:'holdfontcolor',
						moduletype:'color',
						default:'#ffa200',
						val:'',
						inputtype:'color',
					},
					rightboxshow:{	
						title:'大屏右侧轮播图/壕榜',
						name:'rightboxshow',
						moduletype:'btn',
						default:'1',
						val:'',
						inputtype:'hidden',
						values:[{title:'轮播图',val:'1'},{title:'土豪榜',val:'2'},{title:'关闭',val:'0'}]
					},
				},
			},
			msgdata:{
				title:'大屏消息',
				modulekey:'msgdata',
				data:{
					showmsgbox:{	
						title:'显示滚动消息',
						name:'showmsgbox',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'显示','textOff':'隐藏'}
					},
					normalfontcolor:{	
						title:'普通消息颜色',
						name:'normalfontcolor',
						moduletype:'color',
						default:'#8bd7ff',
						val:'',
						inputtype:'color',
					},
					bpfontcolor:{	
						title:'霸屏消息颜色',
						name:'bpfontcolor',
						moduletype:'color',
						default:'#ffa200',
						val:'',
						inputtype:'color',
					},
					msgfontsize:{	
						title:'消息字体大小',
						name:'msgfontsize',
						moduletype:'range',
						default:40,
						val:'',
						inputtype:'range',
						attr:{min:20,max:($(".full-main").height() > 800 ? 500 : 60)},
					},
					msgimgsize:{
						title:'消息图片大小',
						name:'msgimgsize',
						moduletype:'range',
						default:200,
						val:'',
						inputtype:'range',
						attr:{min:50,max:($(".full-main").height() > 800 ? 1000 : 400)},
					},
					showmsgtime:{	
						title:'显示消息时间',
						name:'showmsgtime',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'显示','textOff':'隐藏'}
					},
					msglooproll:{
						title:'消息滚动',
						name:'msglooproll',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
					msglooptime:{
						title:'滚动间隔时间',
						name:'msglooptime',
						moduletype:'range',
						default:5,
						val:'',
						inputtype:'range',
						attr:{min:1,max:10},
					},
					msgloopnum:{
						title:'最大消息数',
						name:'msgloopnum',
						moduletype:'range',
						default:20,
						val:'',
						inputtype:'range',
						attr:{min:4,max:20},
					},
					loadhistory:{
						title:'加载历史消息',
						name:'loadhistory',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
					shownormal:{
						title:'展示普通消息',
						name:'shownormal',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
				}
			},
			marqueendata:{
				title:'通告通知',
				modulekey:'marqueendata',
				data:{
					showmarqueen:{	
						title:'公告状态',
						name:'showmarqueen',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
					marqueenspeed:{	
						title:'公告滚动速度',
						name:'marqueenspeed',
						moduletype:'range',
						default:2,
						val:'',
						inputtype:'range',
						attr:{min:1,max:($(".full-main").height() > 800 ? 50 : 6)},
					},
					marqueenjg:{	
						title:'公告滚动间隔时间',
						name:'marqueenjg',
						moduletype:'range',
						default:10,
						val:'',
						inputtype:'range',
						attr:{min:5,max:25},
					},
					marqueensize:{	
						title:'公告文字大小',
						name:'marqueensize',
						moduletype:'range',
						default:40,
						val:'',
						inputtype:'range',
						attr:{min:20,max:60},
					},
					marqueencolor:{//弹窗是霸屏文字颜色
						title:'公告文字颜色',
						name:'marqueencolor',
						moduletype:'color',
						default:'#ffffff',
						val:'',
						inputtype:'color',
					},
				}
			},
			keyworddata:{
				title:'快捷方式',
				modulekey:'keyworddata',
				data:{
					syskeyword:{	
						title:'系统快捷键',
						name:'syskeyword',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'开启','textOff':'关闭'}
					},
					moduleboxshow:{	
						title:'底部功能菜单',
						name:'moduleboxshow',
						moduletype:'switch',
						default:'1',
						val:'',
						inputtype:'checkbox',
						attr:{'textOn':'显示','textOff':'隐藏'}
					},
				}
			}
		}
	},
	totalLenth:0,
	loadedLenth:0,
	init: function(func) {
		var self = this;
		self.allData.allImages['bgimgs'] = barConfig.bgimgs;
		self.allData.allImages['bpconfigimgs'] = barConfig.configimg;
		self.allData.allImages['bpzhutiimgs'] = bpZhuti.zhutiimgs;
		self.allData.allImages['soonholdimgs'] = soonholdimgs;
		for(var i in self.allData.allImages){
			if($.isArray(self.allData.allImages[i])){
				self.totalLenth += self.allData.allImages[i].length;
			}else{
				self.totalLenth++;
			}
        }
        self.allData.allVideos['bgvideos'] = barConfig.bgvideos;
        self.totalLenth += barConfig.bgvideos.length;
		self.allData.allVideos['bpbgvideos'] = bpZhuti.bgvideos;
		self.totalLenth += Object.keys(bpZhuti.bgvideos).length;
		self.allData.allVideos['bpbeforevideos'] = bpZhuti.beforevideos;
		self.totalLenth += Object.keys(bpZhuti.beforevideos).length;
		self.allData.allVideos['songbgvideo'] = songbgvideo;
		self.totalLenth++;
		setTimeout(function(){
				self.preloadImages({
					onComplete:function(){
						self.preloadVideosAll(['bgvideos','bpbgvideos','bpbeforevideos','songbgvideo'],function(){
							self.initleftControl();
							$(".loading-box .load-percent").text('100%');
							$(".load-progress span").css('width','100%');
							func&&func();
						});
					}
				});
	        
		},1e3);
		self.leftresize();
		$(window).bind('resize', function () {
			self.leftresize();
		});
	},
	initleftControl:function(){
		var self = this;
		self.initleftControlval();
		var leftcontrolHtml = ''
		self.leftcontrolTpl = template('leftcontrolItem-tpl');
		$.each(self.allData.leftcontrol,function(i,v){
			leftcontrolHtml += self.leftcontrolTpl(v);
		});
		$(".leftcontrolBox .leftcontrolMenu").html(leftcontrolHtml);
		self.leftControlEvent();
	},
	leftresize:function(){
		var self = this;
		//self.zoom = (window.innerHeight / 800).toFixed(2);
		//$(".leftcontrolBox").css({'zoom':'0.92'});
	},
	leftControlEvent:function(){
		var self = this;
		var index = -1;
		$(".leftcontrolBox").mouseenter(function(){
			//添加背景添加
			$(this).addClass("hover");
		}).mouseleave(function(){
			$(this).removeClass("hover");
		});
		$(".leftcontrolMenu").on('mouseenter','.leftcontrolMenu-item',function(){
			 var $this = $(this);
			 //重置子元素高度
			 $this.find('.leftcontrolMenu-sitem').removeClass('leftcontrolMenu-sitem-scroll');
			 $this.find('.leftcontrolMenu-sitem').css({"height":'auto'});
			 //父元素距离顶部高度即为子菜单最大上移高度
			 var maxstop = $this[0].offsetTop - 10;
			 //子元素总高度
			 var sitemH = $this.find('.leftcontrolMenu-sitem').outerHeight(true);
			 //获取body总高度
			 var sitemMaxH = window.innerHeight - 40;
			 if(sitemH>=sitemMaxH){//子元素高度比总高大 可滚动
				$this.find('.leftcontrolMenu-sitem').css({"height":sitemMaxH,'top':-maxstop});
				$this.find('.leftcontrolMenu-sitem').addClass('leftcontrolMenu-sitem-scroll');
			 }else{
				//父元素距离底部高度
				var sitembH = window.innerHeight - $this[0].offsetTop;
				if(sitembH>sitemH){//距离底部高度大于元素高
					$this.find('.leftcontrolMenu-sitem').css({'top':'-1px'});	
				}else{//距离底部高度小于元素高度
					var needtop = sitemH - sitembH + 10;
					$this.find('.leftcontrolMenu-sitem').css({'top':-needtop});
				}
			 }
			 $(this).addClass('on').siblings().removeClass("on");
			 index = $(this).index();
		});
		var ctime;
		$(".leftcontrolMenu").on('mouseleave','.leftcontrolMenu-item',function(){
			$(".leftcontrolMenu .on").removeClass("on");
			ctime = setTimeout(function(){
				$('.cp-color-picker').hide();
			},50);
		});
		$('body').on('mouseenter','.cp-color-picker',function(){
			clearTimeout(ctime);
			$(".leftcontrolBox").trigger('mouseenter');
			$(".leftcontrolBox").find(".leftcontrolMenu-item").eq(index).trigger('mouseenter');
		});
		$('body').on('mouseleave','.cp-color-picker',function(){
			$(this).hide();
			$(".leftcontrolBox").trigger('mouseleave');
			$(".leftcontrolBox").find(".leftcontrolMenu-item").eq(index).trigger('mouseleave');
		});
		//换方片
		$(".leftcontrolMenu").on('click','.leftcontrolMenu-item .leftcontrolMenu-sitem-btns span',function(){
			 var prevInput = $(this).parent().find('input');
			 var val = $(this).attr('data-type');
			 prevInput.val(val);
			 self.setval('leftcontrol',$('input[name="'+prevInput.attr('name')+'"]').attr('data-modulekey'),prevInput.attr('name'),val);
			 $(this).addClass('sel').siblings().removeClass("sel");
		});
		$(".leftcontrolMenu .js-range-slider").ionRangeSlider({onFinish: function (data) {
			var slidername = data.input[0].name;
			var val = data.from;
			self.setval('leftcontrol',$('input[name="'+slidername+'"]').attr('data-modulekey'),slidername,val);
		}});
		new DG.OnOffSwitchAuto({
			cls:'.leftcontrolMenu .on-off-switch',
			height:24,
			width:66,
			textOn:"",
			textOff:"",
			textSizeRatio:0.35,
			trackColorOn:'#4886ff',
			trackColorOff:'#dcdfe6',
			trackBorderColor:'transparent',
			textColorOff:'#fff',
			listener:function(name, checked){
				self.setval('leftcontrol',$('input[name="'+name+'"]').attr('data-modulekey'),name,checked?'1':'2');
			}
		});
		$('.leftcontrolBox .color').colorPicker({
			customBG: '#222',
			GPU:true,
			animationSpeed:100, // toggle animation speed
			cssAddon:'',
			renderCallback: function($elm, toggled) {
				self.setval('leftcontrol',$elm.attr('data-modulekey'),$elm.attr('data-name'),$elm[0].style.backgroundColor);
			},
			positionCallback:function($elm){
				var $UI = this.$UI,
					position = $elm.offset(),
					gap = this.color.options.gap;
					if(position.top+$UI._height<window.innerHeight){
						var top = (position.top+34);
						$UI.removeClass('colortop').addClass('colorbottom');
					}else{
						var top = (position.top -$UI._height - 7);
						$UI.removeClass('colorbottom').addClass('colortop');
					}
					return { // the object will be used as in $('.something').css({...});
						left: position.left,
						top: top,
					}
			},
		});
		var layerBox = require('layerBox');
		$(".leftcontrolBox").on("mouseenter", ".color", function() {
			var e = this;
			layerBox.showTips($(e).attr("lay-tips"),e,$(e).attr('lay-direction'));
		}).on("mouseleave", "*[lay-tips]", function() {
			layerBox.close($(this).data("index"));
		});
		$(".leftcontrolBox").on("input propertychange",".leftcontrolMenu-sitem-input .textInput", function() {
				self.setval('leftcontrol',$(this).attr('data-modulekey'),$(this).attr('name'),$(this).val());
		});
	},
	initleftControlval:function(){
		var self = this;
		$.each(self.allData.leftcontrol,function(i,v){
			$.each(v.data,function(key,item){
				item.val = item.default;
				var localval = self.getlocalval(key);
				if(localval!=null) item.val = localval;
				self.initleftControltoModule(key,item.val);
			});
		});
	},
	initleftControltoModule:function(key,val){
		if(key=='screenlight'){
			val = (10 - parseInt(val))/10;
			$("#screenlight").length>0?$("#screenlight").html('.screenlight{background-color:rgba(0,0,0,'+val+')}'):$("body").append('<style id="screenlight">.screenlight{background-color:rgba(0,0,0,'+val+')}</style>');
		}
		if(key=='msglight'){
			val = (10 - parseInt(val))/10;
			$("#msglight").length>0?$("#msglight").html('.baping-contents li{background-color:rgba(0,0,0,'+val+')}'):$("body").append('<style id="msglight">.baping-contents li{background-color:rgba(0,0,0,'+val+')}</style>');
		}
		if(key=='msgfontsize'){
			val = parseInt(val);
			$("#msgfontsize").length>0?$("#msgfontsize").html('.baping-item .msgText{font-size:'+val+'px}.baping-item .msgText .faceImg{width:'+(val+10)+'px}'):$("body").append('<style id="msgfontsize">.baping-item .msgText{font-size:'+val+'px}.baping-item .msgText .faceImg{width:'+(val+10)+'px}</style>');
		}
		if(key=='msgimgsize'){
			$("#msgimgsize").length>0?$("#msgimgsize").html('.baping-item .msgImage{width:'+val+'px}'):$("body").append('<style id="msgimgsize">.baping-item .msgImage{width:'+val+'px}</style>');
		}
		if(key=='showmsgtime'){
			var opacity = (val=='1'?'0.5':'0');
			$("#showmsgtime").length>0?$("#showmsgtime").html('.baping-item .msgTime{opacity:'+opacity+'}'):$("body").append('<style id="showmsgtime">.baping-item .msgTime{opacity:'+opacity+'}</style>');
		}
		if(key=='normalfontcolor'){
			$("#msgfontcolor").length>0?$("#msgfontcolor").html('.baping-item .msgText{color:'+val+'}'):$("body").append('<style id="msgfontcolor">.baping-item .msgText{color:'+val+'}</style>');
		}
		if(key=='bpfontcolor'){
			$("#bpfontcolor").length>0?$("#bpfontcolor").html('.baping-item .msgText.bpText{color:'+val+'}'):$("body").append('<style id="bpfontcolor">.baping-item .msgText.bpText{color:'+val+'}</style>');
		}
		if(key=='holdfontcolor'){
			$("#oneFont").length>0?$("#oneFont").html('.oneFont{color:'+val+'}'):$("body").append('<style id="oneFont">.oneFont{color:'+val+'}</style>');
		}
		if(key=='bpcoverlight'){
			val = (10 - parseInt(val))/10;
			$("#bpcoverlight").length>0?$("#bpcoverlight").html('.bpCover{background-color:rgba(0,0,0,'+val+')}'):$("body").append('<style id="bpcoverlight">.bpCover{background-color:rgba(0,0,0,'+val+')}</style>');
		}
	},
	getval:function(fkey,key,skey){
		var self = this;
		var val = self.getlocalval(skey);
		if(val!=null){
			return val;
		}else{
			return self.allData[fkey][key]['data'][skey].default;
		}
	},
	setval:function(fkey,key,skey,setval){
		var self = this;
		var screenbp = require('screenbp');
		var rightboxslider = require('rightboxslider');
		if(skey=='rightboxshow'){
			if(setval=='1'){
				$('.imageSliderBox').empty();
				rightboxslider.open2();
				$(".baping-contentsbox").removeClass('full');
				$(".baping-rightbox").addClass('show');
			}else if(setval=='2'){
				rightboxslider.tuhaolist.init();
				$(".baping-contentsbox").removeClass('full');
				$(".baping-rightbox").addClass('show');
			}else{
				//rightboxslider.close();
				rightboxslider.tuhaolist.close();
				$(".baping-contentsbox").addClass('full');
				$(".baping-rightbox").removeClass('show');
			}
		}else if(skey=='msglooproll'){
			if(setval=='1'){
				screenbp.reLoop(10);
			}else{
				screenbp.stopLoop();
			}
		}else if(skey=='showmsgbox'){
			if(setval=='1'){
				$(".baping-contents").removeClass('hide');
			}else{
				$(".baping-contents").addClass('hide');
			}
		}else if(skey=='msglooptime'){
			screenbp.loopdelay = parseInt(setval)*1e3;
			screenbp.stopLoop();
			screenbp.reLoop();
		}else if(skey=='msgloopnum'){
			screenbp.loopnum = setval;
		}else if(skey=='bgtype'){
			var bgscreen = require('bgscreen');
			bgscreen.setbgtype(setval);
		}else if(skey=='loadhistory'){
			screenbp.loadhistory = setval;
			if(setval=='2'){
				screenbp.delOldMsg();
			}
		}else if(skey=='shownormal'){
			screenbp.shownormal = setval;
			if(setval=='2'){
				screenbp.delNormalMsg();
			}
		}else if(skey=='showmarqueen'){
			setval=='2'?screenbp.hideMarqueen():screenbp.showMarqueen();
		}else if(skey=='barname'){
			var maxW = $('.logoBox .barname').width();
			var liBox = $('.logoBox .barname .barnameBox');
			if(liBox.hasClass('noscroll')){//如今不可滚动
				liBox.find('li').html(setval);
			}else if(liBox.hasClass('namescroll')){
				liBox.removeClass('namescroll').addClass('noscroll').html('<li>'+setval+'</li>');
			}
			if(liBox.width()>maxW){
				liBox.append(liBox.html());
				liBox.removeClass('noscroll').addClass('namescroll');
			}
		}else if(skey=='syskeyword'){
			setval=='2'?screenbp.pausekeyword():screenbp.resumekeyword();
		}else if(skey=='moduleboxshow'){
			setval=='2'?screenbp.hidemodulebox():screenbp.showmodulebox();
		}
		self.initleftControltoModule(skey,setval);
		self.setlocalval(skey,setval);
		self.allData[fkey][key]['data'][skey].val = setval;
	},
	getlocalval:function(key){
		return localStorage.getItem(XCV3Config.hdid + '_' + key);
	},
	setlocalval:function(key,val){
		localStorage.setItem(XCV3Config.hdid +'_'+ key,val);
	},
	getLoadVideos:function(key){
		var self = this;
		return self.allData.allVideos[key];
	},
	preloadVideosAll:function(arr,fuc){
		var self = this;
		if($.isArray(arr)&&arr.length>0){
			var loadkey = 0;
			$.each(arr,function(i,v){
				self.preloadVideos(v,{
					onComplete:function(){
						loadkey++;
						if(loadkey==arr.length){
							fuc&&fuc();
						}
					}
				});
			});
		}else{
			console.log('出现数据异常，加载fail');
			fuc&&func();
		}
	},
	preloadVideos:function(key,data){
		var self = this;
		var videocontrol = require('videocontrol');
		var videos = self.allData.allVideos[key];
		var oldData = self.allData.allVideos[key];
		if(videos==null){
			videos = [];
		}else{
			if(typeof(videos)=='string'){
				videos = [videos];
			}else{
				if(!$.isArray(videos)){
					videos = [];
					for(var i in oldData){
						videos.push(oldData[i]);
					}
					if(!$.isArray(videos)) return alert('非数组无法加载');
				}
			}
		}
        data.onComplete = data.onComplete||function(){}
        var allvideos = [];
        for(var x=0;x<videos.length;x++){
            var oneSrc = videos[x];
            allvideos.push(oneSrc);
        }
        videocontrol.preload({
            src:allvideos,
            noSupport:function(){
                data.onComplete();
            },
            onError:function(){
                data.onComplete();
            },
            onFail:function(){},
            onComplete:function(result,playList){
				if(result.length>0){
					if(typeof(oldData)=='string'){
						self.allData.allVideos[key+'data'] = result;
					}else{
						if(!$.isArray(oldData)){
							self.allData.allVideos[key+'data'] = {};
							var index = 0;
							for(var i in oldData){
								self.allData.allVideos[key+'data']['theme'+i] = result[index];
								index++;
							}
						}else{
							self.allData.allVideos[key+'data'] = result;
						}
					}
				}
				self.loadedLenth += result.length;
				var percent = (Math.round(self.loadedLenth / self.totalLenth * 10000) / 100);
				$(".load-percent").html(percent+'%');
				$(".load-progress span").css('width',percent+'%');
                data.onComplete();
            }
        });
    },
	getLoadImage:function(key){
		var self = this;
		return self.allData.allImages[key];
	},
	preloadImages:function(data){
		var self = this;
        var src = [];
        for(var i in self.allData.allImages){
			if($.isArray(self.allData.allImages[i])){
				$.each(self.allData.allImages[i],function(i,v){
					src.push(v);	
				})
			}else{
				src.push(self.allData.allImages[i]);
			}
        }
        data.onComplete = data.onComplete||function(){}
        if(src.length==0){
            return data.onComplete();
		}
        var len = src.length;
        var index = 0;
        for(var x=0;x<len;x++){
            var img = new Image();
            img.onload = img.onerror = function(){
                index++;
                self.loadedLenth++;
                var percent = (Math.round(self.loadedLenth / self.totalLenth * 10000) / 100);
                $(".load-percent").html(percent+'%');
                $(".load-progress span").css('width',percent+'%');
                if(index==len){
                    data.onComplete();
                }
                this.onload = this.onerror = null;
            }
            img.src = src[x];
        }
    },
};
return screenbpdata;
});
