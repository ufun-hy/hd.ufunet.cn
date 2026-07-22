define('screentug',['screensocket','screencore','template','layerBox','fulldm','keyboard'],function(screensocket,screencore,template,layerBox,fulldm,keyboardJS){
	var screentug = {
		gamestatus:0,
		stopclick:false,
		autorun:2,
		autonum:20,
		gametimererror:true,
		gamephb:100,
		joinInterval:null,
		rankRender:null,
		rankTen:[],
		audio:{},
		init: function() {
			var self = this;
			self.rankRender = template('tugrank-tpl');
			var params = {};
			params.onmessage = function(data){
				if(data.type=='connected'){
					screensocket.isclose = false;
					screencore.connectsocket({clientid:data.clientid});
				}else if(data.type=='gamenoround'){
					if(self.gamestatus==0){
						self.showLastRoundUser();
					}
				}else if(data.type=='gameonline'){
					self.gamestatus==1&&self.rushuser(data);
				}else if(data.type=='gameiswait'||data.type=='gameisrun'){
					self.initAudio();
					self.bindEvent();
					if(data.type=='gameiswait'){
						self.gamestatus = 1;
						clearInterval(self.joinInterval);
						self.autorun = data.autorun;
						self.autonum = data.autonum;
						screencore.gameSendonline();
						self.joinInterval = setInterval(function(){
							screencore.gameSendonline();
						},2e3);
					}else{
						self.gamestatus = 2;
						self.gametimererror = true;
						setTimeout(function(){
							if(self.gamestatus == 2&&self.gametimererror){
								screencore.gameTimererror();
							}
						},2e3);
					}
					self.initPage(data);
					self.gamephb = data.gamephb;
				}else if(data.type=='gameiscountdown'){
					var b = $(".webstartdjs"),e = b.find(".webstartdjsBox"),s = b.find(".startdjsani");
					s.text(data.djs>0?data.djs:'GO');
					b.removeClass('display-none');
					self.audio.countAudio.play();
				}else if(data.type=='gameisdjs'){
					self.gamestatus = 2;
					self.gametimererror = false;
					if(data.djs > 0){
						$(".tug-readybottom .tug-readyinfo").hide();
						$(".tug-readybottom .tug-usering").show();
					}
					$(".webstartdjs").addClass('display-none');
					var tarr = data.djs.toString().split('');
					if(tarr.length==2){
						tarr.unshift('0');
					}else if(tarr.length==1){
						tarr.unshift('0','0');
					}
					$(".tug-timebox span").each(function(i,v){
						$(this).text(tarr[i]);
					});
					if(data.djs == 0){
						self.gamestatus = 3;
						self.audio.overAudio.play();
						layerBox.showLoading('正在加载排名数据，请稍后...');
					}
					self.rushDom(data.list);
				}else if(data.type=='gameshowphbbtn'){
					layerBox.closeLayer();
					self.showEndUser();
					screencore.sendLuckerTpl({rotateid:data.rotateid});
				}else if(data.type=='gametugrefresh'||data.type=='gameerrorhaddone'){
					window.location.reload();
				}else if(data.type=='gameiserror'){
					layerBox.showMsg('当前轮次出现异常');
					setTimeout(function(){
						window.location.reload();
					},1e3);
				}else if(data.type=='tugoffline'){
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
				clearInterval(self.joinInterval);
			};
			screensocket.init(params);
		},
		initAudio: function(){
			var self = this;
			self.audio.joinAudio = document.getElementById("joinaudio");
			self.audio.countAudio = document.getElementById("countaudio");
			self.audio.overAudio = document.getElementById("overaudio");
		},
		initPage: function(data){
			var self = this,roundparas = data.roundparas;
			$(".tug-title").text(data.roundtitle);
			$(".tug-bottombg .tug-leftname").text(roundparas.redname);
			$(".tug-rrank .tug-rankname").text(roundparas.redname);
			$(".tug-bottombg .tug-rightname").text(roundparas.bluename);
			$(".tug-brank .tug-rankname").text(roundparas.bluename);
			//img
			$(".tug-topcenter-ad").css({"background-image":'url('+roundparas.topadv+')'});
			$(".tug-leftflag").css({"background-image":"url("+teamflags.redflag+"), url("+roundparas.redlogo+")"});
			$(".tug-rightflag").css({"background-image":"url("+teamflags.blueflag+"), url("+roundparas.bluelogo+")"});
			if(self.gamestatus==1){
				$(".tug-timebox span").each(function(i,v){
					$(this).text(data.roundtime[i]);
				});
			}

		},
		bindEvent: function() {
			var self = this;
			$(".tug-start").off('click').on('click',function(){
				if(screensocket.isclose) return;
				if(parseInt($(".tug-bottombg .tug-leftperson span").text())==0||parseInt($(".tug-bottombg .tug-rightperson span").text())==0) return layerBox.showMsg('每队至少有1人才能开始游戏');
				if(self.stopclick) return;
				self.stopclick = true;
				screencore.hideFootAndQr();
				clearInterval(self.joinInterval);
				screencore.ajaxSubmit("/screen/common/gamestart",{'gametype':XCV3Config.gametype}).then(function(data){
					 if(data.code!=0){
						layerBox.showMsg(data.msg);
					 }
				}, function(){
					  self.stopclick = false;
					  layerBox.showMsg('网络太差，请稍后重试');
				});
			});
			$(".endrankbtn").off('click').on('click',function(){
				$(".tug-rankbox").show();
			});
			$(".tug-closerank").off('click').on('click',function(){
				$(".tug-rankbox").hide();
			});
			$(".tug-endbox .endnextbtn,.tug-endbox .restart").off('click').on('click',function(){
				screencore.gameautocreate();
			});
			keyboardJS.off(['space','right','shift']);
			keyboardJS.bind('space', function(e) {
				if(self.gamestatus==1){
					$(".tug-start").trigger('click');
				}
			});
			keyboardJS.bind('right', function(e) {
				if(self.gamestatus==2){
					layerBox.showConfirm('警告','当前轮次还未结束，确定要强制结束么?',['确定','取消'],function(){
						screencore.ajaxSubmit("/screen/common/gameend",{'gametype':XCV3Config.gametype}).then(function(data){});
					});
				}else{
					self.gamestatus!=1&&$(".tug-endbox .endnextbtn").trigger('click');
				}
			});
			keyboardJS.bind('shift', function(e) {
				if(self.gamestatus==1||self.gamestatus==2) return;
				if(!$(".tug-endbox").is(":hidden")&&$(".tug-drawbox").is(":hidden")){
					if(!$(".tug-rankbox").is(":hidden")){//已经显示了大力士排名
						$(".tug-closerank").trigger('click');//关闭
					}else{
						$(".endrankbtn").trigger('click');//显示
					}
				}
			});
		},
		rushDom:function(data){
			var self = this;
			var self = this;
			self.rusers = data.rusers;
			self.busers = data.busers;
			self.rscore = data.rscore;
			self.bscore = data.bscore;
			var leftdata = data.rusers;
			var rightdata = data.busers;
			var lusers = $($(".play-box-left .player").get().reverse());
			var rusers = $($(".play-box-right .player").get().reverse());
			lusers.each(function(index,item) {
				var q = $(this);
				var j = leftdata[index],
					i = " ",
					o;
				if (j) {
					i = j.nickname;
					o = j.avatar;
					q.find(".player-nickname").text(i);
					q.find(".player-user").css({"background-image":"url("+o+")"});
				}
				if (j) {
					q.find(".player-user").css("visibility", "visible");
				} else {
					q.find(".player-user").css("visibility", "hidden")
				}
			});
			rusers.each(function(index,item) {
				var q = $(this);
				var j = rightdata[index],
					i = " ",
					o;
				if (j) {
					i = j.nickname;
					o = j.avatar;
					q.find(".player-nickname").text(i);
					q.find(".player-user").css({"background-image":"url("+o+")"});
				}
				if (j) {
					q.find(".player-user").css("visibility", "visible");
				} else {
					q.find(".player-user").css("visibility", "hidden")
				}
			});
			var rscore = data.rscore;
			var bscore = data.bscore;
			if(rscore>bscore){
				var moveleft = screencore.randomInt(-100,-1);
			}else{
				var moveleft = screencore.randomInt(1,100);
			}
			if(rscore==bscore){
				moveleft = 0;
			}
			$(".tug-usering").css({'left':"calc(((100% - 1285px) / 2) + " + moveleft + "px)"});
		},
		showEndUser:function(){
			var self = this;
			var rrankhtml = '';
			$.each(self.rusers,function(k,v){
				if(k < self.gamephb){
					v.num = k;
					v.rankimg = rankimgs[k];
					rrankhtml += self.rankRender(v);
				}
			})
			$(".tug-rrank .hasavatar").remove();
			$(".tug-rrank .tug-rankcell-title").after(rrankhtml);
			var brankhtml = '';
			$.each(self.busers,function(k,v){
				if(k < self.gamephb){
					v.num = k;
					v.rankimg = rankimgs[k];
					brankhtml += self.rankRender(v);
				}
			})
			$(".tug-brank .hasavatar").remove();
			$(".tug-brank .tug-rankcell-title").after(brankhtml);
			$(".tug-readybox").hide();
			if(self.rscore>self.bscore){
				//红队赢
				$(".tug-rrank .tug-wincpu").removeClass('display-none');
				$(".tug-rrank .tug-ranklogo").addClass('winlogo');
				$(".tug-brank .tug-ranklogo").addClass('faillogo');
				$(".tug-endbottom .tug-winbox .tug-rteamwin").removeClass('display-none');
				$(".tug-endbottom .tug-winbox").removeClass('display-none');
			}
			if(self.rscore<self.bscore){
				//蓝队赢
				$(".tug-brank .tug-wincpu").removeClass('display-none');
				$(".tug-rrank .tug-ranklogo").addClass('faillogo');
				$(".tug-brank .tug-ranklogo").addClass('winlogo');
				$(".tug-endbottom .tug-winbox .tug-bteamwin").removeClass('display-none');
				$(".tug-endbottom .tug-winbox").removeClass('display-none');
			}
			if(self.rscore==self.bscore){
				//平局
				$(".tug-endbottom .tug-drawbox").removeClass('display-none');
			}
			$(".tug-endbox").show();
		},
		showLastRoundUser:function(){
			var self = this;
			screencore.ajaxSubmit('/screen/common/getLastrotatephb',{'gametype':XCV3Config.gametype}).then(function(data){
				 if(data.code==0){
					 var lastusers = data.msg;
					 if(lastusers=='1'){
						$(".shake-mainbox .emptybox").removeClass("display-none");
						$(".tug-start").addClass('display-none');
					 }else{
						var tipindex = layerBox.showLoading('无正在进行的轮次，直接显示最后一轮结果');
						setTimeout(function(){
							layerBox.close(tipindex);
						},1e3);
						self.bindEvent();
						self.gamephb = lastusers.gamephb;
						self.rusers = lastusers.users.rusers;
						self.busers = lastusers.users.busers;
						self.rscore = lastusers.users.rscore;
						self.bscore = lastusers.users.bscore;
						self.initPage(lastusers);
						self.showEndUser();
						$(".endrankbtn").trigger('click');//显示
					 }
				 }else{
					layerBox.showMsg(data.msg);
				 }
			}, function(){
				  layerBox.showMsg('网络太差，请稍后重试');
			});
			
		},
		rushuser:function(data){
			var self = this;
			$(".tug-bottombg .tug-leftperson span").text(data.r);
			$(".tug-bottombg .tug-rightperson span").text(data.b);
			if(self.autorun==1){
				if(self.gamestatus==1 && data.r >= self.autonum && data.b >= self.autonum){
					self.autostart();
				}
			}
		},
		autostart:function(){
			var self = this;
			clearInterval(self.joinInterval);
			setTimeout(function(){
				$(".tug-start").trigger('click');
			},1e3)
		}
	};
	return screentug;
});
