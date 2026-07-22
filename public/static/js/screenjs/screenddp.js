/*
* @Author: 赞木
* @Date:   2023-05-06 08:48:02
* @Last Modified by:   赞木
* @Last Modified time: 2023-05-07 17:15:29
*/
define('screenddp',['screencore','template','layerBox','keyboard','anime'],function(screencore,template,layerBox,keyboardJS,anime){
	var screenddp = {
		startimer:null,
		avatartimer:null,
		audio:{},
		ddptpl:null,
		rotateid:'',
		alluser:[],
		maxid:0,
		init: function() {
			var self = this;
			template.helper("isArray", function(arr) {
				return Object.prototype.toString.call(arr) === '[object Array]';
			});
			self.ddptpl = template('ddp-tpl');
			self.ajaxusers(function(){
				self.bindEvent();
				self.initAudio();
				setTimeout(function(){
					self.getnewUser();
				},10e3);
			});
			
		},
		ajaxusers:function(fn){
			var self = this;
			screencore.ajaxSubmit('/screen/ddp/initdata',{}).then(function(json){
				if(json.code==0){
					self.alluser = json.msg.list;
					if(self.alluser.length > 0 ) self.maxid = self.alluser[0].userid;
					if(json.msg.rotate!=''){
						self.rotateid = json.msg.rotate.id;
						$(".ddp-mainbox .singlebox").removeClass('display-none');
						fn&&fn();
					}else{
						$(".ddp-mainbox .emptybox").removeClass('display-none');
					}
				}else{
					layerBox.showMsg(json.msg);
				}
			});
		},
		getnewUser:function(){
			var self = this;
			screencore.ajaxSubmit('/screen/ddp/getmoreuser',{maxid:self.maxid}).then(function(json){
				if(json.code==0){
					var newuser = json.msg.list;
				    if(newuser.length >0 ){
						$.each(newuser,function(i,v){
							self.alluser.push(v);
						});
						self.maxid = newuser[0].userid;
					}
				}
				setTimeout(function(){
					self.getnewUser();
				},5e3);
			}, function(){
				setTimeout(function(){
					self.getnewUser();
				},5e3);
			});
		},
		initAudio: function(){
			var self = this;
			if($("#drawing").length > 0){
				self.audio.drawing = document.getElementById("drawing");
			}
			if($("#drawed").length > 0){
				self.audio.drawed = document.getElementById("drawed");
			}
		},
		playmusic:function(drawtype){
			var self = this,drawtype = drawtype || 'drawing';
			if(self.audio[drawtype]){
				self.audio[drawtype].currentTime = 0;
		    	self.audio[drawtype].play();
			}
		},
		pausemusic:function(drawtype){
			var self = this,drawtype = drawtype || 'drawing';
			if(self.audio[drawtype]){
		    	self.audio[drawtype].pause();
			}
		},
		onceshowtype:'1',
		bindEvent: function() {
			var self = this;
		    $(".startbtn").click(function(){
		    	if(self.rotateid=='') return layerBox.showMsg('请先添加轮次或刷新重试');
		    	var $this = $(this);
				if($this.hasClass('isining')) return;
				if($this.hasClass('waiting')){
					let selnum = parseInt($('.selnum input').val());
					if(isNaN(selnum)){
						return layerBox.showMsg('请选择匹配对数');
					}
					if(selnum < 1){
						return layerBox.showMsg('至少匹配1对');
					}
					$this.removeClass('waiting').addClass('isining');
					screencore.ajaxSubmit('/screen/ddp/savelucker',{selnum:selnum}).then(function(e){
						if(e.code==0){
							$this.text('匹配中..');
							screencore.bgmusicpause();
			    			self.playmusic('drawing');
				    		$(".singlebox").addClass('isdrawing');
				    		if(bubbleimg!=''){
					    		self.startimer = setInterval(function(){
						    		var div = $('<div class="bubble"></div>');
						            $(".star-bubbles").append(div);
						            anime({ 
						            	targets: div.get(0), 
						            	translateX: screencore.randomInt(-800,800), 
						            	translateY: screencore.randomInt(-800,800),
						            	translateZ: screencore.randomInt(-800,800),
						            	rotate:[-360,360],
						            	scale:[0, 3],
						            	opacity:[1, 0],
						            	easing: 'easeInOutCubic', 
						            	duration: 1e3,
						            	complete:function(par){
						            		div.remove();
						            	},
						            });
						    	},20);
				    		}
					    	self.avatartimer = setInterval(function(){
					    		$(".single-left .single-avatar img").attr('src',self.alluser[Math.floor((Math.random()*self.alluser.length))].avatar);
					    		$(".single-right .single-avatar img").attr('src',self.alluser[Math.floor((Math.random()*self.alluser.length))].avatar);
					    	},80);
							setTimeout(function(){
								$this.text('停止匹配').removeClass('isining').addClass('clickstop');
							},3e3);
							//如果出来的是当前轮次所有匹配记录则lists为空
							var onceUsers = e.msg.lists || '';
							if(onceUsers != ''){
								self.onceshowtype = '1';
					    		self.refreshrecord(onceUsers,e.msg.title);
				    		}else{
				    			self.onceshowtype = '2';
				    		}
						}else{
							$this.text('开始匹配').addClass('waiting').removeClass('isining');
							layerBox.showMsg(e.msg);
						}
					},function(){
						$this.text('开始匹配').addClass('waiting').removeClass('isining');
						layerBox.showMsg('网络异常，请稍后重试');
					});
				}else if($this.hasClass('clickstop')){
					self.pausemusic('drawing');
		    		self.playmusic('drawed');
		    		clearInterval(self.startimer);
		    		clearInterval(self.avatartimer);
		    		setTimeout(function(){
		    			$(".single-left .single-avatar img").attr('src',leftwaitimg)
		    			$(".single-right .single-avatar img").attr('src',rightwaitimg)
		    		},1e2);
		    		$(".singlebox").removeClass('isdrawing');
		    		$this.text('开始匹配').removeClass('clickstop').addClass('waiting');
		    		$(".single-controls .single-record").trigger('click',(self.onceshowtype=='1' ? '1' : '2'));
				}
			});
		    $(".single-controls .dec").click(function(){
		    	if(!$(".startbtn").hasClass('waiting')){
		    		return false;
		    	}
		    	var selnum = parseInt($(".selnum input").val());
		    	if(isNaN(selnum)){
		    		return $(".selnum input").val(1);
		    	}
		    	selnum--;
		    	if(selnum <= 0){
		    		selnum = 1;
		    	}
		    	$(".selnum input").val(selnum);
		    });
		    $(".single-controls .inc").click(function(){
		    	if(!$(".startbtn").hasClass('waiting')){
		    		return false;
		    	}
		    	var selnum = parseInt($(".selnum input").val());
		    	if(isNaN(selnum)){
		    		return $(".selnum input").val(1);
		    	}
		    	selnum++;
		    	if(selnum <= 0){
		    		selnum = 1;
		    	}
		    	$(".selnum input").val(selnum);
		    });
		    $(".single-controls input").blur(function(){
		    	var selnum = $(".selnum input").val();
		    	if(typeof(selnum)==='undefined' || selnum==''){
					return $(".selnum input").val(1);
				}
				selnum = parseInt(selnum);
				if(isNaN(selnum)){
		    		return $(".selnum input").val(1);
		    	}
				$(".selnum input").val(selnum);
		    });
		    $(".single-controls .single-record").click(function(e,type){
		    	if(self.rotateid=='') return layerBox.showMsg('请先添加轮次或刷新重试');
		    	var isall = type || '2';
		    	if(isall=='2'){
		    		if(!$(".startbtn").hasClass('waiting')){
			    		return false;
			    	}
					$(".user-lists .pageprev,.user-lists .pagenext").fadeIn();
			    	self.getrecords('',function(){
			    		$(".ddp-recordlists").removeClass('hidden');
			    		$(".ddp-recordlists .user-lists").removeAttr('data-rid').animateCss('zoomIn');
			    	});
		    	}else{
					$(".user-lists .pageprev,.user-lists .pagenext").fadeOut();
		    		$(".ddp-recordlists").removeClass('hidden');
			    	$(".ddp-recordlists .user-lists").removeAttr('data-rid').animateCss('zoomIn');
		    	}
		    });
		    $(".ddp-recordlists .close").click(function(){
		    	$(".ddp-recordlists .user-lists").removeAttr('data-rid').animateCss('zoomOut',function(){
		    		$(".user-wrapper").remove();
		    		$(".ddp-recordlists").addClass('hidden');
		    		self.pausemusic('drawed');
		    		setTimeout(function(){
		    			screencore.bgmusicplay();
		    		},2e2);
		    	});
		    });
		    $(".ddp-recordlists").on('click','.del',function(){
		    	var $this = $(this),recordid = $this.attr('data-id');
				layerBox.showConfirm('警告','删除将无法恢复，确定要删除该配对记录么?',['确定','取消'],function(){
					screencore.ajaxSubmit('/screen/ddp/dellucker',{recordid:recordid},'').then(function(e){
						if(e.code==0){
							$this.parent().remove();
							var llen = $(".user-items .user-item").length,classname = 'user-wrapper ';
				    		classname += self.refreshclassname(llen);
				    		$(".user-round span").text("("+llen+")");
				    		$(".user-lists .user-wrapper").attr("class",classname);
							layerBox.showMsg('删除成功');
						}else{
							layerBox.showMsg(e.msg);
						}
					});
				});
		    });
		    $(".user-lists .pagenext").click(function(){
		    	let recordobj = $('.ddp-recordlists');
		    	if(!recordobj.is(':hidden')){
		    		self.prevnextrecord('1');
		    	}
		    });
		    $(".user-lists .pageprev").click(function(){
		    	let recordobj = $('.ddp-recordlists');
		    	if(!recordobj.is(':hidden')){
		    		self.prevnextrecord('2');
		    	}
		    });
		    keyboardJS.bind('space', function() {
		    	let recordobj = $('.ddp-recordlists');
		    	if(recordobj.is(':hidden')){
					$('.startbtn').trigger('click');
				}else{
					recordobj.find('.close').trigger('click');
				}
			});
			keyboardJS.bind('up', function(e) {
				let recordobj = $('.ddp-recordlists');
		    	if(recordobj.is(':hidden')){
		    		$(".single-controls .inc").trigger('click');
		    	}
			});
			keyboardJS.bind('down', function(e) {
				let recordobj = $('.ddp-recordlists');
		    	if(recordobj.is(':hidden')){
		    		$(".single-controls .dec").trigger('click');
		    	}
		    });
		    keyboardJS.bind('right', function(e) {
		    	if(!$(".startbtn").hasClass('waiting')){
		    		return false;
		    	}
				self.prevnextround('1');
			});
			keyboardJS.bind('left', function(e) {
				if(!$(".startbtn").hasClass('waiting')){
		    		return false;
		    	}
				self.prevnextround('2');
		    });
		    keyboardJS.bind(',', function(e) {
				$(".user-lists .pageprev").trigger('click');
			});
			keyboardJS.bind('.', function(e) {
				$(".user-lists .pagenext").trigger('click');
		    });
		    keyboardJS.bind('shift', function(e) {

		    	let recordobj = $('.ddp-recordlists');
		    	if(recordobj.is(':hidden')){
					$(".single-controls .single-record").trigger('click');
				}else{
					recordobj.find('.close').trigger('click');
				}
		    });
		    keyboardJS.bind('/', function(e) {
				layerBox.showConfirm('警告','清空将删除当前轮次所有配对记录并且无法恢复，您确定要清空？',['确定','取消'],function(){
					screencore.ajaxSubmit('/screen/ddp/resetlucker',{},'').then(function(e){
						if(e.code==0){
							self.getrecords('');
							layerBox.showMsg('清空成功');
						}else{
							layerBox.showMsg(e.msg);
						}
					});
				});
			});
		},
		prevnextround:function(type){
			var self = this,type = type || '1';
			screencore.ajaxSubmit('/screen/ddp/prevnextround',{type:type,rotateid:self.rotateid},'').then(function(e){
				if(e.code==0){
					window.location.reload();
				}else{
					layerBox.showMsg(e.msg);
				}
			});
		},
		prevnextrecord:function(type){
			var self = this,rotateid = $(".user-lists").attr('data-rid') || self.rotateid;
			screencore.ajaxSubmit('/screen/ddp/prevnextrecord',{type:type,rotateid:rotateid},'').then(function(e){
				if(e.code==0){
					self.refreshrecord(e.msg.lists,e.msg.title);
					$(".user-lists").attr('data-rid',e.msg.rotateid);
				}else{
					layerBox.showMsg(e.msg);
				}
			});
		},
		getrecords:function (rotateid,fn){
			var self = this;
			if(rotateid==''){
				rotateid = self.rotateid;
			}
			screencore.ajaxSubmit('/screen/ddp/ajaxlucker',{rotateid:rotateid},'正在加载本轮匹配记录..').then(function(e){
				if(e.code==0){
					self.refreshrecord(e.msg.lists,e.msg.title);
					fn&&fn();
				}else{
					layerBox.showMsg(e.msg);
				}
			});
		},
		refreshrecord:function(lists,title){
			var self = this,html = '',classname = self.refreshclassname(lists.length);
			$.each(lists,function(i,c){
    			html += self.ddptpl({
    				manavatar : c.ldata.avatar,
    				manname : c.ldata.nickname,
    				womanavatar : c.rdata.avatar,
    				womanname : c.rdata.nickname,
    				recordid : c.luckerid,
    			});
    		});
    		$(".user-lists .recordlist").html(`
    			<div class="user-wrapper ${ classname }">
    				<div class="user-round">${ title }<span>(${ lists.length })</span></div>
					<div class="user-items zam-app-flex zam-app-alignCenter zam-app-justifyspacearound zam-app-flex-wrap">
						${ html }
					</div>
				</div>
    		`);
		},
		refreshclassname:function(llen){
			var self = this,classname = '';
    		if(llen==2){
    			classname += 'mode2';
    		}else if(llen >= 3 && llen < 7){
    			classname += 'mode3';
    		}else if(llen >= 7 && llen < 13){
    			classname += 'mode4';
    		}else if(llen >= 13){
    			classname += 'mode5';
    		}
    		return classname;
		}
	};
	return screenddp;
});
