/*
* @Author: 赞木
* @Date:   2022-11-29 10:04:26
* @Last Modified by:   赞木
* @Last Modified time: 2022-12-05 12:35:55
*/
define('screenhbwall',['screencore','keyboard','layerBox','jquerytrans'],function(screencore,keyboardJS,layerBox){
	var screenhbwall = {
		config:null,
		init:function(config){
			var self = this;
			self.config = config;
			self.bindevent();
			if(self.config.mode=='2'){
				self.ajaxselect();
				setInterval(function(){
					self.ajaxselect();
				},3e3);
			}
			screencore.sendMsg2frame({'type':'hbwallchangeurl','rotateid':self.config.rotateid||'0'});
		},
		bindevent:function(){
			var self = this;
			$(".hbwall-box .hbwall-item").click(function(e,frommode){
				var $this = $(this);
				if(self.config.mode=='2' && frommode!='2'){
					return false;
				}
				if($this.hasClass('hasopen')) return false;
				//核实红包是否已开 已开报错，未开转已开并且向所有选了当前红包的用户下发奖品
				if(self.config.mode=='1'){
					var hbid = $this.attr('data-hbid')||'0';
					screencore.ajaxSubmit("/screen/hbwall/checkopen",{'rotateid':self.config.rotateid,'hbid':hbid}).then(function(data){
						 if(data.code!=0){
							layerBox.showMsg(data.msg);
						 }else{
						 	self.openhb($this);
						 }
					}, function(){
						  layerBox.showMsg('网络太差，请稍后重试');
						  return false;
					});
				}else{
					self.openhb($this);
				}
			});
			$(".popbox").on('click','.closebtn',function(){
				$('.popbox .lightbox').removeAttr('style');
				$('.popbox .back').remove();
				$('.popbox').addClass('hidden')
			});
			keyboardJS.bind('space',function(){
				if(!$('.popbox').is(':hidden')){
					return $(".popbox .closebtn").trigger('click');
				}
				if(self.config.mode=='2'){
					var len = $(".hbwall-box .hbwall-item:not(.hasopen)").length;
					if(len > 0){
						//先确定好翻开哪个红包
						self.stopindex = Math.floor(Math.random()*( len - 0 + 1)) + 0;
						if(self.stopindex == len){
							self.stopindex -= 1;
						}
						if(self.stopindex >= 0){
							var hbid = $(".hbwall-box .hbwall-item:not(.hasopen)").eq(self.stopindex).attr('data-hbid')||'0';
							screencore.ajaxSubmit("/screen/hbwall/checkopen",{'rotateid':self.config.rotateid,'hbid':hbid}).then(function(data){
								 if(data.code!=0){
									layerBox.showMsg(data.msg);
								 }else{
								 	self.showbig();
								 }
							}, function(){
								  self.stopindex = -1;
								  layerBox.showMsg('网络太差，请稍后重试');
							});
						}else{
							layerBox.showMsg('所有红包已经打开');
						}
					}else{
						layerBox.showMsg('所有红包已经打开');
					}
				}
			});
			keyboardJS.bind('left', function(e) {
				layerBox.showConfirm('温馨提示','确定要切换到上一轮么?',['确定','取消'],function(){
					screencore.ajaxSubmit("/screen/hbwall/changerotate",{rotateid:self.config.rotateid,type:'2'}).then(function(data){
						if(data.code==0){
							window.location.href = data.msg;
						}else{
							layerBox.showMsg(data.msg);
						}
					});
				});
			});
			keyboardJS.bind('right', function(e) {
				layerBox.showConfirm('温馨提示','确定要切换到下一轮么?',['确定','取消'],function(){
					screencore.ajaxSubmit("/screen/hbwall/changerotate",{rotateid:self.config.rotateid,type:'1'}).then(function(data){
						if(data.code==0){
							window.location.href = data.msg;
						}else{
							layerBox.showMsg(data.msg);
						}
					});
				});
			});
		},
		ajaxselect:function(){
			var self = this;
			screencore.ajaxSubmit("/screen/hbwall/ajaxprizesselect",{'rotateid':self.config.rotateid}).then(function(json){
				 if(json.code==0){
				 	if(json.msg.length > 0){
				 		$.each(json.msg,function(i,v){
				 			$(".hbwall-box .hb"+v.id).find('.xuhao span').text(v.num);
				 		});
				 	}				 	
				 }
			}, function(){
				  layerBox.showMsg('网络太差，请稍后重试');
			});
		},
		openhb:function(obj){
			var self = this;
			obj.addClass('hasopen');
			setTimeout(function(){
				if(self.config.speakText=='1'){
					screencore.speakText('恭喜抽到了' + obj.find('.back .prizename').text());
				}
				obj.find('.front').addClass('noanimation');
			},1e3);
			if(self.config.needpop=='2'){
				return false;
			}
			obj.find('.back').one('transitionend webkitTransitionEnd oTransitionEnd', function () {
				var backbox = $(this),backobj = backbox.clone();
				backobj.css({
					width: backbox.width(),
					height: backbox.height()
				});
				backobj.append('<div class="closebtn"><span class="mxc-roundclose"></span></div>');
				var popbox = $(".popbox"),lightbox = popbox.find(".lightbox");
				lightbox.prepend(backobj).css({
					top: backbox.offset().top,
					left: backbox.offset().left,
				}).addClass('small');
				setTimeout(function(){
					lightbox.transition({
						top: ( popbox.height() - lightbox.height() ) / 2,
						left: ( popbox.width() - lightbox.width() ) / 2,
					}, 1e3, function() { 
						lightbox.removeClass('small');
						lightbox.css({
							top:0,
							left:0,
							width:lightbox.width() * 2,
							height:lightbox.width() * 2,
						});
					}).transition({
						scale: self.config.popscale
					}, 1e3, 'ease');
				},60);
			    popbox.removeClass('hidden');
			});
		},
		isstop:false,
		moveindex:0,
		stopindex:-1,
		showbig:function(){
			var self = this,len = $(".hbwall-box .hbwall-item:not(.hasopen)").length;
			if(len > 0){
				$(".hbwall-box .hbwall-item:not(.hasopen)").eq(self.moveindex).transition({scale:1.2}, 1e2).transition({ scale: 1 }, 1e2, 'ease', function() {
					self.moveindex++;
					if(self.moveindex >= len){
						self.moveindex = 0;
						self.isstop = true;
					}
					if(self.isstop && self.moveindex==self.stopindex){
						$(".hbwall-box .hbwall-item:not(.hasopen)").eq(self.moveindex).trigger('click','2');
						self.moveindex = 0;
						self.isstop = false;
						self.stopindex = -1;
						return false;
					}
					self.showbig();
				});
			}
		},
	}
	return screenhbwall;
})