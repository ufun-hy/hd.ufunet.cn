/*
* @Author: 赞木
* @Date:   2021-07-31 07:43:14
* @Last Modified by:   赞木
* @Last Modified time: 2023-04-16 21:03:08
*/
define('screenredpack',['screensocket','screencore','template','layerBox','fulldm','keyboard'],function(screensocket,screencore,template,layerBox,fulldm,keyboardJS){
	var screenredpack = {
		rotateid:0,
		phbtype:'1',
		gamestatus:0,
		gametimererror:true,
		jointimer:null,
		droptimer:null,
		droptypes:[1,2,3,4,5,6,7],
		dropanitimes:[1500,1200,900,1000,1050,1000,800],
		ajaxtimer:null,
		maxid:0,
		newpoplist:[],
		poptimer:null,
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
					self.gamestatus==1&&self.rushuser(data);
				}else if(data.type=='gameiswait'||data.type=='gameisrun'){
					self.bindEvent();
					self.rotateid = data.rotateid;
					self.phbtype = data.phbtype;
					$(".redpack-wrapper").removeClass('display-none');
					$(".redpack-toppackage-count .seconds").text(data.gametime);
					if(data.type=='gameiswait'){
						$(".start-btn").show();
						self.gamestatus = 1;
						clearInterval(self.jointimer);
						self.jointimer = setInterval(function(){
							screencore.gameSendonline();
						},1e3);
					}else{
						$(".start-btn").hide();
						self.gamestatus = 2;
						self.gametimererror = true;
						setTimeout(function(){
							if(self.gamestatus == 2&&self.gametimererror){
								layerBox.showConfirm('警告','当前轮次计时器存在异常，需要重置才可以继续开始',['重置本轮','跳过本轮，进入下一轮'],function(){
									screencore.ajaxSubmit("/screen/redpack/gameerror",{'gametype':XCV3Config.gametype}).then(function(data){});
								},function(){
									screencore.ajaxSubmit("/screen/redpack/gamedel",{'gametype':XCV3Config.gametype}).then(function(data){});
								});
							}else{
								self.gamestart();
							}
						},1.2e3);
					}
				}else if(data.type=='gameisdjs'){
					self.gamestatus = 2;
					self.gametimererror = false;
					$(".redpack-toppackage-count .seconds").text(data.djs);
					if(data.djs==0){
						self.gamestatus = 3;
						self.stopdrop();
						clearInterval(self.ajaxtimer);
						clearTimeout(self.poptimer);
						if(data.openphb=='1'){
							layerBox.showLoading('正在加载排名数据，请稍后...');
						}
					}
				}else if(data.type=='gameshowphb'){
					self.gamestatus = 3;
					$('.redpack-toppackage-count').html('游戏已结束');
					layerBox.closeLayer();
					if(data.openphb=='1') self.ajaxphb();
				}else if(data.type=='gameredpackrefresh'||data.type=='gameerrorhaddone'){
					window.location.reload();
				}else if(data.type=='gameiserror'){
					layerBox.showMsg('当前轮次异常');
					setTimeout(function(){
						window.location.reload();
					},1e3);
				}else if(data.type=='redpackoffline'){
					screensocket.forceoff = true;
					layerBox.showMsg('当前游戏不支持多开，当前窗口已经被迫下线','0');
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
			screencore.ajaxSubmit('/screen/redpack/ajaxphb',{rotateid:self.rotateid,phbtype:self.phbtype},'正在获取排行榜数据..').then(function(json){
				if(json.code==0){
					var html = '';
					$.each(json.msg,function(i,v){
						v.num = i+1;
						html += template('recordlucker-tpl',v);
					});
					$(".redpack-record-list").empty().append(html);
					$(".redpack-recordall").show();
					$(".redpack-recordwrapper").animateControl('bounceInDown');
				}else{
					$(".redpack-record-list").empty();
					$(".redpack-recordall").show();
					$(".redpack-recordwrapper").animateControl('bounceInDown');
				}
		    });
		},
		ajaxlucker:function(){
			var self = this;
			screencore.ajaxSubmit('/screen/redpack/ajaxlucker',{maxid:self.maxid,rotateid:self.rotateid}).then(function(json){
				if(json.code==0){
					self.maxid = json.msg.maxid;
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
			if(self.gamestatus == 3) return false;
			var popin = ['bounceIn','bounceInDown','bounceInLeft','bounceInRight','bounceInUp','rotateIn','rotateInDownLeft','rotateInDownRight','rotateInUpLeft','rotateInUpRight','slideInDown','slideInLeft','slideInRight'];
	    	var popout = ['bounceOut','bounceOutDown','bounceOutLeft','bounceOutRight','bounceOutUp','rotateOut','rotateOutDownLeft','rotateOutDownRight','rotateOutUpLeft','rotateOutUpRight','slideOutDown','slideOutLeft','slideOutRight'];
			if(self.newpoplist.length>0){
				var objLucker = self.newpoplist.shift();
				$("body").append(template('poplucker-tpl',objLucker));
				$('.pop-paper').animateControl(popin[Math.floor(Math.random()*popin.length)],function() {
					$(".pop-paper").remove();
					$(".redpack-right-list ul").prepend(template('rightuser-tpl',objLucker));
					$(".redpack-right-list ul li:first-child").animateControl('zoomInLeft');
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
		redpackdrop:function (){
			var self = this,boxtype = self.droptypes[Math.floor((Math.random()*self.droptypes.length))],anitime = self.dropanitimes[(boxtype - 1)];
			var elem = $('<li class="redenvelop' + boxtype + '"></li>');
			$('.redenvelop_box .redenvelop_list').append(elem);
			$(elem).css({
				"left": (Math.random() * (290 - mywidth))+ "px",
				"top": '100%',
				"transition":'top '+(anitime * 0.7 + anitime * 0.3 * Math.random())+'ms linear',
			}).on("webkitTransitionEnd transitionend", function() {
				$(this).remove();
			});
		},
		bindEvent: function() {
			var self = this;
			$(".start-btn").off('click').on('click',function(){
				var $this = $(this);
				if(screensocket.isclose) return;
				if(parseInt($(".redpack-left-join b").text())==0) return layerBox.showMsg('当前无用户参与，无法开始游戏');
				if(self.stopclick) return;
				self.stopclick = true;
				screencore.ajaxSubmit("/screen/redpack/gamestart",{}).then(function(data){
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
			$(".redpack-right-pm").off('click').on('click',function(){
				self.ajaxphb();
			});
			keyboardJS.off(['space','right','shift']);
			keyboardJS.bind('space', function(e) {
				if(self.gamestatus==1){
					$(".start-btn").trigger('click');
				}else if(self.gamestatus==3){
					if($(".redpack-recordall").is(":hidden")){
						$(".redpack-right-pm").trigger('click');
					}else{
						$(".closerecord").trigger('click');
					}
				}
			});
			keyboardJS.bind('right', function(e) {
				if(self.gamestatus==2){
					layerBox.showConfirm('警告','当前轮次还未结束，确定要强制结束么?',['确定','取消'],function(){
						screencore.ajaxSubmit("/screen/redpack/gameend",{'gametype':XCV3Config.gametype}).then(function(data){});
					});
				}else{
					self.gamestatus==3 && window.location.reload();;
				}
			});
		},
		gamestart:function(){
			var self = this;
			$(".start-btn").hide();
			screencore.hideFootAndQr();
			clearInterval(self.jointimer);
			self.startdrop();
			clearInterval(self.ajaxtimer);
			self.ajaxtimer = setInterval(function() {
				self.ajaxlucker();
			},3e3);
			self.luckerpopshow();
		},
		startdrop:function(){
			var self = this;
			clearInterval(self.droptimer);
			self.droptimer = setInterval(function(){
				self.redpackdrop();
			},1e2);
			$(".redenvelop_box").removeClass('display-none');
			$('.redpack-toppackage div').addClass('shake shake-rotate');
		},
		stopdrop:function(){
			var self = this;
			clearInterval(self.droptimer);
			$(".redenvelop_box").addClass('display-none');
			$('.redpack-toppackage div').removeClass('shake shake-rotate');
		},
		redpackdrop:function (){
			var self = this,boxtype = self.droptypes[Math.floor((Math.random()*self.droptypes.length))],anitime = self.dropanitimes[(boxtype - 1)];
			var elem = $('<li class="redenvelop' + boxtype + '"></li>');
			$('.redenvelop_box .redenvelop_list').append(elem);
			$(elem).css({
				"left": (Math.random() * (290 - $(elem).width()))+ "px",
				"top": '100%',
				"transition":'top '+(anitime * 0.7 + anitime * 0.3 * Math.random())+'ms linear',
			}).on("webkitTransitionEnd transitionend", function() {
				$(this).remove();
			});
		},
		rushuser:function(data){
			var self = this,end10 = screencore.objectToarray(data.user),userdom = $(".redpack-left-users li");
			$(".redpack-left-join b").text(data.count);
			$.each(userdom,function(i,val){
				var $this = $(this),oneuser = end10[i];
				if(oneuser){
					$this.css('background-image',"url("+oneuser.avatar+")").removeClass('hidden');
				}else{
					$this.css('background-image',"none").addClass('hidden');
				}
			});
		},
	};
	return screenredpack;
});
