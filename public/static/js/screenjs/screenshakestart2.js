/*
* @Author: 赞木
* @Date:   2023-03-09 15:29:54
* @Last Modified by:   赞木
* @Last Modified time: 2023-03-09 16:00:39
*/
define('screenshakestart2',['screensocket','screencore','template','layerBox','fulldm','keyboard','snabbt','threejs','pxPreload'],function(screensocket,screencore,template,layerBox,fulldm,keyboardJS,snabbt,THREE,pxPreload){
THREE.CSS3DObject=function(a){THREE.Object3D.call(this);this.element=a;this.element.style.position="absolute";this.addEventListener("removed",function(){if(this.element.parentNode!==null){this.element.parentNode.removeChild(this.element)}})};THREE.CSS3DObject.prototype=Object.create(THREE.Object3D.prototype);THREE.CSS3DObject.prototype.constructor=THREE.CSS3DObject;THREE.CSS3DSprite=function(a){THREE.CSS3DObject.call(this,a)};THREE.CSS3DSprite.prototype=Object.create(THREE.CSS3DObject.prototype);THREE.CSS3DSprite.prototype.constructor=THREE.CSS3DSprite;THREE.CSS3DRenderer=function(){console.log("THREE.CSS3DRenderer",THREE.REVISION);var d,g;var n,l;var m=new THREE.Matrix4();var a={camera:{fov:0,style:""},objects:{}};var i=document.createElement("div");i.style.overflow="hidden";this.domElement=i;var j=document.createElement("div");j.style.WebkitTransformStyle="preserve-3d";j.style.MozTransformStyle="preserve-3d";j.style.transformStyle="preserve-3d";i.appendChild(j);var c=/Trident/i.test(navigator.userAgent);this.setClearColor=function(){};this.getSize=function(){return{width:d,height:g}};this.setSize=function(q,p){d=q;g=p;n=d/2;l=g/2;i.style.width=q+"px";i.style.height=p+"px";j.style.width=q+"px";j.style.height=p+"px"};function o(p){return Math.abs(p)<1e-10?0:p}function k(p){var q=p.elements;return"matrix3d("+o(q[0])+","+o(-q[1])+","+o(q[2])+","+o(q[3])+","+o(q[4])+","+o(-q[5])+","+o(q[6])+","+o(q[7])+","+o(q[8])+","+o(-q[9])+","+o(q[10])+","+o(q[11])+","+o(q[12])+","+o(-q[13])+","+o(q[14])+","+o(q[15])+")"}function f(p,s){var q=p.elements;var r="matrix3d("+o(q[0])+","+o(q[1])+","+o(q[2])+","+o(q[3])+","+o(-q[4])+","+o(-q[5])+","+o(-q[6])+","+o(-q[7])+","+o(q[8])+","+o(q[9])+","+o(q[10])+","+o(q[11])+","+o(q[12])+","+o(q[13])+","+o(q[14])+","+o(q[15])+")";if(c){return"translate(-50%,-50%)translate("+n+"px,"+l+"px)"+s+r}return"translate(-50%,-50%)"+r}function b(q,v,w){if(q instanceof THREE.CSS3DObject){var u;if(q instanceof THREE.CSS3DSprite){m.copy(v.matrixWorldInverse);m.transpose();m.copyPosition(q.matrixWorld);m.scale(q.scale);m.elements[3]=0;m.elements[7]=0;m.elements[11]=0;m.elements[15]=1;u=f(m,w)}else{u=f(q.matrixWorld,w)}var s=q.element;var t=a.objects[q.id]&&a.objects[q.id].style;if(t===undefined||t!==u){s.style.WebkitTransform=u;s.style.MozTransform=u;s.style.transform=u;a.objects[q.id]={style:u};if(c){a.objects[q.id].distanceToCameraSquared=e(v,q)}}if(s.parentNode!==j){j.appendChild(s)}}for(var r=0,p=q.children.length;r<p;r++){b(q.children[r],v,w)}}var e=function(){var q=new THREE.Vector3();var p=new THREE.Vector3();return function(s,r){q.setFromMatrixPosition(s.matrixWorld);p.setFromMatrixPosition(r.matrixWorld);return q.distanceToSquared(p)}}();function h(r){var p=Object.keys(a.objects).sort(function(t,s){return a.objects[t].distanceToCameraSquared-a.objects[s].distanceToCameraSquared});var q=p.length;r.traverse(function(t){var s=p.indexOf(t.id+"");if(s!==-1){t.element.style.zIndex=q-s}})}this.render=function(s,r){var p=r.projectionMatrix.elements[5]*l;if(a.camera.fov!==p){i.style.WebkitPerspective=p+"px";i.style.MozPerspective=p+"px";i.style.perspective=p+"px";a.camera.fov=p}s.updateMatrixWorld();if(r.parent===null){r.updateMatrixWorld()}var t="translateZ("+p+"px)"+k(r.matrixWorldInverse);var q=t+"translate("+n+"px,"+l+"px)";if(a.camera.style!==q&&!c){j.style.WebkitTransform=q;j.style.MozTransform=q;j.style.transform=q;a.camera.style=q}b(s,r,t);if(c){h(s)}}};
var screenshakestart2 = {
		ballconfig:{
			watercolor:"rgba(0,0,0,.32)",
			oW:500,
			lineWidth:0.1,
			range:0.2,//浪幅
			nowrange:0.2,  
			sp:0,//周期偏移量
			waveupsp:0.002,//水波上涨速度
			soffset:0,//圆动画起始位置
		},
		ballcanvas:null,
		ballctx:null,
		ballstartpos:[],
		ballarcStack:[], // 圆栈
		isdrawcircle:false,
		drawBalltimer:null,
		djslocalkey:'',
		startdjslocalkey:'',
		init:function(){
			var self = this;
			self.initball();
		},
		iserror:true,
		checkcircleendtimer:null,
		newUserTimer:null,
		showUserStatus:false,
		phbnum:10,
		initsocket:function(){
			var self  = this;
			var params = {};
			params.onmessage = function(data){
				if(data.type=='connected'){
					screensocket.isclose = false;
					screencore.connectsocket({clientid:data.clientid});
				}else if(data.type=='gameiswait'){
					clearInterval(self.newUserTimer);
					if(showjoin=='1'){
						self.newUserTimer = setInterval(function(){
						   if(self.newjoinarr.length > 0){
						        if(!self.showUserStatus){
	    				            var newshow = self.newjoinarr.shift();
	                				self.showUserStatus = true;
	                				self.showNewuser(newshow.avatar,newshow.nickname);
	            			    }
						    }else if(self.oldjoinarr.length > 0){
						        if(!self.showUserStatus){
	    				            var newshow = self.oldjoinarr[Math.floor((Math.random()*self.oldjoinarr.length))];
	                				self.showUserStatus = true;
	                				self.showNewuser(newshow.avatar,newshow.nickname);
	            			    }
						    }
						},2e3);
					}
					self.oldjoinarr = data.oldusers;
					localStorage.removeItem(self.djslocalkey);
					localStorage.removeItem(self.startdjslocalkey);
				}else if(data.type=='gameisrun'){
					if(self.isdraw=='2'){
						return false;
					}
					self.oldjoinarr = data.oldusers;
					self.isdraw = '2';
					clearInterval(self.checkcircleendtimer);
					self.checkcircleendtimer = setInterval(function(){
						if(self.isdrawcircle){
							clearInterval(self.checkcircleendtimer);
							self.startopen('1');
						}
					},10);
					var startdata = localStorage.getItem(self.startdjslocalkey);
					if(startdata!=null && startdata!="null" && startdata!=-1){
						self.nowdata = parseFloat(startdata.split('-')[0]);
						self.waterdata = parseFloat(startdata.split('-')[1]);
						self.drawPercent();
					}
				}else if(data.type=='gameisend'){
					if(self.isdraw != '3') self.endstart('1');
				}else if(data.type=='gameisdjs'){
					self.iserror = false;
					self.waterdata = (totaltime - data.djs) / totaltime;
					if(!self.drawptimer) {
						self.drawptimer = setInterval(function(){
							self.drawPercent();
						},1e2);
					}
					if(data.djs==0){
						localStorage.setItem(self.startdjslocalkey,-1);
						self.waterdata = 1;
						setTimeout(function(){
							self.nowdata = 1;
							clearInterval(self.drawptimer);
							self.drawPercent();
						},2e2);
					}
				}else if(data.type=='gamescore'){
					self.waterdata = data.allscore / maxscore;
				}else if(data.type=='gamejoin'){
					if(data.wxuser){
						var wxuser = data.wxuser
				        var addnewjoin = true;
				        if(self.oldjoinarr.length > 0){
				            for(var i=0;i<self.oldjoinarr.length;i++){
				                if(self.oldjoinarr[i].openid == wxuser.openid){
				                    addnewjoin = false;
				                    break;
				                }
				            }
				        }
				        if(addnewjoin){
				        	self.oldjoinarr.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
				            self.newjoinarr.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
				        }
				        if(wxuser.areaname && wxuser.areaname!=''){
				        	self.areaonejoin(wxuser);
				        }
				    }
				}else if(data.type=='gameshakestartrefresh'){
					//后台重置则重新开始游戏
					window.location.reload();
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
			screensocket.init(params);
		},
		initball:function(){
			var self = this;
			self.phbnum = phbnum;
			self.djslocalkey = XCV3Config.hdid + 'currentTime';
			self.startdjslocalkey = XCV3Config.hdid + 'remainTime';
			self.ballcanvas = document.getElementById("ball");
			self.ballctx = self.ballcanvas.getContext('2d');
			self.ballconfig.oW = ballsize;//重置圆直径
			if(starttype=='1'){
				self.ballconfig.waveupsp = ((1/(totaltime-1))/60);
				self.ballconfig.waveupsp = parseFloat(self.ballconfig.waveupsp.toFixed(4));
			}
			self.ballconfig.ballhalfr = self.ballconfig.oW / 2;// 圆半径
			self.ballconfig.ballR = (self.ballconfig.oW / 2) - 8 * self.ballconfig.lineWidth;//canvas圆半径 减去8倍线宽
			// 水波动画初始参数
			self.ballconfig.axisLength = 2 * (self.ballconfig.oW / 2) - 16 * self.ballconfig.lineWidth;  // Sin 图形长度
			self.ballconfig.unit = self.ballconfig.axisLength / 8;// 波浪宽
			self.ballconfig.xoffset = 8*self.ballconfig.lineWidth; //波纹 x 轴偏移量
			self.ballconfig.bR = self.ballconfig.ballhalfr - 8*self.ballconfig.lineWidth;// 圆动画初始参数
			self.ballconfig.soffset = -(Math.PI/2);
			var maxsoffset = self.ballconfig.soffset + 2*Math.PI,oneoffset = 1/(8*Math.PI);
			// 获取圆动画轨迹点集
			for( var i = self.ballconfig.soffset; i < maxsoffset; i += oneoffset ) {
				self.ballarcStack.push([
					self.ballconfig.ballhalfr + self.ballconfig.bR * Math.cos(i),
					self.ballconfig.ballhalfr + self.ballconfig.bR * Math.sin(i)
				])
			}
			self.ballstartpos = self.ballarcStack.shift();//圆起始点
			self.ballctx.beginPath();
			self.ballctx.lineWidth = self.ballconfig.lineWidth;
			self.ballctx.strokeStyle = "transparent";//球体外圈颜色
			self.ballctx.moveTo(self.ballstartpos[0],self.ballstartpos[1]);
			self.drawBalltimer = setInterval(function(){
		  		self.drawBallcircle();
		    },1);
		    if(showstars=='1') self.initstar();
		    if(showflower=='1' && flowertype=='1') self.initpaper();
		    self.preloadAll(function(result){
		    	$(".loading-box .load-percent").text('100%');
				$(".load-progress span").css('width','100%');
				$(".loading-box").remove();
				result = result||{};
				console.log(result);
				var djsvideo = result.djsvideo||'',startbgvideo = result.startbgvideo||'',endbgvideo = result.endbgvideo||'';
				if(djsvideo!=''){
					if(djsvideo.status=='2'){
						return layerBox.showMsg('倒计时视频文件加载错误，请刷新重试','0');
					}
					var muted = '';
					if($("#djsaudio").length > 0){
						muted = 'muted';
					}
					$(".videosbox").append('<video '+muted+' class="djsvideo hidden" src="'+djsvideo.src+'" dir="'+djsvideo.dir+'" width="'+djsvideo.w+'" height="'+djsvideo.h+'" time="'+djsvideo.duration+'"></video>');
				}
				if(startbgvideo!=''){
					if(startbgvideo.status=='2'){
						return layerBox.showMsg('启动中背景视频文件加载错误，请刷新重试');
					}
					var muted = '';
					if($("#startaudio").length > 0){
						muted = 'muted';
					}
					$(".videosbox").append('<video '+muted+' class="startvideo hidden" src="'+startbgvideo.src+'" dir="'+startbgvideo.dir+'" width="'+startbgvideo.w+'" height="'+startbgvideo.h+'" time="'+startbgvideo.duration+'" loop="loop"></video>');
				}
				if(endbgvideo!=''){
					if(startbgvideo.status=='2'){
						return layerBox.showMsg('启动后背景视频文件加载错误，请刷新重试');
					}
					var muted = '';
					if($("#overaudio").length > 0){
						muted = 'muted';
					}
					$(".videosbox").append('<video '+muted+' class="endvideo hidden" src="'+endbgvideo.src+'" dir="'+endbgvideo.dir+'" width="'+endbgvideo.w+'" height="'+endbgvideo.h+'" time="'+endbgvideo.duration+'" loop="loop"></video>');
				}
				self.rankrender = template('rank-tpl');
				self.initevent();
				self.initsocket();
		    });
		    if(scanqrfly=='1' || showavatars=='1') self.stageInit();
		},
		showNewuser:function(avatar,nickname){
            var self = this;
        	var posfrom = [
        			[800,-800,3e3],
        			[800,800,3e3],
        			[-800,800,3e3],
        			[-800,-800,3e3],
        	];
        	//var e =  nickname || '木木';
        	var l = "UserShakstart" + (new Date).getTime();
        	var r = '<div id="' + l + '" class="new-sign zam-app-flex-ajCenter"><img src="' + avatar + '" class="avatar"></a><p class="nickname limitbox">' + nickname + "</p></div>";
        	$("body").append(r);
        	$("#" + l).snabbt({
        		fromPosition: posfrom[Math.floor(Math.random()*posfrom.length)],
        		fromRotation: [0, 2 * Math.PI, 0],
        		fromScale: [2, 2],
        		posotion: [0, 0, 2e3],
        		scale: [1, 1],
        		rotation: [0, 0, 0],
        		duration: 1000,
        		easing: "easeOut",
        		complete: function() {
        			$("#" + l).snabbt({
        				position:[0,0,0],
        				rotation:[0,0,0],
        				duration: 500,
        				scale: [.25, .25],
        				easing: "easeIn",
        				delay: 200,
        				complete: function() {
        					$("#" + l).remove(),self.showUserStatus=false;
        				}
        			})
        		}
        	})
        },
        isopenreset:false,
        scanqrtimer:null,
		initevent:function(){
			var self = this;
			if($(".videoBg").length >0) {
				$(".videoBg").addClass('isplaying');
			}
			$(window).on('resize',function(){
				var resizev = $(".videosbox video:not(.hidden)");
				if(resizev.length > 0){
					screencore.videofullScreen(resizev.get(0),screencore.getvideoData(resizev.get(0)));
				}
			});
			keyboardJS.bind('space', function(e) {
				if(screensocket.isclose) return false;
				if(self.isdraw=='1'){
					if(scanqropen=='1'){
						//展示扫码
						if(scanqrfly=='1') {
							self.stageStop = false;
						}
						$(".scanqrbox").removeClass('hidden');
						screencore.ajaxSubmit("/screen/shakestart/gameusercount",{}).then(function(data){
							 if(data.code==0){
							 	screencore.animatenum(data.msg+'');
							 }
						});
						self.scanqrtimer = setInterval(function(){
							screencore.ajaxSubmit("/screen/shakestart/gameusercount",{}).then(function(data){
								 if(data.code==0){
								 	$(".animateNum").text(data.msg);
								 }
							});
						},2e3);
						scanqropen = '2';
						if(self.newUserTimer!=null) {
							clearInterval(self.newUserTimer);
							$(".new-sign").addClass('hidden');
						}
					}else{
						$(".scanqrbox").addClass('hidden');
						if(scanqrfly=='1'){
							$('.threeBox').addClass('hidden');
							self.stageStop = true;
						}
						if(self.scanqrtimer!=null){
							clearInterval(self.scanqrtimer);
						}
						self.isdraw = '2';
						if(self.newUserTimer!=null) {
							clearInterval(self.newUserTimer);
							$(".new-sign").addClass('hidden');
						}
						screencore.ajaxSubmit("/screen/shakestart/gamestart",{'status':'2'}).then(function(data){
							 if(data.code!=0){
							 	self.isdraw = '1';
								layerBox.showMsg(data.msg);
							 }else{
							 	var canopentimer = setInterval(function(){
									if(self.isdrawcircle){
										clearInterval(canopentimer);
										self.startopen();
									}
								},10);
							 }
						}, function(){
							  self.isdraw = '1';
							  layerBox.showMsg('网络太差，请稍后重试');
						});
					}
				}else if(self.isdraw=='2'){
					if($(".djsvideo").length >0 && !$(".djsvideo").is(":hidden")){
						return;
					}
					if(starttype=='2' && !self.isforceopen){
						//强制成绩助力
						clearInterval(self.scoretimer);
						self.isforceopen = true;
						self.waterdata = 1;
						setTimeout(function(){
							self.ballconfig.waveupsp = 0.008;
						},1e3);
					}
				}else{
					if(self.isopenreset){
						return false;
					}
					self.isopenreset = true;
					var layindex = layerBox.showConfirm('警告','重置启动状态为未开始，将导致摇一摇启动用户数据被删除，您确定要重置么?',['确定','取消'],function(){
						screencore.ajaxSubmit("/screen/shakestart/gamereset",{'status':'1'}).then(function(data){
							 if(data.code!=0){
							 	self.isopenreset = false;
								layerBox.showMsg(data.msg);
							 }else{
							 	layerBox.showMsg('操作成功');
							 	setTimeout(function(){
							 		window.location.reload();
							 	},1e3);
							 }
						}, function(){
							  self.isopenreset = false;
							  layerBox.showMsg('网络太差，请稍后重试');
						});
					},function(){
						self.isopenreset = false;
					});
				}
			});
			keyboardJS.bind('.', function(e) {
				if(self.isdraw == '1'){
					var videoobj = $('.videoBg.isplaying');
					if(videoobj.length > 0){
						if(videoobj[0].paused){
							videoobj[0].play();
						}else{
							videoobj[0].pause();
						}
					}
				}else if(self.isdraw == '2'){
					var videoobj = $('.startvideo.isplaying');
					if(videoobj.length > 0){
						if(videoobj[0].paused){
							videoobj[0].play();
						}else{
							videoobj[0].pause();
						}
					}
				}else{
					var videoobj = $('.endvideo.isplaying');
					if(videoobj.length<=0){
						videoobj = $('.startvideo.isplaying');
					}
					if(videoobj.length > 0){
						if(videoobj[0].paused){
							videoobj[0].play();
						}else{
							videoobj[0].pause();
						}
					}
				}
			});
			var isajaxpm = false;
			keyboardJS.bind(',',function(e){
				if(self.showphb==2 || self.isdraw!='3'){
					return false;
				}
				if($(".rankBox").length <= 0){
					if(self.rankTen.length==0){
						if(isajaxpm){
							return false;
						}
						isajaxpm = true;
						screencore.ajaxSubmit("/screen/shakestart/gamepm",{},'正在加载排名...').then(function(data){
							if(data.code==0){
								//self.rankTen = data.msg;
								self.gameEndphb(data.msg,self.phbnum);
							}else{
								layerBox.showMsg(data.msg);
							}
							isajaxpm = false;
						},function(){
							isajaxpm = false;
							layerBox.showMsg('加载出现异常，请刷新重试');
						});
					}else{
						self.gameEndphb(self.rankTen,self.phbnum);
					}
				}else{
					$(".rankBox").remove();
				}
			})
		},
		isforceopen:false,
		isdjstimer:null,
		startopen:function(type){
			var self = this,type = type||'2',djsvideo = $(".videosbox .djsvideo"),playcurrent = localStorage.getItem(self.djslocalkey),videotime = parseInt(djsvideo.attr('time'));
			if(playcurrent!=null && playcurrent!="null"){
				currentTime = playcurrent;
			}else{
				currentTime = 0;
			}
			if($("#bgmusic").length >0 && !$("#bgmusic")[0].paused){
		  		$("#bgmusic")[0].pause();
		  	}
			if($(".videoBg").length > 0) {
				$(".videoBg").addClass('hidden').removeClass('isplaying');
				$(".videoBg")[0].pause();
			}
			if(djsvideo.length > 0 && currentTime!=-1){
				screencore.videofullScreen(".videosbox .djsvideo",screencore.getvideoData(djsvideo[0]));
				djsvideo.removeClass('hidden');
				if(currentTime > 0 && currentTime < videotime){
					djsvideo[0].currentTime = currentTime;
				}
				if($("#djsaudio").length > 0){
					djsvideo[0].play();
		  			$("#djsaudio")[0].play();
		  		}else{
		  			djsvideo[0].play().then(() => {
		           		
			        }).catch(err => {
			        	djsvideo[0].volume = 0;
						djsvideo[0].play();
			        });
		  		}
				self.isdjstimer = setInterval(function(){
					screencore.ajaxSubmit("/screen/shakestart/gameiscountdown",{}).then(function(data){});
				},1e3);
				djsvideo.unbind('ended').bind('ended',function(){
					clearInterval(self.isdjstimer);
					localStorage.setItem(self.djslocalkey,-1);
					if($("#djsaudio").length >0 && !$("#djsaudio")[0].paused){
				  		$("#djsaudio")[0].pause();
				  	}
					self.confirmStart(type);
				});
				djsvideo.unbind('timeupdate').bind("timeupdate",function(){
					localStorage.setItem(self.djslocalkey,Math.floor(djsvideo[0].currentTime));
				});
			}else{
				self.confirmStart(type);
			}
			screencore.hideFootAndQr();
		},
		scoretimer:null,
		confirmStart:function(type){
			var self = this,startvideo = $(".videosbox .startvideo");
			if(self.isdjstimer!=null) clearInterval(self.isdjstimer);
		  	if(startvideo.length > 0){
		  		screencore.videofullScreen(".videosbox .startvideo",screencore.getvideoData(startvideo[0]));
			  	startvideo.removeClass('hidden').addClass('isplaying');
			  	if($("#startaudio").length > 0){
					startvideo[0].play();
				}else{
					startvideo[0].play().then(() => {
			        }).catch(err => {
			        	startvideo[0].volume = 0;
						startvideo[0].play();
			        });
			    }
		  	}else{
		  		$(".main-bg").css({"background-image":"url("+$(".videosbox .startimg").attr("src")+")"});
		  	}
		  	setTimeout(function(){
		  		$(".videosbox .djsvideo").addClass('hidden');
		  	},2e2);
		  	if(showball=='1') {
		  		$(".ballBox").removeClass('hidden');
		  	}else{
		  		if(showpercent=='1'){
		  			$(".ballBox").css("background",'none').removeClass('hidden');
		  			$(".ball").addClass('hidden');
		  		}
		  	}
		  	if(showavatars=='1') self.stageStop = false;
		  	if($("#djsaudio").length >0 && !$("#djsaudio")[0].paused){
		  		$("#djsaudio")[0].pause();
		  	}
		  	if($("#startaudio").length > 0){
		  		$("#startaudio")[0].play();
		  	}
		  	self.drawballSine();
		  	if(starttype=='2'){
		  		//成绩助力
		  		if(type=='2'){
		  			screencore.ajaxSubmit("/screen/shakestart/gameconfirmstart",{starttype:starttype}).then(function(data){});
		  		} 
		  		//发起定时获取在线用户成绩
		  		clearInterval(self.scoretimer);
		  		self.scoretimer = setInterval(function(){
		  			screencore.ajaxSubmit("/screen/shakestart/gamescore",{}).then(function(data){});
		  		},1e3);
		  	}else{
		  		//时间助力
		  		if(type=='2'){
		  			screencore.ajaxSubmit("/screen/shakestart/gameconfirmstart",{starttype:starttype,totaltime:totaltime}).then(function(data){});
		  		}else{
		  			//检查是否有倒计时发过来 有则无需再次转变游戏已经开始
			  		setTimeout(function(){
						if(self.iserror && self.isdraw=='2'){
							self.nowdata = 0;
							self.waterdata = 0;
							screencore.ajaxSubmit("/screen/shakestart/gameconfirmstart",{starttype:starttype,totaltime:totaltime}).then(function(data){});
						}
					},15e2);
				}
		  	}
		},
		waterdata:0,//水量 等于1即为100%
		nowdata:0,
		drawBallcircle:function (){
			var self = this;
			self.ballctx.clearRect(0,0,self.ballconfig.oW,self.ballconfig.oW);
			if (self.ballarcStack.length > 0) {
				  var firstpos = self.ballarcStack.shift();
				  self.ballctx.lineTo(firstpos[0],firstpos[1])
				  self.ballctx.stroke();
			} else {
				  clearInterval(self.drawBalltimer);
				  self.ballctx.lineTo(self.ballstartpos[0],self.ballstartpos[1])
				  self.ballctx.stroke();
				  self.ballarcStack = [];
				  self.ballctx.globalCompositeOperation = 'destination-over';
				  self.ballctx.beginPath();
				  //self.ballctx.lineWidth = lineWidth;
				  self.ballctx.arc(self.ballconfig.ballhalfr,self.ballconfig.ballhalfr, self.ballconfig.bR, 0, 2*Math.PI, 1);
				  self.ballctx.beginPath();  
				  self.ballctx.save();
				  self.ballctx.arc(self.ballconfig.ballhalfr,self.ballconfig.ballhalfr, self.ballconfig.ballhalfr - 8*self.ballconfig.lineWidth, 0, 2*Math.PI, 1);
				  self.ballctx.restore()
				  self.ballctx.clip();
				  self.ballctx.fillStyle = "transparent";
				  self.isdrawcircle = true;
			}
		},
		drawballSinetimer:null,
		drawSine:function() {
			var self = this,sinestack = [];
            self.ballctx.beginPath();
            self.ballctx.save();
            // 记录起始点和终点坐标
            for (var i = self.ballconfig.xoffset; i <= self.ballconfig.xoffset + self.ballconfig.axisLength; i+=20/self.ballconfig.axisLength) {
                var x = self.ballconfig.sp + (self.ballconfig.xoffset + i) / self.ballconfig.unit,y = Math.sin(x) * self.ballconfig.nowrange,dy = 2 * self.ballconfig.ballR * ( 1- self.nowdata ) + (self.ballconfig.ballhalfr - self.ballconfig.ballR) - (self.ballconfig.unit * y);
                self.ballctx.lineTo(i, dy);
                sinestack.push([i,dy]);
            }
            // 获取初始点
            self.ballctx.lineTo(self.ballconfig.xoffset + self.ballconfig.axisLength,self.ballconfig.oW);
            self.ballctx.lineTo(self.ballconfig.xoffset,self.ballconfig.oW);
            self.ballctx.lineTo(sinestack[0][0], sinestack[0][1])
            self.ballctx.fillStyle = watercolor;
            self.ballctx.fill()
            self.ballctx.restore();
            if(starttype=='2') self.drawPercent();
	    },
	    drawPercent:function() {
          var self = this,txt = ((self.nowdata*10000)/100);
          $(".ballpercent").text(txt.toFixed(2) + '%');
        },
        randomInt:function(){
        	var arr = [1,11,21,31];
        	return arr[Math.floor(Math.random() * arr.length)];
        },
        isdraw:'1',
	    drawballSine:function(){
			var self = this;
			self.ballctx.clearRect(0,0,self.ballconfig.oW,self.ballconfig.oW);
			if (self.waterdata >= 0.85) {
			  if (self.ballconfig.nowrange > self.ballconfig.range/4) {
					self.ballconfig.nowrange -= self.ballconfig.range * 0.01;
			  }
			} else if (self.waterdata <= 0.1) {
			  if (self.ballconfig.nowrange < self.ballconfig.range*1.5) {
					self.ballconfig.nowrange += self.ballconfig.range * 0.01;
			  }
			} else {
			  if (self.ballconfig.nowrange <= self.ballconfig.range) {
					self.ballconfig.nowrange += self.ballconfig.range * 0.01;
			  }
			  if (self.ballconfig.nowrange >= self.ballconfig.range) {
					self.ballconfig.nowrange -= self.ballconfig.range * 0.01
			  }
			}
			localStorage.setItem(self.startdjslocalkey,self.nowdata+'-'+self.waterdata);
			if(self.waterdata - self.nowdata > 0) {
			  	self.nowdata += self.ballconfig.waveupsp;      
			}
			if(self.waterdata - self.nowdata < 0){
			  	self.nowdata -= self.ballconfig.waveupsp
			}
			if(starttype=='2' && self.nowdata > 0.99){
				self.nowdata = 1;
			}
			self.ballconfig.sp += 0.07; 
			self.drawSine();
			if(self.nowdata >=1 ){
				window.cancelAnimationFrame(self.drawballSinetimer);
				clearInterval(self.scoretimer);
				setTimeout(function(){
					screencore.ajaxSubmit("/screen/shakestart/gameend",{'status':'3'}).then(function(data){
						 if(data.code!=0){
							layerBox.showMsg(data.msg);
						 }else{
						 	localStorage.setItem(self.startdjslocalkey,-1);
						 	self.rankTen = data.msg;
						 	self.endstart();
						 }
					}, function(){
						  layerBox.showMsg('网络太差，请稍后重试');
					});
				},5e2);
			}else{
				self.drawballSinetimer = window.requestAnimationFrame(self.drawballSine.bind(this));
			}
	    },
	    rankTen:[],
	    endstart:function(type){
	    	var self = this,type = type||'2';
	    	localStorage.removeItem(self.djslocalkey);
	    	self.stageStop = true;
			$(".threeBox").empty();
			if(showball=='1'){
				setTimeout(function(){
					$(".ballBox").hide();
				},2e2);
			}else{
				if(showpercent=='1'){
					$(".ballpercent").hide();
				}
			}
	        if(showlogo=='1' && $(".logoBox img").attr('src') != ''){
	            $(".logoBox").removeClass('hidden');
	            $(".logoBox img").addClass('animated '+logoani);
	        }
			setTimeout(function(){
				if(showstars=='1' && showflower=='1'){
					self.starcanvas.play(function() {
						if(flowertype=='1'){
							self.papercanvas.play(function(){});
						}else{
							self.flowerstart();
						}
					});
				}else if(showstars=='1' && showflower=='2'){
					self.starcanvas.play(function() {});
				}else if(showstars=='2' && showflower=='1'){
					if(flowertype=='1'){
						self.papercanvas.play(function(){});
					}else{
						self.flowerstart();
					}
				}
				
			},1e3);
			self.isdraw = '3';
			if(type=='1' && $(".videoBg").length >0) {
				$(".videoBg").addClass('hidden').removeClass('isplaying');
				$(".videoBg")[0].pause();
			}
			var endvideo = $(".videosbox .endvideo"),endimg = $(".videosbox .endimg");
			if(endvideo.length > 0 || endimg.length > 0){
				if(type=='2'){
					if($(".videosbox .startvideo").length >0) {
						$(".videosbox .startvideo").addClass('hidden').removeClass('isplaying');
						$(".videosbox .startvideo")[0].pause();
					}
				}
			  	if(endvideo.length > 0){
			  		screencore.videofullScreen(".videosbox .endvideo",screencore.getvideoData(endvideo[0]));
				  	endvideo.removeClass('hidden').addClass('isplaying');
					//endvideo[0].play();
					if($("#overaudio").length > 0){
						endvideo[0].play();
					}else{
						endvideo[0].play().then(() => {
				        }).catch(err => {
				        	endvideo[0].volume = 0;
							endvideo[0].play();
				        });
				    }
			  	}else{
			  		$(".main-bg").css({"background-image":"url("+endimg.attr("src")+")"});
			  	}
		  	}else{
		  		if(type=='1'){
			  		var startvideo = $(".videosbox .startvideo");
				  	if(startvideo.length > 0){
				  		screencore.videofullScreen(".videosbox .startvideo",screencore.getvideoData(startvideo[0]));
					  	startvideo.removeClass('hidden').addClass('isplaying');
						startvideo[0].play();
				  	}else{
				  		$(".main-bg").css({"background-image":"url("+$(".videosbox .startimg").attr("src")+")"});
				  	}
			  	}
		  	}
		  	if($("#overaudio").length > 0){
		  		if($("#bgmusic").length >0 && !$("#bgmusic")[0].paused){
		  			$("#bgmusic")[0].pause();
		  		}
		  		if($("#startaudio").length >0 && !$("#startaudio")[0].paused){
		  			$("#startaudio")[0].pause();
		  		}
		  		$("#overaudio")[0].play();
		  	}
		  	if(type=='1'){
		  		layerBox.showMsg('启动已完成，可通过键盘空格键重置','0');
		  	}
	    },
	    starr:0,
	    stara:0,
	    staro:0,
	    stars:12,
	    staru:[],
	    starl:[],
	    initstar:function(){
	    	var self = this;
	    	self.starcanvas = $(".stars")[0];
	    	self.starctx = self.starcanvas.getContext('2d');
	    	self.starcanvas.resize = function(){
	    		self.starcanvas.width = window.innerWidth;
	    		self.starcanvas.height = window.innerHeight;
		    };
			self.starcanvas.play = function(e) {
                !function(e) {
                    $(".stars").removeClass('hidden');
                    requestAnimationFrame(function() {
                        self.starcanvas.width = window.innerWidth;
	    				self.starcanvas.height = window.innerHeight;
                        requestAnimationFrame(e)
                    })
                } (function() {
                    self.starcanvas.callback = e,
                    self.staru = [],
                    self.stari = 0,
                    self.starr = self.starcanvas.height,
                    self.starl = [],
                    self.stara = self.starcanvas.width,
                    self.staro = self.starcanvas.height,
                    requestAnimationFrame(self.starchange);
                })
			};
			self.starcanvas.reset = function(){
		    	self.starctx.clearRect(0, 0, self.starcanvas.width, self.starcanvas.height);
			    $(".stars").addClass('hidden');
		    };	    	
	    },
		starchange:function(){
			var self = screenshakestart2;
	        self.starctx.clearRect(0, 0, self.starcanvas.width, self.starcanvas.height);
	        var e = self.starconfig(self.staru, self.stari, self.starr);
	        t = self.starconfig(self.starl, self.stara, self.staro);
	        self.stari += self.stars;
	        self.stara -= self.stars;
	        self.staro = self.starr -= Math.round(self.starcanvas.height / self.starcanvas.width * self.stars);
	        var n = e && e.x > self.starcanvas.width && e.y < 0 && t && t.x < 0 && e.y < 0;
	        if (!n) return requestAnimationFrame(self.starchange);
	        self.starctx.clearRect(0, 0, self.starcanvas.width, self.starcanvas.height),
		    $(".stars").addClass('hidden');
	        requestAnimationFrame(self.starcanvas.callback);
		},
		starconfig:function(e, t, n){
			var self = this,i;
		    e.push(new
		    function(e, t) {
		        var r = {
		            rgb: (n = ["213,117,240", "126,201,231", "143,214,166", "255,224,102", "255,105,102"], n[Math.floor(Math.random() * n.length)]),
		            //rgb: (n = ["210,180,71"], n[Math.floor(Math.random() * n.length)]),
		            alp: 1,
		            r: 5,
		            x: e,
		            y: t,
		            vx: i(),
		            vy: i(),
		            draw: function() {
		                self.starctx.fillStyle = "rgba(" + r.rgb + "," + r.alp + ")";
		                var e, t, n = 2 * Math.PI / 2.5;
		                self.starctx.beginPath();
		                for (var i = 0; i < 5; i++) e = Math.round(r.x + r.r * Math.cos(n * i)),
		                t = Math.round(r.y + r.r * Math.sin(n * i)),
		                self.starctx.lineTo(e, t);
		                self.starctx.closePath(),
		                self.starctx.fill(),
		                r.x += r.vx,
		                r.y += r.vy,
		                r.r += 1;
		            }
		        };
		        var n;
		        return r;
		        function i() {
		            return (.5 < Math.random() ? 1 : -1) * Math.round(2 * Math.random())
		        }
		    } (t, n)),
		    e.length > 80 && (i = e.shift());
		    for (var r = 0; r < e.length; r++) a(e[r]);
		    return i;
		    function a(e) {
		        e.alp -= 1.01 / 80,
		        e.draw()
		    }
		},
		initpaper:function(){
			var self = this;
			self.papercanvas = $(".papers")[0];
			self.paperctx = self.papercanvas.getContext("2d");
			self.papercanvas.arr = [];
			for (var e = 0; e < 100; e++) {
				self.papercanvas.arr.push(self.makepapers());
			}
			self.papercanvas.resize = function(){
				self.papercanvas.width = window.innerWidth;
				self.papercanvas.height = window.innerHeight;
				self.papergetContext.clearRect(0, 0, self.papercanvas.width, self.papercanvas.height);
				self.papercanvas.arr.forEach(function(e) {
                    e.reset(1)
                });
			};
			self.papercanvas.play = function(e) {
				!function(e) {
			        $(".papers").removeClass('hidden');
			        requestAnimationFrame(function() {
			            self.papercanvas.width = window.innerWidth;
			            self.papercanvas.height = window.innerHeight;
			            self.paperctx.clearRect(0, 0, self.papercanvas.width, self.papercanvas.height);
			            self.papercanvas.arr.forEach(function(e) {
					        e.reset(1)
					    })
			            requestAnimationFrame(e)
			        })
			    } (function() {
			        self.paperreplay();
			        requestAnimationFrame(e)
			    })
			};
			self.papercanvas.reset = function() {
			    self.paperctx.clearRect(0, 0, self.papercanvas.width, self.papercanvas.height);
			    $(".papers").addClass('hidden');
			};
		},
		paperreplay:function () {
			var self = this;
            self.paperctx.clearRect(0, 0, self.papercanvas.width, self.papercanvas.height);
            self.papercanvas.arr.forEach(function(e) {
                e.draw()
            });
            requestAnimationFrame(self.paperreplay.bind(this));
        },
		makepapers:function () {
		    var self = screenshakestart2,i = self.papercanvas,r = {
		        w: 18,
		        h: 10,
		        x: 0,
		        y: 0,
		        vx: 0,
		        vy: 2,
		        rotate: 0,
		        color: "",
		        angleX: 0,
		        points: [],
		        reset: e,
		        draw: function() {
		            if (r.x += r.vx, r.y += r.vy, r.y > i.height + r.w / 2) return e();
		            if (r.y < -r.w / 2) return;
		            if (r.x < -r.w / 2 || r.x > i.width + r.w / 2) return;
		            r.points.forEach(function(e, t) {
		                e.rotateX(r.angleX)
		            }),
		            self.paperctx.fillStyle = r.color,
		            self.paperctx.save(),
		            self.paperctx.translate(r.x, r.y),
		            self.paperctx.rotate(r.rotate),
		            self.paperctx.beginPath(),
		            self.paperctx.moveTo(r.points[0].getScreenX(), r.points[0].getScreenY()),
		            r.points.forEach(function(e, t) {
		                t && self.paperctx.lineTo(e.getScreenX(), e.getScreenY())
		            }),
		            self.paperctx.closePath(),
		            self.paperctx.fill(),
		            self.paperctx.restore()
		        }
		    };
		    return r;
		    function e(e) {
		        var t;
		        r.x = Math.round(Math.random() * i.width),
		        r.y = e ? Math.round(Math.random() * i.height - i.height - r.w / 2) : -r.w / 2,
		        r.vx = a(1 * Math.random()),
		        r.rotate = a(Math.random() * Math.PI / 3),
		        r.color = (t = ["#00aecc", "#0079bf", "#b04632", "#d29034", "#89609e", "#519839", "#4bbf6b", "#cd5a91", "#428bca", "#5cb85c", "#5bc0de", "#f0ad4e", "#d9534f", "#6f5499"])[Math.floor(Math.random() * t.length)],
		        //r.color = (t = ["#d2b447"])[Math.floor(Math.random() * t.length)],
		        r.angleX = a(Math.random() * Math.PI / 20);
		        var n = [];
		        n.push(self.paperrotate( - r.w / 2, -r.h / 2)),
		        n.push(self.paperrotate(r.w / 2, -r.h / 2)),
		        n.push(self.paperrotate(r.w / 2, r.h / 2)),
		        n.push(self.paperrotate( - r.w / 2, r.h / 2)),
		        r.points = n
		    }
		    function a(e) {
		        return !e && (e = 1),(Math.round(Math.random()) ? 1 : -1) * e
		    }
		},
		paperrotate:function(e, t, n) {
		    var a = {
		        x: e || 0,
		        y: t || 0,
		        z: n || 0,
		        fl: 500,
		        vpX: 0,
		        vpY: 0,
		        cX: 0,
		        cY: 0,
		        cZ: 0,
		        setVanishingPoint: function(e, t) {
		            a.vpX = e,
		            a.vpY = t
		        },
		        setCenter: function(e, t, n) {
		            a.cX = e,
		            a.cY = t,
		            a.cZ = n
		        },
		        rotateX: function(e) {
		            var t = Math.cos(e),
		            n = Math.sin(e),
		            i = a.y * t - a.z * n,
		            r = a.z * t + a.y * n;
		            a.y = i,
		            a.z = r
		        },
		        rotateY: function(e) {
		            var t = Math.cos(e),
		            n = Math.sin(e),
		            i = a.x * t - a.z * n,
		            r = a.z * t + a.x * n;
		            a.x = i,
		            a.z = r
		        },
		        rotateZ: function(e) {
		            var t = Math.cos(e),
		            n = Math.sin(e),
		            i = a.x * t - a.y * n,
		            r = a.y * t + a.x * n;
		            a.x = i,
		            a.y = r
		        },
		        getScreenX: function() {
		            var e = a.fl / (a.fl + a.z + a.cZ);
		            return a.vpX + (a.cX + a.x) * e
		        },
		        getScreenY: function() {
		            var e = a.fl / (a.fl + a.z + a.cZ);
		            return a.vpY + (a.cY + a.y) * e
		        }
		    };
		    return a;
		},
		flowerstart:function(){
		    var self = this,container = document.getElementById('leafContainer');
		    for (var i = 0; i < 30; i++) {
		        container.appendChild(self.createALeaf());
		    }
		},
		randomInteger:function(low, high){
		    return low + Math.floor(Math.random() * (high - low));
		},
		randomFloat:function(low, high){
		    return low + Math.random() * (high - low);
		},
		pixelValue:function(value){
		    return value + 'px';
		}, 
		durationValue:function(value){
		    return value + 's';
		}, 
		createALeaf:function(){
		    var self = this,leafDiv = document.createElement('div'),image = document.createElement('img');
		    // image.src = PATH_URL+'realLeaf' + randomInteger(1, 5) + '.png';
		    image.src = flowerimg;
		    leafDiv.style.top = "-100px";
		    leafDiv.style.left = self.pixelValue(self.randomInteger(0,window.screen.width));
		    var spinAnimationName = (Math.random() < 0.5) ? 'clockwiseSpin' : 'counterclockwiseSpinAndFlip';
		    leafDiv.style.webkitAnimationName = 'fade, drop';
		    image.style.webkitAnimationName = spinAnimationName;
		    var fadeAndDropDuration = self.durationValue(self.randomFloat(5, 11));
		    var spinDuration = self.durationValue(self.randomFloat(4, 8));
		    leafDiv.style.webkitAnimationDuration = fadeAndDropDuration + ', ' + fadeAndDropDuration;
		    var leafDelay = self.durationValue(self.randomFloat(0, 5));
		    leafDiv.style.webkitAnimationDelay = leafDelay + ', ' + leafDelay;
		    image.style.webkitAnimationDuration = spinDuration;
		    leafDiv.appendChild(image);
		    return leafDiv;
		},
		oldjoinarr:[],
        newjoinarr:[],
        oldjoinarr1:[],
        newjoinarr1:[],
        oldjoinarr2:[],
        newjoinarr2:[],
        oldjoinarr3:[],
        newjoinarr3:[],
        oldjoinarr4:[],
        newjoinarr4:[],
        oldjoinarr5:[],
        newjoinarr5:[],
        areajoin:function(arr){
        	var self = this;
        	if(arr.length==0){
        		return false;
        	}
        	$.each(arr,function(i,v){
        		if(v.areaname && v.areaname!='') self.areaonejoin(v);
        	})
        },
        //南 西 中  东 北
        areaonejoin:function(wxuser){
        	console.log(wxuser);
        	var self = this,addnewjoin = true;
        	if(wxuser.areaname=='南区'){
        		if(self.oldjoinarr1.length > 0){
		            for(var i=0;i<self.oldjoinarr1.length;i++){
		                if(self.oldjoinarr1[i].openid == wxuser.openid){
		                    addnewjoin = false;
		                    break;
		                }
		            }
		        }
		        if(addnewjoin){
		        	self.oldjoinarr1.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
		            self.newjoinarr1.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
		        }
        	}else if(wxuser.areaname=='西区'){
        		if(self.oldjoinarr2.length > 0){
		            for(var i=0;i<self.oldjoinarr2.length;i++){
		                if(self.oldjoinarr2[i].openid == wxuser.openid){
		                    addnewjoin = false;
		                    break;
		                }
		            }
		        }
		        if(addnewjoin){
		        	self.oldjoinarr2.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
		            self.newjoinarr2.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
		        }
        	}else if(wxuser.areaname=='中区'){
        		if(self.oldjoinarr3.length > 0){
		            for(var i=0;i<self.oldjoinarr3.length;i++){
		                if(self.oldjoinarr3[i].openid == wxuser.openid){
		                    addnewjoin = false;
		                    break;
		                }
		            }
		        }
		        if(addnewjoin){
		        	self.oldjoinarr3.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
		            self.newjoinarr3.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
		        }
        	}else if(wxuser.areaname=='东区'){
        		if(self.oldjoinarr4.length > 0){
		            for(var i=0;i<self.oldjoinarr4.length;i++){
		                if(self.oldjoinarr4[i].openid == wxuser.openid){
		                    addnewjoin = false;
		                    break;
		                }
		            }
		        }
		        if(addnewjoin){
		        	self.oldjoinarr4.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
		            self.newjoinarr4.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
		        }
        	}else if(wxuser.areaname=='北区'){
        		if(self.oldjoinarr5.length > 0){
		            for(var i=0;i<self.oldjoinarr5.length;i++){
		                if(self.oldjoinarr5[i].openid == wxuser.openid){
		                    addnewjoin = false;
		                    break;
		                }
		            }
		        }
		        if(addnewjoin){
		        	self.oldjoinarr5.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
		            self.newjoinarr5.push({openid:wxuser.openid,avatar:wxuser.avatar,nickname:wxuser.nickname});
		        }
        	}
        },
		total:36,
        stageStop:true,
        speed:300,
        cards:[],
        cards2:[],
        cards3:[],
        cards4:[],
        cards5:[],
       	areawidth:500,
        stageInit: function() {
    		var self = this,zoom = (window.innerHeight / 800).toFixed(4);
    		self.speed = avatarspeed=='1'?100:avatarspeed=='2'?300:500;
    		self.camera = new THREE.PerspectiveCamera(40, window.innerWidth/zoom / 800, 1000, 10000);
    		self.camera.position.z = 20000;
    		self.scene = new THREE.Scene();
    		self.scene2 = new THREE.Scene();
    		self.scene3 = new THREE.Scene();
    		self.scene4 = new THREE.Scene();
    		self.scene5 = new THREE.Scene();
    		for (var i = 0; i < 5; i++) {
	    		var k = document.createElement("img");
	    		k.className = "headImg";
	    		var s,h = Math.sqrt(self.total),u = Math.floor(h / 2);
	    		for (var p = 0; p < self.total; p++) {
	    			var x = Math.floor(p / h) % h;
	    			var j = (p % h);
	    			if (x == u && j == u) {
	    				continue;
	    			}
	    			var o = k.cloneNode();
				    if(self.newjoinarr.length > 0){
				        var showavatar = self.newjoinarr.shift();
	                	//self.oldjoinarr.push(showavatar);
	                	o.src = showavatar.avatar;
				    }else if(self.oldjoinarr.length > 0){
				        var showavatar = self.oldjoinarr[Math.floor((Math.random()*self.oldjoinarr.length))];
				        o.src = showavatar.avatar;
				    }
				    o.style.display = 'none';
	    			var m = new THREE.CSS3DSprite(o);
	    			var w = self.areawidth/ h,
	    			q = 800 / h;
	    			var g = w / q;
	    			var l = 300,
	    			t = l * g;
	    			m.position.x = (j * w - self.areawidth/ 2 + w / 2) + (j - 2) * t;
	    			m.position.y = (x * q - 800 / 2 + q / 2) * -1 - (x - 2) * l;
	    			m.position.z = screencore.randomInt(20000, 40000);
	    			if(i==0){
	    				self.scene.add(m);
	    				self.cards.push(m);
	    			}else if(i==1){
	    				self.scene2.add(m);
	    				self.cards2.push(m);
	    			}else if(i==2){
	    				self.scene3.add(m);
	    				self.cards3.push(m);
	    			}else if(i==3){
	    				self.scene4.add(m);
	    				self.cards4.push(m);
	    			}else if(i==4){
	    				self.scene5.add(m);
	    				self.cards5.push(m);
	    			}	
	    		}
	    		
	    		if(i==0){
	    			self.renderer = new THREE.CSS3DRenderer();
	    			self.renderer.setSize(self.areawidth , 800);
	    			self.renderer.domElement.style.position = "absolute";
	    			$(".threeBox .nan")[0].appendChild(self.renderer.domElement);
	    		}else if(i==1){
	    			self.renderer2 = new THREE.CSS3DRenderer();
	    			self.renderer2.setSize(self.areawidth , 800);
	    			self.renderer2.domElement.style.position = "absolute";
	    			$(".threeBox .xi")[0].appendChild(self.renderer2.domElement);
	    		}else if(i==2){
	    			self.renderer3 = new THREE.CSS3DRenderer();
	    			self.renderer3.setSize(self.areawidth , 800);
	    			self.renderer3.domElement.style.position = "absolute";
	    			$(".threeBox .zhong")[0].appendChild(self.renderer3.domElement);
	    		}else if(i==3){
	    			self.renderer4 = new THREE.CSS3DRenderer();
	    			self.renderer4.setSize(self.areawidth , 800);
	    			self.renderer4.domElement.style.position = "absolute";
	    			$(".threeBox .dong")[0].appendChild(self.renderer4.domElement);
	    		}else if(i==4){
	    			self.renderer5 = new THREE.CSS3DRenderer();
	    			self.renderer5.setSize(self.areawidth , 800);
	    			self.renderer5.domElement.style.position = "absolute";
	    			$(".threeBox .bei")[0].appendChild(self.renderer5.domElement);
	    		}
	    	}
	    	self.animate();
	    	self.animate2();
	    	self.animate3();
	    	self.animate4();
	    	self.animate5();
    	},
    	animate: function() {
    		var self = this;
    		requestAnimationFrame(function() {
    			self.animate()
    		});
    		if (self.stageStop) {
    			return;
    		}else{
    			$('.threeBox').removeClass('hidden');
    		}
    		self.speed -= 1;
    		if (self.speed < 200) {
    			self.speed = 200
    		}
    		var g = self.cards.length;
			for (var j = 0; j < g; j++) {
				var h = self.cards[j];
				h.position.z -= self.speed;//400-700
				if (h.position.z < -10000) {
					if(self.newjoinarr1.length > 0){
    			        var l = self.newjoinarr1.shift();
    			    }else if(self.oldjoinarr1.length > 0){
    			        var l = self.oldjoinarr1[Math.floor((Math.random()*self.oldjoinarr1.length))];
    			    }
					if (l) {
						h.element.src = l.avatar;
						h.element.style.display = "block";
						h.position.z = screencore.randomInt(20000, 40000);
					}
				}
			}
    		self.renderer.render(self.scene, self.camera);
    	},
    	animate2: function() {
    		var self = this;
    		requestAnimationFrame(function() {
    			self.animate2()
    		});
    		if (self.stageStop) {
    			return;
    		}else{
    			$('.threeBox').removeClass('hidden');
    		}
    		self.speed -= 1;
    		if (self.speed < 200) {
    			self.speed = 200
    		}
    		var g = self.cards2.length;
			for (var j = 0; j < g; j++) {
				var h = self.cards2[j];
				h.position.z -= self.speed;//400-700
				if (h.position.z < -10000) {
					if(self.newjoinarr2.length > 0){
    			        var l = self.newjoinarr2.shift();
    			    }else if(self.oldjoinarr2.length > 0){
    			        var l = self.oldjoinarr2[Math.floor((Math.random()*self.oldjoinarr2.length))];
    			    }
					if (l) {
						h.element.src = l.avatar;
						h.element.style.display = "block";
						h.position.z = screencore.randomInt(20000, 40000);
					}
				}
			}
    		self.renderer2.render(self.scene2, self.camera);
    	},
    	animate3: function() {
    		var self = this;
    		requestAnimationFrame(function() {
    			self.animate3()
    		});
    		if (self.stageStop) {
    			return;
    		}else{
    			$('.threeBox').removeClass('hidden');
    		}
    		self.speed -= 1;
    		if (self.speed < 200) {
    			self.speed = 200
    		}
    		var g = self.cards3.length;
			for (var j = 0; j < g; j++) {
				var h = self.cards3[j];
				h.position.z -= self.speed;
				if (h.position.z < -10000) {
					if(self.newjoinarr3.length > 0){
    			        var l = self.newjoinarr3.shift();
    			    }else if(self.oldjoinarr3.length > 0){
    			        var l = self.oldjoinarr3[Math.floor((Math.random()*self.oldjoinarr3.length))];
    			    }
					if (l) {
						h.element.src = l.avatar;
						h.element.style.display = "block";
						h.position.z = screencore.randomInt(20000, 40000);
					}
				}
			}
    		self.renderer3.render(self.scene3, self.camera);
    	},
    	animate4: function() {
    		var self = this;
    		requestAnimationFrame(function() {
    			self.animate4()
    		});
    		if (self.stageStop) {
    			return;
    		}else{
    			$('.threeBox').removeClass('hidden');
    		}
    		self.speed -= 1;
    		if (self.speed < 200) {
    			self.speed = 200
    		}
    		var g = self.cards4.length;
			for (var j = 0; j < g; j++) {
				var h = self.cards4[j];
				h.position.z -= self.speed;
				if (h.position.z < -10000) {
					if(self.newjoinarr4.length > 0){
    			        var l = self.newjoinarr4.shift();
    			    }else if(self.oldjoinarr4.length > 0){
    			        var l = self.oldjoinarr4[Math.floor((Math.random()*self.oldjoinarr4.length))];
    			    }
					if (l) {
						h.element.src = l.avatar;
						h.element.style.display = "block";
						h.position.z = screencore.randomInt(20000, 40000);
					}
				}
			}
    		self.renderer4.render(self.scene4, self.camera);
    	},
    	animate5: function() {
    		var self = this;
    		requestAnimationFrame(function() {
    			self.animate5()
    		});
    		if (self.stageStop) {
    			return;
    		}else{
    			$('.threeBox').removeClass('hidden');
    		}
    		self.speed -= 1;
    		if (self.speed < 200) {
    			self.speed = 200
    		}
    		var g = self.cards5.length;
			for (var j = 0; j < g; j++) {
				var h = self.cards5[j];
				h.position.z -= self.speed;
				if (h.position.z < -10000) {
					if(self.newjoinarr5.length > 0){
    			        var l = self.newjoinarr5.shift();
    			    }else if(self.oldjoinarr5.length > 0){
    			        var l = self.oldjoinarr5[Math.floor((Math.random()*self.oldjoinarr5.length))];
    			    }
					if (l) {
						h.element.src = l.avatar;
						h.element.style.display = "block";
						h.position.z = screencore.randomInt(20000, 40000);
					}
				}
			}
    		self.renderer5.render(self.scene5, self.camera);
    	},
    	totalLenth:0,
    	loadedLenth:0,
    	preloadAll:function(fuc){
    		var self = this,result = {};
			pxPreload.start({
		        filelists:fileLists,
		        progress:function(data){
		            data = data || false;
		            if(data){
		                result[data.key] = data;
		                var percent = (Math.round(data.load / data.total * 10000) / 100);
	                	$(".load-percent").html(percent+'%');
	                	$(".load-progress span").css('width',percent+'%');
		            }
		        },
		        complete:function(){
		            console.log('全部加载完成');
		            fuc && fuc(result);
		        },
		    });
		    /*self.totalLenth = preloadall.len;
    		self.preloadImages({
				onComplete:function(){
					self.preloadVideos({
			            onComplete:function(result,errnum){
			            	if(errnum > 0){
			            		layerBox.showMsg('部分视频文件加载出错，请核实');
			            	}
			                fuc&&fuc(result);
			            }
			        });
				}
			});
			*/
    	},
    	preloadVideos:function(data){
	        var self = this;
	        data.onError = data.onError||function(){}
	        data.noSupport = data.noSupport||function(){}
	        data.onFail = data.onFail||function(){}
	        data.onLoad = data.onLoad||function(){}
	        data.onComplete = data.onComplete||function(){}
	        var videoList = data.src||preloadall.videos,len = videoList.length;
	        if(len==0){
	            return data.onComplete([],0);
			}
	        var yesnum = 0,nonum = 0,result = [];
	        for(var x=0;x<len;x++){
	            var video = document.createElement('video');
				video.src = videoList[x];
				video.style.display = 'none';
				video.load();
				document.body.appendChild(video);
				video.addEventListener('canplaythrough',function(){
					var dir = self.getData(this);
	                dir.name = videoList[(yesnum + nonum)];
	                result.push(dir);
	                $(this).remove();
	                yesnum++;
	                self.loadedLenth++;
	                var percent = (Math.round(self.loadedLenth / self.totalLenth * 10000) / 100);
	                $(".load-percent").html(percent+'%');
	                $(".load-progress span").css('width',percent+'%');
	                if(result.length >= len){
	                    return data.onComplete(result,nonum);
	                }
				});
				video.addEventListener('error',function(){
					var dir = {dir:1,width:0,height:0,time:0,name:videoList[(yesnum + nonum)]};
					result.push(dir);
					$(this).remove();
					nonum++;
					self.loadedLenth++;
	                var percent = (Math.round(self.loadedLenth / self.totalLenth * 10000) / 100);
	                $(".load-percent").html(percent+'%');
	                $(".load-progress span").css('width',percent+'%');
	                if(result.length >= len){
						return data.onComplete(result,nonum);
					}
				});
	        }
	    },
	    getId:function(){
	        return ('Video'+Math.random()+new Date().getTime()).replace('.','');
	    },
	    getData:function(video){
	        video = video.length>0?video[0]:video;
	        var videoW = video.videoWidth;
	        var videoH = video.videoHeight;
	        var dir = videoW/videoH;
	        var time = parseInt(video.duration);
	        return {dir:dir,width:videoW,height:videoH,time:time}
	    },
	    preloadImages:function(data){
			var self = this;
			data.onComplete = data.onComplete||function(){}
	        var src = preloadall.imgs||[];
	        var len = src.length;
	        if(len==0){
	            return data.onComplete();
			}
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
	    gameEndphb:function(list,num){
			var self = this,num = num||10;
			$("body").append(self.rankrender({}));
			var r = $(".rankBox"),o = $(".rank-others li"),oo = $(".rank-others2 li");
			for(var i=0,j=list.length;i<j;i++){
				if(i<3){
					if(i < num && list[i] ){
						var box = i==0?r.find('.rank-item-first'):i==1?r.find('.rank-item-second'):r.find('.rank-item-third');
						box.find('img').attr('src',list[i].avatar);
						box.find('p').text(list[i].nickname);
					}
				}else{
					if(i < num && list[i] ){
						if(i>9){
							oo.eq((i-10)).find('img').attr('src',list[i].avatar);
							oo.eq((i-10)).find('p span').text(list[i].nickname);
						}else{
							o.eq((i-3)).find('img').attr('src',list[i].avatar);
							o.eq((i-3)).find('p span').text(list[i].nickname);
						}
					}
				}
			}
			r.removeClass('display-none');
			if(num <= 3){
				$(".rank-others").remove();
				num >= 1 && $(".rankfirst-second-third .rank-item-first").removeClass('opacity-hide').animateControl('bounceInDown');
				num >= 2 && $(".rankfirst-second-third .rank-item-second").removeClass('opacity-hide').animateControl('bounceInDown');
				num == 3 && $(".rankfirst-second-third .rank-item-third").removeClass('opacity-hide').animateControl('bounceInDown');
				setTimeout(function(){
					//$('.rankBox-btns').removeClass('opacity-hide');
				},1e3);
			}else{
				if(num < 11){
					$(".rank-others2").remove();
				}
				$(".rankfirst-second-third .rank-item").removeClass('opacity-hide');
				$('.rank-item-first').animateControl('bounceInDown');
				$('.rank-item-second').animateControl('bounceInDown');
				$('.rank-item-third').animateControl('bounceInDown');
				setTimeout(function(){
					if($(".rank-others .rank-others-item:gt("+(num - 4)+")").length > 0){
						$(".rank-others .rank-others-item:gt("+(num - 4)+")").remove();
					}
					$('.rank-others').removeClass('opacity-hide').animateControl('bounceInUp',function(){
						if(num > 10){
							if($(".rank-others2 .rank-others-item:gt("+(num - 11)+")").length > 0){
								$(".rank-others2 .rank-others-item:gt("+(num - 11)+")").remove();
							}
							$('.rank-others2').removeClass('opacity-hide').animateControl('bounceInUp',function(){
								//$('.rankBox-btns').removeClass('opacity-hide');
							});
						}else{
							//$('.rankBox-btns').removeClass('opacity-hide');
						}
					});
				},6e2);
			}
		},
	};
	return screenshakestart2;
});