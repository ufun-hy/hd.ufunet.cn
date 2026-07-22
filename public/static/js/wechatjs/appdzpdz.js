/*
* @Author: 赞木
* @Date:   2022-10-26 16:48:49
* @Last Modified by:   赞木
* @Last Modified time: 2022-10-26 16:51:59
*/

define('appdzpdz',['appsocket','wechatcore','luckycanvas'],function(appsocket,wechatcore,LuckyCanvas){
	var appdzpdz = {
		oldluckers:[],
		oneluckerid:0,
		rotateInfo:null,
		isstart:false,
		init:function(){
			var self = this;
			self.loadMsg();
		},
		loadMsg:function(){
			var self = this;
			wechatcore.ajaxSubmit("/wechat/dzpdz/initdata",{rotateid:rotateid||'0'}).then(function(json){
				if(json.code==0){
					self.rotateInfo = json.msg.rotate;
					$(".rule-des").html(self.rotateInfo.ruledes);
					if(self.rotateInfo.showrollbox=='2'){
						$(".lucker-rollbox").addClass('hidden');
					}
					var ajaxluckers = json.msg.list.reverse(),msglen = ajaxluckers.length;
					if(msglen > 0){
						for (var i = 0; i < msglen; i++) {
							$(".lucker-rolllist").append(wechatcore.tpl($("#rollone-tpl"),ajaxluckers[i]));
						}
						self.oldluckers = ajaxluckers;
					}
					self.bindEvent();
					setTimeout(function(){
						self.loopRun();
					},2e3);
				}else{
					wechatcore.msg(json.msg);
				}
			},function(){
				wechatcore.msg('加载出错');
			});
		},
		initSocket:function(){
			var self = this;
			appsocket.init({
				onmessage:function(data){
					if(data.type=='connected'){
						appsocket.isclose = false;
						wechatcore.connectsocket({clientid:data.clientid,rotateid:rotateid});
					}else if(data.type=='goto'){
						wechatcore.goto(data);
					}else if(data.type=='addblack'){
						data.userid==XCV3Config.userid&&wechatcore.closewxwindow();
					}else if(data.type=='luckeruserids'){
						wechatcore.layerAsklucker(data);
					}
				}
			});
		},
		bindEvent:function(){
			var self = this;
			//self.initSocket();
			if(self.rotateInfo.cjstyle=='1'){
				$(".app-dzpbg").removeClass('app-jggbg');
			}else{
				$(".app-dzpbg").addClass('app-jggbg');
			}
			$(".app-dzpbg").removeClass('hidden');
			self.cjstyleInit();
			$(".dzp-popbox .close-pop").click(function(){
				$(".dzp-popbox").addClass('hidden');
			});
			$(".btn-rule").click(function(){
				$(".dzp-rulebox").removeClass('hidden');
			});
			$(".dzp-rulebox .close-pop").click(function(){
				$(".dzp-rulebox").addClass('hidden');
			});
			$(".lucky-btn").click(function(){
				var mytimes = $(".mytimes span").text();
				if(mytimes <= 0){
					return wechatcore.msg('剩余抽奖次数为0');
				}
				if(self.rotateInfo.cjmode=='1' || self.isstart) return false;
				self.isstart = true;
				wechatcore.ajaxSubmit('/wechat/dzpdz/savelucker',{rotateid:rotateid}).then(function(data){
					if(data.code==0){
						self.myLucky.defaultConfig.stopRange = wechatcore.randomInt(1,9)/10;
						self.myLucky.play();
						setTimeout(function(){
							self.myLucky.stop(data.msg.stopkey);
						},3e2);
						self.oneluckerid = data.msg.luckerid;
						var rmytimes = parseInt(mytimes) - 1;
						$(".mytimes span").text(rmytimes < 0 ? 0 : rmytimes);
					} else {
						if(data.code==-2){
							$(".mytimes span").text(0);
						}
						self.isstart = false;
						wechatcore.msg(data.msg);
					}
				});
			});
		},
		cjstyleInit:function(cjstyle,prizes){
			var self = this,cjstyle = cjstyle||self.rotateInfo.cjstyle,prizes = prizes||self.rotateInfo.prizes,cjprizes = [];
			$.each(prizes,function(i,v){
				if(cjstyle=='1'){
				 	cjprizes.push({
				      background: v.bgcolor, 
				      fonts: [{...bigwheelConfig.fonts,text:v.prizename,fontColor:v.fontcolor}],
				      imgs:[{...bigwheelConfig.imgs,src:v.prizeimg}],
				      prizetype:v.prizetype,
				      saverecord:v.saverecord,
				    });
			 	}else{
			 		cjprizes.push({ 
						x:( i<=2?i:((i==3||i==4)?'2':(i==5?'1':'0')) ),
				      	y:( i<=2?'0':(i==3?'1':((i>=4 && i <=6)?'2':'1')) ),
						background: v.bgcolor, 
						fonts: [{...jggConfig.fonts,text:v.prizename,fontColor:v.fontcolor}],
						imgs:[{...jggConfig.imgs,src:v.prizeimg}],
						prizetype:v.prizetype,
				        saverecord:v.saverecord,
			        });
			 	}
			});
			var plen = cjprizes.length;
			if(cjstyle=='2' && plen < 8){
			    var key = 0;
			    for (var i = plen; i < 8; i++) {
			    	var prize = prizes[key];
			    	cjprizes.push({
			      	  x:( i<=2?i:((i==3||i==4)?'2':(i==5?'1':'0')) ),
			      	  y:( i<=2?'0':(i==3?'1':((i>=4 && i <=6)?'2':'1')) ),
				      background: prize.bgcolor, 
				      fonts: [{...jggConfig.fonts,text:prize.prizename,fontColor:prize.fontcolor}],
				      imgs:[{...jggConfig.imgs,src:prize.prizeimg}],
				      prizetype:prize.prizetype,
				      saverecord:prize.saverecord,
			      	});
			      	key++;
			    	if(key >= prizes.length){
			    		key = 0;
			    	}
			    }
			}
			var configData = cjstyle=='1'?self.bigwheelInit(cjprizes):self.jggInit(cjprizes);
			if(cjstyle=='1'){
				self.myLucky = new LuckyCanvas.LuckyWheel('#my-lucky',configData);
			}else{
				self.myLucky = new LuckyCanvas.LuckyGrid('#my-lucky',configData);
			}
			self.myLucky.init();
		},
		bigwheelInit:function(prizes){
			var self = this;prizes = prizes||[];
			return {
			    width: '5.1rem',
			    height: '5.1rem',
			    defaultConfig:{
			    	offsetDegree:0,
			    	gutter:1,
			    	accelerationTime:parseFloat(bigwheelConfig.accelerationTime)*1e3,
			    	decelerationTime:parseFloat(bigwheelConfig.decelerationTime)*1e3,
			    },
			    defaultStyle:{
			    	fontColor:'#bb3938',
			    	fontSize:'0.18rem',
			    	fontWeight:600,
			    	lineClamp:2,
			    },
			    prizes:prizes,
			    end: function(prize) {
			       self.showpopbox(prize);
			    },
			};
		},
		jggInit:function(prizes){
			var self = this;prizes = prizes||[];
			return {
				width: '5.1rem',
			    height: '5.1rem',
			    defaultStyle:{
			    	fontColor:'#708ABF',
			    	fontSize:'0.18rem',
			    	fontWeight:600,
			    	lineClamp:2,
			    	borderRadius:'0.16rem',
			    	shadow:'',
			    },
			    activeStyle:{
			    	background:self.rotateInfo.jggbgcolor||'#f9732e',
			    	fontColor:self.rotateInfo.jggfontcolor||'#fff',
			    },
			    defaultConfig:{
			    	gutter:15,
			    	accelerationTime:parseFloat(jggConfig.accelerationTime)*1e3,
			    	decelerationTime:parseFloat(jggConfig.decelerationTime)*1e3,
			    },
			    prizes: prizes,
			    end: function(prize) {
			      self.showpopbox(prize);
			    },
			};
		},
		showpopbox:function(prize){
			var self = this;
			var popbox = $(".dzp-popbox");
			var tip = "恭喜获得";
			if(prize.prizetype=='3' && prize.saverecord=='2'){
				tip = '很遗憾';
			}
			popbox.find('.tip').text(tip);
			popbox.find('.prizeimg').attr('src',prize.imgs[0].src);
			popbox.find('.awardname').text(prize.fonts[0].text);
			popbox.removeClass('hidden');
			setTimeout(function(){
				self.isstart = false;
			},1e3);
			if((prize.prizetype=='3' && prize.saverecord=='1') || prize.prizetype!='3'){
				self.addnewMsg({
					id:self.oneluckerid,
					nickname:XCV3Config.nickname,
					prizename:prize.fonts[0].text,
				});
			}
		},
		addnewMsg:function(onelucker){
			var self = this,contentsbox = $('.lucker-rollbox'),contentbox = $('.lucker-rolllist');
			self.oldluckers.push(onelucker);
			contentbox.append(wechatcore.tpl($("#rollone-tpl"),onelucker));
		},
		loopRun:function(){
			var self = this,contentsbox = $('.lucker-rollbox'),contentbox = $('.lucker-rolllist');
			if(contentbox.find('li').length > 1 && contentbox.height() >= contentsbox.height()){
				var firstdom = contentbox.find('li').first(),scrollH = firstdom.outerHeight();
				firstdom.animate({
					"margin-top": -scrollH + 'px'
				},1.5e3, function () {
					var $li = $(this);
					//if(!$li.is(":animated")){
						$li.remove();
						var one = self.oldluckers.shift();
						self.oldluckers.push(one);
						contentbox.append(wechatcore.tpl($("#rollone-tpl"),one));
						setTimeout(function(){
							self.loopRun();
						},1e3);
					//}
				})
			}else{
				setTimeout(function(){
					self.loopRun();
				},1.5e3);	
			}
		},
	};
	return appdzpdz;
})