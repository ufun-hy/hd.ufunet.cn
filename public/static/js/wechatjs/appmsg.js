/*
* @Author: 赞木
* @Date:   2021-04-19 12:01:01
* @Last Modified by:   赞木
* @Last Modified time: 2023-06-17 13:17:43
*/
define('appmsg',['wechatcore','bscroll','marqueen','swiper','emojicore','appsocket'],function(wechatcore,BScroll,marqueen,Swiper,emojicore,appsocket){
var maxid = 0,scrollhasmore = true;
var appmsg = {
	Scroll:null,
	init:function(){
		var self = this;
		//先考虑是否用户被全局禁言
		if(XCV3Config.isestoppel=='1'){
			self.addestoppel();
		}else{
			//再考虑是否上墙开启了禁言 管理员则忽略
			if(appestoppel=='1' && XCV3Config.ismanager=='2'){
				self.fulladdestoppel();
			}
		}
		var bsconfig = {click: true,pullDownRefresh:{threshold:10,stop:20}};
		if(wechatcore.ios134over()) bsconfig.useTransition = false;
		self.Scroll = new BScroll($('.zam-app-msg-scroll')[0],bsconfig);
		self.Scroll.on('pullingDown', function () {
			if(!scrollhasmore) {
				return self.Scroll.finishPullDown()&&self.Scroll.refresh();
			}
			$(".zam-pulldown-box .pulldownTxt").hide();
			$(".zam-pulldown-box .pulldownRefresh").fadeIn();
			wechatcore.ajaxSubmit("/wechat/msg/loadhistory",{maxid:maxid},false).then(function(data){
				 if(data.code!=0){
				 	$(".zam-pulldown-box .pulldownOver").fadeOut(function(){
						self.Scroll.finishPullDown();
						self.Scroll.refresh();
						setTimeout(function(){
							$(".zam-pulldown-box .pulldownTxt").show();
						},200);
				    });
					return wechatcore.msg('加载历史数据失败，请稍后重试');
				 }
				 setTimeout(function(){
						 if(data.msg.length>0){
							 maxid = data.msg[0].id;
							 var historyPage = data.msg;
							 historyPage = historyPage.reverse();
							 maxid = historyPage[0].id;
							 var historyHtml = '';
							 $.each(historyPage,function(index,value){
								 value.content = emojicore.emoToimg(value.content);
								 value.ismanager = XCV3Config.ismanager;
								 historyHtml += wechatcore.tpl($("#msg-tpl"),value);
							 });
							 $(".zam-app-msglist").prepend(historyHtml);
						 }else{
							 scrollhasmore = false;
							 $(".zam-pulldown-box .pulldownOver").html('<i class="mxc-infofill"></i>已加载全部');
							 $(".zam-pulldown-box .pulldownTxt").html('<i class="mxc-infofill"></i>已加载全部');
						 }
						 $(".zam-pulldown-box .pulldownRefresh").hide();
						 $(".zam-pulldown-box .pulldownOver").fadeIn();
						 setTimeout(function(){
							$(".zam-pulldown-box .pulldownOver").fadeOut(function(){
								self.Scroll.finishPullDown(),self.Scroll.refresh();
								setTimeout(function(){
									$(".zam-pulldown-box .pulldownTxt").show();
								},200);
							});
						 },1000);
						 
				 },1000);
			}, function(){
				  wechatcore.msg('网络太差，请稍后重试');
				  $(".zam-pulldown-box .pulldownOver").fadeOut(function(){
						self.Scroll.finishPullDown();
						self.Scroll.refresh();
						setTimeout(function(){
							$(".zam-pulldown-box .pulldownTxt").show();
						},200);
				  });
			});
		});
		self.Scroll.on('scroll', function (pos) {
			$(".zam-pulldown-box").css("top",Math.min(pos.y,10));
		});
		wechatcore.ajaxSubmit("/wechat/msg/loadhistory",{maxid:maxid},false).then(function(data){
			 if(data.code!=0){
				return wechatcore.msg('加载历史数据失败，请稍后重试');
			 }
			 if(data.msg.length>0){
				 var firstPage = data.msg;
				 firstPage = firstPage.reverse();
				 maxid = firstPage[0].id;
				 var firstHtml = '';
				 $.each(firstPage,function(index,value){
					 if(value.type=='1'||value.type=='2'){
						 value.content = value.content.toString();
						 value.content = emojicore.emoToimg(value.content);
					 }
					 value.ismanager = XCV3Config.ismanager;
					 firstHtml += wechatcore.tpl($("#msg-tpl"),value);
				 });
				 $(".zam-app-msglist").prepend(firstHtml);
				 wechatcore.waitImgLoad(function(){
					 self.Scroll.refresh(),self.Scroll.scrollTo(0,self.Scroll.maxScrollY,300);
				 });
			 }else{
				 scrollhasmore = false;
				 $(".zam-pulldown-box .pulldownOver").html('<i class="mxc-infofill"></i>已加载全部');
				 $(".zam-pulldown-box .pulldownTxt").html('<i class="mxc-infofill"></i>已加载全部');
			 }
		}, function(){
			  wechatcore.msg('加载历史数据失败，请稍后重试');
		});
		self.socketinit();
		self.bindevent();
	},
	socketinit:function(){
		var self = this;
		appsocket.init({
			onmessage:function(data){
				if(data.type=='connected'){
					appsocket.isclose = false;
					wechatcore.connectsocket({clientid:data.clientid});
				}else{
					if(data.type=='del'){
						if(!$.isArray(data.msgid)){
							$(".appmsg-"+data.msgid).remove();
						}else{
							$.each(data.msgid,function(index,val){
								$(".appmsg-"+val).remove();
							});
						}
					}else if(data.type=='msgreset' || (data.type=='screenresetdm' && data.fromtype=='1')){
						$(".zam-app-msglist").empty();
						self.Scroll.refresh();
						scrollhasmore = false;
						$(".zam-pulldown-box .pulldownOver").html('<i class="mxc-infofill"></i>已加载全部');
						$(".zam-pulldown-box .pulldownTxt").html('<i class="mxc-infofill"></i>已加载全部');
					}else if(data.type=='join'){
						appjointip==1&&wechatcore.newjoin(data.nickname);
					}else if(data.type=='msgshenhe'){
						var messages = data.messages;
						if($.isArray(messages)&&messages.length>0){
							$.each(messages,function(i, val){
								if($(".appmsg-"+val.id).length<=0){
									if(val.type=='1'||val.type=='2'){
										val.content = emojicore.emoToimg(val.content);
									}
									val.ismanager = XCV3Config.ismanager;
									var addMsg = wechatcore.tpl($("#msg-tpl"),val);
									$(".zam-app-msglist").append(addMsg);
								}
							});
							wechatcore.waitImgLoad(function(){
								self.Scroll.refresh(),self.Scroll.scrollTo(0,self.Scroll.maxScrollY,300);
							});
						}
					}else if(data.type=='addblack'){
						data.userid==XCV3Config.userid&&wechatcore.closewxwindow();
					}else if(data.type=='addmanager'){
						data.userid==XCV3Config.userid&&wechatcore.reloadpage();
					}else if(data.type=='addestoppel'){
						if(data.userid==XCV3Config.userid) {
							if(data.status=='1'){
								self.addestoppel();
							}else{
								self.removeestoppel();
							}
						}
					}else if(data.type=='msgfullestoppel'){
						if(data.status=='1'){
							self.fulladdestoppel();
						}else{
							self.fullremoveestoppel();
						}
					}else if(data.type=='1'||data.type=='2'){
						if($(".appmsg-"+data.id).length>0) return;
						if(data.type=='1'||data.type=='2'){
							data.content = emojicore.emoToimg(data.content);
						}
						data.ismanager = XCV3Config.ismanager;
						var addMsg = wechatcore.tpl($("#msg-tpl"),data);
						$(".zam-app-msglist").append(addMsg);
						wechatcore.waitImgLoad(function(){
							self.Scroll.refresh(),self.Scroll.scrollTo(0,self.Scroll.maxScrollY,300);
						});
					}else if(data.type=='goto'){
						 wechatcore.goto(data);
					}else if(data.type=='luckeruserids'){
						wechatcore.layerAsklucker(data);
					}
				}
			}
		});
	},
	addestoppel:function(){
		var footerbar = $(".zam-app-msg-footerbar");
		footerbar.find('input').val('');
		footerbar.addClass('isforbidden');
		footerbar.find(".zam-input-box input").attr('placeholder','禁言中');
		footerbar.find(".zam-btn-send").text('禁言中');
		XCV3Config.isestoppel = '1';
	},
	removeestoppel:function(){
		var self = this,footerbar = $(".zam-app-msg-footerbar");
		footerbar.removeClass('isforbidden');
		footerbar.find(".zam-btn-send").text('发送');
		footerbar.find(".zam-input-box input").attr('placeholder','请输入你想说的话');
		XCV3Config.isestoppel = '2';
		//看是否全局禁言
		if(appestoppel=='1'){
			self.fulladdestoppel();
		}
	},
	fulladdestoppel:function(){
		appestoppel = '1';
		var footerbar = $(".zam-app-msg-footerbar");
		if(XCV3Config.isestoppel=='1' || XCV3Config.ismanager=='1'){
			return false;
		}
		footerbar.find('input').val('');
		footerbar.addClass('isforbidden');
		footerbar.find(".zam-input-box input").attr('placeholder','禁言中');
		footerbar.find(".zam-btn-send").text('禁言中');
	},
	fullremoveestoppel:function(){
		appestoppel = '2';
		var footerbar = $(".zam-app-msg-footerbar");
		if(XCV3Config.isestoppel=='1'){
			return false;
		}
		footerbar.removeClass('isforbidden');
		footerbar.find(".zam-input-box input").attr('placeholder','请输入你想说的话');
		footerbar.find(".zam-btn-send").text('发送');
	},
	bindevent:function(){
		var self = this;
		if($(".zam-app-topNoticeBox").length > 0){
			marqueen.init('.zam-app-topNotice-txt');
			if($(".zam-app-topNotice-close i").length > 0 ){
				$(".zam-app-topNotice-close i").on('click',function(){
					marqueen.destory();
					$(this.parentNode.parentNode).animate({
					"margin-top":-$(this.parentNode.parentNode).height(),
					},2e2,function(){
						$(this).remove();
						$(".zam-app-msg-box .zam-app-msg-scroll").addClass('scrollnotop');
						self.Scroll.refresh();
					});
				});
			}
		}
		if(wechatcore.device(1)){
			if(wechatcore.ios12over() && !wechatcore.ios17over() && XCV3Config.clienttype=='1'){
				$(".app-msg-txtInput").blur(function () {
					setTimeout(function () {
						window.scrollTo(0 ,0);
					},300)
				});
				$(".app-msg-txtInput").focus(function(e){
					setTimeout(function () {
						$(document).scrollTop($("body").innerHeight()),this.scrollIntoView(true);
					},300)
				});
			}
		}
		$(".app-msg-txtInput").on('input propertychange',function(){
			if($(this).val()!=''){
				if(cansendImg==1){
					$(".btn-send-data").removeClass('zam-app-displaynone'),$(".zam-app-msg-picicon").addClass('zam-app-displaynone');
				}else{
					$(".btn-send-data").removeClass('zam-app-displaynone');
				}
			}else{
				if(XCV3Config.buttonLocked) return;
				if(cansendImg==1){
					$(".btn-send-data").addClass('zam-app-displaynone'),$(".zam-app-msg-picicon").removeClass('zam-app-displaynone');
				}else{
					$(".btn-send-data").removeClass('zam-app-displaynone');
				}
			}
		});
		$(".btn-send-data").click(function(){
				if(appsocket.isclose) return;
				var $this = this;
				var txt = $($this.parentNode).find('input').val();
				if(txt!=''){
						  $($this).addClass('zam-btn-disabled');
						  wechatcore.ajaxSubmit("/wechat/msg/send",{type:1,content:txt},false).then(function(data){
							if(data.code==0){
								$($this.parentNode).find('input').val('');
								$('.zam-app-facebox').addClass('zam-app-displaynone');
								if(XCV3Config.sendJgtime>0){
									XCV3Config.buttonLocked = true;
									$(".btn-send-data").text(XCV3Config.sendJgtime+" s");
									wechatcore.coundown(XCV3Config.sendJgtime,function(t){
										$(".btn-send-data").text(t+" s");
									},function(){
										XCV3Config.buttonLocked = false;
										var inputWords = $(".zam-app-msg-footerbar input").val();
										if(inputWords==''){
											if(cansendImg==1){
												$(".btn-send-data").text("发送").removeClass("zam-btn-disabled").addClass('zam-app-displaynone');
												$(".zam-app-msg-picicon").removeClass('zam-app-displaynone');
											}else{
												$(".btn-send-data").text("发送").removeClass("zam-btn-disabled")
											}
										}else{
											if(cansendImg==1){
												$(".btn-send-data").text("发送").removeClass("zam-btn-disabled").removeClass('zam-app-displaynone');
											}else{
												$(".btn-send-data").text("发送").removeClass("zam-btn-disabled")
											}
										}
									})
								}else{
									if(cansendImg==1){
										$(".btn-send-data").addClass('zam-app-displaynone').removeClass('zam-btn-disabled'),$(".zam-app-msg-picicon").removeClass('zam-app-displaynone');
									}else{
										$(".btn-send-data").removeClass('zam-btn-disabled');
									}
								}
								wechatcore.msg('发送成功');
							}else{
								$($this).removeClass('zam-btn-disabled');
								wechatcore.msg(data.msg);
							}
						  }, function(){
							    $($this).removeClass('zam-btn-disabled');
								wechatcore.msg('网络异常发送失败，请稍后重试');
						  });
				}
		});
		emojicore.init();
		$(".zam-app-msg-footerbar").on('click','.zam-app-msg-faceicon',function(){
			$('.zam-app-facebox').toggleClass('zam-app-displaynone');
		});
		$(".zam-app-facebox").on('click','.emo-list .normalemoji',function(){
				var $this = this;
				$(".zam-app-msg-footerbar input").val($(".zam-app-msg-footerbar input").val() + $this.id);
				if(XCV3Config.buttonLocked) return;
				$(".btn-send-data").removeClass('zam-app-displaynone');
				if(cansendImg==1 && $(".zam-app-msg-picicon").length > 0){
					$(".zam-app-msg-picicon").addClass('zam-app-displaynone');
				}
		});
		$(".zam-app-facebox").on('click','.delemoji',function(){
			var inputW = $(".zam-app-msg-footerbar input").val();
			var matchs = inputW.match(/\[[\u4e00-\u9fa5]+\]/g);
			if($.isArray(matchs)&&matchs.length>0){
				$(".zam-app-msg-footerbar input").val(inputW.replace(matchs[(matchs.length-1)],''));
			}
			var inputWords = $(".zam-app-msg-footerbar input").val();
			if(inputWords==''){
				if(cansendImg==1){
					$(".btn-send-data").text("发送").removeClass("zam-btn-disabled").addClass('zam-app-displaynone');
					$(".zam-app-msg-picicon").removeClass('zam-app-displaynone');	
				}else{
					$(".btn-send-data").text("发送").removeClass("zam-btn-disabled");
				}
			}
		});
		$(".zam-app-msg-footerbar").on('click','.zam-app-msg-picicon',function(){
			if(appsocket.isclose) return;
			wechatcore.uploadImg({posturl:'/wechat/msg/upload',type:'msg'},function(data){
				if(data.code==0){
				  wechatcore.ajaxSubmit("/wechat/msg/send",{type:2,content:data.msg.filepath},false).then(function(json){
					if(json.code==0){
						wechatcore.msg('图片发送成功');
					}else{
						wechatcore.msg(json.msg);
					}
				  }, function(){
						wechatcore.msg('网络异常发送失败，请稍后重试');
				  });
				}else{
				  wechatcore.msg(data.msg);
				}
			});
		});
		
		$(".zam-app-msglist").on('click','.wechatImg',function(){
			wechatcore.previewImage(this);
		});
		$(".zam-app-msglist").on('click','.delmsg',function(){
			var msgid = $(this).parent().attr("data-msgid");
			wechatcore.ask('警告','确定要删除此消息么?',['确定','取消'],function(index){
				wechatcore.close(index);
				wechatcore.ajaxSubmit("/wechat/msg/del",{msgid:msgid},'正在执行删除操作...').then(function(json){
					if(json.code==0){
						wechatcore.msg('删除成功');
					}else{
						wechatcore.msg(json.msg);
					}
				}, function(){
					wechatcore.msg('网络太差，请稍后重试');
				});
			});
		});
		$(".zam-app-msglist").on('click','.addblack',function(){
			var userid = $(this).parent().attr("data-userid");
			wechatcore.ask('警告','确定要拉黑此用户么?',['确定','取消'],function(index){
				wechatcore.close(index);
				wechatcore.ajaxSubmit("/wechat/msg/addblack",{userid:userid},'正在执行拉黑操作...').then(function(json){
					if(json.code==0){
						wechatcore.msg('操作成功');
					}else{
						wechatcore.msg(json.msg);
					}
				}, function(){
					wechatcore.msg('网络太差，请稍后重试');
				});
			});
		});
		$(".zam-app-msglist").on('click','.addestoppel',function(){
			var userid = $(this).parent().attr("data-userid");
			wechatcore.ask('警告','确定要禁言此用户么?',['确定','取消'],function(index){
				wechatcore.close(index);
				wechatcore.ajaxSubmit("/wechat/msg/addestoppel",{userid:userid},'正在执行禁言操作...').then(function(json){
					if(json.code==0){
						wechatcore.msg('操作成功');
					}else{
						wechatcore.msg(json.msg);
					}
				}, function(){
					wechatcore.msg('网络太差，请稍后重试');
				});
			});
		});
		var clicklike = false;
		$(".zam-app-msglist").on('click','.zanbox',function(){
			var $this = $(this),msgid = $this.attr('data-msgid');
			if($this.hasClass('clicked')){
				return false;
			}
			if(clicklike) return false;
			clicklike = true;
			wechatcore.ajaxSubmit("/wechat/msg/dianzan",{msgid:msgid},'请求提交中...').then(function(json){
				clicklike = false;
				if(json.code==0){
					wechatcore.msg('点赞成功');
					$this.addClass('clicked');
				}else{
					wechatcore.msg(json.msg);
				}
			}, function(){
				clicklike = false;
				wechatcore.msg('网络太差，请稍后重试');
			});
		})
	},
};
return appmsg;
});