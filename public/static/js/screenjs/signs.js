define('signs',['jquery','template','screencore','layerBox'],function($,template,screencore,layerBox){
	var signs = {
		animateIndex:0,
		loaded:false,
		maxid:0,
		totalnums:0,
		showtype:'1',
		signQueue:[],
		msgRender:null,
		init:function(){
			var e = this;
			e.showtype = itemshowtype;
			e.signRender = template('sign-tpl');
			$(".sign-lists").css({"display":"block","opacity":"1"});
			screencore.anicss(".sign-lists","zoomInRight");
			e.getSignList();
		},
		getSignList:function(){
			var e = this;
			screencore.ajaxSubmit("/screen/sign/index",{}).then(function(data){
				if(data.code!=0){
					return layerBox.showMsg(data.msg);
				}
				var ajaxsigns = data.msg;
				var signLength = ajaxsigns.length;
				if(signLength>0){
					e.maxid = ajaxsigns[0].id;
					ajaxsigns = ajaxsigns.reverse();
					for (var m=0;m<signLength;m++) {
						e.signQueue.unshift(ajaxsigns[m]);
					};
				}
				e.totalnums += signLength;
				$(".joinPeople").html('<span>'+e.totalnums+'</span>人签到');
				e.loaded = true;
				setInterval(function() {
					e.loaded&&e.append();
				},1400);
			},function(){
				layerBox.showMsg('加载出错');
			});
			setInterval(function() {
				e.loaded&&e.ajaxNewsign();
			}, 5e3);
		},
		ajaxNewsign:function(){
			var e = this;
			screencore.ajaxSubmit("/screen/sign/newsign",{maxid:e.maxid}).then(function(data){
					if(data.code!=0){
						return layerBox.showMsg(data.msg);
					}
					var ajaxmsgs = data.msg;
					var signLength = ajaxmsgs.length;
					if(signLength>0){
						e.maxid = ajaxmsgs[0].id;
						ajaxmsgs = ajaxmsgs.reverse();
						for (var m=0;m<signLength;m++) {
							var oneMsg = ajaxmsgs[m];
							e.signQueue.unshift(oneMsg);
						};
					}
					e.totalnums += signLength;
					$(".joinPeople").html('<span>'+e.totalnums+'</span>人签到');
			},function(){
				layerBox.showMsg('加载出错');
			});
		},
		rotate:function(h){
			var self = this;
			h.closest("li").addClass(self.showtype=='1'?"bigtosmall":"rotatebigtosmall");
		},
		append:function() {
			var e = this;
			if (e.signQueue.length == 0){
				return false;
			}else{
				var i = e.signQueue.pop();//方法用于删除并返回数组的最后一个元素
				if($(".signid-"+i.user_id).length >0 ){
					return false;
				}
				i.num = $(".sign-lists ul li").length+1;
			}
			var newnickname = '';
			if($.isArray(i.nickname)){
				$.each(i.nickname,function(key,val){
					newnickname += '<span>'+val+'</span>';
				});
			}else{
				newnickname += '<div>'+i.nickname+'</div>';
			}
			i.nickname = newnickname;
			var g = $(".sign-lists>ul");
			var h = e.signRender(i);
			var f = $(h);
			g.prepend(f);
			e.rotate(f);
		},
	};
	return signs;
});
