/*
* @Author: 赞木
* @Date:   2021-09-11 09:55:46
* @Last Modified by:   赞木
* @Last Modified time: 2023-03-18 13:47:50
*/
define('screenydj',['screensocket','screencore','template','layerBox','fulldm','keyboard'],function(screensocket,screencore,template,layerBox,fulldm,keyboardJS){
	var screenydj = {
		rotateid:'0',
		jointimer:null,
		makeTimer:null,
		quantimer:null,
		ajaxtimer:null,
		poptimer:null,
		gamestatus:0,
		newpoplist:[],
		poptimer:null,
		ylunit:'',
		init: function() {
			var self = this;
			var params = {};
			params.onmessage = function(data){
				if(data.type=='connected'){
					screensocket.isclose = false;
					screencore.connectsocket({clientid:data.clientid});
				}else if(data.type=='gamenoround'){
					if(self.gamestatus==0){
						$(".emptybox").removeClass('display-none');
					}
				}else if(data.type=='gameonline'){
					if(self.gamestatus==1){
						$(".ydj-readyjoin span").text(data.count);
					}
				}else if(data.type=='gameiswait'||data.type=='gameisrun'){
					self.bindEvent();
					self.rotateid = data.rotateid;
					$(".ydj-remainnum b").text(data.ylunit);
					$(".ydj-rotatetitle").text(data.title);
					if(data.showremain=='1') {
						$(".ydj-remainnum").removeClass('display-none');
					}else{
						$(".ydj-remainnum").addClass('display-none');
					}
					$(".ydj-readmain").removeClass('display-none');
					if(data.type=='gameiswait'){
						self.gamestatus = 1;
						self.startquan();
						clearInterval(self.jointimer);
						self.jointimer = setInterval(function(){
							screencore.gameSendonline();
						},1e3);
					}else{
						//$(".start-btn").hide();
						self.gamestatus = 2;
						self.gametimererror = true;
						setTimeout(function(){
							if(self.gamestatus == 2&&self.gametimererror){
								layerBox.showConfirm('警告','当前轮次计时器存在异常，需要重置才可以继续开始',['重置本轮','跳过本轮，进入下一轮'],function(){
									screencore.ajaxSubmit("/screen/ydj/gameerror",{'gametype':XCV3Config.gametype}).then(function(data){});
								},function(){
									screencore.ajaxSubmit("/screen/ydj/gamedel",{'gametype':XCV3Config.gametype}).then(function(data){});
								});
							}else{
								self.gamestart();
							}
						},1e3);
					}
				}else if(data.type=='gameisdjs'){
					self.gamestatus = 2;
					self.gametimererror = false;
					var b = $(".webgamedjs"),s = b.find(".gamedjsani");
					s.text(data.djs);
					b.removeClass('display-none');
					if(data.djs==0){
						self.gamestatus = 3;
						b.addClass('display-none');
						clearInterval(self.ajaxtimer);
						clearTimeout(self.poptimer);
						self.stopdrop();
						$(".ydj-shakeRank").hide();
						layerBox.showLoading('正在加载排名数据，请稍后...');
					}
				}else if(data.type=='gameshowphb'){
					self.gamestatus = 3;
					//$('.redpack-toppackage-count').html('游戏已结束');
					layerBox.closeLayer();
					self.ajaxphb();
				}else if(data.type=='gameydjrefresh'||data.type=='gameerrorhaddone'){
					window.location.reload();
				}else if(data.type=='gameiserror'){
					layerBox.showMsg('当前轮次异常');
					setTimeout(function(){
						window.location.reload();
					},1e3);
				}else if(data.type=='ydjoffline'){
					screensocket.forceoff = true;
					layerBox.showMsg('当前游戏不支持多开，当前窗口已经被迫下线','0');
				}else if(data.type=='screendm'){
					var messages = data.messages;
					if(messages){
						if($.isArray(messages)&&messages.length>0){
							$.each(messages,function(i, val){
								if(val.type=='1'){
									fulldm.addBullet(val);
								}
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
				}
			};
			params.onclose = function(){
				screensocket.reconnect();
				clearInterval(self.jointimer);
			};
			screensocket.init(params);
		},
		ajaxphb:function(){
			var self = this;
			screencore.ajaxSubmit('/screen/ydj/ajaxphb',{rotateid:self.rotateid,phbtype:self.phbtype},'正在获取排行榜数据..').then(function(json){
				if(json.code==0){
					var html = '';
					$.each(json.msg,function(i,v){
						v.num = i+1;
						html += template('recordlucker-tpl',v);
					});
					$(".redpack-record-list").empty().append(html);
					$(".redpack-recordallBox").removeClass('display-none');
					$(".redpack-recordwrapper").animateControl('bounceInDown');
				}else{
					$(".redpack-record-list").empty();
					$(".redpack-recordallBox").removeClass('display-none');
					$(".redpack-recordwrapper").animateControl('bounceInDown');
				}
		    });
		},
		makequan:function() {
			var self = this;
			var g = $('<img />');
			var f = screencore.randomInt(0, 2);
			g.attr("src",bgquans[f]);
			g.css({
				scale: 0,
				opacity: 1
			});
			$(".ydj-cssquanbox").append(g);
			g.transition({
				opacity: 0,
				scale: 2,
				duration: 2500,
				easing: "linear",
				complete: function () {
					g.remove();
				}
			})
		},
		startquan:function(){
			var self = this;
			clearInterval(self.quantimer);
			self.quantimer = setInterval(function () {
				  self.makequan();
			}, 300);
		},
		stopquan:function(){
			var self = this;
			clearInterval(self.quantimer);
		},
		makedrop:function(){
			var self = this;
			var x = parseInt(self.randR(0,$('.ydj-shakerain').width())); // 红包起始x坐标
			var speed = self.randR(1e3, 4e3); // 红包运动总时长
			var droptype = self.randR(0, 3);
			var ypos = [225,118,112,76];
			var g = $('<div class="ydj-dropred drop'+droptype+'"></div>');
			g.css({'left': x + 'px' ,'top': '-'+ ypos[droptype] +'px'});
			$('.ydj-shakerain').append(g);
			g.transition({
				top: $('.ydj-shakerain').height()+'px',
				duration:speed,
				easing: "in",
				complete: function() {
					g.remove();
				}
			})
		},
		stopdrop:function(){
			var self = this;
			$('.ydj-shakerain .ydj-dropred').remove();
			clearInterval(self.makeTimer);
		},
		randR:function(b, e) {
			return Math.floor(Math.random()*(e - b)) + b;
		},
		gamestart:function(){
			var self = this;
			$(".ydj-readmain").addClass('display-none');
			$(".control-normal-list .openqr").trigger('click');
			self.stopquan();
			//生成掉落的红包
			self.makeTimer = setInterval(function() {
				self.makedrop();
			}, 2e2);
			clearInterval(self.jointimer);
			self.ajaxtimer = setInterval(function() {
				self.ajaxlucker();
			},3e3);
			self.luckerpopshow();
			$('.ydj-shakebox').removeClass('display-none');
		},
		ajaxlucker:function(){
			var self = this;
			screencore.ajaxSubmit('/screen/ydj/ajaxlucker',{maxid:self.maxid,rotateid:self.rotateid}).then(function(json){
				if(json.code==0){
					self.maxid = json.msg.maxid;
					$(".ydj-shaketop span").text(json.msg.len);
					var pushlist = json.msg.list;
					if(pushlist.length>0){
						$.each(pushlist,function(i,v){
							self.newpoplist.push(v);
						});
					}
				}
			});	
		},
		luckerpopshow:function(){
			var self = this;
			var popin = ['bounceIn','bounceInDown','bounceInLeft','bounceInRight','bounceInUp','rotateIn','rotateInDownLeft','rotateInDownRight','rotateInUpLeft','rotateInUpRight','slideInDown','slideInLeft','slideInRight'];
			var popout = ['bounceOut','bounceOutDown','bounceOutLeft','bounceOutRight','bounceOutUp','rotateOut','rotateOutDownLeft','rotateOutDownRight','rotateOutUpLeft','rotateOutUpRight','slideOutDown','slideOutLeft','slideOutRight'];
			if(self.newpoplist.length>0){
				var objLucker = self.newpoplist.shift();
				var poplucker = template('poplucker-tpl');
				$("body").append(poplucker(objLucker));
				$('.pop-paper').animateControl(popin[Math.floor(Math.random()*popin.length)],function() {
					$(".pop-paper").remove();
					var luckerrender = template('tugrank-tpl');
					objLucker.num =  $(".ydj-rightrank .tug-rankcell").length;
					$(".ydj-rightrank").prepend(luckerrender(objLucker));
					self.poptimer = setTimeout(function(){
						self.luckerpopshow();
					}, 100);
				});
			}else{
				self.poptimer = setTimeout(function(){
					self.luckerpopshow();
				}, 100);
			}
		},
		ajaxphb:function(){
			var self = this;
			screencore.ajaxSubmit('/screen/ydj/ajaxphb',{rotateid:self.rotateid},'正在获取排行榜数据..').then(function(json){
				if(json.code==0){
					var html = '';
					$.each(json.msg,function(i,v){
						v.num = i+1;
						html += template('recordlucker-tpl',v);
					});
					$(".redpack-record-list").empty().append(html);
					$(".redpack-recordallBox").removeClass('display-none');
					$(".redpack-recordwrapper").animateControl('bounceInDown');
				}else{
					$(".redpack-record-list").empty();
					$(".redpack-recordallBox").removeClass('display-none');
					$(".redpack-recordwrapper").animateControl('bounceInDown');
				}
		    });
		},
		bindEvent: function() {
			var self = this;
			$(".ydj-readycenter .ydj-startbtn").off('click').on('click',function(){
				var $this = $(this);
				if(screensocket.isclose) return;
				if(parseInt($(".ydj-readyjoin span").text())<=0) return layerBox.showMsg('至少有一人加入游戏才可以开始游戏.');
				if(self.stopclick) return;
				self.stopclick = true;
				screencore.ajaxSubmit("/screen/ydj/gamestart",{}).then(function(data){
					 if(data.code!=0){
					 	self.stopclick = false;
						layerBox.showMsg(data.msg);
					 }else{
					 	self.gamestart();
					 }
				}, function(){
					  self.stopclick = false;
					  layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			$(".redpack-recordallBox .closerecord").off('click').on('click',function(){
				$(".redpack-recordallBox").addClass('display-none');
			});
			keyboardJS.off(['space','right','shift']);
			keyboardJS.bind('space', function(e) {
				if(!$(".ydj-readycenter").hasClass("display-none")){
					$(".ydj-startbtn").trigger('click');
				}
			});
			keyboardJS.bind('right', function(e) {
				if(self.gamestatus==2){
					layerBox.showConfirm('警告','当前轮次还未结束，确定要强制结束么?',['确定','取消'],function(){
						screencore.ajaxSubmit("/screen/ydj/gameend",{'gametype':XCV3Config.gametype}).then(function(data){});
					});
				}else{
					self.gamestatus==3 && window.location.reload();;
				}
			});
			keyboardJS.bind('shift', function(e) {
				if($(".redpack-recordallBox").is(":hidden")){
					self.ajaxphb();
				}else{
					$(".redpack-recordallBox").addClass("display-none")
				}
			});
		},
	};
	return screenydj;
});
